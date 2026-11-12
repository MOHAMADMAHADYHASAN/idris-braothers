'use client';

import React, { useState, useEffect, useId } from 'react';
import { motion } from 'motion/react';
import { X, UserPlus, PencilSimple, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { buttonClasses } from '@/components/ui/Button';
import { useCustomerKhataStore } from '../useCustomerKhataStore';
import { CustomerType } from '../customerKhata.types';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

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
  const formId = useId();
  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(
    Boolean(isCreate || isEdit),
    closeModal
  );

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
    <div {...backdropProps} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-frosted">
      <motion.div
        {...dialogProps}
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-surface-card w-full max-w-md rounded-lg shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] border border-border-default overflow-hidden focus:outline-hidden"
      >
        {/* হেডার */}
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center shrink-0">
              {isEdit ? <PencilSimple size={17} weight="bold" /> : <UserPlus size={17} weight="bold" />}
            </div>
            <div>
              <h3 id={titleId} className="font-semibold text-ink-primary text-xs sm:text-sm leading-tight">
                {isEdit ? 'কাস্টমার তথ্য সম্পাদনা' : 'নতুন কাস্টমার খাতা তৈরি'}
              </h3>
              {isEdit && selectedCustomer?.name && (
                <p className="text-xs text-ink-secondary">{selectedCustomer.name}</p>
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
          <div className="p-4 space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-md bg-due-bg border border-due-border text-due-text text-xs flex items-center gap-2">
                <WarningCircle size={15} weight="bold" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* নাম */}
            <div>
              <label htmlFor={`${formId}-name`} className="block text-xs font-medium text-ink-body mb-1">
                গ্রাহকের নাম <span className="text-danger">*</span>
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="গ্রাহকের নাম"
                className="w-full px-2.5 py-1.5 bg-surface-card border border-border-default rounded-md text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
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
                className="w-full px-2.5 py-1.5 bg-surface-card border border-border-default rounded-md text-xs sm:text-sm font-mono tabular-nums tracking-tight text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
              />
            </div>

            {/* ঠিকানা / বাজার / এলাকা */}
            <div>
              <label htmlFor={`${formId}-address`} className="block text-xs font-medium text-ink-secondary mb-1">
                ঠিকানা / বাজার / এলাকা
              </label>
              <input
                id={`${formId}-address`}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ঠিকানা / এলাকা"
                className="w-full px-2.5 py-1.5 bg-surface-card border border-border-default rounded-md text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
              />
            </div>

            {/* কাস্টমার টাইপ (খুচরা বনাম পাইকারি) */}
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1.5">
                গ্রাহকের ব্যবসার ধরন
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerType('RETAIL')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ${
                    customerType === 'RETAIL'
                      ? 'border-brand-deep bg-brand-deep text-white shadow-2xs'
                      : 'border-border-default bg-surface-card text-ink-body hover:bg-surface-subtle'
                  }`}
                >
                  <span>খুচরা ক্রেতা</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerType('WHOLESALE')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ${
                    customerType === 'WHOLESALE'
                      ? 'border-wholesale-hover bg-wholesale-solid text-white shadow-2xs'
                      : 'border-border-default bg-surface-card text-ink-body hover:bg-surface-subtle'
                  }`}
                >
                  <span>পাইকারি বেপারী বা দোকান</span>
                </button>
              </div>
            </div>

            {/* প্রারম্ভিক বকেয়া (শুধুমাত্র নতুন তৈরির সময়) */}
            {isCreate && (
              <div className="pt-1">
                <label htmlFor={`${formId}-opening-due`} className="block text-xs font-medium text-ink-secondary mb-1">
                  সফটওয়্যার চালুর পূর্বের বকেয়া (টাকা)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-secondary font-bold text-xs">
                    ৳
                  </span>
                  <input
                    id={`${formId}-opening-due`}
                    type="number"
                    step="any"
                    value={openingDueStr}
                    onChange={(e) => setOpeningDueStr(e.target.value)}
                    placeholder="০"
                    className="w-full pl-6 pr-2.5 py-1.5 bg-surface-card border border-border-default rounded-md text-xs font-mono tabular-nums tracking-tight text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ফুটার */}
          <div className="px-4 py-3 bg-surface-subtle border-t border-border-subtle flex items-center justify-end gap-2">
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
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'আপডেট সম্পন্ন' : 'খাতা তৈরি করুন'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
