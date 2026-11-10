'use client';

import React from 'react';
import { Package, Trash, Receipt, Scales, Tag } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { usePurchaseStore } from '../../usePurchaseStore';

export function ChallanItemMatrixCard() {
  const { items, removeItem } = usePurchaseStore();

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalSubTotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-purple-50 text-purple-600">
            <Receipt size={16} weight="bold" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              চালানভুক্ত পণ্যের তালিকা ও স্টক-ইন ম্যাট্রিক্স
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                {items.length}টি আইটেম
              </span>
            </h2>
          </div>
        </div>
        {items.length > 0 && (
          <div className="text-xs font-mono text-slate-500 font-medium">
            মোট পরিমাণ: <span className="text-slate-900 font-bold">{totalQuantity}</span> | আইটেম উপমোট:{' '}
            <span className="text-slate-900 font-bold">{formatCurrency(totalSubTotal)}</span>
          </div>
        )}
      </div>

      {/* ফুল-উইডথ টেবিল */}
      <div className="overflow-x-auto">
        {items.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Package size={36} weight="duotone" className="text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-700">
              চালানে এখনও কোনো পণ্য যোগ করা হয়নি
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ওপরের 'পণ্য খুঁজুন' বার থেকে পণ্য, বস্তা বা কার্টনের বিবরণ দিয়ে চালানে যুক্ত করুন।
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs min-w-[750px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-3">পণ্যের নাম ও সাইজ</th>
                <th className="py-2.5 px-3">ক্রয় একক ও ফ্যাক্টর</th>
                <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                <th className="py-2.5 px-3 text-right">কেনা দর (৳)</th>
                <th className="py-2.5 px-3 text-right">মোট টাকা (৳)</th>
                <th className="py-2.5 px-3">নতুন বিক্রয়দর আপডেট</th>
                <th className="py-2.5 px-3 text-center w-12">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {items.map((item, idx) => {
                const totalBaseWeight = item.quantity * item.conversionFactor;
                const lineTotal = item.quantity * item.unitCost;

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    {/* # */}
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-xs">
                      {idx + 1}
                    </td>

                    {/* পণ্যের নাম */}
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                        {item.productName || 'অজ্ঞাত পণ্য'}
                      </span>
                    </td>

                    {/* একক */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.unitName}
                      </span>
                      {item.conversionFactor > 1 && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          ১ {item.unitName} = {item.conversionFactor} {item.baseUnitName}
                        </div>
                      )}
                    </td>

                    {/* পরিমাণ */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.quantity}
                      </span>
                      {item.conversionFactor > 1 && (
                        <div className="text-[10px] text-indigo-600 font-sans mt-0.5">
                          ({totalBaseWeight} {item.baseUnitName})
                        </div>
                      )}
                    </td>

                    {/* কেনা দর */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 text-xs sm:text-sm">
                      {formatCurrency(item.unitCost)}
                    </td>

                    {/* লাইন মোট */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 text-xs sm:text-sm">
                      {formatCurrency(lineTotal)}
                    </td>

                    {/* নতুন বিক্রয়দর */}
                    <td className="py-2.5 px-3 font-mono text-[11px] tabular-nums">
                      {item.newRetailPrice || item.newWholesalePrice ? (
                        <div className="space-y-0.5">
                          {item.newRetailPrice && (
                            <div className="text-emerald-700 font-semibold">
                              খুচরা: {formatCurrency(item.newRetailPrice)}
                            </div>
                          )}
                          {item.newWholesalePrice && (
                            <div className="text-slate-600">
                              পাইকারি: {formatCurrency(item.newWholesalePrice)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[10px] italic font-sans">— অপরিবর্তিত —</span>
                      )}
                    </td>

                    {/* ডিলিট */}
                    <td className="py-2.5 px-3 text-center w-12">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="আইটেমটি চালানের তালিকা থেকে বাদ দিন"
                      >
                        <Trash size={14} weight="bold" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
