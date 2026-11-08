'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, GridFour } from '@phosphor-icons/react';
import { usePosStore } from '@/features/pos/usePosStore';
import { PosHeaderModeBar } from '@/components/ui/PosHeaderModeBar';
import { PosProductCatalog } from '@/features/pos/components/PosProductCatalog';
import { PosCartTable } from '@/features/pos/components/PosCartTable';
import { PosSettlementPanel } from '@/features/pos/components/PosSettlementPanel';
import { ThermalReceipt } from '@/components/shared/ThermalReceipt';
import { ThermalReceiptData } from '@/features/pos/pos.types';

export default function PosPage() {
  const { saleType, setSaleType, cart, fetchThermalReceipt, getGrandTotal } = usePosStore();

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
      <header className="px-3 sm:px-4 py-2 bg-white border-b border-slate-200/90 shadow-2xs shrink-0 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="ড্যাশবোর্ডে ফিরে যান"
          >
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
              ইদ্রিস ব্রাদার্স পিওএস টার্মিনাল
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              মরিচপট্টি, ফেনী বাজার • দ্রুত বিক্রয় কাউন্টার
            </p>
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

        {/* Cart Quick Status Pill */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block font-bold">মোট বিল</span>
            <span className="font-black text-sm text-slate-900 tabular-numbers">
              ৳{getGrandTotal().toLocaleString('en-BD')}
            </span>
          </div>

          {/* Mobile Segmented Switcher Pill */}
          <div className="md:hidden flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setMobileTab('catalog')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                mobileTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              <GridFour size={15} weight="bold" />
              পণ্য
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('settlement')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                mobileTab === 'settlement'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              <ShoppingCart size={15} weight="bold" />
              কার্ট ({cart.length})
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Mode Switcher Strip (Visible on mobile only) */}
      <div className="md:hidden p-2 bg-slate-50 border-b border-slate-200">
        <PosHeaderModeBar
          saleType={saleType}
          onToggle={setSaleType}
          cartItemCount={cartItemCount}
        />
      </div>

      {/* 2. Main Workspace (Desktop Split vs Mobile Segmented) */}
      <main className="flex-1 overflow-hidden p-2 sm:p-3">
        {/* Desktop 2-Column Grid (Left: 60% Catalog, Right: 40% Cart & Checkout) */}
        <div className="hidden md:grid md:grid-cols-12 gap-3 h-full">
          <div className="md:col-span-7 lg:col-span-8 h-full overflow-hidden">
            <PosProductCatalog />
          </div>

          <div className="md:col-span-5 lg:col-span-4 h-full flex flex-col gap-3 overflow-y-auto">
            <div className="flex-1 min-h-[220px] overflow-hidden">
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
            <div className="h-full flex flex-col gap-3 overflow-y-auto pb-4">
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
    </div>
  );
}
