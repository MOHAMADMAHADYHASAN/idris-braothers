import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { parseDecimal } from '@/lib/decimal';
import {
  SaleListItem,
  SaleDetail,
  SalesMeta,
  SalesFilterState,
  ReturnSalePayload,
  ReturnSaleResponse,
  DateRangeInfo,
  PeriodComparison,
} from './sales.types';

export interface SalesResponse {
  sales: SaleListItem[];
  meta: SalesMeta;
  dateRange?: DateRangeInfo | null;
  periodComparison?: PeriodComparison | null;
}

function sanitizeSale(raw: any): SaleListItem {
  if (!raw) return raw;
  return {
    ...raw,
    subTotal: parseDecimal(raw.subTotal),
    discount: parseDecimal(raw.discount),
    grandTotal: parseDecimal(raw.grandTotal),
    paidAmount: parseDecimal(raw.paidAmount),
    dueAmount: parseDecimal(raw.dueAmount),
    items: Array.isArray(raw.items)
      ? raw.items.map((i: any) => ({
          ...i,
          quantity: parseDecimal(i.quantity),
          unitPrice: parseDecimal(i.unitPrice),
          subTotal: parseDecimal(i.subTotal),
        }))
      : [],
  };
}

export const salesService = {
  /**
   * Fetch paginated sales list with filters
   */
  async getSales(params: Partial<SalesFilterState>): Promise<SalesResponse> {
    const queryParams: Record<string, any> = {};

    if (params.searchQuery) {
      queryParams.invoiceNumber = params.searchQuery.trim();
    }
    if (params.saleType) {
      queryParams.saleType = params.saleType;
    }
    if (params.filter) {
      queryParams.filter = params.filter;
    }
    if (params.startDate) {
      queryParams.startDate = params.startDate;
    }
    if (params.endDate) {
      queryParams.endDate = params.endDate;
    }
    if (params.page) {
      queryParams.page = params.page;
    }
    if (params.limit) {
      queryParams.limit = params.limit;
    }

    const res = await apiClient.get<any>(API_ENDPOINTS.SALES.BASE, queryParams);
    const data = res.data?.data || res.data || {};
    const rawSales = data.sales || [];
    const meta = data.meta || { total: rawSales.length, page: 1, limit: 15, totalPages: 1 };

    return {
      sales: rawSales.map(sanitizeSale),
      meta,
      dateRange: data.dateRange || null,
      periodComparison: data.periodComparison || null,
    };
  },

  /**
   * Get single sale details with all items
   */
  async getSaleById(id: string): Promise<SaleDetail> {
    const res = await apiClient.get<any>(API_ENDPOINTS.SALES.BY_ID(id));
    const raw = res.data?.data || res.data;
    return sanitizeSale(raw) as SaleDetail;
  },

  /**
   * Get thermal receipt format for printing
   */
  async getSaleReceipt(id: string): Promise<any> {
    const res = await apiClient.get<any>(API_ENDPOINTS.SALES.RECEIPT(id));
    return res.data?.data || res.data;
  },

  /**
   * Cancel / Void a completed sale invoice and restore inventory
   */
  async cancelSale(id: string, reason?: string): Promise<{ sale: SaleDetail; customerDue?: number }> {
    const res = await apiClient.post<any>(
      API_ENDPOINTS.SALES.CANCEL(id),
      { reason: reason || undefined }
    );
    const data = res.data?.data || res.data;
    return {
      sale: sanitizeSale(data.sale) as SaleDetail,
      customerDue: data.customerDue !== null && data.customerDue !== undefined ? parseDecimal(data.customerDue) : undefined,
    };
  },

  /**
   * Return items from a sale invoice and adjust stock / due / cash
   */
  async returnSale(id: string, payload: ReturnSalePayload): Promise<ReturnSaleResponse> {
    const res = await apiClient.post<any>(
      API_ENDPOINTS.SALES.RETURN(id),
      payload
    );
    const data = res.data?.data || res.data;
    return {
      sale: sanitizeSale(data.sale) as SaleDetail,
      totalRefundAmount: parseDecimal(data.totalRefundAmount),
      refundMethod: data.refundMethod,
      customerDue: data.customerDue !== null && data.customerDue !== undefined ? parseDecimal(data.customerDue) : undefined,
    };
  },
};
