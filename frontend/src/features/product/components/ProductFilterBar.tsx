'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlass,
  X,
  Warning,
  Funnel,
  Tag,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { useProductStore } from '../useProductStore';
import { CustomSelect, SelectOption } from '@/components/shared/CustomSelect';

export function ProductFilterBar() {
  const {
    categories,
    brands,
    searchQuery,
    selectedCategoryId,
    selectedBrandId,
    lowStockOnly,
    isLoading,
    setSearchQuery,
    setSelectedCategoryId,
    setSelectedBrandId,
    setLowStockOnly,
    fetchProducts,
  } = useProductStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounced search trigger (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearchQuery(localSearch);
        fetchProducts({ search: localSearch || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, setSearchQuery, fetchProducts]);

  // Sync external search query reset
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Options for Category CustomSelect
  const categoryOptions: SelectOption<string>[] = [
    { label: 'সকল ক্যাটাগরি', value: '' },
    ...categories.map((c) => ({
      label: c.banglaName || c.name,
      value: c.id,
    })),
  ];

  // Options for Brand CustomSelect
  const brandOptions: SelectOption<string>[] = [
    { label: 'সকল ব্র্যান্ড', value: '' },
    ...brands.map((b) => ({
      label: b.banglaName || b.name,
      value: b.id,
    })),
  ];

  const handleClearSearch = () => {
    setLocalSearch('');
    setSearchQuery('');
    fetchProducts({ search: undefined, page: 1 });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-2.5">
      {/* রো ১: সার্চ ইনপুট ও ড্রপডাউন ফিল্টার */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* সার্চ ইনপুট */}
        <div className="relative flex-1 max-w-lg">
          <MagnifyingGlass
            size={15}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="পণ্য, বাংলা নাম, SKU বা বারকোড খুঁজুন... (F2 বা /)"
            className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
              title="সার্চ মুছুন"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        {/* ড্রপডাউন ও অ্যাকশন কন্ট্রোলস */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* ক্যাটাগরি ফিল্টার (Portal-Based CustomSelect) */}
          <div className="w-44">
            <CustomSelect
              options={categoryOptions}
              value={selectedCategoryId || ''}
              onChange={(val) => {
                const categoryId = val || null;
                setSelectedCategoryId(categoryId);
                fetchProducts({ categoryId: categoryId || undefined, page: 1 });
              }}
              placeholder="ক্যাটাগরি..."
              enableSearch
              prefix={<Funnel size={13} weight="bold" className="text-slate-400" />}
            />
          </div>

          {/* ব্র্যান্ড ফিল্টার (Portal-Based CustomSelect) */}
          <div className="w-40">
            <CustomSelect
              options={brandOptions}
              value={selectedBrandId || ''}
              onChange={(val) => {
                const brandId = val || null;
                setSelectedBrandId(brandId);
                fetchProducts({ brandId: brandId || undefined, page: 1 });
              }}
              placeholder="ব্র্যান্ড..."
              enableSearch
              prefix={<Tag size={13} weight="bold" className="text-slate-400" />}
            />
          </div>

          {/* স্টক সংকট টগল বাটন */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !lowStockOnly;
              setLowStockOnly(nextVal);
              fetchProducts({ lowStockOnly: nextVal || undefined, page: 1 });
            }}
            className={`h-7.5 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap border ${
              lowStockOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200'
                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
            }`}
          >
            <Warning size={13} weight={lowStockOnly ? 'fill' : 'bold'} className={lowStockOnly ? 'text-rose-600' : 'text-slate-400'} />
            <span>স্টক সংকট</span>
          </button>

          {/* রিফ্রেশ বাটন */}
          <button
            type="button"
            onClick={() => fetchProducts()}
            disabled={isLoading}
            className="h-7.5 px-2 rounded-md border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-600 hover:text-slate-900 transition-[background-color,border-color,transform] duration-150 disabled:opacity-50 cursor-pointer"
            title="তালিকা রিফ্রেশ করুন"
          >
            <ArrowsClockwise size={14} weight="bold" className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}
