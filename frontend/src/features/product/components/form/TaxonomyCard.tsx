'use client';

import React, { useState } from 'react';
import { Folders, Plus } from '@phosphor-icons/react';
import { Category, Brand } from '../../product.types';
import { InlineTaxonomyModal } from './InlineTaxonomyModal';

interface TaxonomyCardProps {
  categoryId: string;
  setCategoryId: (v: string) => void;
  brandId: string;
  setBrandId: (v: string) => void;
  categories: Category[];
  brands: Brand[];
  onCreateCategory: (dto: { name: string; banglaName?: string }) => Promise<Category>;
  onCreateBrand: (dto: { name: string; banglaName?: string }) => Promise<Brand>;
}

export function TaxonomyCard({
  categoryId,
  setCategoryId,
  brandId,
  setBrandId,
  categories,
  brands,
  onCreateCategory,
  onCreateBrand,
}: TaxonomyCardProps) {
  const [modalType, setModalType] = useState<'category' | 'brand' | null>(null);

  const handleCreateTaxonomy = async (data: { name: string; banglaName?: string }) => {
    if (modalType === 'category') {
      const newCat = await onCreateCategory(data);
      setCategoryId(newCat.id);
    } else if (modalType === 'brand') {
      const newBrand = await onCreateBrand(data);
      setBrandId(newBrand.id);
    }
    setModalType(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* কার্ড হেডার */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Folders size={16} weight="bold" />
            </span>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              ক্যাটাগরি ও ব্র্যান্ড
            </h2>
          </div>
          <span className="text-[10px] text-slate-400">ট্যাক্সোনমি</span>
        </div>

        <div className="p-5 space-y-4">
          {/* ক্যাটাগরি ফিল্ড উইথ ইনলাইন কুইক ক্রিয়েট */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                ক্যাটাগরি
              </label>
              <button
                type="button"
                onClick={() => setModalType('category')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <Plus size={12} weight="bold" />
                <span>+ নতুন ক্যাটাগরি</span>
              </button>
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm text-slate-900 bg-white"
            >
              <option value="">— ক্যাটাগরি নির্বাচন করুন —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.banglaName ? `${c.banglaName} (${c.name})` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* ব্র্যান্ড ফিল্ড উইথ ইনলাইন কুইক ক্রিয়েট */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                কোম্পানি / ব্র্যান্ড
              </label>
              <button
                type="button"
                onClick={() => setModalType('brand')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <Plus size={12} weight="bold" />
                <span>+ নতুন ব্র্যান্ড</span>
              </button>
            </div>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm text-slate-900 bg-white"
            >
              <option value="">— ব্র্যান্ড নির্বাচন করুন (ঐচ্ছিক) —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.banglaName ? `${b.banglaName} (${b.name})` : b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ইনলাইন ফাস্ট-ক্রিয়েট মোডাল */}
      <InlineTaxonomyModal
        isOpen={Boolean(modalType)}
        type={modalType || 'category'}
        onClose={() => setModalType(null)}
        onSubmit={handleCreateTaxonomy}
      />
    </>
  );
}
