'use client';

import React, { useState } from 'react';
import { X, WarningCircle, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { formatCurrency, toBanglaDigits } from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
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
                বিক্রয় মেমো বাতিলকরণ
              </h3>
              <p className="text-xs text-rose-700 font-mono tabular-nums">
                মেমো #{toBanglaDigits(saleToCancel.invoiceNumber)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCancelModal}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-rose-100/80 transition-colors cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3">
            {/* ওয়ার্নিং ব্যানার */}
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200 text-amber-950 text-xs space-y-1">
              <span className="font-bold block">সতর্কবার্তা:</span>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-900">
                <li>বিক্রিত পণ্যের স্টক স্বয়ংক্রিয়ভাবে ইনভেন্টরিতে ফেরত যোগ হবে।</li>
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
              <span className="text-slate-700 font-sans">মোট মেমো মূল্য:</span>
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
                placeholder="বাতিলের কারণ"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
              />
            </div>
          </div>

          {/* ফুটার */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200/90 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeCancelModal}
              disabled={isSubmittingCancel}
              className={buttonClasses({ variant: 'secondary', size: 'sm' })}
            >
              ফিরে যান
            </button>
            <button
              type="submit"
              disabled={isSubmittingCancel}
              className={buttonClasses({ variant: 'danger', size: 'sm', className: 'gap-1.5' })}
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
