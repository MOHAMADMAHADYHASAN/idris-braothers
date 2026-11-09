'use client';

import React from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
  itemLabel?: string;
}

/**
 * Gold-Standard Enterprise Pagination Bar
 * - Container card with crisp 1px border.
 * - Left: "Showing 1–20 of 150 items" (font-mono tabular-nums).
 * - Right: Tactile Prev / Next pager buttons with active:scale-[0.98].
 */
export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
  itemLabel = 'আইটেম',
}: AdminPaginationProps) {
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200/90 px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs ${className}`}
    >
      {/* Left: Range and Total Count */}
      <div className="text-slate-500 font-medium text-center sm:text-left">
        দেখাচ্ছে{' '}
        <span className="font-mono tabular-nums font-bold text-slate-900">
          {startItem}–{endItem}
        </span>{' '}
        (মোট{' '}
        <span className="font-mono tabular-nums font-bold text-slate-900">
          {totalItems}
        </span>{' '}
        টি {itemLabel})
      </div>

      {/* Right: Pager Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className="h-8 px-2.5 rounded-md border border-slate-200/90 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] cursor-pointer flex items-center gap-1"
        >
          <CaretLeft size={13} weight="bold" />
          <span>আগেরটি</span>
        </button>

        <div className="px-2.5 py-1 text-slate-700 font-mono tabular-nums font-bold text-xs bg-slate-50 border border-slate-200/80 rounded-md">
          {currentPage} / {totalPages || 1}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="h-8 px-2.5 rounded-md border border-slate-200/90 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] cursor-pointer flex items-center gap-1"
        >
          <span>পরেরটি</span>
          <CaretRight size={13} weight="bold" />
        </button>
      </div>
    </div>
  );
}
