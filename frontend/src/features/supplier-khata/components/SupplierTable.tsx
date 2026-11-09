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
      <div className="bg-white rounded-lg border border-slate-200/90 p-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="inline-block animate-spin text-slate-700 mb-2">
          <Truck size={28} weight="bold" />
        </div>
        <p className="text-xs font-medium text-slate-500">মহাজনদের খাতা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200/90 p-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-500 flex items-center justify-center mx-auto mb-3">
          <Buildings size={20} weight="bold" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">কোনো মহাজন পাওয়া যায়নি</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো মহাজন খাতা খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করুন অথবা নতুন মহাজন যুক্ত করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-medium">
              <th className="py-2.5 px-3.5">প্রতিষ্ঠান / গদি ও মহাজনের নাম</th>
              <th className="py-2.5 px-3.5">মোকাম / আড়ত এলাকা</th>
              <th className="py-2.5 px-3.5">মোবাইল</th>
              <th className="py-2.5 px-3.5 text-right">দোকানের বর্তমান দেনা (৳)</th>
              <th className="py-2.5 px-3.5 text-center">অ্যাকশন</th>
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
                  <td className="py-2.5 px-3.5">
                    <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                      <Buildings size={14} weight="bold" className="text-slate-400 shrink-0" />
                      <span>{s.companyName || s.name}</span>
                    </div>
                    {s.companyName && (
                      <span className="text-[11px] text-slate-500 block pl-5 mt-0.5">
                        মহাজন: {s.name}
                      </span>
                    )}
                  </td>

                  {/* মোকাম / এলাকা */}
                  <td className="py-2.5 px-3.5 text-slate-600 text-xs">
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
                  <td className="py-2.5 px-3.5">
                    {s.phone ? (
                      <div className="flex items-center gap-1 text-xs text-slate-600 font-mono tabular-nums tracking-tight">
                        <Phone size={12} weight="bold" className="text-slate-400" />
                        <span>{s.phone}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">মোবাইল নেই</span>
                    )}
                  </td>

                  {/* বর্তমান দেনা */}
                  <td className="py-2.5 px-3.5 text-right">
                    {isPayable ? (
                      <div className="inline-block text-right">
                        <span className="font-mono tabular-nums tracking-tight font-black text-amber-800 text-sm">
                          ৳{formatCurrency(s.currentPayable)}
                        </span>
                        <span className="block text-[10px] text-amber-700 font-medium">
                          দোকানের দেনা
                        </span>
                      </div>
                    ) : isAdvance ? (
                      <div className="inline-block text-right">
                        <span className="font-mono tabular-nums tracking-tight font-black text-emerald-700 text-sm">
                          ৳{formatCurrency(Math.abs(s.currentPayable))}
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-medium">
                          অগ্রিম দেওয়া
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        পরিশোধিত (০.০০)
                      </span>
                    )}
                  </td>

                  {/* অ্যাকশন বাটনসমূহ */}
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center justify-center gap-1">
                      {/* দেনা পরিশোধ বাটন */}
                      <button
                        onClick={() => openModal('payment', s)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(5,150,105,0.2)]"
                        title="মহাজনকে দেনা পরিশোধ করুন"
                      >
                        <HandCoins size={14} weight="bold" />
                        <span>দেনা শোধ</span>
                      </button>

                      {/* খতিয়ান বিবরণী বাটন */}
                      <button
                        onClick={() => openModal('ledger', s)}
                        className="px-2.5 py-1 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-xs font-medium flex items-center gap-1 transition-[background-color,border-color,transform] duration-150"
                        title="মহাজনের রানিং চালান ও খতিয়ান"
                      >
                        <Scroll size={14} weight="bold" className="text-slate-500" />
                        <span>খতিয়ান</span>
                      </button>

                      {/* ছাড় / সমন্বয় */}
                      <button
                        onClick={() => openModal('adjustment', s)}
                        className="p-1.5 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-500 hover:text-slate-800 transition-[background-color,border-color,transform] duration-150"
                        title="শুকতি / কমিশন / ছাড় সমন্বয়"
                      >
                        <SlidersHorizontal size={14} weight="bold" />
                      </button>

                      {/* এডিট */}
                      <button
                        onClick={() => openModal('edit', s)}
                        className="p-1.5 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-500 hover:text-slate-800 transition-[background-color,border-color,transform] duration-150"
                        title="মহাজনের তথ্য এডিট করুন"
                      >
                        <PencilSimple size={14} weight="bold" />
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
        <div className="px-3.5 py-2.5 bg-slate-50/80 border-t border-slate-200/90 flex items-center justify-between text-xs text-slate-500">
          <span>
            পৃষ্ঠা <strong className="text-slate-800 font-mono tabular-nums">{meta.page}</strong> / <span className="font-mono tabular-nums">{meta.totalPages}</span> (মোট <span className="font-mono tabular-nums">{meta.total}</span> টি গদি)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
            >
              <CaretLeft size={14} weight="bold" />
            </button>
            <button
              onClick={() => setPage(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
