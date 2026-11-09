'use client';

import React from 'react';
import { Eye, XCircle, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useSalesStore } from '../useSalesStore';
import { SaleListItem } from '../sales.types';

/**
 * Mobile Card Stream (Strict Golden Anatomy)
 * - Header: Memo # & Date + Status Badge
 * - Key-Value Rows: Category Label left (uppercase muted) + Value right (bold)
 * - Pinned Full-Width Footer Action Bar: Touch-friendly h-9 buttons with flex-1 width
 */
export function SalesMobileCard({ sale }: { sale: SaleListItem }) {
  const { openDetail, openCancelModal, openReturnModal } = useSalesStore();

  const isCancelled = sale.status === 'CANCELLED';
  const isFullPaid = Number(sale.dueAmount) <= 0;
  const dateStr = new Date(sale.createdAt).toLocaleDateString('bn-BD', {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = new Date(sale.createdAt).toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`p-3.5 rounded-lg border border-slate-200/90 space-y-2.5 transition-colors ${
        isCancelled ? 'bg-rose-50/20 border-rose-200/70' : 'bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]'
      }`}
    >
      {/* 1. Header: Memo # & Date + Status Badge */}
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <span className="font-mono tabular-nums font-bold text-slate-900 text-xs block">
            #{sale.invoiceNumber}
          </span>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums">
            {dateStr} • {timeStr}
          </span>
        </div>

        <div>
          {isCancelled ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
              <XCircle size={10} weight="fill" />
              <span>বাতিল</span>
            </span>
          ) : isFullPaid ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <CheckCircle size={10} weight="fill" />
              <span>পরিশোধিত</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
              <span>আংশিক বাকি</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Key-Value Rows */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">কাস্টমার</span>
          <span className="font-semibold text-slate-900 truncate max-w-[200px]">
            {sale.customer ? sale.customer.name : 'খুচরা সাধারণ ক্রেতা'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ধরন ও পরিমাণ</span>
          <span className="font-medium text-slate-700">
            {sale.saleType === 'WHOLESALE' ? 'পাইকারি' : 'খুচরা'} • {sale.items?.length || 0} টি আইটেম
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">সর্বমোট বিল</span>
          <span className="font-mono tabular-nums font-black text-slate-900 text-sm">
            ৳{formatCurrency(sale.grandTotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">নগদ আদায় / বাকি</span>
          <div className="text-right font-mono tabular-nums text-xs">
            <span className="text-emerald-700 font-bold">৳{formatCurrency(sale.paidAmount)}</span>
            {Number(sale.dueAmount) > 0 && (
              <span className="text-amber-800 font-bold ml-1.5">(বাকি ৳{formatCurrency(sale.dueAmount)})</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Pinned Full-Width Footer Action Bar (Touch-Friendly h-9) */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => openDetail(sale.id)}
          className="flex-1 h-9 rounded-md border border-slate-200/90 bg-white text-xs text-slate-800 font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-colors hover:bg-slate-50 cursor-pointer"
        >
          <Eye size={14} weight="bold" />
          <span>রসিদ দেখুন</span>
        </button>

        {!isCancelled && (
          <button
            type="button"
            onClick={() => openReturnModal(sale.id)}
            className="h-9 px-3 rounded-md border border-amber-200/90 bg-amber-50/60 text-xs text-amber-800 font-semibold flex items-center justify-center gap-1 active:scale-[0.98] transition-colors hover:bg-amber-100/70 cursor-pointer"
            title="পণ্য ফেরত ও রিফান্ড"
          >
            <ArrowCounterClockwise size={14} weight="bold" />
            <span>ফেরত</span>
          </button>
        )}

        {!isCancelled && (
          <button
            type="button"
            onClick={() => openCancelModal(sale)}
            className="h-9 px-3 rounded-md border border-rose-200/80 bg-rose-50/50 text-xs text-rose-700 font-semibold flex items-center justify-center gap-1 active:scale-[0.98] transition-colors hover:bg-rose-100/60 cursor-pointer"
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
