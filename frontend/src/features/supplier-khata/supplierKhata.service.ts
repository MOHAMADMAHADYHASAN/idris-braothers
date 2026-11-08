/**
 * Supplier / Mahajan Khata Service Layer
 * Strict API Integration with Decimal Sanitization for Idris Brothers
 */

import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { parseDecimal } from '@/lib/decimal';
import {
  Supplier,
  SupplierFilterParams,
  SupplierListResponse,
  SupplierLedgerResponse,
  SupplierLedgerEntry,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  PaySupplierDTO,
  AdjustSupplierBalanceDTO,
} from './supplierKhata.types';

function sanitizeSupplier(raw: any): Supplier {
  return {
    ...raw,
    currentPayable: parseDecimal(raw.currentPayable),
  };
}

function sanitizeLedgerEntry(raw: any): SupplierLedgerEntry {
  return {
    ...raw,
    debit: parseDecimal(raw.debit),
    credit: parseDecimal(raw.credit),
    balanceAfter: parseDecimal(raw.balanceAfter),
  };
}

export const supplierKhataService = {
  /**
   * মহাজনদের তালিকা সংগ্রহ (ফিল্টার ও পেজিনেশন সহ)
   */
  async getSuppliers(params?: SupplierFilterParams): Promise<SupplierListResponse> {
    const res = await apiClient.get<any>(API_ENDPOINTS.SUPPLIERS.BASE, params);
    const data = res.data?.data || res.data;

    return {
      suppliers: Array.isArray(data?.suppliers)
        ? data.suppliers.map(sanitizeSupplier)
        : [],
      meta: data?.meta || { page: 1, limit: 30, total: 0, totalPages: 1 },
    };
  },

  /**
   * নির্দিষ্ট মহাজনের বিস্তারিত তথ্য
   */
  async getSupplierById(id: string): Promise<Supplier> {
    const res = await apiClient.get<any>(API_ENDPOINTS.SUPPLIERS.BY_ID(id));
    const data = res.data?.data || res.data;
    return sanitizeSupplier(data);
  },

  /**
   * নতুন মহাজন / আড়তদার এন্ট্রি
   */
  async createSupplier(payload: CreateSupplierDTO): Promise<Supplier> {
    const res = await apiClient.post<any>(API_ENDPOINTS.SUPPLIERS.BASE, payload);
    const data = res.data?.data || res.data;
    return sanitizeSupplier(data);
  },

  /**
   * মহাজনের তথ্য আপডেট
   */
  async updateSupplier(id: string, payload: UpdateSupplierDTO): Promise<Supplier> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.SUPPLIERS.BY_ID(id), payload);
    const data = res.data?.data || res.data;
    return sanitizeSupplier(data);
  },

  /**
   * মহাজনকে নগদ দেনা পরিশোধ (Dedupe enabled to prevent double payment)
   */
  async paySupplier(
    id: string,
    payload: PaySupplierDTO
  ): Promise<{ supplier: Supplier; ledgerEntry: SupplierLedgerEntry }> {
    const res = await apiClient.post<any>(
      API_ENDPOINTS.SUPPLIERS.PAYMENTS(id),
      payload,
      { dedupe: true }
    );
    const data = res.data?.data || res.data;

    return {
      supplier: sanitizeSupplier(data.supplier),
      ledgerEntry: sanitizeLedgerEntry(data.ledgerEntry),
    };
  },

  /**
   * শুকতি / কমিশন / ছাড় সমন্বয় এন্ট্রি
   */
  async adjustBalance(
    id: string,
    payload: AdjustSupplierBalanceDTO
  ): Promise<{ supplier: Supplier; ledgerEntry: SupplierLedgerEntry }> {
    const res = await apiClient.post<any>(
      API_ENDPOINTS.SUPPLIERS.ADJUSTMENTS(id),
      payload
    );
    const data = res.data?.data || res.data;

    return {
      supplier: sanitizeSupplier(data.supplier),
      ledgerEntry: sanitizeLedgerEntry(data.ledgerEntry),
    };
  },

  /**
   * মহাজনের রানিং জাবেদা খতিয়ান বিবরণী
   */
  async getSupplierLedger(
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<SupplierLedgerResponse> {
    const res = await apiClient.get<any>(
      API_ENDPOINTS.SUPPLIERS.LEDGER(id),
      params
    );
    const data = res.data?.data || res.data;

    return {
      entries: Array.isArray(data?.entries)
        ? data.entries.map(sanitizeLedgerEntry)
        : [],
      meta: data?.meta || { page: 1, limit: 30, total: 0, totalPages: 1 },
    };
  },
};
