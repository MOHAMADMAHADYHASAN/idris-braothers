'use client';

import React, { useState, useEffect } from 'react';
import { X, PencilSimple, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { motion } from 'motion/react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white w-full max-w-md rounded-lg shadow-xl border border-slate-200/90 overflow-hidden"
      >
        {/* হেডার */}
        <div className="px-4 py-3 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
              <PencilSimple size={16} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">খরচের বিবরণ সম্পাদনা</h3>
              <p className="text-[11px] text-slate-500">ভুল তথ্য সংশোধন করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeEditModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-[background-color,color] duration-150"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3">
            {error && (
              <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <WarningCircle size={15} weight="bold" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ক্যাটাগরি */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                খরচের খাত / ক্যাটাগরি
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-bold font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
                />
              </div>
            </div>

            {/* বিবরণ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                খরচের বিবরণ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
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
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
              />
            </div>
          </div>

          {/* ফুটার */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200/90 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeEditModal}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-xs font-medium text-slate-600 transition-[background-color,border-color,transform] duration-150"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(15,23,42,0.1)] disabled:opacity-50"
            >
              <CheckCircle size={15} weight="bold" />
              <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'আপডেট সম্পন্ন'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
