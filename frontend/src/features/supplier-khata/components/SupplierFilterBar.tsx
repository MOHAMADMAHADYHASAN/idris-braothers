'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlass, X, ArrowsClockwise, Funnel } from '@phosphor-icons/react';
import { buttonClasses } from '@/components/ui/Button';
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
    <div className="bg-surface-card p-3 rounded-lg border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.02)] space-y-2.5">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* সার্চ ইনপুট */}
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-secondary"
            weight="bold"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="নাম, প্রতিষ্ঠান, ফোন বা ঠিকানা খুঁজুন..."
            className="w-full pl-8 pr-8 py-1.5 bg-surface-subtle border border-border-default rounded-md text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep focus:bg-surface-card transition-[background-color,border-color,box-shadow]"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                setSearch('');
              }}
              aria-label="অনুসন্ধান মুছুন"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink-primary p-0.5 cursor-pointer"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        {/* রিফ্রেশ বাটন */}
        <button
          type="button"
          onClick={() => fetchSuppliers()}
          disabled={isLoading}
          className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'self-end sm:self-auto gap-1.5' })}
          title="রিফ্রেশ করুন"
        >
          <ArrowsClockwise
            size={15}
            weight="bold"
            className={isLoading ? 'animate-spin text-brand-deep' : ''}
          />
          <span className="hidden sm:inline">রিফ্রেশ</span>
        </button>
      </div>

      {/* ফিল্টার পিলস (Payable Filter) */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-border-subtle text-xs overflow-x-auto scrollbar-none">
        <span className="text-ink-secondary mr-0.5 flex items-center gap-1 text-xs font-medium shrink-0">
          <Funnel size={13} weight="bold" />
          <span>দেনা ফিল্টার:</span>
        </span>
        {[
          { id: 'payableOnly', label: 'দেনা আছে' },
          { id: 'all', label: 'সকল মহাজন' },
          { id: 'cleared', label: 'পরিশোধিত' },
          { id: 'advanceOnly', label: 'অগ্রিম দেওয়া আছে' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPayableFilter(tab.id as PayableFilterType)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-[background-color,color] duration-150 active:scale-[0.98] whitespace-nowrap cursor-pointer ${
              payableFilter === tab.id
                ? 'bg-brand-deep text-white shadow-xs'
                : 'bg-surface-subtle text-ink-body hover:bg-surface-subtle border border-border-default'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
