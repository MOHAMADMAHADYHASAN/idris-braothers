/**
 * Customer Khata & Ledger Types
 * Idris Brothers Grocery & Spice POS & Khata Management
 */

export type CustomerType = 'RETAIL' | 'WHOLESALE';

export type CustomerLedgerType =
  | 'OPENING_BALANCE'
  | 'SALE'
  | 'PAYMENT_RECEIVED'
  | 'ADJUSTMENT'
  | 'RETURN';

export type DueFilterType = 'all' | 'dueOnly' | 'advanceOnly' | 'cleared';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  customerType: CustomerType;
  currentDue: number; // Sanitized from Prisma Decimal
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  saleId?: string | null;
  entryType: CustomerLedgerType;
  debit: number;        // বাকি নেওয়া (+)
  credit: number;       // নগদ জমা দেওয়া (-)
  balanceAfter: number; // রানিং অবশিষ্ট বকেয়া
  note: string | null;
  createdAt: string;
}

export interface CustomerFilterParams {
  search?: string;
  customerType?: CustomerType;
  dueFilter?: DueFilterType;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface CreateCustomerDTO {
  name: string;
  phone?: string | null;
  address?: string | null;
  customerType?: CustomerType;
  openingDue?: number;
}

export interface UpdateCustomerDTO {
  name?: string;
  phone?: string | null;
  address?: string | null;
  customerType?: CustomerType;
  isActive?: boolean;
}

export interface ReceiveCustomerPaymentDTO {
  amount: number;
  note?: string;
}

export interface AdjustCustomerBalanceDTO {
  amount: number; // Positive = add to due, Negative = discount/waiver
  reason: string;
}

export interface CustomerListResponse {
  customers: Customer[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerLedgerResponse {
  entries: CustomerLedgerEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerPaymentReceipt {
  paymentId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  amount: number;
  previousDue: number;
  newDue: number;
  date: string;
  note?: string;
}
