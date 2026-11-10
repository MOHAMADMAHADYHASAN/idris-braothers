'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Spinner, Truck, ArrowsCounterClockwise } from '@phosphor-icons/react';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* বাম পাশ: ব্যাক বাটন ও টাইটেল */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/purchases"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 shadow-2xs"
            title="চালান তালিকায় ফিরে যান"
          >
            <ArrowLeft size={16} weight="bold" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                মোকাম চালান এন্ট্রি ও স্টক-ইন
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Truck size={11} weight="bold" />
                {itemCount > 0 ? `${itemCount}টি আইটেম যুক্ত` : 'খসড়া চালান'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate mt-0.5">
              মরিচপট্টি, ফেনী বাজার — মোকাম চালান, বস্তা সাইজ, গাড়িভাড়া ও ক্রয়মূল্য নিষ্পত্তি
            </p>
          </div>
        </div>

        {/* ডান পাশ: অ্যাকশন কন্ট্রোলস */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onReset}
            disabled={isSubmitting}
            className="px-3 sm:px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 active:scale-95 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            title="সম্পূর্ণ খসড়া মুছে নতুন চালান শুরু করুন"
          >
            <ArrowsCounterClockwise size={13} weight="bold" />
            <span className="hidden sm:inline">খসড়া মুছুন</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSubmitting}
            className="px-4 sm:px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Spinner size={14} className="animate-spin text-white" />
            ) : (
              <Check size={14} weight="bold" />
            )}
            <span>চালান সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>
    </header>
  );
}
