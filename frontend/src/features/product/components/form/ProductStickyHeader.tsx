'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Spinner, Package } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

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

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-lg font-bold text-ink-primary truncate">
                {isEditMode ? `পণ্য সম্পাদনা: ${productName || ''}` : 'নতুন পণ্য এন্ট্রি'}
              </h1>
              <Badge variant={hasVariants ? 'wholesale' : 'brand'} className="hidden sm:inline-flex">
                <Package size={12} weight="bold" />
                {hasVariants ? 'ভ্যারিয়েন্ট মোড' : 'একক পণ্য'}
              </Badge>
            </div>
          </div>
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
            <span>{isEditMode ? 'আপডেট সংরক্ষণ করুন' : 'পণ্য সংরক্ষণ করুন'}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
