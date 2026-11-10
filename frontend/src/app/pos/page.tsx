'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, GridFour, Receipt, Barcode } from '@phosphor-icons/react';
import { usePosStore } from '@/features/pos/usePosStore';
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
  const { saleType, setSaleType, cart, fetchThermalReceipt, getGrandTotal } = usePosStore();
  const { lastScan, isScannerReady, dismissScanFeedback } = useBarcodeScanner();

  const [mobileTab, setMobileTab] = useState<'catalog' | 'settlement'>('catalog');
  const [activeThermalReceipt, setActiveThermalReceipt] = useState<ThermalReceiptData | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setMobileTab('catalog');
        const searchInput = document.getElementById('pos-search-input');
        searchInput?.focus();
      }

      if (e.key === 'F4') {
        e.preventDefault();
        setMobileTab('settlement');
        const paidInput = document.getElementById('pos-paid-amount-input');
        paidInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaleSuccess = async (saleId: string) => {
    if (!saleId) {
      console.warn('handleSaleSuccess called without a valid saleId');
      return;
    }
    try {
      const receipt = await fetchThermalReceipt(saleId);
      setActiveThermalReceipt(receipt);
    } catch (err) {
      console.error('Failed to load receipt:', err);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col bg-surface-canvas text-ink-primary select-none">
      {/* 1. Sticky Top Navigation Bar */}
      <header className="px-3 sm:px-4 py-2 bg-surface-card border-b border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.02)] shrink-0 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-ink-secondary hover:text-brand-deep hover:bg-brand-soft transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer"
            title="ড্যাশবোর্ডে ফিরুন"
          >
            <ArrowLeft size={18} weight="bold" />
          </Link>
          <div>
            <h1 className="font-bold text-xs sm:text-sm text-ink-primary leading-tight">
              ইদ্রিস ব্রাদার্স পিওএস কাউন্টার
            </h1>
          </div>
        </div>

        {/* Mode Switcher Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <PosHeaderModeBar
            saleType={saleType}
            onToggle={setSaleType}
            cartItemCount={cartItemCount}
          />
        </div>

        {/* Cart Quick Status Pill & Sales Register */}
        <div className="flex items-center gap-2">
          {/* Hardware Barcode Scanner Status Indicator */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cash-bg border border-cash-border text-cash-text text-xs font-semibold"
            title="ইউএসবি বা ব্লুটুথ বারকোড স্ক্যানার গান সক্রিয়। যেকোনো পণ্য সরাসরি স্ক্যান করুন।"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <Barcode size={14} weight="bold" />
            <span>স্ক্যানার প্রস্তুত</span>
          </div>

          <Link
            href="/sales"
            className="px-2.5 py-1.5 rounded-lg border border-border-strong hover:bg-surface-subtle text-ink-body text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
            title="বিগত বিক্রয় মেমো খাতা ও হিস্ট্রি"
          >
            <Receipt size={14} weight="bold" className="text-ink-secondary" />
            <span className="hidden sm:inline">মেমো খাতা</span>
          </Link>

          <div className="text-right hidden sm:block">
            <span className="text-xs text-ink-secondary block font-medium">মোট বিল</span>
            <span className="font-bold text-xs sm:text-sm text-brand-deep font-mono tabular-nums">
              {formatCurrency(getGrandTotal(), false)}
            </span>
          </div>

          {/* Mobile Segmented Switcher Pill */}
          <div className="md:hidden flex bg-surface-subtle p-0.5 rounded-lg border border-border-default">
            <button
              type="button"
              onClick={() => setMobileTab('catalog')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                mobileTab === 'settlement'
                  ? 'bg-brand-deep text-white shadow-2xs'
                  : 'text-ink-secondary'
              }`}
            >
              <ShoppingCart size={14} weight="bold" />
              <span>কার্ট ({formatNumber(cart.length)})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Mode Switcher Strip (Visible on mobile only) */}
      <div className="md:hidden p-2 bg-surface-canvas border-b border-border-default">
        <PosHeaderModeBar
          saleType={saleType}
          onToggle={setSaleType}
          cartItemCount={cartItemCount}
        />
      </div>

      {/* 2. Main Workspace (Desktop Split vs Mobile Segmented) */}
      <main className="flex-1 overflow-hidden p-2 sm:p-2.5">
        {/* Desktop 2-Column Grid (Left: 60% Catalog, Right: 40% Cart & Checkout) */}
        <div className="hidden md:grid md:grid-cols-12 gap-2.5 h-full">
          <div className="md:col-span-7 lg:col-span-8 h-full overflow-hidden">
            <PosProductCatalog />
          </div>

          <div className="md:col-span-5 lg:col-span-4 h-full flex flex-col gap-2.5 overflow-y-auto">
            <div className="flex-1 min-h-[200px] overflow-hidden">
              <PosCartTable />
            </div>
            <div className="shrink-0">
              <PosSettlementPanel onSaleSuccess={handleSaleSuccess} />
            </div>
          </div>
        </div>

        {/* Mobile Single-Column Switched View */}
        <div className="md:hidden h-full overflow-hidden">
          {mobileTab === 'catalog' ? (
            <div className="h-full">
              <PosProductCatalog />
            </div>
          ) : (
            <div className="h-full flex flex-col gap-2.5 overflow-y-auto pb-4">
              <PosCartTable />
              <PosSettlementPanel onSaleSuccess={handleSaleSuccess} />
            </div>
          )}
        </div>
      </main>

      {/* 3. Thermal Receipt Print Modal */}
      {activeThermalReceipt && (
        <ThermalReceipt
          data={activeThermalReceipt}
          onClose={() => setActiveThermalReceipt(null)}
        />
      )}

      {/* 4. Global Barcode Fast Scan Toast Notification */}
      <BarcodeScanNotification
        scan={lastScan}
        onDismiss={dismissScanFeedback}
      />
    </div>
  );
}
