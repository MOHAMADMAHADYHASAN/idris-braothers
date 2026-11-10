'use client';

import React from 'react';
import { Receipt, Coins, CreditCard, Bank } from '@phosphor-icons/react';
import { usePurchaseStore } from '../usePurchaseStore';
import { formatCurrency, formatNumber } from '@/lib/decimal';

export function PurchaseKpiSummary() {
  const { purchases, meta } = usePurchaseStore();

  const totalPurchases = meta?.total ?? purchases.length;
  const totalAmount = purchases.reduce((acc, p) => acc + (p.grandTotal || 0), 0);
  const totalPaid = purchases.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const totalDue = purchases.reduce((acc, p) => acc + (p.dueAmount || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* ১. মোট চালান সংখ্যা */}
      <div className="bg-surface-card p-3.5 rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-secondary">
            মোট চালান
          </span>
          <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light/70 text-brand-deep flex items-center justify-center shrink-0">
            <Receipt size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-ink-primary">
            {formatNumber(totalPurchases)}{' '}
            <span className="text-xs font-medium text-ink-secondary">টি</span>
          </div>
        </div>
      </div>

      {/* ২. মোট ক্রয়মূল্য */}
      <div className="bg-surface-card p-3.5 rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-secondary">
            মোট ক্রয় চালান বিল
          </span>
          <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light/70 text-brand-deep flex items-center justify-center shrink-0">
            <Coins size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-ink-primary truncate">
            {formatCurrency(totalAmount)}
          </div>
        </div>
      </div>

      {/* ৩. নগদ পরিশোধিত */}
      <div className="bg-surface-card p-3.5 rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-secondary">
            পরিশোধিত নগদ
          </span>
          <div className="w-8 h-8 rounded-lg bg-cash-bg border border-cash-border text-cash-text flex items-center justify-center shrink-0">
            <CreditCard size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-cash-text truncate">
            {formatCurrency(totalPaid)}
          </div>
        </div>
      </div>

      {/* ৪. মহাজন বকেয়া দেনা */}
      <div
        className={`p-3.5 rounded-xl border shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between transition-colors ${
          totalDue > 0
            ? 'bg-due-bg/45 border-due-border'
            : 'bg-surface-card border-border-default'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-semibold ${
              totalDue > 0 ? 'text-due-text' : 'text-ink-secondary'
            }`}
          >
            মহাজন বকেয়া দেনা
          </span>
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
              totalDue > 0
                ? 'bg-due-bg border-due-border text-due-text'
                : 'bg-brand-soft border-brand-light/70 text-brand-deep'
            }`}
          >
            <Bank size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div
            className={`text-xl sm:text-2xl font-black font-mono tabular-nums truncate ${
              totalDue > 0 ? 'text-due-text' : 'text-ink-primary'
            }`}
          >
            {formatCurrency(totalDue)}
          </div>
        </div>
      </div>
    </div>
  );
}
