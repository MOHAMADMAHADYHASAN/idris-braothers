'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HandCoins,
  Scroll,
  PencilSimple,
  SlidersHorizontal,
  Buildings,
  Phone,
  MapPin,
} from '@phosphor-icons/react';
import { formatCurrency, toBanglaDigits } from '@/lib/decimal';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { Supplier } from '../supplierKhata.types';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';

export function SupplierTable() {
  const router = useRouter();
  const {
    suppliers,
    meta,
    isLoading,
    openModal,
    setPage,
  } = useSupplierKhataStore();

  const columns: ColumnDef<Supplier>[] = useMemo(
    () => [
      {
        key: 'companyName',
        header: 'প্রতিষ্ঠান / গদি ও মহাজনের নাম',
        disableToggle: true,
        renderCell: (s) => (
          <div>
            <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
              <Buildings size={14} weight="bold" className="text-brand-deep shrink-0" />
              <span>{s.companyName || s.name}</span>
            </div>
            {s.companyName && (
              <span className="text-xs text-slate-600 block pl-5 mt-0.5">
                মহাজন: {s.name}
              </span>
            )}
          </div>
        ),
        renderFooterCell: () => (
          <span className="text-xs font-bold text-slate-700">
            পৃষ্ঠার মোট দেনা:
          </span>
        ),
      },
      {
        key: 'address',
        header: 'মোকাম / আড়ত এলাকা',
        renderCell: (s) =>
          s.address ? (
            <div className="flex items-center gap-1 text-slate-700 text-xs">
              <MapPin size={12} weight="bold" className="text-slate-500 shrink-0" />
              <span className="truncate max-w-[200px]">{s.address}</span>
            </div>
          ) : (
            <span className="text-slate-500">-</span>
          ),
      },
      {
        key: 'phone',
        header: 'মোবাইল',
        cellClassName: 'font-mono tabular-nums text-xs text-slate-700',
        renderCell: (s) =>
          s.phone ? (
            <div className="flex items-center gap-1">
              <Phone size={12} weight="bold" className="text-slate-500" />
              <span>{toBanglaDigits(s.phone)}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-600 italic font-sans">মোবাইল নেই</span>
          ),
      },
      {
        key: 'currentPayable',
        header: 'দোকানের বর্তমান দেনা (৳)',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-black text-amber-800 text-xs sm:text-sm',
        renderCell: (s) => {
          const isPayable = s.currentPayable > 0;
          const isAdvance = s.currentPayable < 0;

          if (isPayable) {
            return (
              <div className="inline-block text-right">
                <span className="font-mono tabular-nums tracking-tight font-black text-amber-800 text-xs sm:text-sm">
                  {formatCurrency(s.currentPayable)}
                </span>
                <span className="block text-xs text-amber-800 font-semibold">
                  দোকানের দেনা
                </span>
              </div>
            );
          }

          if (isAdvance) {
            return (
              <div className="inline-block text-right">
                <span className="font-mono tabular-nums tracking-tight font-black text-emerald-700 text-xs sm:text-sm">
                  {formatCurrency(Math.abs(s.currentPayable))}
                </span>
                <span className="block text-xs text-emerald-700 font-semibold">
                  অগ্রিম দেওয়া
                </span>
              </div>
            );
          }

          return (
            <Badge variant="neutral" className="font-mono tabular-nums">
              পরিশোধিত (০.০০)
            </Badge>
          );
        },
        renderFooterCell: (data) => {
          const totalPayable = data.reduce(
            (sum, s) => (s.currentPayable > 0 ? sum + s.currentPayable : sum),
            0
          );
          return (
            <span className="text-amber-800 font-mono font-black text-xs sm:text-sm">
              {formatCurrency(totalPayable)}
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
        renderCell: (s) => (
          <div className="flex items-center justify-center gap-1.5 no-row-click">
            {/* দেনা পরিশোধ বাটন */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal('payment', s);
              }}
              className={buttonClasses({ variant: 'cash', size: 'xs', className: 'gap-1' })}
              title="মহাজনকে দেনা পরিশোধ করুন"
            >
              <HandCoins size={14} weight="bold" />
              <span>দেনা শোধ</span>
            </button>

            {/* খতিয়ান বিবরণী বাটন */}
            <Link
              href={`/khata/suppliers/${s.id}`}
              onClick={(e) => e.stopPropagation()}
              className={buttonClasses({ variant: 'secondary', size: 'xs', className: 'gap-1' })}
              title="মহাজনের রানিং চালান ও খতিয়ান"
            >
              <Scroll size={14} weight="bold" className="text-brand-deep" />
              <span>খতিয়ান</span>
            </Link>

            {/* ছাড় / সমন্বয় */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal('adjustment', s);
              }}
              className="p-1.5 rounded-md border border-slate-200/90 hover:bg-brand-soft/60 hover:border-brand-light active:scale-[0.98] text-slate-600 hover:text-brand-deep transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
              title="শুকতি / কমিশন / ছাড় সমন্বয়"
            >
              <SlidersHorizontal size={14} weight="bold" />
            </button>

            {/* এডিট */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal('edit', s);
              }}
              className="p-1.5 rounded-md border border-slate-200/90 hover:bg-brand-soft/60 hover:border-brand-light active:scale-[0.98] text-slate-600 hover:text-brand-deep transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
              title="মহাজনের তথ্য এডিট করুন"
            >
              <PencilSimple size={14} weight="bold" />
            </button>
          </div>
        ),
      },
    ],
    [openModal]
  );

  return (
    <DynamicDataTable
      tableId="suppliers-khata-table"
      data={suppliers}
      columns={columns}
      keyExtractor={(s) => s.id}
      isLoading={isLoading}
      onRowClick={(s) => router.push(`/khata/suppliers/${s.id}`)}
      pagination={
        meta.totalPages > 1 ? (
          <AdminPagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            totalItems={meta.total}
            pageSize={meta.limit}
            onPageChange={setPage}
            itemLabel="মহাজন"
            className="rounded-t-none border-t-0 p-0"
          />
        ) : null
      }
    />
  );
}
