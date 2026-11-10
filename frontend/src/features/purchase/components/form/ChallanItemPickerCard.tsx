'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlass,
  Plus,
  Package,
  Barcode,
  Coins,
  CheckCircle,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { productService } from '@/features/product/product.service';
import { Product, ProductVariant } from '@/features/product/product.types';
import { formatCurrency } from '@/lib/decimal';
import { usePurchaseStore } from '../../usePurchaseStore';
import { PurchaseItemDTO } from '../../purchase.types';

export function ChallanItemPickerCard() {
  const { addItem } = usePurchaseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Unit & Factor State
  const [selectedUnitName, setSelectedUnitName] = useState('কেজি');
  const [conversionFactor, setConversionFactor] = useState(1);
  const [baseUnitName, setBaseUnitName] = useState('কেজি');

  // Quantity & Rate
  const [quantityStr, setQuantityStr] = useState('');
  const [unitCostStr, setUnitCostStr] = useState('');

  // Future Selling Price updates
  const [newRetailPriceStr, setNewRetailPriceStr] = useState('');
  const [newWholesalePriceStr, setNewWholesalePriceStr] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced product search
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
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedProduct]);

  // When a product is selected
  const handleSelectProduct = (product: Product, variant?: ProductVariant) => {
    setSelectedProduct(product);
    const targetVariant = variant || product.variants[0];
    setSelectedVariant(targetVariant || null);

    setSearchQuery(
      variant ? `${product.name} (${variant.variantName})` : product.name
    );
    setSearchResults([]);

    const baseUnit = targetVariant?.baseUnitName || product.baseUnitName || 'কেজি';
    setBaseUnitName(baseUnit);
    setSelectedUnitName(baseUnit);
    setConversionFactor(1);

    // Current prices as placeholder
    setNewRetailPriceStr(targetVariant?.retailPrice ? String(targetVariant.retailPrice) : '');
    setNewWholesalePriceStr(targetVariant?.wholesalePrice ? String(targetVariant.wholesalePrice) : '');
    setUnitCostStr(targetVariant?.currentPurchasePrice ? String(targetVariant.currentPurchasePrice) : '');

    setValidationError(null);
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setSelectedVariant(null);
    setSearchQuery('');
    setSearchResults([]);
    setQuantityStr('');
    setUnitCostStr('');
    setNewRetailPriceStr('');
    setNewWholesalePriceStr('');
    setValidationError(null);
    searchInputRef.current?.focus();
  };

  const handleAdd = () => {
    if (!selectedProduct) {
      setValidationError('অনুগ্রহ করে আগে একটি পণ্য নির্বাচন করুন');
      return;
    }

    const qty = parseFloat(quantityStr);
    const cost = parseFloat(unitCostStr);

    if (isNaN(qty) || qty <= 0) {
      setValidationError('পরিমাণ অবশ্যই ০ এর বেশি হতে হবে');
      return;
    }

    if (isNaN(cost) || cost <= 0) {
      setValidationError('ক্রয়দর (কেনা রেট) অবশ্যই ০ এর বেশি হতে হবে');
      return;
    }

    const targetVariant = selectedVariant || selectedProduct.variants[0];

    const newItem: PurchaseItemDTO = {
      productId: selectedProduct.id,
      variantId: targetVariant?.id || undefined,
      productName: targetVariant
        ? `${selectedProduct.name} (${targetVariant.variantName})`
        : selectedProduct.name,
      unitName: selectedUnitName.trim() || baseUnitName,
      conversionFactor: Number(conversionFactor) || 1,
      quantity: qty,
      unitCost: cost,
      baseUnitName: baseUnitName,
      newRetailPrice: newRetailPriceStr ? parseFloat(newRetailPriceStr) : undefined,
      newWholesalePrice: newWholesalePriceStr ? parseFloat(newWholesalePriceStr) : undefined,
    };

    addItem(newItem);
    handleReset();
  };

  const qty = parseFloat(quantityStr) || 0;
  const cost = parseFloat(unitCostStr) || 0;
  const lineTotal = qty * cost;
  const totalBaseWeight = qty * conversionFactor;

  // Available units for the selected variant/product
  const availableUnits = selectedVariant?.units || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-indigo-50 text-indigo-600">
            <Package size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            ২. চালানে পণ্য যোগ করুন (Item Entry Bar)
          </h2>
        </div>
        {selectedProduct && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <X size={12} weight="bold" />
            <span>আইটেম মুছুন</span>
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {validationError && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium animate-in fade-in duration-100">
            <WarningCircle size={14} weight="bold" className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* সার্চ বার */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            পণ্য খুঁজুন (নাম, SKU বা বারকোড স্ক্যান) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400">
              <MagnifyingGlass size={16} weight="bold" />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedProduct) setSelectedProduct(null);
              }}
              placeholder="পণ্য বা তেলের নাম লিখুন অথবা স্ক্যানার দিয়ে বারকোড স্ক্যান করুন..."
              className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm text-slate-900 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleReset}
                className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </div>

          {/* ড্রপডাউন সার্চ রেজাল্ট */}
          {searchResults.length > 0 && !selectedProduct && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-64 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              {searchResults.map((product) => {
                if (product.hasVariants && product.variants.length > 1) {
                  return product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectProduct(product, v)}
                      className="w-full p-2.5 text-left text-xs hover:bg-indigo-50/40 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{product.name}</span>
                        <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {v.variantName}
                        </span>
                        {v.sku && <span className="ml-2 font-mono text-[10px] text-slate-400">{v.sku}</span>}
                      </div>
                      <div className="text-right font-mono text-[11px] text-slate-600">
                        বর্তমান কেনা: ৳{v.currentPurchasePrice}
                      </div>
                    </button>
                  ));
                }

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full p-2.5 text-left text-xs hover:bg-indigo-50/40 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{product.name}</span>
                      {product.banglaName && (
                        <span className="ml-2 text-slate-500 font-normal">({product.banglaName})</span>
                      )}
                    </div>
                    <div className="text-right font-mono text-[11px] text-slate-600">
                      বর্তমান কেনা: ৳{product.variants[0]?.currentPurchasePrice || 0}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* নির্বাচিত পণ্যের ইনপুট ম্যাট্রিক্স */}
        {selectedProduct && (
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 space-y-3.5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* ১. ইউনিট সিলেক্টর */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  প্যাকেজিং / ক্রয় একক
                </label>
                <select
                  value={selectedUnitName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedUnitName(val);
                    if (val === baseUnitName) {
                      setConversionFactor(1);
                    } else {
                      const matched = availableUnits.find((u) => u.unitName === val);
                      if (matched) {
                        setConversionFactor(matched.conversionFactor);
                      }
                    }
                  }}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value={baseUnitName}>{baseUnitName} (মূল একক)</option>
                  {availableUnits.map((u) => (
                    <option key={u.id} value={u.unitName}>
                      {u.unitName} (১ {u.unitName} = {u.conversionFactor} {baseUnitName})
                    </option>
                  ))}
                </select>
              </div>

              {/* ২. পরিমাণ */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  চালান পরিমাণ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={quantityStr}
                    onChange={(e) => setQuantityStr(e.target.value)}
                    placeholder="উদাঃ ৫০"
                    className="w-full pl-3 pr-12 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs sm:text-sm font-bold text-slate-900"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] text-slate-400 pointer-events-none">
                    {selectedUnitName}
                  </span>
                </div>
                {conversionFactor > 1 && qty > 0 && (
                  <p className="text-[10px] text-indigo-700 mt-0.5 font-mono">
                    মোট = {totalBaseWeight} {baseUnitName}
                  </p>
                )}
              </div>

              {/* ৩. একক কেনা দর */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  প্রতি {selectedUnitName}-এর কেনা দর ৳ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs select-none">৳</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={unitCostStr}
                    onChange={(e) => setUnitCostStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs sm:text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* ৪. লাইন মোট টাকা */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  আইটেমের মোট টাকা
                </label>
                <div className="h-9 px-3 rounded-lg bg-slate-100/90 border border-slate-200/90 flex items-center justify-end font-mono text-sm font-bold text-slate-900">
                  {formatCurrency(lineTotal)}
                </div>
              </div>
            </div>

            {/* নতুন বিক্রয়দর আপডেট (ঐচ্ছিক) ও সাবমিট বাটন */}
            <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 select-none">
                  নতুন বিক্রয়দর আপডেট (ঐচ্ছিক):
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="খুচরা দর ৳"
                  value={newRetailPriceStr}
                  onChange={(e) => setNewRetailPriceStr(e.target.value)}
                  className="w-24 px-2 py-1 rounded border border-slate-300 font-mono text-xs bg-white"
                  title="নতুন খুচরা বিক্রয়দর"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="পাইকারি দর ৳"
                  value={newWholesalePriceStr}
                  onChange={(e) => setNewWholesalePriceStr(e.target.value)}
                  className="w-24 px-2 py-1 rounded border border-slate-300 font-mono text-xs bg-white"
                  title="নতুন পাইকারি বিক্রয়দর"
                />
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                <span>+ চালানে যুক্ত করুন</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
