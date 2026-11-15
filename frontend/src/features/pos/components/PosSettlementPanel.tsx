'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  CheckCircle,
  Warning,
  Coins,
  Check,
  Tag,
  UserPlus,
  Receipt,
  ArrowBendDownRight,
} from '@phosphor-icons/react';
import { usePosStore } from '../usePosStore';
import { posService } from '../pos.service';
import { CustomerOption } from '../pos.types';
import { KhataBalanceBadge } from '@/components/ui/KhataBalanceBadge';
import { formatCurrency, formatNumber } from '@/lib/decimal';
import { normalizePhone } from '@/lib/phone';
import { PosQuickCustomerModal } from './PosQuickCustomerModal';
import { PosDueCollectionModal } from './PosDueCollectionModal';

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
    overpaymentAllocation,
    setOverpaymentAllocation,
    getDuePaymentAmount,
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

  // Modals
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [showDueCollectionModal, setShowDueCollectionModal] = useState(false);
  const [dueCollectionSuccessMsg, setDueCollectionSuccessMsg] = useState<string | null>(null);

  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const loadCustomers = () => {
    posService.searchCustomers().then(setCustomerList).catch(console.error);
  };

  useEffect(() => {
    loadCustomers();
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
  const duePaymentAmount = getDuePaymentAmount();
  const isCartEmpty = cart.length === 0;

  // Validation: Walk-in customers cannot have due
  const isWalkInDue = !selectedCustomer && paidAmount < grandTotal;
  const isHighDueCustomer = !!(selectedCustomer && selectedCustomer.currentDue >= 5000);
  const excessPaid = paidAmount > grandTotal ? paidAmount - grandTotal : 0;

  // Goodwill Round-Off calculation (e.g. 123 -> 3, 157 -> 2 or 7)
  const roundOffAmount = grandTotal > 0 ? grandTotal % 10 : 0;

  const handleFullCash = () => {
    setPaidAmount(grandTotal);
  };

  const handleFullDue = () => {
    setPaidAmount(0);
  };

  const handleApplyRoundOff = () => {
    if (roundOffAmount > 0) {
      setDiscount(discount + roundOffAmount);
    }
  };

  const handleCustomerCreated = (newCustomer: CustomerOption) => {
    setCustomerList((prev) => [newCustomer, ...prev]);
    setSelectedCustomer(newCustomer);
    setShowCustomerDropdown(false);
    setCustomerSearch('');
  };

  const handleDueCollected = (updatedCustomer: CustomerOption, amountPaid: number) => {
    setCustomerList((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
    if (selectedCustomer?.id === updatedCustomer.id) {
      setSelectedCustomer(updatedCustomer);
    }
    setDueCollectionSuccessMsg(
      `${updatedCustomer.name}-এর থেকে ৳${formatNumber(amountPaid)} বকেয়া জমা গ্রহণ সফল হয়েছে!`
    );
    setTimeout(() => setDueCollectionSuccessMsg(null), 5000);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCartEmpty || isSubmitting || isWalkInDue) return;

    try {
      const invoice = await submitSale();
      onSaleSuccess(invoice.id);
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  const normalizedCustomerSearch = normalizePhone(customerSearch);
  const filteredCustomers = customerList.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone &&
        (c.phone.includes(customerSearch) ||
          (normalizedCustomerSearch && c.phone.includes(normalizedCustomerSearch))))
  );

  return (
    <>
      <form
        id="pos-settlement-form"
        ref={formRef}
        onSubmit={handleCheckout}
        className="bg-surface-card rounded-2xl border border-border-default shadow-xs p-4 flex flex-col justify-between space-y-3.5"
      >
        <div className="space-y-3">
          {/* Due Collection Success Notice */}
          {dueCollectionSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-cash-bg border border-cash-border text-cash-text text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle size={16} weight="bold" className="shrink-0" />
              <span>{dueCollectionSuccessMsg}</span>
            </div>
          )}

          {/* 1. Customer Selector Pill */}
          <div ref={customerDropdownRef} className="relative">
            {selectedCustomer ? (
              <div className="p-2.5 bg-brand-soft/70 border border-brand-light/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-brand-deep text-white flex items-center justify-center shrink-0">
                      <User size={16} weight="bold" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-ink-primary text-xs truncate">
                        {selectedCustomer.name}
                      </h4>
                      <p className="text-2xs text-ink-secondary font-mono">
                        {selectedCustomer.phone || 'ফোন নেই'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <KhataBalanceBadge amount={selectedCustomer.currentDue} size="sm" />
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="p-1 rounded-md text-ink-secondary hover:text-due-text hover:bg-due-bg/50 transition-colors cursor-pointer"
                      title="নগদ খদ্দেরে ফিরুন"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* High Due Risk Alert */}
                {isHighDueCustomer && (
                  <div className="p-1.5 rounded-lg bg-due-bg/90 border border-due-border text-due-text text-2xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <Warning size={14} weight="bold" className="shrink-0" />
                    <span>
                      সতর্কবার্তা: পূর্বের বকেয়া {formatCurrency(selectedCustomer.currentDue, false)} (সীমা অতিক্রান্ত)
                    </span>
                  </div>
                )}

                {/* Direct Due Collection Shortcut */}
                {selectedCustomer.currentDue > 0 && (
                  <div className="pt-1 border-t border-brand-light/60 flex items-center justify-between text-2xs">
                    <span className="text-ink-secondary">সরাসরি বকেয়া জমা নিতে চান?</span>
                    <button
                      type="button"
                      onClick={() => setShowDueCollectionModal(true)}
                      className="font-bold text-brand-deep hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Coins size={12} weight="bold" />
                      <span>বকেয়া জমা [রসিদ]</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <User
                    size={15}
                    weight="bold"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary pointer-events-none"
                  />
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
                    className="w-full h-9.5 pl-9 pr-20 rounded-xl border border-border-default bg-surface-subtle/50 focus:bg-surface-card text-xs font-medium text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:border-brand-deep transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickCustomerModal(true);
                      setShowCustomerDropdown(false);
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-brand-soft hover:bg-brand-deep hover:text-white text-brand-deep text-2xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="নতুন খাতা খুলুন"
                  >
                    <UserPlus size={12} weight="bold" />
                    <span>+ খাতা</span>
                  </button>
                </div>

                {showCustomerDropdown && (
                  <div className="absolute z-30 left-0 right-0 top-11 surface-glass-popover border border-border-default rounded-xl max-h-56 overflow-y-auto divide-y divide-border-subtle animate-in fade-in zoom-in-98 duration-100 shadow-xl">
                    {/* Top Action: New Customer */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickCustomerModal(true);
                        setShowCustomerDropdown(false);
                      }}
                      className="w-full p-2.5 text-left bg-brand-soft/70 hover:bg-brand-soft text-brand-deep flex items-center justify-between text-xs font-bold cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <UserPlus size={14} weight="bold" />
                        <span>+ নতুন খদ্দের খাতা খুলুন</span>
                      </span>
                      <span className="text-2xs font-normal">২ সেকেন্ডে তৈরি</span>
                    </button>

                    {/* Default: Walk-in Cash */}
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

                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
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
                            <div className="text-2xs text-ink-secondary font-mono">
                              {customer.phone || 'ফোন নেই'}
                            </div>
                          </div>
                          <KhataBalanceBadge amount={customer.currentDue} size="sm" />
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center space-y-2">
                        <p className="text-xs text-ink-secondary">
                          &quot;{customerSearch}&quot; নামে কোনো খাতা নেই
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuickCustomerModal(true);
                            setShowCustomerDropdown(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-brand-deep hover:bg-brand-hover text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <UserPlus size={14} weight="bold" />
                          <span>&quot;{customerSearch}&quot; নামে খাতা খুলুন</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Grand Total & Discount Header */}
          <div className="p-3 bg-surface-subtle/40 rounded-xl border border-border-subtle space-y-2">
            {/* Discount Field with 1-Click Goodwill Round-off */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-ink-secondary font-medium">বিশেষ ছাড় (-):</span>
                {roundOffAmount > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyRoundOff}
                    className="px-1.5 py-0.5 rounded-md bg-brand-soft text-brand-deep hover:bg-brand-deep hover:text-white text-2xs font-bold transition-all cursor-pointer"
                    title={`সর্বশেষ ${roundOffAmount} টাকা রাউন্ড-অফ ছাড় দিন`}
                  >
                    খাতির ছাড় (-{roundOffAmount}৳)
                  </button>
                )}
              </div>

              <div className="relative w-24">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-secondary text-xs font-mono">
                  ৳
                </span>
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
              <label
                htmlFor="pos-paid-amount-input"
                className="font-bold text-ink-body flex items-center gap-1.5"
              >
                <Coins size={14} weight="bold" className="text-brand-deep" />
                <span>নগদ গ্রহণ [F4]:</span>
              </label>
              <div className="flex items-center gap-2">
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={handleFullDue}
                    className="text-2xs font-bold text-due-text hover:underline cursor-pointer"
                  >
                    পুরো বাকি (০৳)
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleFullCash}
                  className="text-2xs font-bold text-brand-deep hover:underline cursor-pointer"
                >
                  পুরো পরিশোধ
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-ink-secondary font-mono">
                ৳
              </span>
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

          {/* 4. Smart Overpayment Allocation Selector (When Paid > GrandTotal and Customer is Selected) */}
          {excessPaid > 0 && selectedCustomer && (
            <div className="p-2.5 rounded-xl bg-brand-soft/60 border border-brand-light/90 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-2xs font-bold text-ink-primary">
                <span>অতিরিক্ত নগদ: {formatCurrency(excessPaid, false)}</span>
                <span className="text-ink-secondary font-mono">কোথায় সমন্বয় হবে?</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setOverpaymentAllocation('APPLY_TO_DUE')}
                  className={`py-1.5 px-2 rounded-lg text-2xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    overpaymentAllocation === 'APPLY_TO_DUE'
                      ? 'bg-brand-deep text-white shadow-xs'
                      : 'bg-surface-card text-ink-secondary border border-border-default hover:bg-surface-subtle'
                  }`}
                >
                  <Check size={12} weight="bold" />
                  <span>পূর্বের বকেয়া কর্তন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOverpaymentAllocation('RETURN_CHANGE')}
                  className={`py-1.5 px-2 rounded-lg text-2xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    overpaymentAllocation === 'RETURN_CHANGE'
                      ? 'bg-brand-deep text-white shadow-xs'
                      : 'bg-surface-card text-ink-secondary border border-border-default hover:bg-surface-subtle'
                  }`}
                >
                  <span>কাস্টমারকে ফেরত</span>
                </button>
              </div>

              <p className="text-2xs text-ink-secondary leading-tight">
                {overpaymentAllocation === 'APPLY_TO_DUE' ? (
                  <span className="text-emerald-700 font-medium">
                    ↳ আজকের বিল {formatCurrency(grandTotal, false)} শোধ + {selectedCustomer.currentDue > 0 ? `পূর্বের বকেয়া থেকে ${formatCurrency(excessPaid, false)} কর্তন হবে।` : `খাতায় ${formatCurrency(excessPaid, false)} অগ্রিম জমা হবে।`}
                  </span>
                ) : (
                  <span className="text-amber-800 font-medium">
                    ↳ কাস্টমারকে {formatCurrency(excessPaid, false)} নগদ ফেরত দিন। বিলে শুধু {formatCurrency(grandTotal, false)} জমা হবে।
                  </span>
                )}
              </p>
            </div>
          )}

          {/* 5. Live Change or Due Banner */}
          {changeAmount > 0 ? (
            <div className="p-2.5 rounded-xl bg-cash-bg border border-cash-border flex items-center justify-between text-xs">
              <span className="font-semibold text-cash-text">কাস্টমারকে ফেরত দিন:</span>
              <span className="font-black text-sm font-mono tabular-nums text-cash-text">
                {formatCurrency(changeAmount, false)}
              </span>
            </div>
          ) : duePaymentAmount > 0 ? (
            <div className="p-2.5 rounded-xl bg-cash-bg border border-cash-border flex items-center justify-between text-xs">
              <span className="font-semibold text-cash-text">পূর্বের বকেয়া আদায়:</span>
              <span className="font-black text-sm font-mono tabular-nums text-cash-text">
                {formatCurrency(duePaymentAmount, false)}
              </span>
            </div>
          ) : invoiceDue > 0 ? (
            <div className="p-2.5 rounded-xl bg-due-bg border border-due-border flex items-center justify-between text-xs">
              <span className="font-semibold text-due-text">এই মেমোতে বকেয়া থাকবে:</span>
              <span className="font-black text-sm font-mono tabular-nums text-due-text">
                {formatCurrency(invoiceDue, false)}
              </span>
            </div>
          ) : null}

          {/* Khata Balance Summary if customer is selected */}
          {selectedCustomer && (
            <div className="p-2.5 rounded-xl bg-surface-subtle/50 border border-border-subtle flex justify-between items-center text-xs">
              <span className="text-ink-secondary">খাতার নতুন জের (মোট বাকি):</span>
              <span
                className={`font-mono tabular-nums font-bold ${
                  closingDue > 0 ? 'text-due-text' : 'text-cash-text'
                }`}
              >
                {formatCurrency(closingDue, false)}
              </span>
            </div>
          )}

          {/* Walk-in Due Prevention Warning */}
          {isWalkInDue && (
            <div className="p-2.5 rounded-xl bg-due-bg border border-due-border text-due-text text-2xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Warning size={16} weight="bold" className="shrink-0" />
              <span>
                ওয়াক-ইন খদ্দেরকে বাকি দেওয়া যাবে না। খাতা নির্বাচন করুন অথবা নতুন খাতা খুলুন।
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

        {/* 6. Authoritative Checkout Button & Standalone Due Collection Trigger */}
        <div className="pt-1 space-y-2">
          <button
            type="submit"
            disabled={isCartEmpty || isSubmitting || isWalkInDue}
            className={`w-full h-12 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] ${
              isCartEmpty || isSubmitting || isWalkInDue
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

          {/* Quick Counter Due Collection when cart is empty */}
          {isCartEmpty && (
            <button
              type="button"
              onClick={() => setShowDueCollectionModal(true)}
              className="w-full h-9 rounded-xl border border-cash-border bg-cash-bg hover:bg-cash-border/30 text-cash-text text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Coins size={15} weight="bold" />
              <span>কাউন্টার বকেয়া জমা গ্রহণ (রসিদ প্রিন্ট)</span>
            </button>
          )}
        </div>
      </form>

      {/* Quick Customer Add Modal */}
      <PosQuickCustomerModal
        isOpen={showQuickCustomerModal}
        onClose={() => setShowQuickCustomerModal(false)}
        onCustomerCreated={handleCustomerCreated}
        initialSearchText={customerSearch}
      />

      {/* Standalone Due Collection Modal */}
      <PosDueCollectionModal
        isOpen={showDueCollectionModal}
        onClose={() => setShowDueCollectionModal(false)}
        customerList={customerList}
        preselectedCustomer={selectedCustomer}
        onPaymentSuccess={handleDueCollected}
      />
    </>
  );
}

