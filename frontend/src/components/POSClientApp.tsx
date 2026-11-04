"use client";

import { useState } from "react";
import { Product, Customer } from "../types/pos";
import { useCartStore } from "../store/useCartStore";
import { Header } from "./Header";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { InventoryView } from "./InventoryView";
import { CustomerView } from "./CustomerView";
import { ReceiptModal } from "./ReceiptModal";

const API_BASE = "http://localhost:5000/api/v1";

interface POSClientAppProps {
  initialProducts: Product[];
  initialCustomers: Customer[];
}

export function POSClientApp({ initialProducts, initialCustomers }: POSClientAppProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeTab = useCartStore((s) => s.activeTab);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Re-fetch products & customers when sale completes
  const handleRefresh = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        fetch(`${API_BASE}/inventory?limit=50`),
        fetch(`${API_BASE}/customers?limit=50`),
      ]);

      const prodData = await prodRes.json();
      const custData = await custRes.json();

      if (prodData.success) {
        setProducts(
          prodData.data.products.map((p: any) => ({
            ...p,
            stock: Number(p.stock),
            sellingPrice: Number(p.sellingPrice),
            costPrice: Number(p.costPrice),
            lowStockLimit: Number(p.lowStockLimit),
          }))
        );
      }

      if (custData.success) {
        setCustomers(
          custData.data.customers.map((c: any) => ({
            ...c,
            currentDue: Number(c.currentDue),
          }))
        );
      }
    } catch {
      showToast("error", "Failed to sync latest stock with backend");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* NAVBAR */}
      <Header productsCount={products.length} customersCount={customers.length} />

      {/* TOAST ALERT */}
      {toast && (
        <div
          className={`fixed top-16 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-emerald-900 border-emerald-600 text-emerald-100"
              : "bg-rose-900 border-rose-600 text-rose-100"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* MAIN VIEW */}
      <main className="flex-1 p-6">
        {activeTab === "pos" && (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
            <div className="col-span-7 h-full">
              <ProductGrid products={products} onShowToast={showToast} />
            </div>
            <div className="col-span-5 h-full">
              <CartPanel
                customers={customers}
                onSaleCompleted={handleRefresh}
                onShowToast={showToast}
              />
            </div>
          </div>
        )}

        {activeTab === "inventory" && <InventoryView products={products} />}
        {activeTab === "customers" && <CustomerView customers={customers} />}
      </main>

      {/* THERMAL PRINT RECEIPT MODAL */}
      <ReceiptModal />
    </div>
  );
}
