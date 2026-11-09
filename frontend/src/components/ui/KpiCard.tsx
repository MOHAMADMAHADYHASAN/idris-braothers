'use client';

import React, { useState } from 'react';

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

  // Auto-generate compact value if not provided
  const displayCompact =
    compactValue ||
    (exactValue >= 100000
      ? `${(exactValue / 100000).toFixed(1)}L`
      : exactValue >= 1000
      ? `${(exactValue / 1000).toFixed(1)}K`
      : exactValue.toString());

  return (
    <div
      onClick={() => setShowExact(!showExact)}
      className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between cursor-pointer select-none active:scale-[0.98] transition-[border-color,transform] duration-150 hover:border-slate-300"
      title={hint || 'ক্লিক করে আসল বা সংক্ষিপ্ত হিসাব দেখুন'}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
          <span className="text-xl font-bold text-slate-500 mr-0.5">{prefix}</span>
          <span className="underline decoration-dotted underline-offset-3">
            {showExact ? exactValue.toLocaleString('en-BD') : displayCompact}
          </span>
        </div>

        {trendPercentage !== undefined && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
            <span
              className={`font-semibold font-mono tabular-nums ${
                trendPercentage >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {trendPercentage >= 0 ? '↑' : '↓'} {Math.abs(trendPercentage)}%
            </span>
            <span className="text-slate-400">{periodText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
