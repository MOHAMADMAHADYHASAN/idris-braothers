/**
 * Supplier / Mahajan Khata & Ledger Types
 * Idris Brothers Grocery & Spice POS & Khata Management
 */

export type SupplierLedgerType =
  | 'OPENING_BALANCE'
  | 'PURCHASE'
  | 'PURCHASE_DUE'
  | 'PAYMENT_PAID'
  | 'ADJUSTMENT'
  | 'RETURN';

export type PayableFilterType = 'all' | 'payableOnly' | 'advanceOnly' | 'cleared';

export interface Supplier {
  id: string;
  name: string;                // মহাজনের নাম / মালিকের নাম
  companyName: string | null;  // গদি / প্রতিষ্ঠানের নাম (যেমন: মেসার্স আলম ট্রেডার্স)
  phone: string | null;
  address: string | null;      // মহাজন বা প্রতিষ্ঠানের ঠিকানা (যেমন: খাতুনগঞ্জ, চট্টগ্রাম)
  currentPayable: number;      // দোকানে মহাজনের পাওনা (Sanitized from Prisma Decimal)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  purchaseId?: string | null;
  entryType: SupplierLedgerType;
  debit: number;        // নগদ পরিশোধ / দেনা হ্রাস (-)
  credit: number;       // চালান মাল ক্রয় / দেনা বৃদ্ধি (+)
  balanceAfter: number; // রানিং অবশিষ্ট দেনা
  note: string | null;
  createdAt: string;
}

export interface SupplierFilterParams {
  search?: string;
  payableFilter?: PayableFilterType;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface CreateSupplierDTO {
  name: string;
  companyName?: string | null;
  phone?: string | null;
  address?: string | null;
  openingPayable?: number;
}

export interface UpdateSupplierDTO {
  name?: string;
  companyName?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive?: boolean;
}

export interface PaySupplierDTO {
  amount: number;
  note?: string;
}

export interface AdjustSupplierBalanceDTO {
  amount: number; // Positive = increases store debt, Negative = rebate/waiver
  reason: string;
}

export interface SupplierListResponse {
  suppliers: Supplier[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SupplierLedgerResponse {
  entries: SupplierLedgerEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
