/**
 * Types for Idris Brothers Retail Financial & Inventory Reports
 */

export interface ProfitLossReport {
  period: {
    startDate: string;
    endDate: string;
  };
  salesSummary: {
    totalInvoices: number;
    totalSalesRevenue: number;
    totalDiscountGiven: number;
    costOfGoodsSold: number;
    grossProfit: number;
    grossMarginPercent: string;
  };
  deductions: {
    wastageLoss: number;
    wastageCount: number;
    operatingExpenses: number;
    expensesCount: number;
  };
  netProfit: {
    amount: number;
    netMarginPercent: string;
    isProfitable: boolean;
  };
}

export interface InventoryValuationReport {
  totalVariantsCount: number;
  valuation: {
    totalCostValuation: number; // বর্তমান ক্রয়মূল্যে মোট মূলধন
    totalRetailValuation: number; // খুচরা মূল্যে বিক্রয় সম্ভাবনা
    totalWholesaleValuation: number; // পাইকারি মূল্যে বিক্রয় সম্ভাবনা
    potentialRetailProfit: number; // সম্ভাব্য খুচরা মোট মুনাফা
    potentialWholesaleProfit: number; // সম্ভাব্য পাইকারি মোট মুনাফা
  };
  lowStock: {
    count: number;
    items: Array<{
      id: string;
      variantId: string;
      name: string;
      stockQuantity: number;
      baseUnitName: string;
      lowStockAlert: number;
    }>;
  };
}

export interface DebtorCreditorEntry {
  id: string;
  name: string;
  phone: string;
  companyName?: string;
  currentDue?: number;
  currentPayable?: number;
}

export interface DuesSummaryReport {
  customerDues: {
    totalOutstanding: number;
    debtorsCount: number;
    topDebtors: DebtorCreditorEntry[];
  };
  supplierPayables: {
    totalOutstanding: number;
    creditorsCount: number;
    topCreditors: DebtorCreditorEntry[];
  };
  netKhataStanding: {
    amount: number;
    status: string;
  };
}

export interface TopSellingProduct {
  variantId: string;
  productId: string;
  name: string;
  category: string;
  baseUnitName: string;
  totalSoldQuantity: number;
  totalRevenue: number;
}
