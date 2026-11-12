'use client';

import React, { useState, useEffect, useId } from 'react';
import { X, PencilSimple, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useCashboxStore } from '../useCashboxStore';
import { ExpenseCategory } from '../cashbox.types';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

export function ExpenseEditModal() {
  const { editingExpense, isEditModalOpen, closeEditModal, updateExpense } =
    useCashboxStore();

  const [category, setCategory] = useState<ExpenseCategory>('OTHER');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(
    Boolean(isEditModalOpen && editingExpense),
    closeEditModal
  );

  useEffect(() => {
    if (editingExpense) {
      setCategory(editingExpense.category);
      setAmountStr(String(editingExpense.amount));
      setDescription(editingExpense.description);
      setNote(editingExpense.note || '');
    }
    setError(null);
  }, [editingExpense]);

  if (!isEditModalOpen || !editingExpense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(amountStr);
    if (!amount || amount <= 0 || !description.trim()) {
      setError('সঠিক টাকার পরিমাণ ও বিবরণ দিন');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateExpense(editingExpense.id, {
        category,
        amount,
        description: description.trim(),
        note: note.trim() || undefined,
      });
      closeEditModal();
    } catch (err: any) {
      setError(err.message || 'খরচ আপডেট করতে সমস্যা হয়েছে');
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
              <PencilSimple size={16} weight="bold" />
            </div>
            <div>
              <h3 id={titleId} className="font-bold text-ink-primary text-sm">খরচের বিবরণ সম্পাদনা</h3>
              <p className="text-xs text-ink-secondary">ভুল তথ্য সংশোধন করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeEditModal}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3">
            {error && (
              <div className="p-2.5 rounded-lg bg-due-bg border border-due-border text-due-text text-xs flex items-center gap-2">
                <WarningCircle size={15} weight="bold" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor={`${formId}-cat`} className="block text-xs font-semibold text-ink-body mb-1">
                খরচের খাত ও ক্যাটাগরি
              </label>
              <select
                id={`${formId}-cat`}
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
              >
                <option value="LABOR_KULI">কুলি ও লেবার খরচ</option>
                <option value="TRANSPORT_VAN">ভ্যান ও ট্রাক ভাড়া</option>
                <option value="TEA_SNACKS">চা-নাস্তা ও আপ্যায়ন</option>
                <option value="ELECTRICITY_UTILITY">বিদ্যুৎ ও ইউটিলিটি</option>
                <option value="SHOP_MAINTENANCE">দোকান সরঞ্জাম</option>
                <option value="OTHER">বিবিধ খরচ</option>
              </select>
            </div>

            <div>
              <label htmlFor={`${formId}-amount`} className="block text-xs font-semibold text-ink-body mb-1">
                টাকার পরিমাণ <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary font-bold text-xs">
                  ৳
                </span>
                <input
                  id={`${formId}-amount`}
                  type="number"
                  step="any"
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-surface-card border border-border-strong rounded-lg text-sm font-bold font-mono tabular-nums text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
                />
              </div>
            </div>

            <div>
              <label htmlFor={`${formId}-desc`} className="block text-xs font-semibold text-ink-body mb-1">
                খরচের বিবরণ <span className="text-danger">*</span>
              </label>
              <input
                id={`${formId}-desc`}
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
              />
            </div>

            <div>
              <label htmlFor={`${formId}-note`} className="block text-xs font-semibold text-ink-secondary mb-1">
                মন্তব্য (ঐচ্ছিক)
              </label>
              <input
                id={`${formId}-note`}
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
              />
            </div>
          </div>

          <div className="px-4 py-3 bg-surface-subtle border-t border-border-default flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeEditModal}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-lg border border-border-strong hover:bg-surface-card active:scale-[0.98] text-xs font-semibold text-ink-body transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-brand-deep hover:bg-brand-hover active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle size={15} weight="bold" />
              <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'আপডেট সম্পন্ন'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
