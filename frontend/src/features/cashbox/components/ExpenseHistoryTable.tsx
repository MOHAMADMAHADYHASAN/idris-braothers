'use client';

import React, { useEffect } from 'react';
import {
  Trash,
  PencilSimple,
  Funnel,
  Receipt,
  CaretLeft,
  CaretRight,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useCashboxStore } from '../useCashboxStore';
import { ExpenseCategory, DailyExpense } from '../cashbox.types';

function getCategoryBadge(cat: ExpenseCategory): { label: string; badgeClass: string } {
  switch (cat) {
    case 'LABOR_KULI':
      return { label: 'কুলি / লেবার', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80' };
    case 'TRANSPORT_VAN':
      return { label: 'ভ্যান / গাড়িভাড়া', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80' };
    case 'TEA_SNACKS':
      return { label: 'চা-নাস্তা ও আপ্যায়ন', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' };
    case 'ELECTRICITY_UTILITY':
      return { label: 'বিদ্যুৎ ও ইউটিলিটি', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80' };
    case 'SHOP_MAINTENANCE':
      return { label: 'দোকান সরঞ্জাম / পলিথিন', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80' };
    case 'OTHER':
      return { label: 'বিবিধ খরচ', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80' };
    default:
      return { label: cat, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80' };
  }
}

export function ExpenseHistoryTable() {
  const {
    expenses,
    expensesMeta,
    isLoadingExpenses,
    categoryFilter,
    targetDate,
    setCategoryFilter,
    setExpensesPage,
    deleteExpense,
    openEditModal,
    fetchExpenses,
  } = useCashboxStore();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, targetDate, categoryFilter]);

  const handleDelete = async (id: string, desc: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${desc}" খরচটি মুছে ফেলতে চান?`)) {
      try {
        await deleteExpense(id);
      } catch (err) {
        alert('খরচ মুছে ফেলতে সমস্যা হয়েছে');
      }
    }
  };

  const totalExpenseToday = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3 p-3.5">
      {/* হেডার ও ক্যাটাগরি ফিল্টার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
            <Receipt size={16} weight="bold" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              দোকানের খরচের খাতা ({targetDate})
            </h4>
            <p className="text-[11px] text-slate-500">
              মোট খরচ: <strong className="font-mono tabular-nums tracking-tight text-red-600 font-bold">৳{formatCurrency(totalExpenseToday)}</strong>
            </p>
          </div>
        </div>

        {/* ক্যাটাগরি ফিল্টার পিলস */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs scrollbar-none">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1 shrink-0 text-[11px]">
            <Funnel size={12} weight="bold" />
            <span>ফিল্টার:</span>
          </span>
          {[
            { id: undefined, label: 'সব খরচ' },
            { id: 'LABOR_KULI', label: 'কুলি' },
            { id: 'TRANSPORT_VAN', label: 'গাড়িভাড়া' },
            { id: 'TEA_SNACKS', label: 'চা-নাস্তা' },
            { id: 'ELECTRICITY_UTILITY', label: 'বিদ্যুৎ' },
            { id: 'SHOP_MAINTENANCE', label: 'সরঞ্জাম' },
          ].map((cat) => (
            <button
              key={cat.label}
              onClick={() => setCategoryFilter(cat.id as ExpenseCategory | undefined)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.98] whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-[0_1px_2px_rgba(15,23,42,0.1)]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* খরচের টেবিল */}
      {isLoadingExpenses && expenses.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <ArrowsClockwise size={22} weight="bold" className="animate-spin mx-auto mb-2 text-slate-600" />
          <p className="text-xs">খরচের খাতা লোড হচ্ছে...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Receipt size={28} weight="bold" className="mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-medium text-slate-600">এই তারিখে কোনো খরচ রেকর্ড করা হয়নি</p>
        </div>
      ) : (
        <div className="border border-slate-200/90 rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-medium">
                <th className="py-2 px-3">সময়</th>
                <th className="py-2 px-3">খাত / ক্যাটাগরি</th>
                <th className="py-2 px-3">খরচের বিবরণ</th>
                <th className="py-2 px-3.5 text-right">টাকার পরিমাণ</th>
                <th className="py-2 px-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => {
                const badge = getCategoryBadge(expense.category);
                const timeStr = new Date(expense.createdAt).toLocaleTimeString('bn-BD', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* সময় */}
                    <td className="py-2 px-3 font-mono tabular-nums text-slate-500 text-xs whitespace-nowrap">
                      {timeStr}
                    </td>

                    {/* ক্যাটাগরি */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${badge.badgeClass}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* বিবরণ */}
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {expense.description}
                      {expense.note && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {expense.note}
                        </span>
                      )}
                    </td>

                    {/* টাকার পরিমাণ */}
                    <td className="py-2 px-3.5 text-right font-mono tabular-nums tracking-tight font-bold text-red-600">
                      -৳{formatCurrency(expense.amount)}
                    </td>

                    {/* অ্যাকশন বাটন */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="p-1.5 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-500 hover:text-slate-800 transition-[background-color,border-color,transform] duration-150"
                          title="সম্পাদনা করুন"
                        >
                          <PencilSimple size={13} weight="bold" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id, expense.description)}
                          className="p-1.5 rounded-md border border-slate-200/90 hover:bg-red-50 active:scale-[0.98] text-slate-400 hover:text-red-600 transition-[background-color,border-color,transform] duration-150"
                          title="মুছে ফেলুন"
                        >
                          <Trash size={13} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* পেজিনেশন */}
      {expensesMeta.totalPages > 1 && (
        <div className="px-3 py-2 bg-slate-50/80 rounded-md border border-slate-200/90 flex items-center justify-between text-xs text-slate-500">
          <span>
            পৃষ্ঠা <strong className="text-slate-800 font-mono tabular-nums">{expensesMeta.page}</strong> / <span className="font-mono tabular-nums">{expensesMeta.totalPages}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpensesPage(expensesMeta.page - 1)}
              disabled={expensesMeta.page <= 1 || isLoadingExpenses}
              className="p-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
            >
              <CaretLeft size={14} weight="bold" />
            </button>
            <button
              onClick={() => setExpensesPage(expensesMeta.page + 1)}
              disabled={expensesMeta.page >= expensesMeta.totalPages || isLoadingExpenses}
              className="p-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
