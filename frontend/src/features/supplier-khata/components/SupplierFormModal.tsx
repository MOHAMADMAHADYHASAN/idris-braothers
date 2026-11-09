'use client';

import React, { useState, useEffect } from 'react';
import { X, PencilSimple, WarningCircle, CheckCircle, Buildings } from '@phosphor-icons/react';
import { motion } from 'motion/react';
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
              {isEdit ? <PencilSimple size={16} weight="bold" /> : <Buildings size={16} weight="bold" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                {isEdit ? 'মহাজন তথ্য সম্পাদনা' : 'নতুন মহাজন / আড়ত খাতা তৈরি'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEdit ? selectedSupplier?.companyName || selectedSupplier?.name : 'মোকাম ও গদির বিবরণ যুক্ত করুন'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
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

            {/* গদি / প্রতিষ্ঠানের নাম */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                গদি / প্রতিষ্ঠানের নাম
              </label>
              <input
                type="text"
                autoFocus
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="যেমন: মেসার্স আলম ব্রাদার্স / হাজী ট্রেডার্স"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
              />
            </div>

            {/* মহাজনের নাম (ব্যক্তি) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মহাজনের নাম (মালিক / যোগাযোগ ব্যক্তি) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: হাজী নুরুল হক / আনোয়ার হোসেন"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
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
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm font-mono tabular-nums text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
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
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
              />
            </div>

            {/* প্রারম্ভিক দেনা (শুধুমাত্র নতুন তৈরির সময়) */}
            {isCreate && (
              <div className="pt-1">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  সফটওয়্যার চালুর পূর্বের বকেয়া দেনা (টাকা)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={openingPayableStr}
                    onChange={(e) => setOpeningPayableStr(e.target.value)}
                    placeholder="০"
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm font-mono tabular-nums text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  যদি এই মহাজনের কাছে দোকানের আগে থেকেই কোনো দেনা থাকে, তা এখানে লিখুন। না থাকলে ০ রাখুন।
                </p>
              </div>
            )}
          </div>

          {/* ফুটার */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200/90 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-md border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-xs font-medium text-slate-600 transition-[background-color,border-color,transform] duration-150"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 shadow-[0_1px_2px_rgba(15,23,42,0.1)] disabled:opacity-50"
            >
              <CheckCircle size={15} weight="bold" />
              <span>
                {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'আপডেট সম্পন্ন' : 'খাতা তৈরি করুন'}
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
