'use client';

import { useEffect, useId, useRef } from 'react';

let openDialogCount = 0;
let previousBodyOverflow = '';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface UseDialogAccessibilityOptions {
  disableEscapeClose?: boolean;
  disableBackdropClose?: boolean;
}

/**
 * Provides WCAG 2.1 dialog semantics (`role="dialog"`, `aria-modal`, `aria-labelledby`),
 * Escape-to-close, focus trapping, body scroll locking, and focus restoration on close.
 */
export function useDialogAccessibility<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose: () => void,
  options: UseDialogAccessibilityOptions = {}
) {
  const { disableEscapeClose = false, disableBackdropClose = false } = options;
  const dialogRef = useRef<T | null>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    if (openDialogCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    openDialogCount += 1;

    // Focus inside dialog unless an inner element already took focus via autoFocus
    const rafId = window.requestAnimationFrame(() => {
      const container = dialogRef.current;
      if (!container) return;
      if (container.contains(document.activeElement)) return;
      const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        container.focus();
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableEscapeClose) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        const container = dialogRef.current;
        if (!container) return;
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);

        if (focusables.length === 0) {
          e.preventDefault();
          container.focus();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !container.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last || !container.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown);

      openDialogCount = Math.max(0, openDialogCount - 1);
      if (openDialogCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }

      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, disableEscapeClose]);

  const dialogProps = {
    ref: dialogRef,
    role: 'dialog' as const,
    'aria-modal': true as const,
    'aria-labelledby': titleId,
    tabIndex: -1,
  };

  const backdropProps = {
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
      if (!disableBackdropClose && e.target === e.currentTarget) {
        onCloseRef.current();
      }
    },
  };

  return { dialogRef, titleId, dialogProps, backdropProps };
}
