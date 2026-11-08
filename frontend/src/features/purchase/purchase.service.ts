/**
 * Purchase & Supplier Challan Service Layer
 * Strict API Integration with Decimal Sanitization for Idris Brothers
 */

import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { parseDecimal } from '@/lib/decimal';
import {
  Purchase,
  PurchaseItem,
  PurchaseFilterParams,
  PurchaseListResponse,
  CreatePurchasePayload,
} from './purchase.types';

function sanitizePurchaseItem(raw: any): PurchaseItem {
  return {
    ...raw,
    conversionFactor: parseDecimal(raw.conversionFactor),
    quantity: parseDecimal(raw.quantity),
    baseQuantity: parseDecimal(raw.baseQuantity),
    unitCost: parseDecimal(raw.unitCost),
    subTotal: parseDecimal(raw.subTotal),
    newRetailPrice: raw.newRetailPrice ? parseDecimal(raw.newRetailPrice) : null,
    newWholesalePrice: raw.newWholesalePrice ? parseDecimal(raw.newWholesalePrice) : null,
  };
}

function sanitizePurchase(raw: any): Purchase {
  return {
    ...raw,
    subTotal: parseDecimal(raw.subTotal),
    transportCost: parseDecimal(raw.transportCost),
    discount: parseDecimal(raw.discount),
    grandTotal: parseDecimal(raw.grandTotal),
    paidAmount: parseDecimal(raw.paidAmount),
    dueAmount: parseDecimal(raw.dueAmount),
    items: Array.isArray(raw.items) ? raw.items.map(sanitizePurchaseItem) : [],
  };
}

export const purchaseService = {
  /**
   * চালান রেজিস্টার তালিকা সংগ্রহ (ফিল্টার ও পেজিনেশন সহ)
   */
  async getPurchases(params?: PurchaseFilterParams): Promise<PurchaseListResponse> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PURCHASES.BASE, params);
    const data = res.data?.data || res.data;

    return {
      purchases: Array.isArray(data?.purchases)
        ? data.purchases.map(sanitizePurchase)
        : [],
      meta: data?.meta || { page: 1, limit: 30, total: 0, totalPages: 1 },
    };
  },

  /**
   * নির্দিষ্ট চালানের পূর্ণাঙ্গ বিবরণী
   */
  async getPurchaseById(id: string): Promise<Purchase> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PURCHASES.BY_ID(id));
    const data = res.data?.data || res.data;
    return sanitizePurchase(data);
  },

  /**
   * নতুন চালান এন্ট্রি ও স্টক ইন (Request deduplication enabled)
   */
  async createPurchase(payload: CreatePurchasePayload): Promise<Purchase> {
    const res = await apiClient.post<any>(
      API_ENDPOINTS.PURCHASES.BASE,
      payload,
      { dedupe: true }
    );
    const data = res.data?.data || res.data;
    return sanitizePurchase(data);
  },
};
