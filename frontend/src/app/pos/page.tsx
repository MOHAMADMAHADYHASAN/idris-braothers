'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, GridFour, Receipt, Barcode } from '@phosphor-icons/react';
import { usePosStore } from '@/features/pos/usePosStore';
import { useProductStore } from '@/features/product/useProductStore';
import { PosHeaderModeBar } from '@/components/ui/PosHeaderModeBar';
import { PosProductCatalog } from '@/features/pos/components/PosProductCatalog';
import { PosCartTable } from '@/features/pos/components/PosCartTable';
import { PosSettlementPanel } from '@/features/pos/components/PosSettlementPanel';
import { ThermalReceipt } from '@/components/shared/ThermalReceipt';
import { ThermalReceiptData } from '@/features/pos/pos.types';
import { useBarcodeScanner } from '@/features/pos/hooks/useBarcodeScanner';
import { BarcodeScanNotification } from '@/features/pos/components/BarcodeScanNotification';
import { formatCurrency, formatNumber } from '@/lib/decimal';

export default function PosPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { saleType, setSaleType, cart, fetchThermalReceipt, getGrandTotal } = usePosStore();
  const { lastScan, dismissScanFeedback } = useBarcodeScanner();

  const [mobileTab, setMobileTab] = useState<'catalog' | 'settlement'>('catalog');
  const [activeThermalReceipt, setActiveThermalReceipt] = useState<ThermalReceiptData | null>(null);

  const settlementFormRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 → focus product search
      if (e.key === 'F2') {
        e.preventDefault();
        setMobileTab('catalog');
        window.requestAnimationFrame(() => {
          document.getElementById('pos-search-input')?.focus();
        });
      }

      // F4 → focus cash input
      if (e.key === 'F4') {
        e.preventDefault();
        setMobileTab('settlement');
        window.requestAnimationFrame(() => {
          document.getElementById('pos-paid-amount-input')?.focus();
        });
      }

      // Ctrl+Enter → submit checkout
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const form = document.getElementById('pos-settlement-form') as HTMLFormElement | null;
        if (form) {
          form.requestSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMounted]);

  const handleSaleSuccess = async (saleId: string) => {
    if (!saleId) {
      console.warn('handleSaleSuccess called without a valid saleId');
      return;
    }
    try {
      const receipt = await fetchThermalReceipt(saleId);
      setActiveThermalReceipt(receipt);
      void useProductStore.getState().fetchProducts({ page: 1, limit: 100 });
    } catch (err) {
      console.error('Failed to load receipt:', err);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Initial SSR Hydration Guard Skeleton
  if (!isMounted) {
    return (
      <div className="h-[100dvh] w-screen overflow-hidden flex flex-col bg-surface-canvas text-ink-primary select-none">
        <header className="px-4 py-2.5 surface-glass-header border-b border-border-default/80 flex items-center justify-between gap-3 shrink-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-surface-subtle animate-pulse" />
            <div className="h-5 w-48 rounded-lg bg-surface-subtle animate-pulse" />
          </div>
          <div className="h-9 w-44 rounded-xl bg-surface-subtle animate-pulse hidden md:block" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 rounded-lg bg-surface-subtle animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-surface-subtle animate-pulse" />
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-3 sm:p-3.5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full">
            <div className="md:col-span-7 lg:col-span-8 h-full bg-surface-card rounded-2xl border border-border-default p-4 flex flex-col gap-3">
              <div className="h-11 rounded-xl bg-surface-subtle animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-20 rounded-full bg-surface-subtle animate-pulse" />
                <div className="h-8 w-20 rounded-full bg-surface-subtle animate-pulse" />
                <div className="h-8 w-20 rounded-full bg-surface-subtle animate-pulse" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 flex-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-xl bg-surface-subtle/60 border border-border-subtle animate-pulse" />
                ))}
              </div>
            </div>

            <div className="hidden md:flex md:col-span-5 lg:col-span-4 h-full flex-col gap-3">
              <div className="flex-1 rounded-2xl bg-surface-card border border-border-default p-4 animate-pulse" />
              <div className="h-64 rounded-2xl bg-surface-card border border-border-default p-4 animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col bg-surface-canvas text-ink-primary select-none">
      {/* 1. Clean Top Header Bar */}
      <header
        id="pos-header"
        className="px-4 py-2.5 surface-glass-header border-b border-border-default/80 shadow-2xs shrink-0 z-30"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Dashboard link & Store Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              className="p-1.5 rounded-xl text-ink-secondary hover:text-brand-deep hover:bg-brand-soft border border-border-default/80 bg-surface-card transition-colors shrink-0 shadow-2xs"
              title="ড্যাশবোর্ডে ফিরুন"
              aria-label="ড্যাশবোর্ডে ফিরুন"
            >
              <ArrowLeft size={17} weight="bold" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-sm text-ink-primary leading-tight truncate">
                ইদ্রিস ব্রাদার্স • পিওএস কাউন্টার
              </h1>
            </div>
          </div>

          {/* Center: Clean Segmented Mode Switcher */}
          <div className="hidden md:block">
            <PosHeaderModeBar
              saleType={saleType}
              onToggle={setSaleType}
              cartItemCount={cartItemCount}
            />
          </div>

          {/* Right: Hardware scanner badge & Memo Link */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Barcode Gun Ready Badge */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cash-bg border border-cash-border text-cash-text text-xs font-semibold"
              title="ইউএসবি বা ব্লুটুথ বারকোড স্ক্যানার গান প্রস্তুত"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <Barcode size={14} weight="bold" />
              <span>স্ক্যানার রেডি</span>
            </div>

            <Link
              href="/sales"
              className="px-3 py-1.5 rounded-xl border border-border-default bg-surface-card hover:bg-surface-subtle text-ink-body text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="বিগত বিক্রয় মেমো খাতা ও হিস্ট্রি"
            >
              <Receipt size={15} weight="bold" className="text-ink-secondary" />
              <span className="hidden sm:inline">মেমো খাতা</span>
            </Link>

            {/* Mobile Segmented Switcher Pill */}
            <div className="md:hidden flex bg-surface-subtle p-0.5 rounded-xl border border-border-default">
              <button
                type="button"
                onClick={() => setMobileTab('catalog')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  mobileTab === 'catalog'
                    ? 'bg-brand-deep text-white shadow-2xs'
                    : 'text-ink-secondary'
                }`}
              >
                <GridFour size={14} weight="bold" />
                <span>পণ্য</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('settlement')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  mobileTab === 'settlement'
                    ? 'bg-brand-deep text-white shadow-2xs'
                    : 'text-ink-secondary'
                }`}
              >
                <ShoppingCart size={14} weight="bold" />
                <span suppressHydrationWarning>কার্ট ({formatNumber(cart.length)})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Mode Switcher Bar */}
        <div className="mt-2 md:hidden flex justify-center">
          <PosHeaderModeBar
            saleType={saleType}
            onToggle={setSaleType}
            cartItemCount={cartItemCount}
          />
        </div>
      </header>

      {/* 2. Main Workspace: Square/Shopify POS Layout */}
      <main className="flex-1 overflow-hidden p-2.5 sm:p-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full">
          {/* Left Column: Product Catalog Grid (~65%) */}
          <div
            className={`${
              mobileTab === 'catalog' ? 'block' : 'hidden'
            } md:block md:col-span-7 lg:col-span-8 h-full overflow-hidden`}
          >
            <PosProductCatalog />
          </div>

          {/* Right Column: Digital Receipt Tablet (~35%) */}
          <div
            className={`${
              mobileTab === 'settlement' ? 'flex' : 'hidden'
            } md:flex md:col-span-5 lg:col-span-4 h-full flex-col gap-3 overflow-y-auto pb-4 md:pb-0`}
          >
            {/* Top Cart Table */}
            <div className="md:flex-1 md:min-h-[220px] md:overflow-hidden">
              <PosCartTable />
            </div>

            {/* Bottom Checkout & Settlement Tablet */}
            <div className="shrink-0">
              <PosSettlementPanel onSaleSuccess={handleSaleSuccess} formRef={settlementFormRef} />
            </div>
          </div>
        </div>
      </main>

      {/* 3. Thermal Receipt Modal */}
      {activeThermalReceipt && (
        <ThermalReceipt
          data={activeThermalReceipt}
          onClose={() => setActiveThermalReceipt(null)}
        />
      )}

      {/* 4. Barcode Scan Fast Toast */}
      <BarcodeScanNotification
        scan={lastScan}
        onDismiss={dismissScanFeedback}
      />
    </div>
  );
}
