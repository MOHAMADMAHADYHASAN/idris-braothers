'use client';

import React, { useState } from 'react';
import {
  Stack,
  Plus,
  Trash,
  Lightning,
  Package,
  Barcode,
  Scales,
  Coins,
  Warehouse,
  X,
} from '@phosphor-icons/react';
import { FormUnitItem } from './PackagingUnitsCard';

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
  productName: string;
}

const COMMON_SIZE_PRESETS = [
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

export function VariantsStockMatrixCard({
  variants,
  setVariants,
  defaultBaseUnit,
  productName,
}: VariantsStockMatrixCardProps) {
  // বাল্ক অ্যাপ্লিকেটর স্টেট
  const [bulkPurchase, setBulkPurchase] = useState('');
  const [bulkWholesale, setBulkWholesale] = useState('');
  const [bulkRetail, setBulkRetail] = useState('');
  const [bulkStock, setBulkStock] = useState('');
  const [bulkAlert, setBulkAlert] = useState('');

  // ভ্যারিয়েন্ট ইউনিট মোডাল স্টেট
  const [activeVariantForUnits, setActiveVariantForUnits] = useState<number | null>(null);

  // কুইক প্রিসেট দিয়ে নতুন ভ্যারিয়েন্ট যোগ
  const handleAddPreset = (sizeName: string) => {
    // ডুপ্লিকেট নাম রোধ
    if (variants.some((v) => v.variantName.toLowerCase() === sizeName.toLowerCase())) {
      alert(`"${sizeName}" ভ্যারিয়েন্টটি ইতিমধ্যে তালিকায় আছে!`);
      return;
    }

    setVariants((prev) => [
      ...prev,
      {
        variantName: sizeName,
        sku: '',
        barcode: '',
        baseUnitName: defaultBaseUnit || 'কেজি',
        allowDecimalQty: true,
        currentPurchasePrice: bulkPurchase || '',
        wholesalePrice: bulkWholesale || '',
        retailPrice: bulkRetail || '',
        stockQuantity: bulkStock || '0',
        lowStockAlert: bulkAlert || '10',
        units: [],
      },
    ]);
  };

  // কাস্টম ব্ল্যাংক ভ্যারিয়েন্ট রো যোগ
  const handleAddCustomVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        variantName: '',
        sku: '',
        barcode: '',
        baseUnitName: defaultBaseUnit || 'কেজি',
        allowDecimalQty: true,
        currentPurchasePrice: bulkPurchase || '',
        wholesalePrice: bulkWholesale || '',
        retailPrice: bulkRetail || '',
        stockQuantity: bulkStock || '0',
        lowStockAlert: bulkAlert || '10',
        units: [],
      },
    ]);
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
      !bulkStock &&
      !bulkAlert
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
        lowStockAlert: bulkAlert ? bulkAlert : v.lowStockAlert,
      }))
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-4 bg-slate-50/90 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shadow-2xs">
            <Stack size={18} weight="bold" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              ভ্যারিয়েন্ট সাইজ ও স্টক ম্যাট্রিক্স (Inventory Matrix)
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                {variants.length}টি ভ্যারিয়েন্ট
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              প্রতিটি সাইজ বা ওজনের আলাদা SKU, বারকোড, স্টক, কার্টন রূপান্তর ও ৩ ধরনের দর নির্ধারণ করুন।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddCustomVariant}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus size={14} weight="bold" />
          <span>+ কাস্টম সাইজ যোগ</span>
        </button>
      </div>

      {/* ১. কুইক প্রিসেট প্যানেল */}
      <div className="px-5 py-3 bg-indigo-50/30 border-b border-slate-200/70 flex items-center flex-wrap gap-1.5">
        <span className="text-[11px] font-bold text-slate-600 mr-1 flex items-center gap-1 select-none">
          <Lightning size={13} weight="fill" className="text-amber-500" />
          কুইক সাইজ প্রিসেট:
        </span>
        {COMMON_SIZE_PRESETS.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => handleAddPreset(size)}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
          >
            + {size}
          </button>
        ))}
      </div>

      {/* ২. বাল্ক অ্যাপ্লিকেটর বার (Apply to All Bar) */}
      <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-200/70 flex flex-wrap items-center gap-2.5">
        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 select-none">
          <Coins size={13} weight="bold" className="text-emerald-600" />
          এক-ক্লিকে বাল্ক রেট ও স্টক সেট:
        </span>

        <div className="flex items-center gap-1.5 flex-wrap">
          <input
            type="number"
            step="any"
            placeholder="ক্রয়দর ৳"
            value={bulkPurchase}
            onChange={(e) => setBulkPurchase(e.target.value)}
            className="w-24 px-2 py-1 rounded border border-slate-300 font-mono text-xs bg-white text-slate-800"
          />
          <input
            type="number"
            step="any"
            placeholder="পাইকারি ৳"
            value={bulkWholesale}
            onChange={(e) => setBulkWholesale(e.target.value)}
            className="w-24 px-2 py-1 rounded border border-slate-300 font-mono text-xs bg-white text-slate-800"
          />
          <input
            type="number"
            step="any"
            placeholder="খুচরা ৳"
            value={bulkRetail}
            onChange={(e) => setBulkRetail(e.target.value)}
            className="w-24 px-2 py-1 rounded border border-slate-300 font-mono text-xs bg-white text-slate-800"
          />
          <input
            type="number"
            step="any"
            placeholder="স্টক পরিমাণ"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
            className="w-24 px-2 py-1 rounded border border-slate-300 font-mono text-xs bg-white text-slate-800"
          />
          <button
            type="button"
            onClick={handleApplyBulk}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Apply to All
          </button>
        </div>
      </div>

      {/* ৩. ফুল-উইডথ ম্যাট্রিক্স টেবিল */}
      <div className="overflow-x-auto">
        {variants.length === 0 ? (
          <div className="py-12 text-center">
            <Stack size={36} weight="duotone" className="text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">কোনো ভ্যারিয়েন্ট তৈরি করা হয়নি</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              উপরের কুইক প্রিসেট বাটন অথবা '+ কাস্টম সাইজ যোগ' বাটনে ক্লিক করে ভ্যারিয়েন্ট যোগ করুন।
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">ভ্যারিয়েন্ট সাইজ *</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">বারকোড</th>
                <th className="py-2.5 px-3 text-center">একক ও মোড</th>
                <th className="py-2.5 px-3">মজুত স্টক ও অ্যালার্ট</th>
                <th className="py-2.5 px-3">ক্রয়দর (৳) *</th>
                <th className="py-2.5 px-3">পাইকারি (৳) *</th>
                <th className="py-2.5 px-3">খুচরা (৳) *</th>
                <th className="py-2.5 px-3 text-center">কার্টন ইউনিট</th>
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
                      placeholder="উদাঃ ১ লিটার / ৫০০ গ্রাম"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold text-xs text-slate-900 bg-white"
                    />
                  </td>

                  {/* ২. SKU */}
                  <td className="py-2.5 px-3 w-[130px]">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                      placeholder="SKU"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono text-[11px] text-slate-800 bg-white"
                    />
                  </td>

                  {/* ৩. বারকোড */}
                  <td className="py-2.5 px-3 w-[130px]">
                    <input
                      type="text"
                      value={v.barcode}
                      onChange={(e) => handleUpdateVariant(idx, 'barcode', e.target.value)}
                      placeholder="বারকোড"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono text-[11px] text-slate-800 bg-white"
                    />
                  </td>

                  {/* ৪. একক ও মোড */}
                  <td className="py-2.5 px-3 text-center w-[120px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="text"
                        value={v.baseUnitName}
                        onChange={(e) => handleUpdateVariant(idx, 'baseUnitName', e.target.value)}
                        className="w-14 px-1.5 py-1 rounded border border-slate-300 text-center font-medium text-xs bg-white text-slate-800"
                        title="মূল একক"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateVariant(idx, 'allowDecimalQty', !v.allowDecimalQty)}
                        className={`p-1 rounded border text-[10px] font-bold cursor-pointer ${
                          v.allowDecimalQty
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
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
                        className="w-16 px-1.5 py-1.5 rounded border border-slate-300 font-mono text-xs text-right bg-white text-slate-900 font-bold"
                        title="বর্তমান মজুত"
                      />
                      <span className="text-slate-400 font-mono">/</span>
                      <input
                        type="number"
                        step="1"
                        value={v.lowStockAlert}
                        onChange={(e) => handleUpdateVariant(idx, 'lowStockAlert', e.target.value)}
                        placeholder="অ্যালার্ট"
                        className="w-12 px-1.5 py-1.5 rounded border border-slate-300 font-mono text-[11px] text-right bg-white text-slate-600"
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

                  {/* ৯. কার্টন ইউনিট বাটন */}
                  <td className="py-2.5 px-3 text-center w-[100px]">
                    <button
                      type="button"
                      onClick={() => setActiveVariantForUnits(idx)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border flex items-center justify-center gap-1 mx-auto cursor-pointer transition-colors ${
                        v.units && v.units.length > 0
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Package size={12} weight="bold" />
                      <span>{v.units?.length ? `${v.units.length}টি ইউনিট` : '+ কার্টন'}</span>
                    </button>
                  </td>

                  {/* ১০. অ্যাকশন (ডিলিট) */}
                  <td className="py-2.5 px-3 text-center w-10">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      disabled={Boolean(v.hasSalesHistory)}
                      className={`p-1.5 rounded transition-colors ${
                        v.hasSalesHistory
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
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

      {/* ভ্যারিয়েন্ট কার্টন ইউনিট এডিটর পপআপ */}
      {activeVariantForUnits !== null && variants[activeVariantForUnits] && (
        <VariantUnitsModal
          variantName={variants[activeVariantForUnits].variantName || `ভ্যারিয়েন্ট #${activeVariantForUnits + 1}`}
          baseUnitName={variants[activeVariantForUnits].baseUnitName}
          units={variants[activeVariantForUnits].units || []}
          onSave={(newUnits) => {
            handleUpdateVariant(activeVariantForUnits, 'units', newUnits);
            setActiveVariantForUnits(null);
          }}
          onClose={() => setActiveVariantForUnits(null)}
        />
      )}
    </div>
  );
}

// সাব-কম্পোনেন্ট: ভ্যারিয়েন্ট স্পেসিফিক কার্টন ইউনিট মোডাল
function VariantUnitsModal({
  variantName,
  baseUnitName,
  units,
  onSave,
  onClose,
}: {
  variantName: string;
  baseUnitName: string;
  units: FormUnitItem[];
  onSave: (units: FormUnitItem[]) => void;
  onClose: () => void;
}) {
  const [localUnits, setLocalUnits] = useState<FormUnitItem[]>(units);

  const handleAdd = () => {
    setLocalUnits((prev) => [
      ...prev,
      { unitName: '', conversionFactor: '', wholesalePrice: '', retailPrice: '', barcode: '' },
    ]);
  };

  const handleUpdate = (idx: number, field: keyof FormUnitItem, val: string) => {
    setLocalUnits((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleRemove = (idx: number) => {
    setLocalUnits((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              কার্টন রূপান্তর ইউনিট: {variantName}
            </h3>
            <p className="text-[11px] text-slate-500">
              ১ কার্টনে কয়টি {baseUnitName || 'একক'} থাকে এবং পুরো কার্টনের পাইকারি/খুচরা দর
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-700">ইউনিট তালিকা</span>
            <button
              type="button"
              onClick={handleAdd}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} weight="bold" />
              <span>+ নতুন ইউনিট</span>
            </button>
          </div>

          {localUnits.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
              কোনো কার্টন ইউনিট নেই।
            </div>
          ) : (
            localUnits.map((u, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-700">ইউনিট #{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="text-slate-400 hover:text-rose-600 p-0.5"
                  >
                    <Trash size={13} weight="bold" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="নাম (উদাঃ কার্টন)"
                    value={u.unitName}
                    onChange={(e) => handleUpdate(i, 'unitName', e.target.value)}
                    className="px-2 py-1 rounded border border-slate-300 text-xs bg-white text-slate-800"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder={`রূপান্তর (উদাঃ ১২ ${baseUnitName})`}
                    value={u.conversionFactor}
                    onChange={(e) => handleUpdate(i, 'conversionFactor', e.target.value)}
                    className="px-2 py-1 rounded border border-slate-300 text-xs font-mono bg-white text-slate-800"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="পাইকারি দর ৳"
                    value={u.wholesalePrice}
                    onChange={(e) => handleUpdate(i, 'wholesalePrice', e.target.value)}
                    className="px-2 py-1 rounded border border-slate-300 text-xs font-mono bg-white text-slate-800"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="খুচরা দর ৳"
                    value={u.retailPrice}
                    onChange={(e) => handleUpdate(i, 'retailPrice', e.target.value)}
                    className="px-2 py-1 rounded border border-slate-300 text-xs font-mono bg-white text-slate-800"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={() => onSave(localUnits)}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            সম্পন্ন
          </button>
        </div>
      </div>
    </div>
  );
}
