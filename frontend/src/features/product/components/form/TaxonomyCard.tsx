'use client';

import React, { useState, useId } from 'react';
import { Folders, Plus } from '@phosphor-icons/react';
import { Category, Brand } from '../../product.types';
import { InlineTaxonomyModal } from './InlineTaxonomyModal';
import { CustomSelect } from '@/components/shared/CustomSelect';

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
  const formId = useId();

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
      <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
        {/* কার্ড হেডার */}
        <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-wholesale-bg text-wholesale-text">
              <Folders size={16} weight="bold" />
            </span>
            <h2 className="text-sm font-bold text-ink-primary">
              ক্যাটাগরি ও ব্র্যান্ড
            </h2>
          </div>
          <span className="text-xs text-ink-secondary">শ্রেণিবিভাগ</span>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={`${formId}-category`} className="text-xs font-semibold text-ink-body">
                ক্যাটাগরি
              </label>
              <button
                type="button"
                onClick={() => setModalType('category')}
                className="text-xs font-semibold text-brand-deep hover:text-brand-hover flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={12} weight="bold" />
                <span>নতুন ক্যাটাগরি</span>
              </button>
            </div>
            <CustomSelect
              id={`${formId}-category`}
              options={[
                { value: '', label: '— ক্যাটাগরি নির্বাচন করুন —' },
                ...categories.map((c) => ({
                  value: c.id,
                  label: c.banglaName ? `${c.banglaName} (${c.name})` : c.name,
                })),
              ]}
              value={categoryId}
              onChange={setCategoryId}
              placeholder="— ক্যাটাগরি নির্বাচন করুন —"
              enableSearch={categories.length > 6}
              className="w-full"
              buttonClassName="w-full h-10 text-xs sm:text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={`${formId}-brand`} className="text-xs font-semibold text-ink-body">
                কোম্পানি / ব্র্যান্ড
              </label>
              <button
                type="button"
                onClick={() => setModalType('brand')}
                className="text-xs font-semibold text-brand-deep hover:text-brand-hover flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={12} weight="bold" />
                <span>নতুন ব্র্যান্ড</span>
              </button>
            </div>
            <CustomSelect
              id={`${formId}-brand`}
              options={[
                { value: '', label: '— ব্র্যান্ড নির্বাচন করুন (ঐচ্ছিক) —' },
                ...brands.map((b) => ({
                  value: b.id,
                  label: b.banglaName ? `${b.banglaName} (${b.name})` : b.name,
                })),
              ]}
              value={brandId}
              onChange={setBrandId}
              placeholder="— ব্র্যান্ড নির্বাচন করুন (ঐচ্ছিক) —"
              enableSearch={brands.length > 6}
              className="w-full"
              buttonClassName="w-full h-10 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      <InlineTaxonomyModal
        isOpen={Boolean(modalType)}
        type={modalType || 'category'}
        onClose={() => setModalType(null)}
        onSubmit={handleCreateTaxonomy}
      />
    </>
  );
}
