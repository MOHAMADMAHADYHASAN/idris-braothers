/**
 * Daily Cashbox & Store Expenses Types
 * Idris Brothers Grocery & Spice POS & Khata Management
 */

export type ExpenseCategory =
  | 'LABOR_KULI'          // কুলি / লেবার খরচ
  | 'TRANSPORT_VAN'        // ভ্যান / ট্রাক ভাড়া
  | 'ELECTRICITY_UTILITY'  // বিদ্যুৎ বিল / দোকান ইউটিলিটি
  | 'TEA_SNACKS'           // চা-নাস্তা / মেহমানদারি
  | 'SHOP_MAINTENANCE'     // দোকান সরঞ্জাম / পলিথিন / বস্তা খরচ
  | 'OTHER';               // বিবিধ খরচ

export interface DailyExpense {
  id: string;
  category: ExpenseCategory;
  amount: number;         // Sanitized from Decimal
  description: string;
  recordedAt: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDTO {
  category: ExpenseCategory;
  amount: number;
  description: string;
  recordedAt?: string;
  note?: string;
}

export interface UpdateExpenseDTO {
  category?: ExpenseCategory;
  amount?: number;
  description?: string;
  recordedAt?: string;
  note?: string;
}

export interface ExpenseFilterParams {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface ExpenseListResponse {
  expenses: DailyExpense[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CashboxExpenseBreakdown {
  category: ExpenseCategory;
  amount: number;
  count: number;
}

export interface CashboxInflow {
  cashFromSales: number;
  salesCount: number;
  cashFromCustomerRepayments: number;
  customerRepaymentsCount: number;
  totalCashIn: number;
}

export interface CashboxOutflow {
  cashForPurchases: number;
  purchasesCount: number;
  cashForSupplierRepayments: number;
  supplierRepaymentsCount: number;
  totalExpenses: number;
  expensesCount: number;
  expenseBreakdown: CashboxExpenseBreakdown[];
  totalCashOut: number;
}

export interface CashboxDailySummary {
  date: string;
  inflow: CashboxInflow;
  outflow: CashboxOutflow;
  netCashInHand: number;
}

export interface NoteDenominations {
  n1000: number;
  n500: number;
  n200: number;
  n100: number;
  n50: number;
  n20: number;
  n10: number;
}
