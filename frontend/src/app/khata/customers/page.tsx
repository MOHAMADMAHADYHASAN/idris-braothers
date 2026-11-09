'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Storefront,
  ArrowLeft,
  Users,
  AddressBook,
  UserPlus,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { useCustomerKhataStore } from '@/features/customer-khata/useCustomerKhataStore';
import { CustomerKpiSummary } from '@/features/customer-khata/components/CustomerKpiSummary';
import { CustomerFilterBar } from '@/features/customer-khata/components/CustomerFilterBar';
import { CustomerTable } from '@/features/customer-khata/components/CustomerTable';
import { CustomerMobileCard } from '@/features/customer-khata/components/CustomerMobileCard';
import { DueCollectionModal } from '@/features/customer-khata/components/DueCollectionModal';
import { CustomerLedgerDrawer } from '@/features/customer-khata/components/CustomerLedgerDrawer';
import { CustomerFormModal } from '@/features/customer-khata/components/CustomerFormModal';
import { CustomerAdjustmentModal } from '@/features/customer-khata/components/CustomerAdjustmentModal';

export default function CustomerKhataPage() {
  const { customers, meta, isLoading, fetchCustomers, openModal, setPage } =
    useCustomerKhataStore();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + N -> New Customer
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
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-900">
      {/* গ্লোবাল টপবার */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-[background-color,color] duration-150"
              title="ড্যাশবোর্ডে ফিরে যান"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0">
                <AddressBook size={18} weight="bold" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight">
                  কাস্টমার খাতা ও বাকি রেজিস্টার
                </h1>
                <p className="text-[11px] text-slate-500">
                  মরিচপট্টি, ফেনী বাজার — রানিং খতিয়ান ও নগদ উশুল
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/pos"
              className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-[background-color] duration-150 border border-slate-200/80 active:scale-[0.98]"
            >
              <Storefront size={15} weight="bold" />
              <span className="hidden sm:inline">কাউন্টার বিলিং</span>
            </Link>
            <button
              onClick={() => openModal('create')}
              className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-[background-color,transform] duration-150 active:scale-[0.98]"
            >
              <UserPlus size={15} weight="bold" />
              <span>+ নতুন খাতা</span>
            </button>
          </div>
        </div>
      </header>

      {/* মূল কন্টেন্ট এরিয়া */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3.5">
        {/* ১. টপ KPI সামারি */}
        <CustomerKpiSummary />

        {/* ২. সার্চ ও ফিল্টার বার */}
        <CustomerFilterBar />

        {/* ৩. ডুয়েল ডিসপ্লে: ডেস্কটপ টেবিল বনাম মোবাইল কার্ড ভিউ */}
        {/* ডেস্কটপ টেবিল (≥ 768px) */}
        <div className="hidden md:block">
          <CustomerTable />
        </div>

        {/* মোবাইল কার্ড স্ট্রিম (< 768px) */}
        <div className="block md:hidden space-y-2.5">
          {isLoading && customers.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200/90 p-8 text-center text-xs text-slate-400">
              কাস্টমার খাতা লোড হচ্ছে...
            </div>
          ) : customers.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200/90 p-8 text-center text-xs text-slate-400">
              কোনো কাস্টমার পাওয়া যায়নি
            </div>
          ) : (
            <>
              {customers.map((c) => (
                <CustomerMobileCard key={c.id} customer={c} />
              ))}

              {/* মোবাইল পেজিনেশন */}
              {meta.totalPages > 1 && (
                <div className="p-3 bg-white rounded-lg border border-slate-200/90 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums tracking-tight">
                  <span>
                    পৃষ্ঠা <strong className="text-slate-900">{meta.page}</strong> / {meta.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(meta.page - 1)}
                      disabled={meta.page <= 1}
                      className="p-1.5 border border-slate-200 rounded-md bg-slate-50 disabled:opacity-40 transition-colors active:scale-[0.96]"
                    >
                      <CaretLeft size={15} weight="bold" />
                    </button>
                    <button
                      onClick={() => setPage(meta.page + 1)}
                      disabled={meta.page >= meta.totalPages}
                      className="p-1.5 border border-slate-200 rounded-md bg-slate-50 disabled:opacity-40 transition-colors active:scale-[0.96]"
                    >
                      <CaretRight size={15} weight="bold" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ৪. ইন্টারেক্টিভ মডালসমূহ */}
      <DueCollectionModal />
      <CustomerLedgerDrawer />
      <CustomerFormModal />
      <CustomerAdjustmentModal />
    </div>
  );
}
