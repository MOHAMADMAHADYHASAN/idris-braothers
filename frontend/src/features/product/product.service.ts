import { apiClient, ApiResponse, PaginationMeta } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { parseDecimal } from '@/lib/decimal';
import {
  Product,
  ProductUnit,
  UnitMaster,
  StockWastage,
  CreateProductDTO,
  UpdateProductDTO,
  UpdateProductPricesDTO,
  AddProductUnitDTO,
  RecordWastageDTO,
  ProductFilterParams,
} from './product.types';

/**
 * Sanitizes backend product object by parsing Prisma Decimal strings into TypeScript numbers.
 */
function sanitizeProduct(raw: any): Product {
  return {
    ...raw,
    stockQuantity: parseDecimal(raw.stockQuantity, 0),
    lowStockAlert: parseDecimal(raw.lowStockAlert, 10),
    currentPurchasePrice: parseDecimal(raw.currentPurchasePrice, 0),
    retailPrice: parseDecimal(raw.retailPrice, 0),
    wholesalePrice: parseDecimal(raw.wholesalePrice, 0),
    units: raw.units?.map((u: any): ProductUnit => ({
      ...u,
      conversionFactor: parseDecimal(u.conversionFactor, 1),
      retailPrice: u.retailPrice !== null && u.retailPrice !== undefined ? parseDecimal(u.retailPrice) : null,
      wholesalePrice: u.wholesalePrice !== null && u.wholesalePrice !== undefined ? parseDecimal(u.wholesalePrice) : null,
      isDefault: Boolean(u.isDefault),
    })) || [],
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
    const res = await apiClient.get<any[]>(API_ENDPOINTS.PRODUCTS.BASE, params);
    return {
      products: (res.data || []).map(sanitizeProduct),
      meta: res.meta,
    };
  }

  async getProductById(id: string): Promise<Product> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return sanitizeProduct(res.data);
  }

  async getProductByBarcode(barcode: string): Promise<Product> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.BY_BARCODE(barcode));
    return sanitizeProduct(res.data);
  }

  async createProduct(dto: CreateProductDTO): Promise<Product> {
    const res = await apiClient.post<any>(API_ENDPOINTS.PRODUCTS.BASE, dto);
    return sanitizeProduct(res.data);
  }

  async updateProduct(id: string, dto: UpdateProductDTO): Promise<Product> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.PRODUCTS.BY_ID(id), dto);
    return sanitizeProduct(res.data);
  }

  async updatePrices(id: string, dto: UpdateProductPricesDTO): Promise<Product> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.PRODUCTS.PRICES(id), dto);
    return sanitizeProduct(res.data);
  }

  async addProductUnit(productId: string, dto: AddProductUnitDTO): Promise<ProductUnit> {
    const res = await apiClient.post<any>(API_ENDPOINTS.PRODUCTS.ADD_UNIT(productId), dto);
    return {
      ...res.data,
      conversionFactor: parseDecimal(res.data.conversionFactor, 1),
      retailPrice: res.data.retailPrice ? parseDecimal(res.data.retailPrice) : null,
      wholesalePrice: res.data.wholesalePrice ? parseDecimal(res.data.wholesalePrice) : null,
    };
  }

  async deleteProductUnit(unitId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE_UNIT(unitId));
  }

  async recordWastage(productId: string, dto: RecordWastageDTO): Promise<StockWastage> {
    const res = await apiClient.post<any>(API_ENDPOINTS.PRODUCTS.RECORD_WASTAGE(productId), dto);
    return sanitizeWastage(res.data);
  }

  async getWastageHistory(params?: { page?: number; limit?: number; productId?: string }): Promise<{
    wastages: StockWastage[];
    meta?: PaginationMeta;
  }> {
    const res = await apiClient.get<any[]>(API_ENDPOINTS.PRODUCTS.WASTAGES, params);
    return {
      wastages: (res.data || []).map(sanitizeWastage),
      meta: res.meta,
    };
  }

  // Unit Master Management
  async getUnitMasterList(): Promise<UnitMaster[]> {
    const res = await apiClient.get<UnitMaster[]>(API_ENDPOINTS.UNITS.BASE);
    return res.data || [];
  }

  async createUnitMaster(dto: { name: string; banglaName?: string; category?: string }): Promise<UnitMaster> {
    const res = await apiClient.post<UnitMaster>(API_ENDPOINTS.UNITS.BASE, dto);
    return res.data;
  }
}

export const productService = new ProductService();
