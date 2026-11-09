'use client';

import React, { useState } from 'react';
import {
  X,
  HandCoins,
  Printer,
  CheckCircle,
  WarningCircle,
  Buildings,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '@/lib/decimal';
import { useSupplierKhataStore } from '../useSupplierKhataStore';

export function PaySupplierModal() {
  const { selectedSupplier, activeModal, closeModal, submitPayment } =
    useSupplierKhataStore();

  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [printReceipt, setPrintReceipt] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

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
          date: new Date().toLocaleString('bn-BD'),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white w-full max-w-md rounded-lg shadow-xl border border-slate-200/90 overflow-hidden"
      >
        {/* রসিদ / ভাউচার প্রিভিউ (সফলভাবে পরিশোধের পর) */}
        {successReceipt ? (
          <div className="p-5 text-center space-y-4">
            <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={24} weight="fill" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">টাকা পরিশোধ সম্পন্ন হয়েছে!</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {successReceipt.companyName || successReceipt.supplierName}-কে ৳
                <span className="font-mono tabular-nums font-semibold">{formatCurrency(successReceipt.paidAmount)}</span> ক্যাশ প্রদান করা হয়েছে।
              </p>
            </div>

            {/* প্রিন্ট স্লিপ বক্স (ক্যাশ আউট ভাউচার) */}
            <div className="bg-slate-50 border border-slate-200/90 p-3.5 rounded-md text-left font-mono text-xs space-y-2">
              <div className="text-center font-bold pb-2 border-b border-slate-200 text-xs text-slate-900">
                ইদ্রিস ব্রাদার্স — মহাজন দেনা পরিশোধ ভাউচার
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">গদি / প্রতিষ্ঠান:</span>
                <span className="font-semibold text-slate-900">
                  {successReceipt.companyName || successReceipt.supplierName}
                </span>
              </div>
              {successReceipt.supplierName && successReceipt.companyName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">মহাজন:</span>
                  <span className="text-slate-700">{successReceipt.supplierName}</span>
                </div>
              )}
              {successReceipt.supplierAddress && (
                <div className="flex justify-between">
                  <span className="text-slate-500">মোকাম:</span>
                  <span className="text-slate-700">{successReceipt.supplierAddress}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">তারিখ:</span>
                <span className="text-slate-700">{successReceipt.date}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between text-slate-500">
                <span>পূর্বের দেনা:</span>
                <span className="font-mono tabular-nums">৳{formatCurrency(successReceipt.previousPayable)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 text-xs">
                <span>নগদ পরিশোধ:</span>
                <span className="font-mono tabular-nums">৳{formatCurrency(successReceipt.paidAmount)}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-amber-800 text-xs">
                <span>অবশিষ্ট দেনা:</span>
                <span className="font-mono tabular-nums">৳{formatCurrency(successReceipt.newPayable)}</span>
              </div>
            </div>

            {/* অ্যাকশন বোতাম */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-2 px-3 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-[background-color,border-color,transform] duration-150"
              >
                <Printer size={15} weight="bold" />
                <span>ভাউচার প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="py-2 px-4 rounded-md border border-slate-200 hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-medium text-xs transition-[background-color,border-color,transform] duration-150"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        ) : (
          /* দেনা পরিশোধের মূল ফর্ম */
          <form onSubmit={handleSubmit}>
            {/* হেডার */}
            <div className="px-4 py-3 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <HandCoins size={16} weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    মহাজন দেনা পরিশোধ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedSupplier.companyName || selectedSupplier.name}
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

            {/* বডি */}
            <div className="p-4 space-y-3.5">
              {error && (
                <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <WarningCircle size={15} weight="bold" className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* পূর্বের দেনা ও অবশিষ্ট দেনা কার্ড */}
              <div className="bg-slate-50/80 p-3 rounded-md border border-slate-200/90 grid grid-cols-2 gap-2 text-center">
                <div className="border-r border-slate-200 pr-2">
                  <span className="text-[10px] text-slate-500 font-medium block">পূর্বের দেনা</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-amber-800 tabular-nums tracking-tight">
                    ৳{formatCurrency(currentPayable)}
                  </span>
                </div>
                <div className="pl-2">
                  <span className="text-[10px] text-slate-500 font-medium block">অবশিষ্ট দেনা থাকবে</span>
                  <span
                    className={`text-sm sm:text-base font-bold font-mono tabular-nums tracking-tight ${
                      remainingPayable <= 0 ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    ৳{formatCurrency(remainingPayable)}
                  </span>
                </div>
              </div>

              {/* পরিশোধের পরিমাণ ইনপুট */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  নগদ পরিশোধের পরিমাণ (টাকা) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base font-bold">
                    ৳
                  </span>
                  <input
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
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-[border-color,box-shadow] duration-150"
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
                    className="py-1 px-2.5 rounded-md border border-slate-200/90 bg-slate-50 hover:bg-slate-100 text-xs font-mono tabular-nums font-semibold text-slate-700 transition-[background-color,border-color,transform] duration-150 active:scale-[0.98]"
                  >
                    +{val >= 1000 ? `${val / 1000}K` : val}
                  </button>
                ))}
                {currentPayable > 0 && (
                  <button
                    type="button"
                    onClick={handlePayFull}
                    className="py-1 px-2.5 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-medium text-amber-800 transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] ml-auto"
                  >
                    পুরো দেনা শোধ
                  </button>
                )}
              </div>

              {/* বিবরণ / নোট */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  নোট / ভাউচার রেফারেন্স (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: খাতুনগঞ্জের প্রতিনিধিকে ক্যাশ প্রদান / ব্যাংক চেক"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              {/* ভাউচার প্রিন্ট চেকবক্স */}
              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={(e) => setPrintReceipt(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                />
                <span className="text-xs text-slate-600 font-medium">
                  পরিশোধ শেষে ক্যাশ ভাউচার স্লিপ প্রিন্ট করুন
                </span>
              </label>
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
                disabled={isSubmitting || payAmount <= 0}
                className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(5,150,105,0.2)] disabled:opacity-50"
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
