'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Trash,
  PencilSimple,
  Funnel,
  Receipt,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useCashboxStore } from '../useCashboxStore';
import { ExpenseCategory, DailyExpense } from '../cashbox.types';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';

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

  const columns: ColumnDef<DailyExpense>[] = useMemo(
    () => [
      {
        key: 'time',
        header: 'সময়',
        disableToggle: true,
        cellClassName: 'font-mono tabular-nums text-slate-500 text-xs whitespace-nowrap',
        renderCell: (expense) => {
          return new Date(expense.createdAt).toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit',
          });
        },
        renderFooterCell: () => (
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            মোট খরচ:
          </span>
        ),
      },
      {
        key: 'category',
        header: 'খাত / ক্যাটাগরি',
        cellClassName: 'whitespace-nowrap',
        renderCell: (expense) => {
          const badge = getCategoryBadge(expense.category);
          return (
            <span
              className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${badge.badgeClass}`}
            >
              {badge.label}
            </span>
          );
        },
      },
      {
        key: 'description',
        header: 'খরচের বিবরণ',
        cellClassName: 'font-medium text-slate-800',
        renderCell: (expense) => (
          <div>
            <span>{expense.description}</span>
            {expense.note && (
              <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                {expense.note}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'amount',
        header: 'টাকার পরিমাণ',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums tracking-tight font-bold text-rose-600 text-xs sm:text-sm',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-black text-rose-700 text-xs sm:text-sm',
        renderCell: (expense) => `-${formatCurrency(expense.amount)}`,
        renderFooterCell: (data) =>
          `-${formatCurrency(
            data.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
          )}`,
      },
      {
        key: 'actions',
        header: 'অ্যাকশন',
        headerClassName: 'text-center',
        cellClassName: 'text-center',
        disableToggle: true,
        renderCell: (expense) => (
          <div className="flex items-center justify-center gap-1 no-row-click">
            <button
              type="button"
              onClick={() => openEditModal(expense)}
              className="p-1.5 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-500 hover:text-slate-800 transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
              title="সম্পাদনা করুন"
            >
              <PencilSimple size={13} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(expense.id, expense.description)}
              className="p-1.5 rounded-md border border-slate-200/90 hover:bg-rose-50 active:scale-[0.98] text-slate-400 hover:text-rose-600 transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
              title="মুছে ফেলুন"
            >
              <Trash size={13} weight="bold" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-3">
      {/* ফিল্টার পিলস ও শিরোনাম */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <Receipt size={16} weight="bold" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              দোকানের খরচের খাতা ({targetDate})
            </h4>
            <p className="text-[11px] text-slate-500">
              ক্যাশ আউট ভাউচার ও দৈনিক ছোট খরচ
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
              type="button"
              onClick={() => setCategoryFilter(cat.id as ExpenseCategory | undefined)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.98] whitespace-nowrap cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ডাইনামিক ডেটাটেবিল */}
      <DynamicDataTable
        tableId="cashbox-expenses-table"
        data={expenses}
        columns={columns}
        keyExtractor={(e) => e.id}
        isLoading={isLoadingExpenses}
        pagination={
          expensesMeta.totalPages > 1 ? (
            <AdminPagination
              currentPage={expensesMeta.page}
              totalPages={expensesMeta.totalPages}
              totalItems={expensesMeta.total}
              pageSize={expensesMeta.limit}
              onPageChange={setExpensesPage}
              itemLabel="খরচ"
              className="rounded-t-none border-t-0 p-0"
            />
          ) : null
        }
      />
    </div>
  );
}
