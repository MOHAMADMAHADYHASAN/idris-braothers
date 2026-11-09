'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  HandCoins,
  Printer,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useCustomerKhataStore } from '../useCustomerKhataStore';

export function DueCollectionModal() {
  const { selectedCustomer, activeModal, closeModal, submitPayment } =
    useCustomerKhataStore();

  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [printReceipt, setPrintReceipt] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  if (activeModal !== 'payment' || !selectedCustomer) return null;

  const currentDue = selectedCustomer.currentDue;
  const payAmount = Number(amountStr) || 0;
  const remainingDue = currentDue - payAmount;

  const handleQuickAdd = (addVal: number) => {
    const nextVal = (Number(amountStr) || 0) + addVal;
    setAmountStr(String(nextVal));
  };

  const handlePayFull = () => {
    if (currentDue > 0) {
      setAmountStr(String(currentDue));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      setError('জমার পরিমাণ ০ টাকার বেশি হতে হবে');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await submitPayment(selectedCustomer.id, {
        amount: payAmount,
        note: note.trim() || undefined,
      });

      if (printReceipt) {
        setSuccessReceipt({
          customerName: selectedCustomer.name,
          customerPhone: selectedCustomer.phone,
          customerAddress: selectedCustomer.address,
          paidAmount: payAmount,
          previousDue: currentDue,
          newDue: res.customer.currentDue,
          date: new Date().toLocaleString('bn-BD'),
          note: note.trim() || 'নগদ বকেয়া উশুল',
        });
      } else {
        closeModal();
      }
    } catch (err: any) {
      setError(err.message || 'বকেয়া জমা গ্রহণে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
        {/* রসিদ প্রিন্ট ভিউ (সফলভাবে জমা হওয়ার পর) */}
        {successReceipt ? (
          <div className="p-5 text-center space-y-3.5">
            <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle size={24} weight="fill" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">টাকা জমা সফল হয়েছে!</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {successReceipt.customerName}-এর একাউন্টে ৳{formatCurrency(successReceipt.paidAmount)} জমা হয়েছে।
              </p>
            </div>

            {/* প্রিন্ট স্লিপ বক্স (থার্মাল প্রিন্ট প্রিভিউ) */}
            <div className="bg-slate-50/70 border border-dashed border-slate-300 p-3.5 rounded-md text-left font-mono tabular-nums tracking-tight text-xs space-y-1.5">
              <div className="text-center font-bold pb-1.5 border-b border-slate-200 text-xs text-slate-900">
                ইদ্রিস ব্রাদার্স — বাকি আদায়ের রসিদ
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">গ্রাহক:</span>
                <span className="font-semibold text-slate-900">{successReceipt.customerName}</span>
              </div>
              {successReceipt.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">মোবাইল:</span>
                  <span>{successReceipt.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">তারিখ:</span>
                <span>{successReceipt.date}</span>
              </div>
              <div className="border-t border-slate-200 pt-1 flex justify-between text-slate-500">
                <span>পূর্বের বকেয়া:</span>
                <span>৳{formatCurrency(successReceipt.previousDue)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>নগদ জমা:</span>
                <span>৳{formatCurrency(successReceipt.paidAmount)}</span>
              </div>
              <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-rose-700">
                <span>বর্তমান অবশিষ্ট বাকি:</span>
                <span>৳{formatCurrency(successReceipt.newDue)}</span>
              </div>
            </div>

            {/* অ্যাকশন বোতাম */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-[background-color,transform] duration-150 active:scale-[0.98]"
              >
                <Printer size={15} weight="bold" />
                <span>স্লিপ প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="py-1.5 px-3.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-[background-color] duration-150 active:scale-[0.98]"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        ) : (
          /* জমা নেওয়ার মূল ফর্ম */
          <form onSubmit={handleSubmit}>
            {/* হেডার */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                  <HandCoins size={17} weight="bold" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight">বাকি উশুল / জমা গ্রহণ</h3>
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

            {/* বডি */}
            <div className="p-4 space-y-3.5">
              {error && (
                <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
                  <WarningCircle size={15} weight="bold" className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* বর্তমান বকেয়া ও লাইভ পরিবর্তন কার্ড */}
              <div className="bg-slate-50/70 p-3 rounded-md border border-slate-200/80 grid grid-cols-2 gap-2 text-center">
                <div className="border-r border-slate-200 pr-2">
                  <span className="text-[11px] text-slate-500 font-medium block">পূর্বের বকেয়া</span>
                  <span className="text-base sm:text-lg font-black font-mono tabular-nums tracking-tight text-rose-700">
                    ৳{formatCurrency(currentDue)}
                  </span>
                </div>
                <div className="pl-2">
                  <span className="text-[11px] text-slate-500 font-medium block">অবশিষ্ট বকেয়া হবে</span>
                  <span
                    className={`text-base sm:text-lg font-black font-mono tabular-nums tracking-tight ${
                      remainingDue <= 0 ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    ৳{formatCurrency(remainingDue)}
                  </span>
                </div>
              </div>

              {/* জমার পরিমাণ ইনপুট */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  নগদ জমার পরিমাণ (টাকা) <span className="text-rose-500">*</span>
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
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-md text-lg sm:text-xl font-bold font-mono tabular-nums tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                  />
                </div>
              </div>

              {/* কুইক অ্যামাউন্ট বাটনস */}
              <div className="flex flex-wrap gap-1.5">
                {[500, 1000, 2000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAdd(val)}
                    className="py-1 px-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs font-mono tabular-nums tracking-tight font-medium text-slate-700 transition-[background-color,border-color] duration-150 active:scale-[0.97]"
                  >
                    +{val}
                  </button>
                ))}
                {currentDue > 0 && (
                  <button
                    type="button"
                    onClick={handlePayFull}
                    className="py-1 px-2.5 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-medium text-emerald-800 transition-[background-color,border-color] duration-150 active:scale-[0.97] ml-auto"
                  >
                    পুরো বাকি শোধ
                  </button>
                )}
              </div>

              {/* বিবরণ / নোট */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  নোট / মন্তব্য (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: ক্যাশ কাউন্টারে জমা / ব্যাংক চেক"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              {/* রসিদ প্রিন্ট চেকবক্স */}
              <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={(e) => setPrintReceipt(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-600 font-medium">
                  জমা শেষে গ্রাহককে প্রিন্ট স্লিপ প্রদান করুন
                </span>
              </label>
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
                disabled={isSubmitting || payAmount <= 0}
                className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-[0_1px_2px_rgba(5,150,105,0.2)] transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>জমা হচ্ছে...</span>
                ) : (
                  <>
                    <CheckCircle size={15} weight="bold" />
                    <span>জমা সম্পন্ন করুন</span>
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
