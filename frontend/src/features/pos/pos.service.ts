import { apiClient, PaginationMeta } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { parseDecimal } from '@/lib/decimal';
import {
  CreateSalePayload,
  SaleInvoiceReceipt,
  ThermalReceiptData,
  CustomerOption,
} from './pos.types';

function sanitizeInvoice(raw: any): SaleInvoiceReceipt {
  return {
    ...raw,
    subTotal: parseDecimal(raw.subTotal, 0),
    discount: parseDecimal(raw.discount, 0),
    grandTotal: parseDecimal(raw.grandTotal, 0),
    paidAmount: parseDecimal(raw.paidAmount, 0),
    dueAmount: parseDecimal(raw.dueAmount, 0),
    customer: raw.customer
      ? {
          ...raw.customer,
          currentDue: parseDecimal(raw.customer.currentDue, 0),
        }
      : null,
    items: (raw.items || []).map((item: any) => ({
      ...item,
      productName: item.product?.name || item.productName || 'অজ্ঞাত পণ্য',
      banglaName: item.product?.banglaName || item.banglaName || null,
      conversionFactor: parseDecimal(item.conversionFactor, 1),
      quantity: parseDecimal(item.quantity, 0),
      baseQuantity: parseDecimal(item.baseQuantity, 0),
      unitPrice: parseDecimal(item.unitPrice, 0),
      subTotal: parseDecimal(item.subTotal, 0),
    })),
  };
}

class PosService {
  /**
   * Submit sale invoice with request deduping to prevent double billing.
   */
  async createSale(payload: CreateSalePayload): Promise<SaleInvoiceReceipt> {
    const res = await apiClient.post<any>(API_ENDPOINTS.SALES.BASE, payload, {
      dedupe: true,
    });
    return sanitizeInvoice(res.data);
  }

  /**
   * Get 58mm/80mm POS Thermal Receipt payload.
   */
  async getReceipt(saleId: string): Promise<ThermalReceiptData> {
    const res = await apiClient.get<any>(API_ENDPOINTS.SALES.RECEIPT(saleId));
    const raw = res.data;
    return {
      ...raw,
      customer: raw.customer
        ? {
            ...raw.customer,
            previousDue: parseDecimal(raw.customer.previousDue, 0),
            currentDue: parseDecimal(raw.customer.currentDue, 0),
          }
        : null,
      items: (raw.items || []).map((i: any) => ({
        ...i,
        qty: parseDecimal(i.qty, 0),
        rate: parseDecimal(i.rate, 0),
        total: parseDecimal(i.total, 0),
      })),
      summary: {
        subTotal: parseDecimal(raw.summary?.subTotal, 0),
        discount: parseDecimal(raw.summary?.discount, 0),
        grandTotal: parseDecimal(raw.summary?.grandTotal, 0),
        cashPaid: parseDecimal(raw.summary?.cashPaid, 0),
        invoiceDue: parseDecimal(raw.summary?.invoiceDue, 0),
        customerTotalDueAfterSale: parseDecimal(raw.summary?.customerTotalDueAfterSale, 0),
      },
    };
  }

  /**
   * Quick customer lookup for POS dropdown.
   */
  async searchCustomers(search?: string): Promise<CustomerOption[]> {
    const res = await apiClient.get<any[]>(API_ENDPOINTS.CUSTOMERS.BASE, {
      search,
      limit: 30,
    });
    return (res.data || []).map((c: any): CustomerOption => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      address: c.address,
      customerType: c.customerType || 'RETAIL',
      currentDue: parseDecimal(c.currentDue, 0),
    }));
  }
}

export const posService = new PosService();
