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
      className={`px-3.5 py-2.5 rounded-xl border transition-all duration-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs ${
        isWholesale
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Left: Mode Title & Pulsing Operational Signal */}
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isWholesale ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {isWholesale ? (
            <Tag size={18} weight="bold" />
          ) : (
            <Storefront size={18} weight="bold" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                isWholesale ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            />
            <h2 className="font-bold text-sm sm:text-base tracking-tight">
              {isWholesale ? '⚠️ পাইকারি বিক্রয় মোড সক্রিয় (Wholesale Rate)' : 'খুচরা বিক্রয় মোড (Retail)'}
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isWholesale
              ? 'বস্তা ও কার্টনের পাইকারি দর স্বয়ংক্রিয়ভাবে প্রযোজ্য'
              : 'সাধারণ খুচরা দর ও ২০ টাকার কাস্টম বিক্রয় সক্রিয়'}
          </p>
        </div>
      </div>

      {/* Right: Segmented Quick Toggle Buttons */}
      <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => onToggle('RETAIL')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            !isWholesale
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          খুচরা
        </button>
        <button
          type="button"
          onClick={() => onToggle('WHOLESALE')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            isWholesale
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          পাইকারি
        </button>
      </div>
    </div>
  );
}
