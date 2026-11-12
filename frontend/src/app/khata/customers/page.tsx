'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Storefront,
  AddressBook,
  UserPlus,
  ArrowsClockwise,
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
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
    <div className="min-h-screen bg-surface-canvas flex flex-col font-sans pb-16">
      {/* ১. স্টিকি পেজ হেডার (AdminPageHeader) */}
      <div className="bg-surface-card border-b border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <AdminPageHeader
            title="কাস্টমার খাতা ও বাকি রেজিস্টার"
            backHref="/"
            backTitle="ড্যাশবোর্ডে ফিরে যান"
            icon={<AddressBook size={16} weight="bold" />}
            badge={
              <Badge variant="brand">
                খাতা
              </Badge>
            }
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchCustomers()}
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
                  href="/pos"
                  className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'gap-1.5' })}
                >
                  <Storefront size={14} weight="bold" />
                  <span className="hidden sm:inline">কাউন্টার বিলিং</span>
                </Link>

                <button
                  type="button"
                  onClick={() => openModal('create')}
                  className={buttonClasses({ variant: 'primary', size: 'sm', className: 'gap-1.5' })}
                >
                  <UserPlus size={14} weight="bold" />
                  <span>+ নতুন খাতা</span>
                </button>
              </div>
            }
          />
        </div>
      </div>

      {/* মূল কন্টেন্ট ক্যানভাস */}
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
            <div className="bg-surface-card rounded-xl border border-border-default p-8 text-center text-xs text-ink-secondary">
              কাস্টমার খাতা লোড হচ্ছে...
            </div>
          ) : customers.length === 0 ? (
            <div className="bg-surface-card rounded-xl border border-border-default p-8 text-center text-xs text-ink-secondary">
              কোনো কাস্টমার পাওয়া যায়নি
            </div>
          ) : (
            <>
              {customers.map((c) => (
                <CustomerMobileCard key={c.id} customer={c} />
              ))}

              {/* মোবাইল পেজিনেশন */}
              {meta.totalPages > 1 && (
                <div className="bg-surface-card rounded-lg border border-border-default p-2 shadow-2xs">
                  <AdminPagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    totalItems={meta.total}
                    pageSize={meta.limit}
                    onPageChange={setPage}
                    itemLabel="কাস্টমার"
                  />
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
