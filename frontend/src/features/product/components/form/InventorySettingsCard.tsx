'use client';

import React from 'react';
import { Warehouse, Barcode, Scales, WarningCircle } from '@phosphor-icons/react';

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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-sky-50 text-sky-600">
            <Warehouse size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            ইনভেন্টরি ও বেস ইউনিট
          </h2>
        </div>
        <span className="text-[10px] text-slate-400">স্টক কন্ট্রোল</span>
      </div>

      <div className="p-5 space-y-4">
        {/* বেস ইউনিট নির্বাচন */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            মূল একক (Base Unit) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={baseUnitName}
            onChange={(e) => setBaseUnitName(e.target.value)}
            placeholder="উদাঃ কেজি, লিটার, পিস"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm text-slate-900 font-medium"
          />
          {/* কুইক প্রিসেট চিপস */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {COMMON_BASE_UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setBaseUnitName(u)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  baseUnitName === u
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* ওজনযোগ্য (ডেসিমাল) টগল */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allowDecimalQty}
              onChange={(e) => setAllowDecimalQty(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Scales size={13} weight="bold" className="text-indigo-600" />
                ওজনযোগ্য পণ্য (Decimal / ভগ্নাংশ পরিমাণ)
              </span>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                টিক দেওয়া থাকলে স্কেলে ১.৫ কেজি বা ০.২৫ কেজির মতো ভগ্নাংশে বিক্রি করা যাবে।
              </p>
            </div>
          </label>
        </div>

        {/* স্টক ও অ্যালার্ট লিমিট */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isEditMode ? 'বর্তমান মজুত' : 'শুরুর স্টক (Opening)'}
            </label>
            <div className="relative">
              <input
                type="number"
                step={allowDecimalQty ? 'any' : '1'}
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs sm:text-sm text-slate-900"
              />
              <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 font-sans pointer-events-none">
                {baseUnitName || 'একক'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <WarningCircle size={12} weight="bold" className="text-amber-500" />
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
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs sm:text-sm text-slate-900"
              />
              <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 font-sans pointer-events-none">
                {baseUnitName || 'একক'}
              </span>
            </div>
          </div>
        </div>

        {/* SKU ও বারকোড */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SKU (স্টক কোড)
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="উদাঃ TEER-SO-1L"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Barcode size={14} weight="bold" className="text-slate-500" />
              <span>বারকোড নম্বর</span>
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="স্ক্যান করুন বা নম্বর লিখুন..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs sm:text-sm text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
