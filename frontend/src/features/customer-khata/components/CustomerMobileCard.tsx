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
} from '@phosphor-icons/react';
import { formatCurrency, toBanglaDigits } from '@/lib/decimal';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { useCustomerKhataStore } from '../useCustomerKhataStore';
import { Customer } from '../customerKhata.types';

export function CustomerMobileCard({ customer }: { customer: Customer }) {
  const { openModal } = useCustomerKhataStore();

  const isDue = customer.currentDue > 0;
  const isAdvance = customer.currentDue < 0;

  return (
    <div className="bg-surface-card rounded-xl border border-border-default p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col justify-between space-y-2.5">
      {/* টপ সেকশন: নাম, মোবাইল ও টাইপ */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-semibold text-ink-primary text-xs sm:text-sm truncate">{customer.name}</h4>
            <Badge variant={customer.customerType === 'WHOLESALE' ? 'wholesale' : 'neutral'}>
              {customer.customerType === 'WHOLESALE' ? 'পাইকারি' : 'খুচরা'}
            </Badge>
          </div>

          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-1 text-xs text-ink-secondary font-mono tabular-nums tracking-tight mt-0.5 hover:text-brand-deep"
            >
              <Phone size={12} weight="bold" />
              <span>{toBanglaDigits(customer.phone)}</span>
            </a>
          )}

          {customer.address && (
            <div className="flex items-center gap-1 text-xs text-ink-secondary mt-0.5 truncate">
              <MapPin size={12} weight="bold" className="shrink-0 text-ink-secondary" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}
        </div>

        {/* এডিট ও অ্যাডজাস্টমেন্ট বাটন */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => openModal('adjustment', customer)}
            className="p-1.5 rounded-md border border-border-default text-ink-secondary hover:text-brand-deep hover:bg-brand-soft/60 transition-[background-color,color] duration-150 active:scale-[0.96] cursor-pointer"
            title="হিসাব সমন্বয়"
            aria-label={`${customer.name} হিসাব সমন্বয়`}
          >
            <SlidersHorizontal size={14} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => openModal('edit', customer)}
            className="p-1.5 rounded-md border border-border-default text-ink-secondary hover:text-brand-deep hover:bg-brand-soft/60 transition-[background-color,color] duration-150 active:scale-[0.96] cursor-pointer"
            title="এডিট"
            aria-label={`${customer.name} তথ্য এডিট করুন`}
          >
            <PencilSimple size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* মিডল সেকশন: বর্তমান বকেয়া স্ট্যাটাস */}
      <div className="bg-surface-subtle p-2.5 rounded-lg border border-border-default flex items-center justify-between">
        <span className="text-xs text-ink-secondary font-medium">বর্তমান ব্যালেন্স:</span>
        <div>
          {isDue ? (
            <div className="text-right">
              <span className="font-mono tabular-nums tracking-tight font-black text-due-text text-sm">
                {formatCurrency(customer.currentDue)}
              </span>
              <span className="block text-xs text-due-text font-semibold text-right">
                বাকি পাওনা
              </span>
            </div>
          ) : isAdvance ? (
            <div className="text-right">
              <span className="font-mono tabular-nums tracking-tight font-black text-cash-text text-sm">
                {formatCurrency(Math.abs(customer.currentDue))}
              </span>
              <span className="block text-xs text-cash-text font-semibold text-right">
                অগ্রিম জমা
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium text-ink-secondary">পরিশোধিত (০.০০)</span>
          )}
        </div>
      </div>

      {/* পিনড বটম ফুটার অ্যাকশনস */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <Link
          href={`/khata/customers/${customer.id}`}
          className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'gap-1.5' })}
        >
          <Scroll size={14} weight="bold" className="text-brand-deep" />
          <span>লেজার দেখুন</span>
        </Link>

        <button
          type="button"
          onClick={() => openModal('payment', customer)}
          className={buttonClasses({ variant: 'cash', size: 'sm', className: 'gap-1.5' })}
        >
          <HandCoins size={15} weight="bold" />
          <span>উশুল নিন</span>
        </button>
      </div>
    </div>
  );
}
