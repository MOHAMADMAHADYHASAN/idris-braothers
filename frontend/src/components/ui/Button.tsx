import React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'wholesale'
  | 'cash'
  | 'danger'
  | 'outlineDanger'
  | 'ghost';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-deep hover:bg-brand-hover text-white border border-brand-deep shadow-[0_1px_2px_rgba(30,74,122,0.18)]',
  secondary:
    'bg-surface-card hover:bg-surface-subtle text-ink-body border border-border-strong shadow-[0_1px_2px_rgba(15,23,42,0.03)]',
  wholesale:
    'bg-wholesale-solid hover:bg-wholesale-hover text-white border border-wholesale-hover shadow-[0_1px_2px_rgba(180,83,9,0.18)]',
  cash:
    'bg-success hover:bg-success-hover text-white border border-success shadow-[0_1px_2px_rgba(5,150,105,0.18)]',
  danger:
    'bg-danger hover:bg-danger-hover text-white border border-danger shadow-[0_1px_2px_rgba(220,38,38,0.18)]',
  outlineDanger:
    'bg-due-bg hover:bg-due-border/40 text-due-text border border-due-border',
  ghost:
    'bg-transparent hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary border border-transparent',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-8 px-2.5 text-xs rounded-md',
  sm: 'h-9 px-3.5 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-11 px-5 text-sm rounded-lg',
};

export function buttonClasses({
  variant = 'primary',
  size = 'sm',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-1.5 font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'sm', className, type = 'button', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses({ variant, size, className })}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
