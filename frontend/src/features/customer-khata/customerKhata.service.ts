/**
 * Customer Khata Service Layer
 * Strict API Integration with Decimal Sanitization for Idris Brothers
 */

import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { parseDecimal } from '@/lib/decimal';
import {
  Customer,
  CustomerFilterParams,
  CustomerListResponse,
  CustomerLedgerResponse,
  CustomerLedgerEntry,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  ReceiveCustomerPaymentDTO,
  AdjustCustomerBalanceDTO,
} from './customerKhata.types';

function sanitizeCustomer(raw: any): Customer {
  return {
    ...raw,
    currentDue: parseDecimal(raw.currentDue),
  };
}

function sanitizeLedgerEntry(raw: any): CustomerLedgerEntry {
  return {
    ...raw,
    debit: parseDecimal(raw.debit),
    credit: parseDecimal(raw.credit),
    balanceAfter: parseDecimal(raw.balanceAfter),
  };
}

export const customerKhataService = {
  /**
   * কাস্টমার তালিকা সংগ্রহ (ফিল্টার ও পেজিনেশন সহ)
   */
  async getCustomers(params?: CustomerFilterParams): Promise<CustomerListResponse> {
    const res = await apiClient.get<any>(API_ENDPOINTS.CUSTOMERS.BASE, params);
    const data = res.data?.data || res.data;

    return {
      customers: Array.isArray(data?.customers)
        ? data.customers.map(sanitizeCustomer)
        : [],
      meta: data?.meta || { page: 1, limit: 30, total: 0, totalPages: 1 },
    };
  },

  /**
   * নির্দিষ্ট কাস্টমারের বিস্তারিত তথ্য
   */
  async getCustomerById(id: string): Promise<Customer> {
    const res = await apiClient.get<any>(API_ENDPOINTS.CUSTOMERS.BY_ID(id));
    const data = res.data?.data || res.data;
    return sanitizeCustomer(data);
  },

  /**
   * নতুন কাস্টমার এন্ট্রি
   */
  async createCustomer(payload: CreateCustomerDTO): Promise<Customer> {
    const res = await apiClient.post<any>(API_ENDPOINTS.CUSTOMERS.BASE, payload);
    const data = res.data?.data || res.data;
    return sanitizeCustomer(data);
  },

  /**
   * কাস্টমার তথ্য আপডেট
   */
  async updateCustomer(id: string, payload: UpdateCustomerDTO): Promise<Customer> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.CUSTOMERS.BY_ID(id), payload);
    const data = res.data?.data || res.data;
    return sanitizeCustomer(data);
  },

  /**
   * নগদ বকেয়া উশুল / জমা গ্রহণ (Dedupe enabled)
   */
  async receivePayment(
    id: string,
    payload: ReceiveCustomerPaymentDTO
  ): Promise<{ customer: Customer; ledgerEntry: CustomerLedgerEntry }> {
    const res = await apiClient.post<any>(
      API_ENDPOINTS.CUSTOMERS.PAYMENTS(id),
      payload,
      { dedupe: true }
    );
    const data = res.data?.data || res.data;

    return {
      customer: sanitizeCustomer(data.customer),
      ledgerEntry: sanitizeLedgerEntry(data.ledgerEntry),
    };
  },

  /**
   * হিসাব সমন্বয় / ছাড় এন্ট্রি
   */
  async adjustBalance(
    id: string,
    payload: AdjustCustomerBalanceDTO
  ): Promise<{ customer: Customer; ledgerEntry: CustomerLedgerEntry }> {
    const res = await apiClient.post<any>(
      API_ENDPOINTS.CUSTOMERS.ADJUSTMENTS(id),
      payload
    );
    const data = res.data?.data || res.data;

    return {
      customer: sanitizeCustomer(data.customer),
      ledgerEntry: sanitizeLedgerEntry(data.ledgerEntry),
    };
  },

  /**
   * কাস্টমারের রানিং খতিয়ান ও জাবেদা বিবরণী
   */
  async getCustomerLedger(
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<CustomerLedgerResponse> {
    const res = await apiClient.get<any>(
      API_ENDPOINTS.CUSTOMERS.LEDGER(id),
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
