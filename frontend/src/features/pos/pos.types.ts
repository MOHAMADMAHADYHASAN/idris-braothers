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
  id: string; // unique cart item key (e.g. variantId_unitName)
  productId: string;
  variantId?: string;
  productName: string;
  banglaName?: string | null;
  variantName?: string | null;
  allowDecimalQty: boolean;
  sku?: string | null;
  barcode?: string | null;
  baseUnitName: string; // e.g. "কেজি", "প্যাকেট", "বোতল", "পিস"
  
  // Unit Selection
  selectedUnitName: string; // e.g. "কেজি", "প্যাকেট", "পিস", "বোতল"
  conversionFactor: number; // 1 for direct kg / pcs
  
  // Pricing
  retailUnitPrice: number;
  wholesaleUnitPrice: number;
  unitPrice: number; // Active price per selected unit (or custom overridden)
  isCustomPrice?: boolean;
  costPriceSnapshot: number; // Cost price per base unit at time of sale
  
  // Quantities & Reverse Calculation
  quantity: number; // e.g. 24 pcs or 66.5 kg
  baseQuantity: number; // quantity * conversionFactor (or reverse calculated)
  isReverseCalculated: boolean; // True if customer asked for e.g. "700 TK Rice"
  customTotalPrice?: number;
  
  // Totals
  subTotal: number;
}

export interface CreateSaleItemPayload {
  variantId?: string;
  productId?: string;
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
