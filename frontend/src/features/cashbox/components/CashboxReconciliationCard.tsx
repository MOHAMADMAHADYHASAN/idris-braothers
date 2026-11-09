'use client';

import React from 'react';
import {
  Calculator,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useCashboxStore } from '../useCashboxStore';
import { ExpenseCategory } from '../cashbox.types';

function getCategoryBangla(cat: ExpenseCategory): string {
  switch (cat) {
    case 'LABOR_KULI':
      return 'কুলি / লেবার';
    case 'TRANSPORT_VAN':
      return 'ভ্যান / গাড়িভাড়া';
    case 'TEA_SNACKS':
      return 'চা-নাস্তা ও আপ্যায়ন';
    case 'ELECTRICITY_UTILITY':
      return 'বিদ্যুৎ ও ইউটিলিটি';
    case 'SHOP_MAINTENANCE':
      return 'দোকান সরঞ্জাম / পলিথিন';
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
      {/* বাঁয়ে: ইনফ্লো ও আউটফ্লোর বিস্তারিত অডিট হিসাব (৭ কলাম) */}
      <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3.5">
        <div className="border-b border-slate-200/90 pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
              <Receipt size={16} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                ক্যাশ ইনফ্লো বনাম আউটফ্লো বিস্তারিত বিবরণী
              </h3>
              <p className="text-[11px] text-slate-500">আজকের প্রতিটি খাতের নগদ আদান-প্রদান</p>
            </div>
          </div>
        </div>

        {/* ইনফ্লো বিবরণী */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <ArrowDownLeft size={13} weight="bold" />
            <span>নগদ গ্রহণ (Cash Inflow Breakdown)</span>
          </div>
          <div className="bg-slate-50/80 rounded-md p-3 border border-slate-200/90 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span>কাউন্টার নগদ বিক্রি ({summary?.inflow.salesCount || 0} টি মেমো):</span>
              <strong className="font-mono tabular-nums tracking-tight font-bold text-emerald-700 text-sm">
                +৳{formatCurrency(summary?.inflow.cashFromSales || 0)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>কাস্টমার বকেয়া আদায় ({summary?.inflow.customerRepaymentsCount || 0} জন):</span>
              <strong className="font-mono tabular-nums tracking-tight font-bold text-emerald-700 text-sm">
                +৳{formatCurrency(summary?.inflow.cashFromCustomerRepayments || 0)}
              </strong>
            </div>
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-bold text-slate-900">
              <span>সর্বমোট নগদ জমা (Total Cash In):</span>
              <span className="font-mono tabular-nums tracking-tight text-emerald-800 text-base">
                +৳{formatCurrency(summary?.inflow.totalCashIn || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* আউটফ্লো বিবরণী */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpRight size={13} weight="bold" />
            <span>নগদ প্রদান ও খরচ (Cash Outflow Breakdown)</span>
          </div>
          <div className="bg-slate-50/80 rounded-md p-3 border border-slate-200/90 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span>চালান মাল কেনার নগদ প্রদান ({summary?.outflow.purchasesCount || 0} টি চালান):</span>
              <strong className="font-mono tabular-nums tracking-tight font-bold text-amber-800 text-sm">
                -৳{formatCurrency(summary?.outflow.cashForPurchases || 0)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>মহাজনদের দেনা শোধ ({summary?.outflow.supplierRepaymentsCount || 0} টি পেমেন্ট):</span>
              <strong className="font-mono tabular-nums tracking-tight font-bold text-amber-800 text-sm">
                -৳{formatCurrency(summary?.outflow.cashForSupplierRepayments || 0)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>দোকানের দৈনন্দিন খরচ ({summary?.outflow.expensesCount || 0} টি ভাউচার):</span>
              <strong className="font-mono tabular-nums tracking-tight font-bold text-red-600 text-sm">
                -৳{formatCurrency(summary?.outflow.totalExpenses || 0)}
              </strong>
            </div>
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-bold text-slate-900">
              <span>সর্বমোট নগদ ব্যয় (Total Cash Out):</span>
              <span className="font-mono tabular-nums tracking-tight text-amber-800 text-base">
                -৳{formatCurrency(summary?.outflow.totalCashOut || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* খরচের ক্যাটাগরি ব্রেকডাউন */}
        {summary?.outflow.expenseBreakdown && summary.outflow.expenseBreakdown.length > 0 && (
          <div className="pt-2 border-t border-slate-200/90">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              আজকের খরচের খাতভিত্তিক বিভাজন:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {summary.outflow.expenseBreakdown.map((b) => (
                <div
                  key={b.category}
                  className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/90 text-xs flex items-center gap-1.5"
                >
                  <span className="text-slate-600 text-[11px]">{getCategoryBangla(b.category)}:</span>
                  <strong className="font-mono tabular-nums tracking-tight text-slate-900 text-xs">
                    ৳{formatCurrency(b.amount)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ডানে: ফিজিক্যাল নোট গণক ও মিলকরণ (৫ কলাম) */}
      <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3.5">
        <div className="border-b border-slate-200/90 pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
              <Calculator size={16} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                ক্যাশ ড্রয়ার নোট গণক (Physical Cash Counter)
              </h3>
              <p className="text-[11px] text-slate-500">ক্যাশ ড্রয়ারের নোট গুনে লিখুন</p>
            </div>
          </div>
          <button
            onClick={resetDenominations}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium active:scale-[0.98] transition-colors"
          >
            রিসেট
          </button>
        </div>

        {/* নোট ইনপুট গ্রিড */}
        <div className="space-y-1.5 text-xs">
          {[
            { key: 'n1000' as const, note: 1000, label: '১০০০ টাকার নোট' },
            { key: 'n500' as const, note: 500, label: '৫০০ টাকার নোট' },
            { key: 'n200' as const, note: 200, label: '২০০ টাকার নোট' },
            { key: 'n100' as const, note: 100, label: '১০০ টাকার নোট' },
            { key: 'n50' as const, note: 50, label: '৫০ টাকার নোট' },
            { key: 'n20' as const, note: 20, label: '২০ টাকার নোট' },
            { key: 'n10' as const, note: 10, label: '১০ টাকার নোট / খুচরা' },
          ].map((item) => {
            const count = denominations[item.key] || 0;
            const sub = count * item.note;

            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-2 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-700 w-36 truncate">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">×</span>
                  <input
                    type="number"
                    min="0"
                    value={count || ''}
                    onChange={(e) => setDenomination(item.key, Number(e.target.value))}
                    placeholder="০"
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-md text-center font-mono tabular-nums font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
                  />
                  <span className="text-slate-400 text-[11px]">=</span>
                  <span className="font-mono tabular-nums tracking-tight font-bold text-slate-900 w-20 text-right">
                    ৳{formatCurrency(sub)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* গণনা ফলাফল ও অমিল স্ট্যাটাস বক্স */}
        <div className="pt-2.5 border-t border-slate-200/90 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600">গণনাকৃত মোট ক্যাশ:</span>
            <span className="font-mono tabular-nums tracking-tight font-black text-base text-slate-900">
              ৳{formatCurrency(countedTotal)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600">সফটওয়্যার ব্যালেন্স:</span>
            <span className="font-mono tabular-nums tracking-tight font-bold text-sm text-slate-700">
              ৳{formatCurrency(netCashInHand)}
            </span>
          </div>

          {/* মিল / অমিল সতর্কতা */}
          {countedTotal > 0 && (
            <div
              className={`p-2.5 rounded-md border flex items-center gap-2 text-xs font-semibold ${
                mismatch === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : mismatch > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {mismatch === 0 ? (
                <>
                  <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
                  <span>ক্যাশবাক্সের হিসাব ১০০% মিলেছে (Balanced ✅)</span>
                </>
              ) : mismatch > 0 ? (
                <>
                  <CheckCircle size={16} weight="fill" className="text-blue-600 shrink-0" />
                  <span>ড্রয়ারে ৳{formatCurrency(mismatch)} ক্যাশ উদ্বৃত্ত আছে</span>
                </>
              ) : (
                <>
                  <Warning size={16} weight="fill" className="text-red-600 shrink-0" />
                  <span>ড্রয়ারে ৳{formatCurrency(Math.abs(mismatch))} ক্যাশ ঘাটতি দেখা যাচ্ছে!</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
