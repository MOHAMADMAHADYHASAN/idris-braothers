'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Scroll,
  Printer,
  CaretLeft,
  CaretRight,
  Phone,
  MapPin,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useCustomerKhataStore } from '../useCustomerKhataStore';
import { CustomerLedgerType } from '../customerKhata.types';

function getEntryLabel(type: CustomerLedgerType): { label: string; badgeClass: string } {
  switch (type) {
    case 'SALE':
    case 'SALE_DUE':
      return {
        label: 'পণ্য বিক্রয় (বাকি)',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      };
    case 'PAYMENT_RECEIVED':
      return {
        label: 'নগদ জমা / উশুল',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      };
    case 'OPENING_BALANCE':
      return {
        label: 'পূর্বের প্রারম্ভিক হিসাব',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80',
      };
    case 'ADJUSTMENT':
      return {
        label: 'হিসাব সমন্বয় / ছাড়',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      };
    case 'RETURN':
      return {
        label: 'পণ্য ফেরত',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
      };
    default:
      return {
        label: type,
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80',
      };
  }
}

export function CustomerLedgerDrawer() {
  const {
    activeModal,
    selectedCustomer,
    ledgerEntries,
    ledgerMeta,
    isLedgerLoading,
    closeModal,
    fetchCustomerLedger,
  } = useCustomerKhataStore();

  if (activeModal !== 'ledger' || !selectedCustomer) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white w-full max-w-4xl max-h-[92vh] flex flex-col rounded-lg shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] border border-slate-200/90 overflow-hidden"
      >
        {/* হেডার */}
        <div className="px-5 py-3.5 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <Scroll size={18} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-tight">
                  {selectedCustomer.name} — খতিয়ান বিবরণী
                </h3>
                {selectedCustomer.customerType === 'WHOLESALE' ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                    পাইকারি
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                    খুচরা
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                {selectedCustomer.phone && (
                  <span className="flex items-center gap-1 font-mono tabular-nums tracking-tight">
                    <Phone size={11} weight="bold" />
                    {selectedCustomer.phone}
                  </span>
                )}
                {selectedCustomer.address && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} weight="bold" />
                    {selectedCustomer.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-[background-color] duration-150 active:scale-[0.98]"
              title="খতিয়ান প্রিন্ট করুন"
            >
              <Printer size={15} weight="bold" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-[background-color,color] duration-150"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* ব্যালেন্স সামারি স্ট্রিপ */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between text-xs shrink-0 font-mono tabular-nums tracking-tight">
          <div className="flex items-center gap-2 text-slate-500">
            <span>সর্বমোট লেনদেন রেকর্ড:</span>
            <strong className="text-slate-900 font-bold">{ledgerMeta.total} টি</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">বর্তমান অবশিষ্ট বকেয়া:</span>
            <span
              className={`font-black text-sm sm:text-base ${
                selectedCustomer.currentDue > 0
                  ? 'text-rose-700'
                  : selectedCustomer.currentDue < 0
                  ? 'text-emerald-700'
                  : 'text-slate-700'
              }`}
            >
              {formatCurrency(selectedCustomer.currentDue)}
            </span>
          </div>
        </div>

        {/* খতিয়ান টেবিল বডি (স্ক্রলেবল) */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLedgerLoading && ledgerEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ArrowsClockwise size={24} weight="bold" className="animate-spin mx-auto mb-2 text-slate-700" />
              <p className="text-xs">খতিয়ান বিবরণী লোড হচ্ছে...</p>
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-xs">কোনো লেনদেন রেকর্ড পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="border border-slate-200/90 rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/90 text-slate-600 font-medium">
                    <th className="py-2.5 px-3">তারিখ ও সময়</th>
                    <th className="py-2.5 px-3">লেনদেনের ধরন</th>
                    <th className="py-2.5 px-3">বিবরণ / নোট</th>
                    <th className="py-2.5 px-3 text-right">বাকি (+)</th>
                    <th className="py-2.5 px-3 text-right">জমা (-)</th>
                    <th className="py-2.5 px-4 text-right">অবশিষ্ট ব্যালেন্স</th>
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
                        <td className="py-2 px-3 font-mono tabular-nums tracking-tight text-slate-600 whitespace-nowrap text-[11px]">
                          {formattedDate}
                        </td>

                        {/* টাইপ */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.badgeClass}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        {/* বিবরণ / নোট */}
                        <td className="py-2 px-3 text-slate-600 max-w-[200px] truncate text-[11px]">
                          {entry.note || '-'}
                        </td>

                        {/* ডেবিট / বাকি (+) */}
                        <td className="py-2 px-3 text-right font-mono tabular-nums tracking-tight font-semibold text-rose-700">
                          {entry.debit > 0 ? `+${formatCurrency(entry.debit)}` : '-'}
                        </td>

                        {/* ক্রেডিট / জমা (-) */}
                        <td className="py-2 px-3 text-right font-mono tabular-nums tracking-tight font-semibold text-emerald-700">
                          {entry.credit > 0 ? `-${formatCurrency(entry.credit)}` : '-'}
                        </td>

                        {/* ব্যালেন্স */}
                        <td className="py-2 px-4 text-right font-mono tabular-nums tracking-tight font-bold text-slate-900">
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
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums tracking-tight shrink-0">
            <span>
              পৃষ্ঠা <strong className="text-slate-900">{ledgerMeta.page}</strong> / {ledgerMeta.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchCustomerLedger(selectedCustomer.id, ledgerMeta.page - 1)}
                disabled={ledgerMeta.page <= 1 || isLedgerLoading}
                className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors active:scale-[0.96]"
              >
                <CaretLeft size={15} weight="bold" />
              </button>
              <button
                onClick={() => fetchCustomerLedger(selectedCustomer.id, ledgerMeta.page + 1)}
                disabled={ledgerMeta.page >= ledgerMeta.totalPages || isLedgerLoading}
                className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors active:scale-[0.96]"
              >
                <CaretRight size={15} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
