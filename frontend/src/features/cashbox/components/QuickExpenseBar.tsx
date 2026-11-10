'use client';

import React, { useState } from 'react';
import {
  Plus,
  Coffee,
  Truck,
  Lightning,
  Wrench,
  Article,
  Users,
  CheckCircle,
} from '@phosphor-icons/react';
import { ExpenseCategory } from '../cashbox.types';
import { useCashboxStore } from '../useCashboxStore';

const CATEGORIES: { id: ExpenseCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'LABOR_KULI', label: 'কুলি ও লেবার', icon: <Users size={13} weight="bold" /> },
  { id: 'TRANSPORT_VAN', label: 'ভ্যান ও গাড়িভাড়া', icon: <Truck size={13} weight="bold" /> },
  { id: 'TEA_SNACKS', label: 'চা-নাস্তা ও আপ্যায়ন', icon: <Coffee size={13} weight="bold" /> },
  { id: 'ELECTRICITY_UTILITY', label: 'বিদ্যুৎ ও ইউটিলিটি', icon: <Lightning size={13} weight="bold" /> },
  { id: 'SHOP_MAINTENANCE', label: 'দোকান সরঞ্জাম', icon: <Wrench size={13} weight="bold" /> },
  { id: 'OTHER', label: 'বিবিধ খরচ', icon: <Article size={13} weight="bold" /> },
];

export function QuickExpenseBar() {
  const { createExpense } = useCashboxStore();

  const [category, setCategory] = useState<ExpenseCategory>('LABOR_KULI');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(amountStr);
    if (!amount || amount <= 0 || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await createExpense({
        category,
        amount,
        description: description.trim(),
      });

      setAmountStr('');
      setDescription('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
    } catch (err) {
      console.error('Failed to create expense', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-default p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-bold text-sm text-ink-primary">
          ঝটপট দৈনিক খরচ এন্ট্রি
        </h3>
        {successMsg && (
          <span className="text-xs font-semibold text-cash-text flex items-center gap-1 animate-in fade-in">
            <CheckCircle size={14} weight="fill" />
            <span>খরচ সংরক্ষিত হয়েছে</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] whitespace-nowrap text-xs cursor-pointer ${
                category === cat.id
                  ? 'bg-brand-deep text-white shadow-2xs'
                  : 'bg-surface-subtle text-ink-body hover:bg-brand-soft hover:text-brand-deep border border-border-default'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          <div className="sm:col-span-4 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary font-bold text-xs">
              ৳
            </span>
            <input
              type="number"
              step="any"
              required
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="পরিমাণ"
              className="w-full pl-7 pr-3 py-2 bg-surface-card border border-border-strong rounded-lg text-xs sm:text-sm font-mono tabular-nums font-bold text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
            />
          </div>

          <div className="sm:col-span-6">
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="খরচের বিবরণ"
              className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-deep focus:border-brand-deep"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || !amountStr || !description.trim()}
              className="w-full py-2 px-3 rounded-lg bg-brand-deep hover:bg-brand-hover active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <Plus size={14} weight="bold" />
              <span>যুক্ত করুন</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
