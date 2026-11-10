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
}: PosHeaderModeBarProps) {
  const isWholesale = saleType === 'WHOLESALE';

  return (
    <div
      className={`px-3 py-2 rounded-lg border transition-[background-color,border-color] duration-150 flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] ${
        isWholesale
          ? 'bg-wholesale-bg border-wholesale-border text-wholesale-text'
          : 'bg-surface-card border-border-default text-ink-primary'
      }`}
    >
      {/* Left: Operational Signal & Mode Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border transition-colors duration-150 ${
            isWholesale
              ? 'bg-wholesale-solid border-wholesale-hover text-white'
              : 'bg-brand-deep border-brand-hover text-white'
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
                isWholesale ? 'bg-wholesale-solid animate-pulse' : 'bg-success'
              }`}
            />
            <h2 className="font-semibold text-xs sm:text-sm truncate text-ink-primary">
              {isWholesale ? 'পাইকারি বিক্রয় মোড' : 'খুচরা বিক্রয় মোড'}
            </h2>
          </div>
        </div>
      </div>

      {/* Right: Segmented Tactile Switcher */}
      <div className="flex items-center bg-surface-subtle p-0.5 rounded-md border border-border-default shrink-0">
        <button
          type="button"
          onClick={() => onToggle('RETAIL')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] cursor-pointer ${
            !isWholesale
              ? 'bg-brand-deep text-white shadow-[0_1px_2px_rgba(30,74,122,0.18)]'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          খুচরা
        </button>
        <button
          type="button"
          onClick={() => onToggle('WHOLESALE')}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] cursor-pointer ${
            isWholesale
              ? 'bg-wholesale-solid text-white shadow-[0_1px_2px_rgba(180,83,9,0.18)]'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          পাইকারি
        </button>
      </div>
    </div>
  );
}
