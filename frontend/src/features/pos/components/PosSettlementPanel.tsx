'use client';

import React, { useState, useEffect } from 'react';
import { User, CheckCircle, Warning, Money } from '@phosphor-icons/react';
import { usePosStore } from '../usePosStore';
import { posService } from '../pos.service';
import { CustomerOption } from '../pos.types';
import { KhataBalanceBadge } from '@/components/ui/KhataBalanceBadge';
import { formatCurrency } from '@/lib/decimal';

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
      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-4"
    >
      <div className="space-y-4">
        {/* 1. Customer Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User size={15} weight="bold" className="text-slate-500" />
              কাস্টমার / খদ্দের
            </span>
            {selectedCustomer && (
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-[10px] text-rose-600 hover:underline font-bold"
              >
                নগদ খদ্দেরে ফিরুন
              </button>
            )}
          </label>

          {selectedCustomer ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedCustomer.name}</h4>
                <p className="text-[11px] text-slate-500">{selectedCustomer.phone || 'ফোন নম্বর নেই'}</p>
              </div>
              <KhataBalanceBadge amount={selectedCustomer.currentDue} size="sm" />
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="নগদ খদ্দের (কাস্টমার খুঁজতে নাম বা ফোন লিখুন)..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600"
              />

              {showCustomerDropdown && (
                <div className="absolute z-20 left-0 right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerDropdown(false);
                      setCustomerSearch('');
                    }}
                    className="w-full p-2.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer font-bold text-slate-700"
                  >
                    <span>নগদ খদ্দের (Walk-in Cash)</span>
                    <span className="text-[10px] text-slate-400">বাকি সংরক্ষণ নেই</span>
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
                        className="w-full p-2.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{customer.name}</div>
                          <div className="text-[10px] text-slate-400">{customer.phone}</div>
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
        <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>আইটেম মোট:</span>
            <span className="font-bold text-slate-900 tabular-numbers">
              {formatCurrency(subTotal, false)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-600">বিশেষ ছাড় (-):</span>
            <div className="relative w-28">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">৳</span>
              <input
                type="number"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full h-8 pl-6 pr-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-right tabular-numbers text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-900 text-sm">সর্বমোট বিল:</span>
            <span className="font-black text-xl text-slate-900 tabular-numbers">
              {formatCurrency(grandTotal, false)}
            </span>
          </div>
        </div>

        {/* 3. Cash Payment Received & Change */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Money size={16} weight="bold" className="text-emerald-600" />
              নগদ গ্রহণ (Cash Paid) [F4]:
            </label>
            <button
              type="button"
              onClick={handleFullCash}
              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              পুরো বিল পরিশোধ
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-500">৳</span>
            <input
              id="pos-paid-amount-input"
              type="number"
              min="0"
              step="any"
              value={paidAmount || ''}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full h-12 pl-8 pr-3 rounded-xl border-2 border-emerald-600 bg-white text-xl font-black text-slate-900 tabular-numbers focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Quick Cash Buttons */}
          <div className="flex gap-1.5 pt-1">
            {[100, 500, 1000].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setPaidAmount(paidAmount + quick)}
                className="flex-1 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer"
              >
                +{quick}৳
              </button>
            ))}
          </div>
        </div>

        {/* 4. Live Due & Change Calculations */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
          {changeAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-800 font-bold bg-emerald-100/70 p-2 rounded-lg">
              <span>কাস্টমারকে ফেরত দিন:</span>
              <span className="text-sm font-black tabular-numbers">
                {formatCurrency(changeAmount, false)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>এই মেমোর বকেয়া:</span>
            <span className="font-bold text-rose-700 tabular-numbers">
              {formatCurrency(invoiceDue, false)}
            </span>
          </div>

          {selectedCustomer && (
            <div className="pt-2 border-t border-slate-200/80 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>পূর্বের বকেয়া:</span>
                <span className="tabular-numbers">{formatCurrency(selectedCustomer.currentDue, false)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-slate-900 text-xs bg-slate-100 p-1.5 rounded">
                <span>খাতার নতুন মোট বকেয়া:</span>
                <span className={`tabular-numbers ${closingDue > 0 ? 'text-rose-700 font-black' : 'text-emerald-700'}`}>
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
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="অতিরিক্ত নোট বা মন্তব্য (ঐচ্ছিক)..."
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
            <Warning size={16} weight="bold" className="shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* 5. Submit Sale Commit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isCartEmpty || isSubmitting}
          className={`w-full h-13 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
            isCartEmpty || isSubmitting
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99]'
          }`}
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={20} weight="bold" />
              বিক্রি সম্পন্ন করুন ও রসিদ প্রিন্ট [Ctrl+Enter]
            </>
          )}
        </button>
      </div>
    </form>
  );
}
