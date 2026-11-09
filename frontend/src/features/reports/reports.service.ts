import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { parseDecimal } from '@/lib/decimal';
import {
  ProfitLossReport,
  InventoryValuationReport,
  DuesSummaryReport,
  TopSellingProduct,
} from './reports.types';

function sanitizeProfitLoss(raw: any): ProfitLossReport {
  return {
    period: raw.period || { startDate: '', endDate: '' },
    salesSummary: {
      totalInvoices: raw.salesSummary?.totalInvoices || 0,
      totalSalesRevenue: parseDecimal(raw.salesSummary?.totalSalesRevenue, 0),
      totalDiscountGiven: parseDecimal(raw.salesSummary?.totalDiscountGiven, 0),
      costOfGoodsSold: parseDecimal(raw.salesSummary?.costOfGoodsSold, 0),
      grossProfit: parseDecimal(raw.salesSummary?.grossProfit, 0),
      grossMarginPercent: raw.salesSummary?.grossMarginPercent || '0%',
    },
    deductions: {
      wastageLoss: parseDecimal(raw.deductions?.wastageLoss, 0),
      wastageCount: raw.deductions?.wastageCount || 0,
      operatingExpenses: parseDecimal(raw.deductions?.operatingExpenses, 0),
      expensesCount: raw.deductions?.expensesCount || 0,
    },
    netProfit: {
      amount: parseDecimal(raw.netProfit?.amount, 0),
      netMarginPercent: raw.netProfit?.netMarginPercent || '0%',
      isProfitable: Boolean(raw.netProfit?.isProfitable),
    },
  };
}

function sanitizeInventoryValuation(raw: any): InventoryValuationReport {
  return {
    totalVariantsCount: raw.totalVariantsCount || 0,
    valuation: {
      totalCostValuation: parseDecimal(raw.valuation?.totalCostValuation, 0),
      totalRetailValuation: parseDecimal(raw.valuation?.totalRetailValuation, 0),
      totalWholesaleValuation: parseDecimal(raw.valuation?.totalWholesaleValuation, 0),
      potentialRetailProfit: parseDecimal(raw.valuation?.potentialRetailProfit, 0),
      potentialWholesaleProfit: parseDecimal(raw.valuation?.potentialWholesaleProfit, 0),
    },
    lowStock: {
      count: raw.lowStock?.count || 0,
      items: (raw.lowStock?.items || []).map((item: any) => ({
        id: item.id,
        variantId: item.variantId,
        name: item.name,
        stockQuantity: parseDecimal(item.stockQuantity, 0),
        baseUnitName: item.baseUnitName || 'কেজি',
        lowStockAlert: parseDecimal(item.lowStockAlert, 0),
      })),
    },
  };
}

function sanitizeDuesSummary(raw: any): DuesSummaryReport {
  return {
    customerDues: {
      totalOutstanding: parseDecimal(raw.customerDues?.totalOutstanding, 0),
      debtorsCount: raw.customerDues?.debtorsCount || 0,
      topDebtors: (raw.customerDues?.topDebtors || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        currentDue: parseDecimal(d.currentDue, 0),
      })),
    },
    supplierPayables: {
      totalOutstanding: parseDecimal(raw.supplierPayables?.totalOutstanding, 0),
      creditorsCount: raw.supplierPayables?.creditorsCount || 0,
      topCreditors: (raw.supplierPayables?.topCreditors || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        companyName: s.companyName,
        currentPayable: parseDecimal(s.currentPayable, 0),
      })),
    },
    netKhataStanding: {
      amount: parseDecimal(raw.netKhataStanding?.amount, 0),
      status: raw.netKhataStanding?.status || '',
    },
  };
}

function sanitizeTopSelling(raw: any[]): TopSellingProduct[] {
  return (raw || []).map((item: any) => ({
    variantId: item.variantId,
    productId: item.productId,
    name: item.name,
    category: item.category || 'General',
    baseUnitName: item.baseUnitName || 'কেজি',
    totalSoldQuantity: parseDecimal(item.totalSoldQuantity, 0),
    totalRevenue: parseDecimal(item.totalRevenue, 0),
  }));
}

export class ReportsService {
  async getProfitLoss(startDate?: string, endDate?: string): Promise<ProfitLossReport> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await apiClient.get<any>(API_ENDPOINTS.REPORTS.PROFIT_LOSS, params);
    return sanitizeProfitLoss(res.data);
  }

  async getInventoryValuation(): Promise<InventoryValuationReport> {
    const res = await apiClient.get<any>(API_ENDPOINTS.REPORTS.INVENTORY_VALUATION);
    return sanitizeInventoryValuation(res.data);
  }

  async getDuesSummary(): Promise<DuesSummaryReport> {
    const res = await apiClient.get<any>(API_ENDPOINTS.REPORTS.DUES_SUMMARY);
    return sanitizeDuesSummary(res.data);
  }

  async getTopSelling(limit = 10): Promise<TopSellingProduct[]> {
    const res = await apiClient.get<any[]>(API_ENDPOINTS.REPORTS.TOP_SELLING, { limit });
    return sanitizeTopSelling(res.data);
  }
}

export const reportsService = new ReportsService();
