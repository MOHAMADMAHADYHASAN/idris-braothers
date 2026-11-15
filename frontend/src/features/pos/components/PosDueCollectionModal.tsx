'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Coins, X, CheckCircle, Warning, User, Receipt, Phone } from '@phosphor-icons/react';
import { customerKhataService } from '@/features/customer-khata/customerKhata.service';
import { CustomerOption } from '../pos.types';
import { formatCurrency, formatNumber } from '@/lib/decimal';
import { normalizePhone } from '@/lib/phone';

interface PosDueCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerList: CustomerOption[];
  preselectedCustomer: CustomerOption | null;
  onPaymentSuccess: (updatedCustomer: CustomerOption, amountPaid: number) => void;
}

export function PosDueCollectionModal({
  isOpen,
  onClose,
  customerList,
  preselectedCustomer,
  onPaymentSuccess,
}: PosDueCollectionModalProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState('কাউন্টার নগদ বকেয়া জমা');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerSearch, setCustomerSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (preselectedCustomer) {
        setSelectedCustomer(preselectedCustomer);
        setCustomerSearch(preselectedCustomer.name);
      } else {
        setSelectedCustomer(null);
        setCustomerSearch('');
      }
      setAmount('');
      setNote('কাউন্টার নগদ বকেয়া জমা');
      setError(null);
      setIsSubmitting(false);

      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, preselectedCustomer]);

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

  const currentDue = selectedCustomer?.currentDue || 0;
  const numAmount = parseFloat(amount) || 0;
  const remainingDueAfter = Math.max(0, currentDue - numAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedCustomer) {
      setError('বকেয়া জমা নেওয়ার জন্য খদ্দের নির্বাচন করুন');
      return;
    }

    if (numAmount <= 0) {
      setError('টাকার পরিমাণ লিখুন (০-এর বেশি হতে হবে)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await customerKhataService.receivePayment(selectedCustomer.id, {
        amount: numAmount,
        note: note.trim() || 'কাউন্টার নগদ বকেয়া জমা',
      });

      const updatedCustomer: CustomerOption = {
        ...selectedCustomer,
        currentDue: result.customer.currentDue,
      };

      onPaymentSuccess(updatedCustomer, numAmount);
      onClose();
    } catch (err: any) {
      console.error('Failed to collect due:', err);
      setError(err?.message || 'বকেয়া জমা নিতে ব্যর্থ হয়েছে। সার্ভার চালু আছে কি?');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="due-collection-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-surface-card rounded-2xl border border-border-default shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-cash-bg border-b border-cash-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cash-border text-cash-text flex items-center justify-center shrink-0">
              <Coins size={20} weight="bold" />
            </div>
            <div>
              <h3 id="due-collection-modal-title" className="font-bold text-sm text-cash-text">
                কাউন্টার বকেয়া জমা গ্রহণ
              </h3>
              <p className="text-2xs text-ink-secondary">সরাসরি খাতার নগদ টাকা উশুল ও রসিদ</p>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-due-bg border border-due-border text-due-text text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Warning size={16} weight="bold" className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div className="space-y-1 relative">
            <label htmlFor="due-cust-search" className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <User size={13} weight="bold" className="text-brand-deep" />
              <span>খদ্দের নির্বাচন করুন</span>
            </label>
            <div className="relative">
              <input
                id="due-cust-search"
                type="text"
                placeholder="খদ্দের খুঁজুন (নাম / ফোন)..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full h-10 px-3 rounded-xl border border-border-default bg-surface-subtle/50 focus:bg-surface-card text-xs font-medium text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep transition-all"
              />
            </div>

            {showDropdown && (
              <div className="absolute z-20 left-0 right-0 top-16 surface-glass-popover border border-border-default rounded-xl max-h-48 overflow-y-auto divide-y divide-border-subtle shadow-xl">
                {(() => {
                  const normalizedDueSearch = normalizePhone(customerSearch);
                  return customerList
                    .filter((c) =>
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      (c.phone &&
                        (c.phone.includes(customerSearch) ||
                          (normalizedDueSearch && c.phone.includes(normalizedDueSearch))))
                    )
                    .map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setCustomerSearch(cust.name);
                        setShowDropdown(false);
                      }}
                      className="w-full p-2.5 text-left hover:bg-surface-subtle flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-bold text-ink-primary">{cust.name}</div>
                        <div className="text-2xs text-ink-secondary font-mono">{cust.phone || 'ফোন নেই'}</div>
                      </div>
                      <span className={`font-mono tabular-nums text-xs font-bold ${cust.currentDue > 0 ? 'text-due-text' : 'text-cash-text'}`}>
                        {formatCurrency(cust.currentDue, false)}
                      </span>
                    </button>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Selected Customer Current Due Card */}
          {selectedCustomer && (
            <div className="p-3 rounded-xl bg-surface-subtle/70 border border-border-subtle flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-ink-primary">{selectedCustomer.name}</p>
                <p className="text-2xs text-ink-secondary font-mono">{selectedCustomer.phone || 'ফোন নেই'}</p>
              </div>
              <div className="text-right">
                <span className="text-2xs text-ink-secondary block">বর্তমান বকেয়া:</span>
                <span className="text-sm font-black text-due-text font-mono tabular-nums">
                  {formatCurrency(selectedCustomer.currentDue, false)}
                </span>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="due-pay-amount" className="font-bold text-ink-primary flex items-center gap-1.5">
                <Coins size={13} weight="bold" className="text-cash-text" />
                <span>জমা গ্রহণের পরিমাণ <span className="text-due-text">*</span></span>
              </label>
              {currentDue > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentDue.toString())}
                  className="text-2xs font-bold text-brand-deep hover:underline cursor-pointer"
                >
                  পুরো বকেয়া পরিশোধ
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-ink-secondary font-mono">৳</span>
              <input
                ref={amountInputRef}
                id="due-pay-amount"
                type="number"
                min="1"
                step="any"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 pl-8 pr-3 rounded-xl border-2 border-brand-deep bg-surface-card text-lg font-black font-mono tabular-nums text-ink-primary focus:outline-hidden"
              />
            </div>

            {/* Fast Presets */}
            <div className="flex gap-1.5 pt-1">
              {[500, 1000, 2000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="flex-1 py-1 rounded-lg border border-border-default bg-surface-card hover:bg-brand-soft text-2xs font-bold font-mono text-ink-body cursor-pointer transition-colors"
                >
                  +{formatNumber(preset)}৳
                </button>
              ))}
            </div>
          </div>

          {/* Remaining Balance Preview */}
          {selectedCustomer && numAmount > 0 && (
            <div className="p-2.5 rounded-xl bg-cash-bg/70 border border-cash-border flex items-center justify-between text-xs animate-in fade-in">
              <span className="font-medium text-ink-body">জমার পর অবশিষ্ট বকেয়া:</span>
              <span className="font-black text-sm font-mono tabular-nums text-ink-primary">
                {formatCurrency(remainingDueAfter, false)}
              </span>
            </div>
          )}

          {/* Note Input */}
          <div className="space-y-1">
            <label htmlFor="due-pay-note" className="text-2xs font-semibold text-ink-secondary">
              মন্তব্য (ঐচ্ছিক):
            </label>
            <input
              id="due-pay-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="মন্তব্য..."
              className="w-full h-8 px-2.5 rounded-lg border border-border-subtle bg-surface-subtle/40 text-xs text-ink-body placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep"
            />
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitting || !selectedCustomer || numAmount <= 0}
              className="flex-2 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={16} weight="bold" />
                  <span>বকেয়া জমা নিশ্চিত করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
