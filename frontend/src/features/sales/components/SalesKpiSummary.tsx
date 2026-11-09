'use client';

import React from 'react';
import {
  Receipt,
  Coins,
  HandCoins,
  Scales,
  TrendUp,
  TrendDown,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useSalesStore } from '../useSalesStore';

export function SalesKpiSummary() {
  const { sales, periodComparison, resolvedDateRange } = useSalesStore();

  const completedSales = sales.filter((s) => s.status !== 'CANCELLED');
  const totalInvoices = completedSales.length;
  const totalRevenue = completedSales.reduce((acc, s) => acc + Number(s.grandTotal || 0), 0);
  const totalCashPaid = completedSales.reduce((acc, s) => acc + Number(s.paidAmount || 0), 0);
  const totalDues = completedSales.reduce((acc, s) => acc + Number(s.dueAmount || 0), 0);

  const growth = periodComparison?.growthPercent;
  const isPositiveGrowth = growth !== null && growth !== undefined && growth >= 0;

  return (
    <div className="space-y-2">
      {/* Date Range & Period Comparison Info Strip */}
      {resolvedDateRange && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
          <span className="font-mono tabular-nums text-[11px]">
            তারিখ সীমা: <strong className="text-slate-800">{resolvedDateRange.startYmd}</strong> থেকে{' '}
            <strong className="text-slate-800">{resolvedDateRange.endYmd}</strong> ({resolvedDateRange.numDays} দিন)
          </span>

          {growth !== null && growth !== undefined && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isPositiveGrowth
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isPositiveGrowth ? (
                <TrendUp size={13} weight="bold" />
              ) : (
                <TrendDown size={13} weight="bold" />
              )}
              <span className="font-mono tabular-nums">
                {isPositiveGrowth ? `+${growth}%` : `${growth}%`}
              </span>
              <span className="text-[10px] font-normal text-slate-500">পূর্ববর্তী সময়ের তুলনায়</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* ১. মোট মেমো সংখ্যা */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              মোট মেমো সংখ্যা
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
              <Receipt size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
              {totalInvoices}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              সম্পন্ন বিক্রয় ভাউচার
            </span>
          </div>
        </div>

        {/* ২. সর্বমোট বিক্রয় রাজস্ব */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              সর্বমোট বিক্রয় বিল
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
              <Coins size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
              ৳{formatCurrency(totalRevenue)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              ছাড় পরবর্তী সর্বমোট প্রদেয়
            </span>
          </div>
        </div>

        {/* ৩. নগদ আদায় (Cash Received) */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              নগদ আদায় (Cash)
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <HandCoins size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-emerald-700">
              ৳{formatCurrency(totalCashPaid)}
            </div>
            <span className="text-[10px] text-emerald-800 mt-0.5 block">
              ক্যাশবাক্সে সরাসরি জমা
            </span>
          </div>
        </div>

        {/* ৪. বকেয়া বাকি (Dues Outstanding) */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              বাকি বিক্রি (Dues)
            </span>
            <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Scales size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-amber-800">
              ৳{formatCurrency(totalDues)}
            </div>
            <span className="text-[10px] text-amber-700 mt-0.5 block">
              কাস্টমার খাতায় বকেয়া
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
