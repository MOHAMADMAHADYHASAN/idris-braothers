'use client';

import React from 'react';
import {
  Coins,
  Truck,
  Tag,
  HandCoins,
  CheckCircle,
  WarningCircle,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { usePurchaseStore } from '../usePurchaseStore';

export function ChallanSummarySettlement() {
  const {
    supplierId,
    supplierName,
    items,
    transportCost,
    discount,
    paidAmount,
    isSubmitting,
    draftError,
    setTransportCost,
    setDiscount,
    setPaidAmount,
    submitChallan,
    resetDraft,
    getSubTotal,
    getGrandTotal,
    getDueAmount,
  } = usePurchaseStore();

  const subTotal = getSubTotal();
  const grandTotal = getGrandTotal();
  const dueAmount = getDueAmount();

  const handlePaidChange = (val: string) => {
    setPaidAmount(Number(val) || 0);
  };

  const handlePayFull = () => {
    setPaidAmount(grandTotal);
  };

  const handlePayZero = () => {
    setPaidAmount(0);
  };

  const handleSubmit = async () => {
    try {
      await submitChallan();
      alert('চালান সফলভাবে সংরক্ষিত হয়েছে এবং স্টক বৃদ্ধি পেয়েছে!');
    } catch (err) {
      // Error is set in store
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
            <Coins size={16} weight="bold" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              চালান বিল ও আর্থিক নিষ্পত্তি (Settlement)
            </h3>
            <p className="text-[11px] text-slate-500">
              গাড়িভাড়া, ক্যাশ পরিশোধ ও মহাজন খাতায় বাকি নির্ধারণ
            </p>
          </div>
        </div>
      </div>

      {draftError && (
        <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <WarningCircle size={15} weight="bold" className="shrink-0" />
          <span>{draftError}</span>
        </div>
      )}

      {/* আর্থিক সামারি গ্রিড */}
      <div className="space-y-2 text-xs sm:text-sm">
        {/* ১. পণ্যের উপমোট (Subtotal) */}
        <div className="flex items-center justify-between text-slate-600">
          <span>পণ্যের মোট মূল্য:</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900 text-xs sm:text-sm">
            ৳{formatCurrency(subTotal)}
          </span>
        </div>

        {/* ২. গাড়িভাড়া / ট্রাক / কুলি খরচ */}
        <div className="flex items-center justify-between gap-3">
          <label className="text-slate-600 flex items-center gap-1 text-xs">
            <Truck size={13} weight="bold" className="text-slate-400" />
            <span>গাড়িভাড়া / কুলি খরচ (+):</span>
          </label>
          <div className="w-28 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              ৳
            </span>
            <input
              type="number"
              step="any"
              value={transportCost || ''}
              onChange={(e) => setTransportCost(Number(e.target.value) || 0)}
              placeholder="০"
              className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-md text-right font-mono tabular-nums font-medium text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
        </div>

        {/* ৩. মহাজন থেকে চালান ছাড় / কমিশন */}
        <div className="flex items-center justify-between gap-3">
          <label className="text-slate-600 flex items-center gap-1 text-xs">
            <Tag size={13} weight="bold" className="text-slate-400" />
            <span>চালান ছাড় / কমিশন (-):</span>
          </label>
          <div className="w-28 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              ৳
            </span>
            <input
              type="number"
              step="any"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              placeholder="০"
              className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-md text-right font-mono tabular-nums font-medium text-emerald-800 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
        </div>

        {/* ৪. সর্বমোট প্রদেয় বিল (Grand Total) */}
        <div className="p-2.5 bg-slate-50/80 rounded-md border border-slate-200/90 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-xs sm:text-sm">সর্বমোট চালান বিল:</span>
          <span className="font-mono tabular-nums tracking-tight font-black text-base sm:text-lg text-slate-900">
            ৳{formatCurrency(grandTotal)}
          </span>
        </div>

        {/* ৫. নগদ পরিশোধ (Cash Paid Now) */}
        <div className="pt-2 border-t border-slate-200/90 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label className="font-semibold text-slate-800 flex items-center gap-1 text-xs">
              <HandCoins size={14} weight="bold" className="text-emerald-600" />
              <span>নগদ পরিশোধ (ক্যাশবাক্স থেকে):</span>
            </label>
            <div className="w-32 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                ৳
              </span>
              <input
                type="number"
                step="any"
                value={paidAmount || ''}
                onChange={(e) => handlePaidChange(e.target.value)}
                placeholder="০"
                className="w-full pl-6 pr-2 py-1 bg-white border border-slate-300 rounded-md text-right font-mono tabular-nums font-bold text-emerald-700 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* কুইক পে বোতাম */}
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={handlePayZero}
              className="py-0.5 px-2 rounded-md bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-[10px] font-semibold text-slate-600 transition-[background-color,border-color,transform] duration-150 border border-slate-200/80"
            >
              পুরো বাকি (০ নগদ)
            </button>
            <button
              type="button"
              onClick={handlePayFull}
              className="py-0.5 px-2 rounded-md bg-emerald-50 hover:bg-emerald-100 active:scale-[0.98] text-[10px] font-semibold text-emerald-800 border border-emerald-200/80 transition-[background-color,border-color,transform] duration-150"
            >
              পুরো নগদ পরিশোধ
            </button>
          </div>
        </div>

        {/* ৬. মহাজন খাতায় বাকি যোগ হবে */}
        <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-950 block">মহাজনের খাতায় বাকি যোগ হবে:</span>
            <span className="text-[10px] text-amber-800">
              {supplierName ? `${supplierName}-এর খাতায় যুক্ত হবে` : 'মহাজন নির্বাচন করুন'}
            </span>
          </div>
          <span className="font-mono tabular-nums tracking-tight font-black text-sm sm:text-base text-amber-800">
            ৳{formatCurrency(dueAmount)}
          </span>
        </div>
      </div>

      {/* অ্যাকশন বোতামসমূহ */}
      <div className="pt-1.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={resetDraft}
          disabled={isSubmitting}
          className="py-1.5 px-3 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-xs font-medium text-slate-600 transition-[background-color,border-color,transform] duration-150"
        >
          রিসেট
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !supplierId || items.length === 0}
          className="flex-1 py-1.5 px-3.5 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(15,23,42,0.1)] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <ArrowsClockwise size={15} weight="bold" className="animate-spin" />
              <span>চালান স্টক ইন হচ্ছে...</span>
            </>
          ) : (
            <>
              <CheckCircle size={15} weight="bold" className="text-emerald-400" />
              <span>চালান সম্পন্ন ও স্টক ইন করুন</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
