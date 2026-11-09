'use client';

import React from 'react';
import { Users, Receipt, Coins, UserPlus } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useCustomerKhataStore } from '../useCustomerKhataStore';

export function CustomerKpiSummary() {
  const { customers, meta, openModal } = useCustomerKhataStore();

  // Calculate total due from currently visible/loaded debtors
  const totalDue = customers.reduce((acc, c) => (c.currentDue > 0 ? acc + c.currentDue : acc), 0);
  const dueHoldersCount = customers.filter((c) => c.currentDue > 0).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. মোট বকেয়া */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-ink-muted">মোট বাজার বকেয়া</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center">
            <Coins size={18} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold font-mono text-red-600 tabular-nums">
            {formatCurrency(totalDue)}
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">বর্তমান ফিল্টারে থাকা মোট পাওনা</p>
        </div>
      </div>

      {/* 2. বকেয়াদার সংখ্যা */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-ink-muted">বকেয়াদার কাস্টমার</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center">
            <Receipt size={18} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold font-mono text-ink-primary tabular-nums">
            {dueHoldersCount} <span className="text-xs font-normal text-ink-muted">জন</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">যাদের কাছে বাকি পাওনা আছে</p>
        </div>
      </div>

      {/* 3. মোট রেজিস্টার্ড কাস্টমার */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-ink-muted">মোট নিবন্ধিত খাতা</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center">
            <Users size={18} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold font-mono text-ink-primary tabular-nums">
            {meta.total} <span className="text-xs font-normal text-ink-muted">জন</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">খুচরা ও পাইকারি সর্বমোট কাস্টমার</p>
        </div>
      </div>

      {/* 4. নতুন কাস্টমার খাতা খোলার বাটন */}
      <div className="bg-emerald-50/60 border border-emerald-200/70 p-3.5 sm:p-4 rounded-xl flex flex-col justify-between">
        <div>
          <span className="text-xs sm:text-sm font-semibold text-emerald-900">নতুন খাতা তৈরি</span>
          <p className="text-[11px] text-emerald-700/90 mt-0.5">নতুন গ্রাহক বা দোকানদার যুক্ত করুন</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="mt-3 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-98"
        >
          <UserPlus size={16} weight="bold" />
          <span>+ নতুন কাস্টমার</span>
        </button>
      </div>
    </div>
  );
}
