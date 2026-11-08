'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Wallet,
  Storefront,
  Calculator,
  Receipt,
  Buildings,
} from '@phosphor-icons/react';
import { useCashboxStore } from '@/features/cashbox/useCashboxStore';
import { CashboxHeroBanner } from '@/features/cashbox/components/CashboxHeroBanner';
import { QuickExpenseBar } from '@/features/cashbox/components/QuickExpenseBar';
import { CashboxReconciliationCard } from '@/features/cashbox/components/CashboxReconciliationCard';
import { ExpenseHistoryTable } from '@/features/cashbox/components/ExpenseHistoryTable';
import { ExpenseEditModal } from '@/features/cashbox/components/ExpenseEditModal';
import { CashboxClosingReceipt } from '@/features/cashbox/components/CashboxClosingReceipt';

export default function CashboxPage() {
  const { fetchSummary, fetchExpenses } = useCashboxStore();
  const [activeTab, setActiveTab] = useState<'reconciliation' | 'expenses'>('reconciliation');

  useEffect(() => {
    fetchSummary();
    fetchExpenses();
  }, [fetchSummary, fetchExpenses]);

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col">
      {/* গ্লোবাল টপবার */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="ড্যাশবোর্ডে ফিরে যান"
            >
              <ArrowLeft size={18} weight="bold" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Wallet size={20} weight="bold" />
              </div>
              <div>
                <h1 className="font-bold text-ink-primary text-sm sm:text-base leading-tight">
                  দৈনিক ক্যাশবাক্স ও দোকান খরচ
                </h1>
                <p className="text-[11px] text-ink-muted">
                  মরিচপট্টি, ফেনী বাজার — ড্রয়ার রিকনসিলিয়েশন ও ক্যাশ ক্লোজিং
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/khata/suppliers"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Buildings size={16} weight="bold" />
              <span className="hidden sm:inline">মহাজন খাতা</span>
            </Link>
            <Link
              href="/pos"
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-200"
            >
              <Storefront size={16} weight="bold" />
              <span className="hidden sm:inline">কাউন্টার বিলিং</span>
            </Link>
          </div>
        </div>
      </header>

      {/* মূল কন্টেন্ট এরিয়া */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* ১. টপ ক্যাশবাক্স হিরো স্ট্রিপ */}
        <CashboxHeroBanner />

        {/* ২. ঝটপট খরচ এন্ট্রি বার */}
        <QuickExpenseBar />

        {/* ৩. ট্যাব নেভিগেশন */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'reconciliation'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calculator size={16} weight="bold" />
            <span>ক্যাশবাক্স রিকনসিলিয়েশন ও নোট গণক</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'expenses'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Receipt size={16} weight="bold" />
            <span>দৈনিক খরচের খাতা ও রেজিস্টার</span>
          </button>
        </div>

        {/* ৪. নির্বাচিত ট্যাব অনুযায়ী কন্টেন্ট */}
        {activeTab === 'reconciliation' ? (
          <CashboxReconciliationCard />
        ) : (
          <ExpenseHistoryTable />
        )}
      </main>

      {/* ৫. মোডালসমূহ */}
      <ExpenseEditModal />
      <CashboxClosingReceipt />
    </div>
  );
}
