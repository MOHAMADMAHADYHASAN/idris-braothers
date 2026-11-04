"use client";

import { useState, useRef } from "react";
import { Product } from "../types/pos";
import { useCartStore } from "../store/useCartStore";

interface ProductGridProps {
  products: Product[];
  onShowToast: (type: "success" | "error", text: string) => void;
}

export function ProductGrid({ products, onShowToast }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const addToCart = useCartStore((s) => s.addToCart);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeOrSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Direct Barcode match
    const matchByBarcode = products.find((p) => p.barcode === query);
    if (matchByBarcode) {
      const res = addToCart(matchByBarcode);
      if (!res.success && res.message) onShowToast("error", res.message);
      setSearchQuery("");
      return;
    }

    // Name match
    const matchByName = products.find((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    if (matchByName) {
      const res = addToCart(matchByName);
      if (!res.success && res.message) onShowToast("error", res.message);
      setSearchQuery("");
      return;
    }

    onShowToast("error", `No product found for "${query}"`);
  };

  const handleCardClick = (product: Product) => {
    const res = addToCart(product);
    if (!res.success && res.message) {
      onShowToast("error", res.message);
    }
  };

  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.barcode && p.barcode.includes(searchQuery))
      )
    : products;

  return (
    <div className="flex flex-col gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 h-full">
      {/* SCANNER BAR */}
      <form onSubmit={handleBarcodeOrSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Scan Barcode or Type Product Name..."
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
            autoFocus
          />
          <span className="absolute right-3 top-3 text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
            Scanner Ready
          </span>
        </div>
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 rounded-xl transition"
        >
          Add
        </button>
      </form>

      {/* PRODUCT CARDS */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-3 gap-3">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleCardClick(prod)}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between select-none ${
                prod.stock <= prod.lowStockLimit
                  ? "bg-amber-950/20 border-amber-800/80 hover:border-amber-500"
                  : "bg-slate-900/80 border-slate-700 hover:border-emerald-500 hover:scale-[1.01]"
              }`}
            >
              <div>
                <h4 className="font-semibold text-sm line-clamp-2 text-slate-200">
                  {prod.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Barcode: {prod.barcode || "N/A"}
                </p>
              </div>

              <div className="flex justify-between items-end mt-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-lg font-bold text-emerald-400">
                    ৳{prod.sellingPrice}
                  </span>
                  <span className="text-xs text-slate-400">/{prod.unit}</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    prod.stock <= prod.lowStockLimit
                      ? "bg-amber-900/60 text-amber-300 border border-amber-700"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Stock: {prod.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
