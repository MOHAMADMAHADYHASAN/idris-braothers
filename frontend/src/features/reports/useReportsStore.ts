import { create } from 'zustand';
import { reportsService } from './reports.service';
import {
  ProfitLossReport,
  InventoryValuationReport,
  DuesSummaryReport,
  TopSellingProduct,
} from './reports.types';

export type DateFilterPreset = 'today' | 'this_week' | 'this_month' | 'custom';

interface ReportsState {
  datePreset: DateFilterPreset;
  customStartDate: string;
  customEndDate: string;

  profitLoss: ProfitLossReport | null;
  inventoryValuation: InventoryValuationReport | null;
  duesSummary: DuesSummaryReport | null;
  topSelling: TopSellingProduct[];

  isLoadingPnl: boolean;
  isLoadingValuation: boolean;
  isLoadingDues: boolean;
  isLoadingTopSelling: boolean;
  error: string | null;

  // Actions
  setDatePreset: (preset: DateFilterPreset) => void;
  setCustomDateRange: (startDate: string, endDate: string) => void;
  fetchProfitLoss: () => Promise<void>;
  fetchInventoryValuation: () => Promise<void>;
  fetchDuesSummary: () => Promise<void>;
  fetchTopSelling: (limit?: number) => Promise<void>;
  fetchAllReports: () => Promise<void>;
}

function getDateRangeForPreset(preset: DateFilterPreset, customStart?: string, customEnd?: string) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (preset === 'today') {
    return { startDate: todayStr, endDate: todayStr };
  }

  if (preset === 'this_week') {
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    // In Bangladesh, work week starts Saturday (day 6 in JS standard is Saturday)
    // Or let's take past 7 days:
    startOfWeek.setDate(now.getDate() - 7);
    return {
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: todayStr,
    };
  }

  if (preset === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: todayStr,
    };
  }

  return {
    startDate: customStart || todayStr,
    endDate: customEnd || todayStr,
  };
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  datePreset: 'today',
  customStartDate: new Date().toISOString().split('T')[0],
  customEndDate: new Date().toISOString().split('T')[0],

  profitLoss: null,
  inventoryValuation: null,
  duesSummary: null,
  topSelling: [],

  isLoadingPnl: false,
  isLoadingValuation: false,
  isLoadingDues: false,
  isLoadingTopSelling: false,
  error: null,

  setDatePreset: (datePreset) => {
    set({ datePreset });
    get().fetchProfitLoss();
  },

  setCustomDateRange: (customStartDate, customEndDate) => {
    set({ customStartDate, customEndDate, datePreset: 'custom' });
    get().fetchProfitLoss();
  },

  fetchProfitLoss: async () => {
    set({ isLoadingPnl: true, error: null });
    try {
      const { datePreset, customStartDate, customEndDate } = get();
      const { startDate, endDate } = getDateRangeForPreset(datePreset, customStartDate, customEndDate);
      const data = await reportsService.getProfitLoss(startDate, endDate);
      set({ profitLoss: data, isLoadingPnl: false });
    } catch (err: any) {
      set({ error: err.message || 'লাভ-ক্ষতি রিপোর্ট লোড করতে সমস্যা হয়েছে', isLoadingPnl: false });
    }
  },

  fetchInventoryValuation: async () => {
    set({ isLoadingValuation: true });
    try {
      const data = await reportsService.getInventoryValuation();
      set({ inventoryValuation: data, isLoadingValuation: false });
    } catch (err: any) {
      console.error('Failed to load inventory valuation:', err);
      set({ isLoadingValuation: false });
    }
  },

  fetchDuesSummary: async () => {
    set({ isLoadingDues: true });
    try {
      const data = await reportsService.getDuesSummary();
      set({ duesSummary: data, isLoadingDues: false });
    } catch (err: any) {
      console.error('Failed to load dues summary:', err);
      set({ isLoadingDues: false });
    }
  },

  fetchTopSelling: async (limit = 10) => {
    set({ isLoadingTopSelling: true });
    try {
      const data = await reportsService.getTopSelling(limit);
      set({ topSelling: data, isLoadingTopSelling: false });
    } catch (err: any) {
      console.error('Failed to load top selling:', err);
      set({ isLoadingTopSelling: false });
    }
  },

  fetchAllReports: async () => {
    await Promise.all([
      get().fetchProfitLoss(),
      get().fetchInventoryValuation(),
      get().fetchDuesSummary(),
      get().fetchTopSelling(8),
    ]);
  },
}));
