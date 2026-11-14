'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, CheckCircle, Warning, Coins, Check, Tag } from '@phosphor-icons/react';
import { usePosStore } from '../usePosStore';
import { posService } from '../pos.service';
import { CustomerOption } from '../pos.types';
import { KhataBalanceBadge } from '@/components/ui/KhataBalanceBadge';
import { formatCurrency, formatNumber } from '@/lib/decimal';

interface PosSettlementPanelProps {
  onSaleSuccess: (saleId: string) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function PosSettlementPanel({ onSaleSuccess, formRef }: PosSettlementPanelProps) {
  const {
    cart,
    selectedCustomer,
    setSelectedCustomer,
    discount,
    setDiscount,
    paidAmount,
    setPaidAmount,
    note,
    setNote,
    getSubTotal,
    getGrandTotal,
    getInvoiceDue,
    getClosingCustomerDue,
    getChangeAmount,
    submitSale,
    isSubmitting,
    error,
  } = usePosStore();

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerList, setCustomerList] = useState<CustomerOption[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const customerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    posService.searchCustomers().then(setCustomerList).catch(console.error);
  }, []);

  // Click outside listener to dismiss customer popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
    };

    if (showCustomerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomerDropdown]);

  const grandTotal = getGrandTotal();
  const invoiceDue = getInvoiceDue();
  const closingDue = getClosingCustomerDue();
  const changeAmount = getChangeAmount();
  const isCartEmpty = cart.length === 0;

  const handleFullCash = () => {
    setPaidAmount(grandTotal);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCartEmpty || isSubmitting) return;

    try {
      const invoice = await submitSale();
      onSaleSuccess(invoice.id);
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  return (
    <form
      id="pos-settlement-form"
      ref={formRef}
      onSubmit={handleCheckout}
      className="bg-surface-card rounded-2xl border border-border-default shadow-xs p-4 flex flex-col justify-between space-y-3.5"
    >
      <div className="space-y-3">
        {/* 1. Customer Selector Pill */}
        <div ref={customerDropdownRef} className="relative">
          {selectedCustomer ? (
            <div className="p-2.5 bg-brand-soft/70 border border-brand-light/80 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-brand-deep text-white flex items-center justify-center shrink-0">
                  <User size={16} weight="bold" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-ink-primary text-xs truncate">{selectedCustomer.name}</h4>
                  <p className="text-2xs text-ink-secondary font-mono">{selectedCustomer.phone || 'ফোন নেই'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <KhataBalanceBadge amount={selectedCustomer.currentDue} size="sm" />
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 rounded-md text-ink-secondary hover:text-due-text hover:bg-due-bg/50 transition-colors"
                  title="নগদ খদ্দেরে ফিরুন"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative">
                <User size={15} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary pointer-events-none" />
                <input
                  id="pos-customer-search"
                  type="text"
                  placeholder="খদ্দের নির্বাচন করুন (নাম / মোবাইল নম্বর)..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-border-default bg-surface-subtle/50 focus:bg-surface-card text-xs font-medium text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep transition-all"
                />
              </div>

              {showCustomerDropdown && (
                <div className="absolute z-30 left-0 right-0 top-11 surface-glass-popover border border-border-default rounded-xl max-h-52 overflow-y-auto divide-y divide-border-subtle animate-in fade-in zoom-in-98 duration-100 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerDropdown(false);
                      setCustomerSearch('');
                    }}
                    className="w-full p-2.5 text-left hover:bg-surface-subtle flex items-center justify-between text-xs cursor-pointer font-bold text-ink-primary"
                  >
                    <span>নগদ কাস্টমার</span>
                    <span className="text-2xs text-ink-secondary font-normal">ওয়াক-ইন</span>
                  </button>

                  {customerList
                    .filter((c) =>
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      (c.phone && c.phone.includes(customerSearch))
                    )
                    .map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerDropdown(false);
                          setCustomerSearch('');
                        }}
                        className="w-full p-2.5 text-left hover:bg-surface-subtle flex items-center justify-between text-xs cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-ink-primary">{customer.name}</div>
                          <div className="text-2xs text-ink-secondary font-mono">{customer.phone}</div>
                        </div>
                        <KhataBalanceBadge amount={customer.currentDue} size="sm" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Grand Total & Discount Header */}
        <div className="p-3 bg-surface-subtle/40 rounded-xl border border-border-subtle space-y-2">
          {/* Discount Field */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-secondary font-medium">বিশেষ ছাড় (-):</span>
            <div className="relative w-24">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-secondary text-xs font-mono">৳</span>
              <input
                type="number"
                aria-label="বিশেষ ছাড়"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full h-7 pl-6 pr-2 rounded-lg border border-border-strong bg-surface-card text-xs font-bold text-right font-mono tabular-nums text-ink-primary focus:outline-hidden focus:border-brand-deep"
              />
            </div>
          </div>

          {/* Big Authoritative Grand Total */}
          <div className="flex justify-between items-baseline pt-1.5 border-t border-border-subtle">
            <span className="font-bold text-ink-primary text-xs sm:text-sm">মোট বিল:</span>
            <span className="font-black text-xl sm:text-2xl text-brand-deep font-mono tabular-nums">
              {formatCurrency(grandTotal, false)}
            </span>
          </div>
        </div>

        {/* 3. Cash Payment & Note Presets */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="pos-paid-amount-input" className="font-bold text-ink-body flex items-center gap-1.5">
              <Coins size={14} weight="bold" className="text-brand-deep" />
              <span>নগদ গ্রহণ [F4]:</span>
            </label>
            <button
              type="button"
              onClick={handleFullCash}
              className="text-2xs font-bold text-brand-deep hover:underline cursor-pointer transition-colors"
            >
              পুরো বিল পরিশোধ
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-ink-secondary font-mono">৳</span>
            <input
              id="pos-paid-amount-input"
              type="number"
              min="0"
              step="any"
              value={paidAmount || ''}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full h-11 pl-8 pr-3 rounded-xl border-2 border-brand-deep bg-surface-card text-lg font-black font-mono tabular-nums text-ink-primary focus:outline-hidden shadow-2xs"
            />
          </div>

          {/* Fast Cash Note Buttons */}
          <div className="flex gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={handleFullCash}
              className="flex-1 py-1.5 rounded-lg border border-brand-light bg-brand-soft hover:bg-brand-deep hover:text-white text-brand-deep text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              পুরো বিল
            </button>
            {[100, 500, 1000].map((noteVal) => (
              <button
                key={noteVal}
                type="button"
                onClick={() => setPaidAmount(noteVal)}
                className="flex-1 py-1.5 rounded-lg border border-border-default bg-surface-card hover:bg-brand-soft hover:text-brand-deep text-xs font-bold font-mono tabular-nums text-ink-body transition-all cursor-pointer shadow-2xs"
                title={`সরাসরি ${formatNumber(noteVal)} টাকার নোট সেট করুন`}
              >
                {formatNumber(noteVal)}৳
              </button>
            ))}
          </div>
        </div>

        {/* 4. Live Change or Due Banner */}
        {changeAmount > 0 ? (
          <div className="p-2.5 rounded-xl bg-cash-bg border border-cash-border flex items-center justify-between text-xs">
            <span className="font-semibold text-cash-text">কাস্টমারকে ফেরত দিন:</span>
            <span className="font-black text-sm font-mono tabular-nums text-cash-text">
              {formatCurrency(changeAmount, false)}
            </span>
          </div>
        ) : invoiceDue > 0 ? (
          <div className="p-2.5 rounded-xl bg-due-bg border border-due-border flex items-center justify-between text-xs">
            <span className="font-semibold text-due-text">বকেয়া থাকবে:</span>
            <span className="font-black text-sm font-mono tabular-nums text-due-text">
              {formatCurrency(invoiceDue, false)}
            </span>
          </div>
        ) : null}

        {/* Khata Balance Summary if customer is selected */}
        {selectedCustomer && (
          <div className="p-2.5 rounded-xl bg-surface-subtle/50 border border-border-subtle flex justify-between items-center text-xs">
            <span className="text-ink-secondary">খাতার নতুন জের:</span>
            <span className={`font-mono tabular-nums font-bold ${closingDue > 0 ? 'text-due-text' : 'text-cash-text'}`}>
              {formatCurrency(closingDue, false)}
            </span>
          </div>
        )}

        {/* Optional Note */}
        <div>
          <input
            type="text"
            aria-label="বিক্রয় নোট"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="মেমো নোট বা বিশেষ মন্তব্য (ঐচ্ছিক)..."
            className="w-full h-8 px-2.5 rounded-lg border border-border-subtle bg-surface-subtle/40 text-xs text-ink-body placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep"
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-due-bg border border-due-border text-due-text text-xs font-semibold flex items-center gap-1.5">
            <Warning size={14} weight="bold" className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 5. Authoritative Square POS Checkout Button */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isCartEmpty || isSubmitting}
          className={`w-full h-12 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] ${
            isCartEmpty || isSubmitting
              ? 'bg-surface-subtle text-ink-muted border border-border-default cursor-not-allowed opacity-60'
              : 'bg-brand-deep hover:bg-brand-hover text-white shadow-brand-deep/20'
          }`}
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={19} weight="bold" />
              <span>বিক্রি সম্পন্ন ও রসিদ প্রিন্ট [Ctrl+Enter]</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
