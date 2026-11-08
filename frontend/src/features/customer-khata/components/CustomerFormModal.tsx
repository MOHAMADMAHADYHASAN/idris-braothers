'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, PencilSimple, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { useCustomerKhataStore } from '../useCustomerKhataStore';
import { CustomerType } from '../customerKhata.types';

export function CustomerFormModal() {
  const { activeModal, selectedCustomer, closeModal, submitCreateCustomer, submitUpdateCustomer } =
    useCustomerKhataStore();

  const isEdit = activeModal === 'edit' && selectedCustomer !== null;
  const isCreate = activeModal === 'create';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('RETAIL');
  const [openingDueStr, setOpeningDueStr] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && selectedCustomer) {
      setName(selectedCustomer.name);
      setPhone(selectedCustomer.phone || '');
      setAddress(selectedCustomer.address || '');
      setCustomerType(selectedCustomer.customerType);
      setOpeningDueStr('0');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setCustomerType('RETAIL');
      setOpeningDueStr('0');
    }
    setError(null);
  }, [isEdit, selectedCustomer, activeModal]);

  if (!isCreate && !isEdit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('কাস্টমারের নাম প্রদান করা বাধ্যতামূলক');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit && selectedCustomer) {
        await submitUpdateCustomer(selectedCustomer.id, {
          name: name.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          customerType,
        });
      } else {
        await submitCreateCustomer({
          name: name.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          customerType,
          openingDue: Number(openingDueStr) || 0,
        });
      }
      closeModal();
    } catch (err: any) {
      setError(err.message || 'কাস্টমার সংরক্ষণ করতে সমস্যা হয়েছে');
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
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              {isEdit ? <PencilSimple size={18} weight="bold" /> : <UserPlus size={18} weight="bold" />}
            </div>
            <div>
              <h3 className="font-bold text-ink-primary text-sm sm:text-base">
                {isEdit ? 'কাস্টমার তথ্য সম্পাদনা' : 'নতুন কাস্টমার খাতা তৈরি'}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {isEdit ? selectedCustomer?.name : 'গ্রাহকের নাম ও লেনদেনের ধরন নির্ধারণ করুন'}
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

            {/* নাম */}
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                গ্রাহকের নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: হাজী আব্দুল কাদের / ভাই ভাই স্টোর"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-ink-primary focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* ঠিকানা / বাজার / এলাকা */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                ঠিকানা / বাজার / এলাকা
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="যেমন: ফেনী বড় বাজার / দাগনভূঞা"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* কাস্টমার টাইপ (খুচরা বনাম পাইকারি) */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                গ্রাহকের ব্যবসার ধরন
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerType('RETAIL')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    customerType === 'RETAIL'
                      ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>খুচরা ক্রেতা</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerType('WHOLESALE')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    customerType === 'WHOLESALE'
                      ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>পাইকারি বেপারী/দোকান</span>
                </button>
              </div>
            </div>

            {/* প্রারম্ভিক বকেয়া (শুধুমাত্র নতুন তৈরির সময়) */}
            {isCreate && (
              <div className="pt-1">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  সফটওয়্যার চালুর পূর্বের বকেয়া (টাকা)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={openingDueStr}
                    onChange={(e) => setOpeningDueStr(e.target.value)}
                    placeholder="০"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-ink-primary focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  যদি এই গ্রাহকের কাছে আগে থেকেই কোনো বাকি পাওনা থাকে, তা এখানে লিখুন। না থাকলে ০ রাখুন।
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-98 disabled:opacity-50"
            >
              <CheckCircle size={16} weight="bold" />
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'আপডেট সম্পন্ন' : 'খাতা তৈরি করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
