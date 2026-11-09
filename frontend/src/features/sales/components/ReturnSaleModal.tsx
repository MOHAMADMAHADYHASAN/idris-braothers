'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowCounterClockwise,
  X,
  Warning,
  Money,
  Receipt,
  Check,
  Minus,
  Plus,
} from '@phosphor-icons/react';
import { useSalesStore } from '../useSalesStore';
import { formatCurrency } from '@/lib/decimal';

export function ReturnSaleModal() {
  const {
    isReturnModalOpen,
    saleToReturn,
    isLoadingReturnSale,
    isSubmittingReturn,
    closeReturnModal,
    processReturn,
  } = useSalesStore();

  // Map of saleItemId -> returnQuantity (as string for smooth input)
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [refundMethod, setRefundMethod] = useState<'CASH' | 'CUSTOMER_DUE_ADJUSTMENT'>('CASH');
  const [reason, setReason] = useState<string>('');

  // Preset reasons for quick retail counter tapping
  const PRESET_REASONS = [
    'পণ্য নষ্ট / প্যাকেট ছেঁড়া',
    'অতিরিক্ত কেনা মাল ফেরত',
    'ভুল আইটেম মেমোতে উঠেছিল',
    'কাস্টমারের প্রয়োজন নেই',
  ];

  // Initialize return quantities when saleToReturn loads
  useEffect(() => {
    if (saleToReturn) {
      const initialMap: Record<string, number> = {};
      saleToReturn.items.forEach((item) => {
        initialMap[item.id] = 0; // Default 0 to return
      });
      setReturnQuantities(initialMap);
      // If customer has due, default to customer due adjustment
      if (saleToReturn.customer && saleToReturn.dueAmount > 0) {
        setRefundMethod('CUSTOMER_DUE_ADJUSTMENT');
      } else {
        setRefundMethod('CASH');
      }
      setReason('');
    }
  }, [saleToReturn]);

  if (!isReturnModalOpen) return null;

  const handleQuantityChange = (itemId: string, maxQty: number, value: number) => {
    const clamped = Math.max(0, Math.min(maxQty, value));
    setReturnQuantities((prev) => ({
      ...prev,
      [itemId]: clamped,
    }));
  };

  const handleSetFullReturn = (itemId: string, maxQty: number) => {
    setReturnQuantities((prev) => ({
      ...prev,
      [itemId]: maxQty,
    }));
  };

  const handleSetZero = (itemId: string) => {
    setReturnQuantities((prev) => ({
      ...prev,
      [itemId]: 0,
    }));
  };

  // Compute live total refund amount
  const calculateTotalRefund = () => {
    if (!saleToReturn) return 0;
    return saleToReturn.items.reduce((sum, item) => {
      const qty = returnQuantities[item.id] || 0;
      return sum + qty * item.unitPrice;
    }, 0);
  };

  const totalRefund = calculateTotalRefund();
  const hasItemsToReturn = totalRefund > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleToReturn || !hasItemsToReturn) return;

    const payloadItems = Object.entries(returnQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([saleItemId, returnQuantity]) => ({
        saleItemId,
        returnQuantity,
      }));

    await processReturn({
      items: payloadItems,
      refundMethod,
      reason: reason.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white rounded-lg border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.12)] max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* 1. Modal Header */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-200/90 text-amber-700 flex items-center justify-center shrink-0">
              <ArrowCounterClockwise size={18} weight="bold" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <span>পণ্য ফেরত ও রিফান্ড (Sales Return)</span>
                {saleToReturn && (
                  <span className="font-mono tabular-nums text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-800">
                    #{saleToReturn.invoiceNumber}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500 tracking-tight">
                ফেরতকৃত পণ্য স্বয়ংক্রিয়ভাবে ইনভেন্টরি স্টকে যুক্ত হবে এবং খাতা বা ক্যাশ সমন্বয় হবে
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeReturnModal}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* 2. Loading State */}
        {isLoadingReturnSale || !saleToReturn ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            মেমোর তথ্য লোড হচ্ছে...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Invoice Info Strip */}
            <div className="p-2.5 rounded-md border border-slate-200/90 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium">কাস্টমার: </span>
                <span className="font-semibold text-slate-900">
                  {saleToReturn.customer?.name || 'খুচরা ক্রেতা (সাধারণ)'}
                </span>
                {saleToReturn.customer?.phone && (
                  <span className="text-slate-500 font-mono ml-1.5">
                    ({saleToReturn.customer.phone})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <span className="text-slate-500 font-medium">বিক্রয় ধরন: </span>
                  <span className="font-semibold text-slate-900">
                    {saleToReturn.saleType === 'WHOLESALE' ? 'পাইকারি' : 'খুচরা'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">মেমোর বাকি: </span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {formatCurrency(saleToReturn.dueAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Return Table */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                ফেরতের জন্য পণ্যের পরিমাণ নির্ধারণ করুন:
              </label>

              <div className="border border-slate-200/90 rounded-md overflow-hidden bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3 py-2 text-left">পণ্য বিবরণ</th>
                      <th className="px-3 py-2 text-center">বিক্রিত পরিমাণ</th>
                      <th className="px-3 py-2 text-right">দর (টাকা)</th>
                      <th className="px-3 py-2 text-center w-36">ফেরতের সংখ্যা</th>
                      <th className="px-3 py-2 text-right">ফেরত মূল্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {saleToReturn.items.map((item) => {
                      const returnQty = returnQuantities[item.id] || 0;
                      const lineRefund = returnQty * item.unitPrice;
                      const isMax = returnQty === item.quantity;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            returnQty > 0 ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-slate-900">
                              {item.variant?.product.banglaName ||
                                item.variant?.product.name ||
                                'পণ্য'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              ইউনিট: {item.unitName}
                            </div>
                          </td>

                          <td className="px-3 py-2.5 text-center font-mono tabular-nums text-slate-700">
                            {item.quantity} {item.unitName}
                          </td>

                          <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-700">
                            ৳{item.unitPrice.toLocaleString('en-BD')}
                          </td>

                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity, returnQty - 1)
                                }
                                disabled={returnQty <= 0}
                                className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] cursor-pointer"
                              >
                                <Minus size={11} weight="bold" />
                              </button>

                              <input
                                type="number"
                                min={0}
                                max={item.quantity}
                                step="any"
                                value={returnQty}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-16 h-7 text-center font-mono tabular-nums font-bold text-xs rounded border border-slate-300 focus:outline-hidden focus:border-slate-800"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity, returnQty + 1)
                                }
                                disabled={returnQty >= item.quantity}
                                className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] cursor-pointer"
                              >
                                <Plus size={11} weight="bold" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSetFullReturn(item.id, item.quantity)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border cursor-pointer active:scale-[0.98] ${
                                  isMax
                                    ? 'bg-amber-600 text-white border-amber-600'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                                title="সম্পূর্ণ ফেরত"
                              >
                                সব
                              </button>
                            </div>
                          </td>

                          <td className="px-3 py-2.5 text-right font-mono tabular-nums font-bold text-slate-900">
                            ৳{lineRefund.toLocaleString('en-BD')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Refund Banner */}
            <div className="p-3 rounded-md border border-slate-200/90 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 font-medium block">
                  মোট ফেরত টাকা (Refund Total):
                </span>
                <span className="text-[11px] text-slate-500">
                  নির্বাচিত আইটেমসমূহের মোট মূল্য
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono tabular-nums tracking-tight font-black text-lg text-slate-900">
                  ৳{totalRefund.toLocaleString('en-BD')}
                </span>
              </div>
            </div>

            {/* Refund Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                টাকা পরিশোধ / রিফান্ড পদ্ধতি:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRefundMethod('CASH')}
                  className={`p-3 rounded-md border text-left transition-[background-color,border-color] duration-150 active:scale-[0.98] cursor-pointer flex items-start gap-2.5 ${
                    refundMethod === 'CASH'
                      ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 ring-1 ring-emerald-600'
                      : 'border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      refundMethod === 'CASH'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {refundMethod === 'CASH' && <Check size={10} weight="bold" />}
                  </div>
                  <div>
                    <span className="font-semibold text-xs block text-slate-900">
                      নগদ রিফান্ড (Cash Payout)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      দোকানের ক্যাশ ড্রয়ার থেকে সরাসরি ক্রেতাকে নগদ ফেরত
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!saleToReturn.customer}
                  onClick={() => setRefundMethod('CUSTOMER_DUE_ADJUSTMENT')}
                  className={`p-3 rounded-md border text-left transition-[background-color,border-color] duration-150 active:scale-[0.98] cursor-pointer flex items-start gap-2.5 disabled:opacity-40 disabled:pointer-events-none ${
                    refundMethod === 'CUSTOMER_DUE_ADJUSTMENT'
                      ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 ring-1 ring-emerald-600'
                      : 'border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      refundMethod === 'CUSTOMER_DUE_ADJUSTMENT'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {refundMethod === 'CUSTOMER_DUE_ADJUSTMENT' && (
                      <Check size={10} weight="bold" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs block text-slate-900">
                      বকেয়া খাতা সমন্বয় (Ledger Due Credit)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      কাস্টমারের বর্তমান বকেয়া থেকে স্বয়ংক্রিয়ভাবে বাদ যাবে
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Return Reason Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                ফেরতের কারণ ও বিবরণ:
              </label>

              <div className="flex flex-wrap gap-1.5 pb-1">
                {PRESET_REASONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setReason(p)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border cursor-pointer active:scale-[0.98] ${
                      reason === p
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="ফেরতের কারণ লিখুন (ঐচ্ছিক)"
                className="w-full h-8.5 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-200/90 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeReturnModal}
                disabled={isSubmittingReturn}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-[background-color,border-color] duration-150 active:scale-[0.98] cursor-pointer"
              >
                বাতিল করুন
              </button>

              <button
                type="submit"
                disabled={!hasItemsToReturn || isSubmittingReturn}
                className="px-4 py-1.5 rounded-md bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-[background-color,transform] duration-150 flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] cursor-pointer"
              >
                <ArrowCounterClockwise size={14} weight="bold" />
                <span>
                  {isSubmittingReturn
                    ? 'ফেরত প্রসেসিং হচ্ছে...'
                    : `ফেরত নিশ্চিত করুন (৳${totalRefund.toLocaleString('en-BD')})`}
                </span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
