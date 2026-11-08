/**
 * Purchase & Supplier Challan Types
 * Idris Brothers Grocery & Spice POS & Khata Management
 */

export interface PurchaseItemDTO {
  productId: string;
  productName?: string;
  baseUnitName?: string;
  unitName: string;
  conversionFactor: number;
  quantity: number;
  unitCost: number;
  newRetailPrice?: number;
  newWholesalePrice?: number;
  saveUnitForFuture?: boolean;
}

export interface CreatePurchasePayload {
  purchaseNumber?: string;
  supplierId: string;
  transportCost?: number;
  discount?: number;
  paidAmount?: number;
  note?: string;
  items: PurchaseItemDTO[];
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    banglaName?: string | null;
    barcode?: string | null;
    baseUnitName?: string;
  };
  unitName: string;
  conversionFactor: number;
  quantity: number;
  baseQuantity: number;
  unitCost: number;
  newRetailPrice?: number | null;
  newWholesalePrice?: number | null;
  subTotal: number;
  createdAt: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplier?: {
    id: string;
    name: string;
    companyName?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  subTotal: number;
  transportCost: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  note?: string | null;
  items?: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseFilterParams {
  supplierId?: string;
  purchaseNumber?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface PurchaseListResponse {
  purchases: Purchase[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
