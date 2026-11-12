'use client';

import React, { useState, useEffect, useId } from 'react';
import { X, PencilSimple, WarningCircle, CheckCircle, Buildings } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { buttonClasses } from '@/components/ui/Button';
import { useSupplierKhataStore } from '../useSupplierKhataStore';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

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
  const formId = useId();
  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(
    Boolean(isCreate || isEdit),
    closeModal
  );

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
    <div {...backdropProps} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50">
      <motion.div
        {...dialogProps}
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-surface-card w-full max-w-md rounded-lg shadow-xl border border-border-default overflow-hidden focus:outline-hidden"
      >
        {/* হেডার */}
        <div className="px-4 py-3 border-b border-border-default flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center">
              {isEdit ? <PencilSimple size={16} weight="bold" /> : <Buildings size={16} weight="bold" />}
            </div>
            <div>
              <h3 id={titleId} className="font-bold text-ink-primary text-xs sm:text-sm">
                {isEdit ? 'মহাজন তথ্য সম্পাদনা' : 'নতুন মহাজন ও আড়ত খাতা তৈরি'}
              </h3>
              {isEdit && (selectedSupplier?.companyName || selectedSupplier?.name) && (
                <p className="text-xs text-ink-secondary">
                  {selectedSupplier?.companyName || selectedSupplier?.name}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-border-default transition-[background-color,color] duration-150 cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3">
            {error && (
              <div className="p-2.5 rounded-md bg-due-bg border border-due-border text-due-text text-xs flex items-center gap-2">
                <WarningCircle size={15} weight="bold" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* গদি / প্রতিষ্ঠানের নাম */}
            <div>
              <label htmlFor={`${formId}-company`} className="block text-xs font-medium text-ink-body mb-1">
                গদি / প্রতিষ্ঠানের নাম
              </label>
              <input
                id={`${formId}-company`}
                type="text"
                autoFocus
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="প্রতিষ্ঠানের নাম"
                className="w-full px-3 py-1.5 bg-surface-card border border-border-default rounded-md text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
              />
            </div>

            {/* মহাজনের নাম (ব্যক্তি) */}
            <div>
              <label htmlFor={`${formId}-name`} className="block text-xs font-semibold text-ink-body mb-1">
                মহাজনের নাম (মালিক বা যোগাযোগ ব্যক্তি) <span className="text-red-500">*</span>
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="মহাজনের নাম"
                className="w-full px-3 py-1.5 bg-surface-card border border-border-default rounded-md text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
              />
            </div>

            {/* মোবাইল নম্বর */}
            <div>
              <label htmlFor={`${formId}-phone`} className="block text-xs font-medium text-ink-secondary mb-1">
                মোবাইল নম্বর (ঐচ্ছিক)
              </label>
              <input
                id={`${formId}-phone`}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="০১XXXXXXXXX"
                className="w-full px-3 py-1.5 bg-surface-card border border-border-default rounded-md text-xs sm:text-sm font-mono tabular-nums text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
              />
            </div>

            {/* মোকাম / ঠিকানা */}
            <div>
              <label htmlFor={`${formId}-address`} className="block text-xs font-medium text-ink-secondary mb-1">
                মোকাম / আড়তের এলাকা
              </label>
              <input
                id={`${formId}-address`}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="মোকাম / এলাকা"
                className="w-full px-3 py-1.5 bg-surface-card border border-border-default rounded-md text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
              />
            </div>

            {/* প্রারম্ভিক দেনা (শুধুমাত্র নতুন তৈরির সময়) */}
            {isCreate && (
              <div className="pt-1">
                <label htmlFor={`${formId}-opening-payable`} className="block text-xs font-medium text-ink-secondary mb-1">
                  সফটওয়্যার চালুর পূর্বের বকেয়া দেনা (টাকা)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary font-bold text-xs">
                    ৳
                  </span>
                  <input
                    id={`${formId}-opening-payable`}
                    type="number"
                    step="any"
                    value={openingPayableStr}
                    onChange={(e) => setOpeningPayableStr(e.target.value)}
                    placeholder="০"
                    className="w-full pl-7 pr-3 py-1.5 bg-surface-card border border-border-default rounded-md text-xs sm:text-sm font-mono tabular-nums text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ফুটার */}
          <div className="px-4 py-2.5 bg-surface-subtle border-t border-border-default flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className={buttonClasses({ variant: 'secondary', size: 'sm' })}
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className={buttonClasses({ variant: 'primary', size: 'sm', className: 'gap-1.5' })}
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
