'use client';

import React from 'react';
import { Trash, Package, Receipt } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { usePurchaseStore } from '../usePurchaseStore';

export function ChallanItemsTable() {
  const { items, removeItem } = usePurchaseStore();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-slate-200 p-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 border border-slate-200/80">
          <Package size={20} weight="bold" />
        </div>
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900">চালানে কোনো পণ্য যোগ করা হয়নি</h4>
        <p className="text-[11px] text-slate-500 mt-0.5">
          ওপরের ফর্ম থেকে পণ্য ও বস্তা/কার্টনের বিবরণ দিয়ে চালানে যুক্ত করুন
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={15} weight="bold" className="text-slate-600" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
            চালানভুক্ত পণ্যের তালিকা ({items.length} টি আইটেম)
          </h4>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-medium">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">পণ্যের বিবরণ</th>
              <th className="py-2 px-3">ইউনিট ও ফ্যাক্টর</th>
              <th className="py-2 px-3 text-right">পরিমাণ</th>
              <th className="py-2 px-3 text-right">কেনা দর (টাকা)</th>
              <th className="py-2 px-3.5 text-right">মোট টাকা</th>
              <th className="py-2 px-2.5 text-center">বাতিল</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const totalBaseWeight = item.quantity * item.conversionFactor;
              const lineTotal = item.quantity * item.unitCost;

              return (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                  {/* পণ্য */}
                  <td className="py-2 px-3">
                    <span className="font-semibold text-slate-900 block text-xs">
                      {item.productName || 'অজ্ঞাত পণ্য'}
                    </span>
                    {(item.newRetailPrice || item.newWholesalePrice) && (
                      <span className="text-[10px] text-emerald-800 block mt-0.5 font-mono tabular-nums">
                        নতুন দর:{' '}
                        {item.newRetailPrice ? `খুচরা ৳${item.newRetailPrice}` : ''}{' '}
                        {item.newWholesalePrice ? `| পাইকারি ৳${item.newWholesalePrice}` : ''}
                      </span>
                    )}
                  </td>

                  {/* ইউনিট */}
                  <td className="py-2 px-3">
                    <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                      {item.unitName}
                    </span>
                    {item.conversionFactor > 1 && (
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono tabular-nums">
                        ১ {item.unitName} = {item.conversionFactor} {item.baseUnitName}
                      </span>
                    )}
                  </td>

                  {/* পরিমাণ */}
                  <td className="py-2 px-3 text-right font-mono tabular-nums">
                    <strong className="text-slate-900 font-semibold text-xs sm:text-sm">
                      {item.quantity}
                    </strong>
                    {item.conversionFactor > 1 && (
                      <span className="text-[10px] text-slate-500 block font-mono tabular-nums">
                        ({totalBaseWeight} {item.baseUnitName})
                      </span>
                    )}
                  </td>

                  {/* কেনা দর */}
                  <td className="py-2 px-3 text-right font-mono tabular-nums font-medium text-slate-700 text-xs">
                    {formatCurrency(item.unitCost)}
                  </td>

                  {/* মোট */}
                  <td className="py-2 px-3.5 text-right font-mono tabular-nums tracking-tight font-bold text-slate-900 text-xs sm:text-sm">
                    {formatCurrency(lineTotal)}
                  </td>

                  {/* ডিলিট বাটন */}
                  <td className="py-2 px-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
                      title="আইটেমটি বাদ দিন"
                    >
                      <Trash size={14} weight="bold" />
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
