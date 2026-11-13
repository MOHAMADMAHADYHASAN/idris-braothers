'use client';

import React, { useMemo, useId } from 'react';
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
  const formId = useId();
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
      hasWholesale: wPrice > 0,
      hasRetail: rPrice > 0,
      isWholesaleLoss: wholesaleProfit < 0,
      isRetailLoss: retailProfit < 0,
    };
  }, [pPrice, wPrice, rPrice]);

  return (
    <div className="bg-surface-card rounded-xl border border-border-default surface-card-crisp overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border-default flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-primary">দর ও মূল্য</h2>
        <span className="text-xs text-ink-secondary">প্রতি {baseUnitName || 'একক'}</span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
          <div>
            <label htmlFor={`${formId}-purchase`} className="block text-xs font-semibold text-ink-body mb-1">
              ক্রয়দর <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-ink-secondary font-bold text-xs select-none">৳</span>
              <input
                id={`${formId}-purchase`}
                type="number"
                step="any"
                min="0"
                required
                value={currentPurchasePrice}
                onChange={(e) => setCurrentPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-sm text-ink-primary font-bold"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-wholesale`} className="block text-xs font-semibold text-ink-body mb-1">
              পাইকারি দর <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-ink-secondary font-bold text-xs select-none">৳</span>
              <input
                id={`${formId}-wholesale`}
                type="number"
                step="any"
                min="0"
                required
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-sm text-ink-primary font-bold"
              />
            </div>
            {metrics && metrics.hasWholesale && (
              <p
                className={`mt-1 text-xs font-mono font-semibold ${
                  metrics.isWholesaleLoss ? 'text-due-text' : 'text-cash-text'
                }`}
              >
                {metrics.isWholesaleLoss ? 'লোকসান: ' : 'লাভ: +'}
                {formatCurrency(metrics.wholesaleProfit, false)} ({formatPercent(metrics.wholesaleMarginNum, 1)})
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-retail`} className="block text-xs font-semibold text-ink-body mb-1">
              খুচরা দর <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-ink-secondary font-bold text-xs select-none">৳</span>
              <input
                id={`${formId}-retail`}
                type="number"
                step="any"
                min="0"
                required
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-sm text-ink-primary font-bold"
              />
            </div>
            {metrics && metrics.hasRetail && (
              <p
                className={`mt-1 text-xs font-mono font-semibold ${
                  metrics.isRetailLoss ? 'text-due-text' : 'text-cash-text'
                }`}
              >
                {metrics.isRetailLoss ? 'লোকসান: ' : 'লাভ: +'}
                {formatCurrency(metrics.retailProfit, false)} ({formatPercent(metrics.retailMarginNum, 1)})
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
