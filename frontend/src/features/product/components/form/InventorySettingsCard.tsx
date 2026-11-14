'use client';

import React, { useId } from 'react';
import { Sparkle } from '@phosphor-icons/react';
import { generateRandom6Digits } from '@/lib/skuGenerator';
import { CategorySuggestedUnit } from '../../product.types';

interface InventorySettingsCardProps {
  baseUnitName: string;
  setBaseUnitName: (v: string) => void;
  allowDecimalQty: boolean;
  setAllowDecimalQty: (v: boolean) => void;
  stockQuantity: string;
  setStockQuantity: (v: string) => void;
  lowStockAlert: string;
  setLowStockAlert: (v: string) => void;
  isEditMode: boolean;
  suggestedUnits?: CategorySuggestedUnit[];
}

interface ProductCodeCardProps {
  sku: string;
  setSku: (v: string) => void;
  barcode: string;
  setBarcode: (v: string) => void;
}

const COMMON_BASE_UNITS = ['কেজি', 'পিস', 'প্যাকেট', 'বোতল', 'লিটার'];
const DECIMAL_CAPABLE_UNITS = new Set(['কেজি', 'গ্রাম', 'লিটার']);

export function InventorySettingsCard({
  baseUnitName,
  setBaseUnitName,
  allowDecimalQty,
  setAllowDecimalQty,
  stockQuantity,
  setStockQuantity,
  lowStockAlert,
  setLowStockAlert,
  isEditMode,
  suggestedUnits,
}: InventorySettingsCardProps) {
  const formId = useId();
  const handleSelectUnitPreset = (unit: string) => {
    setBaseUnitName(unit);
    setAllowDecimalQty(DECIMAL_CAPABLE_UNITS.has(unit));
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-default surface-card-crisp overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border-default">
        <h2 className="text-sm font-bold text-ink-primary">স্টক ও একক</h2>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label htmlFor={`${formId}-base-unit`} className="block text-xs font-semibold text-ink-body mb-1">
            মূল একক <span className="text-danger">*</span>
          </label>
          <input
            id={`${formId}-base-unit`}
            type="text"
            required
            value={baseUnitName}
            onChange={(e) => setBaseUnitName(e.target.value)}
            placeholder="কেজি / পিস / প্যাকেট"
            className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs sm:text-sm text-ink-primary font-medium"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_BASE_UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => handleSelectUnitPreset(u)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  baseUnitName === u
                    ? 'bg-brand-deep text-white border-brand-deep'
                    : 'bg-surface-subtle text-ink-body border-border-default hover:bg-brand-soft hover:text-brand-deep'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {suggestedUnits && suggestedUnits.length > 0 && (
            <div className="mt-2 text-[11px] text-ink-muted bg-surface-subtle p-2 rounded-md border border-border-default flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-brand-deep">আড়ত রূপান্তর নির্দেশিকা:</span>
              <span>
                {suggestedUnits.map((u) => `১ ${u.unitName} = ${u.conversionFactor} ${baseUnitName}`).join(' • ')}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div>
            <label htmlFor={`${formId}-stock`} className="block text-xs font-semibold text-ink-body mb-1">
              {isEditMode ? 'বর্তমান স্টক' : 'শুরুর স্টক'}
            </label>
            <div className="relative">
              <input
                id={`${formId}-stock`}
                type="number"
                step={allowDecimalQty ? 'any' : '1'}
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
                className="w-full pl-3 pr-14 py-2 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm font-bold text-ink-primary"
              />
              <span className="absolute right-2.5 top-2.5 text-xs text-ink-secondary font-sans pointer-events-none">
                {baseUnitName || 'একক'}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-alert`} className="block text-xs font-semibold text-ink-body mb-1">
              লো-স্টক অ্যালার্ট
            </label>
            <div className="relative">
              <input
                id={`${formId}-alert`}
                type="number"
                step={allowDecimalQty ? 'any' : '1'}
                min="0"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(e.target.value)}
                placeholder="10"
                className="w-full pl-3 pr-14 py-2 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm text-ink-primary"
              />
              <span className="absolute right-2.5 top-2.5 text-xs text-ink-secondary font-sans pointer-events-none">
                {baseUnitName || 'একক'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border-subtle">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allowDecimalQty}
              onChange={(e) => setAllowDecimalQty(e.target.checked)}
              className="rounded accent-brand-deep h-4 w-4 border-border-strong cursor-pointer"
            />
            <span className="text-xs font-semibold text-ink-primary">
              ভগ্নাংশ ওজন অনুমোদিত (যেমন ০.৫ কেজি)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact SKU & Barcode card for the product sidebar.
 */
export function ProductCodeCard({ sku, setSku, barcode, setBarcode }: ProductCodeCardProps) {
  const codeId = useId();
  return (
    <div className="bg-surface-card rounded-xl border border-border-default surface-card-crisp overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border-default">
        <h2 className="text-sm font-bold text-ink-primary">SKU ও বারকোড</h2>
      </div>

      <div className="p-5 space-y-3.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor={`${codeId}-sku`} className="block text-xs font-semibold text-ink-body">
              SKU
            </label>
            <button
              type="button"
              onClick={() => setSku(generateRandom6Digits())}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-soft hover:bg-brand-light/60 text-brand-deep text-xs font-semibold border border-brand-light transition-colors cursor-pointer"
              title="নতুন ৬-ডিজিটের ইউনিক SKU তৈরি করুন"
            >
              <Sparkle size={12} weight="bold" />
              <span>অটো কোড</span>
            </button>
          </div>
          <input
            id={`${codeId}-sku`}
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="৬-ডিজিট SKU"
            className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm text-ink-primary"
          />
        </div>

        <div>
          <label htmlFor={`${codeId}-barcode`} className="block text-xs font-semibold text-ink-body mb-1">
            বারকোড (ঐচ্ছিক)
          </label>
          <input
            id={`${codeId}-barcode`}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="বারকোড লিখুন বা স্ক্যান করুন"
            className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm text-ink-primary"
          />
        </div>
      </div>
    </div>
  );
}
