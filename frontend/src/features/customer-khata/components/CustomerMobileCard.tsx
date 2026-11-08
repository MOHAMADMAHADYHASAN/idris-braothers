'use client';

import React from 'react';
import {
  HandCoins,
  Scroll,
  PencilSimple,
  SlidersHorizontal,
  Phone,
  MapPin,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useCustomerKhataStore } from '../useCustomerKhataStore';
import { Customer } from '../customerKhata.types';

export function CustomerMobileCard({ customer }: { customer: Customer }) {
  const { openModal } = useCustomerKhataStore();

  const isDue = customer.currentDue > 0;
  const isAdvance = customer.currentDue < 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col justify-between space-y-3">
      {/* টপ সেকশন: নাম, মোবাইল ও টাইপ */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-bold text-ink-primary text-sm truncate">{customer.name}</h4>
            {customer.customerType === 'WHOLESALE' ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                পাইকারি
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                খুচরা
              </span>
            )}
          </div>

          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-1 text-xs text-emerald-700 font-mono tabular-nums mt-0.5"
            >
              <Phone size={12} weight="bold" />
              <span>{customer.phone}</span>
            </a>
          )}

          {customer.address && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
              <MapPin size={11} weight="bold" className="shrink-0 text-slate-400" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}
        </div>

        {/* এডিট ও অ্যাডজাস্টমেন্ট বাটন */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => openModal('adjustment', customer)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-ink-primary active:bg-slate-100"
            title="হিসাব সমন্বয়"
          >
            <SlidersHorizontal size={14} weight="bold" />
          </button>
          <button
            onClick={() => openModal('edit', customer)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-ink-primary active:bg-slate-100"
            title="এডিট"
          >
            <PencilSimple size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* মিডল সেকশন: বর্তমান বকেয়া স্ট্যাটাস */}
      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
        <span className="text-xs text-ink-muted font-medium">বর্তমান ব্যালেন্স:</span>
        <div>
          {isDue ? (
            <div className="text-right">
              <span className="font-mono font-bold text-red-600 text-base tabular-nums">
                {formatCurrency(customer.currentDue)}
              </span>
              <span className="block text-[10px] text-red-500 font-semibold text-right">
                বাকি পাওনা
              </span>
            </div>
          ) : isAdvance ? (
            <div className="text-right">
              <span className="font-mono font-bold text-emerald-600 text-base tabular-nums">
                {formatCurrency(Math.abs(customer.currentDue))}
              </span>
              <span className="block text-[10px] text-emerald-600 font-semibold text-right">
                অগ্রিম জমা
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-500">পরিশোধিত (০.০০)</span>
          )}
        </div>
      </div>

      {/* পিনড বটম ফুটার অ্যাকশনস (মিনিমাম ৪০px উচ্চতা) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => openModal('ledger', customer)}
          className="h-10 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-ink-primary text-xs font-medium flex items-center justify-center gap-1.5 transition-colors active:scale-98"
        >
          <Scroll size={16} weight="bold" className="text-slate-500" />
          <span>খতিয়ান দেখুন</span>
        </button>

        <button
          onClick={() => openModal('payment', customer)}
          className="h-10 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-98 shadow-xs"
        >
          <HandCoins size={18} weight="bold" />
          <span>৳ উশুল নিন</span>
        </button>
      </div>
    </div>
  );
}
