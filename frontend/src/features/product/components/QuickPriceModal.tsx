'use client';

import React, { useState, useEffect, useId } from 'react';
import { motion } from 'motion/react';
import { X, FloppyDisk } from '@phosphor-icons/react';
import { ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';
import { formatCurrency, formatPercent } from '@/lib/decimal';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

interface QuickPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
  productName: string;
}

function MarginBadge({ costStr, sellStr, label }: { costStr: string; sellStr: string; label: string }) {
  const cost = parseFloat(costStr);
  const sell = parseFloat(sellStr);
  if (isNaN(cost) || isNaN(sell) || cost <= 0 || sell <= 0) return null;

  const profit = sell - cost;
  const marginPct = (profit / sell) * 100;
  const isLoss = profit < 0;

  return (
    <div className="text-2xs font-mono tabular-nums mt-1 text-ink-secondary">
      {label}:{' '}
      <span
        className={`font-semibold ${
          isLoss
            ? 'text-due-text'
            : profit === 0
            ? 'text-ink-body'
            : 'text-cash-text'
        }`}
      >
        {profit >= 0 ? '+' : ''}
        {formatCurrency(profit)} ({formatPercent(marginPct, 1)})
      </span>
    </div>
  );
}

export function QuickPriceModal({ isOpen, onClose, variant, productName }: QuickPriceModalProps) {
  const { updatePrices, isSaving } = useProductStore();
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [retailPrice, setRetailPrice] = useState<string>('');
  const [wholesalePrice, setWholesalePrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(
    Boolean(isOpen && variant),
    onClose
  );

  useEffect(() => {
    if (variant) {
      setPurchasePrice(variant.currentPurchasePrice.toString());
      setRetailPrice(variant.retailPrice.toString());
      setWholesalePrice(variant.wholesalePrice.toString());
      setError(null);
    }
  }, [variant]);

  if (!isOpen || !variant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pPrice = parseFloat(purchasePrice);
    const rPrice = parseFloat(retailPrice);
    const wPrice = parseFloat(wholesalePrice);

    if (isNaN(pPrice) || pPrice <= 0 || isNaN(rPrice) || rPrice <= 0 || isNaN(wPrice) || wPrice <= 0) {
      setError('সকল মূল্য অবশ্যই ০ এর বেশি হতে হবে');
      return;
    }

    try {
      await updatePrices(variant.id, {
        currentPurchasePrice: pPrice,
        retailPrice: rPrice,
        wholesalePrice: wPrice,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'মূল্য আপডেট করতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div {...backdropProps} className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop-frosted p-4">
      <motion.div
        {...dialogProps}
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-surface-card rounded-xl shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1)] border border-border-default max-w-md w-full overflow-hidden focus:outline-hidden"
      >
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-subtle/70">
          <div>
            <h3 id={titleId} className="text-sm font-bold text-ink-primary leading-tight">বাজারদর ও বিক্রয়মূল্য পরিবর্তন</h3>
            <p className="text-xs text-ink-secondary truncate max-w-[280px] mt-0.5">
              {productName} {variant.variantName !== 'Default' ? `(${variant.variantName})` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2.5 text-xs text-due-text bg-due-bg border border-due-border rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor={`${formId}-purchase`} className="block text-xs font-semibold text-ink-body mb-1">
              বর্তমান ক্রয়মূল্য / {variant.baseUnitName} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-ink-secondary text-xs font-semibold">৳</span>
              <input
                id={`${formId}-purchase`}
                type="number"
                step="0.01"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-xs font-mono tabular-nums font-semibold text-ink-primary border border-border-strong rounded-lg bg-surface-card focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${formId}-retail`} className="block text-xs font-semibold text-ink-body mb-1">
                খুচরা দর / {variant.baseUnitName} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-ink-secondary text-xs font-semibold">৳</span>
                <input
                  id={`${formId}-retail`}
                  type="number"
                  step="0.01"
                  required
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs font-mono tabular-nums font-semibold text-ink-primary border border-border-strong rounded-lg bg-surface-card focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
                />
              </div>
              <MarginBadge costStr={purchasePrice} sellStr={retailPrice} label="খুচরা মার্জিন" />
            </div>

            <div>
              <label htmlFor={`${formId}-wholesale`} className="block text-xs font-semibold text-ink-body mb-1">
                পাইকারি দর / {variant.baseUnitName} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-ink-secondary text-xs font-semibold">৳</span>
                <input
                  id={`${formId}-wholesale`}
                  type="number"
                  step="0.01"
                  required
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs font-mono tabular-nums font-semibold text-ink-primary border border-border-strong rounded-lg bg-surface-card focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
                />
              </div>
              <MarginBadge costStr={purchasePrice} sellStr={wholesalePrice} label="পাইকারি মার্জিন" />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-2 text-xs font-semibold text-ink-body border border-border-strong hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-deep hover:bg-brand-hover rounded-lg shadow-[0_1px_2px_rgba(30,74,122,0.16)] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <FloppyDisk size={14} weight="bold" />
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'মূল্য সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
