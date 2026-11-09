'use client';

import React, { useMemo } from 'react';
import {
  HandCoins,
  Scroll,
  PencilSimple,
  SlidersHorizontal,
  Buildings,
  Phone,
  MapPin,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { Supplier } from '../supplierKhata.types';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';

export function SupplierTable() {
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
              <Buildings size={14} weight="bold" className="text-slate-400 shrink-0" />
              <span>{s.companyName || s.name}</span>
            </div>
            {s.companyName && (
              <span className="text-[11px] text-slate-500 block pl-5 mt-0.5">
                মহাজন: {s.name}
              </span>
            )}
          </div>
        ),
        renderFooterCell: () => (
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            পৃষ্ঠার মোট দেনা:
          </span>
        ),
      },
      {
        key: 'address',
        header: 'মোকাম / আড়ত এলাকা',
        renderCell: (s) =>
          s.address ? (
            <div className="flex items-center gap-1 text-slate-600 text-xs">
              <MapPin size={12} weight="bold" className="text-slate-400 shrink-0" />
              <span className="truncate max-w-[200px]">{s.address}</span>
            </div>
          ) : (
            <span className="text-slate-300">-</span>
          ),
      },
      {
        key: 'phone',
        header: 'মোবাইল',
        cellClassName: 'font-mono tabular-nums text-xs text-slate-600',
        renderCell: (s) =>
          s.phone ? (
            <div className="flex items-center gap-1">
              <Phone size={12} weight="bold" className="text-slate-400" />
              <span>{s.phone}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">মোবাইল নেই</span>
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
                  ৳{formatCurrency(s.currentPayable)}
                </span>
                <span className="block text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                  দোকানের দেনা
                </span>
              </div>
            );
          }

          if (isAdvance) {
            return (
              <div className="inline-block text-right">
                <span className="font-mono tabular-nums tracking-tight font-black text-emerald-700 text-xs sm:text-sm">
                  ৳{formatCurrency(Math.abs(s.currentPayable))}
                </span>
                <span className="block text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                  অগ্রিম দেওয়া
                </span>
              </div>
            );
          }

          return (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              পরিশোধিত (০.০০)
            </span>
          );
        },
        renderFooterCell: (data) => {
          const totalPayable = data.reduce(
            (sum, s) => (s.currentPayable > 0 ? sum + s.currentPayable : sum),
            0
          );
          return (
            <span className="text-amber-800 font-mono font-black text-xs sm:text-sm">
              ৳{formatCurrency(totalPayable)}
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
          <div className="flex items-center justify-center gap-1 no-row-click">
            {/* দেনা পরিশোধ বাটন */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal('payment', s);
              }}
              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1 transition-[background-color,border-color,transform] duration-150 shadow-2xs cursor-pointer"
              title="মহাজনকে দেনা পরিশোধ করুন"
            >
              <HandCoins size={14} weight="bold" />
              <span>দেনা শোধ</span>
            </button>

            {/* খতিয়ান বিবরণী বাটন */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal('ledger', s);
              }}
              className="px-2.5 py-1 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center gap-1 transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
              title="মহাজনের রানিং চালান ও খতিয়ান"
            >
              <Scroll size={14} weight="bold" className="text-slate-500" />
              <span>খতিয়ান</span>
            </button>

            {/* ছাড় / সমন্বয় */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal('adjustment', s);
              }}
              className="p-1 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-500 hover:text-slate-800 transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
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
              className="p-1 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-500 hover:text-slate-800 transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
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
      onRowClick={(s) => openModal('ledger', s)}
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
