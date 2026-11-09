'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Truck,
  Plus,
  Receipt,
  Storefront,
  Buildings,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { usePurchaseStore } from '@/features/purchase/usePurchaseStore';
import { ChallanHeaderForm } from '@/features/purchase/components/ChallanHeaderForm';
import { ChallanItemEntry } from '@/features/purchase/components/ChallanItemEntry';
import { ChallanItemsTable } from '@/features/purchase/components/ChallanItemsTable';
import { ChallanSummarySettlement } from '@/features/purchase/components/ChallanSummarySettlement';
import { PurchaseHistoryTable } from '@/features/purchase/components/PurchaseHistoryTable';
import { PurchaseMobileCard } from '@/features/purchase/components/PurchaseMobileCard';
import { PurchaseKpiSummary } from '@/features/purchase/components/PurchaseKpiSummary';
import { PurchaseDetailModal } from '@/features/purchase/components/PurchaseDetailModal';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { UnifiedDateRangeFilter } from '@/components/shared/UnifiedDateRangeFilter';
import { ResolvedDateRange } from '@/lib/dateFilter';

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  const {
    purchases,
    meta,
    isLoadingHistory,
    fetchPurchases,
    openDetailModal,
    setDateRange,
    setPage,
  } = usePurchaseStore();

  const handleRangeChange = useCallback(
    (range: ResolvedDateRange) => {
      setDateRange(range.startYmd, range.endYmd);
    },
    [setDateRange]
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans pb-16">
      {/* ১. স্টিকি পেজ হেডার (AdminPageHeader) */}
      <div className="bg-white border-b border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <AdminPageHeader
            title="মহাজন চালান এন্ট্রি ও স্টক ইন"
            subtitle="মরিচপট্টি, ফেনী বাজার — মোকাম চালান, বস্তা সাইজ, গাড়িভাড়া ও কেনা দর"
            backHref="/"
            backTitle="ড্যাশবোর্ডে ফিরে যান"
            icon={<Truck size={16} weight="bold" />}
            badge={
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                পারচেজ
              </span>
            }
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href="/khata/suppliers"
                  className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200/90 hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150"
                >
                  <Buildings size={14} weight="bold" />
                  <span className="hidden sm:inline">মহাজন খাতা</span>
                </Link>

                <Link
                  href="/pos"
                  className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(5,150,105,0.2)]"
                >
                  <Storefront size={14} weight="bold" />
                  <span className="hidden sm:inline">পিওএস কাউন্টার</span>
                </Link>
              </div>
            }
          />
        </div>
      </div>

      {/* মূল কন্টেন্ট ক্যানভাস */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3.5">
        {/* ২. সেগমেন্টেড ট্যাব সুইচ (Linear-Grade Segmented Tabs) */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200/80 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus size={14} weight="bold" />
              <span>+ নতুন চালান এন্ট্রি</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt size={14} weight="bold" />
              <span>বিগত চালান রেজিস্টার</span>
            </button>
          </div>

          {activeTab === 'history' && (
            <button
              type="button"
              onClick={() => fetchPurchases()}
              disabled={isLoadingHistory}
              className="px-2.5 py-1.5 rounded-md border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 disabled:opacity-50 cursor-pointer shadow-2xs"
              title="তালিকা রিফ্রেশ করুন"
            >
              <ArrowsClockwise
                size={14}
                weight="bold"
                className={isLoadingHistory ? 'animate-spin' : ''}
              />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>
          )}
        </div>

        {/* ৩. নতুন চালান এন্ট্রি লেআউট (Desktop 60/40 Split View) */}
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
          /* ৪. চালান রেজিস্টার হিস্ট্রি ভিউ */
          <div className="space-y-3.5">
            {/* চালান KPI সামারি স্ট্রিপ */}
            <PurchaseKpiSummary />

            {/* ফিল্টার টুলবার ও টাইমজোন-সেফ ডেট রেঞ্জ */}
            <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Receipt size={16} weight="bold" className="text-slate-600" />
                <span>মোকাম চালান ফিল্টার ও সময়কাল:</span>
              </div>

              <div className="overflow-x-auto pb-0.5 scrollbar-none w-full sm:w-auto">
                <UnifiedDateRangeFilter
                  defaultFilter="all"
                  syncWithUrl={false}
                  onRangeChange={handleRangeChange}
                />
              </div>
            </div>

            {/* ডেস্কটপ টেবিল ভিউ */}
            <div className="hidden md:block">
              <PurchaseHistoryTable onOpenDetail={openDetailModal} />
            </div>

            {/* মোবাইল কার্ড স্ট্রিম */}
            <div className="block md:hidden space-y-2.5">
              {purchases.length === 0 ? (
                <div className="bg-white rounded-lg border border-slate-200/90 p-8 text-center text-slate-500">
                  <Truck size={32} weight="bold" className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold">কোনো পূর্ববর্তী চালান পাওয়া যায়নি</p>
                </div>
              ) : (
                <>
                  {purchases.map((purchase) => (
                    <PurchaseMobileCard
                      key={purchase.id}
                      purchase={purchase}
                      onOpenDetail={openDetailModal}
                    />
                  ))}

                  {meta.totalPages > 1 && (
                    <div className="bg-white rounded-lg border border-slate-200/90 p-2 shadow-2xs">
                      <AdminPagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        totalItems={meta.total}
                        pageSize={meta.limit}
                        onPageChange={setPage}
                        itemLabel="চালান"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* চালান বিস্তারিত ভিউ মোডাল */}
      <PurchaseDetailModal />
    </div>
  );
}
