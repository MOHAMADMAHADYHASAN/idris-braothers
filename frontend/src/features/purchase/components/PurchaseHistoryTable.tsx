'use client';

import React, { useEffect } from 'react';
import {
  Receipt,
  Eye,
  Truck,
  CaretLeft,
  CaretRight,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { usePurchaseStore } from '../usePurchaseStore';

export function PurchaseHistoryTable() {
  const {
    purchases,
    meta,
    isLoadingHistory,
    fetchPurchases,
    openDetailModal,
    setFilter,
  } = usePurchaseStore();

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
      {/* হেডার */}
      <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={16} weight="bold" className="text-slate-600" />
          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
            বিগত চালান রেজিস্টার ও স্টক ইন হিস্ট্রি
          </h4>
        </div>
        <button
          onClick={() => fetchPurchases()}
          disabled={isLoadingHistory}
          className="p-1 rounded-md border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-600 disabled:opacity-50 transition-[background-color,border-color,transform] duration-150"
          title="রিফ্রেশ করুন"
        >
          <ArrowsClockwise
            size={14}
            weight="bold"
            className={isLoadingHistory ? 'animate-spin text-slate-800' : ''}
          />
        </button>
      </div>

      {isLoadingHistory && purchases.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <ArrowsClockwise size={24} weight="bold" className="animate-spin mx-auto mb-2 text-slate-600" />
          <p className="text-xs">চালান রেজিস্টার লোড হচ্ছে...</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <Truck size={28} weight="bold" className="mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-medium text-slate-600">কোনো পূর্ববর্তী চালান পাওয়া যায়নি</p>
        </div>
      ) : (
        <>
          {/* ডেস্কটপ টেবিল */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-medium">
                  <th className="py-2.5 px-3">চালান নং ও তারিখ</th>
                  <th className="py-2.5 px-3">মহাজন / আড়ত</th>
                  <th className="py-2.5 px-3 text-right">গাড়িভাড়া</th>
                  <th className="py-2.5 px-3.5 text-right">সর্বমোট বিল</th>
                  <th className="py-2.5 px-3.5 text-right">নগদ পরিশোধ</th>
                  <th className="py-2.5 px-3.5 text-right">বকেয়া দেনা</th>
                  <th className="py-2.5 px-2.5 text-center">ভিউ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((p) => {
                  const dateStr = new Date(p.createdAt).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* চালান নং ও তারিখ */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono tabular-nums font-bold text-slate-900 text-xs block">
                          #{p.purchaseNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono tabular-nums">{dateStr}</span>
                      </td>

                      {/* মহাজন */}
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 text-xs block">
                          {p.supplier?.companyName || p.supplier?.name || 'অজ্ঞাত মহাজন'}
                        </span>
                        {p.supplier?.address && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                            {p.supplier.address}
                          </span>
                        )}
                      </td>

                      {/* গাড়িভাড়া */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 text-xs">
                        {p.transportCost > 0 ? `৳${formatCurrency(p.transportCost)}` : '-'}
                      </td>

                      {/* সর্বমোট বিল */}
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums tracking-tight font-black text-slate-900">
                        ৳{formatCurrency(p.grandTotal)}
                      </td>

                      {/* পরিশোধ */}
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums tracking-tight font-semibold text-emerald-700">
                        ৳{formatCurrency(p.paidAmount)}
                      </td>

                      {/* বকেয়া */}
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums tracking-tight font-bold text-amber-800">
                        {p.dueAmount > 0 ? `৳${formatCurrency(p.dueAmount)}` : 'পরিশোধিত'}
                      </td>

                      {/* ভিউ বাটন */}
                      <td className="py-2.5 px-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => openDetailModal(p)}
                          className="p-1.5 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-500 hover:text-slate-800 transition-[background-color,border-color,transform] duration-150"
                          title="চালানের সম্পূর্ণ চালানপত্র দেখুন"
                        >
                          <Eye size={14} weight="bold" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* মোবাইল কার্ড ভিউ */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {purchases.map((p) => (
              <div key={p.id} className="p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono tabular-nums font-bold text-slate-900 text-xs">
                    #{p.purchaseNumber}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                    ৳{formatCurrency(p.grandTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{p.supplier?.companyName || p.supplier?.name}</span>
                  <button
                    onClick={() => openDetailModal(p)}
                    className="px-2 py-0.5 rounded-md border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-[11px] font-medium text-slate-700 flex items-center gap-1 transition-[background-color,transform] duration-150"
                  >
                    <Eye size={12} weight="bold" />
                    <span>বিস্তারিত</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* পেজিনেশন */}
          {meta.totalPages > 1 && (
            <div className="px-3.5 py-2.5 bg-slate-50/80 border-t border-slate-200/90 flex items-center justify-between text-xs text-slate-500">
              <span>
                পৃষ্ঠা <strong className="text-slate-800 font-mono tabular-nums">{meta.page}</strong> / <span className="font-mono tabular-nums">{meta.totalPages}</span> (মোট <span className="font-mono tabular-nums">{meta.total}</span> টি চালান)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilter('page', meta.page - 1)}
                  disabled={meta.page <= 1 || isLoadingHistory}
                  className="p-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
                >
                  <CaretLeft size={14} weight="bold" />
                </button>
                <button
                  onClick={() => setFilter('page', meta.page + 1)}
                  disabled={meta.page >= meta.totalPages || isLoadingHistory}
                  className="p-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
                >
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
