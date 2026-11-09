'use client';

import React, { useMemo } from 'react';
import { Eye } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { usePurchaseStore } from '../usePurchaseStore';
import { Purchase } from '../purchase.types';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';

interface PurchaseHistoryTableProps {
  onOpenDetail?: (purchase: Purchase) => void;
}

export function PurchaseHistoryTable({ onOpenDetail }: PurchaseHistoryTableProps) {
  const {
    purchases,
    meta,
    isLoadingHistory,
    openDetailModal,
    setPage,
  } = usePurchaseStore();

  const handleDetail = (p: Purchase) => {
    if (onOpenDetail) {
      onOpenDetail(p);
    } else {
      openDetailModal(p);
    }
  };

  const columns: ColumnDef<Purchase>[] = useMemo(
    () => [
      {
        key: 'purchaseNumber',
        header: 'চালান নং ও তারিখ',
        disableToggle: true,
        renderCell: (p) => {
          const dateStr = new Date(p.createdAt).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <div>
              <span className="font-mono tabular-nums font-bold text-slate-900 text-xs block">
                #{p.purchaseNumber}
              </span>
              <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                {dateStr}
              </span>
            </div>
          );
        },
        renderFooterCell: () => (
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            পৃষ্ঠার মোট:
          </span>
        ),
      },
      {
        key: 'supplier',
        header: 'মহাজন / আড়ত ও মোকাম',
        renderCell: (p) => (
          <div>
            <span className="font-semibold text-slate-900 text-xs block">
              {p.supplier?.companyName || p.supplier?.name || 'অজ্ঞাত মহাজন'}
            </span>
            {p.supplier?.address && (
              <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">
                {p.supplier.address}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'transportCost',
        header: 'গাড়িভাড়া',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums text-slate-600 text-xs',
        footerClassName: 'text-right font-mono tabular-nums text-slate-700 font-bold',
        renderCell: (p) =>
          p.transportCost > 0 ? `৳${formatCurrency(p.transportCost)}` : '-',
        renderFooterCell: (data) =>
          `৳${formatCurrency(
            data.reduce((sum, p) => sum + (Number(p.transportCost) || 0), 0)
          )}`,
      },
      {
        key: 'grandTotal',
        header: 'সর্বমোট বিল',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums tracking-tight font-black text-slate-900 text-xs sm:text-sm',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-black text-slate-900 text-xs sm:text-sm',
        renderCell: (p) => `৳${formatCurrency(p.grandTotal)}`,
        renderFooterCell: (data) =>
          `৳${formatCurrency(
            data.reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0)
          )}`,
      },
      {
        key: 'paidAmount',
        header: 'নগদ পরিশোধ',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums tracking-tight font-bold text-emerald-700',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-bold text-emerald-700',
        renderCell: (p) => `৳${formatCurrency(p.paidAmount)}`,
        renderFooterCell: (data) =>
          `৳${formatCurrency(
            data.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0)
          )}`,
      },
      {
        key: 'dueAmount',
        header: 'বকেয়া দেনা',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums tracking-tight font-bold',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-bold text-amber-800',
        renderCell: (p) => {
          if (p.dueAmount > 0) {
            return (
              <span className="text-amber-800">
                ৳{formatCurrency(p.dueAmount)}
              </span>
            );
          }
          return (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              পরিশোধিত
            </span>
          );
        },
        renderFooterCell: (data) => {
          const totalDue = data.reduce(
            (sum, p) => sum + (Number(p.dueAmount) || 0),
            0
          );
          return totalDue > 0 ? (
            <span className="text-amber-800">
              ৳{formatCurrency(totalDue)}
            </span>
          ) : (
            <span className="text-emerald-700 font-semibold">০ দেনা</span>
          );
        },
      },
      {
        key: 'actions',
        header: 'অ্যাকশন',
        headerClassName: 'text-center',
        cellClassName: 'text-center',
        disableToggle: true,
        renderCell: (p) => (
          <div className="flex items-center justify-center no-row-click">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDetail(p);
              }}
              className="h-7.5 px-2.5 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-600 hover:text-slate-900 text-xs font-semibold inline-flex items-center gap-1 transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
              title="চালানের সম্পূর্ণ চালানপত্র দেখুন"
            >
              <Eye size={13} weight="bold" />
              <span>বিস্তারিত</span>
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <DynamicDataTable
      tableId="purchase-history-register"
      data={purchases}
      columns={columns}
      keyExtractor={(p) => p.id}
      isLoading={isLoadingHistory}
      onRowClick={(p) => handleDetail(p)}
      pagination={
        meta.totalPages > 1 ? (
          <AdminPagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            totalItems={meta.total}
            pageSize={meta.limit}
            onPageChange={setPage}
            itemLabel="চালান"
            className="rounded-t-none border-t-0 p-0"
          />
        ) : null
      }
    />
  );
}
