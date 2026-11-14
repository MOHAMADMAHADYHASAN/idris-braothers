/**
 * Product & Dynamic Unit Types
 * Strictly aligned with Idris Brothers Grocery & Spice Store Retail ERP Architecture
 */

export interface UnitMaster {
  id: string;
  name: string; // e.g. "কেজি", "গ্রাম", "প্যাকেট", "পিস", "বোতল", "লিটার", "বস্তা", "কার্টন", "পাল্লা", "টিন"
  banglaName?: string | null;
  category?: string | null; // "WEIGHT", "VOLUME", "COUNT", "PACKAGING", "OTHER"
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryQuickSize {
  label: string;
  baseUnitName: string;
  allowDecimalQty: boolean;
  skuSuffix?: string;
}

export interface CategorySuggestedUnit {
  unitName: string;
  conversionFactor: number;
}

export interface CategoryPresetConfig {
  defaultBaseUnit?: string;
  allowDecimal?: boolean;
  quickSizes?: CategoryQuickSize[];
  suggestedUnits?: CategorySuggestedUnit[];
  attributeKeys?: string[];
}

export interface Category {
  id: string;
  name: string;
  banglaName?: string | null;
  slug: string;
  parentId?: string | null;
  children?: Category[];
  presetConfig?: CategoryPresetConfig | null;
}

export interface Brand {
  id: string;
  name: string;
  banglaName?: string | null;
}

export interface VariantUnit {
  id: string;
  variantId: string;
  unitName: string; // e.g. "৫০ কেজি বস্তা", "৫ কেজি পাল্লা", "কার্টন (২৪ প্যাকেট)"
  conversionFactor: number; // e.g. 50, 5, 24
  retailPrice?: number | null;
  wholesalePrice?: number | null;
  barcode?: string | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Aliased for backward compatibility with existing code
export type ProductUnit = VariantUnit;

export interface ProductVariant {
  id: string;
  productId: string;
  variantName: string; // "Default" for simple product, or "৫০০ গ্রাম", "১ কেজি", "দেশি"
  sku: string;
  barcode?: string | null;
  baseUnitName: string; // Dynamic string e.g. "কেজি", "প্যাকেট", "লিটার"
  allowDecimalQty: boolean; // true = loose weighable (চাল, ডাল, এলাচ), false = sealed packets/bottles
  attributes?: Record<string, any>;
  stockQuantity: number; // 4-decimal precision
  lowStockAlert: number;
  currentPurchasePrice: number; // Replacement cost per base unit
  retailPrice: number; // Retail price per base unit
  wholesalePrice: number; // Wholesale price per base unit
  isActive: boolean;
  units?: VariantUnit[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  banglaName?: string | null;
  description?: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string; banglaName?: string | null } | null;
  brandId?: string | null;
  brand?: { id: string; name: string; banglaName?: string | null } | null;
  hasVariants: boolean;
  isActive: boolean;
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;

  // Flattened convenience getters for simple products (or primary variant)
  sku?: string | null;
  barcode?: string | null;
  baseUnitName: string;
  stockQuantity: number;
  lowStockAlert: number;
  currentPurchasePrice: number;
  retailPrice: number;
  wholesalePrice: number;
  units?: VariantUnit[];
}

export interface StockWastage {
  id: string;
  variantId: string;
  quantity: number; // 4 decimals (e.g. 0.2500 KG)
  costPriceSnapshot: number;
  lossAmount: number;
  reason: string;
  note?: string | null;
  recordedAt: string;
  variant?: {
    id: string;
    variantName: string;
    baseUnitName: string;
    sku: string;
    product?: {
      id: string;
      name: string;
      banglaName?: string | null;
    };
  };
}

export interface CreateVariantDTO {
  variantName: string;
  sku?: string;
  barcode?: string;
  baseUnitName: string;
  allowDecimalQty?: boolean;
  attributes?: Record<string, any>;
  stockQuantity?: number;
  lowStockAlert?: number;
  currentPurchasePrice: number;
  retailPrice: number;
  wholesalePrice: number;
  units?: Array<{
    unitName: string;
    conversionFactor: number;
    retailPrice?: number;
    wholesalePrice?: number;
    barcode?: string;
    isDefault?: boolean;
  }>;
}

export interface CreateProductDTO {
  name: string;
  banglaName?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  hasVariants?: boolean;

  // For Simple Products (hasVariants: false)
  sku?: string;
  barcode?: string;
  baseUnitName?: string;
  allowDecimalQty?: boolean;
  attributes?: Record<string, any>;
  stockQuantity?: number;
  lowStockAlert?: number;
  currentPurchasePrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  units?: Array<{
    unitName: string;
    conversionFactor: number;
    retailPrice?: number;
    wholesalePrice?: number;
    barcode?: string;
    isDefault?: boolean;
  }>;

  // For Variable Products (hasVariants: true)
  variants?: CreateVariantDTO[];
}

export interface UpdateProductDTO {
  name?: string;
  banglaName?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;

  // For Simple Products (hasVariants: false)
  sku?: string;
  barcode?: string;
  baseUnitName?: string;
  allowDecimalQty?: boolean;
  attributes?: Record<string, any>;
  stockQuantity?: number;
  lowStockAlert?: number;
  currentPurchasePrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  units?: Array<{
    unitName: string;
    conversionFactor: number;
    retailPrice?: number;
    wholesalePrice?: number;
    barcode?: string;
    isDefault?: boolean;
  }>;

  // For Variable Products (hasVariants: true)
  variants?: Array<{
    id?: string;
    variantName: string;
    sku?: string;
    barcode?: string;
    baseUnitName?: string;
    allowDecimalQty?: boolean;
    attributes?: Record<string, any>;
    stockQuantity?: number;
    lowStockAlert?: number;
    currentPurchasePrice: number;
    retailPrice: number;
    wholesalePrice: number;
    isActive?: boolean;
    units?: Array<{
      unitName: string;
      conversionFactor: number;
      retailPrice?: number;
      wholesalePrice?: number;
      barcode?: string;
      isDefault?: boolean;
    }>;
  }>;
}

export interface UpdateVariantDTO {
  variantName?: string;
  sku?: string;
  barcode?: string;
  baseUnitName?: string;
  allowDecimalQty?: boolean;
  attributes?: Record<string, any>;
  stockQuantity?: number;
  lowStockAlert?: number;
  currentPurchasePrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  isActive?: boolean;
}

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
  barcode?: string;
  isDefault?: boolean;
}

export interface RecordWastageDTO {
  variantId?: string;
  quantity: number; // in baseUnit (4-decimal precision)
  reason: string;
  note?: string;
}

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  lowStockOnly?: boolean;
}

export interface FormUnitItem {
  id?: string;
  unitName: string;
  conversionFactor: string;
  wholesalePrice: string;
  retailPrice: string;
  barcode?: string;
}
