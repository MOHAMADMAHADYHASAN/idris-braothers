import { apiClient, ApiResponse, PaginationMeta } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { parseDecimal } from '@/lib/decimal';
import {
  Product,
  ProductVariant,
  VariantUnit,
  Category,
  Brand,
  UnitMaster,
  StockWastage,
  CreateProductDTO,
  UpdateProductDTO,
  UpdateVariantDTO,
  UpdateProductPricesDTO,
  AddProductUnitDTO,
  RecordWastageDTO,
  ProductFilterParams,
} from './product.types';

function sanitizeUnit(raw: any): VariantUnit {
  return {
    ...raw,
    conversionFactor: parseDecimal(raw.conversionFactor, 1),
    retailPrice: raw.retailPrice !== null && raw.retailPrice !== undefined ? parseDecimal(raw.retailPrice) : null,
    wholesalePrice: raw.wholesalePrice !== null && raw.wholesalePrice !== undefined ? parseDecimal(raw.wholesalePrice) : null,
    isDefault: Boolean(raw.isDefault),
  };
}

function sanitizeVariant(raw: any): ProductVariant {
  return {
    ...raw,
    stockQuantity: parseDecimal(raw.stockQuantity, 0),
    lowStockAlert: parseDecimal(raw.lowStockAlert, 10),
    currentPurchasePrice: parseDecimal(raw.currentPurchasePrice, 0),
    retailPrice: parseDecimal(raw.retailPrice, 0),
    wholesalePrice: parseDecimal(raw.wholesalePrice, 0),
    allowDecimalQty: raw.allowDecimalQty !== undefined ? Boolean(raw.allowDecimalQty) : true,
    attributes: raw.attributes || {},
    units: (raw.units || []).map(sanitizeUnit),
  };
}

/**
 * Sanitizes backend product object by parsing Prisma Decimal strings into TypeScript numbers.
 * Also populates convenience top-level fields from the primary/default variant for zero-friction UI.
 */
function sanitizeProduct(raw: any): Product {
  const sanitizedVariants = (raw.variants || []).map(sanitizeVariant);
  const primaryVariant = sanitizedVariants[0];

  const totalStock = sanitizedVariants.reduce((sum: number, v: ProductVariant) => sum + v.stockQuantity, 0);

  return {
    ...raw,
    hasVariants: Boolean(raw.hasVariants),
    isActive: Boolean(raw.isActive),
    variants: sanitizedVariants,

    // Convenience flattened fields (from primary variant or aggregated)
    sku: primaryVariant?.sku || null,
    barcode: primaryVariant?.barcode || null,
    baseUnitName: primaryVariant?.baseUnitName || 'কেজি',
    stockQuantity: totalStock,
    lowStockAlert: primaryVariant?.lowStockAlert || 10,
    currentPurchasePrice: primaryVariant?.currentPurchasePrice || 0,
    retailPrice: primaryVariant?.retailPrice || 0,
    wholesalePrice: primaryVariant?.wholesalePrice || 0,
    units: primaryVariant?.units || [],
  };
}

function sanitizeWastage(raw: any): StockWastage {
  return {
    ...raw,
    quantity: parseDecimal(raw.quantity, 0),
    costPriceSnapshot: parseDecimal(raw.costPriceSnapshot, 0),
    lossAmount: parseDecimal(raw.lossAmount, 0),
  };
}

class ProductService {
  async getProducts(params?: ProductFilterParams): Promise<{ products: Product[]; meta?: PaginationMeta }> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.BASE, params);
    const dataList = res.data?.products || res.data || [];
    return {
      products: dataList.map(sanitizeProduct),
      meta: res.data?.meta || res.meta,
    };
  }

  async getProductById(id: string): Promise<Product> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return sanitizeProduct(res.data);
  }

  async getVariantById(variantId: string): Promise<ProductVariant> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.VARIANT_BY_ID(variantId));
    return sanitizeVariant(res.data);
  }

  async getProductByBarcode(barcode: string): Promise<{ variant: ProductVariant; matchedUnit?: VariantUnit }> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.BY_BARCODE(barcode));
    return {
      variant: sanitizeVariant(res.data.variant),
      matchedUnit: res.data.matchedUnit ? sanitizeUnit(res.data.matchedUnit) : undefined,
    };
  }

  async createProduct(dto: CreateProductDTO): Promise<Product> {
    const res = await apiClient.post<any>(API_ENDPOINTS.PRODUCTS.BASE, dto);
    return sanitizeProduct(res.data);
  }

  async updateProduct(id: string, dto: UpdateProductDTO): Promise<Product> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.PRODUCTS.BY_ID(id), dto);
    return sanitizeProduct(res.data);
  }

  async updateVariant(variantId: string, dto: UpdateVariantDTO): Promise<ProductVariant> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.PRODUCTS.VARIANT_BY_ID(variantId), dto);
    return sanitizeVariant(res.data);
  }

  async deleteVariant(variantId: string): Promise<{ success: boolean; deactivated?: boolean }> {
    const res = await apiClient.delete<any>(API_ENDPOINTS.PRODUCTS.VARIANT_BY_ID(variantId));
    return res.data;
  }

  async updatePrices(id: string, dto: UpdateProductPricesDTO): Promise<ProductVariant> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.PRODUCTS.PRICES(id), dto);
    return sanitizeVariant(res.data);
  }

  async addProductUnit(targetId: string, dto: AddProductUnitDTO): Promise<VariantUnit> {
    const res = await apiClient.post<any>(API_ENDPOINTS.PRODUCTS.ADD_UNIT(targetId), dto);
    return sanitizeUnit(res.data);
  }

  async deleteProductUnit(unitId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE_UNIT(unitId));
  }

  async recordWastage(targetId: string, dto: RecordWastageDTO): Promise<StockWastage> {
    const res = await apiClient.post<any>(API_ENDPOINTS.PRODUCTS.RECORD_WASTAGE(targetId), dto);
    return sanitizeWastage(res.data);
  }

  async getWastageHistory(params?: { page?: number; limit?: number; variantId?: string; productId?: string }): Promise<{
    wastages: StockWastage[];
    meta?: PaginationMeta;
  }> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.WASTAGES, params);
    const dataList = res.data?.wastages || res.data || [];
    return {
      wastages: dataList.map(sanitizeWastage),
      meta: res.data?.meta || res.meta,
    };
  }

  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<Category[]>(API_ENDPOINTS.PRODUCTS.CATEGORIES);
    return res.data || [];
  }

  async createCategory(dto: { name: string; banglaName?: string; parentId?: string }): Promise<Category> {
    const res = await apiClient.post<Category>(API_ENDPOINTS.PRODUCTS.CATEGORIES, dto);
    return res.data;
  }

  async getBrands(): Promise<Brand[]> {
    const res = await apiClient.get<Brand[]>(API_ENDPOINTS.PRODUCTS.BRANDS);
    return res.data || [];
  }

  async createBrand(dto: { name: string; banglaName?: string }): Promise<Brand> {
    const res = await apiClient.post<Brand>(API_ENDPOINTS.PRODUCTS.BRANDS, dto);
    return res.data;
  }

  async getUnits(): Promise<UnitMaster[]> {
    const res = await apiClient.get<UnitMaster[]>(API_ENDPOINTS.UNITS.BASE);
    return res.data || [];
  }
}

export const productService = new ProductService();
