'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, SlidersHorizontal, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useCustomerKhataStore } from '../useCustomerKhataStore';

export function CustomerAdjustmentModal() {
  const { activeModal, selectedCustomer, closeModal, submitAdjustment } =
    useCustomerKhataStore();

  const [adjustmentType, setAdjustmentType] = useState<'DISCOUNT' | 'ADD_DUE'>('DISCOUNT');
  const [amountStr, setAmountStr] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (activeModal !== 'adjustment' || !selectedCustomer) return null;

  const currentDue = selectedCustomer.currentDue;
  const inputAmount = Number(amountStr) || 0;
  const newDue =
    adjustmentType === 'DISCOUNT'
      ? currentDue - inputAmount
      : currentDue + inputAmount;

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
      // If DISCOUNT, pass negative amount to backend; if ADD_DUE, pass positive
      const deltaAmount = adjustmentType === 'DISCOUNT' ? -inputAmount : inputAmount;

      await submitAdjustment(selectedCustomer.id, {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white w-full max-w-md rounded-lg shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] border border-slate-200/90 overflow-hidden"
      >
        {/* হেডার */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <SlidersHorizontal size={17} weight="bold" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight">হিসাব সমন্বয় ও ছাড়</h3>
              <p className="text-[11px] text-slate-500">গ্রাহক: {selectedCustomer.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-[background-color,color] duration-150"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
                <WarningCircle size={15} weight="bold" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* বর্তমান বকেয়া ও নতুন সম্ভাব্য বকেয়া */}
            <div className="bg-slate-50/70 p-3 rounded-md border border-slate-200/80 grid grid-cols-2 gap-2 text-center">
              <div className="border-r border-slate-200 pr-2">
                <span className="text-[11px] text-slate-500 font-medium block">বর্তমান বকেয়া</span>
                <span className="text-base font-black font-mono tabular-nums tracking-tight text-rose-700">
                  {formatCurrency(currentDue)}
                </span>
              </div>
              <div className="pl-2">
                <span className="text-[11px] text-slate-500 font-medium block">সমন্বয়ের পর বকেয়া</span>
                <span className="text-base font-black font-mono tabular-nums tracking-tight text-slate-900">
                  {formatCurrency(newDue)}
                </span>
              </div>
            </div>

            {/* সমন্বয়ের ধরন (ছাড় বনাম বৃদ্ধি) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                সমন্বয়ের ধরন নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('DISCOUNT')}
                  className={`py-1.5 px-3 rounded-md border text-xs font-medium transition-[background-color,color] duration-150 active:scale-[0.98] ${
                    adjustmentType === 'DISCOUNT'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>বাকি ছাড় / মাফ (-)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('ADD_DUE')}
                  className={`py-1.5 px-3 rounded-md border text-xs font-medium transition-[background-color,color] duration-150 active:scale-[0.98] ${
                    adjustmentType === 'ADD_DUE'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>বাকি বৃদ্ধি (+)</span>
                </button>
              </div>
            </div>

            {/* টাকার পরিমাণ */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {adjustmentType === 'DISCOUNT' ? 'ছাড়ের পরিমাণ (টাকা)' : 'বৃদ্ধির পরিমাণ (টাকা)'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ৳
                </span>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="০.০০"
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-bold font-mono tabular-nums tracking-tight text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            {/* কারণ / নোট */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                সমন্বয়ের কারণ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="যেমন: হিসাব মেলাতে ৫০ টাকা ছাড় দেওয়া হয়েছে"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          {/* ফুটার */}
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-600 transition-[background-color,color] duration-150 active:scale-[0.98]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || inputAmount <= 0 || !reason.trim()}
              className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50"
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
