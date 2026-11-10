'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HandCoins,
  Scroll,
  PencilSimple,
  SlidersHorizontal,
  Phone,
  MapPin,
} from '@phosphor-icons/react';
import { formatCurrency, toBanglaDigits } from '@/lib/decimal';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { useCustomerKhataStore } from '../useCustomerKhataStore';
import { Customer } from '../customerKhata.types';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';

export function CustomerTable() {
  const router = useRouter();
  const {
    customers,
    meta,
    isLoading,
    openModal,
    setPage,
  } = useCustomerKhataStore();

  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'গ্রাহকের নাম ও মোবাইল',
        disableToggle: true,
        renderCell: (c) => (
          <div>
            <div className="font-semibold text-slate-900 text-xs sm:text-sm">
              {c.name}
            </div>
            {c.phone ? (
              <div className="flex items-center gap-1 text-xs text-slate-600 font-mono tabular-nums tracking-tight mt-0.5">
                <Phone size={12} weight="bold" className="text-slate-500" />
                <span>{toBanglaDigits(c.phone)}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-600 italic">মোবাইল নেই</span>
            )}
          </div>
        ),
        renderFooterCell: () => (
          <span className="text-xs font-bold text-slate-700">
            পৃষ্ঠার মোট:
          </span>
        ),
      },
      {
        key: 'customerType',
        header: 'টাইপ',
        headerClassName: 'text-center',
        cellClassName: 'text-center',
        renderCell: (c) => (
          <Badge variant={c.customerType === 'WHOLESALE' ? 'wholesale' : 'neutral'}>
            {c.customerType === 'WHOLESALE' ? 'পাইকারি' : 'খুচরা'}
          </Badge>
        ),
      },
      {
        key: 'address',
        header: 'ঠিকানা / এলাকা',
        renderCell: (c) =>
          c.address ? (
            <div className="flex items-center gap-1 text-slate-700 text-xs">
              <MapPin size={12} weight="bold" className="text-slate-500 shrink-0" />
              <span className="truncate max-w-[200px]">{c.address}</span>
            </div>
          ) : (
            <span className="text-slate-500">-</span>
          ),
      },
      {
        key: 'currentDue',
        header: 'বর্তমান বকেয়া (৳)',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        footerClassName: 'text-right font-mono tabular-nums tracking-tight font-black text-rose-700',
        renderCell: (c) => {
          const isDue = c.currentDue > 0;
          const isAdvance = c.currentDue < 0;

          if (isDue) {
            return (
              <div className="inline-block text-right">
                <span className="font-mono tabular-nums tracking-tight font-black text-rose-700 text-xs sm:text-sm">
                  {formatCurrency(c.currentDue)}
                </span>
                <span className="block text-xs text-rose-700 font-semibold">
                  বকেয়া বাকি
                </span>
              </div>
            );
          }

          if (isAdvance) {
            return (
              <div className="inline-block text-right">
                <span className="font-mono tabular-nums tracking-tight font-black text-emerald-700 text-xs sm:text-sm">
                  {formatCurrency(Math.abs(c.currentDue))}
                </span>
                <span className="block text-xs text-emerald-700 font-semibold">
                  অগ্রিম জমা
                </span>
              </div>
            );
          }

          return (
            <Badge variant="neutral">
              পরিশোধিত (০.০০)
            </Badge>
          );
        },
        renderFooterCell: (data) => {
          const totalDue = data.reduce(
            (sum, c) => (c.currentDue > 0 ? sum + c.currentDue : sum),
            0
          );
          return (
            <span className="text-rose-700 font-mono font-black text-xs sm:text-sm">
              {formatCurrency(totalDue)}
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
        renderCell: (c) => (
          <div className="flex items-center justify-center gap-1.5 no-row-click">
            {/* উশুল নিন বাটন */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal('payment', c);
              }}
              className={buttonClasses({ variant: 'cash', size: 'xs', className: 'gap-1' })}
              title="নগদ বকেয়া উশুল / জমা গ্রহণ করুন"
            >
              <HandCoins size={14} weight="bold" />
              <span>উশুল</span>
            </button>

            {/* খতিয়ান বিবরণী বাটন */}
            <Link
              href={`/khata/customers/${c.id}`}
              onClick={(e) => e.stopPropagation()}
              className={buttonClasses({ variant: 'secondary', size: 'xs', className: 'gap-1' })}
              title="রানিং খতিয়ান ও লেনদেন স্টেটমেন্ট"
            >
              <Scroll size={14} weight="bold" className="text-brand-deep" />
              <span>খতিয়ান</span>
            </Link>

            {/* হিসাব সমন্বয় (ছাড়) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal('adjustment', c);
              }}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-brand-soft/60 hover:border-brand-light text-slate-600 hover:text-brand-deep transition-[background-color,color] duration-150 active:scale-[0.96] cursor-pointer shadow-2xs"
              title="হিসাব সমন্বয় / ছাড় দিন"
            >
              <SlidersHorizontal size={14} weight="bold" />
            </button>

            {/* এডিট */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal('edit', c);
              }}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-brand-soft/60 hover:border-brand-light text-slate-600 hover:text-brand-deep transition-[background-color,color] duration-150 active:scale-[0.96] cursor-pointer shadow-2xs"
              title="কাস্টমার তথ্য এডিট করুন"
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
      tableId="customers-khata-table"
      data={customers}
      columns={columns}
      keyExtractor={(c) => c.id}
      isLoading={isLoading}
      onRowClick={(c) => router.push(`/khata/customers/${c.id}`)}
      pagination={
        meta.totalPages > 1 ? (
          <AdminPagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            totalItems={meta.total}
            pageSize={meta.limit}
            onPageChange={setPage}
            itemLabel="কাস্টমার"
            className="rounded-t-none border-t-0 p-0"
          />
        ) : null
      }
    />
  );
}
