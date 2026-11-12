'use client';

import React, { useState, useId } from 'react';
import { X, Buildings, Spinner } from '@phosphor-icons/react';
import { supplierKhataService } from '@/features/supplier-khata/supplierKhata.service';
import { Supplier } from '@/features/supplier-khata/supplierKhata.types';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

interface InlineSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (supplier: Supplier) => void;
}

export function InlineSupplierModal({
  isOpen,
  onClose,
  onSuccess,
}: InlineSupplierModalProps) {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('মহাজন বা সত্ত্বাধিকারীর নাম আবশ্যক');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await supplierKhataService.createSupplier({
        name: name.trim(),
        companyName: companyName.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'মহাজন যোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div {...backdropProps} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div
        {...dialogProps}
        className="bg-surface-card rounded-xl shadow-2xl border border-border-default w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 focus:outline-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-surface-subtle border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep">
              <Buildings size={16} weight="bold" />
            </span>
            <h3 id={titleId} className="font-bold text-ink-primary text-sm">নতুন মহাজন ও আড়তদার যোগ</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-lg bg-due-bg border border-due-border text-due-text text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor={`${formId}-name`} className="block text-xs font-semibold text-ink-body mb-1">
              মহাজন বা ব্যক্তির নাম <span className="text-danger">*</span>
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="মহাজনের নাম"
              className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs sm:text-sm text-ink-primary"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor={`${formId}-company`} className="block text-xs font-semibold text-ink-body mb-1">
              কোম্পানি ও মোকামের গদির নাম
            </label>
            <input
              id={`${formId}-company`}
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="প্রতিষ্ঠানের নাম"
              className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs sm:text-sm text-ink-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor={`${formId}-phone`} className="block text-xs font-semibold text-ink-body mb-1">
                মোবাইল নম্বর
              </label>
              <input
                id={`${formId}-phone`}
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="০১৮XXXXXXXX"
                className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs text-ink-primary"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-address`} className="block text-xs font-semibold text-ink-body mb-1">
                মোকাম ও ঠিকানা
              </label>
              <input
                id={`${formId}-address`}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="মোকাম / ঠিকানা"
                className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs text-ink-primary"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-lg border border-border-strong text-ink-body text-xs font-semibold hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-brand-deep text-white text-xs font-semibold hover:bg-brand-hover disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              {isSubmitting && <Spinner size={13} className="animate-spin" />}
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
