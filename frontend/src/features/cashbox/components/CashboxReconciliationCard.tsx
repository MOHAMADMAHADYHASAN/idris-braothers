'use client';

import React from 'react';
import {
  Calculator,
  CheckCircle,
  Warning,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
} from '@phosphor-icons/react';
import { formatCurrency, formatNumber } from '@/lib/decimal';
import { useCashboxStore } from '../useCashboxStore';
import { ExpenseCategory } from '../cashbox.types';

function getCategoryBangla(cat: ExpenseCategory): string {
  switch (cat) {
    case 'LABOR_KULI':
      return 'কুলি ও লেবার';
    case 'TRANSPORT_VAN':
      return 'ভ্যান ও গাড়িভাড়া';
    case 'TEA_SNACKS':
      return 'চা-নাস্তা ও আপ্যায়ন';
    case 'ELECTRICITY_UTILITY':
      return 'বিদ্যুৎ ও ইউটিলিটি';
    case 'SHOP_MAINTENANCE':
      return 'দোকান সরঞ্জাম ও পলিথিন';
    case 'OTHER':
      return 'বিবিধ খরচ';
    default:
      return cat;
  }
}

export function CashboxReconciliationCard() {
  const {
    summary,
    denominations,
    setDenomination,
    resetDenominations,
    getCalculatedNoteTotal,
  } = useCashboxStore();

  const netCashInHand = summary?.netCashInHand || 0;
  const countedTotal = getCalculatedNoteTotal();
  const mismatch = countedTotal - netCashInHand;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* বাঁয়ে: ইনফ্লো ও আউটফ্লোর বিস্তারিত অডিট হিসাব */}
      <div className="lg:col-span-7 bg-surface-card rounded-xl border border-border-default p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
        <div className="border-b border-border-default pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
              <Receipt size={16} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-ink-primary">
                নগদ আদান-প্রদানের বিস্তারিত বিবরণী
              </h3>
            </div>
          </div>
        </div>

        {/* ইনফ্লো বিবরণী */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-cash-text flex items-center gap-1">
            <ArrowDownLeft size={14} weight="bold" />
            <span>নগদ গ্রহণ</span>
          </div>
          <div className="bg-surface-subtle/70 rounded-lg p-3 border border-border-default space-y-2 text-xs">
            <div className="flex items-center justify-between text-ink-body">
              <span>কাউন্টার নগদ বিক্রি ({formatNumber(summary?.inflow.salesCount || 0)} টি মেমো):</span>
              <strong className="font-mono tabular-nums font-bold text-cash-text text-sm">
                +{formatCurrency(summary?.inflow.cashFromSales || 0)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-ink-body">
              <span>কাস্টমার বকেয়া আদায় ({formatNumber(summary?.inflow.customerRepaymentsCount || 0)} জন):</span>
              <strong className="font-mono tabular-nums font-bold text-cash-text text-sm">
                +{formatCurrency(summary?.inflow.cashFromCustomerRepayments || 0)}
              </strong>
            </div>
            <div className="border-t border-border-default pt-2 flex items-center justify-between font-bold text-ink-primary">
              <span>সর্বমোট নগদ জমা:</span>
              <span className="font-mono tabular-nums text-cash-text text-base">
                +{formatCurrency(summary?.inflow.totalCashIn || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* আউটফ্লো বিবরণী */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-wholesale-text flex items-center gap-1">
            <ArrowUpRight size={14} weight="bold" />
            <span>নগদ প্রদান ও খরচ</span>
          </div>
          <div className="bg-surface-subtle/70 rounded-lg p-3 border border-border-default space-y-2 text-xs">
            <div className="flex items-center justify-between text-ink-body">
              <span>চালান মাল কেনার নগদ প্রদান ({formatNumber(summary?.outflow.purchasesCount || 0)} টি চালান):</span>
              <strong className="font-mono tabular-nums font-bold text-wholesale-text text-sm">
                -{formatCurrency(summary?.outflow.cashForPurchases || 0)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-ink-body">
              <span>মহাজনদের দেনা শোধ ({formatNumber(summary?.outflow.supplierRepaymentsCount || 0)} টি পেমেন্ট):</span>
              <strong className="font-mono tabular-nums font-bold text-wholesale-text text-sm">
                -{formatCurrency(summary?.outflow.cashForSupplierRepayments || 0)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-ink-body">
              <span>দোকানের দৈনন্দিন খরচ ({formatNumber(summary?.outflow.expensesCount || 0)} টি ভাউচার):</span>
              <strong className="font-mono tabular-nums font-bold text-due-text text-sm">
                -{formatCurrency(summary?.outflow.totalExpenses || 0)}
              </strong>
            </div>
            <div className="border-t border-border-default pt-2 flex items-center justify-between font-bold text-ink-primary">
              <span>সর্বমোট নগদ ব্যয়:</span>
              <span className="font-mono tabular-nums text-wholesale-text text-base">
                -{formatCurrency(summary?.outflow.totalCashOut || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* খরচের ক্যাটাগরি ব্রেকডাউন */}
        {summary?.outflow.expenseBreakdown && summary.outflow.expenseBreakdown.length > 0 && (
          <div className="pt-2 border-t border-border-default">
            <span className="text-xs font-semibold text-ink-secondary block mb-1.5">
              আজকের খরচের খাতভিত্তিক বিভাজন:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {summary.outflow.expenseBreakdown.map((b) => (
                <div
                  key={b.category}
                  className="px-2.5 py-1 rounded-md bg-surface-subtle border border-border-default text-xs flex items-center gap-1.5"
                >
                  <span className="text-ink-secondary">{getCategoryBangla(b.category)}:</span>
                  <strong className="font-mono tabular-nums text-ink-primary">
                    {formatCurrency(b.amount)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ডানে: ফিজিক্যাল নোট গণনা */}
      <div className="lg:col-span-5 bg-surface-card rounded-xl border border-border-default p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3.5">
        <div className="border-b border-border-default pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
              <Calculator size={16} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-ink-primary">
                নোট গণনা (ক্যাশ ড্রয়ার)
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={resetDenominations}
            className="text-xs text-brand-deep hover:underline font-semibold active:scale-[0.98] transition-colors cursor-pointer"
          >
            রিসেট
          </button>
        </div>

        <div className="space-y-1.5 text-xs">
          {[
            { key: 'n1000' as const, note: 1000, label: '১০০০ টাকার নোট' },
            { key: 'n500' as const, note: 500, label: '৫০০ টাকার নোট' },
            { key: 'n200' as const, note: 200, label: '২০০ টাকার নোট' },
            { key: 'n100' as const, note: 100, label: '১০০ টাকার নোট' },
            { key: 'n50' as const, note: 50, label: '৫০ টাকার নোট' },
            { key: 'n20' as const, note: 20, label: '২০ টাকার নোট' },
            { key: 'n10' as const, note: 10, label: '১০ টাকার নোট ও খুচরা' },
          ].map((item) => {
            const count = denominations[item.key] || 0;
            const sub = count * item.note;

            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-2 px-2 py-1 rounded-md hover:bg-surface-subtle transition-colors"
              >
                <span className="font-medium text-ink-body w-36 truncate">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-secondary text-xs">×</span>
                  <input
                    type="number"
                    min="0"
                    value={count || ''}
                    onChange={(e) => setDenomination(item.key, Number(e.target.value))}
                    placeholder="০"
                    className="w-16 px-2 py-1 bg-surface-card border border-border-strong rounded-md text-center font-mono tabular-nums font-bold text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
                  />
                  <span className="text-ink-secondary text-xs">=</span>
                  <span className="font-mono tabular-nums font-bold text-ink-primary w-24 text-right">
                    {formatCurrency(sub)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2.5 border-t border-border-default space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-ink-secondary">গণনাকৃত মোট ক্যাশ:</span>
            <span className="font-mono tabular-nums font-black text-base text-ink-primary">
              {formatCurrency(countedTotal)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-ink-secondary">সফটওয়্যার ব্যালেন্স:</span>
            <span className="font-mono tabular-nums font-bold text-sm text-brand-deep">
              {formatCurrency(netCashInHand)}
            </span>
          </div>

          {countedTotal > 0 && (
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs font-semibold ${
                mismatch === 0
                  ? 'bg-cash-bg border-cash-border text-cash-text'
                  : mismatch > 0
                  ? 'bg-brand-soft border-brand-light text-brand-deep'
                  : 'bg-due-bg border-due-border text-due-text'
              }`}
            >
              {mismatch === 0 ? (
                <>
                  <CheckCircle size={16} weight="fill" className="text-success shrink-0" />
                  <span>ক্যাশবাক্সের হিসাব ১০০% মিলেছে</span>
                </>
              ) : mismatch > 0 ? (
                <>
                  <CheckCircle size={16} weight="fill" className="text-brand-deep shrink-0" />
                  <span>ড্রয়ারে {formatCurrency(mismatch)} ক্যাশ উদ্বৃত্ত আছে</span>
                </>
              ) : (
                <>
                  <Warning size={16} weight="fill" className="text-danger shrink-0" />
                  <span>ড্রয়ারে {formatCurrency(Math.abs(mismatch))} ক্যাশ ঘাটতি দেখা যাচ্ছে</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
