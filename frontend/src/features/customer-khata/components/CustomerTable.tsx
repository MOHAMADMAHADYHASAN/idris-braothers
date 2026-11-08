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
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center">
        <div className="inline-block animate-spin text-emerald-600 mb-2">
          <Scroll size={32} weight="bold" />
        </div>
        <p className="text-sm text-ink-muted">কাস্টমার খাতা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <User size={24} weight="bold" />
        </div>
        <h3 className="text-base font-semibold text-ink-primary">কোনো কাস্টমার পাওয়া যায়নি</h3>
        <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
          আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো কাস্টমার খাতা খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করুন অথবা নতুন কাস্টমার যুক্ত করুন।
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
              <th className="py-3 px-4">গ্রাহকের নাম ও মোবাইল</th>
              <th className="py-3 px-3">টাইপ</th>
              <th className="py-3 px-3">ঠিকানা / এলাকা</th>
              <th className="py-3 px-4 text-right">বর্তমান বকেয়া (৳)</th>
              <th className="py-3 px-4 text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => {
              const isDue = c.currentDue > 0;
              const isAdvance = c.currentDue < 0;

              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* কাস্টমার নাম ও মোবাইল */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-ink-primary text-sm flex items-center gap-1.5">
                      <span>{c.name}</span>
                    </div>
                    {c.phone ? (
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                        <Phone size={12} weight="bold" className="text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">মোবাইল নেই</span>
                    )}
                  </td>

                  {/* টাইপ ব্যাজ */}
                  <td className="py-3 px-3">
                    {c.customerType === 'WHOLESALE' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        পাইকারি
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        খুচরা
                      </span>
                    )}
                  </td>

                  {/* ঠিকানা */}
                  <td className="py-3 px-3 text-slate-600 text-xs">
                    {c.address ? (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} weight="bold" className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{c.address}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* বর্তমান বকেয়া */}
                  <td className="py-3 px-4 text-right">
                    {isDue ? (
                      <div className="inline-block text-right">
                        <span className="font-mono font-bold text-red-600 text-base tabular-nums">
                          {formatCurrency(c.currentDue)}
                        </span>
                        <span className="block text-[10px] text-red-500 font-medium uppercase tracking-wider">
                          বকেয়া পাওনা
                        </span>
                      </div>
                    ) : isAdvance ? (
                      <div className="inline-block text-right">
                        <span className="font-mono font-bold text-emerald-600 text-base tabular-nums">
                          {formatCurrency(Math.abs(c.currentDue))}
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-medium uppercase tracking-wider">
                          অগ্রিম জমা
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
                      {/* উশুল নিন বাটন */}
                      <button
                        onClick={() => openModal('payment', c)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 transition-colors active:scale-95 shadow-xs"
                        title="নগদ বকেয়া উশুল / জমা গ্রহণ করুন"
                      >
                        <HandCoins size={15} weight="bold" />
                        <span>উশুল</span>
                      </button>

                      {/* খতিয়ান বিবরণী বাটন */}
                      <button
                        onClick={() => openModal('ledger', c)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-ink-primary text-xs font-medium flex items-center gap-1 transition-colors"
                        title="রানিং খতিয়ান ও লেনদেন স্টেটমেন্ট"
                      >
                        <Scroll size={15} weight="bold" className="text-slate-500" />
                        <span>খতিয়ান</span>
                      </button>

                      {/* হিসাব সমন্বয় (ছাড়) */}
                      <button
                        onClick={() => openModal('adjustment', c)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-ink-primary transition-colors"
                        title="হিসাব সমন্বয় / ছাড় দিন"
                      >
                        <SlidersHorizontal size={15} weight="bold" />
                      </button>

                      {/* এডিট */}
                      <button
                        onClick={() => openModal('edit', c)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-ink-primary transition-colors"
                        title="কাস্টমার তথ্য এডিট করুন"
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
            পৃষ্ঠা <strong className="text-ink-primary">{meta.page}</strong> / {meta.totalPages} (মোট {meta.total} জন)
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
