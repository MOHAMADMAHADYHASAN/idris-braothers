'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Spinner } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

interface ProductStickyHeaderProps {
  isEditMode: boolean;
  productName?: string;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function ProductStickyHeader({
  isEditMode,
  productName,
  isSaving,
  onSave,
  onCancel,
}: ProductStickyHeaderProps) {
  return (
    <header className="sticky top-0 z-40 surface-glass-header border-b border-border-default/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/products"
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
            className="p-2 rounded-lg text-ink-secondary hover:text-brand-deep hover:bg-brand-soft transition-colors cursor-pointer border border-border-default shadow-2xs"
            title="পণ্য তালিকায় ফিরে যান"
            aria-label="পণ্য তালিকায় ফিরে যান"
          >
            <ArrowLeft size={16} weight="bold" />
          </Link>

          <h1 className="text-sm sm:text-lg font-bold text-ink-primary truncate">
            {isEditMode ? `পণ্য সম্পাদনা: ${productName || ''}` : 'নতুন পণ্য যোগ করুন'}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isSaving}>
            বাতিল
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <Spinner size={14} className="animate-spin text-white" />
            ) : (
              <Check size={14} weight="bold" />
            )}
            <span>{isEditMode ? 'আপডেট সংরক্ষণ' : 'সংরক্ষণ করুন'}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
