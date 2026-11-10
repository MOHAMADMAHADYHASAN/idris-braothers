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
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  }[size];

  if (isZero) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-bold bg-surface-subtle text-ink-body border border-border-default ${sizeClasses}`}
      >
        পরিশোধিত (৳০)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${sizeClasses} ${
        isDue
          ? 'bg-due-bg text-due-text border-due-border'
          : 'bg-cash-bg text-cash-text border-cash-border'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isDue ? 'bg-danger' : 'bg-success'
        }`}
      />
      <span className="tabular-numbers">
        {showLabel && (isDue ? 'বাকি: ' : 'অগ্রিম: ')}
        {formatCurrency(Math.abs(amount), false)}
      </span>
    </span>
  );
}
