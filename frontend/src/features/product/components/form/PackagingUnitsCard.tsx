'use client';

import React from 'react';
import { Package, Plus, Trash, Barcode } from '@phosphor-icons/react';
import { formatNumber } from '@/lib/decimal';

export interface FormUnitItem {
  id?: string;
  unitName: string;
  conversionFactor: string;
  wholesalePrice: string;
  retailPrice: string;
  barcode?: string;
}

interface PackagingUnitsCardProps {
  units: FormUnitItem[];
  setUnits: React.Dispatch<React.SetStateAction<FormUnitItem[]>>;
  baseUnitName: string;
}

export function PackagingUnitsCard({
  units,
  setUnits,
  baseUnitName,
}: PackagingUnitsCardProps) {
  const handleAddUnit = () => {
    setUnits((prev) => [
      ...prev,
      {
        unitName: '',
        conversionFactor: '',
        wholesalePrice: '',
        retailPrice: '',
        barcode: '',
      },
    ]);
  };

  const handleRemoveUnit = (index: number) => {
    setUnits((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateUnit = (index: number, field: keyof FormUnitItem, value: string) => {
    setUnits((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-wholesale-bg text-wholesale-text">
            <Package size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-ink-primary">
            ৩. কার্টন ও বাল্ক রূপান্তর ইউনিট
          </h2>
        </div>
        <button
          type="button"
          onClick={handleAddUnit}
          className="text-xs font-semibold text-brand-deep hover:text-brand-hover flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus size={14} weight="bold" />
          <span>ইউনিট যোগ করুন</span>
        </button>
      </div>

      <div className="p-5 space-y-3">
        {units.length === 0 ? (
          <div className="py-6 px-4 text-center border-2 border-dashed border-border-default rounded-xl bg-surface-subtle/50">
            <Package size={28} weight="duotone" className="text-ink-secondary mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-ink-body">কোনো রূপান্তর ইউনিট যোগ করা হয়নি</p>
          </div>
        ) : (
          <div className="space-y-3">
            {units.map((unit, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border-default bg-surface-subtle/40 space-y-2.5 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-body font-mono">
                    ইউনিট #{formatNumber(idx + 1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUnit(idx)}
                    className="p-1 text-ink-secondary hover:text-due-text hover:bg-due-bg rounded transition-colors cursor-pointer"
                    title="ইউনিট মুছে ফেলুন"
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-ink-secondary mb-1">
                      ইউনিটের নাম <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={unit.unitName}
                      onChange={(e) => handleUpdateUnit(idx, 'unitName', e.target.value)}
                      placeholder="কার্টন / বস্তা"
                      className="w-full px-2.5 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs text-ink-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-secondary mb-1">
                      রূপান্তর ফ্যাক্টর <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="1"
                        required
                        value={unit.conversionFactor}
                        onChange={(e) => handleUpdateUnit(idx, 'conversionFactor', e.target.value)}
                        placeholder="১২"
                        className="w-full pl-2.5 pr-10 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs text-ink-primary font-bold"
                      />
                      <span className="absolute right-2 top-2 text-xs text-ink-secondary pointer-events-none">
                        {baseUnitName || 'একক'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-secondary mb-1">
                      ইউনিটের পাইকারি দর (৳)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={unit.wholesalePrice}
                      onChange={(e) => handleUpdateUnit(idx, 'wholesalePrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2.5 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs text-ink-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-secondary mb-1">
                      ইউনিটের খুচরা দর (৳)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={unit.retailPrice}
                      onChange={(e) => handleUpdateUnit(idx, 'retailPrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2.5 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs text-ink-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1.5 border-t border-border-subtle">
                  <Barcode size={14} weight="bold" className="text-ink-secondary shrink-0" />
                  <input
                    type="text"
                    value={unit.barcode || ''}
                    onChange={(e) => handleUpdateUnit(idx, 'barcode', e.target.value)}
                    placeholder="কার্টন বারকোড (ঐচ্ছিক)"
                    className="w-full px-2.5 py-1.5 rounded-md border border-border-strong focus:outline-none focus:ring-1 focus:ring-brand-deep font-mono text-xs text-ink-body bg-surface-card"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
