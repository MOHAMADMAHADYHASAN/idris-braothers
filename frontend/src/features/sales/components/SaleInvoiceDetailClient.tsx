'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Receipt,
  User,
  Phone,
  MapPin,
  CalendarBlank,
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
  WarningCircle,
  Spinner,
  ArrowSquareOut,
  Clock,
  Tag,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { SaleDetail } from '../sales.types';
import { salesService } from '../sales.service';
import { useSalesStore } from '../useSalesStore';
import { CancelSaleModal } from './CancelSaleModal';

interface SaleInvoiceDetailClientProps {
  saleId: string;
}

export function SaleInvoiceDetailClient({ saleId }: SaleInvoiceDetailClientProps) {
  const { openCancelModal, isCancelModalOpen } = useSalesStore();

  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<'A4' | 'THERMAL'>('A4');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [saleData, receiptData] = await Promise.all([
        salesService.getSaleById(saleId),
        salesService.getSaleReceipt(saleId).catch(() => null),
      ]);
      setSale(saleData);
      setReceipt(receiptData);
    } catch (err: any) {
      setError(err.message || 'মেমো বিস্তারিত লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [saleId]);

  const handlePrint = (mode: 'A4' | 'THERMAL') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner size={32} weight="bold" className="animate-spin text-slate-700" />
          <p className="text-xs font-semibold text-slate-600">মেমো বিস্তারিত লোড হচ্ছে...</p>
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
          className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          বিক্রয় তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  const isCancelled = sale.status === 'CANCELLED';
  const isFullPaid = Number(sale.dueAmount) <= 0;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 font-sans print:bg-white print:p-0 print:pb-0">
      {/* ১. টপ স্টিকি হেডার (প্রিন্টে লুকানো থাকবে) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/sales"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
              title="বিক্রয় তালিকায় ফিরে যান"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-mono">
                  #{sale.invoiceNumber}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                    sale.saleType === 'WHOLESALE'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {sale.saleType === 'WHOLESALE' ? 'পাইকারি বিক্রয়' : 'খুচরা বিক্রয়'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                    isCancelled
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isFullPaid
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {isCancelled ? 'বাতিলকৃত মেমো' : isFullPaid ? 'পরিশোধিত' : `বাকি: ${formatCurrency(sale.dueAmount)}`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                <Clock size={12} weight="bold" />
                <span>
                  {new Date(sale.createdAt).toLocaleDateString('bn-BD', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  •{' '}
                  {new Date(sale.createdAt).toLocaleTimeString('bn-BD', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* পণ্য ফেরত লিংক */}
            {!isCancelled && (
              <Link
                href={`/sales/${sale.id}/return`}
                className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="এই মেমোর পণ্য ফেরত ও রিফান্ড প্রসেস করুন"
              >
                <ArrowCounterClockwise size={14} weight="bold" />
                <span className="hidden sm:inline">পণ্য ফেরত (Return)</span>
                <span className="sm:hidden">ফেরত</span>
              </Link>
            )}

            {/* A4 প্রিন্ট */}
            <button
              type="button"
              onClick={() => handlePrint('A4')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer size={14} weight="bold" />
              <span>A4 প্রিন্ট</span>
            </button>

            {/* বাতিলকরণ বাটন */}
            {!isCancelled && (
              <button
                type="button"
                onClick={() => openCancelModal(sale)}
                className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="ভুল মেমো বাতিল করুন"
              >
                <XCircle size={14} weight="bold" />
                <span className="hidden md:inline">মেমো বাতিল</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ২. প্রিন্ট হেডার ও রসিদ ভিউ (প্রিন্টের সময় শুধুমাত্র এই অংশ বা ফরম্যাট রেন্ডার হবে) */}
      <div className="hidden print:block p-6 max-w-4xl mx-auto border-b border-slate-300 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">মেসার্স ইদ্রিস ব্রাদার্স</h2>
            <p className="text-xs text-slate-600">মরিচপট্টি, বড় বাজার, ফেনী</p>
            <p className="text-xs text-slate-500">বিক্রয় ইনভয়েস ও মেমো (Sales Memo Voucher)</p>
          </div>
          <div className="text-right">
            <h3 className="text-base font-bold text-slate-900 font-mono">#{sale.invoiceNumber}</h3>
            <p className="text-xs text-slate-600">
              তারিখ: {new Date(sale.createdAt).toLocaleDateString('bn-BD')}
            </p>
            <p className="text-xs text-slate-500">
              ধরন: {sale.saleType === 'WHOLESALE' ? 'পাইকারি' : 'খুচরা'}
            </p>
          </div>
        </div>
      </div>

      {/* ৩. মূল ক্যানভাস (Desktop 70% - 30%) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 print:p-0 print:max-w-none">
        {/* যদি মেমো বাতিল থাকে তাহলে ওয়ার্নিং ব্যানার */}
        {isCancelled && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900 print:border">
            <XCircle size={20} weight="fill" className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm">এই মেমোটি বাতিল (Void) করা হয়েছে</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                এই বিক্রয়ের পণ্যসমূহ স্বয়ংক্রিয়ভাবে ইনভেন্টরিতে ফিরিয়ে নেওয়া হয়েছে এবং ক্যাশ ও কাস্টমার লেজার ব্যালেন্স সমন্বয় করা হয়েছে।
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* বাঁয়ে: মেমোর আইটেম বিস্তারিত তালিকা (৮ কলাম / ~৭০%) */}
          <div className="lg:col-span-8 space-y-4 print:w-full">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden print:border print:shadow-none">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Receipt size={16} weight="bold" className="text-slate-500" />
                  বিক্রিত পণ্যের বিবরণ ({sale.items?.length || 0} টি আইটেম)
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  উপমোট: <strong className="text-slate-900">{formatCurrency(sale.subTotal)}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 text-center w-10">#</th>
                      <th className="py-2.5 px-3">পণ্যের নাম ও বিবরণ</th>
                      <th className="py-2.5 px-3 text-center">ইউনিট</th>
                      <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                      <th className="py-2.5 px-3 text-right">বিক্রয় দর (৳)</th>
                      <th className="py-2.5 px-3 text-right">মোট মূল্য (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sale.items?.map((item, idx) => {
                      const prodName =
                        item.variant?.product?.banglaName ||
                        item.variant?.product?.name ||
                        'পণ্য';
                      const variantSuffix =
                        item.variant?.variantName && item.variant.variantName !== 'Default'
                          ? item.variant.variantName
                          : null;

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {prodName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {variantSuffix && (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  {variantSuffix}
                                </span>
                              )}
                              {item.variant?.baseUnitName && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  বেস ইউনিট: {item.variant.baseUnitName}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                              {item.unitName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-800 text-xs sm:text-sm">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-slate-700">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-slate-900 text-xs sm:text-sm">
                            {formatCurrency(item.subTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50/90 border-t border-slate-200/90 font-bold text-slate-800 text-[11px]">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 text-right uppercase tracking-wider">
                        সর্বমোট আইটেম মূল্য:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-slate-800">
                        {sale.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right">-</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-slate-900">
                        {formatCurrency(sale.subTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* নোট / বিবরণ */}
            {sale.note && (
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                  মেমো মন্তব্য / ডেলিভারি নোট
                </span>
                <p className="text-xs text-slate-700">{sale.note}</p>
              </div>
            )}
          </div>

          {/* ডানে: কাস্টমার ও আর্থিক সারসংক্ষেপ (৪ কলাম / ~৩০% - Sticky) */}
          <div className="lg:col-span-4 space-y-4 print:hidden lg:sticky lg:top-20">
            {/* কার্ড ১: কাস্টমার প্রোফাইল */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User size={16} weight="bold" className="text-slate-500" />
                  কাস্টমার / ক্রেতা
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    sale.customer
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {sale.customer ? 'নিবন্ধিত পার্টি' : 'সাধারণ খুচরা'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {sale.customer ? sale.customer.name : 'খুচরা সাধারণ ক্রেতা'}
                  </span>
                </div>

                {sale.customer?.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone size={13} weight="bold" /> মোবাইল:
                    </span>
                    <a
                      href={`tel:${sale.customer.phone}`}
                      className="font-mono font-bold text-blue-600 hover:underline"
                    >
                      {sale.customer.phone}
                    </a>
                  </div>
                )}

                {sale.customer?.address && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 flex items-center gap-1 shrink-0">
                      <MapPin size={13} weight="bold" /> ঠিকানা:
                    </span>
                    <span className="text-slate-700 text-right font-medium truncate max-w-[180px]">
                      {sale.customer.address}
                    </span>
                  </div>
                )}

                {/* কাস্টমার খতিয়ান শর্টকাট */}
                {sale.customer && (
                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href={`/khata/customers/${sale.customer.id}`}
                      className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>কাস্টমারের পূর্ণাঙ্গ খতিয়ান দেখুন</span>
                      <ArrowSquareOut size={13} weight="bold" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* কার্ড ২: আর্থিক রিকনসিলিয়েশন সামারি */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <span className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 block">
                আর্থিক রিকনসিলিয়েশন হিসাব
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>পণ্য উপমোট (Subtotal):</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {formatCurrency(sale.subTotal)}
                  </span>
                </div>

                {Number(sale.discount) > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>প্রদত্ত মোট ছাড় (Discount):</span>
                    <span className="font-mono tabular-nums font-bold">
                      -{formatCurrency(sale.discount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span className="text-xs sm:text-sm">সর্বমোট বিল (Grand Total):</span>
                  <span className="font-mono tabular-nums tracking-tight text-sm sm:text-base font-black">
                    {formatCurrency(sale.grandTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>নগদ গ্রহণ (Cash Paid):</span>
                  <span className="font-mono tabular-nums font-bold">
                    {formatCurrency(sale.paidAmount)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                  <span
                    className={
                      Number(sale.dueAmount) > 0
                        ? 'text-rose-700'
                        : Number(sale.dueAmount) < 0
                        ? 'text-emerald-700'
                        : 'text-slate-600'
                    }
                  >
                    {Number(sale.dueAmount) < 0
                      ? 'কাস্টমারকে চেঞ্জ ফেরত (Change):'
                      : 'এই মেমোর বাকি (Due):'}
                  </span>
                  <span
                    className={`font-mono tabular-nums text-sm font-black ${
                      Number(sale.dueAmount) > 0
                        ? 'text-rose-700'
                        : Number(sale.dueAmount) < 0
                        ? 'text-emerald-700'
                        : 'text-slate-800'
                    }`}
                  >
                    {formatCurrency(Math.abs(Number(sale.dueAmount)))}
                  </span>
                </div>

                {/* কাস্টমারের বর্তমান মোট রানিং বাকি */}
                {receipt?.billing && (
                  <div className="pt-2.5 border-t border-dashed border-slate-200 space-y-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                    <div className="flex justify-between">
                      <span>পূর্বের বকেয়া:</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(receipt.billing.previousDue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>কাস্টমারের বর্তমান মোট বকেয়া:</span>
                      <span className="font-mono text-rose-700 font-black">
                        {formatCurrency(receipt.billing.totalCurrentDue || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ক্যানসেল মোডাল সংযুক্ত */}
      <CancelSaleModal />
    </div>
  );
}
