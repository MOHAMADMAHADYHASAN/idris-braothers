'use client';

import React, { useState, useId } from 'react';
import { X, SlidersHorizontal, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

export function SupplierAdjustmentModal() {
  const { activeModal, selectedSupplier, closeModal, submitAdjustment } =
    useSupplierKhataStore();

  const [adjustmentType, setAdjustmentType] = useState<'REBATE' | 'ADD_DEBT'>('REBATE');
  const [amountStr, setAmountStr] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(
    Boolean(activeModal === 'adjustment' && selectedSupplier),
    closeModal
  );

  if (activeModal !== 'adjustment' || !selectedSupplier) return null;

  const currentPayable = selectedSupplier.currentPayable;
  const inputAmount = Number(amountStr) || 0;
  const newPayable =
    adjustmentType === 'REBATE'
      ? currentPayable - inputAmount
      : currentPayable + inputAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAmount <= 0) {
      setError('টাকার পরিমাণ ০-এর বেশি হতে হবে');
      return;
    }
    if (!reason.trim()) {
      setError('সমন্বয় বা ছাড়ের সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // If REBATE, pass negative amount (reduces debt); if ADD_DEBT, pass positive
      const deltaAmount = adjustmentType === 'REBATE' ? -inputAmount : inputAmount;

      await submitAdjustment(selectedSupplier.id, {
        amount: deltaAmount,
        reason: reason.trim(),
      });

      closeModal();
    } catch (err: any) {
      setError(err.message || 'হিসাব সমন্বয় করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div {...backdropProps} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50">
      <motion.div
        {...dialogProps}
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-surface-card w-full max-w-md rounded-lg shadow-xl border border-border-default overflow-hidden focus:outline-hidden"
      >
        {/* হেডার */}
        <div className="px-4 py-3 border-b border-border-default flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
              <SlidersHorizontal size={16} weight="bold" />
            </div>
            <div>
              <h3 id={titleId} className="font-bold text-ink-primary text-xs sm:text-sm">
                শুকতি ও কমিশন সমন্বয়
              </h3>
              <p className="text-xs text-ink-secondary">
                মহাজন: {selectedSupplier.companyName || selectedSupplier.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-border-default transition-[background-color,color] duration-150 cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-md bg-due-bg border border-due-border text-due-text text-xs flex items-center gap-2">
                <WarningCircle size={15} weight="bold" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* বর্তমান দেনা ও নতুন সম্ভাব্য দেনা */}
            <div className="bg-surface-subtle p-3 rounded-lg border border-border-default grid grid-cols-2 gap-2 text-center">
              <div className="border-r border-border-default pr-2">
                <span className="text-xs text-ink-secondary font-medium block">বর্তমান দেনা</span>
                <span className="text-sm sm:text-base font-bold font-mono text-wholesale-text tabular-nums tracking-tight">
                  {formatCurrency(currentPayable)}
                </span>
              </div>
              <div className="pl-2">
                <span className="text-xs text-ink-secondary font-medium block">সমন্বয়ের পর দেনা</span>
                <span className="text-sm sm:text-base font-bold font-mono text-brand-deep tabular-nums tracking-tight">
                  {formatCurrency(newPayable)}
                </span>
              </div>
            </div>

            {/* সমন্বয়ের ধরন (ছাড় বনাম বৃদ্ধি) - Segmented Control */}
            <div>
              <label className="block text-xs font-semibold text-ink-body mb-1.5">
                সমন্বয়ের ধরন নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-surface-subtle p-1 rounded-lg border border-border-default">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('REBATE')}
                  className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-[background-color,color,box-shadow] duration-150 active:scale-[0.98] cursor-pointer ${
                    adjustmentType === 'REBATE'
                      ? 'bg-brand-deep text-white shadow-xs'
                      : 'text-ink-body hover:text-ink-primary'
                  }`}
                >
                  <span>মহাজন থেকে ছাড় (-)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('ADD_DEBT')}
                  className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-[background-color,color,box-shadow] duration-150 active:scale-[0.98] cursor-pointer ${
                    adjustmentType === 'ADD_DEBT'
                      ? 'bg-brand-deep text-white shadow-xs'
                      : 'text-ink-body hover:text-ink-primary'
                  }`}
                >
                  <span>দেনা বৃদ্ধি (+)</span>
                </button>
              </div>
            </div>

            {/* টাকার পরিমাণ */}
            <div>
              <label htmlFor={`${formId}-amount`} className="block text-xs font-semibold text-ink-body mb-1">
                {adjustmentType === 'REBATE' ? 'ছাড়ের পরিমাণ (টাকা)' : 'বৃদ্ধির পরিমাণ (টাকা)'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary font-bold text-sm">
                  ৳
                </span>
                <input
                  id={`${formId}-amount`}
                  type="number"
                  step="any"
                  autoFocus
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="০.০০"
                  className="w-full pl-7 pr-3 py-1.5 bg-surface-card border border-border-strong rounded-md text-base font-bold font-mono tabular-nums text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
                />
              </div>
            </div>

            {/* কারণ / নোট */}
            <div>
              <label htmlFor={`${formId}-reason`} className="block text-xs font-semibold text-ink-body mb-1">
                সমন্বয়ের সুনির্দিষ্ট কারণ <span className="text-red-500">*</span>
              </label>
              <input
                id={`${formId}-reason`}
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="সমন্বয়ের কারণ"
                className="w-full px-3 py-1.5 bg-surface-card border border-border-default rounded-md text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
              />
            </div>
          </div>

          {/* ফুটার */}
          <div className="px-4 py-2.5 bg-surface-subtle border-t border-border-default flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className={buttonClasses({ variant: 'secondary', size: 'sm' })}
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || inputAmount <= 0 || !reason.trim()}
              className={buttonClasses({ variant: 'primary', size: 'sm', className: 'gap-1.5' })}
            >
              <CheckCircle size={15} weight="bold" />
              <span>{isSubmitting ? 'সমন্বয় হচ্ছে...' : 'সমন্বয় নিশ্চিত করুন'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
