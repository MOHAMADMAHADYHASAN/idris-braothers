'use client';

import React from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { formatNumber } from '@/lib/decimal';

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
 * Standardized Enterprise Pagination Bar (`bn-BD` Bangla Numerals)
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
      className={`bg-surface-card rounded-lg border border-border-default px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs ${className}`}
    >
      {/* Left: Range and Total Count */}
      <div className="text-ink-secondary font-medium text-center sm:text-left">
        দেখাচ্ছে{' '}
        <span className="font-mono tabular-nums font-bold text-ink-primary">
          {formatNumber(startItem)}–{formatNumber(endItem)}
        </span>{' '}
        (মোট{' '}
        <span className="font-mono tabular-nums font-bold text-ink-primary">
          {formatNumber(totalItems)}
        </span>{' '}
        টি {itemLabel})
      </div>

      {/* Right: Pager Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className="h-8 px-2.5 rounded-md border border-border-strong text-ink-body font-semibold hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] cursor-pointer flex items-center gap-1"
        >
          <CaretLeft size={13} weight="bold" />
          <span>আগেরটি</span>
        </button>

        <div className="px-2.5 py-1 text-brand-deep font-mono tabular-nums font-bold text-xs bg-brand-soft border border-brand-light rounded-md">
          {formatNumber(currentPage)} / {formatNumber(totalPages || 1)}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="h-8 px-2.5 rounded-md border border-border-strong text-ink-body font-semibold hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] cursor-pointer flex items-center gap-1"
        >
          <span>পরেরটি</span>
          <CaretRight size={13} weight="bold" />
        </button>
      </div>
    </div>
  );
}
