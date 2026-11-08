/**
 * Customer Khata Zustand Store
 * High-Performance Reactive State for Idris Brothers Khata Module
 */

import { create } from 'zustand';
import {
  Customer,
  CustomerFilterParams,
  CustomerLedgerEntry,
  CustomerType,
  DueFilterType,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  ReceiveCustomerPaymentDTO,
  AdjustCustomerBalanceDTO,
} from './customerKhata.types';
import { customerKhataService } from './customerKhata.service';

export type KhataModalType =
  | 'payment'
  | 'ledger'
  | 'create'
  | 'edit'
  | 'adjustment'
  | null;

interface CustomerKhataState {
  // Data State
  customers: Customer[];
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
  customerType?: CustomerType;
  dueFilter: DueFilterType;
  page: number;

  // Modals & Active Customer
  activeModal: KhataModalType;
  selectedCustomer: Customer | null;

  // Ledger Drawer State
  ledgerEntries: CustomerLedgerEntry[];
  ledgerMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLedgerLoading: boolean;

  // Action Methods
  setSearch: (search: string) => void;
  setCustomerType: (type?: CustomerType) => void;
  setDueFilter: (filter: DueFilterType) => void;
  setPage: (page: number) => void;

  openModal: (modal: KhataModalType, customer?: Customer | null) => void;
  closeModal: () => void;

  fetchCustomers: () => Promise<void>;
  fetchCustomerLedger: (customerId: string, page?: number) => Promise<void>;

  submitPayment: (
    customerId: string,
    payload: ReceiveCustomerPaymentDTO
  ) => Promise<{ customer: Customer; ledgerEntry: CustomerLedgerEntry }>;

  submitAdjustment: (
    customerId: string,
    payload: AdjustCustomerBalanceDTO
  ) => Promise<{ customer: Customer; ledgerEntry: CustomerLedgerEntry }>;

  submitCreateCustomer: (payload: CreateCustomerDTO) => Promise<Customer>;
  submitUpdateCustomer: (
    customerId: string,
    payload: UpdateCustomerDTO
  ) => Promise<Customer>;
}

export const useCustomerKhataStore = create<CustomerKhataState>((set, get) => ({
  customers: [],
  meta: {
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 1,
  },
  isLoading: false,
  error: null,

  search: '',
  customerType: undefined,
  dueFilter: 'dueOnly', // Default to customers who currently have outstanding due
  page: 1,

  activeModal: null,
  selectedCustomer: null,

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
    get().fetchCustomers();
  },

  setCustomerType: (customerType) => {
    set({ customerType, page: 1 });
    get().fetchCustomers();
  },

  setDueFilter: (dueFilter) => {
    set({ dueFilter, page: 1 });
    get().fetchCustomers();
  },

  setPage: (page) => {
    set({ page });
    get().fetchCustomers();
  },

  openModal: (modal, customer = null) => {
    set({ activeModal: modal, selectedCustomer: customer });
    if (modal === 'ledger' && customer) {
      get().fetchCustomerLedger(customer.id, 1);
    }
  },

  closeModal: () => {
    set({ activeModal: null, selectedCustomer: null });
  },

  fetchCustomers: async () => {
    const { search, customerType, dueFilter, page } = get();
    set({ isLoading: true, error: null });

    try {
      const res = await customerKhataService.getCustomers({
        search: search.trim() || undefined,
        customerType: customerType || undefined,
        dueFilter: dueFilter === 'all' ? undefined : dueFilter,
        page,
        limit: 30,
      });

      set({
        customers: res.customers,
        meta: res.meta,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'কাস্টমার তালিকা লোড করতে সমস্যা হয়েছে',
        isLoading: false,
      });
    }
  },

  fetchCustomerLedger: async (customerId, page = 1) => {
    set({ isLedgerLoading: true });
    try {
      const res = await customerKhataService.getCustomerLedger(customerId, {
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

  submitPayment: async (customerId, payload) => {
    const result = await customerKhataService.receivePayment(customerId, payload);
    
    // Update customer in local state
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? result.customer : c
      ),
      selectedCustomer:
        state.selectedCustomer?.id === customerId
          ? result.customer
          : state.selectedCustomer,
    }));

    return result;
  },

  submitAdjustment: async (customerId, payload) => {
    const result = await customerKhataService.adjustBalance(customerId, payload);

    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? result.customer : c
      ),
      selectedCustomer:
        state.selectedCustomer?.id === customerId
          ? result.customer
          : state.selectedCustomer,
    }));

    return result;
  },

  submitCreateCustomer: async (payload) => {
    const created = await customerKhataService.createCustomer(payload);
    // Refresh list
    await get().fetchCustomers();
    return created;
  },

  submitUpdateCustomer: async (customerId, payload) => {
    const updated = await customerKhataService.updateCustomer(customerId, payload);
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? updated : c
      ),
      selectedCustomer:
        state.selectedCustomer?.id === customerId
          ? updated
          : state.selectedCustomer,
    }));
    return updated;
  },
}));
