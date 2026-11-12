'use client';

import React, { useCallback } from 'react';
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import { useSalesStore } from '../useSalesStore';
import { SaleType, SaleStatus } from '../sales.types';
import { UnifiedDateRangeFilter } from '@/components/shared/UnifiedDateRangeFilter';
import { ResolvedDateRange } from '@/lib/dateFilter';

export function SalesFilterBar() {
  const searchQuery = useSalesStore((s) => s.searchQuery);
  const saleType = useSalesStore((s) => s.saleType);
  const status = useSalesStore((s) => s.status);
  const setSearchQuery = useSalesStore((s) => s.setSearchQuery);
  const setSaleType = useSalesStore((s) => s.setSaleType);
  const setStatus = useSalesStore((s) => s.setStatus);
  const setDateRange = useSalesStore((s) => s.setDateRange);

  const handleRangeChange = useCallback(
    (range: ResolvedDateRange) => {
      setDateRange(range.filter, range.startYmd, range.endYmd);
    },
    [setDateRange]
  );

  return (
    <div className="bg-surface-card rounded-lg border border-border-default p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-2.5">
      {/* রো ১: সার্চ ইনপুট ও গ্লোবাল ইউনিফাইড ডেট ফিল্টার */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* সার্চ ইনপুট */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={15}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="মেমো নং, নাম বা ফোন..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface-card border border-border-default rounded-md text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
          />
        </div>

        {/* টাইমজোন-সেফ ইউনিফাইড ডেট রেঞ্জ ফিল্টার */}
        <div className="overflow-x-auto pb-0.5 scrollbar-none">
          <UnifiedDateRangeFilter
            defaultFilter="today"
            onRangeChange={handleRangeChange}
          />
        </div>
      </div>

      {/* রো ২: টাইপ ও স্ট্যাটাস ফিল্টার */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border-subtle text-xs">
        {/* খুচরা বনাম পাইকারি */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-ink-secondary text-xs font-medium mr-0.5 flex items-center gap-1">
            <Funnel size={13} weight="bold" />
            <span>ধরন:</span>
          </span>
          {[
            { id: undefined, label: 'সব ধরন' },
            { id: 'RETAIL' as SaleType, label: 'খুচরা বিক্রি' },
            { id: 'WHOLESALE' as SaleType, label: 'পাইকারি বিক্রি' },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setSaleType(t.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ${
                saleType === t.id
                  ? t.id === 'WHOLESALE'
                    ? 'bg-wholesale-solid text-white shadow-xs'
                    : 'bg-brand-deep text-white shadow-xs'
                  : 'bg-surface-subtle text-ink-body hover:bg-surface-subtle border border-border-default'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* স্ট্যাটাস ফিল্টার */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-ink-secondary text-xs font-medium mr-0.5">স্ট্যাটাস:</span>
          {[
            { id: undefined, label: 'সব' },
            { id: 'COMPLETED' as SaleStatus, label: 'সম্পন্ন মেমো' },
            { id: 'CANCELLED' as SaleStatus, label: 'বাতিলকৃত' },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setStatus(s.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ${
                status === s.id
                  ? s.id === 'CANCELLED'
                    ? 'bg-danger text-white shadow-xs'
                    : s.id === 'COMPLETED'
                      ? 'bg-success text-white shadow-xs'
                      : 'bg-brand-deep text-white shadow-xs'
                  : 'bg-surface-subtle text-ink-body hover:bg-surface-subtle border border-border-default'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
