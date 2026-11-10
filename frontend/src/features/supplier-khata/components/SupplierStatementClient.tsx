'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Storefront,
  Phone,
  MapPin,
  CheckCircle,
  WarningCircle,
  HandCoins,
  Spinner,
  CaretDown,
  CaretUp,
  Percent,
  Buildings,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import {
  formatCurrency,
  formatDateBn,
  formatNumber,
  formatTimeBn,
  toBanglaDigits,
} from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Supplier } from '../supplierKhata.types';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { AdminPagination } from '@/components/shared/AdminPagination';

interface SupplierStatementClientProps {
  supplierId: string;
}

export function SupplierStatementClient({ supplierId }: SupplierStatementClientProps) {
  const {
    fetchSupplierById,
    fetchSupplierLedger,
    selectedSupplier,
    ledgerEntries,
    ledgerMeta,
    isLedgerLoading,
    submitPayment,
    submitAdjustment,
  } = useSupplierKhataStore();

  const [supplier, setSupplier] = useState<Supplier | null>(
    selectedSupplier?.id === supplierId ? selectedSupplier : null
  );
  const [isLoading, setIsLoading] = useState(!supplier);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Fast Payment State
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Fast Adjustment State (Collapsible)
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjType, setAdjType] = useState<'DISCOUNT' | 'ADD_CHARGE'>('DISCOUNT');
  const [adjReason, setAdjReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchSupplierById(supplierId)
      .then((s) => {
        if (s) setSupplier(s);
      })
      .finally(() => setIsLoading(false));

    fetchSupplierLedger(supplierId, 1);
  }, [supplierId, fetchSupplierById, fetchSupplierLedger]);

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    fetchSupplierLedger(supplierId, p);
  };

  const handlePrint = () => {
    window.print();
  };

  // Submit Fast Payment
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      setPayError('পরিশোধের পরিমাণ ০ এর বেশি হতে হবে');
      return;
    }

    setIsPaying(true);
    setPayError(null);
    try {
      const res = await submitPayment(supplierId, {
        amount,
        note: payNote.trim() || undefined,
      });
      setSupplier(res.supplier);
      setPayAmount('');
      setPayNote('');
      fetchSupplierLedger(supplierId, 1);
      alert(`${formatCurrency(amount)} সফলভাবে পরিশোধ হয়েছে এবং খাতা আপডেট হয়েছে!`);
    } catch (err: any) {
      setPayError(err.message || 'পরিশোধ করতে সমস্যা হয়েছে');
    } finally {
      setIsPaying(false);
    }
  };

  // Submit Adjustment
  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFloat(adjAmount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      alert('সমন্বয় পরিমাণ ০ এর বেশি হতে হবে');
      return;
    }
    if (!adjReason.trim()) {
      alert('সমন্বয়ের কারণ উল্লেখ করা বাধ্যতামূলক');
      return;
    }

    // DISCOUNT/Waiver reduces debt -> negative amount
    // ADD_CHARGE increases debt -> positive amount
    const amount = adjType === 'DISCOUNT' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    setIsAdjusting(true);
    try {
      const res = await submitAdjustment(supplierId, {
        amount,
        reason: adjReason.trim(),
      });
      setSupplier(res.supplier);
      setAdjAmount('');
      setAdjReason('');
      setShowAdjustment(false);
      fetchSupplierLedger(supplierId, 1);
      alert('হিসাব সমন্বয় সফলভাবে সম্পন্ন হয়েছে!');
    } catch (err: any) {
      alert(err.message || 'সমন্বয় করতে ব্যর্থ হয়েছে');
    } finally {
      setIsAdjusting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner size={32} weight="bold" className="animate-spin text-brand-deep" />
          <p className="text-xs font-semibold text-slate-600">মহাজন স্টেটমেন্ট লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <WarningCircle size={40} weight="fill" className="text-rose-500 mb-2" />
        <h2 className="text-base font-bold text-slate-900">মহাজনটি খুঁজে পাওয়া যায়নি</h2>
        <Link
          href="/khata/suppliers"
          className={buttonClasses({ variant: 'primary', size: 'sm', className: 'mt-4' })}
        >
          মহাজন তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  // Filter ledger entries locally if filterType !== 'ALL'
  const filteredEntries = ledgerEntries.filter((e) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'DEBIT') return e.debit > 0;
    if (filterType === 'CREDIT') return e.credit > 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 font-sans print:bg-white print:pb-0">
      {/* ১. টপ স্টিকি হেডার (প্রিন্টে লুকানো থাকবে) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/khata/suppliers"
              className="p-2 rounded-lg text-slate-600 hover:text-brand-deep hover:bg-brand-soft/60 border border-slate-200 transition-colors shrink-0"
              title="মহাজন তালিকায় ফিরে যান"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  {supplier.companyName || supplier.name}
                </h1>
                {supplier.companyName && (
                  <span className="text-xs text-slate-600 font-medium truncate hidden sm:inline">
                    ({supplier.name})
                  </span>
                )}
                <Badge
                  variant={
                    supplier.currentPayable > 0
                      ? 'due'
                      : supplier.currentPayable < 0
                        ? 'cash'
                        : 'neutral'
                  }
                  className={
                    supplier.currentPayable > 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : undefined
                  }
                >
                  {supplier.currentPayable > 0
                    ? `পাওনা: ${formatCurrency(supplier.currentPayable)}`
                    : supplier.currentPayable < 0
                    ? `অগ্রিম জমা: ${formatCurrency(Math.abs(supplier.currentPayable))}`
                    : 'পরিশোধিত (০ বাকি)'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 truncate mt-0.5 font-mono tabular-nums">
                {supplier.phone ? `ফোন: ${toBanglaDigits(supplier.phone)}` : ''}{' '}
                {supplier.address ? `• মোকাম: ${supplier.address}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className={buttonClasses({ variant: 'primary', size: 'sm', className: 'gap-1.5' })}
            >
              <Printer size={15} weight="bold" />
              <span>স্টেটমেন্ট প্রিন্ট</span>
            </button>
          </div>
        </div>
      </header>

      {/* ২. মূল লেজার ক্যানভাস (Desktop 70% - 30%) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 print:p-0 print:max-w-none">
        {/* প্রিন্ট হেডার */}
        <div className="hidden print:block border-b border-slate-300 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">মেসার্স ইদ্রিস ব্রাদার্স</h2>
              <p className="text-xs text-slate-600">মরিচপট্টি, ফেনী বাজার, ফেনী</p>
              <p className="text-xs text-slate-600">মহাজন খতিয়ান ও হিসাব বিবরণী</p>
            </div>
            <div className="text-right">
              <h3 className="text-base font-bold text-slate-900">
                {supplier.companyName || supplier.name}
              </h3>
              {supplier.companyName && (
                <p className="text-xs text-slate-600 font-medium">প্রোঃ {supplier.name}</p>
              )}
              <p className="text-xs text-slate-600 font-mono">
                {supplier.phone ? toBanglaDigits(supplier.phone) : ''}
              </p>
              <p className="text-xs text-slate-600">মোকাম: {supplier.address || ''}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* বাঁয়ে: খতিয়ান স্টেটমেন্ট টেবিল ও ফিল্টার (৮ কলাম / ~৭০%) */}
          <div className="lg:col-span-8 space-y-4 print:w-full">
            {/* ফিল্টার টুলবার */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between flex-wrap gap-2 print:hidden">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'ALL'
                      ? 'bg-brand-deep text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  সব লেনদেন
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('CREDIT')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'CREDIT'
                      ? 'bg-brand-deep text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  চালান মাল ক্রয়
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('DEBIT')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'DEBIT'
                      ? 'bg-brand-deep text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  মহাজনকে পরিশোধ
                </button>
              </div>

              <div className="text-xs text-slate-600">
                মোট রেকর্ড:{' '}
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {formatNumber(ledgerMeta.total)} টি
                </span>
              </div>
            </div>

            {/* স্টেটমেন্ট ডাটা টেবিল */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden print:border print:shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-700 font-bold text-xs">
                      <th className="py-2.5 px-3">তারিখ ও সময়</th>
                      <th className="py-2.5 px-3">চালান / ভাউচার নং</th>
                      <th className="py-2.5 px-3">লেনদেনের ধরন ও বিবরণ</th>
                      <th className="py-2.5 px-3 text-right">মহাজনকে পরিশোধ (৳)</th>
                      <th className="py-2.5 px-3 text-right">চালান ক্রয় / দেনা (৳)</th>
                      <th className="py-2.5 px-3 text-right">রানিং দেনা (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLedgerLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-600">
                          <Spinner size={24} weight="bold" className="animate-spin inline mr-2 text-brand-deep" />
                          খতিয়ান বিবরণী লোড হচ্ছে...
                        </td>
                      </tr>
                    ) : filteredEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-600">
                          কোনো লেনদেন রেকর্ড পাওয়া যায়নি
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.map((entry) => {
                        const isPurchase =
                          entry.entryType === 'PURCHASE' || entry.entryType === 'PURCHASE_DUE';
                        const isPayment = entry.entryType === 'PAYMENT_PAID';
                        const isAdjustment = entry.entryType === 'ADJUSTMENT';
                        const isOpening = entry.entryType === 'OPENING_BALANCE';
                        const isReturn = entry.entryType === 'RETURN';

                        return (
                          <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                            {/* তারিখ */}
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono tabular-nums text-xs text-slate-700">
                              {formatDateBn(entry.createdAt, {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                              <span className="text-xs text-slate-600 block">
                                {formatTimeBn(entry.createdAt)}
                              </span>
                            </td>

                            {/* চালান / ভাউচার */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {entry.purchaseId ? (
                                <Link
                                  href={`/purchases/${entry.purchaseId}`}
                                  className="inline-flex items-center gap-1 font-mono font-bold text-brand-deep hover:underline"
                                  title="চালান বিস্তারিত দেখুন"
                                >
                                  <span>চালান #{toBanglaDigits(entry.purchaseId.slice(-6).toUpperCase())}</span>
                                  <ArrowSquareOut size={12} weight="bold" />
                                </Link>
                              ) : (
                                <span className="text-slate-500 font-mono">-</span>
                              )}
                            </td>

                            {/* ধরন ও নোট */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                                    isPurchase
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : isPayment
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : isReturn
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : isAdjustment
                                      ? 'bg-brand-soft text-brand-deep border-brand-light'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {isPurchase
                                    ? 'চালান ক্রয় (+)'
                                    : isPayment
                                    ? 'নগদ পরিশোধ (-)'
                                    : isReturn
                                    ? 'মাল ফেরত (-)'
                                    : isAdjustment
                                    ? 'হিসাব সমন্বয়'
                                    : isOpening
                                    ? 'পূর্ববর্তী বকেয়া'
                                    : entry.entryType}
                                </span>
                                {entry.note && (
                                  <span className="text-slate-600 text-xs truncate max-w-[200px]">
                                    {entry.note}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* মহাজনকে পরিশোধ (ডেবিট - দেনা হ্রাস) */}
                            <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono tabular-nums font-bold">
                              {entry.debit > 0 ? (
                                <span className="text-emerald-700">
                                  {formatCurrency(entry.debit)}
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>

                            {/* চালান ক্রয় (ক্রেডিট - দেনা বৃদ্ধি) */}
                            <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono tabular-nums font-bold">
                              {entry.credit > 0 ? (
                                <span className="text-rose-700">
                                  {formatCurrency(entry.credit)}
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>

                            {/* অবশিষ্ট দেনা */}
                            <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono tabular-nums font-bold text-slate-900 bg-slate-50/30">
                              {formatCurrency(entry.balanceAfter)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {filteredEntries.length > 0 && (
                    <tfoot className="bg-slate-50/90 border-t border-slate-200/90 font-bold text-slate-800 text-xs">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-right">
                          মোট হিসাব:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-black">
                          {formatCurrency(
                            filteredEntries.reduce((sum, e) => sum + (e.debit || 0), 0)
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-700 font-black">
                          {formatCurrency(
                            filteredEntries.reduce((sum, e) => sum + (e.credit || 0), 0)
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-brand-deep font-black">
                          {formatCurrency(supplier.currentPayable)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* পেজিনেশন */}
              {ledgerMeta.totalPages > 1 && (
                <div className="p-3 border-t border-slate-200/90 print:hidden">
                  <AdminPagination
                    currentPage={currentPage}
                    totalPages={ledgerMeta.totalPages}
                    totalItems={ledgerMeta.total}
                    pageSize={ledgerMeta.limit}
                    onPageChange={handlePageChange}
                    itemLabel="লেনদেন"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ডানে: মহাজন প্রোফাইল ও দ্রুত পরিশোধ অ্যাকশন (৪ কলাম / ~৩০% - Sticky) */}
          <div className="lg:col-span-4 space-y-4 print:hidden lg:sticky lg:top-20">
            {/* কার্ড ১: মহাজন / মোকাম সারসংক্ষেপ */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Storefront size={16} weight="bold" className="text-brand-deep" />
                  মহাজন ও মোকাম তথ্য
                </span>
                <Badge variant={supplier.isActive ? 'cash' : 'neutral'}>
                  {supplier.isActive ? 'সক্রিয় মহাজন' : 'নিষ্ক্রিয়'}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                {supplier.companyName && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Buildings size={13} weight="bold" /> প্রতিষ্ঠান:
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {supplier.companyName}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-600">মহাজন / মালিক:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {supplier.name}
                  </span>
                </div>
                {supplier.phone && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Phone size={13} weight="bold" /> ফোন:
                    </span>
                    <a
                      href={`tel:${supplier.phone}`}
                      className="font-mono font-bold text-brand-deep hover:underline"
                    >
                      {toBanglaDigits(supplier.phone)}
                    </a>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-600 flex items-center gap-1">
                      <MapPin size={13} weight="bold" /> মোকাম:
                    </span>
                    <span className="text-slate-800 text-right font-medium">
                      {supplier.address}
                    </span>
                  </div>
                )}
              </div>

              {/* দেনা সারসংক্ষেপ বক্স */}
              <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 font-medium">
                    দোকানের কাছে মোট পাওনা:
                  </span>
                  <span
                    className={`font-mono tabular-nums text-base font-black ${
                      supplier.currentPayable > 0
                        ? 'text-rose-700'
                        : supplier.currentPayable < 0
                        ? 'text-emerald-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {formatCurrency(supplier.currentPayable)}
                  </span>
                </div>
              </div>
            </div>

            {/* কার্ড ২: দ্রুত মহাজনকে পরিশোধ ফর্ম */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HandCoins size={16} weight="bold" className="text-emerald-700" />
                  দ্রুত মহাজনকে টাকা পরিশোধ
                </span>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-3">
                {payError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                    {payError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    টাকার পরিমাণ (৳) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="০.০০"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
                  />

                  {/* কুইক অ্যামাউন্ট বাটনস */}
                  {supplier.currentPayable > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setPayAmount(supplier.currentPayable.toString())}
                        className="px-2 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                      >
                        সব পরিশোধ ({formatCurrency(supplier.currentPayable)})
                      </button>
                      {[10000, 25000, 50000, 100000].map((quick) => (
                        <button
                          key={quick}
                          type="button"
                          onClick={() => setPayAmount(quick.toString())}
                          className="px-2 py-1 rounded-md text-xs font-semibold font-mono bg-slate-100 text-slate-700 hover:bg-brand-soft hover:text-brand-deep cursor-pointer transition-colors"
                        >
                          +{formatCurrency(quick)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মারফত / ব্যাংক / চেক বিবরণ (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="ব্যাংক / চেক / নোট"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPaying || !payAmount}
                  className={buttonClasses({ variant: 'cash', size: 'md', className: 'w-full gap-1.5' })}
                >
                  {isPaying ? (
                    <>
                      <Spinner size={15} weight="bold" className="animate-spin" />
                      <span>পরিশোধ প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} weight="bold" />
                      <span>মহাজনকে পরিশোধ নিশ্চিত করুন</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* কার্ড ৩: হিসাব সমন্বয় ও মওকুফ */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <button
                type="button"
                onClick={() => setShowAdjustment(!showAdjustment)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-brand-deep cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Percent size={15} weight="bold" className="text-brand-deep" />
                  হিসাব সমন্বয় / কমিশন / ছাড়
                </span>
                {showAdjustment ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </button>

              {showAdjustment && (
                <form onSubmit={handleAdjustmentSubmit} className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAdjType('DISCOUNT')}
                      className={`py-1.5 rounded-md text-xs font-bold border cursor-pointer transition-colors ${
                        adjType === 'DISCOUNT'
                          ? 'bg-brand-deep text-white border-brand-deep'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      কমিশন / ছাড় (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjType('ADD_CHARGE')}
                      className={`py-1.5 rounded-md text-xs font-bold border cursor-pointer transition-colors ${
                        adjType === 'ADD_CHARGE'
                          ? 'bg-brand-deep text-white border-brand-deep'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      অতিরিক্ত চার্জ (+)
                    </button>
                  </div>

                  <div>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(e.target.value)}
                      placeholder="টাকার পরিমাণ (৳)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs font-bold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      placeholder="সমন্বয়ের কারণ"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAdjusting}
                    className={buttonClasses({ variant: 'primary', size: 'sm', className: 'w-full' })}
                  >
                    {isAdjusting ? 'সমন্বয় হচ্ছে...' : 'সমন্বয় নিশ্চিত করুন'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
