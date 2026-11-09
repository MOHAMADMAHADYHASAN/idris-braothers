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
    <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-2.5">
      {/* রো ১: সার্চ ইনপুট ও গ্লোবাল ইউনিফাইড ডেট ফিল্টার */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* সার্চ ইনপুট */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={15}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="মেমো নং (যেমন: INV-20261109-0001) বা কাস্টমারের নাম/মোবাইল..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
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
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 text-xs">
        {/* খুচরা বনাম পাইকারি */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
            <Funnel size={12} weight="bold" />
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
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ${
                saleType === t.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* স্ট্যাটাস ফিল্টার */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[11px] mr-1">স্ট্যাটাস:</span>
          {[
            { id: undefined, label: 'সব' },
            { id: 'COMPLETED' as SaleStatus, label: 'সম্পন্ন মেমো' },
            { id: 'CANCELLED' as SaleStatus, label: 'বাতিলকৃত' },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setStatus(s.id)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ${
                status === s.id
                  ? s.id === 'CANCELLED'
                    ? 'bg-rose-700 text-white'
                    : 'bg-emerald-700 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
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
