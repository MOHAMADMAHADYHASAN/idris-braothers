'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, XCircle, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import {
  formatCurrency,
  formatDateBn,
  formatNumber,
  formatTimeBn,
  toBanglaDigits,
} from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSalesStore } from '../useSalesStore';
import { SaleListItem } from '../sales.types';

/**
 * Mobile Card Stream
 * - Header: Memo # & Date + Status Badge
 * - Key-Value Rows: Category Label left + Value right (bold)
 * - Pinned Full-Width Footer Action Bar: Touch-friendly h-9 buttons
 */
export function SalesMobileCard({ sale }: { sale: SaleListItem }) {
  const { openCancelModal } = useSalesStore();

  const isCancelled = sale.status === 'CANCELLED';
  const isFullPaid = Number(sale.dueAmount) <= 0;
  const dateStr = formatDateBn(sale.createdAt, { month: 'short', day: 'numeric' });
  const timeStr = formatTimeBn(sale.createdAt);

  return (
    <div
      className={`p-3.5 rounded-xl border border-slate-200/90 space-y-2.5 transition-colors ${
        isCancelled ? 'bg-rose-50/25 border-rose-200/80' : 'bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]'
      }`}
    >
      {/* 1. Header: Memo # & Date + Status Badge */}
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <span className="font-mono tabular-nums font-bold text-slate-900 text-xs block">
            #{toBanglaDigits(sale.invoiceNumber)}
          </span>
          <span className="text-xs text-slate-600 font-mono tabular-nums">
            {dateStr} • {timeStr}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {sale.saleType === 'WHOLESALE' && (
            <Badge variant="wholesale">পাইকারি</Badge>
          )}
          {isCancelled ? (
            <Badge variant="due" className="gap-1 bg-rose-50 text-rose-700 border-rose-200/80">
              <XCircle size={12} weight="fill" />
              <span>বাতিল</span>
            </Badge>
          ) : isFullPaid ? (
            <Badge variant="cash" className="gap-1">
              <CheckCircle size={12} weight="fill" />
              <span>পরিশোধিত</span>
            </Badge>
          ) : (
            <Badge variant="wholesale">আংশিক বাকি</Badge>
          )}
        </div>
      </div>

      {/* 2. Key-Value Rows */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600">কাস্টমার</span>
          <span className="font-semibold text-slate-900 truncate max-w-[200px]">
            {sale.customer ? sale.customer.name : 'খুচরা সাধারণ ক্রেতা'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600">ধরন ও পরিমাণ</span>
          <span className="font-medium text-slate-700 font-mono tabular-nums">
            {sale.saleType === 'WHOLESALE' ? 'পাইকারি' : 'খুচরা'} • {formatNumber(sale.items?.length || 0)} টি আইটেম
          </span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-slate-200">
          <span className="text-xs font-semibold text-slate-600">সর্বমোট বিল</span>
          <span className="font-mono tabular-nums font-black text-brand-deep text-sm">
            {formatCurrency(sale.grandTotal)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600">নগদ আদায় ও বাকি</span>
          <div className="text-right font-mono tabular-nums text-xs">
            <span className="text-emerald-700 font-bold">{formatCurrency(sale.paidAmount)}</span>
            {Number(sale.dueAmount) > 0 && (
              <span className="text-amber-800 font-bold ml-1.5">(বাকি {formatCurrency(sale.dueAmount)})</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Pinned Full-Width Footer Action Bar (Touch-Friendly h-9) */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
        <Link
          href={`/sales/${sale.id}`}
          className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'flex-1 h-9 gap-1.5' })}
        >
          <Eye size={14} weight="bold" />
          <span>রসিদ দেখুন</span>
        </Link>

        {!isCancelled && (
          <Link
            href={`/sales/${sale.id}/return`}
            className={buttonClasses({ variant: 'wholesale', size: 'sm', className: 'h-9 px-3 gap-1' })}
            title="পণ্য ফেরত ও রিফান্ড"
          >
            <ArrowCounterClockwise size={14} weight="bold" />
            <span>ফেরত</span>
          </Link>
        )}

        {!isCancelled && (
          <button
            type="button"
            onClick={() => openCancelModal(sale)}
            className={buttonClasses({ variant: 'outlineDanger', size: 'sm', className: 'h-9 px-3 gap-1' })}
            title="মেমো বাতিল করুন"
          >
            <XCircle size={14} weight="bold" />
            <span>বাতিল</span>
          </button>
        )}
      </div>
    </div>
  );
}
