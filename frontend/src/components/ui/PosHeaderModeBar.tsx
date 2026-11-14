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
    <div className="inline-flex items-center bg-surface-subtle p-1 rounded-xl border border-border-default shadow-2xs">
      <button
        type="button"
        onClick={() => onToggle('RETAIL')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
          !isWholesale
            ? 'bg-brand-deep text-white shadow-2xs'
            : 'text-ink-secondary hover:text-ink-primary'
        }`}
      >
        <Storefront size={15} weight={!isWholesale ? 'fill' : 'bold'} />
        <span>খুচরা বিক্রয়</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle('WHOLESALE')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
          isWholesale
            ? 'bg-wholesale-solid text-white shadow-2xs'
            : 'text-ink-secondary hover:text-ink-primary'
        }`}
      >
        <Tag size={15} weight={isWholesale ? 'fill' : 'bold'} />
        <span>পাইকারি বিক্রয়</span>
      </button>
    </div>
  );
}
