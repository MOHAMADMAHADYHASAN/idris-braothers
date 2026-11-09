'use client';

import React from 'react';
import { Truck, HandCoins, Users, UserPlus } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useSupplierKhataStore } from '../useSupplierKhataStore';

export function SupplierKpiSummary() {
  const { suppliers, meta, openModal } = useSupplierKhataStore();

  // Calculate total payable from currently visible/loaded suppliers
  const totalPayable = suppliers.reduce(
    (acc, s) => (s.currentPayable > 0 ? acc + s.currentPayable : acc),
    0
  );
  const payableCount = suppliers.filter((s) => s.currentPayable > 0).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* ১. মোট মহাজন দেনা */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-ink-muted">মোট মহাজন দেনা</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center">
            <Truck size={18} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {formatCurrency(totalPayable)}
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">মোকাম ও মিলে মোট অপরিশোধিত পাওনা</p>
        </div>
      </div>

      {/* ২. পাওনাদার মহাজনের সংখ্যা */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-ink-muted">পাওনাদার আড়তদার</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center">
            <HandCoins size={18} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold font-mono text-ink-primary tabular-nums">
            {payableCount} <span className="text-xs font-normal text-ink-muted">টি গদি</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">যাদের পাওনা এখনো বাকি রয়েছে</p>
        </div>
      </div>

      {/* ৩. মোট নিবন্ধিত মহাজন */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-ink-muted">মোট তালিকাভুক্ত মহাজন</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center">
            <Users size={18} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold font-mono text-ink-primary tabular-nums">
            {meta.total} <span className="text-xs font-normal text-ink-muted">জন</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">খাতুনগঞ্জ, মৌলভীবাজার ও স্থানীয় মিল</p>
        </div>
      </div>

      {/* ৪. নতুন মহাজন এন্ট্রি বোতাম */}
      <div className="bg-amber-50/60 border border-amber-200/70 p-3.5 sm:p-4 rounded-xl flex flex-col justify-between">
        <div>
          <span className="text-xs sm:text-sm font-semibold text-amber-900">নতুন মহাজন যুক্ত করুন</span>
          <p className="text-[11px] text-amber-700/90 mt-0.5">নতুন আড়ত, মিল বা আমদানিকারক</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="mt-3 w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-98"
        >
          <UserPlus size={16} weight="bold" />
          <span>+ নতুন মহাজন খাতা</span>
        </button>
      </div>
    </div>
  );
}
