/**
 * POS & Billing Types for Idris Brothers Grocery & Spice Store
 */

export type SaleType = 'RETAIL' | 'WHOLESALE';

export interface CustomerOption {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  customerType: SaleType;
  currentDue: number; // Parsed from Prisma Decimal
}

export interface CartItem {
  id: string; // unique cart item key (e.g. productId_unitName)
  productId: string;
  productName: string;
  banglaName?: string | null;
  sku?: string | null;
  barcode?: string | null;
  baseUnitName: string; // e.g. "কেজি", "প্যাকেট", "লিটার"
  
  // Unit Selection
  selectedUnitName: string; // e.g. "কেজি", "৫০ কেজি বস্তা", "৫ কেজি পাল্লা", "কার্টন"
  conversionFactor: number; // 1 for base, 50 for sack, 5 for palla, 24 for carton
  
  // Pricing
  unitPrice: number; // Price per selected unit (Retail or Wholesale)
  costPriceSnapshot: number; // Cost price per base unit at time of sale
  
  // Quantities & Reverse Calculation
  quantity: number; // e.g. 2 sacks or 1.5 KG
  baseQuantity: number; // quantity * conversionFactor (or reverse calculated)
  isReverseCalculated: boolean; // True if customer asked for "20 TK Cardamom"
  customTotalPrice?: number; // e.g. 20
  
  // Totals
  subTotal: number;
}

export interface CreateSaleItemPayload {
  productId: string;
  unitName: string;
  conversionFactor: number;
  quantity?: number;
  unitPrice?: number;
  customTotalPrice?: number;
}

export interface CreateSalePayload {
  saleType: SaleType;
  customerId?: string | null;
  discount: number;
  paidAmount: number;
  note?: string;
  items: CreateSaleItemPayload[];
}

export interface SaleInvoiceReceipt {
  id: string;
  invoiceNumber: string;
  saleType: SaleType;
  createdAt: string;
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  note?: string | null;
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
    address?: string | null;
    currentDue: number;
  } | null;
  items: Array<{
    id: string;
    productName: string;
    banglaName?: string | null;
    unitName: string;
    conversionFactor: number;
    quantity: number;
    baseQuantity: number;
    unitPrice: number;
    subTotal: number;
  }>;
}

export interface ThermalReceiptData {
  storeInfo: {
    name: string;
    tagline: string;
    address: string;
    market: string;
    phone: string;
  };
  invoice: {
    invoiceNumber: string;
    date: string;
    time: string;
    saleType: 'খুচরা' | 'পাইকারি';
  };
  customer: {
    name: string;
    phone: string;
    previousDue: number;
    currentDue: number;
  } | null;
  items: Array<{
    name: string;
    unit: string;
    qty: number;
    rate: number;
    total: number;
  }>;
  summary: {
    subTotal: number;
    discount: number;
    grandTotal: number;
    cashPaid: number;
    invoiceDue: number;
    customerTotalDueAfterSale: number;
  };
}
