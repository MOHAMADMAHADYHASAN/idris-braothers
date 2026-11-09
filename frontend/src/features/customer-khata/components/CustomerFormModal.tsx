'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white w-full max-w-md rounded-lg shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] border border-slate-200/90 overflow-hidden"
      >
        {/* হেডার */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              {isEdit ? <PencilSimple size={17} weight="bold" /> : <UserPlus size={17} weight="bold" />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight">
                {isEdit ? 'কাস্টমার তথ্য সম্পাদনা' : 'নতুন কাস্টমার খাতা তৈরি'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEdit ? selectedCustomer?.name : 'গ্রাহকের নাম ও লেনদেনের ধরন নির্ধারণ করুন'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-[background-color,color] duration-150"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
                <WarningCircle size={15} weight="bold" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* নাম */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                গ্রাহকের নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: হাজী আব্দুল কাদের / ভাই ভাই স্টোর"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
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
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm font-mono tabular-nums tracking-tight text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
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
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
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
                  className={`py-1.5 px-3 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-[background-color,color] duration-150 active:scale-[0.98] ${
                    customerType === 'RETAIL'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>খুচরা ক্রেতা</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerType('WHOLESALE')}
                  className={`py-1.5 px-3 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-[background-color,color] duration-150 active:scale-[0.98] ${
                    customerType === 'WHOLESALE'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={openingDueStr}
                    onChange={(e) => setOpeningDueStr(e.target.value)}
                    placeholder="০"
                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono tabular-nums tracking-tight text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  যদি এই গ্রাহকের কাছে আগে থেকেই কোনো বাকি পাওনা থাকে, তা এখানে লিখুন। না থাকলে ০ রাখুন।
                </p>
              </div>
            )}
          </div>

          {/* ফুটার */}
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-600 transition-[background-color,color] duration-150 active:scale-[0.98]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50"
            >
              <CheckCircle size={15} weight="bold" />
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'আপডেট সম্পন্ন' : 'খাতা তৈরি করুন'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
