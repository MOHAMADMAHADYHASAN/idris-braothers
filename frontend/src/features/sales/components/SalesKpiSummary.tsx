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
import {
  formatCurrency,
  formatDateBn,
  formatNumber,
  formatPercent,
} from '@/lib/decimal';
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
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-0.5">
          <span className="font-mono tabular-nums text-xs">
            তারিখ সীমা:{' '}
            <strong className="text-slate-800">{formatDateBn(resolvedDateRange.startYmd)}</strong> থেকে{' '}
            <strong className="text-slate-800">{formatDateBn(resolvedDateRange.endYmd)}</strong> (
            {formatNumber(resolvedDateRange.numDays)} দিন)
          </span>

          {growth !== null && growth !== undefined && (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
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
                {formatPercent(growth, 1, true)}
              </span>
              <span className="font-normal text-slate-600">পূর্ববর্তী সময়ের তুলনায়</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* ১. মোট মেমো সংখ্যা */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              মোট মেমো সংখ্যা
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
              <Receipt size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
              {formatNumber(totalInvoices)}
            </div>
          </div>
        </div>

        {/* ২. সর্বমোট বিক্রয় বিল */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              সর্বমোট বিক্রয় বিল
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
              <Coins size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-brand-deep">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
        </div>

        {/* ৩. নগদ আদায় */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">
              নগদ আদায়
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <HandCoins size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-emerald-700">
              {formatCurrency(totalCashPaid)}
            </div>
          </div>
        </div>

        {/* ৪. বাকি বিক্রি */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">
              বাকি বিক্রি
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Scales size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-amber-800">
              {formatCurrency(totalDues)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
