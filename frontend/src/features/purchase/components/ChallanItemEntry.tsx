'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlass,
  Plus,
  Package,
  Scales,
  ArrowsClockwise,
  CheckSquare,
  Square,
  Tag,
} from '@phosphor-icons/react';
import { productService } from '@/features/product/product.service';
import { Product, ProductUnit } from '@/features/product/product.types';
import { formatCurrency, formatWeight } from '@/lib/decimal';
import { usePurchaseStore } from '../usePurchaseStore';

export function ChallanItemEntry() {
  const { addItem } = usePurchaseStore();

  // Product Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Unit & Factor State
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [selectedUnitName, setSelectedUnitName] = useState('কেজি');
  const [conversionFactor, setConversionFactor] = useState(1);
  const [saveUnitForFuture, setSaveUnitForFuture] = useState(false);

  // Quantity & Rate State
  const [quantityStr, setQuantityStr] = useState('');
  const [unitCostStr, setUnitCostStr] = useState('');

  // Replacement Price Updates
  const [newRetailPriceStr, setNewRetailPriceStr] = useState('');
  const [newWholesalePriceStr, setNewWholesalePriceStr] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Search products when query changes (debounced 300ms)
  useEffect(() => {
    if (!searchQuery.trim() || selectedProduct) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productService.getProducts({ search: searchQuery.trim(), limit: 8 });
        setSearchResults(res.products);
      } catch (err) {
        console.error('Failed to search products', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedProduct]);

  // When a product is selected
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setSearchResults([]);

    // Default to base unit
    setSelectedUnitName(product.baseUnitName || 'কেজি');
    setConversionFactor(1);
    setIsCustomUnit(false);

    // Populate current selling prices as default placeholders
    setNewRetailPriceStr(product.retailPrice ? String(product.retailPrice) : '');
    setNewWholesalePriceStr(product.wholesalePrice ? String(product.wholesalePrice) : '');

    setValidationError(null);
  };

  const handleResetProduct = () => {
    setSelectedProduct(null);
    setSearchQuery('');
    setSearchResults([]);
    setQuantityStr('');
    setUnitCostStr('');
    setNewRetailPriceStr('');
    setNewWholesalePriceStr('');
    setIsCustomUnit(false);
    setSaveUnitForFuture(false);
    setValidationError(null);
  };

  const handleUnitChange = (val: string) => {
    if (val === '__CUSTOM__') {
      setIsCustomUnit(true);
      setSelectedUnitName('');
      setConversionFactor(1);
    } else {
      setIsCustomUnit(false);
      setSelectedUnitName(val);
      if (val === selectedProduct?.baseUnitName) {
        setConversionFactor(1);
      } else {
        const found = selectedProduct?.units?.find((u) => u.unitName === val);
        if (found) {
          setConversionFactor(found.conversionFactor);
        }
      }
    }
  };

  const quantity = Number(quantityStr) || 0;
  const unitCost = Number(unitCostStr) || 0;
  const factor = Number(conversionFactor) || 1;
  const costPerBaseUnit = factor > 0 ? unitCost / factor : 0;
  const lineSubTotal = quantity * unitCost;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setValidationError('অনুগ্রহ করে একটি পণ্য সিলেক্ট করুন');
      return;
    }
    if (!selectedUnitName.trim()) {
      setValidationError('বস্তা বা ইউনিটের নাম উল্লেখ করুন');
      return;
    }
    if (factor <= 0) {
      setValidationError('কনভার্শন ফ্যাক্টর ০-এর বেশি হতে হবে');
      return;
    }
    if (quantity <= 0) {
      setValidationError('পরিমাণ প্রদান করুন');
      return;
    }
    if (unitCost <= 0) {
      setValidationError('কেনা দর প্রদান করুন');
      return;
    }

    addItem({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      baseUnitName: selectedProduct.baseUnitName,
      unitName: selectedUnitName.trim(),
      conversionFactor: factor,
      quantity,
      unitCost,
      newRetailPrice: newRetailPriceStr ? Number(newRetailPriceStr) : undefined,
      newWholesalePrice: newWholesalePriceStr ? Number(newWholesalePriceStr) : undefined,
      saveUnitForFuture: isCustomUnit && saveUnitForFuture,
    });

    // Reset item input but keep supplier
    handleResetProduct();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Package size={16} weight="bold" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-ink-primary">
              চালানের পণ্য, বস্তা/কার্টন সাইজ ও কেনা দর এন্ট্রি
            </h3>
            <p className="text-[11px] text-ink-muted">
              বস্তা বা কার্টনের আকার পরিবর্তন হলে অন-দ্য-ফ্লাই ফ্যাক্টর দিন
            </p>
          </div>
        </div>
        {selectedProduct && (
          <button
            type="button"
            onClick={handleResetProduct}
            className="text-xs text-slate-500 hover:text-red-600 underline font-medium"
          >
            পণ্য পরিবর্তন করুন
          </button>
        )}
      </div>

      <form onSubmit={handleAddItem} className="space-y-3.5">
        {validationError && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {validationError}
          </div>
        )}

        {/* ১. পণ্য সার্চ বার */}
        <div className="relative">
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            পণ্য নির্বাচন করুন (বারকোড বা নাম দিয়ে খুঁজুন) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedProduct) setSelectedProduct(null);
              }}
              placeholder="যেমন: এলাচ এলজি / দারুচিনি / জিরা / সয়াবিন তেল..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-ink-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* সার্চ ড্রপডাউন রেজাল্ট */}
          {searchResults.length > 0 && !selectedProduct && (
            <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className="p-2.5 hover:bg-emerald-50/70 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-semibold text-ink-primary">{p.name}</span>
                    <span className="text-slate-400 ml-2">বেস: {p.baseUnitName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-700 font-medium">
                      বর্তমান কেনা: ৳{p.currentPurchasePrice}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* নির্বাচিত পণ্যের বিবরণ ও ইউনিট কনফিগারেশন */}
        {selectedProduct && (
          <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-3">
            {/* রো ১: ইউনিট সিলেক্টর ও কনভার্শন ফ্যাক্টর */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* ইউনিট বা কার্টন ড্রপডাউন */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  চালানের ইউনিট / বস্তার ধরন
                </label>
                <select
                  value={isCustomUnit ? '__CUSTOM__' : selectedUnitName}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-ink-primary focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value={selectedProduct.baseUnitName}>
                    বেস ইউনিট ({selectedProduct.baseUnitName} - ফ্যাক্টর: ১)
                  </option>
                  {selectedProduct.units?.map((u) => (
                    <option key={u.id} value={u.unitName}>
                      {u.unitName} (ফ্যাক্টর: {u.conversionFactor} {selectedProduct.baseUnitName})
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ নতুন কাস্টম বস্তা / কার্টন দিন...</option>
                </select>
              </div>

              {/* কাস্টম ইউনিটের নাম (যদি কাস্টম অন থাকে) */}
              {isCustomUnit && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    নতুন ইউনিটের নাম
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedUnitName}
                    onChange={(e) => setSelectedUnitName(e.target.value)}
                    placeholder="যেমন: ৪০ কেজি বস্তা / ১২ প্যাকেট কার্টন"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}

              {/* কনভার্শন ফ্যাক্টর (১ বস্তায় বা কার্টনে কত বেস ইউনিট) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  প্রতি ইউনিটে পরিমাণ ({selectedProduct.baseUnitName})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  disabled={!isCustomUnit && selectedUnitName === selectedProduct.baseUnitName}
                  value={conversionFactor}
                  onChange={(e) => setConversionFactor(Number(e.target.value))}
                  placeholder="যেমন: ৫০"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-ink-primary focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* কাস্টম ইউনিট সেভ করার অপশন */}
            {isCustomUnit && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={saveUnitForFuture}
                  onChange={(e) => setSaveUnitForFuture(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600"
                />
                <span>ভবিষ্যতের বিক্রির জন্য এই নতুন ইউনিটটি পণ্যের তালিকায় স্থায়ীভাবে সংরক্ষণ করুন</span>
              </label>
            )}

            {/* রো ২: পরিমাণ ও চালান কেনা দর */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-200/60">
              {/* পরিমাণ (সংখ্যা) */}
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  চালানের পরিমাণ (বস্তা / কার্টন / সংখ্যা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={quantityStr}
                  onChange={(e) => setQuantityStr(e.target.value)}
                  placeholder="যেমন: ৫"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold text-ink-primary focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                {quantity > 0 && factor > 1 && (
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    মোট ওজন: <strong>{quantity * factor} {selectedProduct.baseUnitName}</strong>
                  </span>
                )}
              </div>

              {/* প্রতি ইউনিটের কেনা দর */}
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  প্রতি ইউনিটের কেনা দর (টাকা) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={unitCostStr}
                    onChange={(e) => setUnitCostStr(e.target.value)}
                    placeholder="যেমন: ১২০০০"
                    className="w-full pl-6 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                {costPerBaseUnit > 0 && factor > 1 && (
                  <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                    কেনা দর: <strong>৳{costPerBaseUnit.toFixed(2)}</strong>/{selectedProduct.baseUnitName}
                  </span>
                )}
              </div>

              {/* মোট বিল ও যোগ বাটন */}
              <div className="flex flex-col justify-end">
                <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
                  <span>আইটেম মোট:</span>
                  <span className="font-bold font-mono text-ink-primary text-sm">
                    {formatCurrency(lineSubTotal)}
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-98"
                >
                  <Plus size={16} weight="bold" />
                  <span>চালানে যোগ করুন</span>
                </button>
              </div>
            </div>

            {/* রো ৩: রিপ্লেসমেন্ট কস্ট অনুযায়ী বিক্রয় মূল্য আপডেট (ঐচ্ছিক) */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Tag size={13} weight="bold" />
                <span>নতুন বিক্রয় দর আপডেট (ঐচ্ছিক):</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={newRetailPriceStr}
                  onChange={(e) => setNewRetailPriceStr(e.target.value)}
                  placeholder="নতুন খুচরা দর"
                  className="w-28 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-ink-primary"
                  title="নতুন খুচরা বিক্রয় মূল্য প্রতি বেস ইউনিট"
                />
                <input
                  type="number"
                  step="any"
                  value={newWholesalePriceStr}
                  onChange={(e) => setNewWholesalePriceStr(e.target.value)}
                  placeholder="নতুন পাইকারি দর"
                  className="w-28 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-ink-primary"
                  title="নতুন পাইকারি বিক্রয় মূল্য প্রতি বেস ইউনিট"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
