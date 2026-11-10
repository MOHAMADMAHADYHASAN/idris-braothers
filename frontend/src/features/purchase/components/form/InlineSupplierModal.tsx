'use client';

import React, { useState } from 'react';
import { X, Plus, Buildings, Spinner } from '@phosphor-icons/react';
import { supplierKhataService } from '@/features/supplier-khata/supplierKhata.service';
import { Supplier } from '@/features/supplier-khata/supplierKhata.types';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Buildings size={16} weight="bold" />
            </span>
            <h3 className="font-bold text-slate-800 text-sm">নতুন মহাজন / আড়তদার যোগ</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মহাজন বা ব্যক্তির নাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="উদাঃ আলহাজ্ব কবির আহমেদ"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm text-slate-900"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              কোম্পানি / মোকামের গদির নাম
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="উদাঃ মেসার্স কবির এন্টারপ্রাইজ (খাতুনগঞ্জ)"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মোবাইল নম্বর
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="০১৮XXXXXXXX"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মোকাম / ঠিকানা
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="খাতুনগঞ্জ / মৌলভীবাজার"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-sm"
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
