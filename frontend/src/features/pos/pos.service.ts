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
  if (!raw) return raw;
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
      productName:
        item.variant?.product?.banglaName ||
        item.variant?.product?.name ||
        item.product?.banglaName ||
        item.product?.name ||
        item.productName ||
        'অজ্ঞাত পণ্য',
      banglaName:
        item.variant?.product?.banglaName ||
        item.product?.banglaName ||
        item.banglaName ||
        null,
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
    // Extract nested sale payload from backend response: { sale: {...}, customerDue: ... }
    const saleData = res.data?.sale || res.data;
    return sanitizeInvoice(saleData);
  }

  /**
   * Get 58mm/80mm POS Thermal Receipt payload.
   */
  async getReceipt(saleId: string): Promise<ThermalReceiptData> {
    if (!saleId || saleId === 'undefined') {
      throw new Error('মেমো আইডি পাওয়া যায়নি');
    }
    const res = await apiClient.get<any>(API_ENDPOINTS.SALES.RECEIPT(saleId));
    const raw = res.data?.data || res.data || {};

    const storeInfo = {
      name: raw.store?.storeName || raw.storeInfo?.name || 'ইদ্রিস ব্রাদার্স',
      tagline: raw.store?.tagline || raw.storeInfo?.tagline || 'পাইকারি ও খুচরা মসলা এবং মুদি মাল বিক্রয় কেন্দ্র',
      address: raw.store?.address || raw.storeInfo?.address || 'মরিচপট্টি, বড় বাজার, ফেনী',
      market: raw.store?.market || raw.storeInfo?.market || 'ফেনী বাজার',
      phone: raw.store?.phone || raw.storeInfo?.phone || '০১৭১১-XXXXXX',
    };

    const billing = raw.billing || raw.summary || {};

    const customer = raw.customer
      ? {
          name: raw.customer.name || '',
          phone: raw.customer.phone && raw.customer.phone !== 'N/A' ? raw.customer.phone : '',
          previousDue: parseDecimal(raw.customer.previousDue ?? billing.previousDue, 0),
          currentDue: parseDecimal(raw.customer.currentDue ?? billing.totalCurrentDue, 0),
        }
      : null;

    const items = (raw.items || []).map((i: any) => ({
      name: i.productName || i.name || 'পণ্য',
      unit: i.unitName || i.unit || 'কেজি',
      qty: parseDecimal(i.quantity ?? i.qty, 0),
      rate: parseDecimal(i.unitPrice ?? i.rate, 0),
      total: parseDecimal(i.subTotal ?? i.total, 0),
    }));

    const summary = {
      subTotal: parseDecimal(billing.subTotal, 0),
      discount: parseDecimal(billing.discount, 0),
      grandTotal: parseDecimal(billing.grandTotal, 0),
      cashPaid: parseDecimal(billing.paidAmount ?? billing.cashPaid, 0),
      invoiceDue: parseDecimal(billing.thisInvoiceDue ?? billing.invoiceDue, 0),
      customerTotalDueAfterSale: parseDecimal(
        billing.totalCurrentDue ?? billing.customerTotalDueAfterSale,
        0
      ),
    };

    return {
      storeInfo,
      invoice: {
        invoiceNumber: raw.invoice?.invoiceNumber || '',
        date: raw.invoice?.date || '',
        time: raw.invoice?.time || '',
        saleType:
          raw.invoice?.saleType?.includes('WHOLESALE') || raw.invoice?.saleType === 'পাইকারি'
            ? 'পাইকারি'
            : 'খুচরা',
      },
      customer,
      items,
      summary,
    };
  }

  /**
   * Quick customer lookup for POS dropdown.
   */
  async searchCustomers(search?: string): Promise<CustomerOption[]> {
    const res = await apiClient.get<any>(API_ENDPOINTS.CUSTOMERS.BASE, {
      search,
      limit: 30,
    });
    const list: any[] = Array.isArray(res.data)
      ? res.data
      : (res.data?.customers || []);

    return list.map((c: any): CustomerOption => ({
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
