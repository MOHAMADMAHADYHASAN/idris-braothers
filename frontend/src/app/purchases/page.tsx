'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Truck,
  Plus,
  Receipt,
  Storefront,
  Buildings,
} from '@phosphor-icons/react';
import { ChallanHeaderForm } from '@/features/purchase/components/ChallanHeaderForm';
import { ChallanItemEntry } from '@/features/purchase/components/ChallanItemEntry';
import { ChallanItemsTable } from '@/features/purchase/components/ChallanItemsTable';
import { ChallanSummarySettlement } from '@/features/purchase/components/ChallanSummarySettlement';
import { PurchaseHistoryTable } from '@/features/purchase/components/PurchaseHistoryTable';
import { PurchaseDetailModal } from '@/features/purchase/components/PurchaseDetailModal';

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

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
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Truck size={20} weight="bold" />
              </div>
              <div>
                <h1 className="font-bold text-ink-primary text-sm sm:text-base leading-tight">
                  মহাজন চালান এন্ট্রি ও স্টক ইন
                </h1>
                <p className="text-[11px] text-ink-muted">
                  মরিচপট্টি, ফেনী বাজার — মোকাম চালান, বস্তা সাইজ ও কেনা দর
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
              <span className="hidden sm:inline">পিওএস কাউন্টার</span>
            </Link>
          </div>
        </div>
      </header>

      {/* মূল কন্টেন্ট এরিয়া */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* ট্যাব নেভিগেশন */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'new'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Plus size={16} weight="bold" />
            <span>+ নতুন চালান এন্ট্রি</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Receipt size={16} weight="bold" />
            <span>বিগত চালান রেজিস্টার</span>
          </button>
        </div>

        {/* নতুন চালান এন্ট্রি লেআউট (Desktop 60/40 Split View) */}
        {activeTab === 'new' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* বাঁয়ে: চালান হেডার, আইটেম ইনপুট ও কার্ট টেবিল (৭ কলাম) */}
            <div className="lg:col-span-7 space-y-4">
              <ChallanHeaderForm />
              <ChallanItemEntry />
              <ChallanItemsTable />
            </div>

            {/* ডানে: আর্থিক হিসাব ও সেটেলমেন্ট (৫ কলাম, স্টিকি) */}
            <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
              <ChallanSummarySettlement />
            </div>
          </div>
        ) : (
          /* চালান রেজিস্টার হিস্ট্রি টেবিল */
          <div>
            <PurchaseHistoryTable />
          </div>
        )}
      </main>

      {/* চালান বিস্তারিত ভিউ মোডাল */}
      <PurchaseDetailModal />
    </div>
  );
}
