'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowClockwise,
  Package,
  TrendUp,
  TrendDown,
  Users,
  Truck,
  ShoppingCart,
  Calendar,
  Warning,
  CheckCircle,
  ChartBar,
  Receipt,
  Scales,
} from '@phosphor-icons/react';
import { useReportsStore, DateFilterPreset } from '@/features/reports/useReportsStore';
import { formatCurrency } from '@/lib/decimal';

export default function ReportsPage() {
  const {
    datePreset,
    customStartDate,
    customEndDate,
    profitLoss,
    inventoryValuation,
    duesSummary,
    topSelling,
    isLoadingPnl,
    isLoadingValuation,
    isLoadingDues,
    isLoadingTopSelling,
    error,
    setDatePreset,
    setCustomDateRange,
    fetchAllReports,
    fetchProfitLoss,
  } = useReportsStore();

  const [localStart, setLocalStart] = useState(customStartDate);
  const [localEnd, setLocalEnd] = useState(customEndDate);

  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  const handleApplyCustomDates = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomDateRange(localStart, localEnd);
  };

  const isAnyLoading = isLoadingPnl || isLoadingValuation || isLoadingDues || isLoadingTopSelling;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-16 font-sans">
      {/* 1. Global Shell Header */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
              title="ড্যাশবোর্ডে ফিরুন"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  ব্যবসায়িক রিপোর্ট ও আর্থিক বিশ্লেষণ
                </h1>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                  ERP Reports
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                ইদ্রিস ব্রাদার্স • মরিচপট্টি, ফেনী বাজার
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAllReports()}
              disabled={isAnyLoading}
              className="px-2.5 py-1 rounded-md border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 disabled:opacity-50"
              title="তথ্য রিফ্রেশ করুন"
            >
              <ArrowClockwise size={14} weight="bold" className={isAnyLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>

            <Link
              href="/pos"
              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(5,150,105,0.2)]"
            >
              <ShoppingCart size={14} weight="bold" />
              <span>পিওএস কাউন্টার</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <Warning size={15} weight="fill" className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 1: DATE FILTER BAR */}
        {/* ================================================================= */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Calendar size={14} weight="bold" />
              সময়কাল:
            </span>
            {(
              [
                { id: 'today', label: 'আজকে' },
                { id: 'this_week', label: 'চলতি সপ্তাহ' },
                { id: 'this_month', label: 'চলতি মাস' },
                { id: 'custom', label: 'কাস্টম তারিখ' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setDatePreset(item.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] ${
                  datePreset === item.id
                    ? 'bg-slate-900 text-white shadow-[0_1px_2px_rgba(15,23,42,0.1)]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {datePreset === 'custom' && (
            <form onSubmit={handleApplyCustomDates} className="flex items-center gap-1.5 flex-wrap">
              <input
                type="date"
                value={localStart}
                onChange={(e) => setLocalStart(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white font-mono tabular-nums"
              />
              <span className="text-xs text-slate-400">থেকে</span>
              <input
                type="date"
                value={localEnd}
                onChange={(e) => setLocalEnd(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white font-mono tabular-nums"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 active:scale-[0.98] transition-[background-color,transform] duration-150"
              >
                প্রয়োগ
              </button>
            </form>
          )}
        </div>

        {/* ================================================================= */}
        {/* SECTION 2: PROFIT & LOSS STATEMENT (P&L CARD) */}
        {/* ================================================================= */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200/90 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
                <Receipt size={18} weight="bold" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                  আয় ও লাভ-ক্ষতি বিবরণী (Profit & Loss Statement)
                </h2>
                <p className="text-[11px] text-slate-500">
                  বিক্রয় আয়, পণ্যের ক্রয়মূল্য (COGS), অপচয় ও পরিচালন খরচ সমন্বিত নিট লাভ
                </p>
              </div>
            </div>

            {profitLoss && (
              <div
                className={`px-2 py-0.5 rounded-md border text-[11px] font-bold flex items-center gap-1 font-mono tabular-nums ${
                  profitLoss.netProfit.isProfitable
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                    : 'bg-rose-50 text-rose-800 border-rose-200/80'
                }`}
              >
                {profitLoss.netProfit.isProfitable ? (
                  <TrendUp size={14} weight="bold" />
                ) : (
                  <TrendDown size={14} weight="bold" />
                )}
                <span>
                  {profitLoss.netProfit.isProfitable ? 'নিট মুনাফা' : 'নিট লোকসান'} (
                  {profitLoss.netProfit.netMarginPercent})
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            {isLoadingPnl ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                লাভ-ক্ষতি তথ্য হিসাব করা হচ্ছে...
              </div>
            ) : profitLoss ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. Revenue & Sales */}
                <div className="p-3.5 rounded-md bg-slate-50/80 border border-slate-200/90 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    বিক্রয় ও রাজস্ব (Revenue)
                  </span>
                  <div>
                    <div className="text-[11px] text-slate-500">মোট বিক্রয় রাজস্ব ({profitLoss.salesSummary.totalInvoices} টি ইনভয়েস)</div>
                    <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
                      ৳{profitLoss.salesSummary.totalSalesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 pt-2 border-t border-slate-200/80 flex justify-between">
                    <span>প্রদত্ত ছাড় (Discounts):</span>
                    <span className="font-mono tabular-nums font-semibold">৳{profitLoss.salesSummary.totalDiscountGiven.toFixed(2)}</span>
                  </div>
                </div>

                {/* 2. Direct Costs & Gross Profit */}
                <div className="p-3.5 rounded-md bg-slate-50/80 border border-slate-200/90 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    মালের ক্রয়মূল্য ও মোট লাভ
                  </span>
                  <div>
                    <div className="text-[11px] text-slate-500">বিক্রিত পণ্যের ক্রয়মূল্য (COGS)</div>
                    <div className="text-base sm:text-lg font-bold font-mono tabular-nums tracking-tight text-slate-700">
                      ৳{profitLoss.salesSummary.costOfGoodsSold.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">মোট লাভ (Gross Profit):</span>
                      <span className="font-mono tabular-nums tracking-tight font-bold text-slate-900 text-sm">
                        ৳{profitLoss.salesSummary.grossProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      গ্রস মার্জিন: <span className="font-semibold text-slate-700 font-mono tabular-nums">{profitLoss.salesSummary.grossMarginPercent}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Deductions & Net Profit (Solid Dark Spotlight) */}
                <div className="p-3.5 rounded-md bg-slate-900 text-white space-y-2.5 border border-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    কর্তন ও চূড়ান্ত নিট লাভ (Net)
                  </span>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>মালের অপচয়/ঘাটতি ক্ষতি:</span>
                      <span className="font-mono tabular-nums text-rose-300 font-medium">
                        - ৳{profitLoss.deductions.wastageLoss.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>দোকান খরচ (Daily Expense):</span>
                      <span className="font-mono tabular-nums text-rose-300 font-medium">
                        - ৳{profitLoss.deductions.operatingExpenses.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400 font-medium">প্রকৃত নিট মুনাফা (Net Profit)</div>
                    <div
                      className={`text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight mt-0.5 ${
                        profitLoss.netProfit.isProfitable ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {profitLoss.netProfit.isProfitable ? '+' : ''}৳
                      {profitLoss.netProfit.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      নিট লাভের অনুপাত: <span className="font-bold text-white font-mono tabular-nums">{profitLoss.netProfit.netMarginPercent}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">কোনো তথ্য পাওয়া যায়নি</p>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION 3: INVENTORY CAPITAL VALUATION & LOW STOCK */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {/* Inventory Valuation Card (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/90 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
                  <Package size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                    ইনভেন্টরি ক্যাপিটাল ও স্টক ভ্যালুয়েশন
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    দোকানের বর্তমান সক্রিয় {inventoryValuation?.totalVariantsCount || 0} টি SKU-এর মোট মূলধন
                  </p>
                </div>
              </div>
            </div>

            {isLoadingValuation ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                ইনভেন্টরি মূলধন হিসাব করা হচ্ছে...
              </div>
            ) : inventoryValuation ? (
              <div className="space-y-3.5">
                {/* Total Capital Highlight */}
                <div className="p-3.5 rounded-md bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                      বর্তমান ক্রয়মূল্যে মোট ইনভেন্টরি মূলধন (Capital at Replacement Cost)
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums tracking-tight text-slate-900">
                      ৳
                      {inventoryValuation.valuation.totalCostValuation.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                    <span className="text-[11px] font-semibold text-emerald-800 block mb-0.5">
                      সম্ভাব্য খুচরা বিক্রয় মূল্য
                    </span>
                    <div className="text-lg sm:text-xl font-bold font-mono tabular-nums tracking-tight text-emerald-700">
                      ৳
                      {inventoryValuation.valuation.totalRetailValuation.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                      সম্ভাব্য মোট লাভ: ৳{inventoryValuation.valuation.potentialRetailProfit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Wholesale Valuation Strip */}
                <div className="p-2.5 bg-slate-100/70 border border-slate-200/90 rounded-md flex items-center justify-between text-xs text-slate-800">
                  <span className="font-medium text-[11px]">
                    পাইকারি দর অনুযায়ী বিক্রয় সম্ভাবনা (Wholesale Potential):
                  </span>
                  <span className="font-mono tabular-nums tracking-tight font-bold text-slate-900 text-xs sm:text-sm">
                    ৳{inventoryValuation.valuation.totalWholesaleValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Low Stock Warning Card (1 col) */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center">
                  <Warning size={16} weight="bold" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">স্টক সতর্কতা (Low Stock)</h4>
                  <p className="text-[11px] text-slate-500">সতর্কতা সীমার নিচে থাকা পণ্য</p>
                </div>
              </div>

              {inventoryValuation?.lowStock && inventoryValuation.lowStock.count > 0 ? (
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {inventoryValuation.lowStock.items.slice(0, 5).map((item) => (
                    <div
                      key={item.variantId}
                      className="p-2 bg-slate-50 rounded-md border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-800 truncate max-w-[140px]">{item.name}</span>
                      <span className="font-mono tabular-nums tracking-tight text-rose-700 font-bold">
                        {item.stockQuantity} {item.baseUnitName}
                      </span>
                    </div>
                  ))}
                  {inventoryValuation.lowStock.count > 5 && (
                    <p className="text-[10px] text-slate-400 text-center font-mono tabular-nums">
                      + আরও {inventoryValuation.lowStock.count - 5} টি সংকটপূর্ণ আইটেম আছে
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <CheckCircle size={24} className="text-emerald-500 mx-auto mb-1" />
                  <p>সকল পণ্যের স্টক পর্যাপ্ত রয়েছে</p>
                </div>
              )}
            </div>

            <Link
              href="/products"
              className="mt-3 w-full py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 text-xs font-semibold rounded-md text-center transition-[background-color,border-color,transform] duration-150 block border border-slate-200/80"
            >
              ক্যাটালগে স্টক ও মূল্য পরিচালনা করুন →
            </Link>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION 4: MARKET DUES & PAYABLES (KHATA SUMMARY) */}
        {/* ================================================================= */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/90 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
                <Scales size={18} weight="bold" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  বাজারের দেনা ও পাওনা খাতা (Market Receivables & Payables)
                </h3>
                <p className="text-[11px] text-slate-500">
                  খুচরা/পাইকারি ক্রেতাদের মোট বাকি এবং আমদানিকারক মহাজনদের দেনার বর্তমান স্থিতি
                </p>
              </div>
            </div>

            {duesSummary && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 font-mono tabular-nums">
                {duesSummary.netKhataStanding.status}
              </span>
            )}
          </div>

          {isLoadingDues ? (
            <div className="p-8 text-center text-slate-500 text-xs">খাতা তথ্য লোড হচ্ছে...</div>
          ) : duesSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Customer Receivables */}
              <div className="p-3.5 rounded-md bg-slate-50/80 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Users size={14} weight="bold" />
                    কাস্টমারদের কাছে বাকি পাওনা ({duesSummary.customerDues.debtorsCount} জন)
                  </span>
                  <Link
                    href="/khata/customers"
                    className="text-xs text-slate-700 font-semibold hover:underline"
                  >
                    বাকি খাতা →
                  </Link>
                </div>

                <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
                  ৳{duesSummary.customerDues.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase">শীর্ষ ৫ দেনাদার:</span>
                  {duesSummary.customerDues.topDebtors.map((d) => (
                    <div key={d.id} className="flex justify-between text-xs py-1 border-b border-slate-200/50">
                      <div>
                        <span className="font-medium text-slate-800">{d.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1 font-mono tabular-nums">({d.phone})</span>
                      </div>
                      <span className="font-mono tabular-nums tracking-tight font-bold text-slate-900">৳{d.currentDue?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplier Payables */}
              <div className="p-3.5 rounded-md bg-slate-50/80 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Truck size={14} weight="bold" />
                    মহাজনদের পাওনা দেনা ({duesSummary.supplierPayables.creditorsCount} জন)
                  </span>
                  <Link
                    href="/khata/suppliers"
                    className="text-xs text-slate-700 font-semibold hover:underline"
                  >
                    মহাজন খাতা →
                  </Link>
                </div>

                <div className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight text-slate-900">
                  ৳{duesSummary.supplierPayables.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase">শীর্ষ ৫ পাওনাদার মহাজন:</span>
                  {duesSummary.supplierPayables.topCreditors.map((s) => (
                    <div key={s.id} className="flex justify-between text-xs py-1 border-b border-slate-200/50">
                      <div>
                        <span className="font-medium text-slate-800">{s.companyName || s.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1 font-mono tabular-nums">({s.phone})</span>
                      </div>
                      <span className="font-mono tabular-nums tracking-tight font-bold text-slate-900">৳{s.currentPayable?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* ================================================================= */}
        {/* SECTION 5: TOP SELLING PRODUCTS LEADERBOARD */}
        {/* ================================================================= */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/90 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
                <ChartBar size={18} weight="bold" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  সর্বোচ্চ বিক্রিত পণ্য (Top Selling Products & SKUs)
                </h3>
                <p className="text-[11px] text-slate-500">
                  বিক্রয় আয় ও পরিমাণের ভিত্তিতে আড়তের শীর্ষ জনপ্রিয় পণ্যসমূহ
                </p>
              </div>
            </div>
          </div>

          {isLoadingTopSelling ? (
            <div className="p-8 text-center text-slate-500 text-xs">শীর্ষ পণ্য তালিকা লোড হচ্ছে...</div>
          ) : topSelling.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">কোনো বিক্রয় রেকর্ড নেই</p>
          ) : (
            <div className="space-y-2">
              {topSelling.map((item, index) => {
                const maxRevenue = topSelling[0]?.totalRevenue || 1;
                const percentage = Math.round((item.totalRevenue / maxRevenue) * 100);

                return (
                  <div key={item.variantId} className="p-2.5 bg-slate-50/80 rounded-md border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px] font-mono tabular-nums flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200/80">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono tabular-nums tracking-tight font-bold text-slate-900 text-xs sm:text-sm">
                          ৳{item.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-slate-500 text-[10px] ml-1.5 font-mono tabular-nums">
                          ({item.totalSoldQuantity} {item.baseUnitName})
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200/80 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-slate-800 h-1 rounded-full transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
