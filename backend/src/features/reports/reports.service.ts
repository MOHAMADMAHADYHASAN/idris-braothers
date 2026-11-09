import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { getDayBoundaries } from '../../common/utils/dateUtils';
import { calculateMarginPercent } from '../../common/utils/decimalUtils';

export class ReportsService {
  /**
   * Calculate Profit & Loss Statement for a given period
   */
  async getProfitLossReport(query: { startDate?: string; endDate?: string }) {
    const defaultBounds = getDayBoundaries();
    const start = query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : defaultBounds.startOfDay;
    const end = query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : defaultBounds.endOfDay;

    // 1. Fetch Sales and calculate Revenue & COGS
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'COMPLETED',
      },
      include: {
        items: true,
      },
    });

    let totalSalesRevenue = new Prisma.Decimal(0);
    let totalCogs = new Prisma.Decimal(0);
    let totalDiscount = new Prisma.Decimal(0);

    for (const sale of sales) {
      totalSalesRevenue = totalSalesRevenue.add(sale.grandTotal);
      totalDiscount = totalDiscount.add(sale.discount);

      for (const item of sale.items) {
        // COGS for this item = quantity * costPriceSnapshot
        const itemCogs = item.quantity.mul(item.costPriceSnapshot);
        totalCogs = totalCogs.add(itemCogs);
      }
    }

    const grossProfit = totalSalesRevenue.sub(totalCogs);

    // 2. Fetch Stock Wastage Loss for this period
    const wastageAgg = await prisma.stockWastage.aggregate({
      where: {
        recordedAt: { gte: start, lte: end },
      },
      _sum: {
        lossAmount: true,
      },
      _count: {
        id: true,
      },
    });
    const totalWastageLoss = wastageAgg._sum.lossAmount || new Prisma.Decimal(0);

    // 3. Fetch Store Daily Expenses for this period
    const expenseAgg = await prisma.dailyExpense.aggregate({
      where: {
        recordedAt: { gte: start, lte: end },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });
    const totalOperatingExpenses = expenseAgg._sum.amount || new Prisma.Decimal(0);

    // 4. Net Profit calculation
    const netProfit = grossProfit.sub(totalWastageLoss).sub(totalOperatingExpenses);

    // Calculate margins safely
    const grossMarginPercent = calculateMarginPercent(grossProfit, totalSalesRevenue);
    const netMarginPercent = calculateMarginPercent(netProfit, totalSalesRevenue);

    return {
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      salesSummary: {
        totalInvoices: sales.length,
        totalSalesRevenue,
        totalDiscountGiven: totalDiscount,
        costOfGoodsSold: totalCogs,
        grossProfit,
        grossMarginPercent,
      },
      deductions: {
        wastageLoss: totalWastageLoss,
        wastageCount: wastageAgg._count.id,
        operatingExpenses: totalOperatingExpenses,
        expensesCount: expenseAgg._count.id,
      },
      netProfit: {
        amount: netProfit,
        netMarginPercent,
        isProfitable: netProfit.greaterThanOrEqualTo(0),
      },
    };
  }

  /**
   * Current Inventory Valuation (মালের বর্তমান স্টক ও মোট মূলধন)
   * Tracks valuation across each sellable SKU/Variant
   */
  async getInventoryValuation() {
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
      include: {
        product: {
          select: { id: true, name: true, banglaName: true },
        },
        units: true,
      },
    });

    let totalCostValuation = new Prisma.Decimal(0);
    let totalRetailValuation = new Prisma.Decimal(0);
    let totalWholesaleValuation = new Prisma.Decimal(0);
    const lowStockItems: Array<{
      id: string;
      variantId: string;
      name: string;
      stockQuantity: Prisma.Decimal;
      baseUnitName: string;
      lowStockAlert: Prisma.Decimal;
    }> = [];

    for (const v of variants) {
      const costVal = v.stockQuantity.mul(v.currentPurchasePrice);
      const retailVal = v.stockQuantity.mul(v.retailPrice);
      const wholesaleVal = v.stockQuantity.mul(v.wholesalePrice);

      totalCostValuation = totalCostValuation.add(costVal);
      totalRetailValuation = totalRetailValuation.add(retailVal);
      totalWholesaleValuation = totalWholesaleValuation.add(wholesaleVal);

      if (v.stockQuantity.lessThanOrEqualTo(v.lowStockAlert)) {
        const baseName = v.product.banglaName || v.product.name;
        const variantSuffix = v.variantName !== 'Default' ? ` (${v.variantName})` : '';
        lowStockItems.push({
          id: v.product.id,
          variantId: v.id,
          name: `${baseName}${variantSuffix}`,
          stockQuantity: v.stockQuantity,
          baseUnitName: v.baseUnitName,
          lowStockAlert: v.lowStockAlert,
        });
      }
    }

    const potentialRetailProfit = totalRetailValuation.sub(totalCostValuation);
    const potentialWholesaleProfit = totalWholesaleValuation.sub(totalCostValuation);

    return {
      totalVariantsCount: variants.length,
      valuation: {
        totalCostValuation,        // বর্তমান ক্রয়মূল্যে মোট মূলধন
        totalRetailValuation,      // খুচরা মূল্যে বিক্রয় সম্ভাবনা
        totalWholesaleValuation,   // পাইকারি মূল্যে বিক্রয় সম্ভাবনা
        potentialRetailProfit,     // সম্ভাব্য খুচরা মোট মুনাফা
        potentialWholesaleProfit,  // সম্ভাব্য পাইকারি মোট মুনাফা
      },
      lowStock: {
        count: lowStockItems.length,
        items: lowStockItems,
      },
    };
  }

  /**
   * Ledger Balance & Dues Summary (বাজারের মোট বাকি ও মহাজনের পাওনা)
   */
  async getDuesSummary() {
    const [customerDuesAgg, customerCountWithDue, supplierPayablesAgg, supplierCountWithPayable] =
      await Promise.all([
        prisma.customer.aggregate({
          where: { currentDue: { gt: 0 }, isActive: true },
          _sum: { currentDue: true },
        }),
        prisma.customer.count({
          where: { currentDue: { gt: 0 }, isActive: true },
        }),
        prisma.supplier.aggregate({
          where: { currentPayable: { gt: 0 }, isActive: true },
          _sum: { currentPayable: true },
        }),
        prisma.supplier.count({
          where: { currentPayable: { gt: 0 }, isActive: true },
        }),
      ]);

    // Top 5 Debtors (যাদের কাছে সবচেয়ে বেশি বাকি পাওনা)
    const topDebtors = await prisma.customer.findMany({
      where: { currentDue: { gt: 0 }, isActive: true },
      orderBy: { currentDue: 'desc' },
      take: 5,
      select: { id: true, name: true, phone: true, currentDue: true },
    });

    // Top 5 Creditors (যেসব মহাজনকে সবচেয়ে বেশি দেনা দিতে হবে)
    const topCreditors = await prisma.supplier.findMany({
      where: { currentPayable: { gt: 0 }, isActive: true },
      orderBy: { currentPayable: 'desc' },
      take: 5,
      select: { id: true, name: true, companyName: true, phone: true, currentPayable: true },
    });

    const totalCustomerDues = customerDuesAgg._sum.currentDue || new Prisma.Decimal(0);
    const totalSupplierPayables = supplierPayablesAgg._sum.currentPayable || new Prisma.Decimal(0);
    const netKhataStanding = totalCustomerDues.sub(totalSupplierPayables);

    return {
      customerDues: {
        totalOutstanding: totalCustomerDues,
        debtorsCount: customerCountWithDue,
        topDebtors,
      },
      supplierPayables: {
        totalOutstanding: totalSupplierPayables,
        creditorsCount: supplierCountWithPayable,
        topCreditors,
      },
      netKhataStanding: {
        amount: netKhataStanding,
        status: netKhataStanding.greaterThanOrEqualTo(0)
          ? 'SURPLUS (বাজারের বাকি মহাজনের দেনার চেয়ে বেশি)'
          : 'DEFICIT (মহাজনের দেনা বাজারের বাকির চেয়ে বেশি)',
      },
    };
  }

  /**
   * Top Selling Products / SKUs
   */
  async getTopSellingProducts(limit = 10) {
    const saleItems = await prisma.saleItem.groupBy({
      by: ['variantId'],
      _sum: {
        baseQuantity: true,
        subTotal: true,
      },
      orderBy: {
        _sum: {
          subTotal: 'desc',
        },
      },
      take: limit,
    });

    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: saleItems.map((item) => item.variantId) },
      },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    return saleItems.map((item) => {
      const variant = variantMap.get(item.variantId);
      const baseName = variant?.product.banglaName || variant?.product.name || 'Unknown';
      const variantSuffix = variant && variant.variantName !== 'Default' ? ` (${variant.variantName})` : '';
      return {
        variantId: item.variantId,
        productId: variant?.product.id || '',
        name: `${baseName}${variantSuffix}`,
        category: variant?.product.category?.name || 'General',
        baseUnitName: variant?.baseUnitName || 'কেজি',
        totalSoldQuantity: item._sum?.baseQuantity || new Prisma.Decimal(0),
        totalRevenue: item._sum?.subTotal || new Prisma.Decimal(0),
      };
    });
  }
}

export const reportsService = new ReportsService();
