'use client';

import React, { useId } from 'react';
import { Tag, Package, Stack } from '@phosphor-icons/react';

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
    <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep">
            <Tag size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-ink-primary">
            ১. মৌলিক পণ্যের বিবরণ
          </h2>
        </div>
        <span className="text-xs text-ink-secondary font-medium">আবশ্যকীয় তথ্য</span>
      </div>

      <div className="p-5 space-y-4">
        {/* পণ্যের নাম */}
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
            placeholder="পণ্যের নাম (ইংরেজি বা মূল)"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-sm text-ink-primary font-medium placeholder:text-ink-muted"
          />
        </div>

        {/* বাংলা নাম */}
        <div>
          <label htmlFor={`${formId}-bangla`} className="block text-xs font-semibold text-ink-body mb-1">
            বাংলা নাম (মেমো ও চালানের মুদ্রণ ফরম্যাট)
          </label>
          <input
            id={`${formId}-bangla`}
            type="text"
            value={banglaName}
            onChange={(e) => setBanglaName(e.target.value)}
            placeholder="বাংলা নাম"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-sm text-ink-primary placeholder:text-ink-muted"
          />
        </div>

        {/* পণ্যের ধরণ নির্বাচন */}
        <div className="pt-1">
          <span className="block text-xs font-semibold text-ink-body mb-2">
            পণ্যের ধরণ নির্বাচন করুন <span className="text-danger">*</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHasVariants(false)}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                !hasVariants
                  ? 'border-brand-deep bg-brand-soft/60 ring-1 ring-brand-deep/30 shadow-2xs'
                  : 'border-border-default hover:border-border-strong bg-surface-card hover:bg-surface-subtle/50'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  !hasVariants ? 'bg-brand-deep text-white' : 'bg-surface-subtle text-ink-secondary'
                }`}
              >
                <Package size={20} weight="bold" />
              </div>
              <div>
                <div className="text-xs font-bold text-ink-primary">একক পণ্য</div>
                <p className="text-xs text-ink-secondary mt-0.5 leading-snug">
                  নির্দিষ্ট এক সাইজ বা ওজন
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHasVariants(true)}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                hasVariants
                  ? 'border-brand-deep bg-brand-soft/60 ring-1 ring-brand-deep/30 shadow-2xs'
                  : 'border-border-default hover:border-border-strong bg-surface-card hover:bg-surface-subtle/50'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  hasVariants ? 'bg-brand-deep text-white' : 'bg-surface-subtle text-ink-secondary'
                }`}
              >
                <Stack size={20} weight="bold" />
              </div>
              <div>
                <div className="text-xs font-bold text-ink-primary">ভ্যারিয়েন্ট পণ্য (একাধিক সাইজ)</div>
                <p className="text-xs text-ink-secondary mt-0.5 leading-snug">
                  আলাদা দাম ও বারকোডসহ একাধিক সাইজ
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* বিবরণ */}
        <div>
          <label htmlFor={`${formId}-desc`} className="block text-xs font-semibold text-ink-body mb-1">
            বিবরণ বা অভ্যন্তরীণ নোট (ঐচ্ছিক)
          </label>
          <textarea
            id={`${formId}-desc`}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="বিবরণ বা নোট"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted"
          />
        </div>
      </div>
    </div>
  );
}
