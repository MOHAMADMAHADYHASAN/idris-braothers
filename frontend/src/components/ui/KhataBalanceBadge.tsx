import React from 'react';
import { formatCurrency } from '@/lib/decimal';

interface KhataBalanceBadgeProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function KhataBalanceBadge({
  amount,
  size = 'md',
  showLabel = true,
}: KhataBalanceBadgeProps) {
  const isDue = amount > 0;
  const isZero = amount === 0;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  }[size];

  if (isZero) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200/90 shadow-2xs ${sizeClasses}`}
      >
        পরিশোধিত (৳০)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border shadow-2xs ${sizeClasses} ${
        isDue
          ? 'bg-rose-50 text-rose-700 border-rose-200/90'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isDue ? 'bg-rose-500' : 'bg-emerald-500'
        }`}
      />
      <span className="tabular-numbers">
        {showLabel && (isDue ? 'বাকি: ' : 'অগ্রিম: ')}
        {formatCurrency(Math.abs(amount), false)}
      </span>
    </span>
  );
}
