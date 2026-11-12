import { create } from 'zustand';
import { salesService } from './sales.service';
import { toast } from '@/lib/feedback';
import {
  SaleListItem,
  SaleDetail,
  SalesMeta,
  SaleType,
  SaleStatus,
  DateRangeInfo,
  PeriodComparison,
} from './sales.types';

export type DatePreset = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

interface SalesState {
  sales: SaleListItem[];
  meta: SalesMeta;
  resolvedDateRange: DateRangeInfo | null;
  periodComparison: PeriodComparison | null;
  isLoading: boolean;
  error: string | null;

  // Modals & Details
  selectedSale: SaleDetail | null;
  selectedReceipt: any | null;
  isLoadingDetail: boolean;
  isDetailOpen: boolean;
  isCancelModalOpen: boolean;
  saleToCancel: SaleListItem | null;
  isSubmittingCancel: boolean;

  // Sales Return
  isReturnModalOpen: boolean;
  saleToReturn: SaleDetail | null;
  isLoadingReturnSale: boolean;
  isSubmittingReturn: boolean;

  // Filters
  searchQuery: string;
  saleType?: SaleType;
  status?: SaleStatus;
  activeFilter: string;
  datePreset: DatePreset;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;

  // Actions
  fetchSales: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSaleType: (type?: SaleType) => void;
  setStatus: (status?: SaleStatus) => void;
  setDateRange: (filter: string, start?: string, end?: string) => void;
  setDatePreset: (preset: DatePreset) => void;
  setCustomDateRange: (start: string, end: string) => void;
  setPage: (page: number) => void;

  openDetail: (id: string) => Promise<void>;
  closeDetail: () => void;
  openCancelModal: (sale: SaleListItem) => void;
  closeCancelModal: () => void;
  cancelSale: (reason?: string) => Promise<void>;

  openReturnModal: (saleId: string) => Promise<void>;
  closeReturnModal: () => void;
  processReturn: (payload: {
    items: { saleItemId: string; returnQuantity: number }[];
    refundMethod: 'CASH' | 'CUSTOMER_DUE_ADJUSTMENT';
    reason?: string;
  }) => Promise<void>;
}

function computeDateRange(preset: DatePreset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];

  if (preset === 'today') {
    const todayStr = formatYMD(now);
    return { startDate: todayStr, endDate: todayStr };
  }

  if (preset === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const yStr = formatYMD(y);
    return { startDate: yStr, endDate: yStr };
  }

  if (preset === 'this_week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return { startDate: formatYMD(monday), endDate: formatYMD(new Date()) };
  }

  if (preset === 'this_month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: formatYMD(firstDay), endDate: formatYMD(new Date()) };
  }

  return {};
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  meta: { total: 0, page: 1, limit: 15, totalPages: 1 },
  resolvedDateRange: null,
  periodComparison: null,
  isLoading: false,
  error: null,

  selectedSale: null,
  selectedReceipt: null,
  isLoadingDetail: false,
  isDetailOpen: false,
  isCancelModalOpen: false,
  saleToCancel: null,
  isSubmittingCancel: false,

  isReturnModalOpen: false,
  saleToReturn: null,
  isLoadingReturnSale: false,
  isSubmittingReturn: false,

  searchQuery: '',
  saleType: undefined,
  status: undefined,
  activeFilter: 'today',
  datePreset: 'all',
  startDate: undefined,
  endDate: undefined,
  page: 1,
  limit: 15,

  fetchSales: async () => {
    set({ isLoading: true, error: null });
    try {
      const { searchQuery, saleType, status, activeFilter, startDate, endDate, page, limit } = get();
      const res = await salesService.getSales({
        searchQuery,
        saleType,
        status,
        filter: activeFilter,
        startDate,
        endDate,
        page,
        limit,
      });

      // Filter client-side by status if needed
      let salesList = res.sales || [];
      if (status) {
        salesList = salesList.filter((s) => s.status === status);
      }

      set({
        sales: salesList,
        meta: res.meta || { total: salesList.length, page: 1, limit: 15, totalPages: 1 },
        resolvedDateRange: res.dateRange || null,
        periodComparison: res.periodComparison || null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'বিক্রয় মেমো লোড করতে ব্যর্থ হয়েছে', isLoading: false });
    }
  },

  setDateRange: (filter: string, start?: string, end?: string) => {
    const state = get();
    const cleanStart = start || undefined;
    const cleanEnd = end || undefined;
    if (
      state.activeFilter === filter &&
      state.startDate === cleanStart &&
      state.endDate === cleanEnd
    ) {
      return;
    }
    set({
      activeFilter: filter,
      startDate: cleanStart,
      endDate: cleanEnd,
      page: 1,
    });
    get().fetchSales();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, page: 1 });
    get().fetchSales();
  },

  setSaleType: (type?: SaleType) => {
    set({ saleType: type, page: 1 });
    get().fetchSales();
  },

  setStatus: (status?: SaleStatus) => {
    set({ status, page: 1 });
    get().fetchSales();
  },

  setDatePreset: (preset: DatePreset) => {
    if (preset === 'custom') {
      set({ datePreset: 'custom' });
      return;
    }
    const dates = computeDateRange(preset);
    set({
      datePreset: preset,
      startDate: dates.startDate,
      endDate: dates.endDate,
      page: 1,
    });
    get().fetchSales();
  },

  setCustomDateRange: (start: string, end: string) => {
    set({
      datePreset: 'custom',
      startDate: start,
      endDate: end,
      page: 1,
    });
    get().fetchSales();
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchSales();
  },

  openDetail: async (id: string) => {
    set({ isDetailOpen: true, isLoadingDetail: true, selectedSale: null, selectedReceipt: null });
    try {
      const [sale, receipt] = await Promise.all([
        salesService.getSaleById(id),
        salesService.getSaleReceipt(id).catch(() => null),
      ]);
      set({ selectedSale: sale, selectedReceipt: receipt, isLoadingDetail: false });
    } catch (err: any) {
      set({ error: err.message || 'মেমো বিস্তারিত লোড করতে সমস্যা হয়েছে', isLoadingDetail: false });
    }
  },

  closeDetail: () => {
    set({ isDetailOpen: false, selectedSale: null, selectedReceipt: null });
  },

  openCancelModal: (sale: SaleListItem) => {
    set({ isCancelModalOpen: true, saleToCancel: sale });
  },

  closeCancelModal: () => {
    set({ isCancelModalOpen: false, saleToCancel: null });
  },

  cancelSale: async (reason?: string) => {
    const { saleToCancel, fetchSales, closeCancelModal } = get();
    if (!saleToCancel) return;

    set({ isSubmittingCancel: true });
    try {
      await salesService.cancelSale(saleToCancel.id, reason);
      closeCancelModal();
      await fetchSales();
      toast.success('বিক্রয় মেমো সফলভাবে বাতিল করা হয়েছে');
    } catch (err: any) {
      toast.error(err.message || 'মেমো বাতিল করতে সমস্যা হয়েছে');
    } finally {
      set({ isSubmittingCancel: false });
    }
  },

  openReturnModal: async (saleId: string) => {
    set({ isReturnModalOpen: true, isLoadingReturnSale: true, saleToReturn: null });
    try {
      const sale = await salesService.getSaleById(saleId);
      set({ saleToReturn: sale, isLoadingReturnSale: false });
    } catch (err: any) {
      toast.error(err.message || 'মেমোর বিবরণ লোড করা যায়নি');
      set({ isReturnModalOpen: false, isLoadingReturnSale: false });
    }
  },

  closeReturnModal: () => {
    set({ isReturnModalOpen: false, saleToReturn: null });
  },

  processReturn: async (payload) => {
    const { saleToReturn, fetchSales, closeReturnModal } = get();
    if (!saleToReturn) return;

    set({ isSubmittingReturn: true });
    try {
      await salesService.returnSale(saleToReturn.id, payload);
      closeReturnModal();
      await fetchSales();
      toast.success('পণ্য ফেরত ও স্টক সমন্বয় সম্পন্ন হয়েছে');
    } catch (err: any) {
      toast.error(err.message || 'পণ্য ফেরত সম্পন্ন করতে সমস্যা হয়েছে');
    } finally {
      set({ isSubmittingReturn: false });
    }
  },
}));
