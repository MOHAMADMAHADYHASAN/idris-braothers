/**
 * Product & Dynamic Unit Types
 * Strictly aligned with Idris Brothers Grocery & Spice Store Data Model
 */

export interface UnitMaster {
  id: string;
  name: string; // "কেজি", "গ্রাম", "প্যাকেট", "পিস", "বোতল", "লিটার", "বস্তা", "কার্টন", "পাল্লা", "টিন"
  banglaName?: string | null;
  category?: string | null; // "WEIGHT", "VOLUME", "COUNT", "PACKAGING", "OTHER"
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductUnit {
  id: string;
  productId: string;
  unitName: string; // e.g. "৫০ কেজি বস্তা", "৫ কেজি পাল্লা", "কার্টন (২৪ প্যাকেট)"
  conversionFactor: number; // e.g. 50, 5, 24
  retailPrice?: number | null;
  wholesalePrice?: number | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  banglaName?: string | null;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null; // "SPICES", "RICE_GRAINS", "OIL_GHEE", "SUGAR", "PACKAGED"
  baseUnitName: string; // 100% dynamic string e.g. "কেজি", "প্যাকেট", "লিটার"
  stockQuantity: number; // Stored as 4-decimal number in frontend store
  lowStockAlert: number;
  currentPurchasePrice: number; // Replacement cost per base unit
  retailPrice: number; // Retail price per base unit
  wholesalePrice: number; // Wholesale price per base unit
  isActive: boolean;
  units?: ProductUnit[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StockWastage {
  id: string;
  productId: string;
  quantity: number; // 4 decimals (e.g. 0.2500 KG)
  costPriceSnapshot: number;
  lossAmount: number;
  reason: string;
  note?: string | null;
  recordedAt: string;
  product?: {
    id: string;
    name: string;
    banglaName?: string | null;
    baseUnitName: string;
  };
}

export interface CreateProductDTO {
  name: string;
  banglaName?: string;
  category?: string;
  sku?: string;
  barcode?: string;
  baseUnitName: string;
  currentPurchasePrice: number;
  retailPrice: number;
  wholesalePrice: number;
  stockQuantity?: number;
  lowStockAlert?: number;
  units?: Array<{
    unitName: string;
    conversionFactor: number;
    retailPrice?: number;
    wholesalePrice?: number;
    isDefault?: boolean;
  }>;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface UpdateProductPricesDTO {
  currentPurchasePrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
}

export interface AddProductUnitDTO {
  unitName: string;
  conversionFactor: number;
  retailPrice?: number;
  wholesalePrice?: number;
  isDefault?: boolean;
}

export interface RecordWastageDTO {
  quantity: number; // in baseUnit (4-decimal precision)
  reason: string;
  note?: string;
}

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}
