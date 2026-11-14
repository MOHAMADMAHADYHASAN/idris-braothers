'use client';

import React from 'react';
import Link from 'next/link';
import {
  HandCoins,
  Scroll,
  PencilSimple,
  SlidersHorizontal,
  Phone,
  MapPin,
  Buildings,
} from '@phosphor-icons/react';
import { formatCurrency, toBanglaDigits } from '@/lib/decimal';
import { buttonClasses } from '@/components/ui/Button';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { Supplier } from '../supplierKhata.types';

export function SupplierMobileCard({ supplier }: { supplier: Supplier }) {
  const { openModal } = useSupplierKhataStore();

  const isPayable = supplier.currentPayable > 0;
  const isAdvance = supplier.currentPayable < 0;

  return (
    <div className="bg-surface-card rounded-xl border border-border-default p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-3">
      {/* টপ সেকশন: গদির নাম, মহাজনের নাম ও ফোন */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Buildings size={15} weight="bold" className="text-brand-deep shrink-0" />
            <h4 className="font-semibold text-ink-primary text-xs sm:text-sm truncate">
              {supplier.companyName || supplier.name}
            </h4>
          </div>

          {supplier.companyName && (
            <p className="text-xs text-ink-secondary mt-0.5">মহাজন: {supplier.name}</p>
          )}

          {supplier.phone && (
            <a
              href={`tel:${supplier.phone}`}
              className="inline-flex items-center gap-1 text-xs text-ink-body font-mono tabular-nums tracking-tight mt-0.5 hover:text-brand-deep hover:underline"
            >
              <Phone size={12} weight="bold" className="text-ink-secondary" />
              <span>{toBanglaDigits(supplier.phone)}</span>
            </a>
          )}

          {supplier.address && (
            <div className="flex items-center gap-1 text-xs text-ink-secondary mt-0.5 truncate">
              <MapPin size={12} weight="bold" className="shrink-0 text-ink-secondary" />
              <span className="truncate">{supplier.address}</span>
            </div>
          )}
        </div>

        {/* এডিট ও সমন্বয় বাটন */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => openModal('adjustment', supplier)}
            className="p-1.5 rounded-md border border-border-default text-ink-secondary hover:text-brand-deep hover:bg-brand-soft/60 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150 cursor-pointer"
            title="শুকতি / কমিশন সমন্বয়"
            aria-label={`${supplier.name} শুকতি বা কমিশন সমন্বয়`}
          >
            <SlidersHorizontal size={14} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => openModal('edit', supplier)}
            className="p-1.5 rounded-md border border-border-default text-ink-secondary hover:text-brand-deep hover:bg-brand-soft/60 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150 cursor-pointer"
            title="এডিট"
            aria-label={`${supplier.name} তথ্য এডিট করুন`}
          >
            <PencilSimple size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* মিডল সেকশন: দেনার অবস্থা */}
      <div className="bg-surface-subtle p-2.5 rounded-lg border border-border-default flex items-center justify-between">
        <span className="text-xs text-ink-secondary font-medium">দোকানের ব্যালেন্স:</span>
        <div>
          {isPayable ? (
            <div className="text-right">
              <span className="font-mono tabular-nums tracking-tight font-black text-wholesale-text text-sm">
                {formatCurrency(supplier.currentPayable)}
              </span>
              <span className="block text-xs text-wholesale-text font-semibold text-right">
                দোকানের দেনা
              </span>
            </div>
          ) : isAdvance ? (
            <div className="text-right">
              <span className="font-mono tabular-nums tracking-tight font-black text-cash-text text-sm">
                {formatCurrency(Math.abs(supplier.currentPayable))}
              </span>
              <span className="block text-xs text-cash-text font-semibold text-right">
                অগ্রিম দেওয়া
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-ink-secondary">পরিশোধিত (০.০০)</span>
          )}
        </div>
      </div>

      {/* পিনড বটম ফুটার অ্যাকশনস */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <Link
          href={`/khata/suppliers/${supplier.id}`}
          className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'gap-1.5' })}
        >
          <Scroll size={14} weight="bold" className="text-brand-deep" />
          <span>লেজার দেখুন</span>
        </Link>

        <button
          type="button"
          onClick={() => openModal('payment', supplier)}
          className={buttonClasses({ variant: 'cash', size: 'sm', className: 'gap-1.5' })}
        >
          <HandCoins size={15} weight="bold" />
          <span>দেনা শোধ</span>
        </button>
      </div>
    </div>
  );
}
