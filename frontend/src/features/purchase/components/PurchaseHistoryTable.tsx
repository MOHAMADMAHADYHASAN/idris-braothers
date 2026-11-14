'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye } from '@phosphor-icons/react';
import { formatCurrency, formatDateBn } from '@/lib/decimal';
import { usePurchaseStore } from '../usePurchaseStore';
import { Purchase } from '../purchase.types';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';

interface PurchaseHistoryTableProps {
  onOpenDetail?: (purchase: Purchase) => void;
}

export function PurchaseHistoryTable({ onOpenDetail }: PurchaseHistoryTableProps) {
  const router = useRouter();
  const {
    purchases,
    meta,
    isLoadingHistory,
    setPage,
  } = usePurchaseStore();

  const handleDetail = (p: Purchase) => {
    if (onOpenDetail) {
      onOpenDetail(p);
    } else {
      router.push(`/purchases/${p.id}`);
    }
  };

  const columns: ColumnDef<Purchase>[] = useMemo(
    () => [
      {
        key: 'purchaseNumber',
        header: 'চালান নং ও তারিখ',
        disableToggle: true,
        renderCell: (p) => (
          <div>
            <span className="font-mono tabular-nums font-bold text-ink-primary text-xs sm:text-sm block">
              #{p.purchaseNumber}
            </span>
            <span className="text-xs text-ink-secondary font-mono tabular-nums">
              {formatDateBn(p.createdAt)}
            </span>
          </div>
        ),
        renderFooterCell: () => (
          <span className="text-xs font-bold text-ink-secondary">
            পৃষ্ঠার মোট:
          </span>
        ),
      },
      {
        key: 'supplier',
        header: 'মহাজন ও ঠিকানা',
        renderCell: (p) => (
          <div>
            <span className="font-semibold text-ink-primary text-xs sm:text-sm block">
              {p.supplier?.companyName || p.supplier?.name || 'অজ্ঞাত মহাজন'}
            </span>
            {p.supplier?.address && (
              <span className="text-xs text-ink-secondary block truncate max-w-[200px]">
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
        cellClassName: 'text-right font-mono tabular-nums text-ink-secondary text-xs',
        footerClassName: 'text-right font-mono tabular-nums text-ink-primary font-bold text-xs',
        renderCell: (p) =>
          p.transportCost > 0 ? formatCurrency(p.transportCost) : '—',
        renderFooterCell: (data) =>
          formatCurrency(
            data.reduce((sum, p) => sum + (Number(p.transportCost) || 0), 0)
          ),
      },
      {
        key: 'grandTotal',
        header: 'সর্বমোট বিল',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums font-black text-ink-primary text-xs sm:text-sm',
        footerClassName: 'text-right font-mono tabular-nums font-black text-ink-primary text-xs sm:text-sm',
        renderCell: (p) => formatCurrency(p.grandTotal),
        renderFooterCell: (data) =>
          formatCurrency(
            data.reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0)
          ),
      },
      {
        key: 'paidAmount',
        header: 'নগদ পরিশোধ',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums font-bold text-cash-text',
        footerClassName: 'text-right font-mono tabular-nums font-bold text-cash-text',
        renderCell: (p) => formatCurrency(p.paidAmount),
        renderFooterCell: (data) =>
          formatCurrency(
            data.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0)
          ),
      },
      {
        key: 'dueAmount',
        header: 'বকেয়া দেনা',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums font-bold',
        footerClassName: 'text-right font-mono tabular-nums font-bold text-due-text',
        renderCell: (p) => {
          if (p.dueAmount > 0) {
            return <span className="text-due-text">{formatCurrency(p.dueAmount)}</span>;
          }
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-cash-bg text-cash-text border border-cash-border">
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
            <span className="text-due-text">{formatCurrency(totalDue)}</span>
          ) : (
            <span className="text-cash-text font-semibold">৳০ দেনা</span>
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
              className="h-8 px-2.5 rounded-lg border border-border-strong hover:bg-brand-soft hover:text-brand-deep hover:border-brand-light active:scale-[0.98] text-ink-body text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="চালানের সম্পূর্ণ বিবরণ দেখুন"
            >
              <Eye size={14} weight="bold" />
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
