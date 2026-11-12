'use client';

import React, { useState, useEffect } from 'react';
import { User, CheckCircle, Warning, Coins } from '@phosphor-icons/react';
import { usePosStore } from '../usePosStore';
import { posService } from '../pos.service';
import { CustomerOption } from '../pos.types';
import { KhataBalanceBadge } from '@/components/ui/KhataBalanceBadge';
import { formatCurrency, formatNumber } from '@/lib/decimal';

interface PosSettlementPanelProps {
  onSaleSuccess: (saleId: string) => void;
}

export function PosSettlementPanel({ onSaleSuccess }: PosSettlementPanelProps) {
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

  useEffect(() => {
    posService.searchCustomers().then(setCustomerList).catch(console.error);
  }, []);

  const subTotal = getSubTotal();
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
      onSubmit={handleCheckout}
      className="bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-3.5 flex flex-col justify-between space-y-3"
    >
      <div className="space-y-3">
        {/* 1. Customer Selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="pos-customer-search" className="text-xs font-bold text-ink-body flex items-center gap-1.5">
              <User size={14} weight="bold" className="text-brand-deep" />
              <span>কাস্টমার ও খদ্দের</span>
            </label>
            {selectedCustomer && (
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-xs text-due-text hover:underline font-semibold cursor-pointer"
              >
                নগদ খদ্দেরে ফিরুন
              </button>
            )}
          </div>

          {selectedCustomer ? (
            <div className="p-2.5 bg-surface-subtle border border-border-default rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-ink-primary text-xs">{selectedCustomer.name}</h4>
                <p className="text-xs text-ink-secondary font-mono tabular-nums">{selectedCustomer.phone || 'ফোন নম্বর নেই'}</p>
              </div>
              <KhataBalanceBadge amount={selectedCustomer.currentDue} size="sm" />
            </div>
          ) : (
            <div className="relative">
              <input
                id="pos-customer-search"
                type="text"
                placeholder="কাস্টমার (নাম/ফোন)..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-card text-xs font-medium text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep transition-[border-color,box-shadow] duration-150"
              />

              {showCustomerDropdown && (
                <div className="absolute z-20 left-0 right-0 top-10 bg-surface-card border border-border-default rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-border-subtle animate-in fade-in zoom-in-98 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerDropdown(false);
                      setCustomerSearch('');
                    }}
                    className="w-full p-2.5 text-left hover:bg-surface-subtle flex items-center justify-between text-xs cursor-pointer font-semibold text-ink-body"
                  >
                    <span>নগদ খদ্দের</span>
                    <span className="text-xs text-ink-secondary font-normal">বাকি খাতা নেই</span>
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
                          <div className="font-semibold text-ink-primary">{customer.name}</div>
                          <div className="text-xs text-ink-secondary font-mono tabular-nums">{customer.phone}</div>
                        </div>
                        <KhataBalanceBadge amount={customer.currentDue} size="sm" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Billing Breakdown & Discount */}
        <div className="p-3 bg-surface-subtle/70 border border-border-default rounded-lg space-y-2 text-xs">
          <div className="flex justify-between text-ink-secondary">
            <span>আইটেম মোট:</span>
            <span className="font-semibold text-ink-primary font-mono tabular-nums">
              {formatCurrency(subTotal, false)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-ink-secondary">বিশেষ ছাড় (-):</span>
            <div className="relative w-24">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-secondary text-xs font-mono">৳</span>
              <input
                type="number"
                aria-label="বিশেষ ছাড়"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full h-7.5 pl-5 pr-2 rounded-md border border-border-strong bg-surface-card text-xs font-semibold text-right font-mono tabular-nums text-ink-primary focus:outline-hidden focus:border-brand-deep"
              />
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-1.5 border-t border-border-default">
            <span className="font-bold text-ink-primary text-xs">সর্বমোট বিল:</span>
            <span className="font-bold text-lg text-brand-deep font-mono tabular-nums">
              {formatCurrency(grandTotal, false)}
            </span>
          </div>
        </div>

        {/* 3. Cash Payment Received & Change */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="pos-paid-amount-input" className="text-xs font-bold text-ink-body flex items-center gap-1.5">
              <Coins size={14} weight="bold" className="text-brand-deep" />
              <span>নগদ গ্রহণ [F4]:</span>
            </label>
            <button
              type="button"
              onClick={handleFullCash}
              className="text-xs font-semibold text-brand-deep hover:underline cursor-pointer transition-colors"
            >
              পুরো বিল পরিশোধ
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-ink-secondary font-mono">৳</span>
            <input
              id="pos-paid-amount-input"
              type="number"
              min="0"
              step="any"
              value={paidAmount || ''}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full h-11 pl-7 pr-3 rounded-lg border-2 border-brand-deep bg-surface-card text-lg font-bold font-mono tabular-nums text-ink-primary focus:outline-hidden transition-[border-color,box-shadow]"
            />
          </div>

          {/* Quick Cash Buttons */}
          <div className="flex gap-1.5 pt-0.5">
            {[100, 500, 1000].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setPaidAmount(paidAmount + quick)}
                className="flex-1 py-1.5 rounded-md border border-border-default bg-surface-card hover:bg-brand-soft hover:text-brand-deep text-xs font-semibold font-mono tabular-nums text-ink-body transition-[background-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
              >
                +{formatNumber(quick)}৳
              </button>
            ))}
          </div>
        </div>

        {/* 4. Live Due & Change Calculations */}
        <div className="p-2.5 bg-surface-subtle/70 border border-border-default rounded-lg space-y-1.5 text-xs">
          {changeAmount > 0 && (
            <div className="flex justify-between items-center text-cash-text font-semibold bg-cash-bg border border-cash-border px-2.5 py-1.5 rounded-md">
              <span>কাস্টমারকে ফেরত দিন:</span>
              <span className="text-xs font-bold font-mono tabular-nums">
                {formatCurrency(changeAmount, false)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-ink-secondary">
            <span>এই মেমোর বকেয়া:</span>
            <span className={`font-semibold font-mono tabular-nums ${invoiceDue > 0 ? 'text-due-text' : 'text-ink-primary'}`}>
              {formatCurrency(invoiceDue, false)}
            </span>
          </div>

          {selectedCustomer && (
            <div className="pt-1.5 border-t border-border-default space-y-1">
              <div className="flex justify-between text-xs text-ink-secondary">
                <span>পূর্বের বকেয়া:</span>
                <span className="font-mono tabular-nums font-medium">{formatCurrency(selectedCustomer.currentDue, false)}</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-ink-primary text-xs bg-surface-subtle px-2 py-1 rounded">
                <span>খাতার নতুন মোট বকেয়া:</span>
                <span className={`font-mono tabular-nums font-bold ${closingDue > 0 ? 'text-due-text' : 'text-cash-text'}`}>
                  {formatCurrency(closingDue, false)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Note / Memo */}
        <div>
          <input
            type="text"
            aria-label="বিক্রয় নোট"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="নোট (ঐচ্ছিক)..."
            className="w-full h-8.5 px-2.5 rounded-lg border border-border-strong bg-surface-card text-xs text-ink-body placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep"
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-due-bg border border-due-border text-due-text text-xs font-medium flex items-center gap-1.5">
            <Warning size={14} weight="bold" className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 5. Submit Sale Commit Button */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isCartEmpty || isSubmitting}
          className={`w-full h-11 rounded-lg font-semibold text-xs sm:text-sm transition-[background-color,transform] duration-150 flex items-center justify-center gap-2 shadow-[0_1px_2px_rgba(30,74,122,0.16)] active:scale-[0.98] cursor-pointer ${
            isCartEmpty || isSubmitting
              ? 'bg-surface-subtle text-ink-muted border border-border-default cursor-not-allowed'
              : 'bg-brand-deep hover:bg-brand-hover text-white'
          }`}
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={17} weight="bold" />
              <span>বিক্রি সম্পন্ন ও রসিদ প্রিন্ট [Ctrl+Enter]</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
