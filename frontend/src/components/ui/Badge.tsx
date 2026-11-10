import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'neutral' | 'brand' | 'wholesale' | 'cash' | 'due';

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-subtle text-ink-body border-border-default',
  brand: 'bg-brand-soft text-brand-deep border-brand-light',
  wholesale: 'bg-wholesale-bg text-wholesale-text border-wholesale-border/70',
  cash: 'bg-cash-bg text-cash-text border-cash-border',
  due: 'bg-due-bg text-due-text border-due-border',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/**
 * Standardized readable status badge (min 12px font size, zero Bengali letter-spacing).
 */
export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold leading-tight whitespace-nowrap',
        BADGE_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
