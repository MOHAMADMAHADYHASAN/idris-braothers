'use client';

import React from 'react';
import {
  X,
  Printer,
  Receipt,
  User,
  Phone,
  CalendarBlank,
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/lib/decimal';
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
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
              <Receipt size={18} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  মেমো ভাউচার #{selectedSale?.invoiceNumber}
                </h3>
                {selectedSale?.status === 'CANCELLED' && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    বাতিলকৃত মেমো
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                ইদ্রিস ব্রাদার্স • মরিচপট্টি, ফেনী বড় বাজার
              </p>
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
                className="px-2.5 py-1.5 border border-amber-200/90 bg-amber-50/70 hover:bg-amber-100/80 active:scale-[0.98] text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 disabled:opacity-50 cursor-pointer rounded-md"
                title="এই মেমো থেকে পণ্য ফেরত নিন"
              >
                <ArrowCounterClockwise size={14} weight="bold" />
                <span className="hidden sm:inline">পণ্য ফেরত</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              disabled={isLoadingDetail || !selectedSale}
              className="px-2.5 py-1.5 border border-slate-200/90 rounded-md hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 disabled:opacity-50"
              title="রসিদ প্রিন্ট করুন"
            >
              <Printer size={15} weight="bold" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>
            <button
              onClick={closeDetail}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-[background-color,color] duration-150"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* কনটেন্ট বডি (স্ক্রলেবল) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {isLoadingDetail || !selectedSale ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              মেমোর বিস্তারিত বিবরণী লোড হচ্ছে...
            </div>
          ) : (
            <>
              {/* মেমো ইনফো কার্ড */}
              <div className="bg-slate-50/80 p-3 rounded-md border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    গ্রাহক / কাস্টমার
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                    {selectedSale.customer ? selectedSale.customer.name : 'খুচরা সাধারণ ক্রেতা'}
                  </span>
                  {selectedSale.customer?.phone && (
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums block">
                      ফোন: {selectedSale.customer.phone}
                    </span>
                  )}
                  {selectedSale.customer?.address && (
                    <span className="text-[11px] text-slate-500 block">
                      ঠিকানা: {selectedSale.customer.address}
                    </span>
                  )}
                </div>

                <div className="sm:text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    বিক্রয় সময় ও ধরন
                  </span>
                  <span className="font-mono tabular-nums text-slate-700 text-xs block">
                    {new Date(selectedSale.createdAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-mono tabular-nums text-slate-500 text-[11px] block">
                    সময়: {new Date(selectedSale.createdAt).toLocaleTimeString('bn-BD')}
                  </span>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/70 text-slate-700 border border-slate-300/80">
                    {selectedSale.saleType === 'WHOLESALE' ? 'পাইকারি বিক্রি' : 'খুচরা বিক্রি'}
                  </span>
                </div>
              </div>

              {/* আইটেম টেবিল */}
              <div className="border border-slate-200/90 rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-medium">
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
                          <td className="py-2 px-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {prodName}
                            {variantSuffix}
                          </td>
                          <td className="py-2 px-3">
                            <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 border border-slate-200/80">
                              {item.unitName}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">
                            {item.quantity}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                            ৳{formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-2 px-3.5 text-right font-mono tabular-nums tracking-tight font-bold text-slate-900">
                            ৳{formatCurrency(item.subTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* আর্থিক রিকনসিলিয়েশন বক্স */}
              <div className="bg-slate-50/80 p-3.5 rounded-md border border-slate-200/90 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>পণ্য উপমোট (Subtotal):</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    ৳{formatCurrency(selectedSale.subTotal)}
                  </span>
                </div>

                {Number(selectedSale.discount) > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>প্রদত্ত ছাড় (Discount):</span>
                    <span className="font-mono tabular-nums font-semibold">
                      -৳{formatCurrency(selectedSale.discount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-xs sm:text-sm text-slate-900">
                  <span>সর্বমোট প্রদেয় বিল (Grand Total):</span>
                  <span className="font-mono tabular-nums tracking-tight text-sm sm:text-base">
                    ৳{formatCurrency(selectedSale.grandTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>নগদ গ্রহণ (Cash Paid):</span>
                  <span className="font-mono tabular-nums font-bold">
                    ৳{formatCurrency(selectedSale.paidAmount)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-xs">
                  <span className={Number(selectedSale.dueAmount) > 0 ? 'text-amber-800' : 'text-slate-600'}>
                    এই মেমোর বকেয়া (Due on Invoice):
                  </span>
                  <span className={`font-mono tabular-nums text-sm ${Number(selectedSale.dueAmount) > 0 ? 'text-amber-800' : 'text-slate-700'}`}>
                    ৳{formatCurrency(selectedSale.dueAmount)}
                  </span>
                </div>

                {/* কাস্টমারের রানিং ব্যালেন্স হিসাব */}
                {selectedReceipt?.billing && (
                  <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px] text-slate-500">
                    <div className="flex justify-between">
                      <span>এই মেমোর পূর্বের বকেয়া:</span>
                      <span className="font-mono tabular-nums">
                        ৳{formatCurrency(selectedReceipt.billing.previousDue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>কাস্টমারের বর্তমান মোট বকেয়া:</span>
                      <span className="font-mono tabular-nums text-amber-800">
                        ৳{formatCurrency(selectedReceipt.billing.totalCurrentDue || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {selectedSale.note && (
                <div className="p-2.5 bg-slate-50/80 rounded-md border border-slate-200/80 text-xs text-slate-600">
                  <strong className="block text-slate-400 text-[10px] uppercase font-semibold">
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
