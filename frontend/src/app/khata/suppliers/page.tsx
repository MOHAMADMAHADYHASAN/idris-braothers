'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Truck,
  UserPlus,
  Package,
  CaretLeft,
  CaretRight,
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
                  মহাজন খাতা ও দেনা রেজিস্টার
                </h1>
                <p className="text-[11px] text-ink-muted">
                  মরিচপট্টি, ফেনী বাজার — মোকাম চালান ও নগদ দেনা পরিশোধ
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/purchases"
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-200"
            >
              <Package size={16} weight="bold" />
              <span className="hidden sm:inline">চালান এন্ট্রি</span>
            </Link>
            <button
              onClick={() => openModal('create')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
            >
              <UserPlus size={16} weight="bold" />
              <span>+ নতুন মহাজন</span>
            </button>
          </div>
        </div>
      </header>

      {/* মূল কন্টেন্ট এরিয়া */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
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
        <div className="block md:hidden space-y-3">
          {isLoading && suppliers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-ink-muted">
              মহাজনদের খাতা লোড হচ্ছে...
            </div>
          ) : suppliers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-ink-muted">
              কোনো মহাজন পাওয়া যায়নি
            </div>
          ) : (
            <>
              {suppliers.map((s) => (
                <SupplierMobileCard key={s.id} supplier={s} />
              ))}

              {/* মোবাইল পেজিনেশন */}
              {meta.totalPages > 1 && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs text-ink-muted">
                  <span>
                    পৃষ্ঠা <strong className="text-ink-primary">{meta.page}</strong> / {meta.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(meta.page - 1)}
                      disabled={meta.page <= 1}
                      className="p-1.5 border border-slate-200 rounded-md bg-slate-50 disabled:opacity-40"
                    >
                      <CaretLeft size={16} weight="bold" />
                    </button>
                    <button
                      onClick={() => setPage(meta.page + 1)}
                      disabled={meta.page >= meta.totalPages}
                      className="p-1.5 border border-slate-200 rounded-md bg-slate-50 disabled:opacity-40"
                    >
                      <CaretRight size={16} weight="bold" />
                    </button>
                  </div>
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
