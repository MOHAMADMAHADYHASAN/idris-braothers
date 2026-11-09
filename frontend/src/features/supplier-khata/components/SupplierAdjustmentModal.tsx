'use client';

import React, { useState } from 'react';
import { X, SlidersHorizontal, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/lib/decimal';
import { useSupplierKhataStore } from '../useSupplierKhataStore';

export function SupplierAdjustmentModal() {
  const { activeModal, selectedSupplier, closeModal, submitAdjustment } =
    useSupplierKhataStore();

  const [adjustmentType, setAdjustmentType] = useState<'REBATE' | 'ADD_DEBT'>('REBATE');
  const [amountStr, setAmountStr] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white w-full max-w-md rounded-lg shadow-xl border border-slate-200/90 overflow-hidden"
      >
        {/* হেডার */}
        <div className="px-4 py-3 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
              <SlidersHorizontal size={16} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                শুকতি ও কমিশন সমন্বয়
              </h3>
              <p className="text-[11px] text-slate-500">
                মহাজন: {selectedSupplier.companyName || selectedSupplier.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-[background-color,color] duration-150"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <WarningCircle size={15} weight="bold" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* বর্তমান দেনা ও নতুন সম্ভাব্য দেনা */}
            <div className="bg-slate-50/80 p-3 rounded-md border border-slate-200/90 grid grid-cols-2 gap-2 text-center">
              <div className="border-r border-slate-200 pr-2">
                <span className="text-[10px] text-slate-500 font-medium block">বর্তমান দেনা</span>
                <span className="text-sm sm:text-base font-bold font-mono text-amber-800 tabular-nums tracking-tight">
                  ৳{formatCurrency(currentPayable)}
                </span>
              </div>
              <div className="pl-2">
                <span className="text-[10px] text-slate-500 font-medium block">সমন্বয়ের পর দেনা</span>
                <span className="text-sm sm:text-base font-bold font-mono text-slate-900 tabular-nums tracking-tight">
                  ৳{formatCurrency(newPayable)}
                </span>
              </div>
            </div>

            {/* সমন্বয়ের ধরন (ছাড় বনাম বৃদ্ধি) - Segmented Control */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                সমন্বয়ের ধরন নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('REBATE')}
                  className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-[background-color,color,box-shadow] duration-150 active:scale-[0.98] ${
                    adjustmentType === 'REBATE'
                      ? 'bg-white text-emerald-800 shadow-[0_1px_2px_rgba(15,23,42,0.06)] border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>মহাজন থেকে ছাড় (-)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('ADD_DEBT')}
                  className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-[background-color,color,box-shadow] duration-150 active:scale-[0.98] ${
                    adjustmentType === 'ADD_DEBT'
                      ? 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>দেনা বৃদ্ধি (+)</span>
                </button>
              </div>
            </div>

            {/* টাকার পরিমাণ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {adjustmentType === 'REBATE' ? 'ছাড়ের পরিমাণ (টাকা)' : 'বৃদ্ধির পরিমাণ (টাকা)'}{' '}
                <span className="text-red-500">*</span>
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
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-base font-bold font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
                />
              </div>
            </div>

            {/* কারণ / নোট */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সমন্বয়ের সুনির্দিষ্ট কারণ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="যেমন: বস্তা প্রতি ২০০ গ্রাম শুকতি ছাড় / বিশেষ কমিশন"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
              />
            </div>
          </div>

          {/* ফুটার */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200/90 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-xs font-medium text-slate-600 transition-[background-color,border-color,transform] duration-150"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || inputAmount <= 0 || !reason.trim()}
              className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(15,23,42,0.1)] disabled:opacity-50"
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
