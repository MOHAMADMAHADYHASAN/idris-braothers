import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Package,
  Users,
  Truck,
  Wallet,
  TrendUp,
  Receipt,
  ArrowRight,
  Storefront,
} from '@phosphor-icons/react/dist/ssr';
import { KpiCard } from '@/components/ui/KpiCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getDashboardData() {
  try {
    const [cashboxRes, duesRes, pnlRes] = await Promise.all([
      fetch(`${API_BASE}/cashbox/daily-summary`, { cache: 'no-store' }),
      fetch(`${API_BASE}/reports/dues-summary`, { cache: 'no-store' }),
      fetch(`${API_BASE}/reports/profit-loss`, { cache: 'no-store' }),
    ]);

    const cashbox = cashboxRes.ok ? (await cashboxRes.json()).data : null;
    const dues = duesRes.ok ? (await duesRes.json()).data : null;
    const pnl = pnlRes.ok ? (await pnlRes.json()).data : null;

    return { cashbox, dues, pnl };
  } catch (err) {
    return { cashbox: null, dues: null, pnl: null };
  }
}

export default async function DashboardPage() {
  const { cashbox, dues, pnl } = await getDashboardData();

  const totalSales = pnl ? parseFloat(pnl.salesSummary?.totalSalesRevenue || '0') : 0;
  const cashInHand = cashbox ? parseFloat(cashbox.netCashInHand || '0') : 0;
  const customerReceivables = dues ? parseFloat(dues.customers?.totalReceivable || '0') : 0;
  const supplierPayables = dues ? parseFloat(dues.suppliers?.totalPayable || '0') : 0;
  const netProfit = pnl ? parseFloat(pnl.netProfit?.amount || '0') : 0;
  const netMargin = pnl ? pnl.netProfit?.netMarginPercent || '0%' : '0%';

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-primary pb-20 md:pb-12">
      {/* 1. Global Shell Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Storefront size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                  ইদ্রিস ব্রাদার্স
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  লাইভ কাউন্টার
                </span>
              </div>
              <p className="text-xs text-slate-500">
                মুদি ও মসলার আড়ত • মরিচপট্টি, ফেনী বাজার
              </p>
            </div>
          </div>

          {/* Quick Jump to POS Button */}
          <Link
            href="/pos"
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <ShoppingCart size={18} weight="bold" />
            <span>পিওএস ক্যাশ কাউন্টার</span>
            <ArrowRight size={16} weight="bold" className="hidden sm:block" />
          </Link>
        </div>
      </header>

      {/* 2. Main Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ================================================================= */}
        {/* TIER 1: PRIMARY 2x2 KPI GRID (৪টি মুখ্য ফিন্যান্সিয়াল মেট্রিক) */}
        {/* ================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              দৈনিক আর্থিক ওভারভিউ (Live Financial KPIs)
            </h2>
            <span className="text-[11px] text-slate-400">
              ট্যাপ করে আসল বা সংক্ষিপ্ত সংখ্যা দেখুন
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <KpiCard
              label="আজকের মোট বিক্রি (Sales Revenue)"
              exactValue={totalSales}
              icon={<TrendUp size={20} weight="bold" className="text-emerald-600" />}
              periodText="আজকের ক্যাশ ও বাকি মিলিয়ে"
            />
            <KpiCard
              label="ক্যাশ ড্রয়ারে নগদ (Net Cash in Hand)"
              exactValue={cashInHand}
              icon={<Wallet size={20} weight="bold" className="text-emerald-600" />}
              periodText="নগদ গ্রহণ - নগদ প্রদান"
            />
            <KpiCard
              label="বাজারে মোট বকেয়া (Customer Dues)"
              exactValue={customerReceivables}
              icon={<Users size={20} weight="bold" className="text-rose-600" />}
              periodText="খদ্দেরদের কাছে মোট পাওনা"
            />
            <KpiCard
              label="মহাজন দেনা (Supplier Payables)"
              exactValue={supplierPayables}
              icon={<Truck size={20} weight="bold" className="text-amber-600" />}
              periodText="আড়তদারদের কাছে দোকানের দেনা"
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* TIER 2: SPOTLIGHT HERO CARD (নিট লাভ ও মার্জিন স্পটলাইট) */}
        {/* ================================================================= */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-sm border border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  অপারেটিং নিট প্রফিট (Net Profit Engine)
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight tabular-numbers text-white">
                  ৳{netProfit.toLocaleString('en-BD')}
                </span>
                <span className="text-sm font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  মার্জিন: {netMargin}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 max-w-xl">
                * মোট বিক্রয় থেকে পণ্যের ক্রয়মূল্য (COGS), গরমে শুকিয়ে যাওয়ার অপচয় ক্ষতি (Wastage) এবং দৈনিক কুলি/বিদ্যুৎ খরচ সমন্বয় করে হিসাবকৃত।
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/pos"
                className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <ShoppingCart size={18} weight="bold" />
                নতুন বিক্রি শুরু করুন
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TIER 3: STORE MODULES QUICK LAUNCHER (মডিউল নেভিগেশন) */}
        {/* ================================================================= */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            দোকানের মূল মডিউলসমূহ (Quick Management Portals)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/pos"
              className="bg-white border border-slate-200 hover:border-emerald-600/70 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 flex items-center justify-center transition-colors mb-2.5">
                <ShoppingCart size={24} weight="bold" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">পিওএস কাউন্টার</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">দ্রুত ক্যাশ ও বাকি বিক্রি</p>
            </Link>

            <Link
              href="/products"
              className="bg-white border border-slate-200 hover:border-emerald-600/70 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-700 flex items-center justify-center transition-colors mb-2.5">
                <Package size={24} weight="bold" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">পণ্য ও স্টক</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">৪ দশমিক ও ডাইনামিক বস্তা</p>
            </Link>

            <Link
              href="/khata/customers"
              className="bg-white border border-slate-200 hover:border-emerald-600/70 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-50 group-hover:bg-rose-600 group-hover:text-white text-rose-700 flex items-center justify-center transition-colors mb-2.5">
                <Users size={24} weight="bold" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">কাস্টমার বাকি খাতা</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">নগদ আদায় ও লেজার</p>
            </Link>

            <Link
              href="/khata/suppliers"
              className="bg-white border border-slate-200 hover:border-emerald-600/70 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 group-hover:bg-amber-600 group-hover:text-white text-amber-700 flex items-center justify-center transition-colors mb-2.5">
                <Truck size={24} weight="bold" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">মহাজনের খাতা</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">চালান ও পাওনা পরিশোধ</p>
            </Link>

            <Link
              href="/cashbox"
              className="bg-white border border-slate-200 hover:border-emerald-600/70 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-700 flex items-center justify-center transition-colors mb-2.5">
                <Wallet size={24} weight="bold" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">ক্যাশবাক্স ও খরচ</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">ড্রয়ার ক্যাশ ক্লোজিং</p>
            </Link>

            <Link
              href="/reports"
              className="bg-white border border-slate-200 hover:border-emerald-600/70 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 group-hover:bg-purple-600 group-hover:text-white text-purple-700 flex items-center justify-center transition-colors mb-2.5">
                <Receipt size={24} weight="bold" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">রিপোর্ট ও প্রফিট</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">লাভ-ক্ষতি ও স্টক ভ্যালু</p>
            </Link>
          </div>
        </div>
      </main>

      {/* 3. 5-Slot Fixed Bottom Command Center (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 text-emerald-700 py-1 px-3 cursor-pointer"
        >
          <Storefront size={20} weight="bold" />
          <span className="text-[10px] font-bold">হোম</span>
        </Link>

        <Link
          href="/khata/customers"
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 py-1 px-3 cursor-pointer"
        >
          <Users size={20} weight="bold" />
          <span className="text-[10px] font-bold">বাকি খাতা</span>
        </Link>

        {/* Elevated Center FAB Button for Quick POS Jump */}
        <Link
          href="/pos"
          className="w-13 h-13 -mt-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-4 border-white active:scale-95 transition-transform cursor-pointer"
          title="পিওএস টার্মিনাল"
        >
          <ShoppingCart size={24} weight="bold" />
        </Link>

        <Link
          href="/products"
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 py-1 px-3 cursor-pointer"
        >
          <Package size={20} weight="bold" />
          <span className="text-[10px] font-bold">পণ্য</span>
        </Link>

        <Link
          href="/cashbox"
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 py-1 px-3 cursor-pointer"
        >
          <Wallet size={20} weight="bold" />
          <span className="text-[10px] font-bold">ক্যাশবাক্স</span>
        </Link>
      </nav>
    </div>
  );
}
