'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Barcode, CheckCircle, WarningCircle, X } from '@phosphor-icons/react';
import { ScanFeedback } from '../hooks/useBarcodeScanner';

interface BarcodeScanNotificationProps {
  scan: ScanFeedback | null;
  onDismiss: () => void;
}

export function BarcodeScanNotification({
  scan,
  onDismiss,
}: BarcodeScanNotificationProps) {
  return (
    <AnimatePresence>
      {scan && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
          <div
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border shadow-[0_4px_16px_rgba(15,23,42,0.08)] bg-surface-card ${
              scan.type === 'success'
                ? 'border-cash-border text-ink-primary'
                : 'border-due-border text-ink-primary'
            }`}
          >
            <div
              className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                scan.type === 'success'
                  ? 'bg-cash-bg text-cash-text'
                  : 'bg-due-bg text-due-text'
              }`}
            >
              {scan.type === 'success' ? (
                <CheckCircle size={15} weight="bold" />
              ) : (
                <WarningCircle size={15} weight="bold" />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold">{scan.message}</span>
              <span className="font-mono tabular-nums text-xs px-1.5 py-0.5 rounded bg-surface-subtle text-ink-body border border-border-default">
                {scan.barcode}
              </span>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ml-1"
            >
              <X size={12} weight="bold" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
