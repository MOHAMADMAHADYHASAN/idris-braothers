'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, X, CheckCircle, Warning, User, Phone, MapPin, Coins } from '@phosphor-icons/react';
import { customerKhataService } from '@/features/customer-khata/customerKhata.service';
import { CustomerOption } from '../pos.types';
import { normalizePhone, isValidBDPhone } from '@/lib/phone';

interface PosQuickCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: CustomerOption) => void;
  initialSearchText?: string;
}

export function PosQuickCustomerModal({
  isOpen,
  onClose,
  onCustomerCreated,
  initialSearchText = '',
}: PosQuickCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openingDue, setOpeningDue] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // If initial search text looks like a phone number, prefill phone, else name
      const cleanSearch = initialSearchText.trim();
      const normPhone = normalizePhone(cleanSearch);
      if (
        normPhone &&
        (cleanSearch.startsWith('+880') ||
          cleanSearch.startsWith('880') ||
          cleanSearch.startsWith('01') ||
          cleanSearch.startsWith('১') ||
          cleanSearch.startsWith('০') ||
          /^\d+$/.test(cleanSearch.replace(/[\s\-]/g, '')))
      ) {
        setPhone(normPhone);
        setName('');
      } else {
        setName(cleanSearch);
        setPhone('');
      }
      setAddress('');
      setOpeningDue('0');
      setError(null);
      setIsSubmitting(false);

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialSearchText]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('খদ্দেরের নাম লিখুন');
      return;
    }

    if (!trimmedPhone) {
      setError('বাকি জবাবদিহিতার জন্য মোবাইল নম্বর আবশ্যক');
      return;
    }

    if (!isValidBDPhone(trimmedPhone)) {
      setError('সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: ০১৭১২-৩৪৫৬৭৮ বা 017XXXXXXXX)');
      return;
    }

    const normalizedPhone = normalizePhone(trimmedPhone);

    setIsSubmitting(true);
    setError(null);

    try {
      const parsedOpeningDue = parseFloat(openingDue) || 0;
      const created = await customerKhataService.createCustomer({
        name: trimmedName,
        phone: normalizedPhone,
        address: address.trim() || undefined,
        openingDue: parsedOpeningDue,
      });

      const customerOption: CustomerOption = {
        id: created.id,
        name: created.name,
        phone: created.phone,
        address: created.address,
        customerType: created.customerType,
        currentDue: created.currentDue,
      };

      onCustomerCreated(customerOption);
      onClose();
    } catch (err: any) {
      console.error('Failed to create customer:', err);
      setError(err?.message || 'কাস্টমার তৈরি করতে ব্যর্থ হয়েছে। নম্বরটি কি আগেই ব্যবহৃত?');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-customer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-surface-card rounded-2xl border border-border-default shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-brand-soft/60 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-deep text-white flex items-center justify-center shrink-0">
              <UserPlus size={18} weight="bold" />
            </div>
            <div>
              <h3 id="quick-customer-modal-title" className="font-bold text-sm text-ink-primary">
                নতুন খদ্দের খাতা খুলুন
              </h3>
              <p className="text-2xs text-ink-secondary">কাউন্টার থেকে সরাসরি খাতা তৈরি</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
            title="বন্ধ করুন (Esc)"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-due-bg border border-due-border text-due-text text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Warning size={16} weight="bold" className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-1">
            <label htmlFor="quick-cust-name" className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <User size={13} weight="bold" className="text-brand-deep" />
              <span>খদ্দেরের নাম <span className="text-due-text">*</span></span>
            </label>
            <input
              ref={nameInputRef}
              id="quick-cust-name"
              type="text"
              required
              placeholder="যেমন: হাজী রফিকুল ইসলাম"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border-default bg-surface-subtle/50 focus:bg-surface-card text-xs font-medium text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep transition-all"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label htmlFor="quick-cust-phone" className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <Phone size={13} weight="bold" className="text-brand-deep" />
              <span>মোবাইল নম্বর <span className="text-due-text">*</span></span>
            </label>
            <input
              id="quick-cust-phone"
              type="tel"
              required
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border-default bg-surface-subtle/50 focus:bg-surface-card text-xs font-medium font-mono text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep transition-all"
            />
          </div>

          {/* Address / Area */}
          <div className="space-y-1">
            <label htmlFor="quick-cust-address" className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <MapPin size={13} weight="bold" className="text-ink-secondary" />
              <span>ঠিকানা / এলাকা <span className="text-ink-muted font-normal">(ঐচ্ছিক)</span></span>
            </label>
            <input
              id="quick-cust-address"
              type="text"
              placeholder="যেমন: মরিচপট্টি, ফেনী বাজার"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border-default bg-surface-subtle/50 focus:bg-surface-card text-xs font-medium text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep transition-all"
            />
          </div>

          {/* Opening Due */}
          <div className="space-y-1">
            <label htmlFor="quick-cust-due" className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <Coins size={13} weight="bold" className="text-ink-secondary" />
              <span>পূর্বের কোনো বকেয়া থাকলে <span className="text-ink-muted font-normal">(ঐচ্ছিক)</span></span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-secondary font-mono">৳</span>
              <input
                id="quick-cust-due"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={openingDue}
                onChange={(e) => setOpeningDue(e.target.value)}
                className="w-full h-10 pl-7 pr-3 rounded-xl border border-border-default bg-surface-subtle/50 focus:bg-surface-card text-xs font-bold font-mono tabular-nums text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-10 rounded-xl border border-border-default text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle text-xs font-bold transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 h-10 rounded-xl bg-brand-deep hover:bg-brand-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={16} weight="bold" />
                  <span>খাতা খুলুন ও সিলেক্ট করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
