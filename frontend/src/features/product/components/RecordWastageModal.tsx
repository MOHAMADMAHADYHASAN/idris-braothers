'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  const remainingStock = Math.max(0, variant.stockQuantity - parsedQty);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white rounded-lg shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] border border-slate-200/90 max-w-md w-full overflow-hidden"
      >
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
              <WarningCircle size={17} weight="bold" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900 leading-tight">স্টক অপচয় ও ঘাটতি এন্ট্রি (Shrinkage)</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                {productName} {variant.variantName !== 'Default' ? `(${variant.variantName})` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-[background-color,color] duration-150"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-slate-50/70 p-3 rounded-md border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">বর্তমান মোট স্টক:</span>
            <span className="font-mono tabular-nums tracking-tight font-semibold text-slate-900">
              {variant.stockQuantity.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}{' '}
              <span className="text-slate-500 font-normal">{variant.baseUnitName}</span>
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
              className="w-full px-3 py-1.5 text-xs font-mono tabular-nums tracking-tight font-semibold text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
            />
            {parsedQty > 0 && (
              <div className="mt-2 p-2 rounded-md bg-rose-50/80 border border-rose-200/60 flex items-center justify-between text-[11px] font-mono tabular-nums tracking-tight text-rose-800">
                <span className="inline-flex items-center gap-1">
                  <ArrowDown size={12} className="text-rose-600 font-bold" />
                  আর্থিক ক্ষতি: <strong>৳{estimatedLoss.toFixed(2)}</strong>
                </span>
                <span className="text-slate-600 font-normal">
                  অবশিষ্ট থাকবে: <strong>{remainingStock.toFixed(2)} {variant.baseUnitName}</strong>
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ঘাটতির কারণ *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
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
              placeholder="অতিরিক্ত কোনো তথ্য বা চালান রেফারেন্স"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-[background-color,color] duration-150 active:scale-[0.98]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-[0_1px_2px_rgba(225,29,72,0.12)] transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'ঘাটতি রেকর্ড ও স্টক কমান'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
