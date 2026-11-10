'use client';

import React, { useMemo } from 'react';
import { Coins, TrendUp, Warning, Percent } from '@phosphor-icons/react';

interface PricingMarginCardProps {
  currentPurchasePrice: string;
  setCurrentPurchasePrice: (v: string) => void;
  wholesalePrice: string;
  setWholesalePrice: (v: string) => void;
  retailPrice: string;
  setRetailPrice: (v: string) => void;
  baseUnitName: string;
}

export function PricingMarginCard({
  currentPurchasePrice,
  setCurrentPurchasePrice,
  wholesalePrice,
  setWholesalePrice,
  retailPrice,
  setRetailPrice,
  baseUnitName,
}: PricingMarginCardProps) {
  const pPrice = parseFloat(currentPurchasePrice) || 0;
  const wPrice = parseFloat(wholesalePrice) || 0;
  const rPrice = parseFloat(retailPrice) || 0;

  // লাইভ লাভ ও মার্জিন ক্যালকুলেশন
  const metrics = useMemo(() => {
    if (pPrice <= 0) return null;

    const wholesaleProfit = wPrice - pPrice;
    const wholesaleMargin = ((wholesaleProfit / pPrice) * 100).toFixed(1);

    const retailProfit = rPrice - pPrice;
    const retailMargin = ((retailProfit / pPrice) * 100).toFixed(1);

    return {
      wholesaleProfit,
      wholesaleMargin,
      retailProfit,
      retailMargin,
      isWholesaleLoss: wholesaleProfit < 0,
      isRetailLoss: retailProfit < 0,
    };
  }, [pPrice, wPrice, rPrice]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
            <Coins size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            ২. দর ও লাভ মার্জিন (Pricing & Margin)
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium font-sans">
          প্রতি {baseUnitName || 'একক'}-এর মূল্য
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* ৩টি মূল্য ইনপুট গ্রিড */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* ক্রয়দর */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              বর্তমান ক্রয়দর (Purchase Price) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs select-none">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={currentPurchasePrice}
                onChange={(e) => setCurrentPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-sm text-slate-900 font-bold"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">মজুত স্টকের গড় ক্রয়মূল্য</p>
          </div>

          {/* পাইকারি বিক্রয়দর */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পাইকারি বিক্রয়দর (Wholesale) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs select-none">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-sm text-slate-900 font-bold"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">ব্যবসায়ী ও পাইকারদের জন্য</p>
          </div>

          {/* খুচরা বিক্রয়দর */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              খুচরা বিক্রয়দর (Retail) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs select-none">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-sm text-slate-900 font-bold"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">সাধারণ কাস্টমার ও ক্যাশ মেমোর দর</p>
          </div>
        </div>

        {/* লাইভ মার্জিন ও লাভ প্রিভিউ বার */}
        {metrics && (
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* পাইকারি মার্জিন কার্ড */}
            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                metrics.isWholesaleLoss
                  ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                  : 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-white shadow-2xs">
                  {metrics.isWholesaleLoss ? (
                    <Warning size={14} weight="fill" className="text-rose-600" />
                  ) : (
                    <TrendUp size={14} weight="bold" className="text-emerald-600" />
                  )}
                </span>
                <div>
                  <div className="text-[11px] font-semibold">পাইকারি লাভ মার্জিন</div>
                  <div className="text-xs font-mono font-bold">
                    লাভ: ৳{metrics.wholesaleProfit.toFixed(2)} / {baseUnitName}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white shadow-2xs">
                  {metrics.wholesaleMargin}%
                </span>
              </div>
            </div>

            {/* খুচরা মার্জিন কার্ড */}
            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                metrics.isRetailLoss
                  ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                  : 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-white shadow-2xs">
                  {metrics.isRetailLoss ? (
                    <Warning size={14} weight="fill" className="text-rose-600" />
                  ) : (
                    <Percent size={14} weight="bold" className="text-emerald-600" />
                  )}
                </span>
                <div>
                  <div className="text-[11px] font-semibold">খুচরা লাভ মার্জিন</div>
                  <div className="text-xs font-mono font-bold">
                    লাভ: ৳{metrics.retailProfit.toFixed(2)} / {baseUnitName}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white shadow-2xs">
                  {metrics.retailMargin}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
