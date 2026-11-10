'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Trash,
  PencilSimple,
  Funnel,
  Receipt,
} from '@phosphor-icons/react';
import { formatCurrency, formatTimeBn, toBanglaDigits } from '@/lib/decimal';
import { useCashboxStore } from '../useCashboxStore';
import { ExpenseCategory, DailyExpense } from '../cashbox.types';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';

function getCategoryBadge(cat: ExpenseCategory): { label: string; badgeClass: string } {
  switch (cat) {
    case 'LABOR_KULI':
      return { label: 'কুলি ও লেবার', badgeClass: 'bg-brand-soft text-brand-deep border-brand-light' };
    case 'TRANSPORT_VAN':
      return { label: 'ভ্যান ও গাড়িভাড়া', badgeClass: 'bg-wholesale-bg text-wholesale-text border-wholesale-border/70' };
    case 'TEA_SNACKS':
      return { label: 'চা-নাস্তা ও আপ্যায়ন', badgeClass: 'bg-cash-bg text-cash-text border-cash-border' };
    case 'ELECTRICITY_UTILITY':
      return { label: 'বিদ্যুৎ ও ইউটিলিটি', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200' };
    case 'SHOP_MAINTENANCE':
      return { label: 'দোকান সরঞ্জাম', badgeClass: 'bg-surface-subtle text-ink-body border-border-default' };
    case 'OTHER':
      return { label: 'বিবিধ খরচ', badgeClass: 'bg-surface-subtle text-ink-body border-border-default' };
    default:
      return { label: cat, badgeClass: 'bg-surface-subtle text-ink-body border-border-default' };
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
      } catch {
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
        cellClassName: 'font-mono tabular-nums text-ink-secondary text-xs whitespace-nowrap',
        renderCell: (expense) => formatTimeBn(expense.createdAt),
        renderFooterCell: () => (
          <span className="text-xs font-bold text-ink-secondary">
            মোট খরচ:
          </span>
        ),
      },
      {
        key: 'category',
        header: 'খাত ও ক্যাটাগরি',
        cellClassName: 'whitespace-nowrap',
        renderCell: (expense) => {
          const badge = getCategoryBadge(expense.category);
          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border ${badge.badgeClass}`}
            >
              {badge.label}
            </span>
          );
        },
      },
      {
        key: 'description',
        header: 'খরচের বিবরণ',
        cellClassName: 'font-medium text-ink-primary',
        renderCell: (expense) => (
          <div>
            <span>{expense.description}</span>
            {expense.note && (
              <span className="block text-xs text-ink-secondary font-normal mt-0.5">
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
        cellClassName: 'text-right font-mono tabular-nums font-bold text-due-text text-xs sm:text-sm',
        footerClassName: 'text-right font-mono tabular-nums font-black text-due-text text-xs sm:text-sm',
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
          <div className="flex items-center justify-center gap-1.5 no-row-click">
            <button
              type="button"
              onClick={() => openEditModal(expense)}
              className="p-1.5 rounded-md border border-border-default hover:bg-brand-soft hover:text-brand-deep hover:border-brand-light active:scale-[0.98] text-ink-secondary transition-all cursor-pointer shadow-2xs"
              title="সম্পাদনা করুন"
            >
              <PencilSimple size={14} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(expense.id, expense.description)}
              className="p-1.5 rounded-md border border-border-default hover:bg-due-bg active:scale-[0.98] text-ink-secondary hover:text-due-text transition-all cursor-pointer shadow-2xs"
              title="মুছে ফেলুন"
            >
              <Trash size={14} weight="bold" />
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
      <div className="bg-surface-card rounded-xl border border-border-default p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center shrink-0">
            <Receipt size={16} weight="bold" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-ink-primary">
              দোকানের খরচের খাতা ({toBanglaDigits(targetDate)})
            </h4>
            <p className="text-xs text-ink-secondary">
              ক্যাশ আউট ভাউচার ও দৈনিক ছোট খরচ
            </p>
          </div>
        </div>

        {/* ক্যাটাগরি ফিল্টার পিলস */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <span className="text-ink-secondary font-medium mr-1 flex items-center gap-1 shrink-0 text-xs">
            <Funnel size={13} weight="bold" />
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
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.98] whitespace-nowrap cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-brand-deep text-white shadow-2xs'
                  : 'bg-surface-subtle text-ink-body hover:bg-brand-soft hover:text-brand-deep border border-border-default'
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
