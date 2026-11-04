"use client";

import { useState } from "react";
import { Customer } from "../types/pos";
import { useCartStore } from "../store/useCartStore";

const API_BASE = "http://localhost:5000/api/v1";

interface CartPanelProps {
  customers: Customer[];
  onSaleCompleted: () => void;
  onShowToast: (type: "success" | "error", text: string) => void;
}

export function CartPanel({ customers, onSaleCompleted, onShowToast }: CartPanelProps) {
  const [loading, setLoading] = useState(false);

  // Zustand State & Actions
  const {
    cart,
    selectedCustomerId,
    discount,
    paidAmount,
    paymentMethod,
    updateQuantity,
    removeFromCart,
    clearCart,
    setSelectedCustomerId,
    setDiscount,
    setPaidAmount,
    setPaymentMethod,
    setReceipt,
    getSubTotal,
    getGrandTotal,
    getPaidValue,
    getDueAmount,
  } = useCartStore();

  const subTotal = getSubTotal();
  const grandTotal = getGrandTotal();
  const paidValue = getPaidValue();
  const dueAmount = getDueAmount();

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      onShowToast("error", "Cart is empty!");
      return;
    }

    if (dueAmount > 0 && !selectedCustomerId) {
      onShowToast("error", "Customer profile is required when there is Due (Baki)!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId: selectedCustomerId || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        discount,
        paidAmount: paidValue,
        paymentMethod: dueAmount > 0 ? (paidValue > 0 ? "SPLIT" : "DUE") : paymentMethod,
      };

      const res = await fetch(`${API_BASE}/sales/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        onShowToast("error", data.message || "Checkout failed");
        setLoading(false);
        return;
      }

      setReceipt(data.data);
      onShowToast("success", `Sale completed! Invoice #${data.data.invoiceNumber}`);
      clearCart();
      onSaleCompleted();
    } catch {
      onShowToast("error", "Error connecting to server during checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow-xl h-full justify-between">
      <div>
        {/* CUSTOMER SELECTOR */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div className="flex-1 mr-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Customer Profile (For Baki / Regulars)
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">👤 Walk-in Guest Customer (Cash)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - Due: ৳{c.currentDue}
                </option>
              ))}
            </select>
          </div>
          {selectedCustomer && (
            <div className="text-right bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 block">Existing Due</span>
              <span className="text-sm font-bold text-rose-400">
                ৳{selectedCustomer.currentDue}
              </span>
            </div>
          )}
        </div>

        {/* CART LIST MANAGED BY ZUSTAND */}
        <div className="h-60 overflow-y-auto mt-3 pr-1 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
              <span className="text-3xl mb-2">🛒</span>
              Cart is empty. Scan barcodes or click items.
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-slate-800"
              >
                <div className="flex-1 mr-2">
                  <p className="text-sm font-medium text-slate-200 line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    ৳{item.product.sellingPrice} × {item.quantity} ={" "}
                    <span className="text-emerald-400 font-semibold">
                      ৳{item.product.sellingPrice * item.quantity}
                    </span>
                  </p>
                </div>

                {/* QUANTITY CONTROLS */}
                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="ml-2 text-slate-500 hover:text-rose-400 p-1 text-sm"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHECKOUT FINANCIAL SUMMARY */}
      <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-200">৳{subTotal}</span>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-slate-400">Discount (৳)</span>
          <input
            type="number"
            min="0"
            value={discount || ""}
            onChange={(e) => setDiscount(Number(e.target.value))}
            placeholder="0"
            className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-between items-baseline pt-2 border-t border-slate-700/60">
          <span className="text-base font-bold text-slate-200">Grand Total</span>
          <span className="text-2xl font-black text-emerald-400">৳{grandTotal}</span>
        </div>

        {/* PAYMENT SECTION */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Paid Amount (৳)</label>
            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder={grandTotal.toString()}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="CASH">💵 Cash</option>
              <option value="BKASH">📱 bKash</option>
              <option value="NAGAD">📱 Nagad</option>
              <option value="CARD">💳 Card</option>
            </select>
          </div>
        </div>

        {/* DUE BANNER */}
        {dueAmount > 0 && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 px-3 py-2 rounded-lg flex justify-between items-center text-xs">
            <span>Remaining Due (Baki):</span>
            <span className="text-sm font-bold text-rose-400">৳{dueAmount}</span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={clearCart}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-semibold text-sm transition"
          >
            Clear
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition flex justify-center items-center gap-2"
          >
            {loading ? "Processing..." : `Complete Sale • ৳${paidValue}`}
          </button>
        </div>
      </div>
    </div>
  );
}
