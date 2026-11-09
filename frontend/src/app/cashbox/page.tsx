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
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* গ্লোবাল টপবার */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
              title="ড্যাশবোর্ডে ফিরে যান"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
                <Wallet size={16} weight="bold" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                  দৈনিক ক্যাশবাক্স ও দোকান খরচ
                </h1>
                <p className="text-[11px] text-slate-500">
                  মরিচপট্টি, ফেনী বাজার — ড্রয়ার রিকনসিলিয়েশন ও ক্যাশ ক্লোজিং
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/khata/suppliers"
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150"
            >
              <Buildings size={14} weight="bold" />
              <span className="hidden sm:inline">মহাজন খাতা</span>
            </Link>
            <Link
              href="/pos"
              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(5,150,105,0.2)]"
            >
              <Storefront size={14} weight="bold" />
              <span className="hidden sm:inline">কাউন্টার বিলিং</span>
            </Link>
          </div>
        </div>
      </header>

      {/* মূল কন্টেন্ট এরিয়া */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3.5">
        {/* ১. টপ ক্যাশবাক্স হিরো স্ট্রিপ */}
        <CashboxHeroBanner />

        {/* ২. ঝটপট খরচ এন্ট্রি বার */}
        <QuickExpenseBar />

        {/* ৩. ট্যাব নেভিগেশন - Linear-Grade Segmented Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200/80 w-fit">
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-[background-color,color,box-shadow] duration-150 active:scale-[0.98] ${
              activeTab === 'reconciliation'
                ? 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator size={14} weight="bold" />
            <span>ক্যাশবাক্স রিকনসিলিয়েশন ও নোট গণক</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-[background-color,color,box-shadow] duration-150 active:scale-[0.98] ${
              activeTab === 'expenses'
                ? 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt size={14} weight="bold" />
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
