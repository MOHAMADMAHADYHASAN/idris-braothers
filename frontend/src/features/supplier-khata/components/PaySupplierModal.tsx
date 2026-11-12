'use client';

import React, { useState, useId } from 'react';
import {
  X,
  HandCoins,
  Printer,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { formatCurrency, formatDateTimeBn, formatNumber } from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

export function PaySupplierModal() {
  const { selectedSupplier, activeModal, closeModal, submitPayment } =
    useSupplierKhataStore();

  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [printReceipt, setPrintReceipt] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
  const formId = useId();
  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(
    Boolean(activeModal === 'payment' && selectedSupplier),
    closeModal
  );

  if (activeModal !== 'payment' || !selectedSupplier) return null;

  const currentPayable = selectedSupplier.currentPayable;
  const payAmount = Number(amountStr) || 0;
  const remainingPayable = currentPayable - payAmount;

  const handleQuickAdd = (addVal: number) => {
    const nextVal = (Number(amountStr) || 0) + addVal;
    setAmountStr(String(nextVal));
  };

  const handlePayFull = () => {
    if (currentPayable > 0) {
      setAmountStr(String(currentPayable));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      setError('পরিশোধের পরিমাণ ০ টাকার বেশি হতে হবে');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await submitPayment(selectedSupplier.id, {
        amount: payAmount,
        note: note.trim() || undefined,
      });

      if (printReceipt) {
        setSuccessReceipt({
          supplierName: selectedSupplier.name,
          companyName: selectedSupplier.companyName,
          supplierPhone: selectedSupplier.phone,
          supplierAddress: selectedSupplier.address,
          paidAmount: payAmount,
          previousPayable: currentPayable,
          newPayable: res.supplier.currentPayable,
          date: formatDateTimeBn(new Date()),
          note: note.trim() || 'মহাজনকে নগদ দেনা পরিশোধ',
        });
      } else {
        closeModal();
      }
    } catch (err: any) {
      setError(err.message || 'দেনা পরিশোধ প্রক্রিয়াকরণে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div {...backdropProps} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 modal-backdrop-frosted">
      <motion.div
        {...dialogProps}
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-surface-card w-full max-w-md rounded-lg shadow-xl border border-border-default overflow-hidden focus:outline-hidden"
      >
        {/* রসিদ / ভাউচার প্রিভিউ (সফলভাবে পরিশোধের পর) */}
        {successReceipt ? (
          <div className="p-5 text-center space-y-4">
            <div className="w-10 h-10 rounded-md bg-cash-bg border border-cash-border text-cash-text flex items-center justify-center mx-auto">
              <CheckCircle size={24} weight="fill" />
            </div>
            <div>
              <h3 id={titleId} className="text-base font-bold text-ink-primary">টাকা পরিশোধ সম্পন্ন হয়েছে!</h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                {successReceipt.companyName || successReceipt.supplierName}-কে{' '}
                <span className="font-mono tabular-nums font-bold text-ink-primary">
                  {formatCurrency(successReceipt.paidAmount)}
                </span>{' '}
                ক্যাশ প্রদান করা হয়েছে।
              </p>
            </div>

            {/* প্রিন্ট স্লিপ বক্স (ক্যাশ আউট ভাউচার) */}
            <div className="bg-surface-subtle border border-border-default p-3.5 rounded-lg text-left font-mono text-xs space-y-2">
              <div className="text-center font-bold pb-2 border-b border-border-default text-xs text-ink-primary">
                ইদ্রিস ব্রাদার্স — মহাজন দেনা পরিশোধ ভাউচার
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">গদি / প্রতিষ্ঠান:</span>
                <span className="font-semibold text-ink-primary">
                  {successReceipt.companyName || successReceipt.supplierName}
                </span>
              </div>
              {successReceipt.supplierName && successReceipt.companyName && (
                <div className="flex justify-between">
                  <span className="text-ink-secondary">মহাজন:</span>
                  <span className="text-ink-primary">{successReceipt.supplierName}</span>
                </div>
              )}
              {successReceipt.supplierAddress && (
                <div className="flex justify-between">
                  <span className="text-ink-secondary">মোকাম:</span>
                  <span className="text-ink-primary">{successReceipt.supplierAddress}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-secondary">তারিখ:</span>
                <span className="text-ink-primary">{successReceipt.date}</span>
              </div>
              <div className="border-t border-border-default pt-1.5 flex justify-between text-ink-secondary">
                <span>পূর্বের দেনা:</span>
                <span className="font-mono tabular-nums">{formatCurrency(successReceipt.previousPayable)}</span>
              </div>
              <div className="flex justify-between font-bold text-cash-text text-xs">
                <span>নগদ পরিশোধ:</span>
                <span className="font-mono tabular-nums">{formatCurrency(successReceipt.paidAmount)}</span>
              </div>
              <div className="border-t border-border-default pt-1.5 flex justify-between font-bold text-wholesale-text text-xs">
                <span>অবশিষ্ট দেনা:</span>
                <span className="font-mono tabular-nums">{formatCurrency(successReceipt.newPayable)}</span>
              </div>
            </div>

            {/* অ্যাকশন বোতাম */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className={buttonClasses({ variant: 'primary', size: 'sm', className: 'flex-1 gap-1.5' })}
              >
                <Printer size={15} weight="bold" />
                <span>ভাউচার প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={closeModal}
                className={buttonClasses({ variant: 'secondary', size: 'sm' })}
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        ) : (
          /* দেনা পরিশোধের মূল ফর্ম */
          <form onSubmit={handleSubmit}>
            {/* হেডার */}
            <div className="px-4 py-3 border-b border-border-default flex items-center justify-between bg-surface-subtle">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
                  <HandCoins size={16} weight="bold" />
                </div>
                <div>
                  <h3 id={titleId} className="font-bold text-ink-primary text-xs sm:text-sm">
                    মহাজন দেনা পরিশোধ
                  </h3>
                  <p className="text-xs text-ink-secondary">
                    {selectedSupplier.companyName || selectedSupplier.name}
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

            {/* বডি */}
            <div className="p-4 space-y-3.5">
              {error && (
                <div className="p-2.5 rounded-md bg-due-bg border border-due-border text-due-text text-xs flex items-center gap-2">
                  <WarningCircle size={15} weight="bold" className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* পূর্বের দেনা ও অবশিষ্ট দেনা কার্ড */}
              <div className="bg-surface-subtle p-3 rounded-lg border border-border-default grid grid-cols-2 gap-2 text-center">
                <div className="border-r border-border-default pr-2">
                  <span className="text-xs text-ink-secondary font-medium block">পূর্বের দেনা</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-wholesale-text tabular-nums tracking-tight">
                    {formatCurrency(currentPayable)}
                  </span>
                </div>
                <div className="pl-2">
                  <span className="text-xs text-ink-secondary font-medium block">অবশিষ্ট দেনা থাকবে</span>
                  <span
                    className={`text-sm sm:text-base font-bold font-mono tabular-nums tracking-tight ${
                      remainingPayable <= 0 ? 'text-cash-text' : 'text-brand-deep'
                    }`}
                  >
                    {formatCurrency(remainingPayable)}
                  </span>
                </div>
              </div>

              {/* পরিশোধের পরিমাণ ইনপুট */}
              <div>
                <label htmlFor={`${formId}-amount`} className="block text-xs font-semibold text-ink-body mb-1">
                  নগদ পরিশোধের পরিমাণ (টাকা) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary text-base font-bold">
                    ৳
                  </span>
                  <input
                    id={`${formId}-amount`}
                    type="number"
                    step="any"
                    autoFocus
                    required
                    value={amountStr}
                    onChange={(e) => {
                      setAmountStr(e.target.value);
                      setError(null);
                    }}
                    placeholder="০.০০"
                    className="w-full pl-7 pr-3 py-2 bg-surface-card border border-border-strong rounded-md text-lg sm:text-xl font-bold font-mono tabular-nums text-cash-text placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
                  />
                </div>
              </div>

              {/* কুইক অ্যামাউন্ট বোতামসমূহ */}
              <div className="flex flex-wrap gap-1.5">
                {[1000, 5000, 10000, 50000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAdd(val)}
                    className="py-1 px-2.5 rounded-md border border-border-default bg-surface-subtle hover:bg-brand-soft/60 hover:border-brand-light text-xs font-mono tabular-nums font-semibold text-ink-body hover:text-brand-deep transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
                  >
                    +{formatNumber(val)}
                  </button>
                ))}
                {currentPayable > 0 && (
                  <button
                    type="button"
                    onClick={handlePayFull}
                    className="py-1 px-2.5 rounded-md border border-wholesale-border bg-wholesale-bg hover:bg-wholesale-bg text-xs font-semibold text-wholesale-text transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] ml-auto cursor-pointer"
                  >
                    পুরো দেনা শোধ
                  </button>
                )}
              </div>

              {/* বিবরণ / নোট */}
              <div>
                <label htmlFor={`${formId}-note`} className="block text-xs font-medium text-ink-secondary mb-1">
                  নোট / ভাউচার রেফারেন্স (ঐচ্ছিক)
                </label>
                <input
                  id={`${formId}-note`}
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="নোট বা রেফারেন্স"
                  className="w-full px-3 py-1.5 bg-surface-card border border-border-default rounded-md text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
                />
              </div>

              {/* ভাউচার প্রিন্ট চেকবক্স */}
              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={(e) => setPrintReceipt(e.target.checked)}
                  className="w-4 h-4 rounded border-border-strong text-brand-deep focus:ring-brand-deep"
                />
                <span className="text-xs text-ink-body font-medium">
                  পরিশোধ শেষে ক্যাশ ভাউচার স্লিপ প্রিন্ট করুন
                </span>
              </label>
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
                disabled={isSubmitting || payAmount <= 0}
                className={buttonClasses({ variant: 'cash', size: 'sm', className: 'gap-1.5' })}
              >
                {isSubmitting ? (
                  <span>পরিশোধ হচ্ছে...</span>
                ) : (
                  <>
                    <CheckCircle size={15} weight="bold" />
                    <span>পরিশোধ নিশ্চিত করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
