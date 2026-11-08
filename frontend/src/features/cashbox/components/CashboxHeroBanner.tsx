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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      {/* টপ হেডার ও ডেট পিকার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Wallet size={20} weight="bold" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-ink-primary leading-tight">
              দৈনিক ক্যাশবাক্স ক্লোজিং ও রিকনসিলিয়েশন
            </h2>
            <p className="text-[11px] text-ink-muted">
              নগদ গ্রহণ (ইনফ্লো) - নগদ প্রদান (আউটফ্লো) = ড্রয়ারে অবশিষ্ট ক্যাশ
            </p>
          </div>
        </div>

        {/* তারিখ সিলেক্টর ও প্রিন্ট স্লিপ বাটন */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-ink-primary">
            <CalendarBlank size={15} weight="bold" className="text-slate-400" />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={openClosingReceipt}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
            title="দিনের শেষে ক্যাশবাক্স ক্লোজিং স্লিপ প্রিন্ট করুন"
          >
            <Printer size={15} weight="bold" />
            <span className="hidden sm:inline">ক্লোজিং স্লিপ</span>
          </button>
        </div>
      </div>

      {/* ৩-হিরো মেট্রিক্স স্ট্রিপ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* ১. মোট ক্যাশ ইন (Inflow) */}
        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
              <ArrowDownLeft size={16} weight="bold" className="text-emerald-600" />
              <span>মোট ক্যাশ গ্রহণ (Inflow)</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              +{summary?.inflow.salesCount || 0} বিক্রি / +{summary?.inflow.customerRepaymentsCount || 0} উশুল
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 tabular-nums">
              +{formatCurrency(totalIn)}
            </span>
            <p className="text-[11px] text-emerald-800/80 mt-0.5">
              বিক্রি ও কাস্টমার বাকি আদায় থেকে প্রাপ্ত
            </p>
          </div>
        </div>

        {/* ২. মোট ক্যাশ আউট (Outflow) */}
        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <ArrowUpRight size={16} weight="bold" className="text-amber-600" />
              <span>মোট ক্যাশ প্রদান (Outflow)</span>
            </span>
            <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              {summary?.outflow.purchasesCount || 0} চালান / {summary?.outflow.expensesCount || 0} খরচ
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-700 tabular-nums">
              -{formatCurrency(totalOut)}
            </span>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              চালান মাল, মহাজন পেমেন্ট ও দোকানের খরচ
            </p>
          </div>
        </div>

        {/* ৩. ড্রয়ারে নেট ক্যাশ (Net Cash in Hand) */}
        <div className="bg-slate-900 rounded-xl p-4 text-white flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Coins size={16} weight="bold" className="text-emerald-400" />
              <span>ড্রয়ারে নেট ক্যাশ (Cash in Hand)</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tabular-nums">
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
