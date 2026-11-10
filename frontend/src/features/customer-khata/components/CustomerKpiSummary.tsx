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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. মোট বকেয়া */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">মোট বাজার বকেয়া</span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Coins size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-rose-700">
            {formatCurrency(totalDue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">বর্তমান ফিল্টারে থাকা মোট পাওনা</p>
        </div>
      </div>

      {/* 2. বকেয়াদার সংখ্যা */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">বকেয়াদার কাস্টমার</span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Receipt size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
            {dueHoldersCount} <span className="text-xs font-normal text-slate-400">জন</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">যাদের কাছে বাকি পাওনা আছে</p>
        </div>
      </div>

      {/* 3. মোট রেজিস্টার্ড কাস্টমার */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">মোট নিবন্ধিত খাতা</span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Users size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
            {meta.total} <span className="text-xs font-normal text-slate-400">জন</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">খুচরা ও পাইকারি সর্বমোট কাস্টমার</p>
        </div>
      </div>

      {/* 4. নতুন কাস্টমার খাতা খোলার বাটন */}
      <div className="bg-slate-50/70 border border-slate-200/90 p-3.5 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-900">নতুন খাতা তৈরি</span>
          <p className="text-[11px] text-slate-500 mt-0.5">নতুন গ্রাহক বা দোকানদার যুক্ত করুন</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="mt-2.5 w-full py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-[background-color,transform] duration-150 shadow-[0_1px_2px_rgba(15,23,42,0.08)] active:scale-[0.98]"
        >
          <UserPlus size={15} weight="bold" />
          <span>+ নতুন কাস্টমার</span>
        </button>
      </div>
    </div>
  );
}
