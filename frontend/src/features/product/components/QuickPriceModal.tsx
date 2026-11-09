'use client';

import React, { useState, useEffect } from 'react';
import { X, Coins, FloppyDisk } from '@phosphor-icons/react';
import { ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';

interface QuickPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
  productName: string;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center">
              <Coins size={18} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">বাজারদর ও বিক্রয়মূল্য পরিবর্তন</h3>
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

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              বর্তমান ক্রয়মূল্য / বাজারদর (Replacement Cost / {variant.baseUnitName})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-semibold">৳</span>
              <input
                type="number"
                step="0.01"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              মহাজন থেকে নতুন মাল কেনার রেট বা বর্তমান বাজারদর। স্টক ভ্যালুয়েশনে এটি ব্যবহৃত হবে।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                খুচরা বিক্রয়মূল্য (Retail / {variant.baseUnitName})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-semibold">৳</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                পাইকারি বিক্রয়মূল্য (Wholesale / {variant.baseUnitName})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-semibold">৳</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                />
              </div>
            </div>
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <FloppyDisk size={15} weight="bold" />
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'মূল্য সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
