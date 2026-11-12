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
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function SalesPage() {
  const { sales, meta, isLoading, fetchSales, setPage } = useSalesStore();

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col font-sans pb-16">
      {/* ১. স্টিকি পেজ হেডার (AdminPageHeader) */}
      <div className="bg-surface-card border-b border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <AdminPageHeader
            title="বিক্রয় মেমো ও অর্ডার রেজিস্টার"
            backHref="/"
            backTitle="ড্যাশবোর্ডে ফিরে যান"
            icon={<Receipt size={16} weight="bold" />}
            badge={
              <Badge variant="cash">
                লাইভ
              </Badge>
            }
            actions={
              <>
                <button
                  type="button"
                  onClick={() => fetchSales()}
                  disabled={isLoading}
                  className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'gap-1.5' })}
                  title="তথ্য রিফ্রেশ করুন"
                >
                  <ArrowClockwise size={14} weight="bold" className={isLoading ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">রিফ্রেশ</span>
                </button>

                <Link
                  href="/pos"
                  className={buttonClasses({ variant: 'primary', size: 'sm', className: 'gap-1.5' })}
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
        <Suspense fallback={<div className="h-14 bg-surface-card rounded-lg border border-border-default animate-pulse" />}>
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
