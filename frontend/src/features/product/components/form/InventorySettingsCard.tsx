'use client';

import React from 'react';
import { Warehouse, Barcode, Scales, WarningCircle, Sparkle } from '@phosphor-icons/react';
import { generateRandom6Digits } from '@/lib/skuGenerator';

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
}

interface ProductCodeCardProps {
  sku: string;
  setSku: (v: string) => void;
  barcode: string;
  setBarcode: (v: string) => void;
}

const COMMON_BASE_UNITS = ['কেজি', 'পিস', 'প্যাকেট', 'বোতল', 'লিটার', 'গ্রাম', 'পাতা'];
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
}: InventorySettingsCardProps) {
  const handleSelectUnitPreset = (unit: string) => {
    setBaseUnitName(unit);
    setAllowDecimalQty(DECIMAL_CAPABLE_UNITS.has(unit));
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep">
            <Warehouse size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-ink-primary">
            ৩. একক ও স্টক পরিমাণ
          </h2>
        </div>
        <span className="text-xs text-ink-secondary font-medium">
          {isEditMode ? 'বর্তমান মজুত' : 'কতটুকু যোগ করব'}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* বেস ইউনিট নির্বাচন */}
        <div>
          <label className="block text-xs font-semibold text-ink-body mb-1">
            মূল একক <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={baseUnitName}
            onChange={(e) => setBaseUnitName(e.target.value)}
            placeholder="কেজি / পিস / প্যাকেট"
            className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs sm:text-sm text-ink-primary font-medium"
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
        </div>

        {/* স্টক ও অ্যালার্ট লিমিট */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-ink-body mb-1">
              {isEditMode ? 'বর্তমান মজুত' : 'শুরুর স্টক (কতটুকু যোগ করব)'}
            </label>
            <div className="relative">
              <input
                type="number"
                step={allowDecimalQty ? 'any' : '1'}
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
                className="w-full pl-3 pr-14 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm font-bold text-ink-primary"
              />
              <span className="absolute right-2.5 top-2.5 text-xs text-ink-secondary font-sans pointer-events-none">
                {baseUnitName || 'একক'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-body mb-1 flex items-center gap-1">
              <WarningCircle size={13} weight="bold" className="text-wholesale-solid" />
              <span>লো-স্টক অ্যালার্ট</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step={allowDecimalQty ? 'any' : '1'}
                min="0"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(e.target.value)}
                placeholder="10"
                className="w-full pl-3 pr-14 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm text-ink-primary"
              />
              <span className="absolute right-2.5 top-2.5 text-xs text-ink-secondary font-sans pointer-events-none">
                {baseUnitName || 'একক'}
              </span>
            </div>
          </div>
        </div>

        {/* ওজনযোগ্য (ডেসিমাল) টগল */}
        <div className="pt-1 border-t border-border-subtle">
          <label className="flex items-center gap-2.5 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={allowDecimalQty}
              onChange={(e) => setAllowDecimalQty(e.target.checked)}
              className="rounded accent-brand-deep h-4 w-4 border-border-strong cursor-pointer"
            />
            <span className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <Scales size={14} weight="bold" className="text-brand-deep" />
              ওজনযোগ্য পণ্য (ভগ্নাংশ যেমন ০.৫, ০.৭৫ বিক্রি সম্ভব)
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
  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
      <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep">
            <Barcode size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-ink-primary">
            SKU ও বারকোড
          </h2>
        </div>
      </div>

      <div className="p-5 space-y-3.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-ink-body">
              SKU (স্টক কোড)
            </label>
            <button
              type="button"
              onClick={() => setSku(generateRandom6Digits())}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-brand-soft hover:bg-brand-light/60 text-brand-deep text-xs font-bold border border-brand-light transition-colors cursor-pointer"
              title="নতুন ৬-ডিজিটের ইউনিক SKU তৈরি করুন"
            >
              <Sparkle size={12} weight="bold" />
              <span>অটো কোড</span>
            </button>
          </div>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="৬-ডিজিট SKU"
            className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm text-ink-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-body mb-1 flex items-center gap-1">
            <Barcode size={14} weight="bold" className="text-ink-secondary" />
            <span>বারকোড নম্বর (ঐচ্ছিক)</span>
          </label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="বারকোড লিখুন বা স্ক্যান করুন"
            className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm text-ink-primary"
          />
        </div>
      </div>
    </div>
  );
}
