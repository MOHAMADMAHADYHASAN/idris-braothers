'use client';

import React from 'react';
import { useProductStore } from '../useProductStore';
import { formatCurrency, formatNumber } from '@/lib/decimal';

export function ProductKpiSummary() {
  const { products, pagination } = useProductStore();

  const totalProducts = pagination?.total ?? products.length;
  const isMultiPage = Boolean(pagination && pagination.totalPages > 1);
  const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 1), 0);
  const lowStockCount = products.filter((p) =>
    p.variants.some((v) => v.stockQuantity <= v.lowStockAlert)
  ).length;

  const totalInventoryCapital = products.reduce((acc, p) => {
    const pVal = p.variants.reduce((vAcc, v) => vAcc + v.stockQuantity * v.currentPurchasePrice, 0);
    return acc + pVal;
  }, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* ১. মোট মূল পণ্য */}
      <div className="bg-surface-card p-3.5 rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <span className="text-xs font-semibold text-ink-secondary">
          মোট মূল পণ্য
        </span>
        <div className="mt-1.5 text-xl sm:text-2xl font-black font-mono tabular-nums text-ink-primary">
          {formatNumber(totalProducts)}{' '}
          <span className="text-xs font-medium text-ink-secondary">টি</span>
        </div>
      </div>

      {/* ২. মোট ভ্যারিয়েন্ট */}
      <div className="bg-surface-card p-3.5 rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <span className="text-xs font-semibold text-ink-secondary">
          মোট ভ্যারিয়েন্ট{isMultiPage ? ' (এই পেজ)' : ''}
        </span>
        <div className="mt-1.5 text-xl sm:text-2xl font-black font-mono tabular-nums text-ink-primary">
          {formatNumber(totalVariants)}{' '}
          <span className="text-xs font-medium text-ink-secondary">টি</span>
        </div>
      </div>

      {/* ৩. স্টক সংকট সতর্কতা */}
      <div
        className={`p-3.5 rounded-xl border shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between transition-colors ${
          lowStockCount > 0
            ? 'bg-due-bg/50 border-due-border'
            : 'bg-surface-card border-border-default'
        }`}
      >
        <span
          className={`text-xs font-semibold ${
            lowStockCount > 0 ? 'text-due-text' : 'text-ink-secondary'
          }`}
        >
          স্টক সংকট{isMultiPage ? ' (এই পেজ)' : ''}
        </span>
        <div
          className={`mt-1.5 text-xl sm:text-2xl font-black font-mono tabular-nums ${
            lowStockCount > 0 ? 'text-due-text' : 'text-ink-primary'
          }`}
        >
          {formatNumber(lowStockCount)}{' '}
          <span className="text-xs font-medium text-ink-secondary">টি</span>
        </div>
      </div>

      {/* ৪. ইনভেন্টরি মূলধন */}
      <div className="bg-surface-card p-3.5 rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <span className="text-xs font-semibold text-ink-secondary">
          ইনভেন্টরি মূলধন{isMultiPage ? ' (এই পেজ)' : ''}
        </span>
        <div className="mt-1.5 text-xl sm:text-2xl font-black font-mono tabular-nums text-ink-primary truncate">
          {formatCurrency(totalInventoryCapital)}
        </div>
      </div>
    </div>
  );
}
