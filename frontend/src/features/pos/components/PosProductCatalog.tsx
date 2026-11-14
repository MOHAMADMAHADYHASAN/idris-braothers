'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlass,
  Barcode,
  Plus,
  SlidersHorizontal,
  WarningCircle,
  X,
  Package,
  ProhibitInset,
} from '@phosphor-icons/react';
import { Product, ProductVariant, ProductUnit } from '@/features/product/product.types';
import { useProductStore } from '@/features/product/useProductStore';
import { usePosStore } from '../usePosStore';
import { formatCurrency, formatNumber, formatWeight } from '@/lib/decimal';
import { PosQuickAddModal } from './PosQuickAddModal';

export function PosProductCatalog() {
  const { products, categories: storeCategories, isLoading, fetchProducts, fetchCategories } = useProductStore();
  const { saleType, addItem, addReversePriceItem } = usePosStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    fetchProducts({ page: 1, limit: 100 });
    fetchCategories();
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, [fetchProducts, fetchCategories]);

  const query = searchTerm.trim().toLowerCase();

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === 'ALL' ||
      p.category?.name === selectedCategory ||
      p.categoryId === selectedCategory ||
      p.category?.id === selectedCategory ||
      (typeof p.category === 'string' && p.category === selectedCategory);
    const matchSearch =
      query === '' ||
      p.name.toLowerCase().includes(query) ||
      (p.banglaName && p.banglaName.toLowerCase().includes(query)) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.barcode && p.barcode.toLowerCase().includes(query)) ||
      (p.variants || []).some(
        (v) =>
          v.variantName.toLowerCase().includes(query) ||
          (v.sku && v.sku.toLowerCase().includes(query)) ||
          (v.barcode && v.barcode.toLowerCase().includes(query)) ||
          (v.units || []).some((u) => u.barcode && u.barcode.toLowerCase().includes(query))
      );
    return matchCategory && matchSearch;
  });

  const categoryList = [
    { id: 'ALL', label: 'সকল পণ্য' },
    ...storeCategories.map((c) => ({
      id: c.id,
      label: c.banglaName || c.name,
    })),
  ];

  // Identifies whether a product requires the Smart Quick-Add Modal (weighable, multi-variant, or multi-packaging)
  const isComplexProduct = (p: Product) => {
    const variants = p.variants || [];
    const hasMultipleVariants = p.hasVariants && variants.length > 1;
    const hasUnits = variants.some((v) => v.units && v.units.length > 0) || Boolean(p.units && p.units.length > 0);
    const isDecimal = variants.some((v) => v.allowDecimalQty);
    return hasMultipleVariants || hasUnits || isDecimal;
  };

  const handleCardClick = (product: Product) => {
    const activeStock = product.variants?.[0]?.stockQuantity ?? product.stockQuantity ?? 0;
    if (activeStock <= 0) return;

    if (isComplexProduct(product)) {
      // Smart Hybrid: opens customized quick-add modal for weighable or variant items
      setModalProduct(product);
    } else {
      // Fast 1-tap add for simple single-packet items (like soap, chips, biscuit)
      addItem(product, product.variants?.[0], undefined, 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-card rounded-2xl border border-border-default shadow-xs overflow-hidden">
      {/* 1. Clean Search & Category Header */}
      <div className="p-3.5 border-b border-border-default/80 bg-surface-card space-y-3">
        {/* Modern Search Bar */}
        <div className="relative">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="text-ink-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            id="pos-search-input"
            type="text"
            aria-label="পণ্য খুঁজুন (নাম, বারকোড বা SKU)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isTouchDevice ? 'পণ্য খুঁজুন (নাম, বারকোড বা SKU)...' : 'পণ্য খুঁজুন (নাম, বারকোড বা SKU)... [F2]'}
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-border-strong bg-surface-subtle/50 focus:bg-surface-card text-xs sm:text-sm font-medium text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep transition-all shadow-2xs"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-secondary hover:text-ink-primary rounded-md"
              title="সার্চ মুছুন"
            >
              <X size={15} weight="bold" />
            </button>
          ) : (
            <Barcode
              size={20}
              weight="bold"
              className="text-ink-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
            />
          )}
        </div>

        {/* Minimalist Rounded Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {categoryList.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                selectedCategory === cat.id
                  ? 'bg-brand-deep text-white shadow-2xs'
                  : 'bg-surface-subtle hover:bg-brand-soft/70 text-ink-body hover:text-brand-deep border border-border-subtle'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Modern Product Grid — One-Tap Square POS Card Style */}
      <div className="flex-1 overflow-y-auto p-3.5">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-ink-secondary text-xs font-medium">
            <span className="w-6 h-6 border-2 border-brand-deep border-t-transparent rounded-full animate-spin mb-2" />
            <span>পণ্য ক্যাটালগ লোড হচ্ছে...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-ink-secondary text-xs text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center mb-2 text-ink-muted">
              <WarningCircle size={26} weight="duotone" />
            </div>
            <p className="font-bold text-sm text-ink-primary">কোনো পণ্য খুঁজে পাওয়া যায়নি</p>
            {query && (
              <p className="text-xs text-ink-secondary mt-1">
                &quot;{searchTerm}&quot; দিয়ে মিল পাওয়া যায়নি। বানান চেক করুন বা বারকোড স্ক্যান করুন।
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const isWholesale = saleType === 'WHOLESALE';
              const variants = product.variants || [];
              const activeVariant = variants[0];
              const isComplex = isComplexProduct(product);

              const activePrice = activeVariant
                ? isWholesale
                  ? activeVariant.wholesalePrice
                  : activeVariant.retailPrice
                : isWholesale
                ? product.wholesalePrice
                : product.retailPrice;

              const activeStock = activeVariant ? activeVariant.stockQuantity : product.stockQuantity;
              const activeLowAlert = activeVariant ? activeVariant.lowStockAlert : product.lowStockAlert;
              const activeUnitName = activeVariant ? activeVariant.baseUnitName : product.baseUnitName;
              const isOutOfStock = activeStock <= 0;
              const isLowStock = activeStock <= activeLowAlert && !isOutOfStock;

              return (
                <div
                  key={product.id}
                  onClick={() => handleCardClick(product)}
                  className={`relative rounded-xl p-3 border transition-all duration-150 flex flex-col justify-between text-left select-none ${
                    isOutOfStock
                      ? 'bg-surface-subtle/50 border-border-default opacity-60 cursor-not-allowed'
                      : 'bg-surface-card hover:bg-surface-subtle/40 border-border-default hover:border-brand-mid/80 shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]'
                  }`}
                  role="button"
                  tabIndex={isOutOfStock ? -1 : 0}
                  aria-disabled={isOutOfStock}
                  aria-label={`${product.banglaName || product.name}, মূল্য ${formatCurrency(activePrice, false)}`}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isOutOfStock) {
                      e.preventDefault();
                      handleCardClick(product);
                    }
                  }}
                >
                  <div>
                    {/* Top Row: Icon + Stock Indicator */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-soft/70 border border-brand-light/50 flex items-center justify-center text-brand-deep shrink-0">
                        <Package size={17} weight="duotone" />
                      </div>

                      <div className="text-right">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-bold bg-due-bg text-due-text border border-due-border">
                            <ProhibitInset size={11} weight="bold" />
                            <span>স্টক নেই</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-bold bg-due-bg/70 text-due-text border border-due-border font-mono">
                            <span>কম ({formatNumber(activeStock)})</span>
                          </span>
                        ) : (
                          <span className="text-2xs font-mono font-semibold text-ink-secondary">
                            স্টক: {formatWeight(activeStock, activeUnitName)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Bangla & English Name */}
                    <div className="min-w-0">
                      <h3 className="font-bold text-ink-primary text-xs sm:text-sm line-clamp-2 leading-snug">
                        {product.banglaName || product.name}
                      </h3>
                      {product.banglaName && product.name && (
                        <p className="text-2xs text-ink-secondary truncate mt-0.5">
                          {product.name}
                        </p>
                      )}
                    </div>

                    {/* Tag showing that clicking will open modal (for weighable or variant items) */}
                    {isComplex && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-bold bg-brand-soft/80 text-brand-deep border border-brand-light/60">
                          <SlidersHorizontal size={11} weight="bold" />
                          <span>
                            {variants.length > 1
                              ? `${formatNumber(variants.length)} সাইজ / ওজন`
                              : 'ওজন ও টাকা মোড'}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Price & Tap CTA */}
                  <div className="pt-2.5 mt-2 border-t border-border-subtle/80 flex items-end justify-between gap-1">
                    <div>
                      <div className="font-black text-sm sm:text-base text-ink-primary font-mono tabular-nums leading-none">
                        {formatCurrency(activePrice, false)}
                        <span className="text-2xs font-medium text-ink-secondary ml-0.5 font-sans">
                          /{activeUnitName}
                        </span>
                      </div>
                      {isWholesale && (
                        <span className="text-2xs font-bold text-wholesale-text block mt-0.5">
                          পাইকারি রেট
                        </span>
                      )}
                    </div>

                    {/* Tap indicator button */}
                    {!isOutOfStock && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(product);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                          isComplex
                            ? 'bg-wholesale-bg text-wholesale-text border border-wholesale-border/70 hover:bg-wholesale-solid hover:text-white'
                            : 'bg-brand-deep text-white'
                        }`}
                        title={isComplex ? 'ক্লিক করে সাইজ ও ওজন নির্ধারণ করুন' : '১ পিস কার্টে যোগ করুন'}
                      >
                        {isComplex ? (
                          <SlidersHorizontal size={13} weight="bold" />
                        ) : (
                          <Plus size={14} weight="bold" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Smart Quick-Add Modal */}
      <PosQuickAddModal
        isOpen={Boolean(modalProduct)}
        onClose={() => setModalProduct(null)}
        product={modalProduct}
        saleType={saleType}
        onAddStandardItem={(prod, variant, unit, qty) => {
          addItem(prod, variant, unit, qty);
        }}
        onAddReversePriceItem={(prod, customTotal, variant) => {
          addReversePriceItem(prod, customTotal, variant);
        }}
      />
    </div>
  );
}
