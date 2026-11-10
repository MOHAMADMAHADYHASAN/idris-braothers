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
import { formatCurrency, formatNumber } from '@/lib/decimal';
import { useCashboxStore } from '../useCashboxStore';

export function CashboxHeroBanner() {
  const { summary, targetDate, setTargetDate, openClosingReceipt } = useCashboxStore();

  const totalIn = summary?.inflow.totalCashIn || 0;
  const totalOut = summary?.outflow.totalCashOut || 0;
  const netCash = summary?.netCashInHand || 0;

  return (
    <div className="bg-surface-card rounded-xl border border-border-default p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3.5">
      {/* টপ হেডার ও ডেট পিকার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-default pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
            <Wallet size={18} weight="bold" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-ink-primary leading-tight">
              দৈনিক ক্যাশবাক্স ক্লোজিং ও রিকনসিলিয়েশন
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-card border border-border-strong rounded-lg text-xs font-mono tabular-nums text-ink-primary">
            <CalendarBlank size={14} weight="bold" className="text-ink-secondary" />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={openClosingReceipt}
            className="px-3 py-1.5 rounded-lg bg-brand-deep hover:bg-brand-hover active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-[background-color,transform] duration-150 cursor-pointer"
            title="দিনের শেষে ক্যাশবাক্স ক্লোজিং স্লিপ প্রিন্ট করুন"
          >
            <Printer size={14} weight="bold" />
            <span className="hidden sm:inline">ক্লোজিং স্লিপ</span>
          </button>
        </div>
      </div>

      {/* ৩-মেট্রিক্স স্ট্রিপ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* ১. মোট ক্যাশ গ্রহণ */}
        <div className="bg-surface-card rounded-xl p-3.5 border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-ink-body flex items-center gap-1.5">
              <ArrowDownLeft size={14} weight="bold" className="text-success" />
              <span>মোট ক্যাশ গ্রহণ</span>
            </span>
            <span className="text-xs font-mono tabular-nums text-cash-text bg-cash-bg border border-cash-border px-2 py-0.5 rounded-md font-semibold">
              +{formatNumber(summary?.inflow.salesCount || 0)} বিক্রি · +{formatNumber(summary?.inflow.customerRepaymentsCount || 0)} আদায়
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-cash-text tabular-nums">
              +{formatCurrency(totalIn)}
            </span>
          </div>
        </div>

        {/* ২. মোট ক্যাশ প্রদান */}
        <div className="bg-surface-card rounded-xl p-3.5 border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-ink-body flex items-center gap-1.5">
              <ArrowUpRight size={14} weight="bold" className="text-wholesale-text" />
              <span>মোট ক্যাশ প্রদান</span>
            </span>
            <span className="text-xs font-mono tabular-nums text-wholesale-text bg-wholesale-bg border border-wholesale-border/60 px-2 py-0.5 rounded-md font-semibold">
              {formatNumber(summary?.outflow.purchasesCount || 0)} চালান · {formatNumber(summary?.outflow.expensesCount || 0)} খরচ
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-wholesale-text tabular-nums">
              -{formatCurrency(totalOut)}
            </span>
          </div>
        </div>

        {/* ৩. ড্রয়ারে নেট ক্যাশ (Soft Navy Hero Card — Anti-Fatigue) */}
        <div className="bg-brand-soft/75 rounded-xl p-3.5 text-ink-primary flex flex-col justify-between border border-brand-light shadow-[0_1px_2px_rgba(30,74,122,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-deep flex items-center gap-1.5">
              <Coins size={15} weight="bold" className="text-brand-deep" />
              <span>ড্রয়ারে নেট ক্যাশ</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-brand-deep tabular-nums">
              {formatCurrency(netCash)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
