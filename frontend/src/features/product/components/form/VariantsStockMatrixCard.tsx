'use client';

import React, { useState } from 'react';
import {
  Stack,
  Plus,
  Trash,
  Lightning,
  Coins,
  Sparkle,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { FormUnitItem } from './PackagingUnitsCard';
import {
  extractBaseProductCode,
  generateProductVariantSkus,
  generateRandom6Digits,
  generateSingleVariantSku,
} from '@/lib/skuGenerator';
import { formatNumber } from '@/lib/decimal';

export interface FormVariantItem {
  id?: string;
  variantName: string;
  sku: string;
  barcode: string;
  baseUnitName: string;
  allowDecimalQty: boolean;
  currentPurchasePrice: string;
  retailPrice: string;
  wholesalePrice: string;
  stockQuantity: string;
  lowStockAlert: string;
  units: FormUnitItem[];
  hasSalesHistory?: boolean; // For relational safety guard
}

interface VariantsStockMatrixCardProps {
  variants: FormVariantItem[];
  setVariants: React.Dispatch<React.SetStateAction<FormVariantItem[]>>;
  defaultBaseUnit: string;
  simpleSku?: string;
}

const COMMON_SIZE_PRESETS = [
  '৫৳ প্যাক',
  '১০৳ প্যাক',
  '৫ মি.লি.',
  '২৫০ গ্রাম',
  '৫০০ গ্রাম',
  '১ কেজি',
  '২ কেজি',
  '৫ কেজি',
  '২৫০ মিলি',
  '৫০০ মিলি',
  '১ লিটার',
  '২ লিটার',
  '৫ লিটার',
];

const VARIANT_UNIT_PRESETS = ['প্যাকেট', 'বোতল', 'পিস', 'কেজি'] as const;

function inferVariantUnitAndDecimal(sizeName: string, preferredUnit: string): { baseUnitName: string; allowDecimalQty: boolean } {
  if (sizeName.includes('মিলি') || sizeName.includes('মি.লি.') || sizeName.includes('লিটার')) {
    return {
      baseUnitName: sizeName.includes('৫ মি.লি.') ? 'পিস' : 'বোতল',
      allowDecimalQty: false,
    };
  }
  if (sizeName.includes('প্যাক')) {
    return { baseUnitName: 'প্যাকেট', allowDecimalQty: false };
  }
  if (sizeName.includes('গ্রাম') || sizeName.includes('কেজি')) {
    return {
      baseUnitName: preferredUnit === 'কেজি' ? 'প্যাকেট' : preferredUnit,
      allowDecimalQty: false,
    };
  }
  return {
    baseUnitName: preferredUnit,
    allowDecimalQty: preferredUnit === 'কেজি',
  };
}

export function VariantsStockMatrixCard({
  variants,
  setVariants,
  defaultBaseUnit,
  simpleSku,
}: VariantsStockMatrixCardProps) {
  const [defaultVariantUnit, setDefaultVariantUnit] = useState<string>(
    defaultBaseUnit === 'কেজি' ? 'প্যাকেট' : defaultBaseUnit || 'পিস'
  );

  // বাল্ক অ্যাপ্লিকেটর স্টেট
  const [bulkPurchase, setBulkPurchase] = useState('');
  const [bulkWholesale, setBulkWholesale] = useState('');
  const [bulkRetail, setBulkRetail] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  // সব রো-এর ডিফল্ট একক পরিবর্তন
  const handleSelectDefaultUnit = (unit: string) => {
    setDefaultVariantUnit(unit);
    const isDecimal = unit === 'কেজি';
    if (variants.length > 0) {
      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          baseUnitName: unit,
          allowDecimalQty: isDecimal,
        }))
      );
    }
  };

  // কুইক প্রিসেট দিয়ে নতুন ভ্যারিয়েন্ট যোগ (অটো ৬-ডিজিট SKU সহ)
  const handleAddPreset = (sizeName: string) => {
    // ডুপ্লিকেট নাম রোধ
    if (variants.some((v) => v.variantName.toLowerCase() === sizeName.toLowerCase())) {
      alert(`"${sizeName}" ভ্যারিয়েন্টটি ইতিমধ্যে তালিকায় আছে!`);
      return;
    }

    const { baseUnitName, allowDecimalQty } = inferVariantUnitAndDecimal(sizeName, defaultVariantUnit);

    setVariants((prev) => {
      const autoSku = generateSingleVariantSku(sizeName, prev, prev.length, simpleSku);
      return [
        ...prev,
        {
          variantName: sizeName,
          sku: autoSku,
          barcode: '',
          baseUnitName,
          allowDecimalQty,
          currentPurchasePrice: bulkPurchase || '',
          wholesalePrice: bulkWholesale || '',
          retailPrice: bulkRetail || '',
          stockQuantity: bulkStock || '0',
          lowStockAlert: '10',
          units: [],
        },
      ];
    });
  };

  // কাস্টম ব্ল্যাংক ভ্যারিয়েন্ট রো যোগ
  const handleAddCustomVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        variantName: '',
        sku: '',
        barcode: '',
        baseUnitName: defaultVariantUnit || 'পিস',
        allowDecimalQty: defaultVariantUnit === 'কেজি',
        currentPurchasePrice: bulkPurchase || '',
        wholesalePrice: bulkWholesale || '',
        retailPrice: bulkRetail || '',
        stockQuantity: bulkStock || '0',
        lowStockAlert: '10',
        units: [],
      },
    ]);
  };

  // ফাঁকা SKU অটো-জেনারেট (সব ভ্যারিয়েন্ট একসাথে)
  const handleGenerateMissingSkus = () => {
    if (variants.length === 0) return;
    setVariants((prev) => {
      const baseCode = extractBaseProductCode(prev, simpleSku) || generateRandom6Digits();
      return generateProductVariantSkus(prev, {
        baseCode,
        preserveExistingSkus: true,
      });
    });
  };

  // নির্দিষ্ট এক রো-এর SKU রিজেনারেট
  const handleRegenerateRowSku = (index: number) => {
    setVariants((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const newSku = generateSingleVariantSku(item.variantName, prev, idx, simpleSku);
        return { ...item, sku: newSku };
      })
    );
  };

  // রো ফিল্ড আপডেট
  const handleUpdateVariant = (
    index: number,
    field: keyof FormVariantItem,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  // রো ডিলিট
  const handleRemoveVariant = (index: number) => {
    const target = variants[index];
    if (target?.hasSalesHistory) {
      alert(
        `"${target.variantName}" ভ্যারিয়েন্টটির অতীতের বিক্রয় বা পারচেজ রেকর্ড রয়েছে। লেজার সামঞ্জস্য রক্ষার জন্য এটি স্থায়ীভাবে ডিলিট করা যাবে না।`
      );
      return;
    }
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  // বাল্ক রেট ও স্টক প্রয়োগ (Apply to All)
  const handleApplyBulk = () => {
    if (variants.length === 0) return;
    if (
      !bulkPurchase &&
      !bulkWholesale &&
      !bulkRetail &&
      !bulkStock
    ) {
      alert('বাল্ক বারে অন্তত একটি মান (দর বা স্টক) লিখুন!');
      return;
    }

    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        currentPurchasePrice: bulkPurchase ? bulkPurchase : v.currentPurchasePrice,
        wholesalePrice: bulkWholesale ? bulkWholesale : v.wholesalePrice,
        retailPrice: bulkRetail ? bulkRetail : v.retailPrice,
        stockQuantity: bulkStock ? bulkStock : v.stockQuantity,
      }))
    );
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-4 bg-surface-subtle/70 border-b border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep shadow-2xs">
            <Stack size={18} weight="bold" />
          </span>
          <h2 className="text-sm sm:text-base font-bold text-ink-primary flex items-center gap-2 flex-wrap">
            ভ্যারিয়েন্ট সাইজ ও স্টক ম্যাট্রিক্স
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-soft text-brand-deep border border-brand-light">
              {formatNumber(variants.length)}টি ভ্যারিয়েন্ট
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1 bg-surface-card border border-border-default rounded-lg p-0.5 text-xs">
            <span className="px-2 text-ink-secondary font-medium">একক:</span>
            {VARIANT_UNIT_PRESETS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => handleSelectDefaultUnit(u)}
                className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  defaultVariantUnit === u
                    ? 'bg-brand-deep text-white'
                    : 'text-ink-body hover:bg-brand-soft hover:text-brand-deep'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {variants.length > 0 && (
            <button
              type="button"
              onClick={handleGenerateMissingSkus}
              className="px-3 py-1.5 rounded-lg bg-brand-soft hover:bg-brand-light/60 text-brand-deep border border-brand-light text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="যেকোনো ফাঁকা ভ্যারিয়েন্টে অটো ৬-ডিজিট SKU বসান (পূর্বের SKU অক্ষত থাকবে)"
            >
              <Sparkle size={14} weight="bold" />
              <span>অটো SKU পূরণ</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleAddCustomVariant}
            className="px-3.5 py-1.5 rounded-lg bg-brand-deep hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus size={14} weight="bold" />
            <span>কাস্টম সাইজ যোগ</span>
          </button>
        </div>
      </div>

      {/* ১. কুইক প্রিসেট প্যানেল */}
      <div className="px-5 py-3 bg-brand-soft/40 border-b border-border-default flex items-center flex-wrap gap-1.5">
        <span className="text-xs font-bold text-ink-body mr-1 flex items-center gap-1 select-none">
          <Lightning size={13} weight="fill" className="text-wholesale-solid" />
          কুইক সাইজ প্রিসেট:
        </span>
        {COMMON_SIZE_PRESETS.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => handleAddPreset(size)}
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-surface-card hover:bg-brand-soft text-ink-body hover:text-brand-deep border border-border-default shadow-2xs transition-colors cursor-pointer"
          >
            + {size}
          </button>
        ))}
      </div>

      {/* ২. বাল্ক অ্যাপ্লিকেটর বার */}
      <div className="px-5 py-3 bg-surface-subtle/60 border-b border-border-default flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-bold text-ink-body flex items-center gap-1 select-none">
          <Coins size={14} weight="bold" className="text-success" />
          এক-ক্লিকে সবগুলোতে রেট ও স্টক সেট:
        </span>

        <div className="flex items-center gap-1.5 flex-wrap">
          <input
            type="number"
            step="any"
            placeholder="ক্রয়দর ৳"
            value={bulkPurchase}
            onChange={(e) => setBulkPurchase(e.target.value)}
            className="w-24 px-2.5 py-1.5 rounded-md border border-border-strong font-mono text-xs bg-surface-card text-ink-primary focus:border-brand-deep focus:outline-none"
          />
          <input
            type="number"
            step="any"
            placeholder="পাইকারি ৳"
            value={bulkWholesale}
            onChange={(e) => setBulkWholesale(e.target.value)}
            className="w-24 px-2.5 py-1.5 rounded-md border border-border-strong font-mono text-xs bg-surface-card text-ink-primary focus:border-brand-deep focus:outline-none"
          />
          <input
            type="number"
            step="any"
            placeholder="খুচরা ৳"
            value={bulkRetail}
            onChange={(e) => setBulkRetail(e.target.value)}
            className="w-24 px-2.5 py-1.5 rounded-md border border-border-strong font-mono text-xs bg-surface-card text-ink-primary focus:border-brand-deep focus:outline-none"
          />
          <input
            type="number"
            step="any"
            placeholder="স্টক পরিমাণ"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
            className="w-24 px-2.5 py-1.5 rounded-md border border-border-strong font-mono text-xs bg-surface-card text-ink-primary focus:border-brand-deep focus:outline-none"
          />
          <button
            type="button"
            onClick={handleApplyBulk}
            className="px-3.5 py-1.5 rounded-md bg-brand-deep hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            সবগুলোতে বসান
          </button>
        </div>
      </div>

      {/* ৩. ফুল-উইডথ ম্যাট্রিক্স টেবিল */}
      <div className="overflow-x-auto">
        {variants.length === 0 ? (
          <div className="py-12 text-center">
            <Stack size={36} weight="duotone" className="text-ink-muted mx-auto mb-2" />
            <h4 className="text-sm font-bold text-ink-primary">কোনো ভ্যারিয়েন্ট তৈরি করা হয়নি</h4>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs min-w-[820px]">
            <thead>
              <tr className="bg-surface-subtle/80 border-b border-border-default text-xs font-bold text-ink-secondary">
                <th className="py-2.5 px-3">ভ্যারিয়েন্ট সাইজ *</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">বারকোড</th>
                <th className="py-2.5 px-3 text-center">একক ও মোড</th>
                <th className="py-2.5 px-3">মজুত স্টক ও অ্যালার্ট</th>
                <th className="py-2.5 px-3">ক্রয়দর (৳) *</th>
                <th className="py-2.5 px-3">পাইকারি (৳) *</th>
                <th className="py-2.5 px-3">খুচরা (৳) *</th>
                <th className="py-2.5 px-3 text-center w-10">মুছুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {variants.map((v, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  {/* ১. সাইজের নাম */}
                  <td className="py-2.5 px-3 w-[150px]">
                    <input
                      type="text"
                      required
                      value={v.variantName}
                      onChange={(e) => handleUpdateVariant(idx, 'variantName', e.target.value)}
                      placeholder="সাইজ / ওজন"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold text-xs text-slate-900 bg-white"
                    />
                  </td>

                  {/* ২. SKU */}
                  <td className="py-2.5 px-3 w-[150px]">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                        placeholder="অটো / কাস্টম"
                        className="w-full pl-2 pr-7 py-1.5 rounded border border-border-strong focus:outline-none focus:ring-1 focus:ring-brand-deep font-mono text-xs text-ink-body bg-surface-card"
                      />
                      <button
                        type="button"
                        onClick={() => handleRegenerateRowSku(idx)}
                        className="absolute right-1.5 p-1 rounded text-ink-secondary hover:text-brand-deep hover:bg-brand-soft transition-colors cursor-pointer"
                        title="এই ভ্যারিয়েন্টের SKU রিজেনারেট করুন"
                      >
                        <ArrowsClockwise size={12} weight="bold" />
                      </button>
                    </div>
                  </td>

                  {/* ৩. বারকোড */}
                  <td className="py-2.5 px-3 w-[130px]">
                    <input
                      type="text"
                      value={v.barcode}
                      onChange={(e) => handleUpdateVariant(idx, 'barcode', e.target.value)}
                      placeholder="বারকোড"
                      className="w-full px-2 py-1.5 rounded border border-border-strong focus:outline-none focus:ring-1 focus:ring-brand-deep font-mono text-xs text-ink-body bg-surface-card"
                    />
                  </td>

                  {/* ৪. একক ও মোড */}
                  <td className="py-2.5 px-3 text-center w-[120px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="text"
                        value={v.baseUnitName}
                        onChange={(e) => handleUpdateVariant(idx, 'baseUnitName', e.target.value)}
                        className="w-16 px-1.5 py-1 rounded border border-border-strong text-center font-medium text-xs bg-surface-card text-ink-primary"
                        title="মূল একক"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateVariant(idx, 'allowDecimalQty', !v.allowDecimalQty)}
                        className={`px-2 py-1 rounded border text-xs font-bold cursor-pointer ${
                          v.allowDecimalQty
                            ? 'bg-brand-soft text-brand-deep border-brand-light'
                            : 'bg-wholesale-bg text-wholesale-text border-wholesale-border/60'
                        }`}
                        title={v.allowDecimalQty ? 'ওজনযোগ্য (ভগ্নাংশ সম্ভব)' : 'প্যাকেট (পূর্ণসংখ্যা)'}
                      >
                        {v.allowDecimalQty ? 'ওজন' : 'পিস'}
                      </button>
                    </div>
                  </td>

                  {/* ৫. মজুত স্টক ও অ্যালার্ট */}
                  <td className="py-2.5 px-3 w-[130px]">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step={v.allowDecimalQty ? 'any' : '1'}
                        value={v.stockQuantity}
                        onChange={(e) => handleUpdateVariant(idx, 'stockQuantity', e.target.value)}
                        placeholder="মজুত"
                        className="w-16 px-1.5 py-1.5 rounded border border-border-strong font-mono text-xs text-right bg-surface-card text-ink-primary font-bold"
                        title="বর্তমান মজুত"
                      />
                      <span className="text-ink-secondary font-mono">/</span>
                      <input
                        type="number"
                        step="1"
                        value={v.lowStockAlert}
                        onChange={(e) => handleUpdateVariant(idx, 'lowStockAlert', e.target.value)}
                        placeholder="অ্যালার্ট"
                        className="w-12 px-1.5 py-1.5 rounded border border-border-strong font-mono text-xs text-right bg-surface-card text-ink-secondary"
                        title="লো-স্টক অ্যালার্ট সীমা"
                      />
                    </div>
                  </td>

                  {/* ৬. ক্রয়দর */}
                  <td className="py-2.5 px-3 w-[90px]">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={v.currentPurchasePrice}
                      onChange={(e) => handleUpdateVariant(idx, 'currentPurchasePrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 font-mono text-xs text-right bg-white text-slate-900 font-bold"
                    />
                  </td>

                  {/* ৭. পাইকারি দর */}
                  <td className="py-2.5 px-3 w-[90px]">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={v.wholesalePrice}
                      onChange={(e) => handleUpdateVariant(idx, 'wholesalePrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 font-mono text-xs text-right bg-white text-slate-900 font-bold"
                    />
                  </td>

                  {/* ৮. খুচরা দর */}
                  <td className="py-2.5 px-3 w-[90px]">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={v.retailPrice}
                      onChange={(e) => handleUpdateVariant(idx, 'retailPrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 font-mono text-xs text-right bg-white text-slate-900 font-bold"
                    />
                  </td>

                  {/* ৯. অ্যাকশন (ডিলিট) */}
                  <td className="py-2.5 px-3 text-center w-10">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      disabled={Boolean(v.hasSalesHistory)}
                      className={`p-1.5 rounded transition-colors ${
                        v.hasSalesHistory
                          ? 'text-ink-muted cursor-not-allowed opacity-40'
                          : 'text-ink-secondary hover:text-due-text hover:bg-due-bg cursor-pointer'
                      }`}
                      title={
                        v.hasSalesHistory
                          ? 'এই ভ্যারিয়েন্টে বিক্রয় রেকর্ড আছে, মোছা যাবে না'
                          : 'ভ্যারিয়েন্ট মুছে ফেলুন'
                      }
                    >
                      <Trash size={14} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
