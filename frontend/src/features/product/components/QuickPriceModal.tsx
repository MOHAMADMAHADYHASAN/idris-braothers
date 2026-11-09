'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, FloppyDisk, ArrowRight, Percent } from '@phosphor-icons/react';
import { ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';

interface QuickPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
  productName: string;
}

function MarginBadge({ costStr, sellStr, label }: { costStr: string; sellStr: string; label: string }) {
  const cost = parseFloat(costStr);
  const sell = parseFloat(sellStr);
  if (isNaN(cost) || isNaN(sell) || cost <= 0 || sell <= 0) return null;

  const profit = sell - cost;
  const marginPct = (profit / sell) * 100;
  const isLoss = profit < 0;

  return (
    <div
      className={`text-[11px] font-medium px-2 py-0.5 rounded-md mt-1.5 inline-flex items-center gap-1.5 border transition-colors ${
        isLoss
          ? 'bg-rose-50 text-rose-700 border-rose-200/80'
          : profit === 0
          ? 'bg-amber-50 text-amber-700 border-amber-200/80'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
      }`}
    >
      <span className="text-slate-500">{label}:</span>
      <span className="font-mono tabular-nums tracking-tight font-semibold">
        {profit >= 0 ? '+' : ''}৳{profit.toFixed(2)}
      </span>
      <span className="font-mono tabular-nums tracking-tight text-[10px] opacity-80">
        ({marginPct.toFixed(1)}%)
      </span>
    </div>
  );
}

export function QuickPriceModal({ isOpen, onClose, variant, productName }: QuickPriceModalProps) {
  const { updatePrices, isSaving } = useProductStore();
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [retailPrice, setRetailPrice] = useState<string>('');
  const [wholesalePrice, setWholesalePrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (variant) {
      setPurchasePrice(variant.currentPurchasePrice.toString());
      setRetailPrice(variant.retailPrice.toString());
      setWholesalePrice(variant.wholesalePrice.toString());
      setError(null);
    }
  }, [variant]);

  if (!isOpen || !variant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pPrice = parseFloat(purchasePrice);
    const rPrice = parseFloat(retailPrice);
    const wPrice = parseFloat(wholesalePrice);

    if (isNaN(pPrice) || pPrice <= 0 || isNaN(rPrice) || rPrice <= 0 || isNaN(wPrice) || wPrice <= 0) {
      setError('সকল মূল্য অবশ্যই ০ এর বেশি হতে হবে');
      return;
    }

    try {
      await updatePrices(variant.id, {
        currentPurchasePrice: pPrice,
        retailPrice: rPrice,
        wholesalePrice: wPrice,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'মূল্য আপডেট করতে ব্যর্থ হয়েছে');
    }
  };

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
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <Coins size={17} weight="bold" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900 leading-tight">বাজারদর ও বিক্রয়মূল্য পরিবর্তন</h3>
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

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              বর্তমান ক্রয়মূল্য / বাজারদর (Replacement Cost / {variant.baseUnitName}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-xs font-semibold">৳</span>
              <input
                type="number"
                step="0.01"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs font-mono tabular-nums tracking-tight font-semibold text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              মহাজন থেকে নতুন মাল কেনার রেট বা বর্তমান বাজারদর। স্টক ভ্যালুয়েশনে এটি ব্যবহৃত হবে।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                খুচরা বিক্রয়মূল্য (Retail / {variant.baseUnitName}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-xs font-semibold">৳</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs font-mono tabular-nums tracking-tight font-semibold text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                />
              </div>
              <MarginBadge costStr={purchasePrice} sellStr={retailPrice} label="খুচরা মার্জিন" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                পাইকারি বিক্রয়মূল্য (Wholesale / {variant.baseUnitName}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-xs font-semibold">৳</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs font-mono tabular-nums tracking-tight font-semibold text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                />
              </div>
              <MarginBadge costStr={purchasePrice} sellStr={wholesalePrice} label="পাইকারি মার্জিন" />
            </div>
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50"
            >
              <FloppyDisk size={14} weight="bold" />
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'মূল্য সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
