'use client';

import React from 'react';
import { Trash, Package, Receipt } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { usePurchaseStore } from '../usePurchaseStore';

export function ChallanItemsTable() {
  const { items, removeItem } = usePurchaseStore();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
          <Package size={22} weight="bold" />
        </div>
        <h4 className="text-sm font-semibold text-ink-primary">চালানে কোনো পণ্য যোগ করা হয়নি</h4>
        <p className="text-xs text-ink-muted mt-0.5">
          ওপরের ফর্ম থেকে পণ্য ও বস্তা/কার্টনের বিবরণ দিয়ে চালানে যুক্ত করুন
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={16} weight="bold" className="text-amber-600" />
          <h4 className="text-xs sm:text-sm font-bold text-ink-primary">
            চালানভুক্ত পণ্যের তালিকা ({items.length} টি আইটেম)
          </h4>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">পণ্যের বিবরণ</th>
              <th className="py-2.5 px-3">ইউনিট ও ফ্যাক্টর</th>
              <th className="py-2.5 px-3 text-right">পরিমাণ</th>
              <th className="py-2.5 px-3 text-right">কেনা দর (টাকা)</th>
              <th className="py-2.5 px-3 text-right">মোট টাকা</th>
              <th className="py-2.5 px-3 text-center">বাতিল</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const totalBaseWeight = item.quantity * item.conversionFactor;
              const lineTotal = item.quantity * item.unitCost;

              return (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                  {/* পণ্য */}
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-ink-primary block">
                      {item.productName || 'অজ্ঞাত পণ্য'}
                    </span>
                    {(item.newRetailPrice || item.newWholesalePrice) && (
                      <span className="text-[10px] text-emerald-700 block mt-0.5">
                        নতুন দর:{' '}
                        {item.newRetailPrice ? `খুচরা ৳${item.newRetailPrice}` : ''}{' '}
                        {item.newWholesalePrice ? `| পাইকারি ৳${item.newWholesalePrice}` : ''}
                      </span>
                    )}
                  </td>

                  {/* ইউনিট */}
                  <td className="py-2.5 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {item.unitName}
                    </span>
                    {item.conversionFactor > 1 && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        ১ {item.unitName} = {item.conversionFactor} {item.baseUnitName}
                      </span>
                    )}
                  </td>

                  {/* পরিমাণ */}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    <strong className="text-ink-primary font-semibold text-sm">
                      {item.quantity}
                    </strong>
                    {item.conversionFactor > 1 && (
                      <span className="text-[11px] text-slate-500 block">
                        ({totalBaseWeight} {item.baseUnitName})
                      </span>
                    )}
                  </td>

                  {/* কেনা দর */}
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700 tabular-nums">
                    {formatCurrency(item.unitCost)}
                  </td>

                  {/* মোট */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-ink-primary tabular-nums">
                    {formatCurrency(lineTotal)}
                  </td>

                  {/* ডিলিট বাটন */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="আইটেমটি বাদ দিন"
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
