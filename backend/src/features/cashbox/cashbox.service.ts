import { Prisma, CustomerLedgerType, SupplierLedgerType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { getDayBoundaries } from '../../common/utils/dateUtils';

export class CashboxService {
  /**
   * Calculate Daily Cashbox Reconciliation Summary
   */
  async getDailySummary(targetDateStr?: string) {
    const { startOfDay, endOfDay } = getDayBoundaries(targetDateStr);

    const [
      salesAgg,
      customerRepaymentsAgg,
      purchasesAgg,
      supplierRepaymentsAgg,
      expensesAgg,
      expenseBreakdown,
    ] = await Promise.all([
      // 1. Cash collected from sales
      prisma.sale.aggregate({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { paidAmount: true },
        _count: { id: true },
      }),

      // 2. Direct customer cash due repayments (excluding invoice transactions)
      prisma.customerLedger.aggregate({
        where: {
          saleId: null,
          entryType: CustomerLedgerType.PAYMENT_RECEIVED,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { credit: true },
        _count: { id: true },
      }),

      // 3. Cash paid at time of purchase
      prisma.purchase.aggregate({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { paidAmount: true },
        _count: { id: true },
      }),

      // 4. Direct cash payments to suppliers/mahajans (excluding invoice transactions)
      prisma.supplierLedger.aggregate({
        where: {
          purchaseId: null,
          entryType: SupplierLedgerType.PAYMENT_PAID,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { debit: true },
        _count: { id: true },
      }),

      // 5. Daily store expenses
      prisma.dailyExpense.aggregate({
        where: {
          recordedAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // 6. Expense breakdown by category
      prisma.dailyExpense.groupBy({
        by: ['category'],
        where: {
          recordedAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const cashFromSales = salesAgg._sum.paidAmount || new Prisma.Decimal(0);
    const cashFromCustomerRepayments = customerRepaymentsAgg._sum.credit || new Prisma.Decimal(0);
    const totalCashIn = cashFromSales.add(cashFromCustomerRepayments);

    const cashForPurchases = purchasesAgg._sum.paidAmount || new Prisma.Decimal(0);
    const cashForSupplierRepayments = supplierRepaymentsAgg._sum.debit || new Prisma.Decimal(0);
    const totalExpenses = expensesAgg._sum.amount || new Prisma.Decimal(0);
    const totalCashOut = cashForPurchases.add(cashForSupplierRepayments).add(totalExpenses);

    const netCashInHand = totalCashIn.sub(totalCashOut);

    return {
      date: startOfDay.toISOString().split('T')[0],
      inflow: {
        cashFromSales,
        salesCount: salesAgg._count.id,
        cashFromCustomerRepayments,
        customerRepaymentsCount: customerRepaymentsAgg._count.id,
        totalCashIn,
      },
      outflow: {
        cashForPurchases,
        purchasesCount: purchasesAgg._count.id,
        cashForSupplierRepayments,
        supplierRepaymentsCount: supplierRepaymentsAgg._count.id,
        totalExpenses,
        expensesCount: expensesAgg._count.id,
        expenseBreakdown: expenseBreakdown.map((b) => ({
          category: b.category,
          amount: b._sum.amount || new Prisma.Decimal(0),
          count: b._count.id,
        })),
        totalCashOut,
      },
      netCashInHand,
    };
  }
}

export const cashboxService = new CashboxService();
