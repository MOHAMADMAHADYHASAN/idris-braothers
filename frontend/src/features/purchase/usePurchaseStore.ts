/**
 * Purchase & Supplier Challan Zustand Store
 * High-Performance Reactive State for Idris Brothers Procurement Engine
 */

import { create } from 'zustand';
import {
  Purchase,
  PurchaseItemDTO,
  PurchaseFilterParams,
  CreatePurchasePayload,
} from './purchase.types';
import { purchaseService } from './purchase.service';

interface PurchaseState {
  // Challan Draft Builder
  supplierId: string;
  supplierName: string;
  purchaseNumber: string;
  transportCost: number;
  discount: number;
  paidAmount: number;
  note: string;
  items: PurchaseItemDTO[];
  isSubmitting: boolean;
  draftError: string | null;

  // History & Ledger List
  purchases: Purchase[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoadingHistory: boolean;
  historyError: string | null;
  filters: PurchaseFilterParams;

  // Detail Modal
  selectedPurchase: Purchase | null;
  isDetailModalOpen: boolean;

  // Actions - Draft Builder
  setSupplier: (id: string, name: string) => void;
  setPurchaseNumber: (num: string) => void;
  setTransportCost: (cost: number) => void;
  setDiscount: (discount: number) => void;
  setPaidAmount: (paid: number) => void;
  setNote: (note: string) => void;
  addItem: (item: PurchaseItemDTO) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, updated: Partial<PurchaseItemDTO>) => void;
  resetDraft: () => void;
  submitChallan: () => Promise<Purchase>;

  // Actions - History
  setFilter: (key: keyof PurchaseFilterParams, val: any) => void;
  setDateRange: (start?: string, end?: string) => void;
  setPage: (page: number) => void;
  fetchPurchases: () => Promise<void>;
  fetchPurchaseById: (id: string) => Promise<Purchase | null>;
  openDetailModal: (purchase: Purchase) => void;
  closeDetailModal: () => void;

  // Helper Computations
  getSubTotal: () => number;
  getGrandTotal: () => number;
  getDueAmount: () => number;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  // Draft Initial State
  supplierId: '',
  supplierName: '',
  purchaseNumber: '',
  transportCost: 0,
  discount: 0,
  paidAmount: 0,
  note: '',
  items: [],
  isSubmitting: false,
  draftError: null,

  // History Initial State
  purchases: [],
  meta: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  isLoadingHistory: false,
  historyError: null,
  filters: {
    page: 1,
    limit: 20,
  },

  // Modal Initial State
  selectedPurchase: null,
  isDetailModalOpen: false,

  // Draft Mutations
  setSupplier: (id, name) => set({ supplierId: id, supplierName: name, draftError: null }),
  setPurchaseNumber: (purchaseNumber) => set({ purchaseNumber }),
  setTransportCost: (transportCost) => set({ transportCost }),
  setDiscount: (discount) => set({ discount }),
  setPaidAmount: (paidAmount) => set({ paidAmount }),
  setNote: (note) => set({ note }),

  addItem: (item) => {
    set((state) => ({
      items: [...state.items, item],
      draftError: null,
    }));
  },

  removeItem: (index) => {
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    }));
  },

  updateItem: (index, updated) => {
    set((state) => ({
      items: state.items.map((item, i) =>
        i === index ? { ...item, ...updated } : item
      ),
    }));
  },

  resetDraft: () => {
    set({
      supplierId: '',
      supplierName: '',
      purchaseNumber: '',
      transportCost: 0,
      discount: 0,
      paidAmount: 0,
      note: '',
      items: [],
      isSubmitting: false,
      draftError: null,
    });
  },

  getSubTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  },

  getGrandTotal: () => {
    const subTotal = get().getSubTotal();
    const { transportCost, discount } = get();
    return Math.max(0, subTotal + (transportCost || 0) - (discount || 0));
  },

  getDueAmount: () => {
    const grandTotal = get().getGrandTotal();
    const { paidAmount } = get();
    return Math.max(0, grandTotal - (paidAmount || 0));
  },

  submitChallan: async () => {
    const {
      supplierId,
      purchaseNumber,
      transportCost,
      discount,
      paidAmount,
      note,
      items,
    } = get();

    if (!supplierId) {
      set({ draftError: 'অনুগ্রহ করে মহাজন / আড়ত নির্বাচন করুন' });
      throw new Error('অনুগ্রহ করে মহাজন / আড়ত নির্বাচন করুন');
    }

    if (items.length === 0) {
      set({ draftError: 'চালানে কমপক্ষে একটি পণ্য যোগ করতে হবে' });
      throw new Error('চালানে কমপক্ষে একটি পণ্য যোগ করতে হবে');
    }

    set({ isSubmitting: true, draftError: null });

    try {
      const payload: CreatePurchasePayload = {
        supplierId,
        purchaseNumber: purchaseNumber.trim() || undefined,
        transportCost: Number(transportCost) || 0,
        discount: Number(discount) || 0,
        paidAmount: Number(paidAmount) || 0,
        note: note.trim() || undefined,
        items,
      };

      const result = await purchaseService.createPurchase(payload);

      // Reset draft & refresh history
      get().resetDraft();
      get().fetchPurchases();

      set({ isSubmitting: false });
      return result;
    } catch (err: any) {
      set({
        draftError: err.message || 'চালান সংরক্ষণ করতে সমস্যা হয়েছে',
        isSubmitting: false,
      });
      throw err;
    }
  },

  // History Actions
  setFilter: (key, val) => {
    set((state) => ({
      filters: { ...state.filters, [key]: val, page: 1 },
    }));
    get().fetchPurchases();
  },

  setDateRange: (start?: string, end?: string) => {
    const state = get();
    if (state.filters.startDate === start && state.filters.endDate === end) {
      return;
    }
    set((s) => ({
      filters: { ...s.filters, startDate: start, endDate: end, page: 1 },
    }));
    get().fetchPurchases();
  },

  setPage: (page: number) => {
    set((s) => ({
      filters: { ...s.filters, page },
    }));
    get().fetchPurchases();
  },

  fetchPurchases: async () => {
    const { filters } = get();
    set({ isLoadingHistory: true, historyError: null });

    try {
      const res = await purchaseService.getPurchases(filters);
      set({
        purchases: res.purchases,
        meta: res.meta,
        isLoadingHistory: false,
      });
    } catch (err: any) {
      set({
        historyError: err.message || 'চালান রেজিস্টার লোড করতে সমস্যা হয়েছে',
        isLoadingHistory: false,
      });
    }
  },

  fetchPurchaseById: async (id: string) => {
    try {
      const purchase = await purchaseService.getPurchaseById(id);
      set({ selectedPurchase: purchase });
      return purchase;
    } catch (err: any) {
      console.error('Failed to fetch purchase by id', err);
      return null;
    }
  },

  openDetailModal: (purchase) => {
    set({ selectedPurchase: purchase, isDetailModalOpen: true });
  },

  closeDetailModal: () => {
    set({ selectedPurchase: null, isDetailModalOpen: false });
  },
}));
