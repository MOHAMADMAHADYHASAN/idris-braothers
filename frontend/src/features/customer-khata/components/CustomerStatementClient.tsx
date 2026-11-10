'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  User,
  Storefront,
  Phone,
  MapPin,
  Coins,
  CheckCircle,
  WarningCircle,
  HandCoins,
  Receipt,
  Spinner,
  CaretDown,
  CaretUp,
  Percent,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { Customer, CustomerLedgerEntry } from '../customerKhata.types';
import { useCustomerKhataStore } from '../useCustomerKhataStore';
import { AdminPagination } from '@/components/shared/AdminPagination';

interface CustomerStatementClientProps {
  customerId: string;
}

export function CustomerStatementClient({ customerId }: CustomerStatementClientProps) {
  const {
    fetchCustomerById,
    fetchCustomerLedger,
    selectedCustomer,
    ledgerEntries,
    ledgerMeta,
    isLedgerLoading,
    submitPayment,
    submitAdjustment,
  } = useCustomerKhataStore();

  const [customer, setCustomer] = useState<Customer | null>(
    selectedCustomer?.id === customerId ? selectedCustomer : null
  );
  const [isLoading, setIsLoading] = useState(!customer);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Fast Payment State
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'CASH' | 'BANK' | 'BKASH'>('CASH');
  const [payNote, setPayNote] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Fast Adjustment State (Collapsible)
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjType, setAdjType] = useState<'DISCOUNT' | 'ADD_CHARGE'>('DISCOUNT');
  const [adjNote, setAdjNote] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchCustomerById(customerId)
      .then((c) => {
        if (c) setCustomer(c);
      })
      .finally(() => setIsLoading(false));

    fetchCustomerLedger(customerId, 1);
  }, [customerId, fetchCustomerById, fetchCustomerLedger]);

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    fetchCustomerLedger(customerId, p);
  };

  const handlePrint = () => {
    window.print();
  };

  // Submit Fast Due Collection
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      setPayError('জমার পরিমাণ ০ এর বেশি হতে হবে');
      return;
    }

    setIsPaying(true);
    setPayError(null);
    try {
      const finalNote = [
        payMethod === 'BKASH' ? 'বিকাশ' : payMethod === 'BANK' ? 'ব্যাংক' : 'ক্যাশ',
        payNote.trim(),
      ]
        .filter(Boolean)
        .join(' - ');

      const res = await submitPayment(customerId, {
        amount,
        note: finalNote || undefined,
      });
      setCustomer(res.customer);
      setPayAmount('');
      setPayNote('');
      fetchCustomerLedger(customerId, 1);
      alert(`${formatCurrency(amount)} সফলভাবে জমা হয়েছে এবং খাতা আপডেট হয়েছে!`);
    } catch (err: any) {
      setPayError(err.message || 'টাকা জমা নিতে সমস্যা হয়েছে');
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
    if (!adjNote.trim()) {
      alert('সমন্বয়ের কারণ উল্লেখ করা বাধ্যতামূলক');
      return;
    }

    // DISCOUNT reduces due -> negative amount
    // ADD_CHARGE increases due -> positive amount
    const amount = adjType === 'DISCOUNT' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    setIsAdjusting(true);
    try {
      const res = await submitAdjustment(customerId, {
        amount,
        reason: adjNote.trim(),
      });
      setCustomer(res.customer);
      setAdjAmount('');
      setAdjNote('');
      setShowAdjustment(false);
      fetchCustomerLedger(customerId, 1);
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
          <Spinner size={32} weight="bold" className="animate-spin text-slate-700" />
          <p className="text-xs font-semibold text-slate-600">কাস্টমার স্টেটমেন্ট লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <WarningCircle size={40} weight="fill" className="text-rose-500 mb-2" />
        <h2 className="text-base font-bold text-slate-900">কাস্টমারটি খুঁজে পাওয়া যায়নি</h2>
        <Link
          href="/khata/customers"
          className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          কাস্টমার তালিকায় ফিরুন
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
              href="/khata/customers"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
              title="কাস্টমার তালিকায় ফিরে যান"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  {customer.name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                    customer.customerType === 'WHOLESALE'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {customer.customerType === 'WHOLESALE' ? 'পাইকারি পার্টি' : 'খুচরা গ্রাহক'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                    customer.currentDue > 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {customer.currentDue > 0
                    ? `বকেয়া: ${formatCurrency(customer.currentDue)}`
                    : 'পরিশোধিত / ০ বাকি'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {customer.phone ? `ফোন: ${customer.phone}` : ''}{' '}
                {customer.address ? `• ঠিকানা: ${customer.address}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer size={15} weight="bold" />
              <span>স্টেটমেন্ট প্রিন্ট (A4)</span>
            </button>
          </div>
        </div>
      </header>

      {/* ২. মূল লেজার ক্যানভাস (Desktop 70% - 30%) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 print:p-0 print:max-w-none">
        {/* প্রিন্ট হেডার (শুধু প্রিন্ট ডকুমেন্টে আসবে) */}
        <div className="hidden print:block border-b border-slate-300 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">মেসার্স ইদ্রিস ব্রাদার্স</h2>
              <p className="text-xs text-slate-600">মরিচপট্টি, ফেনী বাজার, ফেনী</p>
              <p className="text-xs text-slate-500">গ্রাহক খতিয়ান ও হিসাব বিবরণী (Customer Ledger Statement)</p>
            </div>
            <div className="text-right">
              <h3 className="text-base font-bold text-slate-900">{customer.name}</h3>
              <p className="text-xs text-slate-600">{customer.phone || ''}</p>
              <p className="text-xs text-slate-500">{customer.address || ''}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* বাঁয়ে: খতিয়ান স্টেটমেন্ট টেবিল ও ফিল্টার (৮ কলাম / ~৭০%) */}
          <div className="lg:col-span-8 space-y-4 print:w-full">
            {/* ফিল্টার টুলবার (প্রিন্টে লুকানো থাকবে) */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between flex-wrap gap-2 print:hidden">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সব লেনদেন
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('DEBIT')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'DEBIT'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  বাকিতে মাল ক্রয় (ডেবিট)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('CREDIT')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'CREDIT'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  নগদ জমা / উশুল (ক্রেডিট)
                </button>
              </div>

              <span className="text-xs text-slate-500 font-mono">
                মোট এন্ট্রি: <strong>{ledgerMeta.total}</strong>টি
              </span>
            </div>

            {/* পূর্ণাঙ্গ লেজার হিস্ট্রি স্টেটমেন্ট টেবিল */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden print:border-none print:shadow-none">
              <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-indigo-50 text-indigo-600">
                    <Receipt size={16} weight="bold" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    লেনদেন খতিয়ান বিবরণী (Ledger Entries)
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">তারিখ ও সময়</th>
                      <th className="py-2.5 px-3">মেমো / ভাউচার</th>
                      <th className="py-2.5 px-3">বিবরণ / নোট</th>
                      <th className="py-2.5 px-3 text-right">মাল ক্রয় (৳)</th>
                      <th className="py-2.5 px-3 text-right">জমা / উশুল (৳)</th>
                      <th className="py-2.5 px-3 text-right">বকেয়া জের (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70">
                    {isLedgerLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Spinner size={24} className="animate-spin mx-auto mb-1 text-slate-600" />
                          <span>খতিয়ান লোড হচ্ছে...</span>
                        </td>
                      </tr>
                    ) : filteredEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          কোনো লেনদেন রেকর্ড পাওয়া যায়নি
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.map((entry) => {
                        const dateStr = new Date(entry.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        });

                        return (
                          <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                            {/* তারিখ */}
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                              {dateStr}
                            </td>

                            {/* মেমো / ভাউচার */}
                            <td className="py-2.5 px-3 font-mono text-xs font-semibold text-slate-800">
                              {entry.saleId ? (
                                <Link
                                  href={`/sales/${entry.saleId}`}
                                  className="text-indigo-600 hover:underline hover:text-indigo-800"
                                  title="বিক্রয় মেমো দেখুন"
                                >
                                  মেমো #{entry.saleId.slice(-6)}
                                </Link>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            {/* বিবরণ */}
                            <td className="py-2.5 px-3">
                              <span className="font-medium text-slate-800 block">
                                {entry.entryType === 'SALE' || entry.entryType === 'SALE_DUE'
                                  ? 'বাকিতে পণ্য ক্রয়'
                                  : entry.entryType === 'PAYMENT_RECEIVED'
                                  ? 'নগদ জমা / উশুল'
                                  : entry.entryType === 'OPENING_BALANCE'
                                  ? 'প্রারম্ভিক বকেয়া'
                                  : entry.entryType === 'RETURN'
                                  ? 'পণ্য ফেরত (রিটার্ন)'
                                  : entry.entryType === 'ADJUSTMENT'
                                  ? 'হিসাব সমন্বয় / ছাড়'
                                  : 'অন্যান্য'}
                              </span>
                              {entry.note && (
                                <span className="text-[11px] text-slate-400 font-normal block truncate max-w-[180px]">
                                  {entry.note}
                                </span>
                              )}
                            </td>

                            {/* ডেবিট (মাল ক্রয়) */}
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs">
                              {entry.debit > 0 ? (
                                <span className="font-bold text-rose-700">
                                  {formatCurrency(entry.debit)}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* ক্রেডিট (জমা / উশুল) */}
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs">
                              {entry.credit > 0 ? (
                                <span className="font-bold text-emerald-700">
                                  {formatCurrency(entry.credit)}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* রানিং ব্যালেন্স */}
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 text-xs sm:text-sm">
                              {formatCurrency(entry.balanceAfter)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* পেজিনেশন */}
              {ledgerMeta.totalPages > 1 && (
                <div className="p-3 border-t border-slate-200 bg-slate-50/50 print:hidden">
                  <AdminPagination
                    currentPage={ledgerMeta.page}
                    totalPages={ledgerMeta.totalPages}
                    totalItems={ledgerMeta.total}
                    pageSize={ledgerMeta.limit}
                    onPageChange={handlePageChange}
                    itemLabel="এন্ট্রি"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ডানে: কাস্টমার কার্ড ও দ্রুত টাকা জমা নেওয়ার প্যানেল (৪ কলাম / ~৩০% - প্রিন্টে লুকানো থাকবে) */}
          <div className="lg:col-span-4 space-y-4 print:hidden">
            {/* কাস্টমার ব্যালেন্স ও ক্রেডিট সামারি কার্ড */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  বর্তমান অবশিষ্ট বকেয়া
                </span>
                <div
                  className={`text-2xl font-bold font-mono tracking-tight ${
                    customer.currentDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {formatCurrency(customer.currentDue)}
                </div>
              </div>

              {/* বকেয়া স্ট্যাটাস নোট */}
              <div className="pt-2 border-t border-slate-100">
                {customer.currentDue > 0 ? (
                  <p className="text-[11px] text-rose-600 font-medium">
                    * কাস্টমারের কাছে দোকানের বাকি বকেয়া পাওনা রয়েছে।
                  </p>
                ) : customer.currentDue < 0 ? (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    * কাস্টমারের অগ্রিম টাকা জমা রয়েছে।
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <CheckCircle size={13} weight="bold" className="text-emerald-500" />
                    কোনো বকেয়া নেই (সম্পূর্ণ পরিশোধিত)।
                  </p>
                )}
              </div>

              {/* কাস্টমার ইনফো */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span className="font-mono text-slate-900">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 mt-0.5" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* দ্রুত টাকা জমা / উশুল ফর্ম (Fast Due Collection) */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                    <HandCoins size={16} weight="bold" />
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    দ্রুত টাকা জমা গ্রহণ (Collect Due)
                  </h3>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="p-5 space-y-3.5">
                {payError && (
                  <div className="p-2 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
                    {payError}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      জমার পরিমাণ (৳) <span className="text-rose-500">*</span>
                    </label>
                    {customer.currentDue > 0 && (
                      <button
                        type="button"
                        onClick={() => setPayAmount(customer.currentDue.toString())}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                      >
                        পুরো বকেয়া ({formatCurrency(customer.currentDue)})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs select-none">৳</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-sm text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    জমার মাধ্যম
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['CASH', 'BANK', 'BKASH'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPayMethod(m)}
                        className={`py-1.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                          payMethod === m
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m === 'CASH' ? 'ক্যাশ' : m === 'BANK' ? 'ব্যাংক' : 'বিকাশ'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    মানি রিসিট নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="রশিদ নং বা পেমেন্ট রেফারেন্স..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPaying}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isPaying ? <Spinner size={14} className="animate-spin text-white" /> : <CheckCircle size={15} weight="bold" />}
                  <span>টাকা জমা গ্রহণ করুন</span>
                </button>
              </form>
            </div>

            {/* হিসাব সমন্বয় ও ছাড় (Collapsible Adjustment Box) */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdjustment(!showAdjustment)}
                className="w-full px-5 py-3 bg-slate-50/80 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>হিসাব সমন্বয় / ছাড় (Adjustment)</span>
                {showAdjustment ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </button>

              {showAdjustment && (
                <form onSubmit={handleAdjustmentSubmit} className="p-5 space-y-3 border-t border-slate-200/80 animate-in fade-in duration-100">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAdjType('DISCOUNT')}
                      className={`py-1 rounded text-[11px] font-bold border ${
                        adjType === 'DISCOUNT' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      ছাড় / মওকুফ (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjType('ADD_CHARGE')}
                      className={`py-1 rounded text-[11px] font-bold border ${
                        adjType === 'ADD_CHARGE' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'
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
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs font-bold"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={adjNote}
                      onChange={(e) => setAdjNote(e.target.value)}
                      placeholder="সমন্বয়ের সুনির্দিষ্ট কারণ লিখুন..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAdjusting}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
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
