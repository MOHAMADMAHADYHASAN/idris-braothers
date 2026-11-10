'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlass, X, ArrowsClockwise, Funnel } from '@phosphor-icons/react';
import { buttonClasses } from '@/components/ui/Button';
import { useCustomerKhataStore } from '../useCustomerKhataStore';
import { CustomerType, DueFilterType } from '../customerKhata.types';

export function CustomerFilterBar() {
  const {
    search,
    customerType,
    dueFilter,
    isLoading,
    setSearch,
    setCustomerType,
    setDueFilter,
    fetchCustomers,
  } = useCustomerKhataStore();

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
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            weight="bold"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="নাম, ফোন বা এলাকা খুঁজুন..."
            className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep focus:bg-white transition-[background-color,border-color,box-shadow]"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                setSearch('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        {/* রিফ্রেশ বাটন */}
        <button
          type="button"
          onClick={() => fetchCustomers()}
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

      {/* ফিল্টার পিলস (Due Filter + Customer Type) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* বাকি স্ট্যাটাস ফিল্টার */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-slate-600 mr-0.5 flex items-center gap-1 text-xs font-medium shrink-0">
            <Funnel size={13} weight="bold" />
            <span>বকেয়া:</span>
          </span>
          {[
            { id: 'dueOnly', label: 'বকেয়া আছে' },
            { id: 'all', label: 'সকল খাতা' },
            { id: 'cleared', label: 'পরিশোধিত' },
            { id: 'advanceOnly', label: 'অগ্রিম জমা' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDueFilter(tab.id as DueFilterType)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-[background-color,color] duration-150 active:scale-[0.98] whitespace-nowrap cursor-pointer ${
                dueFilter === tab.id
                  ? 'bg-brand-deep text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* গ্রাহক টাইপ ফিল্টার */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 mr-0.5 text-xs font-medium">টাইপ:</span>
          {[
            { id: undefined, label: 'সব' },
            { id: 'RETAIL', label: 'খুচরা' },
            { id: 'WHOLESALE', label: 'পাইকারি' },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setCustomerType(t.id as CustomerType | undefined)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ${
                customerType === t.id
                  ? t.id === 'WHOLESALE'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-brand-deep text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
