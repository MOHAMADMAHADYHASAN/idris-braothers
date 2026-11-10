'use client';

import React from 'react';
import {
  Coins,
  Truck,
  Tag,
  HandCoins,
  CheckCircle,
  WarningCircle,
  Receipt,
  Scales,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { usePurchaseStore } from '../../usePurchaseStore';

export function ChallanSettlementCard() {
  const {
    items,
    transportCost,
    discount,
    paidAmount,
    setTransportCost,
    setDiscount,
    setPaidAmount,
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

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden sticky top-20">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
            <Coins size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            চালান আর্থিক হিসাব ও নিষ্পত্তি
          </h2>
        </div>
        <span className="text-[10px] text-slate-400">Settlement</span>
      </div>

      <div className="p-5 space-y-3.5">
        {/* ১. পণ্যের উপমোট */}
        <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
          <span>পণ্যের মোট মূল্য ({items.length}টি আইটেম):</span>
          <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
            {formatCurrency(subTotal)}
          </span>
        </div>

        {/* ২. গাড়িভাড়া / ট্রাক / কুলি খরচ (+) */}
        <div>
          <label className="text-slate-700 flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Truck size={14} weight="bold" className="text-slate-400" />
              <span>গাড়িভাড়া ও কুলি খরচ (+):</span>
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs select-none">৳</span>
            <input
              type="number"
              step="any"
              min="0"
              value={transportCost || ''}
              onChange={(e) => setTransportCost(Number(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs text-right text-slate-900 font-bold"
            />
          </div>
        </div>

        {/* ৩. মহাজন ছাড় / ডিসকাউন্ট (-) */}
        <div>
          <label className="text-slate-700 flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Tag size={14} weight="bold" className="text-slate-400" />
              <span>মহাজন ছাড় / কমিশন (-):</span>
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs select-none">৳</span>
            <input
              type="number"
              step="any"
              min="0"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs text-right text-slate-900 font-bold"
            />
          </div>
        </div>

        {/* ৪. সর্বমোট চালানি ব্যয় (Net Payable) */}
        <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              সর্বমোট চালান ব্যয়
            </div>
            <div className="text-xs text-slate-300">পণ্যের দাম + গাড়িভাড়া - ছাড়</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-base sm:text-lg font-bold tracking-tight text-white">
              {formatCurrency(grandTotal)}
            </div>
          </div>
        </div>

        {/* ৫. পরিশোধিত অর্থ (Paid Amount) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <HandCoins size={14} weight="bold" className="text-emerald-600" />
              <span>নগদ পরিশোধের পরিমাণ:</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePayFull}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                title="সম্পূর্ণ চালান পরিশোধ"
              >
                পুরো
              </button>
              <button
                type="button"
                onClick={handlePayZero}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer"
                title="সম্পূর্ণ চালান বাকি"
              >
                শূন্য
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs select-none">৳</span>
            <input
              type="number"
              step="any"
              min="0"
              value={paidAmount || ''}
              onChange={(e) => handlePaidChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-sm text-right text-slate-900 font-bold"
            />
          </div>
        </div>

        {/* ৬. মহাজন খাতায় বাকি জের */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
            dueAmount > 0
              ? 'bg-rose-50/60 border-rose-200 text-rose-900'
              : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {dueAmount > 0 ? (
              <WarningCircle size={16} weight="fill" className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
            )}
            <div>
              <div className="text-[11px] font-bold">
                {dueAmount > 0 ? 'মহাজন খাতায় বাকি যোগ হবে' : 'চালানটি সম্পূর্ণ পরিশোধিত'}
              </div>
              <div className="text-[10px] opacity-75">
                {dueAmount > 0 ? 'পার্টির লেজারে দেনা হিসেবে থাকবে' : 'কোনো বকেয়া নেই'}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-sm font-bold">
            {formatCurrency(dueAmount)}
          </div>
        </div>
      </div>
    </div>
  );
}
