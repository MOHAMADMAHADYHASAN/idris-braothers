'use client';

import React, { useState, useEffect, useId, useRef } from 'react';
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
import { formatCurrency, formatWeight } from '@/lib/decimal';
import { usePurchaseStore } from '../../usePurchaseStore';
import { PurchaseItemDTO } from '../../purchase.types';

export function ChallanItemPickerCard() {
  const { addItem } = usePurchaseStore();
  const baseId = useId();
  const searchInputId = `${baseId}-search`;
  const qtyInputId = `${baseId}-qty`;
  const costInputId = `${baseId}-cost`;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Base unit state (১:১ ক্রয় — কার্টন/বস্তা রূপান্তর ছাড়া)
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

    if (selectedVariant && !selectedVariant.allowDecimalQty && !Number.isInteger(qty)) {
      setValidationError(`${baseUnitName} পণ্যের পরিমাণ অবশ্যই পূর্ণসংখ্যা হতে হবে (যেমন: ১, ১২, ২৪)`);
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
      unitName: baseUnitName,
      conversionFactor: 1,
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

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep">
            <Package size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-ink-primary">
            ২. চালানে পণ্য যোগ করুন
          </h2>
        </div>
        {selectedProduct && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-due-text hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X size={13} weight="bold" />
            <span>আইটেম মুছুন</span>
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {validationError && (
          <div className="p-2.5 rounded-lg bg-due-bg border border-due-border text-due-text text-xs flex items-center gap-2 font-medium animate-in fade-in duration-100">
            <WarningCircle size={14} weight="bold" className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* সার্চ বার */}
        <div className="relative">
          <label htmlFor={searchInputId} className="block text-xs font-semibold text-ink-body mb-1.5">
            পণ্য খুঁজুন (নাম, SKU বা বারকোড স্ক্যান) <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-ink-secondary">
              <MagnifyingGlass size={16} weight="bold" />
            </span>
            <input
              id={searchInputId}
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedProduct) setSelectedProduct(null);
              }}
              placeholder="পণ্য বা বারকোড খুঁজুন..."
              className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs sm:text-sm text-ink-primary font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleReset}
                aria-label="পণ্য নির্বাচন বাতিল করুন"
                className="absolute right-2.5 top-2.5 p-1 text-ink-secondary hover:text-ink-primary rounded cursor-pointer"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </div>

          {/* ড্রপডাউন সার্চ রেজাল্ট */}
          {searchResults.length > 0 && !selectedProduct && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 surface-glass-popover border border-border-default rounded-xl overflow-hidden max-h-64 divide-y divide-border-subtle animate-in fade-in zoom-in-95 duration-100">
              {searchResults.map((product) => {
                if (product.hasVariants && product.variants.length > 1) {
                  return product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectProduct(product, v)}
                      className="w-full p-2.5 text-left text-xs hover:bg-brand-soft/50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-ink-primary">{product.banglaName || product.name}</span>
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold bg-brand-soft text-brand-deep border border-brand-light">
                          {v.variantName}
                        </span>
                        {v.sku && <span className="ml-2 font-mono text-xs text-ink-secondary">{v.sku}</span>}
                      </div>
                      <div className="text-right font-mono text-xs text-ink-secondary">
                        <span>স্টক: {formatWeight(v.stockQuantity, v.baseUnitName)}</span>
                        <span className="mx-1.5">•</span>
                        <span>কেনা: {formatCurrency(v.currentPurchasePrice, false)}</span>
                      </div>
                    </button>
                  ));
                }

                const primaryV = product.variants[0];
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full p-2.5 text-left text-xs hover:bg-brand-soft/50 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-ink-primary">{product.banglaName || product.name}</span>
                      {product.banglaName && (
                        <span className="ml-2 text-ink-secondary font-normal">({product.name})</span>
                      )}
                    </div>
                    <div className="text-right font-mono text-xs text-ink-secondary">
                      <span>স্টক: {formatWeight(primaryV?.stockQuantity || 0, primaryV?.baseUnitName || product.baseUnitName)}</span>
                      <span className="mx-1.5">•</span>
                      <span>কেনা: {formatCurrency(primaryV?.currentPurchasePrice || 0, false)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* নির্বাচিত পণ্যের ইনপুট ম্যাট্রিক্স */}
        {selectedProduct && (
          <div className="p-4 rounded-xl border border-brand-light bg-brand-soft/40 space-y-3.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-brand-light/60">
              <span className="font-semibold text-ink-body">
                একক: <strong className="text-brand-deep">{baseUnitName}</strong>
              </span>
              {selectedVariant && (
                <span className="font-mono font-semibold text-ink-secondary">
                  বর্তমান মজুত: {formatWeight(selectedVariant.stockQuantity, selectedVariant.baseUnitName)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor={qtyInputId} className="block text-xs font-semibold text-ink-body mb-1">
                  চালান পরিমাণ <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    id={qtyInputId}
                    type="number"
                    step={selectedVariant?.allowDecimalQty === false ? '1' : 'any'}
                    min="0"
                    required
                    value={quantityStr}
                    onChange={(e) => setQuantityStr(e.target.value)}
                    placeholder="পরিমাণ"
                    className="w-full pl-3 pr-14 py-2 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm font-bold text-ink-primary"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-ink-secondary pointer-events-none">
                    {baseUnitName}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor={costInputId} className="block text-xs font-semibold text-ink-body mb-1">
                  প্রতি {baseUnitName}-এর কেনা দর ৳ <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-ink-secondary font-bold text-xs select-none">৳</span>
                  <input
                    id={costInputId}
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={unitCostStr}
                    onChange={(e) => setUnitCostStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm font-bold text-ink-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-body mb-1">
                  আইটেমের মোট টাকা
                </label>
                <div className="h-9.5 px-3 rounded-lg bg-surface-card border border-border-default flex items-center justify-end font-mono text-sm font-bold text-ink-primary">
                  {formatCurrency(lineTotal)}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-brand-light/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-ink-body select-none">
                  নতুন বিক্রয়দর আপডেট (ঐচ্ছিক):
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="খুচরা দর ৳"
                  value={newRetailPriceStr}
                  onChange={(e) => setNewRetailPriceStr(e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-md border border-border-strong font-mono text-xs bg-surface-card text-ink-primary"
                  title="নতুন খুচরা বিক্রয়দর"
                  aria-label="নতুন খুচরা বিক্রয়দর"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="পাইকারি দর ৳"
                  value={newWholesalePriceStr}
                  onChange={(e) => setNewWholesalePriceStr(e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-md border border-border-strong font-mono text-xs bg-surface-card text-ink-primary"
                  title="নতুন পাইকারি বিক্রয়দর"
                  aria-label="নতুন পাইকারি বিক্রয়দর"
                />
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="px-4 py-2 rounded-lg bg-brand-deep hover:bg-brand-hover active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                <span>চালানে যুক্ত করুন</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
