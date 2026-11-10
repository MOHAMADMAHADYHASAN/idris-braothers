'use client';

import React from 'react';
import {
  X,
  Printer,
  Receipt,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { motion } from 'motion/react';
import {
  formatCurrency,
  formatDateBn,
  formatNumber,
  formatTimeBn,
  toBanglaDigits,
} from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSalesStore } from '../useSalesStore';

export function SaleDetailModal() {
  const {
    isDetailOpen,
    selectedSale,
    selectedReceipt,
    isLoadingDetail,
    closeDetail,
    openReturnModal,
  } = useSalesStore();

  if (!isDetailOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-lg shadow-2xl border border-slate-200/90 overflow-hidden"
      >
        {/* টপ হেডার */}
        <div className="px-4 py-3 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
              <Receipt size={18} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-mono tabular-nums">
                  মেমো ভাউচার #{selectedSale ? toBanglaDigits(selectedSale.invoiceNumber) : ''}
                </h3>
                {selectedSale?.status === 'CANCELLED' && (
                  <Badge variant="due" className="bg-rose-50 text-rose-700 border-rose-200">
                    বাতিলকৃত মেমো
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedSale && selectedSale.status !== 'CANCELLED' && (
              <button
                onClick={() => {
                  if (!selectedSale) return;
                  const id = selectedSale.id;
                  closeDetail();
                  openReturnModal(id);
                }}
                disabled={isLoadingDetail || !selectedSale}
                className={buttonClasses({ variant: 'wholesale', size: 'sm', className: 'gap-1.5' })}
                title="এই মেমো থেকে পণ্য ফেরত নিন"
              >
                <ArrowCounterClockwise size={14} weight="bold" />
                <span className="hidden sm:inline">পণ্য ফেরত</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              disabled={isLoadingDetail || !selectedSale}
              className={buttonClasses({ variant: 'primary', size: 'sm', className: 'gap-1.5' })}
              title="রসিদ প্রিন্ট করুন"
            >
              <Printer size={15} weight="bold" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>
            <button
              onClick={closeDetail}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-[background-color,color] duration-150 cursor-pointer"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* কনটেন্ট বডি (স্ক্রলেবল) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {isLoadingDetail || !selectedSale ? (
            <div className="py-16 text-center text-slate-600 text-xs">
              মেমোর বিস্তারিত বিবরণী লোড হচ্ছে...
            </div>
          ) : (
            <>
              {/* মেমো ইনফো কার্ড */}
              <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-600 text-xs font-semibold block">
                    গ্রাহক / কাস্টমার
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                    {selectedSale.customer ? selectedSale.customer.name : 'খুচরা সাধারণ ক্রেতা'}
                  </span>
                  {selectedSale.customer?.phone && (
                    <span className="text-xs text-slate-600 font-mono tabular-nums block">
                      ফোন: {toBanglaDigits(selectedSale.customer.phone)}
                    </span>
                  )}
                  {selectedSale.customer?.address && (
                    <span className="text-xs text-slate-600 block">
                      ঠিকানা: {selectedSale.customer.address}
                    </span>
                  )}
                </div>

                <div className="sm:text-right">
                  <span className="text-slate-600 text-xs font-semibold block">
                    বিক্রয় সময় ও ধরন
                  </span>
                  <span className="font-mono tabular-nums text-slate-800 font-medium text-xs block">
                    {formatDateBn(selectedSale.createdAt, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-mono tabular-nums text-slate-600 text-xs block">
                    সময়: {formatTimeBn(selectedSale.createdAt)}
                  </span>
                  <Badge
                    variant={selectedSale.saleType === 'WHOLESALE' ? 'wholesale' : 'neutral'}
                    className="mt-1"
                  >
                    {selectedSale.saleType === 'WHOLESALE' ? 'পাইকারি বিক্রি' : 'খুচরা বিক্রি'}
                  </Badge>
                </div>
              </div>

              {/* আইটেম টেবিল */}
              <div className="border border-slate-200/90 rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-700 font-semibold">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">পণ্যের বিবরণ</th>
                      <th className="py-2 px-3">ইউনিট</th>
                      <th className="py-2 px-3 text-right">পরিমাণ</th>
                      <th className="py-2 px-3 text-right">দর (টাকা)</th>
                      <th className="py-2 px-3.5 text-right">মোট টাকা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSale.items?.map((item, idx) => {
                      const prodName =
                        item.variant?.product?.banglaName ||
                        item.variant?.product?.name ||
                        'পণ্য';
                      const variantSuffix =
                        item.variant?.variantName && item.variant.variantName !== 'Default'
                          ? ` (${item.variant.variantName})`
                          : '';

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 text-slate-600 font-mono text-xs">{formatNumber(idx + 1)}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {prodName}
                            {variantSuffix}
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant="neutral">
                              {item.unitName}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                            {formatNumber(item.quantity)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-2 px-3.5 text-right font-mono tabular-nums tracking-tight font-bold text-slate-900">
                            {formatCurrency(item.subTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* আর্থিক রিকনসিলিয়েশন বক্স */}
              <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/90 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>পণ্য উপমোট:</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(selectedSale.subTotal)}
                  </span>
                </div>

                {Number(selectedSale.discount) > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>প্রদত্ত ছাড়:</span>
                    <span className="font-mono tabular-nums font-semibold">
                      -{formatCurrency(selectedSale.discount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-xs sm:text-sm text-slate-900">
                  <span>সর্বমোট প্রদেয় বিল:</span>
                  <span className="font-mono tabular-nums tracking-tight text-sm sm:text-base text-brand-deep">
                    {formatCurrency(selectedSale.grandTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>নগদ গ্রহণ:</span>
                  <span className="font-mono tabular-nums font-bold">
                    {formatCurrency(selectedSale.paidAmount)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-xs">
                  <span className={Number(selectedSale.dueAmount) > 0 ? 'text-amber-800' : 'text-slate-700'}>
                    এই মেমোর বকেয়া:
                  </span>
                  <span className={`font-mono tabular-nums text-sm ${Number(selectedSale.dueAmount) > 0 ? 'text-amber-800' : 'text-slate-700'}`}>
                    {formatCurrency(selectedSale.dueAmount)}
                  </span>
                </div>

                {/* কাস্টমারের রানিং ব্যালেন্স হিসাব */}
                {selectedReceipt?.billing && (
                  <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>এই মেমোর পূর্বের বকেয়া:</span>
                      <span className="font-mono tabular-nums">
                        {formatCurrency(selectedReceipt.billing.previousDue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>কাস্টমারের বর্তমান মোট বকেয়া:</span>
                      <span className="font-mono tabular-nums text-amber-800">
                        {formatCurrency(selectedReceipt.billing.totalCurrentDue || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {selectedSale.note && (
                <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-xs text-slate-700">
                  <strong className="block text-slate-600 text-xs font-semibold mb-0.5">
                    মেমো নোট / মন্তব্য
                  </strong>
                  <span>{selectedSale.note}</span>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
