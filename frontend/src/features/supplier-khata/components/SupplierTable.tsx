'use client';

import React from 'react';
import {
  HandCoins,
  Scroll,
  PencilSimple,
  SlidersHorizontal,
  CaretLeft,
  CaretRight,
  Buildings,
  Phone,
  MapPin,
  Truck,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { Supplier } from '../supplierKhata.types';

export function SupplierTable() {
  const {
    suppliers,
    meta,
    isLoading,
    openModal,
    setPage,
  } = useSupplierKhataStore();

  if (isLoading && suppliers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center">
        <div className="inline-block animate-spin text-amber-600 mb-2">
          <Truck size={32} weight="bold" />
        </div>
        <p className="text-sm text-ink-muted">মহাজনদের খাতা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Buildings size={24} weight="bold" />
        </div>
        <h3 className="text-base font-semibold text-ink-primary">কোনো মহাজন পাওয়া যায়নি</h3>
        <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
          আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো মহাজন খাতা খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করুন অথবা নতুন মহাজন যুক্ত করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <th className="py-3 px-4">প্রতিষ্ঠান / গদি ও মহাজনের নাম</th>
              <th className="py-3 px-3">মোকাম / আড়ত এলাকা</th>
              <th className="py-3 px-3">মোবাইল</th>
              <th className="py-3 px-4 text-right">দোকানের বর্তমান দেনা (৳)</th>
              <th className="py-3 px-4 text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map((s) => {
              const isPayable = s.currentPayable > 0;
              const isAdvance = s.currentPayable < 0;

              return (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* প্রতিষ্ঠান ও মহাজনের নাম */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-ink-primary text-sm flex items-center gap-1.5">
                      <Buildings size={15} weight="bold" className="text-slate-400 shrink-0" />
                      <span>{s.companyName || s.name}</span>
                    </div>
                    {s.companyName && (
                      <span className="text-xs text-slate-500 block pl-5 mt-0.5">
                        মহাজন: {s.name}
                      </span>
                    )}
                  </td>

                  {/* মোকাম / এলাকা */}
                  <td className="py-3 px-3 text-slate-600 text-xs">
                    {s.address ? (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} weight="bold" className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{s.address}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* মোবাইল নম্বর */}
                  <td className="py-3 px-3">
                    {s.phone ? (
                      <div className="flex items-center gap-1 text-xs text-slate-600 font-mono tabular-nums">
                        <Phone size={12} weight="bold" className="text-slate-400" />
                        <span>{s.phone}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">মোবাইল নেই</span>
                    )}
                  </td>

                  {/* বর্তমান দেনা */}
                  <td className="py-3 px-4 text-right">
                    {isPayable ? (
                      <div className="inline-block text-right">
                        <span className="font-mono font-bold text-amber-700 text-base tabular-nums">
                          {formatCurrency(s.currentPayable)}
                        </span>
                        <span className="block text-[10px] text-amber-600 font-medium uppercase tracking-wider">
                          দোকানের দেনা
                        </span>
                      </div>
                    ) : isAdvance ? (
                      <div className="inline-block text-right">
                        <span className="font-mono font-bold text-emerald-600 text-base tabular-nums">
                          {formatCurrency(Math.abs(s.currentPayable))}
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-medium uppercase tracking-wider">
                          অগ্রিম দেওয়া
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                        পরিশোধিত (০.০০)
                      </span>
                    )}
                  </td>

                  {/* অ্যাকশন বাটনসমূহ */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* দেনা পরিশোধ বাটন */}
                      <button
                        onClick={() => openModal('payment', s)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 transition-colors active:scale-95 shadow-xs"
                        title="মহাজনকে দেনা পরিশোধ করুন"
                      >
                        <HandCoins size={15} weight="bold" />
                        <span>দেনা শোধ</span>
                      </button>

                      {/* খতিয়ান বিবরণী বাটন */}
                      <button
                        onClick={() => openModal('ledger', s)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-ink-primary text-xs font-medium flex items-center gap-1 transition-colors"
                        title="মহাজনের রানিং চালান ও খতিয়ান"
                      >
                        <Scroll size={15} weight="bold" className="text-slate-500" />
                        <span>খতিয়ান</span>
                      </button>

                      {/* ছাড় / সমন্বয় */}
                      <button
                        onClick={() => openModal('adjustment', s)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-ink-primary transition-colors"
                        title="শুকতি / কমিশন / ছাড় সমন্বয়"
                      >
                        <SlidersHorizontal size={15} weight="bold" />
                      </button>

                      {/* এডিট */}
                      <button
                        onClick={() => openModal('edit', s)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-ink-primary transition-colors"
                        title="মহাজনের তথ্য এডিট করুন"
                      >
                        <PencilSimple size={15} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* পেজিনেশন ফুটার */}
      {meta.totalPages > 1 && (
        <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-ink-muted">
          <span>
            পৃষ্ঠা <strong className="text-ink-primary">{meta.page}</strong> / {meta.totalPages} (মোট {meta.total} টি গদি)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            <button
              onClick={() => setPage(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
