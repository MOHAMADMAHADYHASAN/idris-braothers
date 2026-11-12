'use client';

import React, { useState, useId } from 'react';
import { motion } from 'motion/react';
import { X, WarningCircle, ArrowDown } from '@phosphor-icons/react';
import { ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';
import { formatCurrency, formatWeight } from '@/lib/decimal';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

interface RecordWastageModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
  productName: string;
}

export function RecordWastageModal({ isOpen, onClose, variant, productName }: RecordWastageModalProps) {
  const { recordWastage, isSaving } = useProductStore();
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('শুকিয়ে ওজন হ্রাস');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(
    Boolean(isOpen && variant),
    onClose
  );

  if (!isOpen || !variant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('ঘাটতির পরিমাণ অবশ্যই ০ এর বেশি হতে হবে');
      return;
    }
    if (qty > variant.stockQuantity) {
      setError(`ঘাটতির পরিমাণ বর্তমান স্টকের (${formatWeight(variant.stockQuantity, variant.baseUnitName)}) চেয়ে বেশি হতে পারে না`);
      return;
    }

    try {
      await recordWastage(variant.id, {
        quantity: qty,
        reason,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'অপচয় রেকর্ড করতে ব্যর্থ হয়েছে');
    }
  };

  const parsedQty = parseFloat(quantity) || 0;
  const estimatedLoss = parsedQty * variant.currentPurchasePrice;
  const remainingStock = Math.max(0, variant.stockQuantity - parsedQty);

  return (
    <div {...backdropProps} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <motion.div
        {...dialogProps}
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-surface-card rounded-xl shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1)] border border-border-default max-w-md w-full overflow-hidden focus:outline-hidden"
      >
        <div className="px-4 py-3.5 border-b border-border-subtle flex items-center justify-between bg-surface-subtle/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-wholesale-bg border border-wholesale-border/60 text-wholesale-text flex items-center justify-center shrink-0">
              <WarningCircle size={17} weight="bold" />
            </div>
            <div>
              <h3 id={titleId} className="text-sm font-bold text-ink-primary leading-tight">স্টক অপচয় ও ঘাটতি এন্ট্রি</h3>
              <p className="text-xs text-ink-secondary truncate max-w-[240px]">
                {productName} {variant.variantName !== 'Default' ? `(${variant.variantName})` : ''}
              </p>
            </div>
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

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 text-xs text-due-text bg-due-bg border border-due-border rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-surface-subtle p-3 rounded-lg border border-border-default flex items-center justify-between text-xs">
            <span className="text-ink-secondary font-medium">বর্তমান মোট স্টক:</span>
            <span className="font-mono tabular-nums font-bold text-ink-primary">
              {formatWeight(variant.stockQuantity, variant.baseUnitName)}
            </span>
          </div>

          <div>
            <label htmlFor={`${formId}-qty`} className="block text-xs font-semibold text-ink-body mb-1">
              ঘাটতি বা নষ্টের পরিমাণ ({variant.baseUnitName}) *
            </label>
            <input
              id={`${formId}-qty`}
              type="number"
              step={variant.allowDecimalQty ? '0.0001' : '1'}
              required
              placeholder={variant.allowDecimalQty ? '০.২৫০' : '২'}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums font-semibold text-ink-primary border border-border-strong rounded-lg bg-surface-card focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
            />
            {parsedQty > 0 && (
              <div className="mt-2 p-2.5 rounded-lg bg-due-bg border border-due-border flex items-center justify-between text-xs font-mono tabular-nums text-due-text">
                <span className="inline-flex items-center gap-1">
                  <ArrowDown size={13} className="text-danger font-bold" />
                  আর্থিক ক্ষতি: <strong>{formatCurrency(estimatedLoss)}</strong>
                </span>
                <span className="text-ink-body font-normal">
                  অবশিষ্ট: <strong>{formatWeight(remainingStock, variant.baseUnitName)}</strong>
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-reason`} className="block text-xs font-semibold text-ink-body mb-1">
              ঘাটতির কারণ *
            </label>
            <select
              id={`${formId}-reason`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-border-strong rounded-lg bg-surface-card text-ink-primary focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
            >
              <option value="শুকিয়ে ওজন হ্রাস">শুকিয়ে ওজন হ্রাস (গরমের প্রভাব)</option>
              <option value="প্যাকেট ফেটে নষ্ট হওয়া">প্যাকেট ফেটে বা গলে নষ্ট হওয়া</option>
              <option value="ইঁদুরে খাওয়া বা পড়ে যাওয়া">ইঁদুরে খাওয়া বা পড়ে যাওয়া</option>
              <option value="মেয়াদোত্তীর্ণ বা ড্যামেজ">মেয়াদোত্তীর্ণ বা ড্যামেজ মাল</option>
              <option value="অন্যান্য কারণ">অন্যান্য কারণ</option>
            </select>
          </div>

          <div>
            <label htmlFor={`${formId}-note`} className="block text-xs font-semibold text-ink-body mb-1">
              মন্তব্য (ঐচ্ছিক)
            </label>
            <input
              id={`${formId}-note`}
              type="text"
              placeholder="মন্তব্য / রেফারেন্স"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-border-strong rounded-lg bg-surface-card text-ink-primary focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
            />
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-danger hover:bg-danger-hover rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'ঘাটতি রেকর্ড ও স্টক কমান'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
