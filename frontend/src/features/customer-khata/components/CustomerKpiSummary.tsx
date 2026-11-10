'use client';

import React from 'react';
import { Users, Receipt, Coins, UserPlus } from '@phosphor-icons/react';
import { formatCurrency, formatNumber } from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
import { useCustomerKhataStore } from '../useCustomerKhataStore';

export function CustomerKpiSummary() {
  const { customers, meta, openModal } = useCustomerKhataStore();

  // Calculate total due from currently visible/loaded debtors
  const totalDue = customers.reduce((acc, c) => (c.currentDue > 0 ? acc + c.currentDue : acc), 0);
  const dueHoldersCount = customers.filter((c) => c.currentDue > 0).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. মোট বকেয়া */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">মোট বাজার বকেয়া</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center shrink-0">
            <Coins size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-rose-700">
            {formatCurrency(totalDue)}
          </div>
        </div>
      </div>

      {/* 2. বকেয়াদার সংখ্যা */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">বকেয়াদার কাস্টমার</span>
          <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center shrink-0">
            <Receipt size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
            {formatNumber(dueHoldersCount)} <span className="text-xs font-medium text-slate-600 font-sans">জন</span>
          </div>
        </div>
      </div>

      {/* 3. মোট রেজিস্টার্ড কাস্টমার */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">মোট নিবন্ধিত খাতা</span>
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

      {/* 4. নতুন কাস্টমার খাতা খোলার বাটন */}
      <div className="bg-brand-soft/45 border border-brand-light/70 p-3.5 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-brand-deep">নতুন খাতা তৈরি</span>
        </div>
        <button
          type="button"
          onClick={() => openModal('create')}
          className={buttonClasses({ variant: 'primary', size: 'sm', className: 'mt-2.5 w-full gap-1.5' })}
        >
          <UserPlus size={15} weight="bold" />
          <span>+ নতুন কাস্টমার</span>
        </button>
      </div>
    </div>
  );
}
