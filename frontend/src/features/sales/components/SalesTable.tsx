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
import {
  formatCurrency,
  formatDateBn,
  formatNumber,
  formatTimeBn,
  toBanglaDigits,
} from '@/lib/decimal';
import { Badge } from '@/components/ui/Badge';
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
    openCancelModal,
    setPage,
  } = useSalesStore();

  const columns: ColumnDef<SaleListItem>[] = useMemo(
    () => [
      {
        key: 'invoiceNumber',
        header: 'মেমো নং ও সময়',
        disableToggle: true,
        renderCell: (sale) => {
          const dateStr = formatDateBn(sale.createdAt, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const timeStr = formatTimeBn(sale.createdAt);

          return (
            <div>
              <span className="font-mono tabular-nums font-bold text-ink-primary text-xs block">
                #{toBanglaDigits(sale.invoiceNumber)}
              </span>
              <span className="text-xs text-ink-secondary font-mono tabular-nums">
                {dateStr} • {timeStr}
              </span>
            </div>
          );
        },
        renderFooterCell: () => (
          <span className="text-xs font-bold text-ink-body">
            পৃষ্ঠার মোট:
          </span>
        ),
      },
      {
        key: 'customer',
        header: 'কাস্টমার / ক্রেতা',
        renderCell: (sale) => {
          if (!sale.customer) {
            return <span className="text-ink-secondary text-xs italic">খুচরা সাধারণ ক্রেতা</span>;
          }
          return (
            <div>
              <span className="font-semibold text-ink-primary block text-xs">
                {sale.customer.name}
              </span>
              {sale.customer.phone && (
                <span className="text-xs text-ink-secondary font-mono tabular-nums">
                  {toBanglaDigits(sale.customer.phone)}
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
          <Badge variant={sale.saleType === 'WHOLESALE' ? 'wholesale' : 'neutral'}>
            {sale.saleType === 'WHOLESALE' ? 'পাইকারি' : 'খুচরা'}
          </Badge>
        ),
      },
      {
        key: 'itemCount',
        header: 'পণ্য সংখ্যা',
        cellClassName: 'font-mono tabular-nums text-ink-body',
        renderCell: (sale) => `${formatNumber(sale.items?.length || 0)} টি আইটেম`,
        renderFooterCell: (data) => (
          <span className="font-mono tabular-nums font-bold text-ink-primary">
            {formatNumber(data.reduce((sum, s) => sum + (s.items?.length || 0), 0))} টি আইটেম
          </span>
        ),
      },
      {
        key: 'grandTotal',
        header: 'সর্বমোট বিল',
        headerClassName: 'text-right',
        cellClassName: 'text-right font-mono tabular-nums tracking-tight font-black text-ink-primary text-xs sm:text-sm',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-black text-ink-primary text-xs sm:text-sm',
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
        cellClassName: 'text-right font-mono tabular-nums tracking-tight font-semibold text-cash-text',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-bold text-cash-text',
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
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-bold text-wholesale-text',
        renderCell: (sale) => {
          const due = Number(sale.dueAmount);
          if (due > 0) {
            return (
              <span className="font-bold text-wholesale-text">
                {formatCurrency(due)}
              </span>
            );
          }
          return <span className="text-ink-secondary text-xs">পরিশোধিত</span>;
        },
        renderFooterCell: (data) => {
          const totalDue = data.reduce(
            (sum, s) => sum + (Number(s.dueAmount) || 0),
            0
          );
          return totalDue > 0 ? (
            <span className="text-wholesale-text font-bold">
              {formatCurrency(totalDue)}
            </span>
          ) : (
            <span className="text-cash-text font-semibold">০ বকেয়া</span>
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
              <Badge variant="due" className="gap-1 bg-due-bg text-due-text border-due-border">
                <XCircle size={12} weight="fill" />
                <span>বাতিল</span>
              </Badge>
            );
          }

          if (isFullPaid) {
            return (
              <Badge variant="cash" className="gap-1">
                <CheckCircle size={12} weight="fill" />
                <span>পরিশোধিত</span>
              </Badge>
            );
          }

          return <Badge variant="wholesale">আংশিক বাকি</Badge>;
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
            <div className="flex items-center justify-center gap-1.5 no-row-click">
              {/* রসিদ ও বিস্তারিত দেখুন */}
              <Link
                href={`/sales/${sale.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md border border-border-default hover:bg-brand-soft hover:border-brand-light active:scale-[0.98] text-ink-secondary hover:text-brand-deep transition-[background-color,border-color,transform] duration-150 cursor-pointer"
                title="মেমো বিস্তারিত দেখুন"
                aria-label={`মেমো #${sale.invoiceNumber} বিস্তারিত দেখুন`}
              >
                <Eye size={14} weight="bold" />
              </Link>

              {/* থার্মাল রসিদ প্রিন্ট */}
              <Link
                href={`/sales/${sale.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md border border-border-default hover:bg-brand-soft hover:border-brand-light active:scale-[0.98] text-ink-secondary hover:text-brand-deep transition-[background-color,border-color,transform] duration-150 cursor-pointer"
                title="রসিদ ভাউচার ও প্রিন্ট"
                aria-label={`মেমো #${sale.invoiceNumber} রসিদ প্রিন্ট`}
              >
                <Printer size={14} weight="bold" />
              </Link>

              {/* পণ্য ফেরত বাটন */}
              {!isCancelled && (
                <Link
                  href={`/sales/${sale.id}/return`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-md border border-border-default hover:bg-wholesale-bg hover:border-wholesale-border active:scale-[0.98] text-ink-secondary hover:text-wholesale-text transition-[background-color,border-color,transform] duration-150 cursor-pointer"
                  title="পণ্য ফেরত ও রিফান্ড"
                  aria-label={`মেমো #${sale.invoiceNumber} পণ্য ফেরত ও রিফান্ড`}
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
                  className="p-1.5 rounded-md border border-border-default hover:bg-due-bg hover:border-due-border active:scale-[0.98] text-ink-secondary hover:text-due-text transition-[background-color,border-color,transform] duration-150 cursor-pointer"
                  title="ভুল মেমো বাতিল করুন"
                  aria-label={`মেমো #${sale.invoiceNumber} বাতিল করুন`}
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
