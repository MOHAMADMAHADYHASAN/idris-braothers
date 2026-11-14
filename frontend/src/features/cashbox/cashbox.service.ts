/**
 * Daily Cashbox & Store Expenses Service Layer
 * Strict API Integration with Decimal Sanitization for Idris Brothers
 */

import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { parseDecimal } from '@/lib/decimal';
import {
  DailyExpense,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  ExpenseFilterParams,
  ExpenseListResponse,
  CashboxDailySummary,
} from './cashbox.types';

function sanitizeExpense(raw: any): DailyExpense {
  const recordedAt = raw.recordedAt || raw.createdAt || new Date().toISOString();
  return {
    ...raw,
    amount: parseDecimal(raw.amount),
    recordedAt,
    createdAt: raw.createdAt || recordedAt,
  };
}

function sanitizeDailySummary(raw: any): CashboxDailySummary {
  const inflow = raw.inflow || {};
  const outflow = raw.outflow || {};

  return {
    date: raw.date,
    inflow: {
      cashFromSales: parseDecimal(inflow.cashFromSales),
      salesCount: Number(inflow.salesCount) || 0,
      cashFromCustomerRepayments: parseDecimal(inflow.cashFromCustomerRepayments),
      customerRepaymentsCount: Number(inflow.customerRepaymentsCount) || 0,
      totalCashIn: parseDecimal(inflow.totalCashIn),
    },
    outflow: {
      cashForPurchases: parseDecimal(outflow.cashForPurchases),
      purchasesCount: Number(outflow.purchasesCount) || 0,
      cashForSupplierRepayments: parseDecimal(outflow.cashForSupplierRepayments),
      supplierRepaymentsCount: Number(outflow.supplierRepaymentsCount) || 0,
      totalExpenses: parseDecimal(outflow.totalExpenses),
      expensesCount: Number(outflow.expensesCount) || 0,
      expenseBreakdown: Array.isArray(outflow.expenseBreakdown)
        ? outflow.expenseBreakdown.map((b: any) => ({
            category: b.category,
            amount: parseDecimal(b.amount),
            count: Number(b.count) || 0,
          }))
        : [],
      totalCashOut: parseDecimal(outflow.totalCashOut),
    },
    netCashInHand: parseDecimal(raw.netCashInHand),
  };
}

export const cashboxService = {
  /**
   * দৈনিক ক্যাশবাক্স ক্লোজিং ও রিকনসিলিয়েশন সামারি সংগ্রহ
   */
  async getDailySummary(targetDate?: string): Promise<CashboxDailySummary> {
    const res = await apiClient.get<any>(API_ENDPOINTS.CASHBOX.DAILY_SUMMARY, {
      date: targetDate,
    });
    const data = res.data?.data || res.data;
    return sanitizeDailySummary(data);
  },

  /**
   * খরচের তালিকা সংগ্রহ
   */
  async getExpenses(params?: ExpenseFilterParams): Promise<ExpenseListResponse> {
    const res = await apiClient.get<any>(API_ENDPOINTS.EXPENSES.BASE, params);
    const data = res.data?.data || res.data;

    return {
      expenses: Array.isArray(data?.expenses)
        ? data.expenses.map(sanitizeExpense)
        : [],
      meta: data?.meta || { page: 1, limit: 30, total: 0, totalPages: 1 },
    };
  },

  /**
   * নতুন দৈনিক খরচ রেকর্ড
   */
  async createExpense(payload: CreateExpenseDTO): Promise<DailyExpense> {
    const res = await apiClient.post<any>(
      API_ENDPOINTS.EXPENSES.BASE,
      payload,
      { dedupe: true }
    );
    const data = res.data?.data || res.data;
    return sanitizeExpense(data);
  },

  /**
   * খরচ এডিট / আপডেট
   */
  async updateExpense(id: string, payload: UpdateExpenseDTO): Promise<DailyExpense> {
    const res = await apiClient.patch<any>(
      API_ENDPOINTS.EXPENSES.BY_ID(id),
      payload
    );
    const data = res.data?.data || res.data;
    return sanitizeExpense(data);
  },

  /**
   * ভুল খরচ এন্ট্রি মুছে ফেলা
   */
  async deleteExpense(id: string): Promise<boolean> {
    await apiClient.delete(API_ENDPOINTS.EXPENSES.BY_ID(id));
    return true;
  },
};
