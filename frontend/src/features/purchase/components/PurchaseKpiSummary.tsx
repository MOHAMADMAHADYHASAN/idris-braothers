'use client';

import React from 'react';
import { Receipt, Coins, CreditCard, Bank } from '@phosphor-icons/react';
import { usePurchaseStore } from '../usePurchaseStore';
import { formatCurrency } from '@/lib/decimal';

export function PurchaseKpiSummary() {
  const { purchases, meta } = usePurchaseStore();

  const totalPurchases = meta?.total ?? purchases.length;
  const totalAmount = purchases.reduce((acc, p) => acc + (p.grandTotal || 0), 0);
  const totalPaid = purchases.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const totalDue = purchases.reduce((acc, p) => acc + (p.dueAmount || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* ১. মোট চালান সংখ্যা */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            মোট চালান
          </span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Receipt size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
            {totalPurchases} <span className="text-xs font-normal text-slate-400">টি</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">মোকাম ও মহাজন চালানপত্র</p>
        </div>
      </div>

      {/* ২. মোট ক্রয়মূল্য */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            মোট ক্রয় চালান বিল
          </span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Coins size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900 truncate">
            {formatCurrency(totalAmount)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">গাড়িভাড়া সহ সর্বমোট স্টক ইন</p>
        </div>
      </div>

      {/* ৩. নগদ পরিশোধিত */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            পরিশোধিত নগদ
          </span>
          <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <CreditCard size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-emerald-700 truncate">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">মোকাম বা ব্যাংকে প্রদত্ত ক্যাশ</p>
        </div>
      </div>

      {/* ৪. মহাজন বকেয়া দেনা */}
      <div
        className={`p-3.5 rounded-lg border shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between transition-colors ${
          totalDue > 0 ? 'bg-amber-50/40 border-amber-200/90' : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              totalDue > 0 ? 'text-amber-800' : 'text-slate-500'
            }`}
          >
            মহাজন বকেয়া দেনা
          </span>
          <div
            className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ${
              totalDue > 0
                ? 'bg-amber-100 border-amber-200 text-amber-800'
                : 'bg-slate-100 border-slate-200/80 text-slate-700'
            }`}
          >
            <Bank size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div
            className={`text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight truncate ${
              totalDue > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}
          >
            {formatCurrency(totalDue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">মোকাম আড়তের অবশিষ্ট দেনা</p>
        </div>
      </div>
    </div>
  );
}
