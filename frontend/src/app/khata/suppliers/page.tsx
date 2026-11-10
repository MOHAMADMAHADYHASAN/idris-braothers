'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  UserPlus,
  Package,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { useSupplierKhataStore } from '@/features/supplier-khata/useSupplierKhataStore';
import { SupplierKpiSummary } from '@/features/supplier-khata/components/SupplierKpiSummary';
import { SupplierFilterBar } from '@/features/supplier-khata/components/SupplierFilterBar';
import { SupplierTable } from '@/features/supplier-khata/components/SupplierTable';
import { SupplierMobileCard } from '@/features/supplier-khata/components/SupplierMobileCard';
import { PaySupplierModal } from '@/features/supplier-khata/components/PaySupplierModal';
import { SupplierLedgerDrawer } from '@/features/supplier-khata/components/SupplierLedgerDrawer';
import { SupplierFormModal } from '@/features/supplier-khata/components/SupplierFormModal';
import { SupplierAdjustmentModal } from '@/features/supplier-khata/components/SupplierAdjustmentModal';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function SupplierKhataPage() {
  const { suppliers, meta, isLoading, fetchSuppliers, openModal, setPage } =
    useSupplierKhataStore();

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + N -> New Supplier
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openModal('create');
      }
      // F2 -> Focus Search input
      if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans pb-16">
      {/* ১. স্টিকি পেজ হেডার (AdminPageHeader) */}
      <div className="bg-white border-b border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <AdminPageHeader
            title="মহাজন খাতা ও দেনা রেজিস্টার"
            backHref="/"
            backTitle="ড্যাশবোর্ডে ফিরে যান"
            icon={<Truck size={16} weight="bold" />}
            badge={
              <Badge variant="brand">
                মহাজন
              </Badge>
            }
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchSuppliers()}
                  disabled={isLoading}
                  className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'gap-1.5' })}
                  title="তালিকা রিফ্রেশ করুন"
                >
                  <ArrowsClockwise
                    size={14}
                    weight="bold"
                    className={isLoading ? 'animate-spin text-brand-deep' : ''}
                  />
                  <span className="hidden sm:inline">রিফ্রেশ</span>
                </button>

                <Link
                  href="/purchases"
                  className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'gap-1.5' })}
                >
                  <Package size={14} weight="bold" />
                  <span className="hidden sm:inline">চালান এন্ট্রি</span>
                </Link>

                <button
                  type="button"
                  onClick={() => openModal('create')}
                  className={buttonClasses({ variant: 'primary', size: 'sm', className: 'gap-1.5' })}
                >
                  <UserPlus size={14} weight="bold" />
                  <span>+ নতুন মহাজন</span>
                </button>
              </div>
            }
          />
        </div>
      </div>

      {/* মূল কন্টেন্ট ক্যানভাস */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* ১. টপ KPI সামারি */}
        <SupplierKpiSummary />

        {/* ২. সার্চ ও ফিল্টার বার */}
        <SupplierFilterBar />

        {/* ৩. ডুয়েল ডিসপ্লে: ডেস্কটপ টেবিল বনাম মোবাইল কার্ড ভিউ */}
        {/* ডেস্কটপ টেবিল (≥ 768px) */}
        <div className="hidden md:block">
          <SupplierTable />
        </div>

        {/* মোবাইল কার্ড স্ট্রিম (< 768px) */}
        <div className="block md:hidden space-y-2.5">
          {isLoading && suppliers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center text-xs text-slate-600">
              মহাজনদের খাতা লোড হচ্ছে...
            </div>
          ) : suppliers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center text-xs text-slate-600">
              কোনো মহাজন পাওয়া যায়নি
            </div>
          ) : (
            <>
              {suppliers.map((s) => (
                <SupplierMobileCard key={s.id} supplier={s} />
              ))}

              {/* মোবাইল পেজিনেশন */}
              {meta.totalPages > 1 && (
                <div className="bg-white rounded-lg border border-slate-200/90 p-2 shadow-2xs">
                  <AdminPagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    totalItems={meta.total}
                    pageSize={meta.limit}
                    onPageChange={setPage}
                    itemLabel="মহাজন"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ৪. ইন্টারেক্টিভ মডালসমূহ */}
      <PaySupplierModal />
      <SupplierLedgerDrawer />
      <SupplierFormModal />
      <SupplierAdjustmentModal />
    </div>
  );
}
