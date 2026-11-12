'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Spinner, Truck, ArrowsCounterClockwise } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/decimal';

interface PurchaseStickyHeaderProps {
  isSubmitting: boolean;
  itemCount: number;
  onSave: () => void;
  onReset: () => void;
}

export function PurchaseStickyHeader({
  isSubmitting,
  itemCount,
  onSave,
  onReset,
}: PurchaseStickyHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface-card border-b border-border-default shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/purchases"
            className="p-2 rounded-lg text-ink-secondary hover:text-brand-deep hover:bg-brand-soft transition-colors cursor-pointer border border-border-default shadow-2xs"
            title="চালান তালিকায় ফিরে যান"
            aria-label="চালান তালিকায় ফিরে যান"
          >
            <ArrowLeft size={16} weight="bold" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-lg font-bold text-ink-primary truncate">
                মোকাম চালান এন্ট্রি ও স্টক-ইন
              </h1>
              <Badge variant={itemCount > 0 ? 'brand' : 'wholesale'} className="hidden sm:inline-flex">
                <Truck size={12} weight="bold" />
                {itemCount > 0 ? `${formatNumber(itemCount)}টি আইটেম যুক্ত` : 'খসড়া চালান'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            disabled={isSubmitting}
            title="সম্পূর্ণ খসড়া মুছে নতুন চালান শুরু করুন"
          >
            <ArrowsCounterClockwise size={14} weight="bold" />
            <span className="hidden sm:inline">খসড়া মুছুন</span>
          </Button>

          <Button variant="primary" size="sm" onClick={onSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner size={14} className="animate-spin text-white" />
            ) : (
              <Check size={14} weight="bold" />
            )}
            <span>চালান সংরক্ষণ করুন</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
