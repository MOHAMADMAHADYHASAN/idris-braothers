'use client';

import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  CalendarBlank,
  Coins,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useCashboxStore } from '../useCashboxStore';

export function CashboxHeroBanner() {
  const { summary, targetDate, setTargetDate, openClosingReceipt } = useCashboxStore();

  const totalIn = summary?.inflow.totalCashIn || 0;
  const totalOut = summary?.outflow.totalCashOut || 0;
  const netCash = summary?.netCashInHand || 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3.5">
      {/* টপ হেডার ও ডেট পিকার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
            <Wallet size={18} weight="bold" />
          </div>
          <div>
            <h2 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
              দৈনিক ক্যাশবাক্স ক্লোজিং ও রিকনসিলিয়েশন
            </h2>
            <p className="text-[11px] text-slate-500">
              নগদ গ্রহণ (ইনফ্লো) - নগদ প্রদান (আউটফ্লো) = ড্রয়ারে অবশিষ্ট ক্যাশ
            </p>
          </div>
        </div>

        {/* তারিখ সিলেক্টর ও প্রিন্ট স্লিপ বাটন */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/90 rounded-md text-xs font-mono tabular-nums text-slate-800">
            <CalendarBlank size={14} weight="bold" className="text-slate-400" />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={openClosingReceipt}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-medium flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150"
            title="দিনের শেষে ক্যাশবাক্স ক্লোজিং স্লিপ প্রিন্ট করুন"
          >
            <Printer size={14} weight="bold" />
            <span className="hidden sm:inline">ক্লোজিং স্লিপ</span>
          </button>
        </div>
      </div>

      {/* ৩-মেট্রিক্স স্ট্রিপ - Linear Grade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* ১. মোট ক্যাশ ইন (Inflow) */}
        <div className="bg-white rounded-md p-3.5 border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ArrowDownLeft size={14} weight="bold" className="text-emerald-600" />
              <span>মোট ক্যাশ গ্রহণ (Inflow)</span>
            </span>
            <span className="text-[10px] font-mono tabular-nums text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md font-semibold">
              +{summary?.inflow.salesCount || 0} বিক্রি / +{summary?.inflow.customerRepaymentsCount || 0} উশুল
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700 tabular-nums tracking-tight">
              +{formatCurrency(totalIn)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              বিক্রি ও কাস্টমার বাকি আদায় থেকে প্রাপ্ত
            </p>
          </div>
        </div>

        {/* ২. মোট ক্যাশ আউট (Outflow) */}
        <div className="bg-white rounded-md p-3.5 border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ArrowUpRight size={14} weight="bold" className="text-amber-700" />
              <span>মোট ক্যাশ প্রদান (Outflow)</span>
            </span>
            <span className="text-[10px] font-mono tabular-nums text-amber-800 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md font-semibold">
              {summary?.outflow.purchasesCount || 0} চালান / {summary?.outflow.expensesCount || 0} খরচ
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-800 tabular-nums tracking-tight">
              -{formatCurrency(totalOut)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              চালান মাল, মহাজন পেমেন্ট ও দোকানের খরচ
            </p>
          </div>
        </div>

        {/* ৩. ড্রয়ারে নেট ক্যাশ (Net Cash in Hand) - Solid Dark Spotlight */}
        <div className="bg-slate-900 rounded-md p-3.5 text-white flex flex-col justify-between border border-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Coins size={14} weight="bold" className="text-emerald-400" />
              <span>ড্রয়ারে নেট ক্যাশ (Cash in Hand)</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tabular-nums tracking-tight">
              {formatCurrency(netCash)}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ক্যাশবাক্স গণনা শেষে ঠিক এই পরিমাণ ক্যাশ থাকবে
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
