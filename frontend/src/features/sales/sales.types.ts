export type SaleType = 'RETAIL' | 'WHOLESALE';
export type SaleStatus = 'COMPLETED' | 'CANCELLED';

export interface SaleItemDetail {
  id: string;
  unitName: string;
  quantity: number;
  baseQuantity: number;
  unitPrice: number;
  subTotal: number;
  costPriceSnapshot?: number;
  variant?: {
    id: string;
    variantName: string;
    baseUnitName: string;
    product: {
      id: string;
      name: string;
      banglaName: string | null;
    };
  };
}

export interface SaleCustomerInfo {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
}

export interface SaleListItem {
  id: string;
  invoiceNumber: string;
  saleType: SaleType;
  status: SaleStatus;
  customerId?: string | null;
  customer?: SaleCustomerInfo | null;
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    unitName: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
    variant?: {
      id: string;
      variantName: string;
      baseUnitName: string;
      product: {
        id: string;
        name: string;
        banglaName: string | null;
      };
    };
  }[];
}

export interface SaleDetail extends SaleListItem {
  items: SaleItemDetail[];
}

export interface SalesMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalesFilterState {
  searchQuery: string;
  filter?: string;
  saleType?: SaleType;
  status?: SaleStatus;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export interface DateRangeInfo {
  filter: string;
  startYmd: string;
  endYmd: string;
  numDays: number;
}

export interface PeriodComparison {
  currentRevenue: number;
  prevRevenue: number;
  growthPercent: number | null;
  currentOrders: number;
  prevOrders: number;
}

export interface ReturnSaleItemInput {
  saleItemId: string;
  returnQuantity: number;
}

export interface ReturnSalePayload {
  items: ReturnSaleItemInput[];
  refundMethod: 'CASH' | 'CUSTOMER_DUE_ADJUSTMENT';
  reason?: string;
}

export interface ReturnSaleResponse {
  sale: SaleDetail;
  totalRefundAmount: number;
  refundMethod: 'CASH' | 'CUSTOMER_DUE_ADJUSTMENT';
  customerDue?: number | null;
}
