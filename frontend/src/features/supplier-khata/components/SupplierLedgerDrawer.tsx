'use client';

import React from 'react';
import {
  X,
  Scroll,
  Printer,
  CaretLeft,
  CaretRight,
  Phone,
  MapPin,
  ArrowsClockwise,
  Buildings,
} from '@phosphor-icons/react';
import { motion } from 'motion/react';
import {
  formatCurrency,
  formatDateTimeBn,
  formatNumber,
  toBanglaDigits,
} from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { SupplierLedgerType } from '../supplierKhata.types';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

function getEntryLabel(type: SupplierLedgerType): { label: string; badgeClass: string } {
  switch (type) {
    case 'PURCHASE':
    case 'PURCHASE_DUE':
      return {
        label: 'চালান ক্রয় (দেনা বৃদ্ধি)',
        badgeClass: 'bg-wholesale-bg text-wholesale-text border-wholesale-border',
      };
    case 'PAYMENT_PAID':
      return {
        label: 'নগদ দেনা পরিশোধ',
        badgeClass: 'bg-cash-bg text-cash-text border-cash-border',
      };
    case 'OPENING_BALANCE':
      return {
        label: 'প্রারম্ভিক বকেয়া হিসাব',
        badgeClass: 'bg-surface-subtle text-ink-body border-border-default',
      };
    case 'ADJUSTMENT':
      return {
        label: 'শুকতি / কমিশন সমন্বয়',
        badgeClass: 'bg-brand-soft text-brand-deep border-brand-light',
      };
    case 'RETURN':
      return {
        label: 'ত্রুটিপূর্ণ মাল ফেরত',
        badgeClass: 'bg-due-bg text-due-text border-due-border',
      };
    default:
      return {
        label: type,
        badgeClass: 'bg-surface-subtle text-ink-body border-border-default',
      };
  }
}

export function SupplierLedgerDrawer() {
  const {
    activeModal,
    selectedSupplier,
    ledgerEntries,
    ledgerMeta,
    isLedgerLoading,
    closeModal,
    fetchSupplierLedger,
  } = useSupplierKhataStore();

  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(
    Boolean(activeModal === 'ledger' && selectedSupplier),
    closeModal
  );

  if (activeModal !== 'ledger' || !selectedSupplier) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div {...backdropProps} className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 modal-backdrop-frosted">
      <motion.div
        {...dialogProps}
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-surface-card w-full max-w-4xl max-h-[92vh] flex flex-col rounded-lg shadow-xl border border-border-default overflow-hidden focus:outline-hidden"
      >
        {/* হেডার */}
        <div className="px-4 py-3 border-b border-border-default flex items-center justify-between bg-surface-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
              <Scroll size={18} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id={titleId} className="font-bold text-ink-primary text-sm sm:text-base">
                  {selectedSupplier.companyName || selectedSupplier.name} — খতিয়ান বিবরণী
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-secondary mt-0.5 flex-wrap">
                {selectedSupplier.companyName && (
                  <span className="flex items-center gap-1">
                    <Buildings size={12} weight="bold" />
                    মালিক: {selectedSupplier.name}
                  </span>
                )}
                {selectedSupplier.phone && (
                  <span className="flex items-center gap-1 font-mono tabular-nums tracking-tight">
                    <Phone size={12} weight="bold" />
                    {toBanglaDigits(selectedSupplier.phone)}
                  </span>
                )}
                {selectedSupplier.address && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} weight="bold" />
                    {selectedSupplier.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className={buttonClasses({ variant: 'primary', size: 'sm', className: 'gap-1.5' })}
              title="খতিয়ান প্রিন্ট করুন"
            >
              <Printer size={15} weight="bold" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>
            <button
              type="button"
              onClick={closeModal}
              aria-label="বন্ধ করুন"
              className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-border-default transition-[background-color,color] duration-150 cursor-pointer"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* ব্যালেন্স সামারি স্ট্রিপ */}
        <div className="px-4 py-2 bg-surface-subtle border-b border-border-default flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-ink-secondary">
            <span>সর্বমোট লেনদেন রেকর্ড:</span>
            <strong className="text-ink-primary font-mono tabular-nums">
              {formatNumber(ledgerMeta.total)} টি
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-ink-secondary">দোকানের বর্তমান দেনা:</span>
            <span
              className={`font-mono tabular-nums tracking-tight font-black text-sm sm:text-base ${
                selectedSupplier.currentPayable > 0
                  ? 'text-wholesale-text'
                  : selectedSupplier.currentPayable < 0
                  ? 'text-cash-text'
                  : 'text-ink-primary'
              }`}
            >
              {formatCurrency(selectedSupplier.currentPayable)}
            </span>
          </div>
        </div>

        {/* খতিয়ান টেবিল বডি (স্ক্রলেবল) */}
        <div className="flex-1 overflow-y-auto p-3.5">
          {isLedgerLoading && ledgerEntries.length === 0 ? (
            <div className="py-16 text-center text-ink-secondary">
              <ArrowsClockwise size={24} weight="bold" className="animate-spin mx-auto mb-2 text-brand-deep" />
              <p className="text-xs">মহাজনের খতিয়ান বিবরণী লোড হচ্ছে...</p>
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="py-16 text-center text-ink-secondary">
              <p className="text-xs">কোনো লেনদেন রেকর্ড পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="border border-border-default rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border-default text-ink-body font-semibold">
                    <th className="py-2.5 px-3">তারিখ ও সময়</th>
                    <th className="py-2.5 px-3">লেনদেনের ধরন</th>
                    <th className="py-2.5 px-3">বিবরণ ও চালান নোট</th>
                    <th className="py-2.5 px-3 text-right">পরিশোধ (-)</th>
                    <th className="py-2.5 px-3 text-right">চালান ক্রয় (+)</th>
                    <th className="py-2.5 px-3.5 text-right">অবশিষ্ট দেনা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {ledgerEntries.map((entry) => {
                    const badge = getEntryLabel(entry.entryType);
                    const formattedDate = formatDateTimeBn(entry.createdAt);

                    return (
                      <tr key={entry.id} className="hover:bg-surface-subtle transition-colors">
                        {/* তারিখ */}
                        <td className="py-2 px-3 font-mono tabular-nums text-ink-secondary whitespace-nowrap text-xs">
                          {formattedDate}
                        </td>

                        {/* টাইপ */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border ${badge.badgeClass}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        {/* বিবরণ / নোট */}
                        <td className="py-2 px-3 text-ink-body max-w-[200px] truncate text-xs">
                          {entry.note || '-'}
                        </td>

                        {/* ডেবিট / দেনা হ্রাস (-) */}
                        <td className="py-2 px-3 text-right font-mono tabular-nums tracking-tight font-semibold text-cash-text">
                          {entry.debit > 0 ? `-${formatCurrency(entry.debit)}` : '-'}
                        </td>

                        {/* ক্রেডিট / চালান মাল (+) */}
                        <td className="py-2 px-3 text-right font-mono tabular-nums tracking-tight font-semibold text-wholesale-text">
                          {entry.credit > 0 ? `+${formatCurrency(entry.credit)}` : '-'}
                        </td>

                        {/* ব্যালেন্স */}
                        <td className="py-2 px-3.5 text-right font-mono tabular-nums tracking-tight font-bold text-ink-primary">
                          {formatCurrency(entry.balanceAfter)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ফুটার পেজিনেশন */}
        {ledgerMeta.totalPages > 1 && (
          <div className="px-4 py-2.5 bg-surface-subtle border-t border-border-default flex items-center justify-between text-xs text-ink-secondary shrink-0">
            <span>
              পৃষ্ঠা <strong className="text-ink-primary font-mono tabular-nums">{formatNumber(ledgerMeta.page)}</strong> /{' '}
              <span className="font-mono tabular-nums">{formatNumber(ledgerMeta.totalPages)}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fetchSupplierLedger(selectedSupplier.id, ledgerMeta.page - 1)}
                disabled={ledgerMeta.page <= 1 || isLedgerLoading}
                aria-label="আগের পৃষ্ঠা"
                className="p-1 border border-border-default rounded-md bg-surface-card hover:bg-surface-subtle disabled:opacity-40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
              >
                <CaretLeft size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => fetchSupplierLedger(selectedSupplier.id, ledgerMeta.page + 1)}
                disabled={ledgerMeta.page >= ledgerMeta.totalPages || isLedgerLoading}
                aria-label="পরের পৃষ্ঠা"
                className="p-1 border border-border-default rounded-md bg-surface-card hover:bg-surface-subtle disabled:opacity-40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
              >
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
