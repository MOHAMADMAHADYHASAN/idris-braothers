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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* ১. মোট মহাজন দেনা */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">মোট মহাজন দেনা</span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Truck size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-amber-700">
            {formatCurrency(totalPayable)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">মোকাম ও মিলে মোট অপরিশোধিত পাওনা</p>
        </div>
      </div>

      {/* ২. পাওনাদার মহাজনের সংখ্যা */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">পাওনাদার আড়তদার</span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <HandCoins size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
            {payableCount} <span className="text-xs font-normal text-slate-400">টি গদি</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">যাদের পাওনা এখনো বাকি রয়েছে</p>
        </div>
      </div>

      {/* ৩. মোট নিবন্ধিত মহাজন */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">মোট তালিকাভুক্ত মহাজন</span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Users size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
            {meta.total} <span className="text-xs font-normal text-slate-400">জন</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">খাতুনগঞ্জ, মৌলভীবাজার ও স্থানীয় মিল</p>
        </div>
      </div>

      {/* ৪. নতুন মহাজন এন্ট্রি বোতাম */}
      <div className="bg-slate-50/70 border border-slate-200/90 p-3.5 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-900">নতুন মহাজন যুক্ত করুন</span>
          <p className="text-[11px] text-slate-500 mt-0.5">নতুন আড়ত, মিল বা আমদানিকারক</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="mt-2.5 w-full py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-[background-color,transform] duration-150 shadow-[0_1px_2px_rgba(15,23,42,0.08)] active:scale-[0.98]"
        >
          <UserPlus size={15} weight="bold" />
          <span>+ নতুন মহাজন খাতা</span>
        </button>
      </div>
    </div>
  );
}
