import { create } from 'zustand';
import { productService } from './product.service';
import {
  Product,
  UnitMaster,
  StockWastage,
  CreateProductDTO,
  UpdateProductDTO,
  UpdateProductPricesDTO,
  AddProductUnitDTO,
  RecordWastageDTO,
  ProductFilterParams,
} from './product.types';
import { PaginationMeta } from '@/lib/apiClient';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  units: UnitMaster[];
  wastages: StockWastage[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;

  // Actions
  fetchProducts: (params?: ProductFilterParams) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchProductByBarcode: (barcode: string) => Promise<Product | null>;
  fetchUnits: () => Promise<void>;
  createProduct: (dto: CreateProductDTO) => Promise<Product>;
  updateProduct: (id: string, dto: UpdateProductDTO) => Promise<Product>;
  updatePrices: (id: string, dto: UpdateProductPricesDTO) => Promise<Product>;
  addCustomUnit: (productId: string, dto: AddProductUnitDTO) => Promise<void>;
  deleteCustomUnit: (productId: string, unitId: string) => Promise<void>;
  recordWastage: (productId: string, dto: RecordWastageDTO) => Promise<StockWastage>;
  fetchWastages: (params?: { page?: number; limit?: number; productId?: string }) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedProduct: (product: Product | null) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  units: [],
  wastages: [],
  pagination: null,
  isLoading: false,
  isSaving: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,

  fetchProducts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const mergedParams: ProductFilterParams = {
        search: get().searchQuery || undefined,
        category: get().selectedCategory || undefined,
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

  fetchProductByBarcode: async (barcode: string) => {
    try {
      const product = await productService.getProductByBarcode(barcode);
      return product;
    } catch (err: any) {
      return null;
    }
  },

  fetchUnits: async () => {
    try {
      const units = await productService.getUnitMasterList();
      set({ units });
    } catch (err: any) {
      console.error('Failed to load dynamic units:', err);
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
        products: state.products.map((p) => (p.id === id ? updated : p)),
        selectedProduct: state.selectedProduct?.id === id ? updated : state.selectedProduct,
        isSaving: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message, isSaving: false });
      throw err;
    }
  },

  updatePrices: async (id, dto) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await productService.updatePrices(id, dto);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
        selectedProduct: state.selectedProduct?.id === id ? updated : state.selectedProduct,
        isSaving: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message, isSaving: false });
      throw err;
    }
  },

  addCustomUnit: async (productId, dto) => {
    set({ isSaving: true, error: null });
    try {
      const newUnit = await productService.addProductUnit(productId, dto);
      set((state) => {
        const updateProductUnits = (p: Product) => {
          if (p.id !== productId) return p;
          return {
            ...p,
            units: [...(p.units || []), newUnit],
          };
        };

        return {
          products: state.products.map(updateProductUnits),
          selectedProduct: state.selectedProduct?.id === productId
            ? updateProductUnits(state.selectedProduct)
            : state.selectedProduct,
          isSaving: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message, isSaving: false });
      throw err;
    }
  },

  deleteCustomUnit: async (productId, unitId) => {
    try {
      await productService.deleteProductUnit(unitId);
      set((state) => {
        const removeUnit = (p: Product) => {
          if (p.id !== productId) return p;
          return {
            ...p,
            units: (p.units || []).filter((u) => u.id !== unitId),
          };
        };

        return {
          products: state.products.map(removeUnit),
          selectedProduct: state.selectedProduct?.id === productId
            ? removeUnit(state.selectedProduct)
            : state.selectedProduct,
        };
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  recordWastage: async (productId, dto) => {
    set({ isSaving: true, error: null });
    try {
      const wastage = await productService.recordWastage(productId, dto);
      // Deduct stock in state
      set((state) => ({
        products: state.products.map((p) =>
          p.id === productId ? { ...p, stockQuantity: p.stockQuantity - dto.quantity } : p
        ),
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
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  clearError: () => set({ error: null }),
}));
