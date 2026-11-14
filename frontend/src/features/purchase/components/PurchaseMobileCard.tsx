'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Eye } from '@phosphor-icons/react';
import { Purchase } from '../purchase.types';
import { formatCurrency, formatDateBn } from '@/lib/decimal';

interface PurchaseMobileCardProps {
  purchase: Purchase;
  onOpenDetail?: (purchase: Purchase) => void;
}

export function PurchaseMobileCard({ purchase, onOpenDetail }: PurchaseMobileCardProps) {
  const router = useRouter();
  const isPaid = purchase.dueAmount <= 0;

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
      {/* ১. হেডার */}
      <div className="p-3 bg-surface-subtle/60 border-b border-border-subtle flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums font-bold text-ink-primary text-sm">
              #{purchase.purchaseNumber}
            </span>
            <span className="text-xs text-ink-secondary font-mono tabular-nums">
              {formatDateBn(purchase.createdAt)}
            </span>
          </div>
          <p className="text-xs font-semibold text-ink-body mt-0.5 truncate">
            {purchase.supplier?.companyName || purchase.supplier?.name || 'অজ্ঞাত মহাজন'}
          </p>
        </div>

        <div className="shrink-0">
          {isPaid ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-cash-bg text-cash-text border border-cash-border">
              পরিশোধিত
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-due-bg text-due-text border border-due-border">
              বকেয়া চালান
            </span>
          )}
        </div>
      </div>

      {/* ২. কী-ভ্যালু গ্রিড */}
      <div className="p-3 text-xs space-y-2.5">
        <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-border-subtle">
          <div>
            <span className="text-xs font-semibold text-ink-secondary block">
              ঠিকানা
            </span>
            <span className="text-ink-body text-xs truncate block">
              {purchase.supplier?.address || 'ঠিকানা দেওয়া নেই'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-ink-secondary block">
              গাড়িভাড়া
            </span>
            <span className="font-mono text-xs tabular-nums text-ink-primary font-semibold">
              {purchase.transportCost > 0 ? formatCurrency(purchase.transportCost) : '৳০'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs font-semibold text-ink-secondary block">
              নগদ পরিশোধ
            </span>
            <span className="font-mono text-xs font-bold text-cash-text tabular-nums">
              {formatCurrency(purchase.paidAmount)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-ink-secondary block">
              সর্বমোট বিল
            </span>
            <span className="font-mono text-sm font-black text-ink-primary tabular-nums">
              {formatCurrency(purchase.grandTotal)}
            </span>
            {purchase.dueAmount > 0 && (
              <span className="block text-xs font-mono text-due-text font-bold tabular-nums">
                বকেয়া: {formatCurrency(purchase.dueAmount)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ৩. অ্যাকশন বার */}
      <div className="p-2.5 bg-surface-subtle/60 border-t border-border-subtle">
        <button
          type="button"
          onClick={() => {
            if (onOpenDetail) {
              onOpenDetail(purchase);
            } else {
              router.push(`/purchases/${purchase.id}`);
            }
          }}
          className="w-full h-9 px-3 rounded-lg bg-surface-card border border-border-strong hover:bg-brand-soft hover:text-brand-deep hover:border-brand-light active:scale-[0.98] text-ink-body text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <Eye size={14} weight="bold" />
          <span>চালানপত্র ও আইটেম দেখুন</span>
        </button>
      </div>
    </div>
  );
}
