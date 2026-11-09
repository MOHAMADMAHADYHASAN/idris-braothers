import { create } from 'zustand';
import { productService } from './product.service';
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
import { PaginationMeta } from '@/lib/apiClient';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  categories: Category[];
  brands: Brand[];
  units: UnitMaster[];
  wastages: StockWastage[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategoryId: string | null;
  selectedBrandId: string | null;
  lowStockOnly: boolean;

  // Actions
  fetchProducts: (params?: ProductFilterParams) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchVariantById: (variantId: string) => Promise<ProductVariant | null>;
  fetchProductByBarcode: (barcode: string) => Promise<{ variant: ProductVariant; matchedUnit?: VariantUnit } | null>;
  fetchMetadata: () => Promise<void>; // Fetch categories, brands, and units in parallel
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  fetchUnits: () => Promise<void>;
  createCategory: (dto: { name: string; banglaName?: string; parentId?: string }) => Promise<Category>;
  createBrand: (dto: { name: string; banglaName?: string }) => Promise<Brand>;
  deleteVariant: (variantId: string) => Promise<{ success: boolean; deactivated?: boolean }>;
  createProduct: (dto: CreateProductDTO) => Promise<Product>;
  updateProduct: (id: string, dto: UpdateProductDTO) => Promise<Product>;
  updateVariant: (variantId: string, dto: UpdateVariantDTO) => Promise<ProductVariant>;
  updatePrices: (id: string, dto: UpdateProductPricesDTO) => Promise<ProductVariant>;
  addCustomUnit: (targetId: string, dto: AddProductUnitDTO) => Promise<VariantUnit>;
  deleteCustomUnit: (unitId: string) => Promise<void>;
  recordWastage: (targetId: string, dto: RecordWastageDTO) => Promise<StockWastage>;
  fetchWastages: (params?: { page?: number; limit?: number; variantId?: string; productId?: string }) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
  setSelectedBrandId: (brandId: string | null) => void;
  setLowStockOnly: (lowStockOnly: boolean) => void;
  setSelectedProduct: (product: Product | null) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  categories: [],
  brands: [],
  units: [],
  wastages: [],
  pagination: null,
  isLoading: false,
  isSaving: false,
  error: null,
  searchQuery: '',
  selectedCategoryId: null,
  selectedBrandId: null,
  lowStockOnly: false,

  fetchProducts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const mergedParams: ProductFilterParams = {
        search: get().searchQuery || undefined,
        categoryId: get().selectedCategoryId || undefined,
        brandId: get().selectedBrandId || undefined,
        lowStockOnly: get().lowStockOnly || undefined,
        ...params,
      };
      const { products, meta } = await productService.getProducts(mergedParams);
      set({ products, pagination: meta || null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'পণ্য তালিকা লোড করতে সমস্যা হয়েছে', isLoading: false });
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const product = await productService.getProductById(id);
      set({ selectedProduct: product, isLoading: false });
      return product;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  fetchVariantById: async (variantId: string) => {
    try {
      return await productService.getVariantById(variantId);
    } catch (err: any) {
      return null;
    }
  },

  fetchProductByBarcode: async (barcode: string) => {
    try {
      return await productService.getProductByBarcode(barcode);
    } catch (err: any) {
      return null;
    }
  },

  fetchMetadata: async () => {
    try {
      const [categories, brands, units] = await Promise.all([
        productService.getCategories(),
        productService.getBrands(),
        productService.getUnits(),
      ]);
      set({ categories, brands, units });
    } catch (err: any) {
      console.error('Failed to load metadata (categories/brands/units):', err);
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await productService.getCategories();
      set({ categories });
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  },

  fetchBrands: async () => {
    try {
      const brands = await productService.getBrands();
      set({ brands });
    } catch (err: any) {
      console.error('Failed to load brands:', err);
    }
  },

  fetchUnits: async () => {
    try {
      const units = await productService.getUnits();
      set({ units });
    } catch (err: any) {
      console.error('Failed to load units:', err);
    }
  },

  createCategory: async (dto) => {
    try {
      const newCategory = await productService.createCategory(dto);
      set((state) => ({ categories: [...state.categories, newCategory] }));
      return newCategory;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  createBrand: async (dto) => {
    try {
      const newBrand = await productService.createBrand(dto);
      set((state) => ({ brands: [...state.brands, newBrand] }));
      return newBrand;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteVariant: async (variantId) => {
    try {
      const res = await productService.deleteVariant(variantId);
      await get().fetchProducts();
      return res;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  createProduct: async (dto) => {
    set({ isSaving: true, error: null });
    try {
      const newProduct = await productService.createProduct(dto);
      set((state) => ({
        products: [newProduct, ...state.products],
        isSaving: false,
      }));
      return newProduct;
    } catch (err: any) {
      set({ error: err.message, isSaving: false });
      throw err;
    }
  },

  updateProduct: async (id, dto) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await productService.updateProduct(id, dto);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        selectedProduct: state.selectedProduct?.id === id ? { ...state.selectedProduct, ...updated } : state.selectedProduct,
        isSaving: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message, isSaving: false });
      throw err;
    }
  },

  updateVariant: async (variantId, dto) => {
    set({ isSaving: true, error: null });
    try {
      const updatedVariant = await productService.updateVariant(variantId, dto);
      // Re-fetch products to ensure full parent-variant consistency
      await get().fetchProducts();
      set({ isSaving: false });
      return updatedVariant;
    } catch (err: any) {
      set({ error: err.message, isSaving: false });
      throw err;
    }
  },

  updatePrices: async (id, dto) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await productService.updatePrices(id, dto);
      await get().fetchProducts();
      set({ isSaving: false });
      return updated;
    } catch (err: any) {
      set({ error: err.message, isSaving: false });
      throw err;
    }
  },

  addCustomUnit: async (targetId, dto) => {
    set({ isSaving: true, error: null });
    try {
      const newUnit = await productService.addProductUnit(targetId, dto);
      await get().fetchProducts();
      set({ isSaving: false });
      return newUnit;
    } catch (err: any) {
      set({ error: err.message, isSaving: false });
      throw err;
    }
  },

  deleteCustomUnit: async (unitId) => {
    try {
      await productService.deleteProductUnit(unitId);
      await get().fetchProducts();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  recordWastage: async (targetId, dto) => {
    set({ isSaving: true, error: null });
    try {
      const wastage = await productService.recordWastage(targetId, dto);
      await get().fetchProducts();
      set((state) => ({
        wastages: [wastage, ...state.wastages],
        isSaving: false,
      }));
      return wastage;
    } catch (err: any) {
      set({ error: err.message, isSaving: false });
      throw err;
    }
  },

  fetchWastages: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { wastages } = await productService.getWastageHistory(params);
      set({ wastages, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setSelectedBrandId: (selectedBrandId) => set({ selectedBrandId }),
  setLowStockOnly: (lowStockOnly) => set({ lowStockOnly }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  clearError: () => set({ error: null }),
}));
