'use client';

import React, { useState, useEffect } from 'react';
import { Search, Barcode, Plus, Zap, AlertCircle } from 'lucide-react';
import { Product, ProductUnit } from '@/features/product/product.types';
import { useProductStore } from '@/features/product/useProductStore';
import { usePosStore } from '../usePosStore';
import { formatCurrency, formatWeight } from '@/lib/decimal';

export function PosProductCatalog() {
  const { products, isLoading, fetchProducts } = useProductStore();
  const { saleType, addItem, addReversePriceItem } = usePosStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [reverseModalProduct, setReverseModalProduct] = useState<Product | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('20');

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced Search filter
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.banglaName && p.banglaName.includes(searchTerm)) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.barcode && p.barcode.includes(searchTerm));
    return matchCategory && matchSearch;
  });

  const categories = [
    { id: 'ALL', label: 'সকল পণ্য' },
    { id: 'SPICES', label: 'মসলা' },
    { id: 'RICE_GRAINS', label: 'চাল ও ডাল' },
    { id: 'OIL_GHEE', label: 'তেল ও ঘি' },
    { id: 'SUGAR', label: 'চিনি' },
    { id: 'PACKAGED', label: 'প্যাকেটজাত' },
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
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* 1. Header: Search Bar & Barcode Scanner Indicator */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="pos-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="পণ্য খুঁজুন (নাম, বাংলা নাম, বারকোড বা SKU) [F2]"
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 transition-all"
          />
          <Barcode className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Products Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm font-medium">
            <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
            পণ্য তালিকা লোড হচ্ছে...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            কোনো পণ্য খুঁজে পাওয়া যায়নি
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const isWholesale = saleType === 'WHOLESALE';
              const activePrice = isWholesale ? product.wholesalePrice : product.retailPrice;
              const hasMultiUnits = product.units && product.units.length > 0;
              const isLowStock = product.stockQuantity <= product.lowStockAlert;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 hover:border-emerald-600/60 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top: Name & Stock Badge */}
                    <div className="flex items-start justify-between gap-1.5 pb-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors truncate">
                          {product.banglaName || product.name}
                        </h3>
                        {product.banglaName && (
                          <p className="text-[11px] text-slate-400 truncate">
                            {product.name}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border tabular-numbers ${
                          isLowStock
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                        title="বর্তমান গুদাম স্টক"
                      >
                        {formatWeight(product.stockQuantity, product.baseUnitName)}
                      </span>
                    </div>

                    {/* Price Tag */}
                    <div className="py-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-slate-900 tabular-numbers">
                          {formatCurrency(activePrice, false)}
                        </span>
                        <span className="text-xs text-slate-500">
                          / {product.baseUnitName}
                        </span>
                        {isWholesale && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold ml-1">
                            পাইকারি
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Multi-Unit Buttons */}
                  <div className="pt-2.5 mt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    {/* Primary Base Unit Add Button */}
                    <button
                      type="button"
                      onClick={() => addItem(product)}
                      className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      যোগ করুন (১ {product.baseUnitName})
                    </button>

                    {/* Quick Multi-Unit Pills (e.g. বস্তা, পাল্লা, কার্টন) */}
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
                              className="flex-1 py-1 px-1.5 rounded-md bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-[10px] font-bold transition-all text-center truncate cursor-pointer"
                              title={`${unit.unitName} (${formatCurrency(unitRate, false)})`}
                            >
                              + {unit.unitName}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Loose Spice Feature: "টাকার অংকে বিক্রি (২০৳/৫০৳/১০০৳)" */}
                    {product.baseUnitName === 'কেজি' && (
                      <button
                        type="button"
                        onClick={() => setReverseModalProduct(product)}
                        className="w-full py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-600" />
                        টাকার অংকে বিক্রি (যেমন ২০ টাকার এলাচ)
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
      {reverseModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleReverseSubmit}
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4"
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                টাকার অংকে বিক্রি (Reverse Calculation)
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {reverseModalProduct.banglaName || reverseModalProduct.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                বর্তমান দর: ৳{saleType === 'RETAIL' ? reverseModalProduct.retailPrice : reverseModalProduct.wholesalePrice} / কেজি
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                কাস্টমার কত টাকার নিতে চান? (টাকা লিখুন):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                  ৳
                </span>
                <input
                  type="number"
                  autoFocus
                  min="1"
                  step="any"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full h-12 pl-9 pr-3 rounded-xl border-2 border-amber-400 bg-amber-50/40 text-lg font-black text-slate-900 tabular-numbers focus:border-amber-600"
                  placeholder="20"
                />
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex gap-2 mt-2">
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomAmount(amt.toString())}
                    className="flex-1 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 cursor-pointer"
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1 border border-slate-200/80">
              <div className="flex justify-between">
                <span>স্বয়ংক্রিয় ব্যাক-ক্যালকুলেটেড ওজন:</span>
                <span className="font-bold text-slate-900 tabular-numbers">
                  {reverseModalProduct && parseFloat(customAmount) > 0
                    ? (
                        parseFloat(customAmount) /
                        (saleType === 'RETAIL'
                          ? reverseModalProduct.retailPrice
                          : reverseModalProduct.wholesalePrice)
                      ).toFixed(4)
                    : '0.0000'}{' '}
                  কেজি
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                * ৪ দশমিকে নির্ভুল ওজন বের হয়ে মূল স্টক থেকে কেটে নেওয়া হবে।
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setReverseModalProduct(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                কার্টে যোগ করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
