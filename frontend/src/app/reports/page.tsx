'use client';

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
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
import { useReportsStore } from '@/features/reports/useReportsStore';
import {
  formatCurrency,
  formatNumber,
  formatWeight,
  formatPercent,
  toBanglaDigits,
} from '@/lib/decimal';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { UnifiedDateRangeFilter } from '@/components/shared/UnifiedDateRangeFilter';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { ResolvedDateRange } from '@/lib/dateFilter';

export default function ReportsPage() {
  const {
    profitLoss,
    inventoryValuation,
    duesSummary,
    topSelling,
    isLoadingPnl,
    isLoadingValuation,
    isLoadingDues,
    isLoadingTopSelling,
    error,
    setCustomDateRange,
    fetchAllReports,
  } = useReportsStore();

  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  const handleRangeChange = useCallback(
    (range: ResolvedDateRange) => {
      setCustomDateRange(range.startYmd, range.endYmd);
    },
    [setCustomDateRange]
  );

  const isAnyLoading = isLoadingPnl || isLoadingValuation || isLoadingDues || isLoadingTopSelling;

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-primary pb-16 font-sans flex flex-col">
      {/* ১. স্টিকি পেজ হেডার */}
      <div className="bg-surface-card border-b border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <AdminPageHeader
            title="ব্যবসায়িক রিপোর্ট ও আর্থিক বিশ্লেষণ"
            backHref="/"
            backTitle="ড্যাশবোর্ডে ফিরুন"
            icon={<ChartBar size={16} weight="bold" />}
            badge={<Badge variant="brand">আর্থিক রিপোর্ট</Badge>}
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchAllReports()}
                  disabled={isAnyLoading}
                  className={buttonClasses({ variant: 'secondary', size: 'xs' })}
                  title="তথ্য রিফ্রেশ করুন"
                >
                  <ArrowClockwise size={14} weight="bold" className={isAnyLoading ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">রিফ্রেশ</span>
                </button>

                <Link
                  href="/pos"
                  className={buttonClasses({ variant: 'primary', size: 'xs' })}
                >
                  <ShoppingCart size={14} weight="bold" />
                  <span className="hidden sm:inline">পিওএস কাউন্টার</span>
                </Link>
              </div>
            }
          />
        </div>
      </div>

      {/* ২. মেইন কন্টেন্ট ক্যানভাস */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-due-bg border border-due-border text-due-text text-xs font-medium flex items-center gap-2">
            <Warning size={15} weight="fill" className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: DATE FILTER BAR */}
        <div className="bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
            <Calendar size={16} weight="bold" className="text-brand-deep" />
            <span>রিপোর্ট ও লাভ-ক্ষতির সময়কাল:</span>
          </div>

          <div className="overflow-x-auto pb-0.5 scrollbar-none w-full sm:w-auto">
            <UnifiedDateRangeFilter
              defaultFilter="today"
              syncWithUrl={false}
              onRangeChange={handleRangeChange}
            />
          </div>
        </div>

        {/* SECTION 2: PROFIT & LOSS STATEMENT */}
        <div className="bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-border-default bg-surface-subtle/60 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
                <Receipt size={18} weight="bold" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ink-primary">
                  আয় ও লাভ-ক্ষতি বিবরণী
                </h2>
              </div>
            </div>

            {profitLoss && (
              <Badge variant={profitLoss.netProfit.isProfitable ? 'cash' : 'due'} className="font-mono">
                {profitLoss.netProfit.isProfitable ? (
                  <TrendUp size={14} weight="bold" />
                ) : (
                  <TrendDown size={14} weight="bold" />
                )}
                <span>
                  {profitLoss.netProfit.isProfitable ? 'নিট মুনাফা' : 'নিট লোকসান'} ({toBanglaDigits(profitLoss.netProfit.netMarginPercent)})
                </span>
              </Badge>
            )}
          </div>

          <div className="p-4">
            {isLoadingPnl ? (
              <div className="p-8 text-center text-ink-secondary text-xs">
                <div className="w-5 h-5 border-2 border-brand-deep border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                লাভ-ক্ষতি তথ্য হিসাব করা হচ্ছে...
              </div>
            ) : profitLoss ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ১. বিক্রয় ও রাজস্ব */}
                <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-default space-y-2.5">
                  <span className="text-xs font-bold text-ink-secondary block">
                    বিক্রয় ও রাজস্ব
                  </span>
                  <div>
                    <div className="text-xs text-ink-secondary">
                      মোট বিক্রয় রাজস্ব ({formatNumber(profitLoss.salesSummary.totalInvoices)} টি মেমো)
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-ink-primary mt-0.5">
                      {formatCurrency(profitLoss.salesSummary.totalSalesRevenue)}
                    </div>
                  </div>
                  <div className="text-xs text-ink-body pt-2 border-t border-border-default flex justify-between">
                    <span>প্রদত্ত ছাড়:</span>
                    <span className="font-mono tabular-nums font-semibold">
                      {formatCurrency(profitLoss.salesSummary.totalDiscountGiven)}
                    </span>
                  </div>
                </div>

                {/* ২. মালের ক্রয়মূল্য ও মোট লাভ */}
                <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-default space-y-2.5">
                  <span className="text-xs font-bold text-ink-secondary block">
                    মালের ক্রয়মূল্য ও মোট লাভ
                  </span>
                  <div>
                    <div className="text-xs text-ink-secondary">বিক্রিত পণ্যের ক্রয়মূল্য</div>
                    <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-ink-body mt-0.5">
                      {formatCurrency(profitLoss.salesSummary.costOfGoodsSold)}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border-default">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-ink-primary">মোট লাভ:</span>
                      <span className="font-mono tabular-nums font-bold text-ink-primary text-sm">
                        {formatCurrency(profitLoss.salesSummary.grossProfit)}
                      </span>
                    </div>
                    <div className="text-xs text-ink-secondary mt-0.5">
                      গ্রস মার্জিন:{' '}
                      <span className="font-semibold text-ink-body font-mono tabular-nums">
                        {toBanglaDigits(profitLoss.salesSummary.grossMarginPercent)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ৩. কর্তন ও চূড়ান্ত নিট লাভ (Soft Navy Highlight Card — Replaces Glaring Dark Box) */}
                <div className="p-4 rounded-xl bg-brand-soft/75 text-ink-primary space-y-2.5 border border-brand-light shadow-[0_1px_2px_rgba(30,74,122,0.06)]">
                  <span className="text-xs font-bold text-brand-deep block">
                    কর্তন ও চূড়ান্ত নিট লাভ
                  </span>
                  <div className="space-y-1.5 text-xs text-ink-body">
                    <div className="flex justify-between">
                      <span>মালের অপচয় ও ঘাটতি ক্ষতি:</span>
                      <span className="font-mono tabular-nums text-due-text font-semibold">
                        - {formatCurrency(profitLoss.deductions.wastageLoss)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>দোকান পরিচালনা খরচ:</span>
                      <span className="font-mono tabular-nums text-due-text font-semibold">
                        - {formatCurrency(profitLoss.deductions.operatingExpenses)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-brand-light">
                    <div className="text-xs text-ink-secondary font-semibold">প্রকৃত নিট মুনাফা</div>
                    <div
                      className={`text-xl sm:text-2xl font-black font-mono tabular-nums mt-0.5 ${
                        profitLoss.netProfit.isProfitable ? 'text-cash-text' : 'text-due-text'
                      }`}
                    >
                      {profitLoss.netProfit.isProfitable ? '+' : ''}
                      {formatCurrency(profitLoss.netProfit.amount)}
                    </div>
                    <div className="text-xs text-ink-secondary mt-0.5">
                      নিট লাভের অনুপাত:{' '}
                      <span className="font-bold text-brand-deep font-mono tabular-nums">
                        {toBanglaDigits(profitLoss.netProfit.netMarginPercent)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-secondary">কোনো তথ্য পাওয়া যায়নি</p>
            )}
          </div>
        </div>

        {/* SECTION 3: INVENTORY CAPITAL VALUATION & LOW STOCK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-default mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
                  <Package size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink-primary">
                    ইনভেন্টরি ক্যাপিটাল ও স্টক ভ্যালুয়েশন
                  </h3>
                  <p className="text-xs text-ink-secondary">
                    সক্রিয় পণ্য: {formatNumber(inventoryValuation?.totalVariantsCount || 0)} টি
                  </p>
                </div>
              </div>
            </div>

            {isLoadingValuation ? (
              <div className="p-8 text-center text-ink-secondary text-xs">
                ইনভেন্টরি মূলধন হিসাব করা হচ্ছে...
              </div>
            ) : inventoryValuation ? (
              <div className="space-y-3.5">
                <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-ink-secondary block mb-0.5">
                      বর্তমান ক্রয়মূল্যে মোট ইনভেন্টরি মূলধন
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-ink-primary">
                      {formatCurrency(inventoryValuation.valuation.totalCostValuation)}
                    </div>
                  </div>
                  <div className="sm:text-right sm:border-l sm:border-border-default sm:pl-4">
                    <span className="text-xs font-semibold text-cash-text block mb-0.5">
                      সম্ভাব্য খুচরা বিক্রয় মূল্য
                    </span>
                    <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-cash-text">
                      {formatCurrency(inventoryValuation.valuation.totalRetailValuation)}
                    </div>
                    <span className="text-xs text-ink-secondary font-mono tabular-nums">
                      সম্ভাব্য মোট লাভ: {formatCurrency(inventoryValuation.valuation.potentialRetailProfit)}
                    </span>
                  </div>
                </div>

                {/* Wholesale Valuation Strip (Amber Semantic Strip) */}
                <div className="p-3 bg-wholesale-bg/60 border border-wholesale-border/50 rounded-lg flex items-center justify-between text-xs text-wholesale-text">
                  <span className="font-semibold">
                    পাইকারি দর অনুযায়ী বিক্রয় সম্ভাবনা:
                  </span>
                  <span className="font-mono tabular-nums font-bold text-sm">
                    {formatCurrency(inventoryValuation.valuation.totalWholesaleValuation)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Low Stock Warning Card */}
          <div className="bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-wholesale-bg text-wholesale-text border border-wholesale-border/60 flex items-center justify-center">
                  <Warning size={16} weight="bold" />
                </div>
                <h4 className="font-bold text-sm text-ink-primary">স্টক সতর্কতা</h4>
              </div>

              {inventoryValuation?.lowStock && inventoryValuation.lowStock.count > 0 ? (
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {inventoryValuation.lowStock.items.slice(0, 5).map((item) => (
                    <div
                      key={item.variantId}
                      className="p-2 bg-surface-subtle rounded-lg border border-border-default flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-ink-primary truncate max-w-[140px]">{item.name}</span>
                      <span className="font-mono tabular-nums text-due-text font-bold">
                        {formatWeight(item.stockQuantity, item.baseUnitName)}
                      </span>
                    </div>
                  ))}
                  {inventoryValuation.lowStock.count > 5 && (
                    <p className="text-xs text-ink-secondary text-center font-mono tabular-nums">
                      + আরও {formatNumber(inventoryValuation.lowStock.count - 5)} টি সংকটপূর্ণ আইটেম আছে
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-ink-secondary text-xs">
                  <CheckCircle size={24} className="text-success mx-auto mb-1" />
                  <p>সকল পণ্যের স্টক পর্যাপ্ত রয়েছে</p>
                </div>
              )}
            </div>

            <Link
              href="/products"
              className="mt-3 w-full py-2 bg-brand-soft hover:bg-brand-light/60 active:scale-[0.98] text-brand-deep text-xs font-semibold rounded-lg text-center transition-colors block border border-brand-light"
            >
              ক্যাটালগে স্টক ও মূল্য পরিচালনা করুন →
            </Link>
          </div>
        </div>

        {/* SECTION 4: MARKET DUES & PAYABLES */}
        <div className="bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-default mb-3.5 gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
                <Scales size={18} weight="bold" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink-primary">
                  বাজারের দেনা ও পাওনা খাতা
                </h3>
              </div>
            </div>

            {duesSummary && (() => {
              const rawStatus = duesSummary.netKhataStanding.status || '';
              const isDeficit = /^DEFICIT\b/i.test(rawStatus);
              const isSurplus = /^SURPLUS\b/i.test(rawStatus);
              const cleanStatus = toBanglaDigits(
                rawStatus
                  .replace(/^DEFICIT\s*/i, 'ঘাটতি: ')
                  .replace(/^SURPLUS\s*/i, 'উদ্বৃত্ত: ')
                  .replace(/^BALANCED\s*/i, 'সমান: ')
                  .replace(/\(([^)]+)\)/, '$1')
                  .trim()
              );
              return (
                <Badge variant={isDeficit ? 'due' : isSurplus ? 'cash' : 'neutral'}>
                  {cleanStatus}
                </Badge>
              );
            })()}
          </div>

          {isLoadingDues ? (
            <div className="p-8 text-center text-ink-secondary text-xs">খাতা তথ্য লোড হচ্ছে...</div>
          ) : duesSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Receivables */}
              <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-default space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-body flex items-center gap-1.5">
                    <Users size={15} weight="bold" className="text-brand-deep" />
                    কাস্টমারদের কাছে বাকি পাওনা ({formatNumber(duesSummary.customerDues.debtorsCount)} জন)
                  </span>
                  <Link
                    href="/khata/customers"
                    className="text-xs text-brand-deep font-semibold hover:underline"
                  >
                    বাকি খাতা →
                  </Link>
                </div>

                <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-due-text">
                  {formatCurrency(duesSummary.customerDues.totalOutstanding)}
                </div>

                <div className="pt-2 border-t border-border-default space-y-1.5">
                  <span className="text-xs font-semibold text-ink-secondary block">শীর্ষ ৫ দেনাদার:</span>
                  {duesSummary.customerDues.topDebtors.map((d) => (
                    <div key={d.id} className="flex justify-between text-xs py-1 border-b border-border-subtle">
                      <div>
                        <span className="font-semibold text-ink-primary">{d.name}</span>
                        <span className="text-xs text-ink-secondary ml-1.5 font-mono tabular-nums">({d.phone})</span>
                      </div>
                      <span className="font-mono tabular-nums font-bold text-ink-primary">
                        {formatCurrency(d.currentDue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplier Payables */}
              <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-default space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-body flex items-center gap-1.5">
                    <Truck size={15} weight="bold" className="text-brand-deep" />
                    মহাজনদের পাওনা দেনা ({formatNumber(duesSummary.supplierPayables.creditorsCount)} জন)
                  </span>
                  <Link
                    href="/khata/suppliers"
                    className="text-xs text-brand-deep font-semibold hover:underline"
                  >
                    মহাজন খাতা →
                  </Link>
                </div>

                <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-wholesale-text">
                  {formatCurrency(duesSummary.supplierPayables.totalOutstanding)}
                </div>

                <div className="pt-2 border-t border-border-default space-y-1.5">
                  <span className="text-xs font-semibold text-ink-secondary block">শীর্ষ ৫ পাওনাদার মহাজন:</span>
                  {duesSummary.supplierPayables.topCreditors.map((s) => (
                    <div key={s.id} className="flex justify-between text-xs py-1 border-b border-border-subtle">
                      <div>
                        <span className="font-semibold text-ink-primary">{s.companyName || s.name}</span>
                        <span className="text-xs text-ink-secondary ml-1.5 font-mono tabular-nums">({s.phone})</span>
                      </div>
                      <span className="font-mono tabular-nums font-bold text-ink-primary">
                        {formatCurrency(s.currentPayable)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* SECTION 5: TOP SELLING PRODUCTS LEADERBOARD */}
        <div className="bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-default mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
                <ChartBar size={18} weight="bold" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink-primary">
                  সর্বোচ্চ বিক্রিত পণ্য তালিকা
                </h3>
              </div>
            </div>
          </div>

          {isLoadingTopSelling ? (
            <div className="p-8 text-center text-ink-secondary text-xs">শীর্ষ পণ্য তালিকা লোড হচ্ছে...</div>
          ) : topSelling.length === 0 ? (
            <p className="text-xs text-ink-secondary text-center py-6">কোনো বিক্রয় রেকর্ড নেই</p>
          ) : (
            <div className="space-y-2.5">
              {topSelling.map((item, index) => {
                const maxRevenue = topSelling[0]?.totalRevenue || 1;
                const percentage = Math.round((item.totalRevenue / maxRevenue) * 100);

                return (
                  <div key={item.variantId} className="p-3 bg-surface-subtle/70 rounded-lg border border-border-default">
                    <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-brand-soft text-brand-deep border border-brand-light font-bold text-xs font-mono tabular-nums flex items-center justify-center shrink-0">
                          {formatNumber(index + 1)}
                        </span>
                        <span className="font-bold text-ink-primary truncate">{item.name}</span>
                        <span className="text-xs text-ink-secondary bg-surface-card px-2 py-0.5 rounded border border-border-default shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono tabular-nums font-bold text-ink-primary text-xs sm:text-sm">
                          {formatCurrency(item.totalRevenue)}
                        </span>
                        <span className="text-ink-secondary text-xs ml-1.5 font-mono tabular-nums">
                          ({formatWeight(item.totalSoldQuantity, item.baseUnitName)})
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-border-default rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-deep h-1.5 rounded-full transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
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
