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
  { id: 'LABOR_KULI', label: 'কুলি / লেবার', icon: <Users size={14} weight="bold" /> },
  { id: 'TRANSPORT_VAN', label: 'ভ্যান / গাড়িভাড়া', icon: <Truck size={14} weight="bold" /> },
  { id: 'TEA_SNACKS', label: 'চা-নাস্তা ও আপ্যায়ন', icon: <Coffee size={14} weight="bold" /> },
  { id: 'ELECTRICITY_UTILITY', label: 'বিদ্যুৎ ও ইউটিলিটি', icon: <Lightning size={14} weight="bold" /> },
  { id: 'SHOP_MAINTENANCE', label: 'দোকান সরঞ্জাম / পলিথিন', icon: <Wrench size={14} weight="bold" /> },
  { id: 'OTHER', label: 'বিবিধ খরচ', icon: <Article size={14} weight="bold" /> },
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
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-ink-primary">
            ঝটপট দৈনিক খরচ এন্ট্রি (Quick Expense Entry)
          </h3>
          <p className="text-[11px] text-ink-muted">কুলি, গাড়িভাড়া বা চা-নাস্তার খরচ ড্রয়ার থেকে বাদ দিন</p>
        </div>
        {successMsg && (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
            <CheckCircle size={15} weight="fill" />
            <span>খরচ সংরক্ষিত হয়েছে!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* ক্যাটাগরি পিলস সিলেক্টর */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                category === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* ইনপুট ফিল্ড ও সাবমিট বোতাম */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* টাকার অংক */}
          <div className="sm:col-span-4 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              ৳
            </span>
            <input
              type="number"
              step="any"
              required
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="টাকার পরিমাণ (যেমন: ২০০)"
              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* সংক্ষিপ্ত বিবরণ */}
          <div className="sm:col-span-6">
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="খরচের বিবরণ (যেমন: ৪ বস্তা জিরা নামানোর কুলি / মেহমানদারি)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* সেভ বাটন */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || !amountStr || !description.trim()}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-98 disabled:opacity-50"
            >
              <Plus size={15} weight="bold" />
              <span>যুক্ত করুন</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
