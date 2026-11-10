'use client';

import React, { useState } from 'react';
import { X, WarningCircle, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/lib/decimal';
import { useSalesStore } from '../useSalesStore';

export function CancelSaleModal() {
  const {
    isCancelModalOpen,
    saleToCancel,
    isSubmittingCancel,
    closeCancelModal,
    cancelSale,
  } = useSalesStore();

  const [reason, setReason] = useState('');

  if (!isCancelModalOpen || !saleToCancel) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await cancelSale(reason.trim() || undefined);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-slate-200/90 overflow-hidden"
      >
        {/* হেডার */}
        <div className="px-4 py-3 border-b border-slate-200/90 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200/80">
              <WarningCircle size={17} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-rose-900 text-xs sm:text-sm">
                বিক্রয় মেমো বাতিলকরণ (Void Sale Invoice)
              </h3>
              <p className="text-[11px] text-rose-700 font-mono tabular-nums">
                মেমো #{saleToCancel.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCancelModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3">
            {/* ওয়ার্নিং ব্যানার */}
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200 text-amber-900 text-xs space-y-1">
              <span className="font-bold block">সতর্কবার্তা:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                <li>বিক্রিত পণ্যের স্টক স্বয়ংক্রিয়ভাবে ইনভেন্টরিতে যোগ (Restock) হবে।</li>
                {Number(saleToCancel.dueAmount) > 0 && (
                  <li>
                    কাস্টমারের বকেয়া খাতা থেকে{' '}
                    <strong>{formatCurrency(saleToCancel.dueAmount)}</strong> দেনা কমে যাবে।
                  </li>
                )}
                <li>ক্যাশ ড্রয়ার ও দৈনিক বিক্রয় হিসাব থেকে এই মেমোর অংক বাদ পড়বে।</li>
              </ul>
            </div>

            {/* মেমো ইনফো সামারি */}
            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200/80 text-xs flex justify-between items-center font-mono tabular-nums">
              <span className="text-slate-600">মোট মেমো মূল্য:</span>
              <strong className="text-slate-900 text-sm">{formatCurrency(saleToCancel.grandTotal)}</strong>
            </div>

            {/* বাতিলের কারণ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                বাতিলের সুনির্দিষ্ট কারণ (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="যেমন: ভুল পণ্য এন্ট্রি হয়েছিল / কাস্টমার তাৎক্ষণিক পরিবর্তন করেছে"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          {/* ফুটার */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200/90 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeCancelModal}
              disabled={isSubmittingCancel}
              className="px-3 py-1.5 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-xs font-medium text-slate-600 transition-colors"
            >
              ফিরে যান
            </button>
            <button
              type="submit"
              disabled={isSubmittingCancel}
              className="px-4 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(225,29,72,0.2)] disabled:opacity-50"
            >
              {isSubmittingCancel ? (
                <>
                  <ArrowCounterClockwise size={14} weight="bold" className="animate-spin" />
                  <span>বাতিল হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} weight="bold" />
                  <span>মেমো বাতিল নিশ্চিত করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
