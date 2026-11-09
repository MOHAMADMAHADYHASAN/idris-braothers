'use client';

import React from 'react';
import { SaleType } from '@/features/pos/pos.types';
import { Storefront, Tag } from '@phosphor-icons/react';

interface PosHeaderModeBarProps {
  saleType: SaleType;
  onToggle: (type: SaleType) => void;
  cartItemCount?: number;
}

export function PosHeaderModeBar({
  saleType,
  onToggle,
  cartItemCount = 0,
}: PosHeaderModeBarProps) {
  const isWholesale = saleType === 'WHOLESALE';

  return (
    <div
      className={`px-3 py-2 rounded-lg border transition-[background-color,border-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] ${
        isWholesale
          ? 'bg-amber-50/70 border-amber-300/80 text-amber-950'
          : 'bg-white border-slate-200/90 text-slate-900'
      }`}
    >
      {/* Left: Operational Signal & Mode Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border transition-colors duration-150 ${
            isWholesale
              ? 'bg-amber-500 border-amber-600 text-white'
              : 'bg-slate-900 border-slate-950 text-white'
          }`}
        >
          {isWholesale ? (
            <Tag size={15} weight="bold" />
          ) : (
            <Storefront size={15} weight="bold" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isWholesale ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <h2 className="font-semibold text-xs sm:text-sm tracking-tight truncate">
              {isWholesale ? 'পাইকারি বিক্রয় মোড (Wholesale Mode)' : 'খুচরা বিক্রয় মোড (Retail POS)'}
            </h2>
          </div>
          <p className="text-[10px] text-slate-500 tracking-tight truncate hidden sm:block">
            {isWholesale
              ? 'বস্তা ও কার্টনের পাইকারি দর স্বয়ংক্রিয়ভাবে কার্যকর'
              : 'সাধারণ খুচরা দর ও ২০/৫০ টাকার কাস্টম ওজন সক্রিয়'}
          </p>
        </div>
      </div>

      {/* Right: Segmented Tactile Switcher */}
      <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200/80 shrink-0">
        <button
          type="button"
          onClick={() => onToggle('RETAIL')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900/10 ${
            !isWholesale
              ? 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          খুচরা
        </button>
        <button
          type="button"
          onClick={() => onToggle('WHOLESALE')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900/10 ${
            isWholesale
              ? 'bg-amber-600 text-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          পাইকারি
        </button>
      </div>
    </div>
  );
}
