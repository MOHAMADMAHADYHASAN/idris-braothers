'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, PencilSimple, WarningCircle, CheckCircle, Buildings } from '@phosphor-icons/react';
import { useSupplierKhataStore } from '../useSupplierKhataStore';

export function SupplierFormModal() {
  const {
    activeModal,
    selectedSupplier,
    closeModal,
    submitCreateSupplier,
    submitUpdateSupplier,
  } = useSupplierKhataStore();

  const isEdit = activeModal === 'edit' && selectedSupplier !== null;
  const isCreate = activeModal === 'create';

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openingPayableStr, setOpeningPayableStr] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && selectedSupplier) {
      setName(selectedSupplier.name);
      setCompanyName(selectedSupplier.companyName || '');
      setPhone(selectedSupplier.phone || '');
      setAddress(selectedSupplier.address || '');
      setOpeningPayableStr('0');
    } else {
      setName('');
      setCompanyName('');
      setPhone('');
      setAddress('');
      setOpeningPayableStr('0');
    }
    setError(null);
  }, [isEdit, selectedSupplier, activeModal]);

  if (!isCreate && !isEdit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('মহাজন বা যোগাযোগের ব্যক্তির নাম প্রদান করা বাধ্যতামূলক');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit && selectedSupplier) {
        await submitUpdateSupplier(selectedSupplier.id, {
          name: name.trim(),
          companyName: companyName.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
        });
      } else {
        await submitCreateSupplier({
          name: name.trim(),
          companyName: companyName.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
          openingPayable: Number(openingPayableStr) || 0,
        });
      }
      closeModal();
    } catch (err: any) {
      setError(err.message || 'মহাজন তথ্য সংরক্ষণ করতে সমস্যা হয়েছে');
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
              {isEdit ? <PencilSimple size={18} weight="bold" /> : <Buildings size={18} weight="bold" />}
            </div>
            <div>
              <h3 className="font-bold text-ink-primary text-sm sm:text-base">
                {isEdit ? 'মহাজন তথ্য সম্পাদনা' : 'নতুন মহাজন / আড়ত খাতা তৈরি'}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {isEdit ? selectedSupplier?.companyName || selectedSupplier?.name : 'মোকাম ও গদির বিবরণ যুক্ত করুন'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
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

            {/* গদি / প্রতিষ্ঠানের নাম */}
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                গদি / প্রতিষ্ঠানের নাম
              </label>
              <input
                type="text"
                autoFocus
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="যেমন: মেসার্স আলম ব্রাদার্স / হাজী ট্রেডার্স"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            {/* মহাজনের নাম (ব্যক্তি) */}
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                মহাজনের নাম (মালিক / যোগাযোগ ব্যক্তি) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: হাজী নুরুল হক / আনোয়ার হোসেন"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            {/* মোবাইল নম্বর */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                মোবাইল নম্বর (ঐচ্ছিক)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="যেমন: 018XXXXXXXX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            {/* মোকাম / ঠিকানা */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                মোকাম / আড়তের এলাকা
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="যেমন: খাতুনগঞ্জ, চট্টগ্রাম / মৌলভীবাজার, ঢাকা"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            {/* প্রারম্ভিক দেনা (শুধুমাত্র নতুন তৈরির সময়) */}
            {isCreate && (
              <div className="pt-1">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  সফটওয়্যার চালুর পূর্বের বকেয়া দেনা (টাকা)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={openingPayableStr}
                    onChange={(e) => setOpeningPayableStr(e.target.value)}
                    placeholder="০"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  যদি এই মহাজনের কাছে দোকানের আগে থেকেই কোনো দেনা থাকে, তা এখানে লিখুন। না থাকলে ০ রাখুন।
                </p>
              </div>
            )}
          </div>

          {/* ফুটার */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-medium text-ink-muted transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-98 disabled:opacity-50"
            >
              <CheckCircle size={16} weight="bold" />
              <span>
                {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'আপডেট সম্পন্ন' : 'খাতা তৈরি করুন'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
