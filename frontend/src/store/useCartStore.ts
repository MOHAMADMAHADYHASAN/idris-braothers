import { create } from "zustand";
import { Product, CartItem, InvoiceReceipt } from "../types/pos";

interface CartState {
  cart: CartItem[];
  selectedCustomerId: string;
  discount: number;
  paidAmount: string;
  paymentMethod: string;
  receipt: InvoiceReceipt | null;
  activeTab: "pos" | "inventory" | "customers";

  // Actions
  addToCart: (product: Product) => { success: boolean; message?: string };
  updateQuantity: (productId: string, delta: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setSelectedCustomerId: (id: string) => void;
  setDiscount: (amount: number) => void;
  setPaidAmount: (amount: string) => void;
  setPaymentMethod: (method: string) => void;
  setReceipt: (receipt: InvoiceReceipt | null) => void;
  setActiveTab: (tab: "pos" | "inventory" | "customers") => void;

  // Computed values
  getSubTotal: () => number;
  getGrandTotal: () => number;
  getPaidValue: () => number;
  getDueAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  selectedCustomerId: "",
  discount: 0,
  paidAmount: "",
  paymentMethod: "CASH",
  receipt: null,
  activeTab: "pos",

  addToCart: (product: Product) => {
    if (product.stock <= 0) {
      return { success: false, message: `"${product.name}" is out of stock!` };
    }

    const { cart } = get();
    const existing = cart.find((item) => item.product.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        return { success: false, message: `Cannot add more. Available stock: ${product.stock}` };
      }
      set({
        cart: cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
      return { success: true };
    }

    set({ cart: [...cart, { product, quantity: 1 }] });
    return { success: true };
  },

  updateQuantity: (productId: string, delta: number) => {
    const { cart } = get();
    const target = cart.find((i) => i.product.id === productId);
    if (!target) return { success: false };

    const newQty = target.quantity + delta;
    if (newQty > target.product.stock) {
      return { success: false, message: `Max stock reached (${target.product.stock})` };
    }

    if (newQty <= 0) {
      set({ cart: cart.filter((i) => i.product.id !== productId) });
      return { success: true };
    }

    set({
      cart: cart.map((i) => (i.product.id === productId ? { ...i, quantity: newQty } : i)),
    });
    return { success: true };
  },

  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    }));
  },

  clearCart: () => {
    set({
      cart: [],
      discount: 0,
      paidAmount: "",
      selectedCustomerId: "",
    });
  },

  setSelectedCustomerId: (id: string) => set({ selectedCustomerId: id }),
  setDiscount: (discount: number) => set({ discount: Math.max(0, discount) }),
  setPaidAmount: (paidAmount: string) => set({ paidAmount }),
  setPaymentMethod: (paymentMethod: string) => set({ paymentMethod }),
  setReceipt: (receipt: InvoiceReceipt | null) => set({ receipt }),
  setActiveTab: (activeTab: "pos" | "inventory" | "customers") => set({ activeTab }),

  getSubTotal: () => {
    return get().cart.reduce(
      (sum, item) => sum + item.product.sellingPrice * item.quantity,
      0
    );
  },

  getGrandTotal: () => {
    const subTotal = get().getSubTotal();
    const discount = Number(get().discount) || 0;
    return Math.max(0, subTotal - discount);
  },

  getPaidValue: () => {
    const { paidAmount } = get();
    const grandTotal = get().getGrandTotal();
    return paidAmount === "" ? grandTotal : Number(paidAmount);
  },

  getDueAmount: () => {
    const grandTotal = get().getGrandTotal();
    const paidValue = get().getPaidValue();
    return Math.max(0, grandTotal - paidValue);
  },
}));
