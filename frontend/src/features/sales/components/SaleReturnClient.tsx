'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowCounterClockwise,
  Check,
  Minus,
  Plus,
  WarningCircle,
  Spinner,
  Package,
} from '@phosphor-icons/react';
import { formatCurrency, formatNumber, toBanglaDigits } from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SaleDetail } from '../sales.types';
import { salesService } from '../sales.service';
import { useSalesStore } from '../useSalesStore';

interface SaleReturnClientProps {
  saleId: string;
}

export function SaleReturnClient({ saleId }: SaleReturnClientProps) {
  const router = useRouter();
  const { fetchSales } = useSalesStore();

  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Return state
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [refundMethod, setRefundMethod] = useState<'CASH' | 'CUSTOMER_DUE_ADJUSTMENT'>('CASH');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PRESET_REASONS = [
    'পণ্য নষ্ট / প্যাকেট ছেঁড়া',
    'অতিরিক্ত কেনা মাল ফেরত',
    'ভুল আইটেম মেমোতে উঠেছিল',
    'কাস্টমারের প্রয়োজন নেই',
  ];

  useEffect(() => {
    setIsLoading(true);
    salesService
      .getSaleById(saleId)
      .then((data) => {
        setSale(data);
        const initialMap: Record<string, number> = {};
        data.items.forEach((item) => {
          initialMap[item.id] = 0;
        });
        setReturnQuantities(initialMap);

        // If customer has due, default to customer due adjustment
        if (data.customer && Number(data.dueAmount) > 0) {
          setRefundMethod('CUSTOMER_DUE_ADJUSTMENT');
        } else {
          setRefundMethod('CASH');
        }
      })
      .catch((err) => {
        setError(err.message || 'মেমোর তথ্য লোড করা যায়নি');
      })
      .finally(() => setIsLoading(false));
  }, [saleId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner size={32} weight="bold" className="animate-spin text-brand-deep" />
          <p className="text-xs font-semibold text-slate-600">মেমোর তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <WarningCircle size={40} weight="fill" className="text-rose-500 mb-2" />
        <h2 className="text-base font-bold text-slate-900">{error || 'মেমোটি খুঁজে পাওয়া যায়নি'}</h2>
        <Link
          href="/sales"
          className={buttonClasses({ variant: 'primary', size: 'sm', className: 'mt-4' })}
        >
          বিক্রয় তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  if (sale.status === 'CANCELLED') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <WarningCircle size={40} weight="fill" className="text-rose-500 mb-2" />
        <h2 className="text-base font-bold text-slate-900">এই মেমোটি ইতোমধ্যে বাতিল করা হয়েছে</h2>
        <p className="text-xs text-slate-600 mt-1">বাতিলকৃত মেমো থেকে পণ্য ফেরত নেওয়ার সুযোগ নেই।</p>
        <Link
          href={`/sales/${sale.id}`}
          className={buttonClasses({ variant: 'primary', size: 'sm', className: 'mt-4' })}
        >
          মেমো বিস্তারিত দেখুন
        </Link>
      </div>
    );
  }

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

  const calculateTotalRefund = () => {
    return sale.items.reduce((sum, item) => {
      const qty = returnQuantities[item.id] || 0;
      return sum + qty * item.unitPrice;
    }, 0);
  };

  const calculateTotalReturnItems = () => {
    return Object.values(returnQuantities).reduce((sum, q) => sum + q, 0);
  };

  const totalRefund = calculateTotalRefund();
  const totalReturnCount = calculateTotalReturnItems();
  const hasItemsToReturn = totalRefund > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasItemsToReturn || isSubmitting) return;

    const payloadItems = Object.entries(returnQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([saleItemId, returnQuantity]) => ({
        saleItemId,
        returnQuantity,
      }));

    setIsSubmitting(true);
    try {
      await salesService.returnSale(sale.id, {
        items: payloadItems,
        refundMethod,
        reason: reason.trim() || undefined,
      });

      await fetchSales();
      alert(`${formatCurrency(totalRefund)} সফলভাবে পণ্য ফেরত ও স্টক সমন্বয় সম্পন্ন হয়েছে!`);
      router.push(`/sales/${sale.id}`);
    } catch (err: any) {
      alert(err.message || 'পণ্য ফেরত সম্পন্ন করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 font-sans">
      {/* ১. টপ স্টিকি হেডার */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/sales/${sale.id}`}
              className="p-2 rounded-lg text-slate-600 hover:text-brand-deep hover:bg-brand-soft/60 border border-slate-200 transition-colors shrink-0"
              title="মেমোতে ফিরে যান"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <ArrowCounterClockwise size={18} weight="bold" className="text-amber-600" />
                  <span>পণ্য ফেরত ও স্টক রিস্টকিং</span>
                </h1>
                <Badge variant="neutral" className="font-mono tabular-nums font-bold">
                  মেমো #{toBanglaDigits(sale.invoiceNumber)}
                </Badge>
                {sale.customer && (
                  <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                    ({sale.customer.name})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasItemsToReturn || isSubmitting}
              className={buttonClasses({ variant: 'wholesale', size: 'sm', className: 'gap-1.5' })}
            >
              {isSubmitting ? (
                <>
                  <Spinner size={15} weight="bold" className="animate-spin" />
                  <span>প্রসেসিং...</span>
                </>
              ) : (
                <>
                  <Check size={15} weight="bold" />
                  <span>ফেরত নিশ্চিত করুন ({formatCurrency(totalRefund)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ২. মূল ক্যানভাস (Desktop 66% - 33%) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* বাঁয়ে: রিটার্ন আইটেম ম্যাট্রিক্স টেবিল (৮ কলাম / ~৬৬%) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Package size={16} weight="bold" className="text-brand-deep" />
                    ফেরতযোগ্য পণ্যের তালিকা ও পরিমাণ নির্ধারণ
                  </h3>
                </div>
                {totalReturnCount > 0 && (
                  <Badge variant="wholesale">
                    {formatNumber(totalReturnCount)} টি পণ্য নির্বাচিত
                  </Badge>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-700 font-bold text-xs">
                      <th className="py-2.5 px-3">পণ্যের বিবরণ</th>
                      <th className="py-2.5 px-3 text-center">বিক্রিত সংখ্যা</th>
                      <th className="py-2.5 px-3 text-right">বিক্রয় দর (৳)</th>
                      <th className="py-2.5 px-3 text-center w-40">ফেরতের পরিমাণ</th>
                      <th className="py-2.5 px-3 text-right">ফেরত মূল্য (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sale.items.map((item) => {
                      const returnQty = returnQuantities[item.id] || 0;
                      const lineRefund = returnQty * item.unitPrice;
                      const isMax = returnQty === item.quantity;

                      const prodName =
                        item.variant?.product?.banglaName ||
                        item.variant?.product?.name ||
                        'পণ্য';
                      const variantSuffix =
                        item.variant?.variantName && item.variant.variantName !== 'Default'
                          ? item.variant.variantName
                          : null;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            returnQty > 0 ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {prodName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {variantSuffix && (
                                <Badge variant="brand">
                                  {variantSuffix}
                                </Badge>
                              )}
                              <span className="text-xs text-slate-600 font-mono">
                                ইউনিট: {item.unitName}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold text-slate-800">
                            {formatNumber(item.quantity)} {item.unitName}
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 font-medium">
                            {formatCurrency(item.unitPrice)}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity, returnQty - 1)
                                }
                                disabled={returnQty <= 0}
                                className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] cursor-pointer"
                              >
                                <Minus size={12} weight="bold" />
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
                                className="w-16 h-7 text-center font-mono tabular-nums font-bold text-xs rounded border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity, returnQty + 1)
                                }
                                disabled={returnQty >= item.quantity}
                                className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] cursor-pointer"
                              >
                                <Plus size={12} weight="bold" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSetFullReturn(item.id, item.quantity)}
                                className={`px-2 py-1 rounded text-xs font-bold border cursor-pointer active:scale-[0.98] ${
                                  isMax
                                    ? 'bg-amber-600 text-white border-amber-600'
                                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                }`}
                                title="সম্পূর্ণ ফেরত"
                              >
                                সব
                              </button>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-slate-900 text-xs sm:text-sm">
                            {formatCurrency(lineRefund)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {hasItemsToReturn && (
                    <tfoot className="bg-slate-50/90 border-t border-slate-200/90 font-bold text-slate-800 text-xs">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-right">
                          সর্বমোট রিফান্ড অংক:
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums text-amber-800 font-black">
                          {formatNumber(totalReturnCount)} টি আইটেম
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-800 font-black text-xs sm:text-sm">
                          {formatCurrency(totalRefund)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>

          {/* ডানে: রিফান্ড পদ্ধতি, কারণ ও কনফার্মেশন (৪ কলাম / ~৩৪% - Sticky) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
            {/* কার্ড ১: কাস্টমার ও মেমোর তথ্য */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
              <span className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 block">
                মূল বিক্রয় মেমো প্রসঙ্গ
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">গ্রাহক:</span>
                  <span className="font-bold text-slate-900">
                    {sale.customer ? sale.customer.name : 'খুচরা সাধারণ ক্রেতা'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">মেমো মূল্য:</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {formatCurrency(sale.grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {Number(sale.dueAmount) < 0 ? 'চেঞ্জ ফেরত:' : 'মেমোর বকেয়া:'}
                  </span>
                  <span
                    className={`font-mono tabular-nums font-bold ${
                      Number(sale.dueAmount) > 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {Number(sale.dueAmount) < 0
                      ? formatCurrency(Math.abs(Number(sale.dueAmount)))
                      : formatCurrency(sale.dueAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* কার্ড ২: রিফান্ড পদ্ধতি নির্বাচন */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                রিফান্ড ও মূল্য সমন্বয় পদ্ধতি <span className="text-rose-600">*</span>
              </label>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setRefundMethod('CASH')}
                  className={`w-full p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-2.5 ${
                    refundMethod === 'CASH'
                      ? 'border-brand-deep bg-brand-soft/60 text-slate-900 ring-1 ring-brand-deep'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      refundMethod === 'CASH'
                        ? 'border-brand-deep bg-brand-deep text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {refundMethod === 'CASH' && <Check size={10} weight="bold" />}
                  </div>
                  <span className="font-bold text-xs text-slate-900">
                    নগদ রিফান্ড
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!sale.customer}
                  onClick={() => setRefundMethod('CUSTOMER_DUE_ADJUSTMENT')}
                  className={`w-full p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-2.5 disabled:opacity-40 disabled:pointer-events-none ${
                    refundMethod === 'CUSTOMER_DUE_ADJUSTMENT'
                      ? 'border-brand-deep bg-brand-soft/60 text-slate-900 ring-1 ring-brand-deep'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      refundMethod === 'CUSTOMER_DUE_ADJUSTMENT'
                        ? 'border-brand-deep bg-brand-deep text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {refundMethod === 'CUSTOMER_DUE_ADJUSTMENT' && (
                      <Check size={10} weight="bold" />
                    )}
                  </div>
                  <span className="font-bold text-xs text-slate-900">
                    বকেয়া খাতা সমন্বয়
                  </span>
                </button>
              </div>
            </div>

            {/* কার্ড ৩: ফেরতের কারণ */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
              <label className="text-xs font-bold text-slate-800 block">
                ফেরতের সুনির্দিষ্ট কারণ
              </label>

              <div className="flex flex-wrap gap-1.5 pb-1">
                {PRESET_REASONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setReason(p)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer active:scale-[0.98] transition-colors ${
                      reason === p
                        ? 'bg-brand-deep text-white border-brand-deep'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                placeholder="ফেরতের কারণ (ঐচ্ছিক)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
              />
            </div>

            {/* কার্ড ৪: কনফার্মেশন ও সামারি */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 font-medium">মোট রিফান্ড পরিশোধ:</span>
                <span className="font-mono tabular-nums text-xl font-black text-brand-deep">
                  {formatCurrency(totalRefund)}
                </span>
              </div>

              <button
                type="submit"
                disabled={!hasItemsToReturn || isSubmitting}
                className={buttonClasses({ variant: 'wholesale', size: 'md', className: 'w-full gap-1.5' })}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size={15} weight="bold" className="animate-spin" />
                    <span>ফেরত প্রসেসিং হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <ArrowCounterClockwise size={15} weight="bold" />
                    <span>ফেরত ও স্টক সমন্বয় নিশ্চিত করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
