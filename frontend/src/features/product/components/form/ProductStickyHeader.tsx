'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Spinner, Package } from '@phosphor-icons/react';

interface ProductStickyHeaderProps {
  isEditMode: boolean;
  productName?: string;
  isSaving: boolean;
  hasVariants: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function ProductStickyHeader({
  isEditMode,
  productName,
  isSaving,
  hasVariants,
  onSave,
  onCancel,
}: ProductStickyHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* বাম পাশ: ব্যাক বাটন ও টাইটেল */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/products"
            onClick={(e) => {
              // let caller handle confirmation if dirty
              e.preventDefault();
              onCancel();
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 shadow-2xs"
            title="পণ্য তালিকায় ফিরে যান"
          >
            <ArrowLeft size={16} weight="bold" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                {isEditMode ? `পণ্য সম্পাদনা: ${productName || ''}` : 'নতুন পণ্য এন্ট্রি'}
              </h1>
              <span
                className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  hasVariants
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                <Package size={11} weight="bold" />
                {hasVariants ? 'ভ্যারিয়েন্ট মোড' : 'একক পণ্য'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate mt-0.5">
              মরিচপট্টি, ফেনী বাজার — ইনভেন্টরি, মাল্টি-ইউনিট রূপান্তর ও সঠিক দর ব্যবস্থাপনা
            </p>
          </div>
        </div>

        {/* ডান পাশ: অ্যাকশন কন্ট্রোলস */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-3 sm:px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 active:scale-95 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            বাতিল
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="px-4 sm:px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <Spinner size={14} className="animate-spin text-white" />
            ) : (
              <Check size={14} weight="bold" />
            )}
            <span>{isEditMode ? 'আপডেট সংরক্ষণ করুন' : 'পণ্য সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
