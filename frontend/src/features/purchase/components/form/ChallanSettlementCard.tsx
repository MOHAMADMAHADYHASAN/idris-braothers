'use client';

import React from 'react';
import {
  Coins,
  Truck,
  Tag,
  HandCoins,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import { formatCurrency, formatNumber } from '@/lib/decimal';
import { usePurchaseStore } from '../../usePurchaseStore';

export function ChallanSettlementCard() {
  const {
    items,
    transportCost,
    discount,
    paidAmount,
    setTransportCost,
    setDiscount,
    setPaidAmount,
    getSubTotal,
    getGrandTotal,
    getDueAmount,
  } = usePurchaseStore();

  const subTotal = getSubTotal();
  const grandTotal = getGrandTotal();
  const dueAmount = getDueAmount();

  const handlePaidChange = (val: string) => {
    setPaidAmount(Number(val) || 0);
  };

  const handlePayFull = () => {
    setPaidAmount(grandTotal);
  };

  const handlePayZero = () => {
    setPaidAmount(0);
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden sticky top-20">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep">
            <Coins size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-ink-primary">
            চালান আর্থিক হিসাব ও নিষ্পত্তি
          </h2>
        </div>
        <span className="text-xs text-ink-secondary font-medium">হিসাব সারাংশ</span>
      </div>

      <div className="p-5 space-y-3.5">
        {/* ১. পণ্যের উপমোট */}
        <div className="flex items-center justify-between text-xs text-ink-secondary pb-2 border-b border-border-subtle">
          <span>পণ্যের মোট মূল্য ({formatNumber(items.length)}টি আইটেম):</span>
          <span className="font-mono tabular-nums font-bold text-ink-primary text-sm">
            {formatCurrency(subTotal)}
          </span>
        </div>

        {/* ২. গাড়িভাড়া ও কুলি খরচ (+) */}
        <div>
          <label className="text-ink-body flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Truck size={14} weight="bold" className="text-ink-secondary" />
              <span>গাড়িভাড়া ও কুলি খরচ (+):</span>
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-ink-secondary font-bold text-xs select-none">৳</span>
            <input
              type="number"
              step="any"
              min="0"
              value={transportCost || ''}
              onChange={(e) => setTransportCost(Number(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs text-right text-ink-primary font-bold"
            />
          </div>
        </div>

        {/* ৩. মহাজন ছাড় (-) */}
        <div>
          <label className="text-ink-body flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Tag size={14} weight="bold" className="text-ink-secondary" />
              <span>মহাজন ছাড় ও কমিশন (-):</span>
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-ink-secondary font-bold text-xs select-none">৳</span>
            <input
              type="number"
              step="any"
              min="0"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs text-right text-ink-primary font-bold"
            />
          </div>
        </div>

        {/* ৪. সর্বমোট চালান ব্যয় (Soft Navy Summary Strip — Replaces Glaring Dark Slab) */}
        <div className="p-3.5 rounded-xl bg-brand-soft border border-brand-light flex items-center justify-between shadow-2xs">
          <div className="text-xs text-brand-deep font-bold">
            সর্বমোট চালান ব্যয়
          </div>
          <div className="text-right">
            <div className="font-mono text-base sm:text-lg font-black text-brand-deep tabular-nums">
              {formatCurrency(grandTotal)}
            </div>
          </div>
        </div>

        {/* ৫. নগদ পরিশোধ */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-ink-body flex items-center gap-1.5">
              <HandCoins size={14} weight="bold" className="text-success" />
              <span>নগদ পরিশোধের পরিমাণ:</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePayFull}
                className="px-2 py-0.5 rounded text-xs font-bold bg-cash-bg text-cash-text border border-cash-border hover:bg-emerald-100 cursor-pointer"
                title="সম্পূর্ণ চালান পরিশোধ"
              >
                পুরো
              </button>
              <button
                type="button"
                onClick={handlePayZero}
                className="px-2 py-0.5 rounded text-xs font-bold bg-surface-subtle text-ink-body border border-border-default hover:bg-border-default cursor-pointer"
                title="সম্পূর্ণ চালান বাকি"
              >
                শূন্য
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-2.5 text-ink-secondary font-bold text-xs select-none">৳</span>
            <input
              type="number"
              step="any"
              min="0"
              value={paidAmount || ''}
              onChange={(e) => handlePaidChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-sm text-right text-ink-primary font-bold"
            />
          </div>
        </div>

        {/* ৬. মহাজন খাতায় বাকি জের */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
            dueAmount > 0
              ? 'bg-due-bg border-due-border text-due-text'
              : 'bg-cash-bg border-cash-border text-cash-text'
          }`}
        >
          <div className="flex items-center gap-2">
            {dueAmount > 0 ? (
              <WarningCircle size={16} weight="fill" className="text-danger shrink-0" />
            ) : (
              <CheckCircle size={16} weight="fill" className="text-success shrink-0" />
            )}
            <div className="text-xs font-bold">
              {dueAmount > 0 ? 'মহাজন খাতায় বাকি যোগ হবে' : 'চালানটি সম্পূর্ণ পরিশোধিত'}
            </div>
          </div>
          <div className="text-right font-mono text-sm font-bold">
            {formatCurrency(dueAmount)}
          </div>
        </div>
      </div>
    </div>
  );
}
