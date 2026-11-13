'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlass,
  X,
  Warning,
  Funnel,
  Tag,
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
    <div className="bg-surface-card rounded-xl border border-border-default p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-2.5">
      {/* রো ১: সার্চ ইনপুট ও ড্রপডাউন ফিল্টার */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* সার্চ ইনপুট */}
        <div className="relative flex-1 max-w-lg">
          <MagnifyingGlass
            size={15}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="নাম, SKU বা বারকোড খুঁজুন..."
            className="w-full h-9 pl-9 pr-8 bg-surface-card border border-border-strong rounded-lg text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink-primary p-0.5 rounded cursor-pointer"
              title="সার্চ মুছুন"
              aria-label="অনুসন্ধান মুছুন"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        {/* ড্রপডাউন ও অ্যাকশন কন্ট্রোলস */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
              prefix={<Funnel size={13} weight="bold" className="text-ink-secondary" />}
            />
          </div>

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
              prefix={<Tag size={13} weight="bold" className="text-ink-secondary" />}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const nextVal = !lowStockOnly;
              setLowStockOnly(nextVal);
              fetchProducts({ lowStockOnly: nextVal || undefined, page: 1 });
            }}
            className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap border ${
              lowStockOnly
                ? 'bg-due-bg text-due-text border-due-border ring-1 ring-due-border'
                : 'bg-surface-card text-ink-body border-border-strong hover:bg-surface-subtle'
            }`}
          >
            <Warning size={14} weight={lowStockOnly ? 'fill' : 'bold'} className={lowStockOnly ? 'text-danger' : 'text-ink-secondary'} />
            <span>স্টক সংকট</span>
          </button>
        </div>
      </div>
    </div>
  );
}
