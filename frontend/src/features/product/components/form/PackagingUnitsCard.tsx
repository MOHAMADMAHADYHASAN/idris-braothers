'use client';

import React from 'react';
import { Package, Plus, Trash, Barcode } from '@phosphor-icons/react';

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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-purple-50 text-purple-600">
            <Package size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            ৩. কার্টন ও বাল্ক রূপান্তর ইউনিট (Packaging Units)
          </h2>
        </div>
        <button
          type="button"
          onClick={handleAddUnit}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus size={13} weight="bold" />
          <span>+ ইউনিট যোগ করুন</span>
        </button>
      </div>

      <div className="p-5 space-y-3">
        {units.length === 0 ? (
          <div className="py-6 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Package size={28} weight="duotone" className="text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-600">কোনো রূপান্তর ইউনিট যোগ করা হয়নি</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              কার্টন, বস্তা বা পেটিতে বিক্রি করতে চাইলে উপরের '+ ইউনিট যোগ করুন' বাটনে ক্লিক করুন।
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {units.map((unit, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2.5 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 font-mono">
                    ইউনিট #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUnit(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    title="ইউনিট মুছে ফেলুন"
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {/* ইউনিটের নাম */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ইউনিটের নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={unit.unitName}
                      onChange={(e) => handleUpdateUnit(idx, 'unitName', e.target.value)}
                      placeholder="উদাঃ কার্টন / বস্তা / পেটি"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs text-slate-900 font-medium"
                    />
                  </div>

                  {/* রূপান্তর ফ্যাক্টর */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      রূপান্তর ফ্যাক্টর <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="1"
                        required
                        value={unit.conversionFactor}
                        onChange={(e) => handleUpdateUnit(idx, 'conversionFactor', e.target.value)}
                        placeholder="উদাঃ ১২"
                        className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs text-slate-900 font-bold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-400 pointer-events-none">
                        {baseUnitName || 'একক'}
                      </span>
                    </div>
                  </div>

                  {/* পুরো ইউনিটের পাইকারি দর */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ইউনিটের পাইকারি দর (৳)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={unit.wholesalePrice}
                      onChange={(e) => handleUpdateUnit(idx, 'wholesalePrice', e.target.value)}
                      placeholder="উদাঃ ৫২০০"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs text-slate-900"
                    />
                  </div>

                  {/* পুরো ইউনিটের খুচরা দর */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ইউনিটের খুচরা দর (৳)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={unit.retailPrice}
                      onChange={(e) => handleUpdateUnit(idx, 'retailPrice', e.target.value)}
                      placeholder="উদাঃ ৫৪০০"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* ইউনিট বারকোড (ঐচ্ছিক) */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <Barcode size={13} weight="bold" className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={unit.barcode || ''}
                    onChange={(e) => handleUpdateUnit(idx, 'barcode', e.target.value)}
                    placeholder="কার্টন বারকোড (যদি কার্টনের গায়ে আলাদা বারকোড থাকে)..."
                    className="w-full px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono text-[11px] text-slate-700 bg-white"
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
