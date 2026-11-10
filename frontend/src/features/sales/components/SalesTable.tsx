'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Printer,
  XCircle,
  CheckCircle,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useSalesStore } from '../useSalesStore';
import { SaleListItem } from '../sales.types';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';

export function SalesTable() {
  const router = useRouter();
  const {
    sales,
    meta,
    isLoading,
    openDetail,
    openCancelModal,
    openReturnModal,
    setPage,
  } = useSalesStore();

  const columns: ColumnDef<SaleListItem>[] = useMemo(
    () => [
      {
        key: 'invoiceNumber',
        header: 'মেমো নং ও সময়',
        disableToggle: true,
        renderCell: (sale) => {
          const dateStr = new Date(sale.createdAt).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const timeStr = new Date(sale.createdAt).toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div>
              <span className="font-mono tabular-nums font-bold text-slate-900 text-xs block">
                #{sale.invoiceNumber}
              </span>
              <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                {dateStr} • {timeStr}
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
        key: 'customer',
        header: 'কাস্টমার / ক্রেতা',
        renderCell: (sale) => {
          if (!sale.customer) {
            return <span className="text-slate-400 text-xs italic">খুচরা সাধারণ ক্রেতা</span>;
          }
          return (
            <div>
              <span className="font-semibold text-slate-900 block text-xs">
                {sale.customer.name}
              </span>
              {sale.customer.phone && (
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {sale.customer.phone}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'saleType',
        header: 'ধরন',
        headerClassName: 'text-center',
        cellClassName: 'text-center whitespace-nowrap',
        renderCell: (sale) => (
          <span
            className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
              sale.saleType === 'WHOLESALE'
                ? 'bg-purple-50 text-purple-700 border-purple-200/80'
                : 'bg-slate-100 text-slate-700 border-slate-200/80'
            }`}
          >
            {sale.saleType === 'WHOLESALE' ? 'পাইকারি' : 'খুচরা'}
          </span>
        ),
      },
      {
        key: 'itemCount',
        header: 'পণ্য সংখ্যা',
        cellClassName: 'font-mono tabular-nums text-slate-600',
        renderCell: (sale) => `${sale.items?.length || 0} টি আইটেম`,
        renderFooterCell: (data) => (
          <span className="font-mono tabular-nums font-bold text-slate-700">
            {data.reduce((sum, s) => sum + (s.items?.length || 0), 0)} টি আইটেম
          </span>
        ),
      },
      {
        key: 'grandTotal',
        header: 'সর্বমোট বিল',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums tracking-tight font-black text-slate-900 text-xs sm:text-sm',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-black text-slate-900 text-xs sm:text-sm',
        renderCell: (sale) => `${formatCurrency(sale.grandTotal)}`,
        renderFooterCell: (data) =>
          `${formatCurrency(
            data.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0)
          )}`,
      },
      {
        key: 'paidAmount',
        header: 'নগদ পরিশোধ',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums tracking-tight font-semibold text-emerald-700',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-bold text-emerald-700',
        renderCell: (sale) => `${formatCurrency(sale.paidAmount)}`,
        renderFooterCell: (data) =>
          `${formatCurrency(
            data.reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0)
          )}`,
      },
      {
        key: 'dueAmount',
        header: 'বকেয়া বাকি',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums tracking-tight',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-bold text-amber-800',
        renderCell: (sale) => {
          const due = Number(sale.dueAmount);
          if (due > 0) {
            return (
              <span className="font-bold text-amber-800">
                {formatCurrency(due)}
              </span>
            );
          }
          return <span className="text-slate-400 text-[11px]">পরিশোধিত</span>;
        },
        renderFooterCell: (data) => {
          const totalDue = data.reduce(
            (sum, s) => sum + (Number(s.dueAmount) || 0),
            0
          );
          return totalDue > 0 ? (
            <span className="text-amber-800 font-bold">
              {formatCurrency(totalDue)}
            </span>
          ) : (
            <span className="text-emerald-700 font-semibold">০ বকেয়া</span>
          );
        },
      },
      {
        key: 'status',
        header: 'স্ট্যাটাস',
        headerClassName: 'text-center',
        cellClassName: 'text-center whitespace-nowrap',
        renderCell: (sale) => {
          const isCancelled = sale.status === 'CANCELLED';
          const isFullPaid = Number(sale.dueAmount) <= 0;

          if (isCancelled) {
            return (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                <XCircle size={11} weight="fill" />
                <span>বাতিল</span>
              </span>
            );
          }

          if (isFullPaid) {
            return (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <CheckCircle size={11} weight="fill" />
                <span>পরিশোধিত</span>
              </span>
            );
          }

          return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
              <span>আংশিক বাকি</span>
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'অ্যাকশন',
        headerClassName: 'text-center',
        cellClassName: 'text-center',
        disableToggle: true,
        renderCell: (sale) => {
          const isCancelled = sale.status === 'CANCELLED';

          return (
            <div className="flex items-center justify-center gap-1 no-row-click">
              {/* রসিদ ও বিস্তারিত দেখুন */}
              <Link
                href={`/sales/${sale.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-600 hover:text-slate-900 transition-[background-color,border-color,transform] duration-150 cursor-pointer"
                title="মেমো বিস্তারিত দেখুন"
              >
                <Eye size={14} weight="bold" />
              </Link>

              {/* থার্মাল রসিদ প্রিন্ট */}
              <Link
                href={`/sales/${sale.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-600 hover:text-slate-900 transition-[background-color,border-color,transform] duration-150 cursor-pointer"
                title="রসিদ ভাউচার ও প্রিন্ট"
              >
                <Printer size={14} weight="bold" />
              </Link>

              {/* পণ্য ফেরত বাটন */}
              {!isCancelled && (
                <Link
                  href={`/sales/${sale.id}/return`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-md border border-slate-200/90 hover:bg-amber-50 active:scale-[0.98] text-slate-500 hover:text-amber-700 transition-[background-color,border-color,transform] duration-150 cursor-pointer"
                  title="পণ্য ফেরত ও রিফান্ড"
                >
                  <ArrowCounterClockwise size={14} weight="bold" />
                </Link>
              )}

              {/* মেমো বাতিল বাটন */}
              {!isCancelled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCancelModal(sale);
                  }}
                  className="p-1 rounded-md border border-slate-200/90 hover:bg-rose-50 active:scale-[0.98] text-slate-400 hover:text-rose-600 transition-[background-color,border-color,transform] duration-150 cursor-pointer"
                  title="ভুল মেমো বাতিল করুন"
                >
                  <XCircle size={14} weight="bold" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [openCancelModal]
  );

  return (
    <DynamicDataTable
      tableId="sales-invoices-register"
      data={sales}
      columns={columns}
      keyExtractor={(sale) => sale.id}
      isLoading={isLoading}
      onRowClick={(sale) => router.push(`/sales/${sale.id}`)}
      pagination={
        meta.totalPages > 1 ? (
          <AdminPagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            totalItems={meta.total}
            pageSize={meta.limit}
            onPageChange={setPage}
            itemLabel="মেমো"
            className="rounded-t-none border-t-0 p-0"
          />
        ) : null
      }
    />
  );
}
