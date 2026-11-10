import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { posService } from './pos.service';
import {
  SaleType,
  CartItem,
  CustomerOption,
  CreateSalePayload,
  SaleInvoiceReceipt,
  ThermalReceiptData,
} from './pos.types';
import { Product, ProductUnit, ProductVariant } from '../product/product.types';

interface PosState {
  // Billing Mode
  saleType: SaleType;
  
  // Cart State
  cart: CartItem[];
  
  // Customer & Payment
  selectedCustomer: CustomerOption | null;
  discount: number;
  paidAmount: number;
  note: string;
  
  // UI & Submission
  isSubmitting: boolean;
  error: string | null;
  lastReceipt: SaleInvoiceReceipt | null;
  thermalReceipt: ThermalReceiptData | null;

  // Actions
  setSaleType: (type: SaleType) => void;
  addItem: (product: Product, variant?: ProductVariant, unit?: ProductUnit, quantity?: number) => void;
  addReversePriceItem: (product: Product, customTotalPrice: number, variant?: ProductVariant) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateUnitPrice: (itemId: string, price: number) => void;
  resetCustomPrice: (itemId: string) => void;
  updateUnit: (itemId: string, product: Product, unit: ProductUnit, variant?: ProductVariant) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  
  setSelectedCustomer: (customer: CustomerOption | null) => void;
  setDiscount: (discount: number) => void;
  setPaidAmount: (paidAmount: number) => void;
  setNote: (note: string) => void;
  
  // Computed Calculations
  getSubTotal: () => number;
  getGrandTotal: () => number;
  getInvoiceDue: () => number;
  getClosingCustomerDue: () => number;
  getChangeAmount: () => number;
  
  // Checkout
  submitSale: () => Promise<SaleInvoiceReceipt>;
  fetchThermalReceipt: (saleId: string) => Promise<ThermalReceiptData>;
  resetSaleSession: () => void;
  clearError: () => void;
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      saleType: 'RETAIL',
      cart: [],
      selectedCustomer: null,
      discount: 0,
      paidAmount: 0,
      note: '',
      isSubmitting: false,
      error: null,
      lastReceipt: null,
      thermalReceipt: null,

      setSaleType: (saleType) => {
        set((state) => {
          const isRetail = saleType === 'RETAIL';
          const updatedCart = state.cart.map((item) => {
            if (item.isReverseCalculated || item.isCustomPrice) {
              return item;
            }
            const nextUnitPrice = isRetail
              ? (item.retailUnitPrice ?? item.unitPrice)
              : (item.wholesaleUnitPrice ?? item.unitPrice);
            return {
              ...item,
              unitPrice: nextUnitPrice,
              subTotal: parseFloat((item.quantity * nextUnitPrice).toFixed(2)),
            };
          });

          return { saleType, cart: updatedCart };
        });
      },

      addItem: (product, variant, unit, quantity = 1) => {
        set((state) => {
          const isRetail = state.saleType === 'RETAIL';
          const targetVariant = variant || product.variants?.[0];
          const baseUnitName = targetVariant?.baseUnitName || product.baseUnitName || 'কেজি';
          const allowDecimalQty = targetVariant ? targetVariant.allowDecimalQty : true;
          const unitName = unit ? unit.unitName : baseUnitName;
          const factor = unit ? unit.conversionFactor : 1;

          const baseRetail = targetVariant?.retailPrice ?? product.retailPrice;
          const baseWholesale = targetVariant?.wholesalePrice ?? product.wholesalePrice;
          const baseCost = targetVariant?.currentPurchasePrice ?? product.currentPurchasePrice;

          const retailUnitPrice = unit
            ? (unit.retailPrice ?? parseFloat((baseRetail * factor).toFixed(2)))
            : baseRetail;
          const wholesaleUnitPrice = unit
            ? (unit.wholesalePrice ?? parseFloat((baseWholesale * factor).toFixed(2)))
            : baseWholesale;
          const unitPrice = isRetail ? retailUnitPrice : wholesaleUnitPrice;

          const safeQty = allowDecimalQty ? quantity : Math.max(1, Math.round(quantity));
          const keyPrefix = targetVariant?.id || product.id;
          const cartItemId = `${keyPrefix}_${unitName}`;
          const existingIndex = state.cart.findIndex((i) => i.id === cartItemId && !i.isReverseCalculated);

          if (existingIndex > -1) {
            const newCart = [...state.cart];
            const existing = newCart[existingIndex];
            const newQty = allowDecimalQty
              ? parseFloat((existing.quantity + safeQty).toFixed(4))
              : Math.round(existing.quantity + safeQty);
            newCart[existingIndex] = {
              ...existing,
              quantity: newQty,
              baseQuantity: parseFloat((newQty * factor).toFixed(4)),
              subTotal: parseFloat((newQty * existing.unitPrice).toFixed(2)),
            };
            return { cart: newCart, error: null };
          }

          const newItem: CartItem = {
            id: cartItemId,
            productId: product.id,
            variantId: targetVariant?.id,
            productName: product.name,
            banglaName: product.banglaName,
            variantName:
              targetVariant?.variantName && targetVariant.variantName !== 'Default'
                ? targetVariant.variantName
                : null,
            allowDecimalQty,
            sku: targetVariant?.sku ?? product.sku,
            barcode: targetVariant?.barcode ?? product.barcode,
            baseUnitName,
            selectedUnitName: unitName,
            conversionFactor: factor,
            retailUnitPrice,
            wholesaleUnitPrice,
            unitPrice,
            isCustomPrice: false,
            costPriceSnapshot: baseCost,
            quantity: safeQty,
            baseQuantity: parseFloat((safeQty * factor).toFixed(4)),
            isReverseCalculated: false,
            subTotal: parseFloat((safeQty * unitPrice).toFixed(2)),
          };

          return { cart: [newItem, ...state.cart], error: null };
        });
      },

      /**
       * Reverse Price-to-Weight calculation ("টাকার অংকে বিক্রি").
       */
      addReversePriceItem: (product, customTotalPrice, variant) => {
        if (!customTotalPrice || customTotalPrice <= 0) return;

        set((state) => {
          const isRetail = state.saleType === 'RETAIL';
          const targetVariant = variant || product.variants?.[0];
          const baseUnitName = targetVariant?.baseUnitName || product.baseUnitName || 'কেজি';
          const baseRetail = targetVariant?.retailPrice ?? product.retailPrice;
          const baseWholesale = targetVariant?.wholesalePrice ?? product.wholesalePrice;
          const baseCost = targetVariant?.currentPurchasePrice ?? product.currentPurchasePrice;
          const unitPrice = isRetail ? baseRetail : baseWholesale;

          const baseQuantity = parseFloat((customTotalPrice / unitPrice).toFixed(4));
          const keyPrefix = targetVariant?.id || product.id;
          const cartItemId = `${keyPrefix}_reverse_${Date.now()}`;

          const newItem: CartItem = {
            id: cartItemId,
            productId: product.id,
            variantId: targetVariant?.id,
            productName: product.name,
            banglaName: product.banglaName,
            variantName:
              targetVariant?.variantName && targetVariant.variantName !== 'Default'
                ? targetVariant.variantName
                : null,
            allowDecimalQty: true,
            sku: targetVariant?.sku ?? product.sku,
            barcode: targetVariant?.barcode ?? product.barcode,
            baseUnitName,
            selectedUnitName: baseUnitName,
            conversionFactor: 1,
            retailUnitPrice: baseRetail,
            wholesaleUnitPrice: baseWholesale,
            unitPrice,
            isCustomPrice: false,
            costPriceSnapshot: baseCost,
            quantity: 1,
            baseQuantity,
            isReverseCalculated: true,
            customTotalPrice,
            subTotal: customTotalPrice,
          };

          return { cart: [newItem, ...state.cart], error: null };
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (isNaN(quantity) || quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.id !== itemId) return item;
            const safeQty = item.allowDecimalQty === false
              ? Math.max(1, Math.round(quantity))
              : parseFloat(quantity.toFixed(4));
            return {
              ...item,
              quantity: safeQty,
              baseQuantity: parseFloat((safeQty * item.conversionFactor).toFixed(4)),
              subTotal: parseFloat((safeQty * item.unitPrice).toFixed(2)),
            };
          }),
        }));
      },

      updateUnitPrice: (itemId, price) => {
        if (isNaN(price) || price <= 0) return;
        const safePrice = parseFloat(price.toFixed(2));
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.id !== itemId || item.isReverseCalculated) return item;
            return {
              ...item,
              unitPrice: safePrice,
              isCustomPrice: true,
              subTotal: parseFloat((item.quantity * safePrice).toFixed(2)),
            };
          }),
        }));
      },

      resetCustomPrice: (itemId) => {
        set((state) => {
          const isRetail = state.saleType === 'RETAIL';
          return {
            cart: state.cart.map((item) => {
              if (item.id !== itemId || item.isReverseCalculated) return item;
              const restoredPrice = isRetail
                ? (item.retailUnitPrice ?? item.unitPrice)
                : (item.wholesaleUnitPrice ?? item.unitPrice);
              return {
                ...item,
                unitPrice: restoredPrice,
                isCustomPrice: false,
                subTotal: parseFloat((item.quantity * restoredPrice).toFixed(2)),
              };
            }),
          };
        });
      },

      updateUnit: (itemId, product, unit, variant) => {
        set((state) => {
          const isRetail = state.saleType === 'RETAIL';
          const targetVariant = variant || product.variants?.[0];
          const baseRetail = targetVariant?.retailPrice ?? product.retailPrice;
          const baseWholesale = targetVariant?.wholesalePrice ?? product.wholesalePrice;
          const factor = unit.conversionFactor;
          const retailUnitPrice = unit.retailPrice ?? parseFloat((baseRetail * factor).toFixed(2));
          const wholesaleUnitPrice = unit.wholesalePrice ?? parseFloat((baseWholesale * factor).toFixed(2));
          const unitPrice = isRetail ? retailUnitPrice : wholesaleUnitPrice;

          return {
            cart: state.cart.map((item) => {
              if (item.id !== itemId) return item;
              return {
                ...item,
                selectedUnitName: unit.unitName,
                conversionFactor: factor,
                retailUnitPrice,
                wholesaleUnitPrice,
                unitPrice,
                isCustomPrice: false,
                baseQuantity: parseFloat((item.quantity * factor).toFixed(4)),
                subTotal: parseFloat((item.quantity * unitPrice).toFixed(2)),
              };
            }),
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          cart: state.cart.filter((i) => i.id !== itemId),
        }));
      },

      clearCart: () => {
        set({ cart: [], discount: 0, paidAmount: 0, note: '', error: null });
      },

      setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
      setDiscount: (discount) => set({ discount: Math.max(0, discount) }),
      setPaidAmount: (paidAmount) => set({ paidAmount: Math.max(0, paidAmount) }),
      setNote: (note) => set({ note }),

      // Computed Totals
      getSubTotal: () => {
        return parseFloat(
          get()
            .cart.reduce((sum, item) => sum + item.subTotal, 0)
            .toFixed(2)
        );
      },

      getGrandTotal: () => {
        const sub = get().getSubTotal();
        const disc = get().discount || 0;
        return Math.max(0, parseFloat((sub - disc).toFixed(2)));
      },

      getInvoiceDue: () => {
        const grand = get().getGrandTotal();
        const paid = get().paidAmount || 0;
        return Math.max(0, parseFloat((grand - paid).toFixed(2)));
      },

      getClosingCustomerDue: () => {
        const previousDue = get().selectedCustomer?.currentDue || 0;
        const grand = get().getGrandTotal();
        const paid = get().paidAmount || 0;
        // previousDue + grandTotal - cashReceived = new balance
        return parseFloat((previousDue + grand - paid).toFixed(2));
      },

      getChangeAmount: () => {
        const grand = get().getGrandTotal();
        const paid = get().paidAmount || 0;
        return paid > grand ? parseFloat((paid - grand).toFixed(2)) : 0;
      },

      // Checkout Submission
      submitSale: async () => {
        const state = get();
        if (state.cart.length === 0) {
          throw new Error('কার্ট খালি! বিক্রির জন্য পণ্য যোগ করুন।');
        }

        set({ isSubmitting: true, error: null });

        try {
          const payload: CreateSalePayload = {
            saleType: state.saleType,
            customerId: state.selectedCustomer?.id || null,
            discount: state.discount,
            paidAmount: state.paidAmount,
            note: state.note || undefined,
            items: state.cart.map((item) => {
              if (item.isReverseCalculated) {
                return {
                  variantId: item.variantId,
                  productId: item.productId,
                  unitName: item.selectedUnitName,
                  conversionFactor: item.conversionFactor,
                  unitPrice: item.unitPrice,
                  customTotalPrice: item.customTotalPrice,
                };
              }
              return {
                variantId: item.variantId,
                productId: item.productId,
                unitName: item.selectedUnitName,
                conversionFactor: item.conversionFactor,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              };
            }),
          };

          const invoice = await posService.createSale(payload);
          
          // Clear active cart and save last receipt
          set({
            cart: [],
            discount: 0,
            paidAmount: 0,
            note: '',
            selectedCustomer: null,
            lastReceipt: invoice,
            isSubmitting: false,
            error: null,
          });

          return invoice;
        } catch (err: any) {
          set({ error: err.message || 'বিক্রি সম্পন্ন করতে ব্যর্থ হয়েছে', isSubmitting: false });
          throw err;
        }
      },

      fetchThermalReceipt: async (saleId: string) => {
        if (!saleId) {
          throw new Error('মেমো আইডি পাওয়া যায়নি');
        }
        try {
          const thermalReceipt = await posService.getReceipt(saleId);
          set({ thermalReceipt, error: null });
          return thermalReceipt;
        } catch (err: any) {
          console.error('Failed to load thermal receipt:', err);
          throw err;
        }
      },

      resetSaleSession: () => {
        set({
          cart: [],
          selectedCustomer: null,
          discount: 0,
          paidAmount: 0,
          note: '',
          error: null,
          lastReceipt: null,
          thermalReceipt: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'idris-pos-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        saleType: state.saleType,
        selectedCustomer: state.selectedCustomer,
        discount: state.discount,
        note: state.note,
      }),
    }
  )
);
