'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
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
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';

export default function CashboxPage() {
  const { fetchSummary, fetchExpenses } = useCashboxStore();
  const [activeTab, setActiveTab] = useState<'reconciliation' | 'expenses'>('reconciliation');

  useEffect(() => {
    fetchSummary();
    fetchExpenses();
  }, [fetchSummary, fetchExpenses]);

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col font-sans pb-16">
      {/* ১. স্টিকি পেজ হেডার */}
      <div className="bg-surface-card border-b border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <AdminPageHeader
            title="দৈনিক ক্যাশবাক্স ও দোকান খরচ"
            backHref="/"
            backTitle="ড্যাশবোর্ডে ফিরে যান"
            icon={<Wallet size={16} weight="bold" />}
            badge={<Badge variant="brand">ক্যাশবাক্স</Badge>}
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href="/khata/suppliers"
                  className={buttonClasses({ variant: 'secondary', size: 'xs' })}
                >
                  <Buildings size={14} weight="bold" />
                  <span className="hidden sm:inline">মহাজন খাতা</span>
                </Link>
                <Link
                  href="/pos"
                  className={buttonClasses({ variant: 'primary', size: 'xs' })}
                >
                  <Storefront size={14} weight="bold" />
                  <span className="hidden sm:inline">কাউন্টার বিলিং</span>
                </Link>
              </div>
            }
          />
        </div>
      </div>

      {/* মূল কন্টেন্ট এরিয়া */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
        <CashboxHeroBanner />
        <QuickExpenseBar />

        {/* ৩. ট্যাব নেভিগেশন */}
        <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-lg border border-border-default w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('reconciliation')}
            className={`py-1.5 px-3.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-[background-color,color,box-shadow] duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'reconciliation'
                ? 'bg-brand-deep text-white shadow-2xs'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Calculator size={14} weight="bold" />
            <span>ক্যাশ ও নোট মেলানো</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`py-1.5 px-3.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-[background-color,color,box-shadow] duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-brand-deep text-white shadow-2xs'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Receipt size={14} weight="bold" />
            <span>দৈনিক খরচের তালিকা</span>
          </button>
        </div>

        {activeTab === 'reconciliation' ? (
          <CashboxReconciliationCard />
        ) : (
          <ExpenseHistoryTable />
        )}
      </main>

      <ExpenseEditModal />
      <CashboxClosingReceipt />
    </div>
  );
}
