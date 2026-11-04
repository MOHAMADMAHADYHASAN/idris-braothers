"use client";

import { Product } from "../types/pos";

interface InventoryViewProps {
  products: Product[];
}

export function InventoryView({ products }: InventoryViewProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
      <h3 className="text-lg font-bold mb-4">Store Inventory Catalog</h3>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
          <tr>
            <th className="py-3 px-4">Item Name</th>
            <th className="py-3 px-4">Barcode</th>
            <th className="py-3 px-4">Stock</th>
            <th className="py-3 px-4">Buying Price</th>
            <th className="py-3 px-4">Selling Price</th>
            <th className="py-3 px-4">Est. Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-slate-750">
              <td className="py-3 px-4 font-medium">{p.name}</td>
              <td className="py-3 px-4 text-slate-400">{p.barcode || "-"}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    p.stock <= p.lowStockLimit
                      ? "bg-amber-900/60 text-amber-300"
                      : "bg-emerald-950 text-emerald-400"
                  }`}
                >
                  {p.stock} {p.unit}
                </span>
              </td>
              <td className="py-3 px-4">৳{p.costPrice}</td>
              <td className="py-3 px-4 font-bold text-emerald-400">৳{p.sellingPrice}</td>
              <td className="py-3 px-4 text-emerald-300">
                ৳{(p.sellingPrice - p.costPrice).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
