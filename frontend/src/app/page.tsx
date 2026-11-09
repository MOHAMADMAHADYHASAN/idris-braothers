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
  FileText,
} from '@phosphor-icons/react/dist/ssr';
import { KpiCard } from '@/components/ui/KpiCard';
import { StoreShutterHero } from '@/components/StoreShutterHero';

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
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-20 md:pb-12">
      {/* 0. Store Shutter Roll-up Reveal Hero */}
      <StoreShutterHero
        storeName="ইদ্রিস ব্রাদার্স"
        storeTagline="মুদি ও মসলার আড়ত • মরিচপট্টি, ফেনী বাজার"
        imageSrc="/images/shutter/store_shutter.jpg"
      />

      {/* 1. Global Shell Header */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Storefront size={20} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-sm sm:text-base text-slate-900 leading-tight">
                  ইদ্রিস ব্রাদার্স
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  কাউন্টার চালু
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                মুদি ও মসলার পাইকারি আড়ত • মরিচপট্টি, ফেনী বাজার
              </p>
            </div>
          </div>

          {/* Quick Jump to POS Button */}
          <Link
            href="/pos"
            className="h-9 px-3.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-2 shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-[background-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
          >
            <ShoppingCart size={16} weight="bold" />
            <span>পিওএস ক্যাশ কাউন্টার</span>
            <ArrowRight size={14} weight="bold" className="hidden sm:block" />
          </Link>
        </div>
      </header>

      {/* 2. Main Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* ================================================================= */}
        {/* TIER 1: PRIMARY 2x2 KPI GRID (৪টি মুখ্য ফিন্যান্সিয়াল মেট্রিক) */}
        {/* ================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              দৈনিক আর্থিক ওভারভিউ (Live Financial KPIs)
            </h2>
            <span className="text-[11px] text-slate-400">
              ক্লিক করে পূর্ণ সংখ্যা দেখুন
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="আজকের মোট বিক্রি (Sales Revenue)"
              exactValue={totalSales}
              icon={<TrendUp size={18} weight="bold" className="text-slate-700" />}
              periodText="আজকের ক্যাশ ও বাকি মিলিয়ে"
            />
            <KpiCard
              label="ক্যাশ ড্রয়ারে নগদ (Net Cash in Hand)"
              exactValue={cashInHand}
              icon={<Wallet size={18} weight="bold" className="text-slate-700" />}
              periodText="নগদ গ্রহণ - নগদ প্রদান"
            />
            <KpiCard
              label="বাজারে মোট বকেয়া (Customer Dues)"
              exactValue={customerReceivables}
              icon={<Users size={18} weight="bold" className="text-slate-700" />}
              periodText="খদ্দেরদের কাছে মোট পাওনা"
            />
            <KpiCard
              label="মহাজন দেনা (Supplier Payables)"
              exactValue={supplierPayables}
              icon={<Truck size={18} weight="bold" className="text-slate-700" />}
              periodText="আড়তদারদের কাছে দোকানের দেনা"
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* TIER 2: SPOTLIGHT HERO CARD (নিট লাভ ও মার্জিন স্পটলাইট) */}
        {/* ================================================================= */}
        <div className="bg-slate-900 rounded-lg p-5 sm:p-6 text-white border border-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  অপারেটিং নিট প্রফিট (Net Profit Engine)
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black font-mono tabular-nums tracking-tight text-white">
                  ৳{netProfit.toLocaleString('en-BD')}
                </span>
                <span className="text-xs font-medium font-mono tabular-nums tracking-tight text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/80">
                  মার্জিন: {netMargin}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
                * মোট বিক্রয় থেকে মালের কেনা রেট (COGS), শুকিয়ে ওজন হ্রাসের অপচয় (Shrinkage) এবং দৈনিক কুলি/বিদ্যুৎ খরচ বাদ দিয়ে স্বয়ংক্রিয়ভাবে হিসাবকৃত।
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/pos"
                className="h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-[0_1px_2px_rgba(5,150,105,0.2)] transition-[background-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
              >
                <ShoppingCart size={16} weight="bold" />
                নতুন বিক্রি শুরু করুন
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TIER 3: STORE MODULES QUICK LAUNCHER (মডিউল নেভিগেশন) */}
        {/* ================================================================= */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
            দোকানের মূল মডিউলসমূহ (Quick Management Portals)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <Link
              href="/pos"
              className="bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.02)] rounded-lg p-3.5 transition-[border-color,transform] duration-150 active:scale-[0.98] flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 flex items-center justify-center transition-colors duration-150 mb-2">
                <ShoppingCart size={19} weight="bold" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900">পিওএস কাউন্টার</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">ক্যাশ ও বাকি বিক্রি</p>
            </Link>

            <Link
              href="/sales"
              className="bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.02)] rounded-lg p-3.5 transition-[border-color,transform] duration-150 active:scale-[0.98] flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 flex items-center justify-center transition-colors duration-150 mb-2">
                <FileText size={19} weight="bold" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900">মেমো রেজিস্টার</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">অর্ডার হিস্ট্রি ও রসিদ</p>
            </Link>

            <Link
              href="/purchases"
              className="bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.02)] rounded-lg p-3.5 transition-[border-color,transform] duration-150 active:scale-[0.98] flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 flex items-center justify-center transition-colors duration-150 mb-2">
                <Receipt size={19} weight="bold" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900">চালান এন্ট্রি</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">মোকাম মাল ও স্টক ইন</p>
            </Link>

            <Link
              href="/products"
              className="bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.02)] rounded-lg p-3.5 transition-[border-color,transform] duration-150 active:scale-[0.98] flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 flex items-center justify-center transition-colors duration-150 mb-2">
                <Package size={19} weight="bold" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900">পণ্য ও স্টক</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">৪ দশমিক ও বস্তা রূপান্তর</p>
            </Link>

            <Link
              href="/khata/customers"
              className="bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.02)] rounded-lg p-3.5 transition-[border-color,transform] duration-150 active:scale-[0.98] flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 flex items-center justify-center transition-colors duration-150 mb-2">
                <Users size={19} weight="bold" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900">বাকি খাতা</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">নগদ আদায় ও লেজার</p>
            </Link>

            <Link
              href="/khata/suppliers"
              className="bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.02)] rounded-lg p-3.5 transition-[border-color,transform] duration-150 active:scale-[0.98] flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 flex items-center justify-center transition-colors duration-150 mb-2">
                <Truck size={19} weight="bold" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900">মহাজনের খাতা</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">চালান ও দেনা শোধ</p>
            </Link>

            <Link
              href="/cashbox"
              className="bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.02)] rounded-lg p-3.5 transition-[border-color,transform] duration-150 active:scale-[0.98] flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 flex items-center justify-center transition-colors duration-150 mb-2">
                <Wallet size={19} weight="bold" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900">ক্যাশবাক্স ও খরচ</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">ড্রয়ার ক্যাশ ক্লোজিং</p>
            </Link>

            <Link
              href="/reports"
              className="bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.02)] rounded-lg p-3.5 transition-[border-color,transform] duration-150 active:scale-[0.98] flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 flex items-center justify-center transition-colors duration-150 mb-2">
                <Receipt size={19} weight="bold" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900">রিপোর্ট ও প্রফিট</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">লাভ-ক্ষতি ও স্টক ভ্যালু</p>
            </Link>
          </div>
        </div>
      </main>

      {/* 3. 5-Slot Fixed Bottom Command Center (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around shadow-[0_-1px_3px_rgba(15,23,42,0.06)]">
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 text-slate-900 py-1 px-3 cursor-pointer"
        >
          <Storefront size={19} weight="bold" />
          <span className="text-[10px] font-semibold">হোম</span>
        </Link>

        <Link
          href="/khata/customers"
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 py-1 px-3 cursor-pointer"
        >
          <Users size={19} weight="bold" />
          <span className="text-[10px] font-medium">বাকি খাতা</span>
        </Link>

        {/* Elevated Center Button for Quick POS Jump */}
        <Link
          href="/pos"
          className="w-11 h-11 -mt-4 rounded-md bg-slate-900 text-white flex items-center justify-center shadow-md border-2 border-white active:scale-95 transition-transform duration-150 cursor-pointer"
          title="পিওএস টার্মিনাল"
        >
          <ShoppingCart size={20} weight="bold" />
        </Link>

        <Link
          href="/products"
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 py-1 px-3 cursor-pointer"
        >
          <Package size={19} weight="bold" />
          <span className="text-[10px] font-medium">পণ্য</span>
        </Link>

        <Link
          href="/cashbox"
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 py-1 px-3 cursor-pointer"
        >
          <Wallet size={19} weight="bold" />
          <span className="text-[10px] font-medium">ক্যাশবাক্স</span>
        </Link>
      </nav>
    </div>
  );
}
