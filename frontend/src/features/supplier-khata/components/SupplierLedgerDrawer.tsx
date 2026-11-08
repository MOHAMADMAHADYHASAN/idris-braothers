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
import { formatCurrency } from '@/lib/decimal';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { SupplierLedgerType } from '../supplierKhata.types';

function getEntryLabel(type: SupplierLedgerType): { label: string; badgeClass: string } {
  switch (type) {
    case 'PURCHASE':
      return {
        label: 'চালান ক্রয় (দেনা বৃদ্ধি)',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'PAYMENT_PAID':
      return {
        label: 'নগদ দেনা পরিশোধ',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'OPENING_BALANCE':
      return {
        label: 'প্রারম্ভিক বকেয়া হিসাব',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      };
    case 'ADJUSTMENT':
      return {
        label: 'শুকতি / কমিশন সমন্বয়',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    case 'RETURN':
      return {
        label: 'ত্রুটিপূর্ণ মাল ফেরত',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    default:
      return {
        label: type,
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
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

  if (activeModal !== 'ledger' || !selectedSupplier) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* হেডার */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Scroll size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-ink-primary text-base sm:text-lg">
                  {selectedSupplier.companyName || selectedSupplier.name} — খতিয়ান বিবরণী
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                {selectedSupplier.companyName && (
                  <span className="flex items-center gap-1">
                    <Buildings size={12} weight="bold" />
                    মালিক: {selectedSupplier.name}
                  </span>
                )}
                {selectedSupplier.phone && (
                  <span className="flex items-center gap-1 font-mono tabular-nums">
                    <Phone size={12} weight="bold" />
                    {selectedSupplier.phone}
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
              onClick={handlePrint}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-ink-primary text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="খতিয়ান প্রিন্ট করুন"
            >
              <Printer size={16} weight="bold" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* ব্যালেন্স সামারি স্ট্রিপ */}
        <div className="px-5 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs sm:text-sm shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <span>সর্বমোট লেনদেন রেকর্ড:</span>
            <strong className="text-ink-primary font-mono tabular-nums">{ledgerMeta.total} টি</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">দোকানের বর্তমান দেনা:</span>
            <span
              className={`font-mono font-bold text-base tabular-nums ${
                selectedSupplier.currentPayable > 0
                  ? 'text-amber-700'
                  : selectedSupplier.currentPayable < 0
                  ? 'text-emerald-600'
                  : 'text-slate-700'
              }`}
            >
              {formatCurrency(selectedSupplier.currentPayable)}
            </span>
          </div>
        </div>

        {/* খতিয়ান টেবিল বডি (স্ক্রলেবল) */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLedgerLoading && ledgerEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ArrowsClockwise size={28} weight="bold" className="animate-spin mx-auto mb-2 text-amber-600" />
              <p className="text-xs">মহাজনের খতিয়ান বিবরণী লোড হচ্ছে...</p>
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm">কোনো লেনদেন রেকর্ড পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">তারিখ ও সময়</th>
                    <th className="py-2.5 px-3">লেনদেনের ধরন</th>
                    <th className="py-2.5 px-3">বিবরণ / চালান নোট</th>
                    <th className="py-2.5 px-3 text-right">পরিশোধ (-)</th>
                    <th className="py-2.5 px-3 text-right">চালান ক্রয় (+)</th>
                    <th className="py-2.5 px-4 text-right">অবশিষ্ট দেনা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerEntries.map((entry) => {
                    const badge = getEntryLabel(entry.entryType);
                    const formattedDate = new Date(entry.createdAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* তারিখ */}
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* টাইপ */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.badgeClass}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        {/* বিবরণ / নোট */}
                        <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate">
                          {entry.note || '-'}
                        </td>

                        {/* ডেবিট / দেনা হ্রাস (-) */}
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600 tabular-nums">
                          {entry.debit > 0 ? `-${formatCurrency(entry.debit)}` : '-'}
                        </td>

                        {/* ক্রেডিট / চালান মাল (+) */}
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-700 tabular-nums">
                          {entry.credit > 0 ? `+${formatCurrency(entry.credit)}` : '-'}
                        </td>

                        {/* ব্যালেন্স */}
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
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
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-ink-muted shrink-0">
            <span>
              পৃষ্ঠা <strong className="text-ink-primary">{ledgerMeta.page}</strong> / {ledgerMeta.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchSupplierLedger(selectedSupplier.id, ledgerMeta.page - 1)}
                disabled={ledgerMeta.page <= 1 || isLedgerLoading}
                className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <button
                onClick={() => fetchSupplierLedger(selectedSupplier.id, ledgerMeta.page + 1)}
                disabled={ledgerMeta.page >= ledgerMeta.totalPages || isLedgerLoading}
                className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
