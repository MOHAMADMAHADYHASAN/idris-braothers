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
  Storefront,
  FileText,
} from '@phosphor-icons/react/dist/ssr';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { DashboardHeaderWithShutter } from '@/components/DashboardHeaderWithShutter';
import { formatCurrency, toBanglaDigits } from '@/lib/decimal';

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
  } catch {
    return { cashbox: null, dues: null, pnl: null };
  }
}

const DASHBOARD_MODULES = [
  {
    href: '/pos',
    title: 'পিওএস কাউন্টার',
    subtitle: 'ক্যাশ ও বাকি বিক্রি',
    Icon: ShoppingCart,
  },
  {
    href: '/sales',
    title: 'মেমো রেজিস্টার',
    subtitle: 'অর্ডার হিস্ট্রি ও রসিদ',
    Icon: FileText,
  },
  {
    href: '/purchases',
    title: 'চালান এন্ট্রি',
    subtitle: 'মোকাম মাল ও স্টক ইন',
    Icon: Receipt,
  },
  {
    href: '/products',
    title: 'পণ্য ও স্টক',
    subtitle: '৪ দশমিক ও বস্তা রূপান্তর',
    Icon: Package,
  },
  {
    href: '/khata/customers',
    title: 'বাকি খাতা',
    subtitle: 'নগদ আদায় ও লেজার',
    Icon: Users,
  },
  {
    href: '/khata/suppliers',
    title: 'মহাজনের খাতা',
    subtitle: 'চালান ও দেনা শোধ',
    Icon: Truck,
  },
  {
    href: '/cashbox',
    title: 'ক্যাশবাক্স ও খরচ',
    subtitle: 'ড্রয়ার ক্যাশ ক্লোজিং',
    Icon: Wallet,
  },
  {
    href: '/reports',
    title: 'রিপোর্ট ও প্রফিট',
    subtitle: 'লাভ-ক্ষতি ও স্টক ভ্যালু',
    Icon: TrendUp,
  },
];

export default async function DashboardPage() {
  const { cashbox, dues, pnl } = await getDashboardData();

  const totalSales = pnl ? parseFloat(pnl.salesSummary?.totalSalesRevenue || '0') : 0;
  const cashInHand = cashbox ? parseFloat(cashbox.netCashInHand || '0') : 0;
  const customerReceivables = dues ? parseFloat(dues.customers?.totalReceivable || '0') : 0;
  const supplierPayables = dues ? parseFloat(dues.suppliers?.totalPayable || '0') : 0;
  const netProfit = pnl ? parseFloat(pnl.netProfit?.amount || '0') : 0;
  const netMargin = pnl ? pnl.netProfit?.netMarginPercent || '0%' : '0%';

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-primary pb-24 md:pb-12">
      {/* ১. সমন্বিত হেডার ও স্টোর শাটার */}
      <DashboardHeaderWithShutter />

      {/* ২. মেইন কন্টেন্ট ক্যানভাস */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* TIER 1: ৪টি মুখ্য আর্থিক মেট্রিক */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-ink-primary">
              দৈনিক আর্থিক ওভারভিউ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <KpiCard
              label="আজকের মোট বিক্রি"
              exactValue={totalSales}
              icon={<TrendUp size={18} weight="bold" />}
            />
            <KpiCard
              label="ক্যাশ ড্রয়ারে নগদ"
              exactValue={cashInHand}
              icon={<Wallet size={18} weight="bold" />}
            />
            <KpiCard
              label="বাজারে মোট বকেয়া"
              exactValue={customerReceivables}
              icon={<Users size={18} weight="bold" />}
            />
            <KpiCard
              label="মহাজন দেনা"
              exactValue={supplierPayables}
              icon={<Truck size={18} weight="bold" />}
            />
          </div>
        </section>

        {/* TIER 2: অপারেটিং নিট প্রফিট সামারি (Soft Navy Editorial Card — Anti-Fatigue Light UI) */}
        <section className="bg-brand-soft/65 rounded-xl p-5 sm:p-6 border border-brand-light shadow-[0_1px_2px_rgba(30,74,122,0.06)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-deep" />
                <span className="text-sm font-bold text-brand-deep">
                  অপারেটিং নিট প্রফিট
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-ink-primary">
                  {formatCurrency(netProfit, false)}
                </span>
                <Badge variant={netProfit >= 0 ? 'cash' : 'due'} className="text-xs px-2.5 py-1">
                  মার্জিন: {toBanglaDigits(netMargin)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/pos"
                className={buttonClasses({ variant: 'primary', size: 'md' })}
              >
                <ShoppingCart size={17} weight="bold" />
                <span>নতুন বিক্রি শুরু করুন</span>
              </Link>
            </div>
          </div>
        </section>

        {/* TIER 3: স্টোর মডিউলসমূহ */}
        <section>
          <h2 className="text-sm font-bold text-ink-primary mb-3">
            দোকানের মূল মডিউলসমূহ
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {DASHBOARD_MODULES.map(({ href, title, subtitle, Icon }) => (
              <Link
                key={href}
                href={href}
                className="bg-surface-card border border-border-default hover:border-brand-mid shadow-[0_1px_2px_rgba(15,23,42,0.02)] rounded-xl p-3.5 transition-[border-color,transform] duration-150 active:scale-[0.98] flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-soft border border-brand-light/70 text-brand-deep group-hover:bg-brand-deep group-hover:text-white group-hover:border-brand-deep flex items-center justify-center transition-colors duration-150 mb-2.5">
                  <Icon size={20} weight="bold" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-ink-primary">{title}</h3>
                <p className="text-xs text-ink-secondary mt-0.5 leading-snug">{subtitle}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* ৩. মোবাইল বটম নেভিগেশন */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card border-t border-border-default px-2 py-1.5 flex items-center justify-around shadow-[0_-1px_3px_rgba(15,23,42,0.06)]">
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 text-brand-deep py-1 px-3 cursor-pointer"
        >
          <Storefront size={19} weight="bold" />
          <span className="text-xs font-semibold">হোম</span>
        </Link>

        <Link
          href="/khata/customers"
          className="flex flex-col items-center gap-0.5 text-ink-secondary hover:text-brand-deep py-1 px-3 cursor-pointer"
        >
          <Users size={19} weight="bold" />
          <span className="text-xs font-medium">বাকি খাতা</span>
        </Link>

        {/* Elevated Center POS Button */}
        <Link
          href="/pos"
          className="w-12 h-12 -mt-4 rounded-xl bg-brand-deep text-white flex items-center justify-center shadow-md border-2 border-surface-card active:scale-95 transition-transform duration-150 cursor-pointer"
          title="পিওএস টার্মিনাল"
          aria-label="পিওএস টার্মিনাল খুলুন"
        >
          <ShoppingCart size={20} weight="bold" />
        </Link>

        <Link
          href="/products"
          className="flex flex-col items-center gap-0.5 text-ink-secondary hover:text-brand-deep py-1 px-3 cursor-pointer"
        >
          <Package size={19} weight="bold" />
          <span className="text-xs font-medium">পণ্য</span>
        </Link>

        <Link
          href="/cashbox"
          className="flex flex-col items-center gap-0.5 text-ink-secondary hover:text-brand-deep py-1 px-3 cursor-pointer"
        >
          <Wallet size={19} weight="bold" />
          <span className="text-xs font-medium">ক্যাশবাক্স</span>
        </Link>
      </nav>
    </div>
  );
}
