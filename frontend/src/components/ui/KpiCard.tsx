'use client';

import React, { useState } from 'react';
import { formatCompactTaka, formatNumber, formatPercent } from '@/lib/decimal';

interface KpiCardProps {
  label: string;
  exactValue: number;
  compactValue?: string;
  prefix?: string;
  icon?: React.ReactNode;
  trendPercentage?: number;
  periodText?: string;
  hint?: string;
}

export function KpiCard({
  label,
  exactValue,
  compactValue,
  prefix = '৳',
  icon,
  trendPercentage,
  periodText = 'আগের দিনের তুলনায়',
  hint,
}: KpiCardProps) {
  const [showExact, setShowExact] = useState(false);

  const displayCompact = compactValue || formatCompactTaka(exactValue);

  return (
    <div
      onClick={() => setShowExact(!showExact)}
      className="bg-surface-card rounded-xl border border-border-default p-4 surface-card-crisp flex flex-col justify-between cursor-pointer select-none active:scale-[0.98] transition-[border-color,box-shadow,transform] duration-150 hover:border-brand-light hover:shadow-sm"
      title={hint || 'ক্লিক করে সম্পূর্ণ বা সংক্ষিপ্ত হিসাব দেখুন'}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink-secondary">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light/70 text-brand-deep flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-black text-ink-primary font-mono tabular-numbers">
          <span className="text-xl font-bold text-ink-secondary mr-0.5">{prefix}</span>
          <span className="underline decoration-dotted decoration-border-strong underline-offset-4">
            {showExact ? formatNumber(exactValue, { maxDecimals: 2 }) : displayCompact}
          </span>
        </div>

        {trendPercentage !== undefined && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            <span
              className={`font-semibold font-mono tabular-numbers ${
                trendPercentage >= 0 ? 'text-cash-text' : 'text-due-text'
              }`}
            >
              {trendPercentage >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(trendPercentage), 1)}
            </span>
            <span className="text-ink-secondary">{periodText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
