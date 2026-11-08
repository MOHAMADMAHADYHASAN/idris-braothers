'use client';

import React, { useState, useEffect } from 'react';
import { X, PencilSimple, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { useCashboxStore } from '../useCashboxStore';
import { ExpenseCategory } from '../cashbox.types';

export function ExpenseEditModal() {
  const { editingExpense, isEditModalOpen, closeEditModal, updateExpense } =
    useCashboxStore();

  const [category, setCategory] = useState<ExpenseCategory>('OTHER');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingExpense) {
      setCategory(editingExpense.category);
      setAmountStr(String(editingExpense.amount));
      setDescription(editingExpense.description);
      setNote(editingExpense.note || '');
    }
    setError(null);
  }, [editingExpense]);

  if (!isEditModalOpen || !editingExpense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(amountStr);
    if (!amount || amount <= 0 || !description.trim()) {
      setError('সঠিক টাকার পরিমাণ ও বিবরণ দিন');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateExpense(editingExpense.id, {
        category,
        amount,
        description: description.trim(),
        note: note.trim() || undefined,
      });
      closeEditModal();
    } catch (err: any) {
      setError(err.message || 'খরচ আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* হেডার */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <PencilSimple size={18} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-ink-primary text-sm sm:text-base">খরচের বিবরণ সম্পাদনা</h3>
              <p className="text-[11px] text-ink-muted">ভুল তথ্য সংশোধন করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeEditModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <WarningCircle size={16} weight="bold" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ক্যাটাগরি */}
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                খরচের খাত / ক্যাটাগরি
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="LABOR_KULI">কুলি / লেবার খরচ</option>
                <option value="TRANSPORT_VAN">ভ্যান / ট্রাক ভাড়া</option>
                <option value="TEA_SNACKS">চা-নাস্তা ও আপ্যায়ন</option>
                <option value="ELECTRICITY_UTILITY">বিদ্যুৎ ও ইউটিলিটি</option>
                <option value="SHOP_MAINTENANCE">দোকান সরঞ্জাম / পলিথিন</option>
                <option value="OTHER">বিবিধ খরচ</option>
              </select>
            </div>

            {/* টাকার অংক */}
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                টাকার পরিমাণ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ৳
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-base font-bold font-mono text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* বিবরণ */}
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                খরচের বিবরণ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* নোট */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                মন্তব্য (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* ফুটার */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeEditModal}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-medium text-ink-muted transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-98 disabled:opacity-50"
            >
              <CheckCircle size={16} weight="bold" />
              <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'আপডেট সম্পন্ন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
