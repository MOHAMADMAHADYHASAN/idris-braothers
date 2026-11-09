'use client';

import React, { useState } from 'react';
import { X, WarningCircle, ArrowDown } from '@phosphor-icons/react';
import { ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';

interface RecordWastageModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
  productName: string;
}

export function RecordWastageModal({ isOpen, onClose, variant, productName }: RecordWastageModalProps) {
  const { recordWastage, isSaving } = useProductStore();
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('শুকিয়ে ওজন হ্রাস (Shrinkage)');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !variant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('ঘাটতির পরিমাণ অবশ্যই ০ এর বেশি হতে হবে');
      return;
    }
    if (qty > variant.stockQuantity) {
      setError(`ঘাটতির পরিমাণ বর্তমান স্টকের (${variant.stockQuantity} ${variant.baseUnitName}) চেয়ে বেশি হতে পারে না`);
      return;
    }

    try {
      await recordWastage(variant.id, {
        quantity: qty,
        reason,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'অপচয় রেকর্ড করতে ব্যর্থ হয়েছে');
    }
  };

  const parsedQty = parseFloat(quantity) || 0;
  const estimatedLoss = parsedQty * variant.currentPurchasePrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center">
              <WarningCircle size={18} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">স্টক অপচয় ও ঘাটতি এন্ট্রি (Shrinkage)</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                {productName} {variant.variantName !== 'Default' ? `(${variant.variantName})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">বর্তমান মোট স্টক:</span>
            <span className="font-semibold text-slate-800">
              {variant.stockQuantity} {variant.baseUnitName}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ঘাটতি / নষ্টের পরিমাণ ({variant.baseUnitName}) *
            </label>
            <input
              type="number"
              step={variant.allowDecimalQty ? '0.0001' : '1'}
              required
              placeholder={variant.allowDecimalQty ? 'e.g. 0.250' : 'e.g. 2'}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 font-mono"
            />
            {parsedQty > 0 && (
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                <ArrowDown size={12} className="text-rose-500" />
                আর্থিক ক্ষতি: ৳{estimatedLoss.toFixed(2)} (ক্রয়মূল্য: ৳{variant.currentPurchasePrice}/{variant.baseUnitName})
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ঘাটতির কারণ *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-white"
            >
              <option value="শুকিয়ে ওজন হ্রাস (Shrinkage)">শুকিয়ে ওজন হ্রাস (Shrinkage / গরমের প্রভাব)</option>
              <option value="প্যাকেট ফেটে নষ্ট হওয়া">প্যাকেট ফেটে / গলে নষ্ট হওয়া</option>
              <option value="ইঁদুরে খাওয়া বা পড়ে যাওয়া">ইঁদুরে খাওয়া বা পড়ে যাওয়া</option>
              <option value="মেয়াদোত্তীর্ণ / ড্যামেজ">মেয়াদোত্তীর্ণ বা ড্যামেজ মাল</option>
              <option value="অন্যান্য কারণ">অন্যান্য কারণ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              মন্তব্য (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="অতিরিক্ত কোনো তথ্য"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'ঘাটতি রেকর্ড ও স্টক কমান'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
