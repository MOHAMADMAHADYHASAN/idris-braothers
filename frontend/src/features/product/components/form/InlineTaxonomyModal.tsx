'use client';

import React, { useState, useId } from 'react';
import { X, Plus, Spinner } from '@phosphor-icons/react';
import { useDialogAccessibility } from '@/components/shared/AccessibleDialog';

interface InlineTaxonomyModalProps {
  isOpen: boolean;
  type: 'category' | 'brand';
  onClose: () => void;
  onSubmit: (data: { name: string; banglaName?: string }) => Promise<void>;
}

export function InlineTaxonomyModal({
  isOpen,
  type,
  onClose,
  onSubmit,
}: InlineTaxonomyModalProps) {
  const [name, setName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const { titleId, dialogProps, backdropProps } = useDialogAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  const isCategory = type === 'category';
  const title = isCategory ? 'নতুন ক্যাটাগরি তৈরি' : 'নতুন ব্র্যান্ড তৈরি';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('ইংরেজি বা মূল নাম আবশ্যক');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        banglaName: banglaName.trim() || undefined,
      });
      setName('');
      setBanglaName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'সংরক্ষণ করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div {...backdropProps} className="fixed inset-0 z-[100] flex items-center justify-center modal-backdrop-frosted p-4">
      <div
        {...dialogProps}
        className="bg-surface-card rounded-xl shadow-2xl border border-border-default w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 focus:outline-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-surface-subtle border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep">
              <Plus size={16} weight="bold" />
            </span>
            <h3 id={titleId} className="font-bold text-ink-primary text-sm">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-due-bg border border-due-border text-due-text text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor={`${formId}-name`} className="block text-xs font-semibold text-ink-body mb-1">
              {isCategory ? 'ক্যাটাগরির নাম' : 'ব্র্যান্ডের নাম'}{' '}
              <span className="text-danger">*</span>
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isCategory ? 'ইংরেজি নাম' : 'ব্র্যান্ডের নাম'}
              className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs sm:text-sm text-ink-primary"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor={`${formId}-bangla`} className="block text-xs font-semibold text-ink-body mb-1">
              বাংলা নাম (ইনভয়েস ও স্লিপের জন্য)
            </label>
            <input
              id={`${formId}-bangla`}
              type="text"
              value={banglaName}
              onChange={(e) => setBanglaName(e.target.value)}
              placeholder="বাংলা নাম"
              className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs sm:text-sm text-ink-primary"
            />
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
              <span>যুক্ত করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
