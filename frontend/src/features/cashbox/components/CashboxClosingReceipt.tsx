'use client';

import React from 'react';
import { X, Printer, Receipt } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/lib/decimal';
import { useCashboxStore } from '../useCashboxStore';

export function CashboxClosingReceipt() {
  const {
    summary,
    targetDate,
    denominations,
    isClosingReceiptOpen,
    closeClosingReceipt,
    getCalculatedNoteTotal,
  } = useCashboxStore();

  if (!isClosingReceiptOpen || !summary) return null;

  const totalIn = summary.inflow.totalCashIn;
  const totalOut = summary.outflow.totalCashOut;
  const netCash = summary.netCashInHand;
  const countedNotes = getCalculatedNoteTotal();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white w-full max-w-sm rounded-lg shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* টপ কন্ট্রোল বার */}
        <div className="px-3.5 py-2.5 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
            <Receipt size={15} weight="bold" className="text-slate-600" />
            <span>থার্মাল ক্যাশ ক্লোজিং স্লিপ</span>
          </div>
          <button
            onClick={closeClosingReceipt}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-[background-color,color] duration-150"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* প্রিন্ট স্লিপ কন্টেন্ট (থার্মাল পেপার এরিয়া) */}
        <div className="flex-1 overflow-y-auto p-4 text-black font-mono text-xs space-y-3 bg-white">
          {/* স্লিপ হেডার */}
          <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-2">
            <h2 className="text-sm font-extrabold uppercase tracking-tight">
              ইদ্রিস ব্রাদার্স
            </h2>
            <p className="text-[10px] text-slate-700">মুদি ও মসলার আড়ত</p>
            <p className="text-[10px] text-slate-700">মরিচপট্টি, ফেনী বড় বাজার, ফেনী</p>
            <p className="text-[11px] font-bold mt-1 pt-1 border-t border-slate-300">
              দৈনিক ক্যাশবাক্স ক্লোজিং হিসাব
            </p>
            <p className="text-[10px] text-slate-600">তারিখ: {targetDate}</p>
          </div>

          {/* ইনফ্লো (নগদ গ্রহণ) */}
          <div className="space-y-1">
            <div className="font-bold border-b border-slate-200 pb-0.5 text-[11px]">
              [+] নগদ গ্রহণ (Cash Inflow)
            </div>
            <div className="flex justify-between">
              <span>কাউন্টার বিক্রি ({summary.inflow.salesCount} টি):</span>
              <span className="font-mono tabular-nums">+{formatCurrency(summary.inflow.cashFromSales)}</span>
            </div>
            <div className="flex justify-between">
              <span>বকেয়া আদায় ({summary.inflow.customerRepaymentsCount} টি):</span>
              <span className="font-mono tabular-nums">+{formatCurrency(summary.inflow.cashFromCustomerRepayments)}</span>
            </div>
            <div className="flex justify-between font-bold pt-0.5 border-t border-slate-200">
              <span>মোট নগদ জমা:</span>
              <span className="font-mono tabular-nums">+{formatCurrency(totalIn)}</span>
            </div>
          </div>

          {/* আউটফ্লো (নগদ প্রদান ও খরচ) */}
          <div className="space-y-1">
            <div className="font-bold border-b border-slate-200 pb-0.5 text-[11px]">
              [-] নগদ প্রদান (Cash Outflow)
            </div>
            <div className="flex justify-between">
              <span>চালান পেমেন্ট ({summary.outflow.purchasesCount} টি):</span>
              <span className="font-mono tabular-nums">-{formatCurrency(summary.outflow.cashForPurchases)}</span>
            </div>
            <div className="flex justify-between">
              <span>মহাজন দেনা শোধ ({summary.outflow.supplierRepaymentsCount} টি):</span>
              <span className="font-mono tabular-nums">-{formatCurrency(summary.outflow.cashForSupplierRepayments)}</span>
            </div>
            <div className="flex justify-between">
              <span>দোকানের খরচ ({summary.outflow.expensesCount} টি):</span>
              <span className="font-mono tabular-nums">-{formatCurrency(summary.outflow.totalExpenses)}</span>
            </div>
            <div className="flex justify-between font-bold pt-0.5 border-t border-slate-200">
              <span>মোট নগদ ব্যয়:</span>
              <span className="font-mono tabular-nums">-{formatCurrency(totalOut)}</span>
            </div>
          </div>

          {/* ড্রয়ারের নেট ক্যাশ ব্যালেন্স */}
          <div className="border-t-2 border-b-2 border-dashed border-slate-800 py-2 space-y-1">
            <div className="flex justify-between font-black text-sm">
              <span>ড্রয়ারে নেট ক্যাশ:</span>
              <span className="font-mono tabular-nums font-bold">{formatCurrency(netCash)}</span>
            </div>
            {countedNotes > 0 && (
              <div className="flex justify-between text-[11px]">
                <span>গণনাকৃত ফিজিক্যাল ক্যাশ:</span>
                <span className="font-mono tabular-nums">{formatCurrency(countedNotes)}</span>
              </div>
            )}
          </div>

          {/* নোট গণনার তালিকা (যদি গণনা করা থাকে) */}
          {countedNotes > 0 && (
            <div className="space-y-0.5 text-[10px] pt-1">
              <span className="font-bold block border-b border-slate-200">নোট গণনার বিবরণ:</span>
              {denominations.n1000 > 0 && (
                <div className="flex justify-between">
                  <span>১০০০ টাকার নোট: {denominations.n1000} টি</span>
                  <span className="font-mono tabular-nums">{formatCurrency(denominations.n1000 * 1000)}</span>
                </div>
              )}
              {denominations.n500 > 0 && (
                <div className="flex justify-between">
                  <span>৫০০ টাকার নোট: {denominations.n500} টি</span>
                  <span className="font-mono tabular-nums">{formatCurrency(denominations.n500 * 500)}</span>
                </div>
              )}
              {denominations.n200 > 0 && (
                <div className="flex justify-between">
                  <span>২০০ টাকার নোট: {denominations.n200} টি</span>
                  <span className="font-mono tabular-nums">{formatCurrency(denominations.n200 * 200)}</span>
                </div>
              )}
              {denominations.n100 > 0 && (
                <div className="flex justify-between">
                  <span>১০০ টাকার নোট: {denominations.n100} টি</span>
                  <span className="font-mono tabular-nums">{formatCurrency(denominations.n100 * 100)}</span>
                </div>
              )}
              {denominations.n50 > 0 && (
                <div className="flex justify-between">
                  <span>৫০ টাকার নোট: {denominations.n50} টি</span>
                  <span className="font-mono tabular-nums">{formatCurrency(denominations.n50 * 50)}</span>
                </div>
              )}
              {denominations.n20 > 0 && (
                <div className="flex justify-between">
                  <span>২০ টাকার নোট: {denominations.n20} টি</span>
                  <span className="font-mono tabular-nums">{formatCurrency(denominations.n20 * 20)}</span>
                </div>
              )}
              {denominations.n10 > 0 && (
                <div className="flex justify-between">
                  <span>১০ টাকার নোট / খুচরা: {denominations.n10} টি</span>
                  <span className="font-mono tabular-nums">{formatCurrency(denominations.n10 * 10)}</span>
                </div>
              )}
            </div>
          )}

          {/* স্লিপ ফুটার ও সিগনেচার */}
          <div className="pt-6 text-center space-y-4">
            <div className="flex justify-between text-[10px] pt-4">
              <span className="border-t border-slate-400 px-2">ক্যাশিয়ারের স্বাক্ষর</span>
              <span className="border-t border-slate-400 px-2">মালিকের স্বাক্ষর</span>
            </div>
            <p className="text-[9px] text-slate-500">সফটওয়্যার প্রিন্ট সময়: {new Date().toLocaleTimeString('bn-BD')}</p>
          </div>
        </div>

        {/* প্রিন্ট বাটন ফুটার */}
        <div className="p-2.5 bg-slate-50/80 border-t border-slate-200/90 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={closeClosingReceipt}
            className="px-3 py-1.5 rounded-md border border-slate-200/90 text-xs font-medium text-slate-600 hover:bg-slate-100 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
          >
            বন্ধ করুন
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-medium flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(15,23,42,0.1)]"
          >
            <Printer size={14} weight="bold" />
            <span>প্রিন্ট করুন</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
