/**
 * Daily Cashbox & Store Expenses Zustand Store
 * High-Performance Reactive State for Idris Brothers Cash Drawer Management
 */

import { create } from 'zustand';
import {
  CashboxDailySummary,
  DailyExpense,
  ExpenseCategory,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  NoteDenominations,
} from './cashbox.types';
import { cashboxService } from './cashbox.service';

const initialDenominations: NoteDenominations = {
  n1000: 0,
  n500: 0,
  n200: 0,
  n100: 0,
  n50: 0,
  n20: 0,
  n10: 0,
};

// Get today's local date in YYYY-MM-DD
function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface CashboxState {
  // Summary & Drawer
  summary: CashboxDailySummary | null;
  isLoadingSummary: boolean;
  targetDate: string;

  // Expenses State
  expenses: DailyExpense[];
  expensesMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoadingExpenses: boolean;
  categoryFilter?: ExpenseCategory;
  expensesPage: number;

  // Physical Note Denominations Counter
  denominations: NoteDenominations;

  // Modals
  editingExpense: DailyExpense | null;
  isEditModalOpen: boolean;
  isClosingReceiptOpen: boolean;

  // Actions
  setTargetDate: (date: string) => void;
  setCategoryFilter: (category?: ExpenseCategory) => void;
  setExpensesPage: (page: number) => void;
  setDenomination: (key: keyof NoteDenominations, count: number) => void;
  resetDenominations: () => void;

  fetchSummary: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  createExpense: (payload: CreateExpenseDTO) => Promise<DailyExpense>;
  updateExpense: (id: string, payload: UpdateExpenseDTO) => Promise<DailyExpense>;
  deleteExpense: (id: string) => Promise<void>;

  openEditModal: (expense: DailyExpense) => void;
  closeEditModal: () => void;
  openClosingReceipt: () => void;
  closeClosingReceipt: () => void;

  // Computed helper
  getCalculatedNoteTotal: () => number;
}

export const useCashboxStore = create<CashboxState>((set, get) => ({
  summary: null,
  isLoadingSummary: false,
  targetDate: getTodayDateStr(),

  expenses: [],
  expensesMeta: {
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 1,
  },
  isLoadingExpenses: false,
  categoryFilter: undefined,
  expensesPage: 1,

  denominations: { ...initialDenominations },

  editingExpense: null,
  isEditModalOpen: false,
  isClosingReceiptOpen: false,

  setTargetDate: (targetDate) => {
    set({ targetDate, expensesPage: 1 });
    get().fetchSummary();
    get().fetchExpenses();
  },

  setCategoryFilter: (categoryFilter) => {
    set({ categoryFilter, expensesPage: 1 });
    get().fetchExpenses();
  },

  setExpensesPage: (expensesPage) => {
    set({ expensesPage });
    get().fetchExpenses();
  },

  setDenomination: (key, count) => {
    set((state) => ({
      denominations: {
        ...state.denominations,
        [key]: Math.max(0, count || 0),
      },
    }));
  },

  resetDenominations: () => {
    set({ denominations: { ...initialDenominations } });
  },

  getCalculatedNoteTotal: () => {
    const { denominations } = get();
    return (
      denominations.n1000 * 1000 +
      denominations.n500 * 500 +
      denominations.n200 * 200 +
      denominations.n100 * 100 +
      denominations.n50 * 50 +
      denominations.n20 * 20 +
      denominations.n10 * 10
    );
  },

  fetchSummary: async () => {
    const { targetDate } = get();
    set({ isLoadingSummary: true });
    try {
      const summary = await cashboxService.getDailySummary(targetDate);
      set({ summary, isLoadingSummary: false });
    } catch (err) {
      set({ isLoadingSummary: false });
    }
  },

  fetchExpenses: async () => {
    const { targetDate, categoryFilter, expensesPage } = get();
    set({ isLoadingExpenses: true });
    try {
      const res = await cashboxService.getExpenses({
        category: categoryFilter,
        startDate: targetDate,
        endDate: targetDate,
        page: expensesPage,
        limit: 30,
      });
      set({
        expenses: res.expenses,
        expensesMeta: res.meta,
        isLoadingExpenses: false,
      });
    } catch (err) {
      set({ isLoadingExpenses: false });
    }
  },

  createExpense: async (payload) => {
    const created = await cashboxService.createExpense(payload);
    // Refresh both expenses list and cashbox summary
    await Promise.all([get().fetchExpenses(), get().fetchSummary()]);
    return created;
  },

  updateExpense: async (id, payload) => {
    const updated = await cashboxService.updateExpense(id, payload);
    await Promise.all([get().fetchExpenses(), get().fetchSummary()]);
    return updated;
  },

  deleteExpense: async (id) => {
    await cashboxService.deleteExpense(id);
    await Promise.all([get().fetchExpenses(), get().fetchSummary()]);
  },

  openEditModal: (expense) => {
    set({ editingExpense: expense, isEditModalOpen: true });
  },

  closeEditModal: () => {
    set({ editingExpense: null, isEditModalOpen: false });
  },

  openClosingReceipt: () => {
    set({ isClosingReceiptOpen: true });
  },

  closeClosingReceipt: () => {
    set({ isClosingReceiptOpen: false });
  },
}));
