'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlass, X, ArrowsClockwise, Funnel } from '@phosphor-icons/react';
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
    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* সার্চ ইনপুট */}
        <div className="relative flex-1">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            weight="bold"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="কাস্টমারের নাম, মোবাইল বা এলাকা দিয়ে খুঁজুন (F2)..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-ink-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                setSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>

        {/* রিফ্রেশ বাটন */}
        <button
          onClick={() => fetchCustomers()}
          disabled={isLoading}
          className="self-end sm:self-auto px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-ink-muted hover:text-ink-primary hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          title="রিফ্রেশ করুন"
        >
          <ArrowsClockwise
            size={16}
            weight="bold"
            className={isLoading ? 'animate-spin text-emerald-600' : ''}
          />
          <span className="hidden sm:inline">রিফ্রেশ</span>
        </button>
      </div>

      {/* ফিল্টার পিলস (Due Filter + Customer Type) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
        {/* বাকি স্ট্যাটাস ফিল্টার */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-slate-400 mr-1 flex items-center gap-1 font-medium">
            <Funnel size={14} weight="bold" />
            <span>বকেয়া:</span>
          </span>
          {[
            { id: 'dueOnly', label: 'বকেয়া আছে' },
            { id: 'all', label: 'সকল খাতা' },
            { id: 'cleared', label: 'পরিশোধিত (০ বাকি)' },
            { id: 'advanceOnly', label: 'অগ্রিম জমা' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDueFilter(tab.id as DueFilterType)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                dueFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* গ্রাহক টাইপ ফিল্টার */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 mr-1 font-medium">টাইপ:</span>
          {[
            { id: undefined, label: 'সব' },
            { id: 'RETAIL', label: 'খুচরা' },
            { id: 'WHOLESALE', label: 'পাইকারি' },
          ].map((t) => (
            <button
              key={t.label}
              onClick={() => setCustomerType(t.id as CustomerType | undefined)}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                customerType === t.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
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
