'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Minus,
  Lightning,
  Scales,
  CheckCircle,
  Package,
} from '@phosphor-icons/react';
import { Product, ProductVariant, ProductUnit } from '@/features/product/product.types';
import { SaleType } from '../pos.types';
import { formatCurrency, formatNumber, formatWeight } from '@/lib/decimal';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

interface PosQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  saleType: SaleType;
  onAddStandardItem: (product: Product, variant?: ProductVariant, unit?: ProductUnit, quantity?: number) => void;
  onAddReversePriceItem: (product: Product, customTotalPrice: number, variant?: ProductVariant) => void;
}

const KG_WEIGHT_PRESETS = [
  { label: '২৫০ গ্রাম', val: 0.25 },
  { label: '৫০০ গ্রাম', val: 0.5 },
  { label: '৭৫০ গ্রাম', val: 0.75 },
  { label: '১ কেজি', val: 1.0 },
  { label: '২ কেজি', val: 2.0 },
  { label: '৫ কেজি', val: 5.0 },
];

const PCS_PRESETS = [
  { label: '১টি', val: 1 },
  { label: '২টি', val: 2 },
  { label: '৪টি', val: 4 },
  { label: '৬টি', val: 6 },
  { label: '১২টি (১ ডজন)', val: 12 },
  { label: '২৪টি', val: 24 },
];

const MONEY_PRESETS = [20, 50, 100, 200, 500];

export function PosQuickAddModal({
  isOpen,
  onClose,
  product,
  saleType,
  onAddStandardItem,
  onAddReversePriceItem,
}: PosQuickAddModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedUnitName, setSelectedUnitName] = useState<string>('');
  const [mode, setMode] = useState<'weight' | 'amount'>('weight');
  const [quantity, setQuantity] = useState<string>('1');
  const [customAmount, setCustomAmount] = useState<string>('50');

  const { titleId, dialogProps, backdropProps } = useDialogAccessibility<HTMLFormElement>(
    isOpen && Boolean(product),
    onClose
  );

  useEffect(() => {
    if (product) {
      const defaultVariant = product.variants?.[0];
      setSelectedVariantId(defaultVariant?.id || '');
      setSelectedUnitName(defaultVariant?.baseUnitName || product.baseUnitName || 'কেজি');
      setMode('weight');
      setQuantity('1');
      setCustomAmount('50');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const variants = product.variants || [];
  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const hasVariants = variants.length > 1;

  const baseUnitName = activeVariant?.baseUnitName || product.baseUnitName || 'কেজি';
  const isDecimalAllowed = activeVariant ? activeVariant.allowDecimalQty : true;
  const activeStock = activeVariant ? activeVariant.stockQuantity : product.stockQuantity;

  // Active Packaging Units (e.g. বস্তা, কার্টন, পাল্লা)
  const availableUnits = activeVariant?.units || [];
  const selectedUnit = availableUnits.find((u) => u.unitName === selectedUnitName);

  // Active Price based on SaleType and unit conversion factor
  const baseRetail = activeVariant?.retailPrice ?? product.retailPrice;
  const baseWholesale = activeVariant?.wholesalePrice ?? product.wholesalePrice;
  const unitFactor = selectedUnit ? selectedUnit.conversionFactor : 1;

  const activeRate = saleType === 'RETAIL'
    ? (selectedUnit?.retailPrice ?? parseFloat((baseRetail * unitFactor).toFixed(2)))
    : (selectedUnit?.wholesalePrice ?? parseFloat((baseWholesale * unitFactor).toFixed(2)));

  const parsedQty = parseFloat(quantity) || 0;
  const parsedAmt = parseFloat(customAmount) || 0;

  // Calculated values
  const liveSubtotal = mode === 'weight'
    ? parseFloat((parsedQty * activeRate).toFixed(2))
    : parsedAmt;

  const calculatedReverseQty = activeRate > 0 && mode === 'amount'
    ? parsedAmt / activeRate
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'amount') {
      if (parsedAmt > 0) {
        onAddReversePriceItem(product, parsedAmt, activeVariant);
        onClose();
      }
    } else {
      if (parsedQty > 0) {
        onAddStandardItem(product, activeVariant, selectedUnit, parsedQty);
        onClose();
      }
    }
  };

  const handleStepQty = (delta: number) => {
    const next = Math.max(isDecimalAllowed ? 0.05 : 1, parseFloat((parsedQty + delta).toFixed(4)));
    setQuantity(String(next));
  };

  return (
    <AnimatePresence>
      <div
        {...backdropProps}
        className="fixed inset-0 z-50 modal-backdrop-frosted flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.form
          {...dialogProps}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 6 }}
          transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
          onSubmit={handleSubmit}
          className="bg-surface-card rounded-2xl max-w-md w-full border border-border-default shadow-2xl p-5 sm:p-6 space-y-4 relative my-auto focus:outline-hidden"
        >
          {/* 1. Header: Product Details */}
          <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-3.5">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-brand-soft border border-brand-light/70 text-brand-deep flex items-center justify-center shrink-0">
                <Package size={24} weight="duotone" />
              </div>
              <div className="min-w-0">
                <h3 id={titleId} className="font-bold text-base sm:text-lg text-ink-primary leading-tight truncate">
                  {product.banglaName || product.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {product.banglaName && product.name && (
                    <span className="text-2xs text-ink-secondary truncate">
                      {product.name}
                    </span>
                  )}
                  <span className="text-2xs font-mono font-bold text-ink-secondary bg-surface-subtle px-1.5 py-0.5 rounded border border-border-subtle">
                    মজুত: {formatWeight(activeStock, baseUnitName)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* 2. Mode Switcher (If Decimal / Loose Selling Allowed) */}
          {isDecimalAllowed && (
            <div className="flex bg-surface-subtle p-1 rounded-xl border border-border-default">
              <button
                type="button"
                onClick={() => setMode('weight')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'weight'
                    ? 'bg-brand-deep text-white shadow-2xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <Scales size={15} weight="bold" />
                <span>ওজন ও পরিমাণ মোড</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('amount')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'amount'
                    ? 'bg-wholesale-solid text-white shadow-2xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <Lightning size={15} weight="fill" />
                <span>টাকার অংকে বিক্রি</span>
              </button>
            </div>
          )}

          {/* 3. Multi-Variant Selector (If product has variants) */}
          {hasVariants && (
            <div>
              <label className="block text-xs font-bold text-ink-secondary mb-1.5">
                সাইজ / ভ্যারিয়েন্ট বেছে নিন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {variants.map((v) => {
                  const isSelected = activeVariant?.id === v.id;
                  const vPrice = saleType === 'RETAIL' ? v.retailPrice : v.wholesalePrice;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setSelectedUnitName(v.baseUnitName);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-soft border-brand-deep text-brand-deep shadow-2xs font-bold'
                          : 'bg-surface-card hover:bg-surface-subtle border-border-default text-ink-body'
                      }`}
                    >
                      <div className="text-xs truncate">{v.variantName}</div>
                      <div className="font-mono text-2xs font-bold text-ink-primary mt-0.5">
                        {formatCurrency(vPrice, false)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Packaging Units Selector (e.g. বস্তা, কার্টন, পাল্লা) */}
          {availableUnits.length > 0 && mode === 'weight' && (
            <div>
              <label className="block text-xs font-bold text-ink-secondary mb-1.5">
                প্যাকেজিং একক:
              </label>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedUnitName(baseUnitName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selectedUnitName === baseUnitName
                      ? 'bg-brand-deep text-white border-brand-deep shadow-2xs'
                      : 'bg-surface-subtle text-ink-body border-border-default hover:bg-brand-soft'
                  }`}
                >
                  মূল একক ({baseUnitName})
                </button>
                {availableUnits.map((u) => {
                  const isUnitSelected = selectedUnitName === u.unitName;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUnitName(u.unitName)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isUnitSelected
                          ? 'bg-brand-deep text-white border-brand-deep shadow-2xs'
                          : 'bg-surface-subtle text-ink-body border-border-default hover:bg-brand-soft'
                      }`}
                    >
                      {u.unitName} ({formatNumber(u.conversionFactor)} {baseUnitName})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Main Input Section */}
          {mode === 'weight' ? (
            /* Weight / Quantity Mode */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="pos-quick-qty-input" className="text-xs font-bold text-ink-body">
                  পরিমাণ লিখুন ({selectedUnitName || baseUnitName}):
                </label>
                <span className="text-2xs font-mono font-bold text-ink-secondary">
                  দর: {formatCurrency(activeRate, false)}/{selectedUnitName || baseUnitName}
                </span>
              </div>

              {/* Large Input with Steppers */}
              <div className="flex items-center border-2 border-brand-deep rounded-xl overflow-hidden bg-surface-card shadow-xs">
                <button
                  type="button"
                  onClick={() => handleStepQty(isDecimalAllowed ? -0.25 : -1)}
                  className="w-12 h-12 flex items-center justify-center text-ink-primary hover:bg-surface-subtle active:bg-border-default transition-colors border-r border-border-default text-lg cursor-pointer"
                  title="কমান"
                >
                  <Minus size={18} weight="bold" />
                </button>
                <input
                  id="pos-quick-qty-input"
                  type="number"
                  step={isDecimalAllowed ? 'any' : '1'}
                  min={isDecimalAllowed ? '0.01' : '1'}
                  autoFocus
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="flex-1 h-12 text-center text-xl sm:text-2xl font-black font-mono tabular-nums text-ink-primary focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleStepQty(isDecimalAllowed ? 0.25 : 1)}
                  className="w-12 h-12 flex items-center justify-center text-ink-primary hover:bg-surface-subtle active:bg-border-default transition-colors border-l border-border-default text-lg cursor-pointer"
                  title="বাড়ান"
                >
                  <Plus size={18} weight="bold" />
                </button>
              </div>

              {/* Fast Weight Presets */}
              <div className="flex gap-1.5 flex-wrap">
                {(baseUnitName === 'কেজি' ? KG_WEIGHT_PRESETS : PCS_PRESETS).map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setQuantity(String(preset.val))}
                    className={`flex-1 min-w-[70px] py-1.5 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${
                      Math.abs(parsedQty - preset.val) < 0.0001
                        ? 'bg-brand-deep text-white border-brand-deep shadow-2xs'
                        : 'bg-surface-subtle hover:bg-brand-soft hover:text-brand-deep text-ink-body border-border-default'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Amount / Taka Mode ("৫০ টাকার জিরা") */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="pos-quick-amount-input" className="text-xs font-bold text-ink-body">
                  কাস্টমার কত টাকার নিতে চান?
                </label>
                <span className="text-2xs font-mono font-bold text-ink-secondary">
                  রেট: {formatCurrency(activeRate, false)}/{baseUnitName}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-ink-secondary font-mono">
                  ৳
                </span>
                <input
                  id="pos-quick-amount-input"
                  type="number"
                  min="1"
                  step="any"
                  autoFocus
                  required
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full h-12 pl-8 pr-3 rounded-xl border-2 border-wholesale-solid bg-surface-card text-xl sm:text-2xl font-black font-mono tabular-nums text-ink-primary focus:outline-hidden"
                />
              </div>

              {/* Fast Money Presets */}
              <div className="flex gap-1.5">
                {MONEY_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomAmount(String(amt))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${
                      parsedAmt === amt
                        ? 'bg-wholesale-solid text-white border-wholesale-solid shadow-2xs'
                        : 'bg-surface-subtle hover:bg-brand-soft text-ink-body border-border-default'
                    }`}
                  >
                    {formatNumber(amt)}৳
                  </button>
                ))}
              </div>

              {/* Live Quantity Feedback */}
              {parsedAmt > 0 && (
                <div className="p-3 bg-wholesale-bg/70 border border-wholesale-border/70 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-wholesale-text font-semibold">হিসাবকৃত ওজন:</span>
                  <span className="font-bold font-mono text-sm text-wholesale-text">
                    {baseUnitName === 'কেজি' && calculatedReverseQty < 1
                      ? `${formatNumber(calculatedReverseQty * 1000, { minDecimals: 0, maxDecimals: 1 })} গ্রাম`
                      : `${formatNumber(calculatedReverseQty, { minDecimals: 2, maxDecimals: 4 })} ${baseUnitName}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 6. Live Subtotal Preview Banner */}
          <div className="p-3 bg-surface-subtle/80 rounded-xl border border-border-subtle flex items-center justify-between">
            <span className="text-xs font-bold text-ink-secondary">মোট প্রদেয় মূল্য:</span>
            <span className="text-lg sm:text-xl font-black font-mono tabular-nums text-brand-deep">
              {formatCurrency(liveSubtotal, false)}
            </span>
          </div>

          {/* 7. Action Footer */}
          <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border-strong hover:bg-surface-subtle text-xs font-bold text-ink-body transition-colors cursor-pointer"
            >
              বাতিল (Esc)
            </button>

            <button
              type="submit"
              disabled={mode === 'weight' ? parsedQty <= 0 : parsedAmt <= 0}
              className="flex-1 py-2.5 rounded-xl bg-brand-deep hover:bg-brand-hover text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              <CheckCircle size={18} weight="bold" />
              <span>কার্টে যোগ করুন (Enter)</span>
            </button>
          </div>
        </motion.form>
      </div>
    </AnimatePresence>
  );
}
