'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlass, X, ArrowsClockwise, Funnel } from '@phosphor-icons/react';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { PayableFilterType } from '../supplierKhata.types';

export function SupplierFilterBar() {
  const {
    search,
    payableFilter,
    isLoading,
    setSearch,
    setPayableFilter,
    fetchSuppliers,
  } = useSupplierKhataStore();

  const [localSearch, setLocalSearch] = useState(search);

  // Debounced search trigger (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, setSearch]);

  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.02)] space-y-2.5">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* সার্চ ইনপুট */}
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            weight="bold"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="গদির নাম, মহাজনের নাম, ফোন বা মোকাম দিয়ে খুঁজুন (F2)..."
            className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-[background-color,border-color,box-shadow]"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                setSearch('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        {/* রিফ্রেশ বাটন */}
        <button
          onClick={() => fetchSuppliers()}
          disabled={isLoading}
          className="self-end sm:self-auto px-2.5 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition-[background-color,color] duration-150 active:scale-[0.98] disabled:opacity-50"
          title="রিফ্রেশ করুন"
        >
          <ArrowsClockwise
            size={15}
            weight="bold"
            className={isLoading ? 'animate-spin text-slate-900' : ''}
          />
          <span className="hidden sm:inline">রিফ্রেশ</span>
        </button>
      </div>

      {/* ফিল্টার পিলস (Payable Filter) */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-xs overflow-x-auto scrollbar-none">
        <span className="text-slate-400 mr-1 flex items-center gap-1 text-[11px] font-medium shrink-0">
          <Funnel size={13} weight="bold" />
          <span>দেনা ফিল্টার:</span>
        </span>
        {[
          { id: 'payableOnly', label: 'দেনা আছে (পাওনাদার)' },
          { id: 'all', label: 'সকল মহাজন' },
          { id: 'cleared', label: 'পরিশোধিত (০ দেনা)' },
          { id: 'advanceOnly', label: 'অগ্রিম দেওয়া আছে' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPayableFilter(tab.id as PayableFilterType)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-[background-color,color] duration-150 active:scale-[0.98] whitespace-nowrap ${
              payableFilter === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
