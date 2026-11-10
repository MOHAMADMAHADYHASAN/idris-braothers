'use client';

import React from 'react';
import { Truck, HandCoins, Users, UserPlus } from '@phosphor-icons/react';
import { formatCurrency, formatNumber } from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
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
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">মোট মহাজন দেনা</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
            <Truck size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-amber-800">
            {formatCurrency(totalPayable)}
          </div>
        </div>
      </div>

      {/* ২. পাওনাদার মহাজনের সংখ্যা */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">পাওনাদার আড়তদার</span>
          <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center shrink-0">
            <HandCoins size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
            {formatNumber(payableCount)} <span className="text-xs font-medium text-slate-600 font-sans">টি গদি</span>
          </div>
        </div>
      </div>

      {/* ৩. মোট নিবন্ধিত মহাজন */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">মোট তালিকাভুক্ত মহাজন</span>
          <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center shrink-0">
            <Users size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
            {formatNumber(meta.total)} <span className="text-xs font-medium text-slate-600 font-sans">জন</span>
          </div>
        </div>
      </div>

      {/* ৪. নতুন মহাজন এন্ট্রি বোতাম */}
      <div className="bg-brand-soft/45 border border-brand-light/70 p-3.5 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-brand-deep">নতুন মহাজন যুক্ত করুন</span>
        </div>
        <button
          type="button"
          onClick={() => openModal('create')}
          className={buttonClasses({ variant: 'primary', size: 'sm', className: 'mt-2.5 w-full gap-1.5' })}
        >
          <UserPlus size={15} weight="bold" />
          <span>+ নতুন মহাজন খাতা</span>
        </button>
      </div>
    </div>
  );
}
