'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Package, Plus, Trash, Calculator } from '@phosphor-icons/react';
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

  const factorNum = parseFloat(conversionFactor) || 0;
  const suggestedRetail = factorNum > 0 ? factorNum * variant.retailPrice : 0;
  const suggestedWholesale = factorNum > 0 ? factorNum * variant.wholesalePrice : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white rounded-lg shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] border border-slate-200/90 max-w-lg w-full overflow-hidden"
      >
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <Package size={17} weight="bold" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900 leading-tight">পাইকারি ও কাস্টম ইউনিট রূপান্তর</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                {productName} {variant.variantName !== 'Default' ? `(${variant.variantName})` : ''} · বেস: {variant.baseUnitName}
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

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-md">
              {error}
            </div>
          )}

          {/* Existing Units */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-2">বর্তমান সংযুক্ত ইউনিটসমূহ:</h4>
            {variant.units && variant.units.length > 0 ? (
              <div className="space-y-1.5">
                {variant.units.map((u) => (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-md border border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{u.unitName}</span>
                        <span className="font-mono tabular-nums tracking-tight text-[11px] font-normal text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200/60">
                          ১ {u.unitName} = {u.conversionFactor} {variant.baseUnitName}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono tabular-nums tracking-tight">
                        {u.retailPrice && (
                          <span>
                            খুচরা: <strong className="text-slate-700 font-semibold">৳{u.retailPrice.toFixed(2)}</strong>
                          </span>
                        )}
                        {u.wholesalePrice && (
                          <span>
                            পাইকারি: <strong className="text-slate-700 font-semibold">৳{u.wholesalePrice.toFixed(2)}</strong>
                          </span>
                        )}
                        {u.barcode && (
                          <span className="text-slate-400 font-normal">
                            বারকোড: {u.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-[background-color,color] duration-150 active:scale-[0.96]"
                      title="ইউনিট মুছে ফেলুন"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50/70 p-3 rounded-md border border-slate-200/70">
                শুধুমাত্র মূল এককে ({variant.baseUnitName}) কেনাবেচা চলছে। নিচে নতুন বস্তা বা কার্টন ইউনিট যোগ করুন।
              </p>
            )}
          </div>

          {/* Add New Unit Form */}
          <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-900">নতুন ইউনিট যোগ করুন</h4>
              {factorNum > 0 && (
                <div className="text-[11px] font-mono tabular-nums tracking-tight text-slate-500 flex items-center gap-1">
                  <Calculator size={13} className="text-slate-400" />
                  অটো রেট: খুচরা ৳{suggestedRetail.toFixed(0)} | পাইকারি ৳{suggestedWholesale.toFixed(0)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
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
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
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
                  className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  খুচরা দর (ঐচ্ছিক)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={factorNum > 0 ? `৳${suggestedRetail.toFixed(0)}` : 'স্বয়ংক্রিয়'}
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  পাইকারি দর (ঐচ্ছিক)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={factorNum > 0 ? `৳${suggestedWholesale.toFixed(0)}` : 'স্বয়ংক্রিয়'}
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  কার্টন বারকোড (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="বারকোড স্ক্যান"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50"
              >
                <Plus size={14} weight="bold" />
                {isSaving ? 'যুক্ত হচ্ছে...' : 'ইউনিট যুক্ত করুন'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
