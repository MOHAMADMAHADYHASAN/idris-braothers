'use client';

import React from 'react';
import { Package, Tag, Warning, Coins } from '@phosphor-icons/react';
import { useProductStore } from '../useProductStore';
import { formatCurrency } from '@/lib/decimal';

export function ProductKpiSummary() {
  const { products, pagination } = useProductStore();

  // Metrics calculations
  const totalProducts = pagination?.total ?? products.length;
  const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 1), 0);
  const lowStockCount = products.filter((p) =>
    p.variants.some((v) => v.stockQuantity <= v.lowStockAlert)
  ).length;

  const totalInventoryCapital = products.reduce((acc, p) => {
    const pVal = p.variants.reduce((vAcc, v) => vAcc + v.stockQuantity * v.currentPurchasePrice, 0);
    return acc + pVal;
  }, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* ১. মোট মূল পণ্য */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            মোট মূল পণ্য
          </span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Package size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
            {totalProducts} <span className="text-xs font-normal text-slate-400">টি</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">ক্যাটালগে সক্রিয় পণ্য তালিকা</p>
        </div>
      </div>

      {/* ২. মোট ভ্যারিয়েন্ট ও SKU */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            মোট ভ্যারিয়েন্ট (SKU)
          </span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Tag size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
            {totalVariants} <span className="text-xs font-normal text-slate-400">টি</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">সাইজ, গ্রেড ও প্যাক ভ্যারিয়েন্ট</p>
        </div>
      </div>

      {/* ৩. স্টক সংকট সতর্কতা */}
      <div
        className={`p-3.5 rounded-lg border shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between transition-colors ${
          lowStockCount > 0
            ? 'bg-rose-50/40 border-rose-200/90'
            : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              lowStockCount > 0 ? 'text-rose-700' : 'text-slate-500'
            }`}
          >
            স্টক সংকট সতর্কতা
          </span>
          <div
            className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ${
              lowStockCount > 0
                ? 'bg-rose-100 border-rose-200 text-rose-700'
                : 'bg-slate-100 border-slate-200/80 text-slate-700'
            }`}
          >
            <Warning size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div
            className={`text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight ${
              lowStockCount > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}
          >
            {lowStockCount} <span className="text-xs font-normal text-slate-400">টি</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">রি-অর্ডার লেভেলের নিচে মজুত পণ্য</p>
        </div>
      </div>

      {/* ৪. ইনভেন্টরি মূলধন (কেনা দর) */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            ইনভেন্টরি মূলধন
          </span>
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Coins size={17} weight="bold" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900 truncate">
            {formatCurrency(totalInventoryCapital)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">কেনা দরে বর্তমান চালানের মোট মূলধন</p>
        </div>
      </div>
    </div>
  );
}
