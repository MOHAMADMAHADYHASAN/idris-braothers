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
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-secondary px-0.5">
          <span className="font-mono tabular-nums text-xs">
            তারিখ সীমা:{' '}
            <strong className="text-ink-primary">{formatDateBn(resolvedDateRange.startYmd)}</strong> থেকে{' '}
            <strong className="text-ink-primary">{formatDateBn(resolvedDateRange.endYmd)}</strong> (
            {formatNumber(resolvedDateRange.numDays)} দিন)
          </span>

          {growth !== null && growth !== undefined && (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                isPositiveGrowth
                  ? 'bg-cash-bg text-cash-text border-cash-border'
                  : 'bg-due-bg text-due-text border-due-border'
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
              <span className="font-normal text-ink-secondary">পূর্ববর্তী সময়ের তুলনায়</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* ১. মোট মেমো সংখ্যা */}
        <div className="bg-surface-card rounded-xl border border-border-default p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-secondary">
              মোট মেমো সংখ্যা
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
              <Receipt size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-ink-primary">
              {formatNumber(totalInvoices)}
            </div>
          </div>
        </div>

        {/* ২. সর্বমোট বিক্রয় বিল */}
        <div className="bg-surface-card rounded-xl border border-border-default p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-secondary">
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
        <div className="bg-surface-card rounded-xl border border-border-default p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cash-text">
              নগদ আদায়
            </span>
            <div className="w-7 h-7 rounded-lg bg-cash-bg border border-cash-border text-cash-text flex items-center justify-center">
              <HandCoins size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-cash-text">
              {formatCurrency(totalCashPaid)}
            </div>
          </div>
        </div>

        {/* ৪. বাকি বিক্রি */}
        <div className="bg-surface-card rounded-xl border border-border-default p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-wholesale-text">
              বাকি বিক্রি
            </span>
            <div className="w-7 h-7 rounded-lg bg-wholesale-bg border border-wholesale-border text-wholesale-text flex items-center justify-center">
              <Scales size={15} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-wholesale-text">
              {formatCurrency(totalDues)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
