'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  Receipt,
  ShoppingCart,
  ArrowClockwise,
} from '@phosphor-icons/react';
import { useSalesStore } from '@/features/sales/useSalesStore';
import { SalesKpiSummary } from '@/features/sales/components/SalesKpiSummary';
import { SalesFilterBar } from '@/features/sales/components/SalesFilterBar';
import { SalesTable } from '@/features/sales/components/SalesTable';
import { SalesMobileCard } from '@/features/sales/components/SalesMobileCard';
import { SaleDetailModal } from '@/features/sales/components/SaleDetailModal';
import { CancelSaleModal } from '@/features/sales/components/CancelSaleModal';
import { ReturnSaleModal } from '@/features/sales/components/ReturnSaleModal';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminPagination } from '@/components/shared/AdminPagination';

export default function SalesPage() {
  const { sales, meta, isLoading, fetchSales, setPage } = useSalesStore();

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans pb-16">
      {/* ১. স্টিকি পেজ হেডার (AdminPageHeader) */}
      <div className="bg-white border-b border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <AdminPageHeader
            title="বিক্রয় মেমো ও অর্ডার রেজিস্টার"
            subtitle="মরিচপট্টি, ফেনী বাজার — সমস্ত বিক্রয় মেমো, রসিদ রি-প্রিন্ট ও বাতিলকরণ"
            backHref="/"
            backTitle="ড্যাশবোর্ডে ফিরে যান"
            icon={<Receipt size={16} weight="bold" />}
            badge={
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                লাইভ
              </span>
            }
            actions={
              <>
                <button
                  type="button"
                  onClick={() => fetchSales()}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-md border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 disabled:opacity-50 cursor-pointer"
                  title="তথ্য রিফ্রেশ করুন"
                >
                  <ArrowClockwise size={14} weight="bold" className={isLoading ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">রিফ্রেশ</span>
                </button>

                <Link
                  href="/pos"
                  className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(5,150,105,0.2)]"
                >
                  <ShoppingCart size={14} weight="bold" />
                  <span>+ নতুন মেমো কাটুন</span>
                </Link>
              </>
            }
          />
        </div>
      </div>

      {/* মূল কন্টেন্ট ক্যানভাস */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3.5">
        {/* ১. বিক্রয় মেট্রিক্স সামারি কার্ডস */}
        <SalesKpiSummary />

        {/* ২. অ্যাকশন ও ফিল্টার টুলবার */}
        <Suspense fallback={<div className="h-14 bg-white rounded-lg border border-slate-200/90 animate-pulse" />}>
          <SalesFilterBar />
        </Suspense>

        {/* ৩. ডেস্কটপ টেবিল ভিউ */}
        <div className="hidden md:block">
          <SalesTable />
        </div>

        {/* ৪. মোবাইল রেসপন্সিভ কার্ড স্ট্রিম */}
        <div className="block md:hidden space-y-2.5">
          {sales.map((sale) => (
            <SalesMobileCard key={sale.id} sale={sale} />
          ))}

          {/* মোবাইল পেজিনেশন */}
          <AdminPagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            totalItems={meta.total}
            pageSize={meta.limit}
            onPageChange={setPage}
            itemLabel="মেমো"
          />
        </div>
      </main>

      {/* ৫. ইন্টারেক্টিভ মডালসমূহ */}
      <SaleDetailModal />
      <CancelSaleModal />
      <ReturnSaleModal />
    </div>
  );
}
