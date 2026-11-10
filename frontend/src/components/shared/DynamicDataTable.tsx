'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  SlidersHorizontal,
  CaretDown,
  ArrowsClockwise,
  Table,
} from '@phosphor-icons/react';
import { formatNumber } from '@/lib/decimal';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  footerClassName?: string;
  renderCell: (item: T, index: number) => React.ReactNode;
  renderFooterCell?: (data: T[]) => React.ReactNode;
  defaultHidden?: boolean;
  disableToggle?: boolean; // If true, cannot be hidden by user (e.g. ID, Actions)
}

export interface DynamicDataTableProps<T> {
  tableId: string; // Unique localStorage identifier
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  onRowClick?: (item: T) => void;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  emptyState?: React.ReactNode;
  pagination?: React.ReactNode;
  renderExpandedRow?: (item: T) => React.ReactNode;
  isRowExpanded?: (item: T) => boolean;
  className?: string;
}

export function DynamicDataTable<T>({
  tableId,
  data,
  columns,
  keyExtractor,
  isLoading = false,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  onRowClick,
  toolbarLeft,
  toolbarRight,
  emptyState,
  pagination,
  renderExpandedRow,
  isRowExpanded,
  className = '',
}: DynamicDataTableProps<T>) {
  const [isMounted, setIsMounted] = useState(false);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Compute default hidden keys from ColumnDef
  const initialDefaultHidden = useMemo(() => {
    const s = new Set<string>();
    columns.forEach((c) => {
      if (c.defaultHidden && !c.disableToggle) {
        s.add(c.key);
      }
    });
    return s;
  }, [columns]);

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(initialDefaultHidden);

  // Storage key
  const storageKey = `dt_cols_${tableId}_v1`;

  // 1. Crash-Proof Schema Synchronization from localStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validKeys = new Set(columns.map((c) => c.key));
          const restored = new Set<string>();

          parsed.forEach((k) => {
            const col = columns.find((c) => c.key === k);
            // Only hide if the column exists and toggle is allowed
            if (validKeys.has(k) && col && !col.disableToggle) {
              restored.add(k);
            }
          });
          setHiddenKeys(restored);
        }
      }
    } catch (e) {
      console.warn('Failed to parse table column preferences from localStorage:', e);
    }
  }, [storageKey, columns]);

  // Click outside listener for column menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setIsColumnMenuOpen(false);
      }
    }
    if (isColumnMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isColumnMenuOpen]);

  // Save to localStorage when hiddenKeys changes
  const updateHiddenKeys = (newSet: Set<string>) => {
    setHiddenKeys(newSet);
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)));
    } catch (e) {
      console.warn('Failed to save table column preferences:', e);
    }
  };

  const handleToggleColumn = (key: string) => {
    const next = new Set(hiddenKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    updateHiddenKeys(next);
  };

  const handleResetColumns = () => {
    updateHiddenKeys(initialDefaultHidden);
    setIsColumnMenuOpen(false);
  };

  // Filter columns based on visibility
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => col.disableToggle || !hiddenKeys.has(col.key));
  }, [columns, hiddenKeys]);

  // Check if any visible column defines a footer
  const hasFooter = useMemo(() => {
    return visibleColumns.some((col) => Boolean(col.renderFooterCell));
  }, [visibleColumns]);

  // Row selection helpers
  const allRowKeys = useMemo(() => {
    return data.map((item, idx) => keyExtractor(item, idx));
  }, [data, keyExtractor]);

  const isAllSelected = useMemo(() => {
    if (!selectable || !selectedKeys || allRowKeys.length === 0) return false;
    return allRowKeys.every((k) => selectedKeys.has(k));
  }, [selectable, selectedKeys, allRowKeys]);

  const isSomeSelected = useMemo(() => {
    if (!selectable || !selectedKeys || allRowKeys.length === 0) return false;
    return allRowKeys.some((k) => selectedKeys.has(k)) && !isAllSelected;
  }, [selectable, selectedKeys, allRowKeys, isAllSelected]);

  const handleToggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (isAllSelected) {
      const next = new Set(selectedKeys);
      allRowKeys.forEach((k) => next.delete(k));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedKeys);
      allRowKeys.forEach((k) => next.add(k));
      onSelectionChange(next);
    }
  };

  const handleToggleRowSelect = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    if (!onSelectionChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onSelectionChange(next);
  };

  const handleRowClick = (e: React.MouseEvent, item: T) => {
    if (!onRowClick) return;
    // Prevent triggering row click if user clicked a button, input, anchor or interactive element
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('.no-row-click')
    ) {
      return;
    }
    onRowClick(item);
  };

  const toggleableColumns = columns.filter((c) => !c.disableToggle);

  return (
    <div
      className={`bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden flex flex-col ${className}`}
    >
      {/* ── ১. ইন্টিগ্রেটেড টেবিল টুলবার ── */}
      {(toolbarLeft || toolbarRight || toggleableColumns.length > 0) && (
        <div className="px-3.5 py-2.5 bg-surface-subtle/60 border-b border-border-default flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {toolbarLeft}
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0">
            {toolbarRight}

            {/* কলামসমূহ অন/অফ ড্রপডাউন বাটন */}
            {toggleableColumns.length > 0 && (
              <div className="relative" ref={columnMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                  className={`h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] cursor-pointer shadow-2xs ${
                    hiddenKeys.size > 0
                      ? 'bg-brand-deep border-brand-deep text-white'
                      : 'bg-surface-card border-border-strong text-ink-body hover:bg-surface-subtle'
                  }`}
                  title="টেবিল কলাম প্রদর্শন নিয়ন্ত্রণ করুন"
                >
                  <SlidersHorizontal size={13} weight="bold" />
                  <span>কলামসমূহ</span>
                  {hiddenKeys.size > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-mono bg-white/20 text-white">
                      {formatNumber(visibleColumns.length)}/{formatNumber(columns.length)}
                    </span>
                  )}
                  <CaretDown size={11} weight="bold" />
                </button>

                {/* ড্রপডাউন পপওভার */}
                {isColumnMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-surface-card border border-border-default rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border-subtle px-1">
                      <span className="text-xs font-bold text-ink-primary">
                        কলাম প্রদর্শন
                      </span>
                      <button
                        type="button"
                        onClick={handleResetColumns}
                        className="text-xs font-semibold text-brand-deep hover:underline cursor-pointer"
                      >
                        রিসেট
                      </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin">
                      {toggleableColumns.map((col) => {
                        const isVisible = !hiddenKeys.has(col.key);
                        return (
                          <label
                            key={col.key}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-ink-body hover:bg-surface-subtle transition-colors cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={() => handleToggleColumn(col.key)}
                              className="w-3.5 h-3.5 rounded border-border-strong accent-brand-deep cursor-pointer"
                            />
                            <span className="truncate flex-1">
                              {typeof col.header === 'string' ? col.header : col.key}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ২. মূল টেবিল এরিয়া ── */}
      <div className="overflow-x-auto relative flex-1">
        {isLoading && data.length === 0 ? (
          <div className="py-16 text-center text-ink-secondary">
            <ArrowsClockwise
              size={24}
              weight="bold"
              className="animate-spin mx-auto mb-2 text-brand-deep"
            />
            <p className="text-xs font-medium">তথ্য লোড হচ্ছে...</p>
          </div>
        ) : data.length === 0 ? (
          emptyState || (
            <div className="py-16 text-center text-ink-secondary">
              <Table size={32} weight="bold" className="mx-auto mb-2 text-ink-muted" />
              <h4 className="text-sm font-semibold text-ink-primary">কোনো তথ্য পাওয়া যায়নি</h4>
              <p className="text-xs text-ink-secondary mt-0.5">
                বর্তমান ফিল্টার অনুযায়ী কোনো রেকর্ড খুঁজে পাওয়া যায়নি।
              </p>
            </div>
          )
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            {/* স্টিকি হেডার */}
            <thead className="sticky top-0 bg-surface-subtle/95 backdrop-blur-xs z-10 border-b border-border-default text-ink-secondary font-bold text-xs">
              <tr>
                {/* বাল্ক চেকবক্স কলাম */}
                {selectable && (
                  <th className="py-2.5 px-3 w-9 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-border-strong accent-brand-deep cursor-pointer"
                      title="সবগুলো নির্বাচন করুন"
                    />
                  </th>
                )}

                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-2.5 px-3 whitespace-nowrap ${col.headerClassName || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* টেবিল বডি */}
            <tbody className="divide-y divide-border-subtle">
              {data.map((item, idx) => {
                const rowKey = keyExtractor(item, idx);
                const isSelected = Boolean(selectedKeys?.has(rowKey));
                const isExpanded = isRowExpanded ? isRowExpanded(item) : false;

                return (
                  <React.Fragment key={rowKey}>
                    <tr
                      onClick={(e) => handleRowClick(e, item)}
                      className={`transition-colors duration-150 ${
                        onRowClick ? 'cursor-pointer' : ''
                      } ${
                        isSelected
                          ? 'bg-brand-soft/60'
                          : isExpanded
                          ? 'bg-surface-subtle/70'
                          : 'hover:bg-surface-subtle/60'
                      }`}
                    >
                      {/* রো চেকবক্স */}
                      {selectable && (
                        <td
                          className="py-2.5 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleRowSelect(e as any, rowKey)}
                            className="w-3.5 h-3.5 rounded border-border-strong accent-brand-deep cursor-pointer"
                          />
                        </td>
                      )}

                      {/* ডেটা সেলসমূহ */}
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className={`py-2.5 px-3 ${col.cellClassName || ''}`}
                        >
                          {col.renderCell(item, idx)}
                        </td>
                      ))}
                    </tr>

                    {/* এক্সপ্যান্ডেবল সাব-রো (যদি থাকে) */}
                    {renderExpandedRow && isExpanded && (
                      <tr className="bg-slate-50/60 border-b border-slate-200/80">
                        <td
                          colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                          className="p-3"
                        >
                          {renderExpandedRow(item)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* ── ৩. স্বয়ংক্রিয় ফুটার সামারি রো ── */}
            {hasFooter && (
              <tfoot className="bg-surface-subtle/80 border-t-2 border-border-default font-bold text-ink-primary">
                <tr>
                  {selectable && <td className="py-2.5 px-3" />}
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-2.5 px-3 whitespace-nowrap ${
                        col.footerClassName || col.cellClassName || ''
                      }`}
                    >
                      {col.renderFooterCell ? col.renderFooterCell(data) : null}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>

      {/* ── ৪. পেজিনেশন স্লট ── */}
      {pagination && (
        <div className="border-t border-border-default bg-surface-subtle/40 p-2">
          {pagination}
        </div>
      )}
    </div>
  );
}
