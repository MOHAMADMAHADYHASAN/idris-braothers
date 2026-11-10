'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Package, Plus, Trash, Calculator } from '@phosphor-icons/react';
import { ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';
import { formatCurrency, formatNumber } from '@/lib/decimal';

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
      setError('রূপান্তর গুণক অবশ্যই ০ এর বেশি হতে হবে');
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
        className="bg-surface-card rounded-xl shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1)] border border-border-default max-w-lg w-full overflow-hidden"
      >
        <div className="px-4 py-3.5 border-b border-border-subtle flex items-center justify-between bg-surface-subtle/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center shrink-0">
              <Package size={17} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-primary leading-tight">পাইকারি ও কাস্টম ইউনিট রূপান্তর</h3>
              <p className="text-xs text-ink-secondary truncate max-w-[280px]">
                {productName} {variant.variantName !== 'Default' ? `(${variant.variantName})` : ''} · মূল একক: {variant.baseUnitName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 text-xs text-due-text bg-due-bg border border-due-border rounded-lg">
              {error}
            </div>
          )}

          {/* Existing Units */}
          <div>
            <h4 className="text-xs font-bold text-ink-body mb-2">বর্তমান সংযুক্ত ইউনিটসমূহ:</h4>
            {variant.units && variant.units.length > 0 ? (
              <div className="space-y-1.5">
                {variant.units.map((u) => (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-lg border border-border-default bg-surface-subtle/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-ink-primary flex items-center gap-2">
                        <span>{u.unitName}</span>
                        <span className="font-mono tabular-nums text-xs font-medium text-ink-secondary bg-surface-card px-2 py-0.5 rounded border border-border-default">
                          ১ {u.unitName} = {formatNumber(u.conversionFactor)} {variant.baseUnitName}
                        </span>
                      </div>
                      <div className="text-ink-secondary text-xs mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono tabular-nums">
                        {u.retailPrice && (
                          <span>
                            খুচরা: <strong className="text-ink-primary font-semibold">{formatCurrency(u.retailPrice)}</strong>
                          </span>
                        )}
                        {u.wholesalePrice && (
                          <span className="text-wholesale-text">
                            পাইকারি: <strong className="font-semibold">{formatCurrency(u.wholesalePrice)}</strong>
                          </span>
                        )}
                        {u.barcode && (
                          <span className="text-ink-secondary font-normal">
                            বারকোড: {u.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 text-ink-secondary hover:text-due-text hover:bg-due-bg rounded-md transition-colors active:scale-[0.96] cursor-pointer"
                      title="ইউনিট মুছে ফেলুন"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-secondary italic bg-surface-subtle p-3 rounded-lg border border-border-default">
                শুধুমাত্র মূল এককে ({variant.baseUnitName}) কেনাবেচা চলছে।
              </p>
            )}
          </div>

          {/* Add New Unit Form */}
          <form onSubmit={handleSubmit} className="border-t border-border-subtle pt-3.5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold text-ink-primary">নতুন ইউনিট যোগ করুন</h4>
              {factorNum > 0 && (
                <div className="text-xs font-mono tabular-nums text-ink-secondary flex items-center gap-1">
                  <Calculator size={13} className="text-brand-deep" />
                  অটো দর: খুচরা {formatCurrency(suggestedRetail, false)} | পাইকারি {formatCurrency(suggestedWholesale, false)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-ink-body mb-1">
                  ইউনিটের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="বস্তা / কার্টন"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-border-strong rounded-lg bg-surface-card text-ink-primary focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-body mb-1">
                  কত {variant.baseUnitName} এর সমান? *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  placeholder="৫০"
                  value={conversionFactor}
                  onChange={(e) => setConversionFactor(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono tabular-nums border border-border-strong rounded-lg bg-surface-card text-ink-primary focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-ink-body mb-1">
                  খুচরা দর
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={factorNum > 0 ? formatCurrency(suggestedRetail, false) : 'স্বয়ংক্রিয়'}
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono tabular-nums border border-border-strong rounded-lg bg-surface-card text-ink-primary focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-body mb-1">
                  পাইকারি দর
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={factorNum > 0 ? formatCurrency(suggestedWholesale, false) : 'স্বয়ংক্রিয়'}
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono tabular-nums border border-border-strong rounded-lg bg-surface-card text-ink-primary focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-body mb-1">
                  কার্টন বারকোড
                </label>
                <input
                  type="text"
                  placeholder="বারকোড স্ক্যান"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono tabular-nums border border-border-strong rounded-lg bg-surface-card text-ink-primary focus:outline-hidden focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end border-t border-border-subtle">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-deep hover:bg-brand-hover rounded-lg shadow-[0_1px_2px_rgba(30,74,122,0.16)] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
