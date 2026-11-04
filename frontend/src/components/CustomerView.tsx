"use client";

import { Customer } from "../types/pos";
import { useCartStore } from "../store/useCartStore";

interface CustomerViewProps {
  customers: Customer[];
}

export function CustomerView({ customers }: CustomerViewProps) {
  const { setSelectedCustomerId, setActiveTab } = useCartStore();

  const handleStartSale = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setActiveTab("pos");
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
      <h3 className="text-lg font-bold mb-4">Customer Directory & Baki Khata</h3>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
          <tr>
            <th className="py-3 px-4">Customer Name</th>
            <th className="py-3 px-4">Mobile Number</th>
            <th className="py-3 px-4">Current Due (মোট বকেয়া)</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-slate-750">
              <td className="py-3 px-4 font-semibold text-slate-200">{c.name}</td>
              <td className="py-3 px-4 text-slate-400">{c.phone}</td>
              <td className="py-3 px-4">
                <span
                  className={`text-sm font-bold ${
                    c.currentDue > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  ৳{c.currentDue}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => handleStartSale(c.id)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition"
                >
                  New Sale
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
