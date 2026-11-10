'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MagnifyingGlass,
  Barcode,
  Plus,
  Lightning,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { Product, ProductVariant } from '@/features/product/product.types';
import { useProductStore } from '@/features/product/useProductStore';
import { usePosStore } from '../usePosStore';
import { formatCurrency, formatNumber, formatWeight } from '@/lib/decimal';

export function PosProductCatalog() {
  const { products, categories: storeCategories, isLoading, fetchProducts, fetchCategories } = useProductStore();
  const { saleType, addItem, addReversePriceItem } = usePosStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedVariantByProduct, setSelectedVariantByProduct] = useState<Record<string, string>>({});
  const [reverseModalTarget, setReverseModalTarget] = useState<{ product: Product; variant?: ProductVariant } | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('20');

  useEffect(() => {
    fetchProducts({ page: 1, limit: 100 });
    fetchCategories();
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

  const handleReverseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reverseModalTarget) return;
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      addReversePriceItem(reverseModalTarget.product, amount, reverseModalTarget.variant);
      setReverseModalTarget(null);
      setCustomAmount('20');
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
      {/* 1. Header: Search Bar & Category Filter */}
      <div className="p-3 border-b border-border-default bg-surface-subtle/60 space-y-2.5">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="text-ink-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            id="pos-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="পণ্য খুঁজুন (নাম, বারকোড বা SKU) [F2]"
            className="w-full h-10 pl-9 pr-9 rounded-lg border border-border-strong bg-surface-card text-xs sm:text-sm font-medium text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
          />
          <Barcode
            size={18}
            weight="bold"
            className="text-ink-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {categoryList.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-150 cursor-pointer active:scale-[0.98] ${
                selectedCategory === cat.id
                  ? 'bg-brand-deep text-white shadow-2xs'
                  : 'bg-surface-card border border-border-default text-ink-body hover:bg-surface-subtle hover:text-ink-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Products Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-ink-secondary text-xs font-medium">
            <span className="w-5 h-5 border-2 border-brand-deep border-t-transparent rounded-full animate-spin mb-2" />
            পণ্য তালিকা লোড হচ্ছে...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-ink-secondary text-xs text-center p-4">
            <WarningCircle size={28} weight="duotone" className="text-ink-muted mb-1.5" />
            <p className="font-semibold text-sm text-ink-primary">কোনো পণ্য খুঁজে পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {filteredProducts.map((product) => {
              const isWholesale = saleType === 'WHOLESALE';
              const variants = product.variants || [];
              const hasMultipleVariants = product.hasVariants && variants.length > 1;

              const searchMatchedVariant = query
                ? variants.find(
                    (v) =>
                      v.variantName.toLowerCase().includes(query) ||
                      (v.sku && v.sku.toLowerCase().includes(query)) ||
                      (v.barcode && v.barcode.toLowerCase().includes(query))
                  )
                : undefined;

              const explicitVariantId = selectedVariantByProduct[product.id];
              const activeVariant =
                variants.find((v) => v.id === explicitVariantId) ||
                searchMatchedVariant ||
                variants[0];

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
              const isDecimalAllowed = activeVariant ? activeVariant.allowDecimalQty : true;
              const isLowStock = activeStock <= activeLowAlert;

              return (
                <div
                  key={product.id}
                  className="bg-surface-card border border-border-default hover:border-brand-mid rounded-lg p-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-[border-color,box-shadow] duration-150 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top: Name & Stock Badge */}
                    <div className="flex items-start justify-between gap-2 pb-1.5">
                      <div className="min-w-0">
                        <h3 className="font-bold text-ink-primary text-xs sm:text-sm truncate">
                          {product.banglaName || product.name}
                        </h3>
                        {product.banglaName && (
                          <p className="text-xs text-ink-secondary truncate">
                            {product.name}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold border font-mono tabular-nums ${
                          isLowStock
                            ? 'bg-due-bg text-due-text border-due-border'
                            : 'bg-surface-subtle text-ink-body border-border-default'
                        }`}
                        title="বর্তমান গুদাম স্টক"
                      >
                        {formatWeight(activeStock, activeUnitName)}
                      </span>
                    </div>

                    {/* Variant Size Pills (for multi-variant products e.g. ৫০০ml, ১L, ৫L) */}
                    {hasMultipleVariants && (
                      <div className="flex flex-wrap gap-1 pt-1 pb-1.5">
                        {variants.map((v) => {
                          const isSelected = activeVariant?.id === v.id;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() =>
                                setSelectedVariantByProduct((prev) => ({
                                  ...prev,
                                  [product.id]: v.id,
                                }))
                              }
                              className={`px-2 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-brand-deep text-white border-brand-deep shadow-2xs'
                                  : 'bg-surface-subtle text-ink-body border-border-default hover:bg-brand-soft hover:text-brand-deep'
                              }`}
                            >
                              {v.variantName}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Price Tag */}
                    <div className="py-1">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-base font-bold text-ink-primary font-mono tabular-nums">
                          {formatCurrency(activePrice, false)}
                        </span>
                        <span className="text-xs text-ink-secondary font-medium">
                          / {activeUnitName}
                        </span>
                        {isWholesale && (
                          <span className="text-xs bg-wholesale-bg text-wholesale-text border border-wholesale-border/60 px-1.5 py-0.5 rounded font-semibold">
                            পাইকারি
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2.5 mt-2 border-t border-border-subtle flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => addItem(product, activeVariant, undefined, 1)}
                      className="w-full h-9 rounded-lg bg-brand-deep hover:bg-brand-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-[background-color,transform] duration-150 shadow-[0_1px_2px_rgba(30,74,122,0.16)] active:scale-[0.98] cursor-pointer"
                    >
                      <Plus size={14} weight="bold" />
                      <span>যোগ করুন (১ {activeUnitName})</span>
                    </button>

                    {/* Weighable products: টাকার অংকে বিক্রি */}
                    {isDecimalAllowed && (
                      <button
                        type="button"
                        onClick={() => setReverseModalTarget({ product, variant: activeVariant })}
                        className="w-full py-1.5 rounded-md bg-wholesale-bg/70 hover:bg-wholesale-bg text-wholesale-text border border-wholesale-border/60 text-xs font-semibold flex items-center justify-center gap-1 transition-[background-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
                      >
                        <Lightning size={13} weight="fill" className="text-wholesale-solid" />
                        <span>টাকার অংকে বিক্রি</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reverse Price Modal */}
      <AnimatePresence>
        {reverseModalTarget && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
            <motion.form
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
              onSubmit={handleReverseSubmit}
              className="bg-surface-card rounded-xl max-w-sm w-full p-4 shadow-xl border border-border-default space-y-3.5 relative"
            >
              {(() => {
                const targetProduct = reverseModalTarget.product;
                const targetVariant = reverseModalTarget.variant || targetProduct.variants?.[0];
                const reverseRate = targetVariant
                  ? saleType === 'RETAIL'
                    ? targetVariant.retailPrice
                    : targetVariant.wholesalePrice
                  : saleType === 'RETAIL'
                  ? targetProduct.retailPrice
                  : targetProduct.wholesalePrice;
                const reverseUnit = targetVariant?.baseUnitName || targetProduct.baseUnitName || 'কেজি';
                const variantSuffix =
                  targetVariant?.variantName && targetVariant.variantName !== 'Default'
                    ? ` (${targetVariant.variantName})`
                    : '';
                const parsedAmt = parseFloat(customAmount) || 0;
                const qtyInUnit = reverseRate > 0 ? parsedAmt / reverseRate : 0;

                return (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-wholesale-text flex items-center gap-1">
                          <Lightning size={13} weight="fill" />
                          টাকার অংকে বিক্রি
                        </span>
                        <h3 className="text-sm font-bold text-ink-primary mt-0.5">
                          {targetProduct.banglaName || targetProduct.name}
                          {variantSuffix}
                        </h3>
                        <p className="text-xs text-ink-secondary font-mono tabular-nums mt-0.5">
                          দর: {formatCurrency(reverseRate, false)} / {reverseUnit}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReverseModalTarget(null)}
                        className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                      >
                        <X size={16} weight="bold" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-body mb-1">
                        কাস্টমার কত টাকার নিতে চান?
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-ink-secondary text-xs">
                          ৳
                        </span>
                        <input
                          type="number"
                          autoFocus
                          required
                          min="1"
                          step="any"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full h-10 pl-7 pr-3 rounded-lg border border-border-strong text-sm font-bold font-mono tabular-nums text-ink-primary focus:outline-hidden focus:border-brand-deep"
                        />
                      </div>

                      <div className="flex gap-1.5 mt-2">
                        {[20, 50, 100, 500].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCustomAmount(amt.toString())}
                            className="flex-1 py-1.5 rounded-md bg-surface-subtle hover:bg-brand-soft hover:text-brand-deep border border-border-default text-xs font-semibold font-mono tabular-nums text-ink-body transition-colors cursor-pointer"
                          >
                            {formatNumber(amt)}৳
                          </button>
                        ))}
                      </div>

                      {parsedAmt > 0 && (
                        <div className="mt-2.5 p-2.5 bg-surface-subtle border border-border-default rounded-lg text-xs text-ink-body font-mono tabular-nums flex justify-between items-center">
                          <span className="text-ink-secondary">হিসাবকৃত পরিমাণ:</span>
                          <span className="font-bold text-ink-primary">
                            {reverseUnit === 'কেজি' && qtyInUnit < 1
                              ? `${formatNumber(qtyInUnit * 1000, { minDecimals: 0, maxDecimals: 1 })} গ্রাম`
                              : `${formatNumber(qtyInUnit, { minDecimals: 2, maxDecimals: 4 })} ${reverseUnit}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                      <button
                        type="button"
                        onClick={() => setReverseModalTarget(null)}
                        className="px-3.5 py-2 text-xs font-semibold text-ink-body border border-border-strong hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-semibold bg-brand-deep text-white rounded-lg hover:bg-brand-hover transition-[background-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
                      >
                        কার্টে যুক্ত করুন
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
