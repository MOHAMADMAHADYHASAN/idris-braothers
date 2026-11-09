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
import { Product, ProductUnit } from '@/features/product/product.types';
import { useProductStore } from '@/features/product/useProductStore';
import { usePosStore } from '../usePosStore';
import { formatCurrency, formatWeight } from '@/lib/decimal';

export function PosProductCatalog() {
  const { products, categories: storeCategories, isLoading, fetchProducts, fetchCategories } = useProductStore();
  const { saleType, addItem, addReversePriceItem } = usePosStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [reverseModalProduct, setReverseModalProduct] = useState<Product | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('20');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === 'ALL' ||
      p.category?.name === selectedCategory ||
      p.categoryId === selectedCategory ||
      p.category?.id === selectedCategory ||
      (typeof p.category === 'string' && p.category === selectedCategory);
    const matchSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.banglaName && p.banglaName.includes(searchTerm)) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.barcode && p.barcode.includes(searchTerm));
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
    if (!reverseModalProduct) return;
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      addReversePriceItem(reverseModalProduct, amount);
      setReverseModalProduct(null);
      setCustomAmount('20');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
      {/* 1. Header: Search Bar & Barcode Indicator */}
      <div className="p-3 border-b border-slate-200/80 bg-slate-50/60 space-y-2">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            id="pos-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="পণ্য খুঁজুন (নাম, বাংলা নাম, বারকোড বা SKU) [F2]"
            className="w-full h-9.5 pl-9 pr-9 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 transition-[border-color,box-shadow] duration-150"
          />
          <Barcode
            size={18}
            weight="bold"
            className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {categoryList.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer active:scale-[0.98] ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
            <span className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mb-2" />
            পণ্য তালিকা লোড হচ্ছে...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
            <WarningCircle size={28} weight="duotone" className="text-slate-300 mb-1.5" />
            <p className="font-medium text-slate-600">কোনো পণ্য খুঁজে পাওয়া যায়নি</p>
            <p className="text-[11px] text-slate-400 mt-0.5">অন্য নাম বা বারকোড দিয়ে চেষ্টা করুন</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {filteredProducts.map((product) => {
              const isWholesale = saleType === 'WHOLESALE';
              const activePrice = isWholesale ? product.wholesalePrice : product.retailPrice;
              const hasMultiUnits = product.units && product.units.length > 0;
              const isLowStock = product.stockQuantity <= product.lowStockAlert;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200/80 hover:border-slate-400/80 rounded-md p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between group"
                >
                  <div>
                    {/* Top: Name & Stock Badge */}
                    <div className="flex items-start justify-between gap-1.5 pb-1.5">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-xs sm:text-[13px] tracking-tight group-hover:text-slate-950 truncate">
                          {product.banglaName || product.name}
                        </h3>
                        {product.banglaName && (
                          <p className="text-[10px] text-slate-400 truncate tracking-tight">
                            {product.name}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border font-mono tabular-nums tracking-tight ${
                          isLowStock
                            ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                            : 'bg-slate-100 text-slate-600 border-slate-200/80'
                        }`}
                        title="বর্তমান গুদাম স্টক"
                      >
                        {formatWeight(product.stockQuantity, product.baseUnitName)}
                      </span>
                    </div>

                    {/* Price Tag with Tabular Numbers */}
                    <div className="py-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm sm:text-base font-bold text-slate-900 font-mono tabular-nums tracking-tight">
                          {formatCurrency(activePrice, false)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          / {product.baseUnitName}
                        </span>
                        {isWholesale && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-semibold ml-0.5">
                            পাইকারি
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Multi-Unit Buttons */}
                  <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    {/* Primary Base Unit Add Button */}
                    <button
                      type="button"
                      onClick={() => addItem(product)}
                      className="w-full h-8 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] active:scale-[0.98] cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900/10"
                    >
                      <Plus size={14} weight="bold" />
                      <span>যোগ করুন (১ {product.baseUnitName})</span>
                    </button>

                    {/* Quick Multi-Unit Pills (যেমন: বস্তা, কার্টন, পাল্লা) */}
                    {hasMultiUnits && (
                      <div className="flex flex-wrap gap-1">
                        {product.units?.map((unit: ProductUnit) => {
                          const unitRate = isWholesale
                            ? (unit.wholesalePrice ?? product.wholesalePrice * unit.conversionFactor)
                            : (unit.retailPrice ?? product.retailPrice * unit.conversionFactor);

                          return (
                            <button
                              key={unit.id}
                              type="button"
                              onClick={() => addItem(product, unit, 1)}
                              className="flex-1 py-1 px-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-[10px] font-semibold transition-[background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] text-center truncate cursor-pointer font-mono tabular-nums tracking-tight"
                              title={`${unit.unitName} (${formatCurrency(unitRate, false)})`}
                            >
                              + {unit.unitName}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Loose Spice: টাকার অংকে বিক্রি (Reverse Calculation) */}
                    {product.baseUnitName === 'কেজি' && (
                      <button
                        type="button"
                        onClick={() => setReverseModalProduct(product)}
                        className="w-full py-1 rounded-md bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 border border-amber-200/70 text-[11px] font-medium flex items-center justify-center gap-1 transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] cursor-pointer"
                      >
                        <Lightning size={13} weight="fill" className="text-amber-600" />
                        <span>টাকার অংকে বিক্রি (যেমন ২০ টাকার এলাচ)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reverse Price Modal with Spring Motion */}
      <AnimatePresence>
        {reverseModalProduct && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
            <motion.form
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
              onSubmit={handleReverseSubmit}
              className="bg-white rounded-lg max-w-sm w-full p-4 shadow-xl border border-slate-200 space-y-3.5 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                    <Lightning size={13} weight="fill" />
                    টাকার অংকে বিক্রি (Reverse Weight)
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
                    {reverseModalProduct.banglaName || reverseModalProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono tabular-nums tracking-tight mt-0.5">
                    দর: ৳{saleType === 'RETAIL' ? reverseModalProduct.retailPrice : reverseModalProduct.wholesalePrice} / কেজি
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReverseModalProduct(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  কাস্টমার কত টাকার নিতে চান? (টাকার পরিমাণ):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">
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
                    className="w-full h-10 pl-7 pr-3 rounded-md border border-slate-200 text-sm font-bold font-mono tabular-nums tracking-tight text-slate-900 focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                {/* Quick denomination buttons */}
                <div className="flex gap-1.5 mt-2">
                  {[10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCustomAmount(amt.toString())}
                      className="flex-1 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold font-mono tabular-nums text-slate-800 transition-colors"
                    >
                      {amt}৳
                    </button>
                  ))}
                </div>

                {parseFloat(customAmount) > 0 && (
                  <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200/80 rounded text-xs text-slate-700 font-mono tabular-nums tracking-tight flex justify-between items-center">
                    <span className="text-slate-500">হিসাবকৃত পরিমাণ:</span>
                    <span className="font-bold text-slate-900">
                      {(
                        (parseFloat(customAmount) /
                          (saleType === 'RETAIL'
                            ? reverseModalProduct.retailPrice
                            : reverseModalProduct.wholesalePrice)) *
                        1000
                      ).toFixed(1)}{' '}
                      গ্রাম
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReverseModalProduct(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-[background-color,transform] duration-150 active:scale-[0.98]"
                >
                  কার্টে যুক্ত করুন
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
