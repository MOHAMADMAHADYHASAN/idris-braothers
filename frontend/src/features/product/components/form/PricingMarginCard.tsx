'use client';

import React, { useMemo } from 'react';
import { Coins, TrendUp, Warning, Percent } from '@phosphor-icons/react';
import { formatCurrency, formatPercent } from '@/lib/decimal';

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

  const metrics = useMemo(() => {
    if (pPrice <= 0) return null;

    const wholesaleProfit = wPrice - pPrice;
    const wholesaleMarginNum = (wholesaleProfit / pPrice) * 100;

    const retailProfit = rPrice - pPrice;
    const retailMarginNum = (retailProfit / pPrice) * 100;

    return {
      wholesaleProfit,
      wholesaleMarginNum,
      retailProfit,
      retailMarginNum,
      isWholesaleLoss: wholesaleProfit < 0,
      isRetailLoss: retailProfit < 0,
    };
  }, [pPrice, wPrice, rPrice]);

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
      <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cash-bg text-cash-text">
            <Coins size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-ink-primary">
            ২. দর ও লাভ মার্জিন
          </h2>
        </div>
        <span className="text-xs text-ink-secondary font-medium font-sans">
          প্রতি {baseUnitName || 'একক'}-এর মূল্য
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-body mb-1">
              বর্তমান ক্রয়দর <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-ink-secondary font-bold text-xs select-none">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={currentPurchasePrice}
                onChange={(e) => setCurrentPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-sm text-ink-primary font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-body mb-1">
              পাইকারি বিক্রয়দর <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-ink-secondary font-bold text-xs select-none">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-sm text-ink-primary font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-body mb-1">
              খুচরা বিক্রয়দর <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-ink-secondary font-bold text-xs select-none">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-sm text-ink-primary font-bold"
              />
            </div>
          </div>
        </div>

        {metrics && (
          <div className="pt-2 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                metrics.isWholesaleLoss
                  ? 'bg-due-bg border-due-border text-due-text'
                  : 'bg-cash-bg/70 border-cash-border text-cash-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-surface-card shadow-2xs">
                  {metrics.isWholesaleLoss ? (
                    <Warning size={14} weight="fill" className="text-danger" />
                  ) : (
                    <TrendUp size={14} weight="bold" className="text-success" />
                  )}
                </span>
                <div>
                  <div className="text-xs font-semibold">পাইকারি লাভ মার্জিন</div>
                  <div className="text-xs font-mono font-bold">
                    লাভ: {formatCurrency(metrics.wholesaleProfit)} / {baseUnitName}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-surface-card shadow-2xs">
                  {formatPercent(metrics.wholesaleMarginNum, 1)}
                </span>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                metrics.isRetailLoss
                  ? 'bg-due-bg border-due-border text-due-text'
                  : 'bg-cash-bg/70 border-cash-border text-cash-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-surface-card shadow-2xs">
                  {metrics.isRetailLoss ? (
                    <Warning size={14} weight="fill" className="text-danger" />
                  ) : (
                    <Percent size={14} weight="bold" className="text-success" />
                  )}
                </span>
                <div>
                  <div className="text-xs font-semibold">খুচরা লাভ মার্জিন</div>
                  <div className="text-xs font-mono font-bold">
                    লাভ: {formatCurrency(metrics.retailProfit)} / {baseUnitName}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-surface-card shadow-2xs">
                  {formatPercent(metrics.retailMarginNum, 1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
