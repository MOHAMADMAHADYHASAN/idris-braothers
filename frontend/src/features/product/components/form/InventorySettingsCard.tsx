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
  sku: string;
  setSku: (v: string) => void;
  barcode: string;
  setBarcode: (v: string) => void;
  isEditMode: boolean;
}

const COMMON_BASE_UNITS = ['কেজি', 'লিটার', 'বস্তা', 'পিস', 'গ্রাম', 'প্যাকেট', 'ডজন', 'টিন'];

export function InventorySettingsCard({
  baseUnitName,
  setBaseUnitName,
  allowDecimalQty,
  setAllowDecimalQty,
  stockQuantity,
  setStockQuantity,
  lowStockAlert,
  setLowStockAlert,
  sku,
  setSku,
  barcode,
  setBarcode,
  isEditMode,
}: InventorySettingsCardProps) {
  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep">
            <Warehouse size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-ink-primary">
            ইনভেন্টরি ও মূল একক
          </h2>
        </div>
        <span className="text-xs text-ink-secondary font-medium">স্টক নিয়ন্ত্রণ</span>
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
            placeholder="কেজি / লিটার / পিস"
            className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs sm:text-sm text-ink-primary font-medium"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_BASE_UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setBaseUnitName(u)}
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

        {/* ওজনযোগ্য (ডেসিমাল) টগল */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allowDecimalQty}
              onChange={(e) => setAllowDecimalQty(e.target.checked)}
              className="rounded accent-brand-deep h-4 w-4 border-border-strong cursor-pointer"
            />
            <span className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <Scales size={14} weight="bold" className="text-brand-deep" />
              ওজনযোগ্য পণ্য (ভগ্নাংশ পরিমাণ)
            </span>
          </label>
        </div>

        {/* স্টক ও অ্যালার্ট লিমিট */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-ink-body mb-1">
              {isEditMode ? 'বর্তমান মজুত' : 'শুরুর স্টক'}
            </label>
            <div className="relative">
              <input
                type="number"
                step={allowDecimalQty ? 'any' : '1'}
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm text-ink-primary"
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
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm text-ink-primary"
              />
              <span className="absolute right-2.5 top-2.5 text-xs text-ink-secondary font-sans pointer-events-none">
                {baseUnitName || 'একক'}
              </span>
            </div>
          </div>
        </div>

        {/* SKU ও বারকোড */}
        <div className="space-y-3 pt-2 border-t border-border-subtle">
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
    </div>
  );
}
