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
import { Product, ProductUnit } from '../product/product.types';

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
  addItem: (product: Product, unit?: ProductUnit, quantity?: number) => void;
  addReversePriceItem: (product: Product, customTotalPrice: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateUnit: (itemId: string, product: Product, unit: ProductUnit) => void;
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
          // Re-evaluate cart items pricing under the new saleType
          const updatedCart = state.cart.map((item) => {
            if (item.isReverseCalculated) {
              return item;
            }
            return {
              ...item,
              // When mode changes, recalculate subTotal based on updated rate
              subTotal: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
            };
          });

          return { saleType, cart: updatedCart };
        });
      },

      addItem: (product, unit, quantity = 1) => {
        set((state) => {
          const isRetail = state.saleType === 'RETAIL';
          const unitName = unit ? unit.unitName : product.baseUnitName;
          const factor = unit ? unit.conversionFactor : 1;
          
          let unitPrice = 0;
          if (unit) {
            unitPrice = isRetail
              ? (unit.retailPrice ?? product.retailPrice * factor)
              : (unit.wholesalePrice ?? product.wholesalePrice * factor);
          } else {
            unitPrice = isRetail ? product.retailPrice : product.wholesalePrice;
          }

          const cartItemId = `${product.id}_${unitName}`;
          const existingIndex = state.cart.findIndex((i) => i.id === cartItemId && !i.isReverseCalculated);

          if (existingIndex > -1) {
            // Increment existing item
            const newCart = [...state.cart];
            const existing = newCart[existingIndex];
            const newQty = existing.quantity + quantity;
            newCart[existingIndex] = {
              ...existing,
              quantity: newQty,
              baseQuantity: parseFloat((newQty * factor).toFixed(4)),
              subTotal: parseFloat((newQty * unitPrice).toFixed(2)),
            };
            return { cart: newCart, error: null };
          }

          // Add new item to cart
          const newItem: CartItem = {
            id: cartItemId,
            productId: product.id,
            productName: product.name,
            banglaName: product.banglaName,
            sku: product.sku,
            barcode: product.barcode,
            baseUnitName: product.baseUnitName,
            selectedUnitName: unitName,
            conversionFactor: factor,
            unitPrice,
            costPriceSnapshot: product.currentPurchasePrice,
            quantity,
            baseQuantity: parseFloat((quantity * factor).toFixed(4)),
            isReverseCalculated: false,
            subTotal: parseFloat((quantity * unitPrice).toFixed(2)),
          };

          return { cart: [newItem, ...state.cart], error: null };
        });
      },

      /**
       * Reverse Price-to-Weight calculation ("২০ টাকার এলাচ বিক্রি").
       * When a customer asks for ৳20 worth of Cardamom:
       * baseQuantity = 20 / unitPrice (to 4 decimal places).
       */
      addReversePriceItem: (product, customTotalPrice) => {
        if (!customTotalPrice || customTotalPrice <= 0) return;

        set((state) => {
          const isRetail = state.saleType === 'RETAIL';
          const unitPrice = isRetail ? product.retailPrice : product.wholesalePrice;
          
          // Calculate exact micro-weight to 4 decimal places
          const baseQuantity = parseFloat((customTotalPrice / unitPrice).toFixed(4));
          const cartItemId = `${product.id}_reverse_${Date.now()}`;

          const newItem: CartItem = {
            id: cartItemId,
            productId: product.id,
            productName: product.name,
            banglaName: product.banglaName,
            sku: product.sku,
            barcode: product.barcode,
            baseUnitName: product.baseUnitName,
            selectedUnitName: product.baseUnitName,
            conversionFactor: 1,
            unitPrice,
            costPriceSnapshot: product.currentPurchasePrice,
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
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              quantity,
              baseQuantity: parseFloat((quantity * item.conversionFactor).toFixed(4)),
              subTotal: parseFloat((quantity * item.unitPrice).toFixed(2)),
            };
          }),
        }));
      },

      updateUnit: (itemId, product, unit) => {
        set((state) => {
          const isRetail = state.saleType === 'RETAIL';
          const factor = unit.conversionFactor;
          const unitPrice = isRetail
            ? (unit.retailPrice ?? product.retailPrice * factor)
            : (unit.wholesalePrice ?? product.wholesalePrice * factor);

          return {
            cart: state.cart.map((item) => {
              if (item.id !== itemId) return item;
              return {
                ...item,
                selectedUnitName: unit.unitName,
                conversionFactor: factor,
                unitPrice,
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
                  productId: item.productId,
                  unitName: item.selectedUnitName,
                  conversionFactor: item.conversionFactor,
                  customTotalPrice: item.customTotalPrice,
                };
              }
              return {
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
          });

          return invoice;
        } catch (err: any) {
          set({ error: err.message || 'বিক্রি সম্পন্ন করতে ব্যর্থ হয়েছে', isSubmitting: false });
          throw err;
        }
      },

      fetchThermalReceipt: async (saleId: string) => {
        try {
          const thermalReceipt = await posService.getReceipt(saleId);
          set({ thermalReceipt });
          return thermalReceipt;
        } catch (err: any) {
          set({ error: err.message });
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
