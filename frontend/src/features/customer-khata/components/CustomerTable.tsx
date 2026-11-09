'use client';

import React from 'react';
import {
  HandCoins,
  Scroll,
  PencilSimple,
  SlidersHorizontal,
  CaretLeft,
  CaretRight,
  User,
  Phone,
  MapPin,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useCustomerKhataStore } from '../useCustomerKhataStore';
import { Customer } from '../customerKhata.types';

export function CustomerTable() {
  const {
    customers,
    meta,
    isLoading,
    openModal,
    setPage,
  } = useCustomerKhataStore();

  if (isLoading && customers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200/90 p-8 text-center">
        <div className="inline-block animate-spin text-slate-700 mb-2">
          <Scroll size={28} weight="bold" />
        </div>
        <p className="text-xs text-slate-500">কাস্টমার খাতা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200/90 p-10 text-center">
        <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-500 flex items-center justify-center mx-auto mb-2.5">
          <User size={20} weight="bold" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">কোনো কাস্টমার পাওয়া যায়নি</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো কাস্টমার খাতা খুঁজে পাওয়া যায়নি।
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/90 text-slate-600 font-medium">
              <th className="py-2.5 px-3.5">গ্রাহকের নাম ও মোবাইল</th>
              <th className="py-2.5 px-3">টাইপ</th>
              <th className="py-2.5 px-3">ঠিকানা / এলাকা</th>
              <th className="py-2.5 px-3.5 text-right">বর্তমান বকেয়া (৳)</th>
              <th className="py-2.5 px-3.5 text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => {
              const isDue = c.currentDue > 0;
              const isAdvance = c.currentDue < 0;

              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* কাস্টমার নাম ও মোবাইল */}
                  <td className="py-2.5 px-3.5">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>{c.name}</span>
                    </div>
                    {c.phone ? (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono tabular-nums tracking-tight mt-0.5">
                        <Phone size={11} weight="bold" className="text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">মোবাইল নেই</span>
                    )}
                  </td>

                  {/* টাইপ ব্যাজ */}
                  <td className="py-2.5 px-3">
                    {c.customerType === 'WHOLESALE' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                        পাইকারি
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                        খুচরা
                      </span>
                    )}
                  </td>

                  {/* ঠিকানা */}
                  <td className="py-2.5 px-3 text-slate-600 text-xs">
                    {c.address ? (
                      <div className="flex items-center gap-1">
                        <MapPin size={11} weight="bold" className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{c.address}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* বর্তমান বকেয়া */}
                  <td className="py-2.5 px-3.5 text-right">
                    {isDue ? (
                      <div className="inline-block text-right">
                        <span className="font-mono tabular-nums tracking-tight font-black text-rose-700 text-sm sm:text-base">
                          ৳{formatCurrency(c.currentDue)}
                        </span>
                        <span className="block text-[10px] text-rose-500 font-semibold uppercase tracking-wider">
                          বকেয়া পাওনা
                        </span>
                      </div>
                    ) : isAdvance ? (
                      <div className="inline-block text-right">
                        <span className="font-mono tabular-nums tracking-tight font-black text-emerald-700 text-sm sm:text-base">
                          ৳{formatCurrency(Math.abs(c.currentDue))}
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                          অগ্রিম জমা
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500">
                        পরিশোধিত (০.০০)
                      </span>
                    )}
                  </td>

                  {/* অ্যাকশন বাটনসমূহ */}
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* উশুল নিন বাটন */}
                      <button
                        onClick={() => openModal('payment', c)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 shadow-2xs transition-[background-color,transform] duration-150 active:scale-[0.98]"
                        title="নগদ বকেয়া উশুল / জমা গ্রহণ করুন"
                      >
                        <HandCoins size={14} weight="bold" />
                        <span>উশুল</span>
                      </button>

                      {/* খতিয়ান বিবরণী বাটন */}
                      <button
                        onClick={() => openModal('ledger', c)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-[background-color] duration-150 active:scale-[0.98]"
                        title="রানিং খতিয়ান ও লেনদেন স্টেটমেন্ট"
                      >
                        <Scroll size={14} weight="bold" className="text-slate-500" />
                        <span>খতিয়ান</span>
                      </button>

                      {/* হিসাব সমন্বয় (ছাড়) */}
                      <button
                        onClick={() => openModal('adjustment', c)}
                        className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-[background-color,color] duration-150 active:scale-[0.96]"
                        title="হিসাব সমন্বয় / ছাড় দিন"
                      >
                        <SlidersHorizontal size={14} weight="bold" />
                      </button>

                      {/* এডিট */}
                      <button
                        onClick={() => openModal('edit', c)}
                        className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-[background-color,color] duration-150 active:scale-[0.96]"
                        title="কাস্টমার তথ্য এডিট করুন"
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
        <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums tracking-tight">
          <span>
            পৃষ্ঠা <strong className="text-slate-900">{meta.page}</strong> / {meta.totalPages} (মোট {meta.total} জন)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors active:scale-[0.96]"
            >
              <CaretLeft size={15} weight="bold" />
            </button>
            <button
              onClick={() => setPage(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors active:scale-[0.96]"
            >
              <CaretRight size={15} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
