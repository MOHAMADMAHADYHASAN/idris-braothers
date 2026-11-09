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
                <Truck size={16} weight="bold" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                  মহাজন চালান এন্ট্রি ও স্টক ইন
                </h1>
                <p className="text-[11px] text-slate-500">
                  মরিচপট্টি, ফেনী বাজার — মোকাম চালান, বস্তা সাইজ ও কেনা দর
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
              <span className="hidden sm:inline">পিওএস কাউন্টার</span>
            </Link>
          </div>
        </div>
      </header>

      {/* মূল কন্টেন্ট এরিয়া */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3.5">
        {/* ট্যাব নেভিগেশন - Linear-Grade Segmented Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200/80 w-fit">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] ${
              activeTab === 'new'
                ? 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus size={14} weight="bold" />
            <span>+ নতুন চালান এন্ট্রি</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt size={14} weight="bold" />
            <span>বিগত চালান রেজিস্টার</span>
          </button>
        </div>

        {/* নতুন চালান এন্ট্রি লেআউট (Desktop 60/40 Split View) */}
        {activeTab === 'new' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* বাঁয়ে: চালান হেডার, আইটেম ইনপুট ও কার্ট টেবিল (৭ কলাম) */}
            <div className="lg:col-span-7 space-y-3.5">
              <ChallanHeaderForm />
              <ChallanItemEntry />
              <ChallanItemsTable />
            </div>

            {/* ডানে: আর্থিক হিসাব ও সেটেলমেন্ট (৫ কলাম, স্টিকি) */}
            <div className="lg:col-span-5 lg:sticky lg:top-18 space-y-3.5">
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
