'use client';

import React from 'react';
import Link from 'next/link';
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
    <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col justify-between space-y-2.5">
      {/* টপ সেকশন: নাম, মোবাইল ও টাইপ */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{customer.name}</h4>
            {customer.customerType === 'WHOLESALE' ? (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                পাইকারি
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                খুচরা
              </span>
            )}
          </div>

          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-mono tabular-nums tracking-tight mt-0.5 hover:text-slate-900"
            >
              <Phone size={11} weight="bold" />
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
            type="button"
            onClick={() => openModal('adjustment', customer)}
            className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-[background-color,color] duration-150 active:scale-[0.96]"
            title="হিসাব সমন্বয়"
          >
            <SlidersHorizontal size={14} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => openModal('edit', customer)}
            className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-[background-color,color] duration-150 active:scale-[0.96]"
            title="এডিট"
          >
            <PencilSimple size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* মিডল সেকশন: বর্তমান বকেয়া স্ট্যাটাস */}
      <div className="bg-slate-50/70 p-2.5 rounded-md border border-slate-200/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium">বর্তমান ব্যালেন্স:</span>
        <div>
          {isDue ? (
            <div className="text-right">
              <span className="font-mono tabular-nums tracking-tight font-black text-rose-700 text-sm">
                {formatCurrency(customer.currentDue)}
              </span>
              <span className="block text-[10px] text-rose-500 font-semibold text-right">
                বাকি পাওনা
              </span>
            </div>
          ) : isAdvance ? (
            <div className="text-right">
              <span className="font-mono tabular-nums tracking-tight font-black text-emerald-700 text-sm">
                {formatCurrency(Math.abs(customer.currentDue))}
              </span>
              <span className="block text-[10px] text-emerald-600 font-semibold text-right">
                অগ্রিম জমা
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium text-slate-500">পরিশোধিত (০.০০)</span>
          )}
        </div>
      </div>

      {/* পিনড বটম ফুটার অ্যাকশনস */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <Link
          href={`/khata/customers/${customer.id}`}
          className="h-8 px-3 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-[background-color] duration-150 active:scale-[0.98]"
        >
          <Scroll size={14} weight="bold" className="text-slate-500" />
          <span>খতিয়ান দেখুন</span>
        </Link>

        <button
          type="button"
          onClick={() => openModal('payment', customer)}
          className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-2xs transition-[background-color,transform] duration-150 active:scale-[0.98]"
        >
          <HandCoins size={15} weight="bold" />
          <span>উশুল নিন</span>
        </button>
      </div>
    </div>
  );
}
