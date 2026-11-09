'use client';

import React, { useState } from 'react';
import { X, Package, Plus, Trash } from '@phosphor-icons/react';
import { ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
  productName: string;
}

export function AddUnitModal({ isOpen, onClose, variant, productName }: AddUnitModalProps) {
  const { addCustomUnit, deleteCustomUnit, isSaving } = useProductStore();
  const [unitName, setUnitName] = useState<string>('');
  const [conversionFactor, setConversionFactor] = useState<string>('');
  const [retailPrice, setRetailPrice] = useState<string>('');
  const [wholesalePrice, setWholesalePrice] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !variant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const factor = parseFloat(conversionFactor);
    if (!unitName.trim()) {
      setError('ইউনিটের নাম লিখুন (যেমন: ৫০ কেজি বস্তা বা কার্টন)');
      return;
    }
    if (isNaN(factor) || factor <= 0) {
      setError('রূপান্তর গুণক (Conversion Factor) অবশ্যই ০ এর বেশি হতে হবে');
      return;
    }

    try {
      await addCustomUnit(variant.id, {
        unitName: unitName.trim(),
        conversionFactor: factor,
        retailPrice: retailPrice ? parseFloat(retailPrice) : undefined,
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : undefined,
        barcode: barcode.trim() || undefined,
      });
      setUnitName('');
      setConversionFactor('');
      setRetailPrice('');
      setWholesalePrice('');
      setBarcode('');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'নতুন ইউনিট যোগ করতে ব্যর্থ হয়েছে');
    }
  };

  const handleDelete = async (unitId: string) => {
    if (confirm('আপনি কি এই ইউনিটটি মুছে ফেলতে চান?')) {
      try {
        await deleteCustomUnit(unitId);
      } catch (err: any) {
        setError(err.message || 'ইউনিট মুছতে ব্যর্থ হয়েছে');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center">
              <Package size={18} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">পাইকারি ও কাস্টম ইউনিট রূপান্তর</h3>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">
                {productName} {variant.variantName !== 'Default' ? `(${variant.variantName})` : ''} | বেস ইউনিট: {variant.baseUnitName}
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

        <div className="p-5 space-y-5">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Existing Units */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-2">বর্তমান সংযুক্ত ইউনিটসমূহ:</h4>
            {variant.units && variant.units.length > 0 ? (
              <div className="space-y-2">
                {variant.units.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {u.unitName}
                        <span className="ml-2 font-normal text-slate-500">
                          (১ {u.unitName} = {u.conversionFactor} {variant.baseUnitName})
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5 flex gap-3">
                        {u.retailPrice && <span>খুচরা: ৳{u.retailPrice}</span>}
                        {u.wholesalePrice && <span>পাইকারি: ৳{u.wholesalePrice}</span>}
                        {u.barcode && <span>বারকোড: {u.barcode}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="ইউনিট মুছে ফেলুন"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                শুধুমাত্র মূল এককে ({variant.baseUnitName}) কেনাবেচা চলছে। নিচে নতুন বস্তা বা কার্টন ইউনিট যোগ করুন।
              </p>
            )}
          </div>

          {/* Add New Unit Form */}
          <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-800">নতুন ইউনিট যোগ করুন:</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ইউনিটের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ৫০ কেজি বস্তা বা কার্টন"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  কত {variant.baseUnitName} এর সমান? (Factor) *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  placeholder="e.g. 50 বা 24"
                  value={conversionFactor}
                  onChange={(e) => setConversionFactor(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  খুচরা দর (ঐচ্ছিক)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="খালি রাখলে স্বয়ংক্রিয়"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  পাইকারি দর (ঐচ্ছিক)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="খালি রাখলে স্বয়ংক্রিয়"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  কার্টন বারকোড (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="কার্টনের নিজস্ব কোড"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                <Plus size={14} weight="bold" />
                {isSaving ? 'যুক্ত হচ্ছে...' : 'ইউনিট যুক্ত করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
