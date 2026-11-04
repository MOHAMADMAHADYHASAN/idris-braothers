export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  sku: string | null;
  stock: number;
  lowStockLimit: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  currentDue: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface InvoiceReceipt {
  id: string;
  invoiceNumber: string;
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  customer?: { name: string; phone: string } | null;
  items: Array<{
    product: { name: string; unit: string };
    quantity: number;
    unitPrice: number;
    subTotal: number;
  }>;
}
