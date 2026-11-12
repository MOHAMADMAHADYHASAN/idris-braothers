'use client';

import React from 'react';
import { MotionConfig } from 'motion/react';
import {
  CheckCircle,
  WarningCircle,
  Warning,
  Info,
  X,
} from '@phosphor-icons/react';
import { ToastTone, useFeedbackStore } from '@/lib/feedback';
import { useDialogAccessibility } from './AccessibleDialog';
import { buttonClasses } from '@/components/ui/Button';

const TOAST_STYLES: Record<
  ToastTone,
  {
    wrapper: string;
    icon: React.ReactNode;
  }
> = {
  success: {
    wrapper: 'bg-surface-card border-cash-border text-ink-primary',
    icon: <CheckCircle size={18} weight="fill" className="text-cash-text shrink-0" />,
  },
  error: {
    wrapper: 'bg-surface-card border-due-border text-ink-primary',
    icon: <WarningCircle size={18} weight="fill" className="text-due-text shrink-0" />,
  },
  warning: {
    wrapper: 'bg-surface-card border-wholesale-border text-ink-primary',
    icon: <Warning size={18} weight="fill" className="text-wholesale-text shrink-0" />,
  },
  info: {
    wrapper: 'bg-surface-card border-brand-light text-ink-primary',
    icon: <Info size={18} weight="fill" className="text-brand-deep shrink-0" />,
  },
};

function ConfirmDialogHost() {
  const { confirmState, resolveConfirm } = useFeedbackStore();
  const isOpen = Boolean(confirmState);

  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(isOpen, () =>
    resolveConfirm(false)
  );

  if (!confirmState) return null;

  const tone = confirmState.tone ?? 'danger';
  const confirmVariant =
    tone === 'danger' ? 'danger' : tone === 'warning' ? 'wholesale' : 'primary';

  return (
    <div
      {...backdropProps}
      className="fixed inset-0 z-[100] modal-backdrop-frosted flex items-center justify-center p-4"
    >
      <div
        {...dialogProps}
        role="alertdialog"
        className="bg-surface-card rounded-xl shadow-2xl border border-border-default w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 focus:outline-hidden"
      >
        <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2.5 bg-surface-subtle">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              tone === 'danger'
                ? 'bg-due-bg text-due-text'
                : tone === 'warning'
                  ? 'bg-wholesale-bg text-wholesale-text'
                  : 'bg-brand-soft text-brand-deep'
            }`}
          >
            {tone === 'brand' ? (
              <Info size={18} weight="bold" />
            ) : (
              <Warning size={18} weight="bold" />
            )}
          </div>
          <h2 id={titleId} className="text-sm sm:text-base font-bold text-ink-primary">
            {confirmState.title || 'নিশ্চিতকরণ'}
          </h2>
        </div>

        <div className="p-5">
          <p className="text-xs sm:text-sm text-ink-body leading-relaxed whitespace-pre-line">
            {confirmState.message}
          </p>
        </div>

        <div className="px-5 py-3.5 bg-surface-subtle border-t border-border-subtle flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => resolveConfirm(false)}
            className={buttonClasses({ variant: 'secondary', size: 'md', className: 'min-h-10' })}
          >
            {confirmState.cancelLabel || 'বাতিল'}
          </button>
          <button
            type="button"
            onClick={() => resolveConfirm(true)}
            className={buttonClasses({ variant: confirmVariant, size: 'md', className: 'min-h-10' })}
          >
            {confirmState.confirmLabel || 'হ্যাঁ, নিশ্চিত'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToastViewport() {
  const { toasts, dismissToast } = useFeedbackStore();

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="সিস্টেম নোটিফিকেশন"
      aria-live="polite"
      className="fixed top-4 right-4 z-[110] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none print:hidden"
    >
      {toasts.map((item) => {
        const style = TOAST_STYLES[item.tone];
        return (
          <div
            key={item.id}
            role={item.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto rounded-xl border surface-glass-popover px-3.5 py-3 flex items-start gap-2.5 animate-in fade-in zoom-in-95 ${style.wrapper}`}
          >
            <div className="mt-0.5">{style.icon}</div>
            <p className="flex-1 text-xs sm:text-sm font-medium text-ink-primary leading-snug">
              {item.message}
            </p>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="নোটিফিকেশন বন্ধ করুন"
              className="p-1 -m-1 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer shrink-0"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <ToastViewport />
      <ConfirmDialogHost />
    </MotionConfig>
  );
}
