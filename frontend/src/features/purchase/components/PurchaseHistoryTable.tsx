'use client';

import React, { useEffect } from 'react';
import {
  Receipt,
  Eye,
  Truck,
  CaretLeft,
  CaretRight,
  Buildings,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { usePurchaseStore } from '../usePurchaseStore';
import { Purchase } from '../purchase.types';

export function PurchaseHistoryTable() {
  const {
    purchases,
    meta,
    isLoadingHistory,
    filters,
    fetchPurchases,
    openDetailModal,
    setFilter,
  } = usePurchaseStore();

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* হেডার */}
      <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={18} weight="bold" className="text-amber-600" />
          <h4 className="font-bold text-xs sm:text-sm text-ink-primary">
            বিগত চালান রেজিস্টার ও স্টক ইন হিস্ট্রি
          </h4>
        </div>
        <button
          onClick={() => fetchPurchases()}
          disabled={isLoadingHistory}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 transition-colors"
          title="রিফ্রেশ করুন"
        >
          <ArrowsClockwise
            size={16}
            weight="bold"
            className={isLoadingHistory ? 'animate-spin text-amber-600' : ''}
          />
        </button>
      </div>

      {isLoadingHistory && purchases.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <ArrowsClockwise size={28} weight="bold" className="animate-spin mx-auto mb-2 text-amber-600" />
          <p className="text-xs">চালান রেজিস্টার লোড হচ্ছে...</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <Truck size={32} weight="bold" className="mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-medium text-slate-600">কোনো পূর্ববর্তী চালান পাওয়া যায়নি</p>
        </div>
      ) : (
        <>
          {/* ডেস্কটপ টেবিল */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-3">চালান নং ও তারিখ</th>
                  <th className="py-2.5 px-3">মহাজন / আড়ত</th>
                  <th className="py-2.5 px-3 text-right">গাড়িভাড়া</th>
                  <th className="py-2.5 px-3 text-right">সর্বমোট বিল</th>
                  <th className="py-2.5 px-3 text-right">নগদ পরিশোধ</th>
                  <th className="py-2.5 px-3 text-right">বকেয়া দেনা</th>
                  <th className="py-2.5 px-3 text-center">ভিউ</th>
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
                        <span className="font-mono font-bold text-ink-primary text-xs block">
                          #{p.purchaseNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{dateStr}</span>
                      </td>

                      {/* মহাজন */}
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-ink-primary text-xs block">
                          {p.supplier?.companyName || p.supplier?.name || 'অজ্ঞাত মহাজন'}
                        </span>
                        {p.supplier?.address && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                            {p.supplier.address}
                          </span>
                        )}
                      </td>

                      {/* গাড়িভাড়া */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums text-xs">
                        {p.transportCost > 0 ? `৳${formatCurrency(p.transportCost)}` : '-'}
                      </td>

                      {/* সর্বমোট বিল */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-ink-primary tabular-nums">
                        {formatCurrency(p.grandTotal)}
                      </td>

                      {/* পরিশোধ */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600 tabular-nums">
                        {formatCurrency(p.paidAmount)}
                      </td>

                      {/* বকেয়া */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                        {p.dueAmount > 0 ? formatCurrency(p.dueAmount) : 'পরিশোধিত'}
                      </td>

                      {/* ভিউ বাটন */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => openDetailModal(p)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-ink-primary transition-colors"
                          title="চালানের সম্পূর্ণ চালানপত্র দেখুন"
                        >
                          <Eye size={15} weight="bold" />
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
              <div key={p.id} className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-ink-primary text-xs">
                    #{p.purchaseNumber}
                  </span>
                  <span className="font-mono font-bold text-amber-700 text-sm">
                    {formatCurrency(p.grandTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{p.supplier?.companyName || p.supplier?.name}</span>
                  <button
                    onClick={() => openDetailModal(p)}
                    className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-medium text-ink-primary flex items-center gap-1"
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
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-ink-muted">
              <span>
                পৃষ্ঠা <strong className="text-ink-primary">{meta.page}</strong> / {meta.totalPages} (মোট {meta.total} টি চালান)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilter('page', meta.page - 1)}
                  disabled={meta.page <= 1 || isLoadingHistory}
                  className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <button
                  onClick={() => setFilter('page', meta.page + 1)}
                  disabled={meta.page >= meta.totalPages || isLoadingHistory}
                  className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  <CaretRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
