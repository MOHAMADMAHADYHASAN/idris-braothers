'use client';

import React, { useState } from 'react';
import { X, Plus, Spinner } from '@phosphor-icons/react';

interface InlineTaxonomyModalProps {
  isOpen: boolean;
  type: 'category' | 'brand';
  onClose: () => void;
  onSubmit: (data: { name: string; banglaName?: string }) => Promise<void>;
}

export function InlineTaxonomyModal({
  isOpen,
  type,
  onClose,
  onSubmit,
}: InlineTaxonomyModalProps) {
  const [name, setName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCategory = type === 'category';
  const title = isCategory ? 'নতুন ক্যাটাগরি তৈরি' : 'নতুন ব্র্যান্ড তৈরি';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('ইংরেজি বা মূল নাম আবশ্যক');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        banglaName: banglaName.trim() || undefined,
      });
      setName('');
      setBanglaName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'সংরক্ষণ করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 text-indigo-600">
              <Plus size={16} weight="bold" />
            </span>
            <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isCategory ? 'ক্যাটাগরির নাম (English / Standard)' : 'ব্র্যান্ডের নাম (English / Standard)'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isCategory ? 'উদাঃ Spices / Edible Oil' : 'উদাঃ Teer / Fresh / Radhuni'}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm text-slate-900"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              বাংলা নাম (ইনভয়েস ও স্লিপের জন্য)
            </label>
            <input
              type="text"
              value={banglaName}
              onChange={(e) => setBanglaName(e.target.value)}
              placeholder={isCategory ? 'উদাঃ মসলা / সয়াবিন তেল' : 'উদাঃ তীর / ফ্রেশ / রাঁধুনী'}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isSubmitting && <Spinner size={13} className="animate-spin" />}
              <span>যুক্ত করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
