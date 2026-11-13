'use client';

import React, { useId } from 'react';
import { Package, Stack } from '@phosphor-icons/react';

interface BasicInfoCardProps {
  name: string;
  setName: (v: string) => void;
  banglaName: string;
  setBanglaName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  hasVariants: boolean;
  setHasVariants: (v: boolean) => void;
  isEditMode: boolean;
}

export function BasicInfoCard({
  name,
  setName,
  banglaName,
  setBanglaName,
  description,
  setDescription,
  hasVariants,
  setHasVariants,
  isEditMode,
}: BasicInfoCardProps) {
  const formId = useId();
  return (
    <div className="bg-surface-card rounded-xl border border-border-default surface-card-crisp overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border-default">
        <h2 className="text-sm font-bold text-ink-primary">মৌলিক তথ্য</h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor={`${formId}-name`} className="block text-xs font-semibold text-ink-body mb-1">
              পণ্যের নাম <span className="text-danger">*</span>
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: Miniket Rice"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep text-sm text-ink-primary font-medium placeholder:text-ink-muted"
            />
          </div>

          <div>
            <label htmlFor={`${formId}-bangla`} className="block text-xs font-semibold text-ink-body mb-1">
              বাংলা নাম (ঐচ্ছিক)
            </label>
            <input
              id={`${formId}-bangla`}
              type="text"
              value={banglaName}
              onChange={(e) => setBanglaName(e.target.value)}
              placeholder="যেমন: মিনিকেট চাল"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep text-sm text-ink-primary placeholder:text-ink-muted"
            />
          </div>
        </div>

        <div>
          <span className="block text-xs font-semibold text-ink-body mb-1.5">
            পণ্যের ধরন <span className="text-danger">*</span>
          </span>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-surface-subtle border border-border-default">
            <button
              type="button"
              disabled={isEditMode}
              onClick={() => setHasVariants(false)}
              className={`h-9 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                !hasVariants
                  ? 'bg-surface-card text-brand-deep shadow-2xs border border-border-default'
                  : 'text-ink-secondary hover:text-ink-primary'
              } ${isEditMode ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Package size={15} weight="bold" />
              <span>একক পণ্য</span>
            </button>

            <button
              type="button"
              disabled={isEditMode}
              onClick={() => setHasVariants(true)}
              className={`h-9 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                hasVariants
                  ? 'bg-surface-card text-brand-deep shadow-2xs border border-border-default'
                  : 'text-ink-secondary hover:text-ink-primary'
              } ${isEditMode ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Stack size={15} weight="bold" />
              <span>একাধিক ভ্যারিয়েন্ট</span>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-desc`} className="block text-xs font-semibold text-ink-body mb-1">
            নোট (ঐচ্ছিক)
          </label>
          <input
            id={`${formId}-desc`}
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="প্রয়োজনীয় নোট লিখুন..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted"
          />
        </div>
      </div>
    </div>
  );
}
