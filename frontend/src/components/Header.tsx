"use client";

import { useCartStore } from "../store/useCartStore";

interface HeaderProps {
  productsCount: number;
  customersCount: number;
}

export function Header({ productsCount, customersCount }: HeaderProps) {
  const { activeTab, setActiveTab } = useCartStore();

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500 text-slate-950 p-2 rounded-lg font-bold text-xl tracking-wider shadow">
          🏪 IDRIS POS
        </div>
        <span className="text-sm text-slate-400">Grocery Store Counter</span>
      </div>

      {/* TABS CONTROLLED BY ZUSTAND */}
      <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
        <button
          onClick={() => setActiveTab("pos")}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
            activeTab === "pos"
              ? "bg-emerald-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          🛒 Billing Counter (POS)
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
            activeTab === "inventory"
              ? "bg-emerald-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          📦 Inventory Stock ({productsCount})
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
            activeTab === "customers"
              ? "bg-emerald-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          👥 Baki Khata ({customersCount})
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Backend API : 5000 (Connected)
      </div>
    </header>
  );
}
