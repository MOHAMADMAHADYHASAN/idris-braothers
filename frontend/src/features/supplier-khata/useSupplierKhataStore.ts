/**
 * Supplier / Mahajan Khata Zustand Store
 * High-Performance Reactive State for Idris Brothers Supplier Khata
 */

import { create } from 'zustand';
import {
  Supplier,
  SupplierLedgerEntry,
  PayableFilterType,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  PaySupplierDTO,
  AdjustSupplierBalanceDTO,
} from './supplierKhata.types';
import { supplierKhataService } from './supplierKhata.service';

export type SupplierModalType =
  | 'payment'
  | 'ledger'
  | 'create'
  | 'edit'
  | 'adjustment'
  | null;

interface SupplierKhataState {
  // Data State
  suppliers: Supplier[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;

  // Filter State
  search: string;
  payableFilter: PayableFilterType;
  page: number;

  // Modals & Active Supplier
  activeModal: SupplierModalType;
  selectedSupplier: Supplier | null;

  // Ledger State
  ledgerEntries: SupplierLedgerEntry[];
  ledgerMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLedgerLoading: boolean;

  // Action Methods
  setSearch: (search: string) => void;
  setPayableFilter: (filter: PayableFilterType) => void;
  setPage: (page: number) => void;

  openModal: (modal: SupplierModalType, supplier?: Supplier | null) => void;
  closeModal: () => void;

  fetchSuppliers: () => Promise<void>;
  fetchSupplierLedger: (supplierId: string, page?: number) => Promise<void>;

  submitPayment: (
    supplierId: string,
    payload: PaySupplierDTO
  ) => Promise<{ supplier: Supplier; ledgerEntry: SupplierLedgerEntry }>;

  submitAdjustment: (
    supplierId: string,
    payload: AdjustSupplierBalanceDTO
  ) => Promise<{ supplier: Supplier; ledgerEntry: SupplierLedgerEntry }>;

  submitCreateSupplier: (payload: CreateSupplierDTO) => Promise<Supplier>;
  submitUpdateSupplier: (
    supplierId: string,
    payload: UpdateSupplierDTO
  ) => Promise<Supplier>;
}

export const useSupplierKhataStore = create<SupplierKhataState>((set, get) => ({
  suppliers: [],
  meta: {
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 1,
  },
  isLoading: false,
  error: null,

  search: '',
  payableFilter: 'payableOnly', // Default to mahajans who currently have outstanding payable
  page: 1,

  activeModal: null,
  selectedSupplier: null,

  ledgerEntries: [],
  ledgerMeta: {
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 1,
  },
  isLedgerLoading: false,

  setSearch: (search) => {
    set({ search, page: 1 });
    get().fetchSuppliers();
  },

  setPayableFilter: (payableFilter) => {
    set({ payableFilter, page: 1 });
    get().fetchSuppliers();
  },

  setPage: (page) => {
    set({ page });
    get().fetchSuppliers();
  },

  openModal: (modal, supplier = null) => {
    set({ activeModal: modal, selectedSupplier: supplier });
    if (modal === 'ledger' && supplier) {
      get().fetchSupplierLedger(supplier.id, 1);
    }
  },

  closeModal: () => {
    set({ activeModal: null, selectedSupplier: null });
  },

  fetchSuppliers: async () => {
    const { search, payableFilter, page } = get();
    set({ isLoading: true, error: null });

    try {
      const res = await supplierKhataService.getSuppliers({
        search: search.trim() || undefined,
        payableFilter: payableFilter === 'all' ? undefined : payableFilter,
        page,
        limit: 30,
      });

      set({
        suppliers: res.suppliers,
        meta: res.meta,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'মহাজনদের তালিকা লোড করতে সমস্যা হয়েছে',
        isLoading: false,
      });
    }
  },

  fetchSupplierLedger: async (supplierId, page = 1) => {
    set({ isLedgerLoading: true });
    try {
      const res = await supplierKhataService.getSupplierLedger(supplierId, {
        page,
        limit: 30,
      });
      set({
        ledgerEntries: res.entries,
        ledgerMeta: res.meta,
        isLedgerLoading: false,
      });
    } catch (err: any) {
      set({ isLedgerLoading: false });
    }
  },

  submitPayment: async (supplierId, payload) => {
    const result = await supplierKhataService.paySupplier(supplierId, payload);

    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === supplierId ? result.supplier : s
      ),
      selectedSupplier:
        state.selectedSupplier?.id === supplierId
          ? result.supplier
          : state.selectedSupplier,
    }));

    return result;
  },

  submitAdjustment: async (supplierId, payload) => {
    const result = await supplierKhataService.adjustBalance(supplierId, payload);

    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === supplierId ? result.supplier : s
      ),
      selectedSupplier:
        state.selectedSupplier?.id === supplierId
          ? result.supplier
          : state.selectedSupplier,
    }));

    return result;
  },

  submitCreateSupplier: async (payload) => {
    const created = await supplierKhataService.createSupplier(payload);
    await get().fetchSuppliers();
    return created;
  },

  submitUpdateSupplier: async (supplierId, payload) => {
    const updated = await supplierKhataService.updateSupplier(supplierId, payload);
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === supplierId ? updated : s
      ),
      selectedSupplier:
        state.selectedSupplier?.id === supplierId
          ? updated
          : state.selectedSupplier,
    }));
    return updated;
  },
}));
