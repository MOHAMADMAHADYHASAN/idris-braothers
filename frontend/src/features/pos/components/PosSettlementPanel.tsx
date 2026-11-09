'use client';

import React, { useState, useEffect } from 'react';
import { User, CheckCircle, Warning, Coins, ArrowCounterClockwise } from '@phosphor-icons/react';
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
      className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-3 sm:p-3.5 flex flex-col justify-between space-y-3"
    >
      <div className="space-y-3">
        {/* 1. Customer Selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User size={13} weight="bold" className="text-slate-500" />
              কাস্টমার / খদ্দের
            </label>
            {selectedCustomer && (
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-[10px] text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer"
              >
                নগদ খদ্দেরে ফিরুন
              </button>
            )}
          </div>

          {selectedCustomer ? (
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-md flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 text-xs">{selectedCustomer.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono tabular-nums">{selectedCustomer.phone || 'ফোন নম্বর নেই'}</p>
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
                className="w-full h-9 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 transition-[border-color,box-shadow] duration-150"
              />

              {showCustomerDropdown && (
                <div className="absolute z-20 left-0 right-0 top-10 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-98 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerDropdown(false);
                      setCustomerSearch('');
                    }}
                    className="w-full p-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer font-semibold text-slate-700"
                  >
                    <span>নগদ খদ্দের (Walk-in Cash)</span>
                    <span className="text-[10px] text-slate-400 font-normal">বাকি খাতা নেই</span>
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
                        className="w-full p-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{customer.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono tabular-nums">{customer.phone}</div>
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
        <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-md space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>আইটেম মোট:</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums tracking-tight">
              {formatCurrency(subTotal, false)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-600">বিশেষ ছাড় (-):</span>
            <div className="relative w-24">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">৳</span>
              <input
                type="number"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full h-7 pl-5 pr-2 rounded border border-slate-200 bg-white text-xs font-semibold text-right font-mono tabular-nums tracking-tight text-slate-900 focus:outline-hidden focus:border-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200/80">
            <span className="font-semibold text-slate-900 text-xs">সর্বমোট বিল:</span>
            <span className="font-bold text-lg text-slate-900 font-mono tabular-nums tracking-tight">
              {formatCurrency(grandTotal, false)}
            </span>
          </div>
        </div>

        {/* 3. Cash Payment Received & Change */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
              <Coins size={14} weight="bold" className="text-slate-500" />
              <span>নগদ গ্রহণ (Cash Paid) [F4]:</span>
            </label>
            <button
              type="button"
              onClick={handleFullCash}
              className="text-[11px] font-medium text-slate-700 hover:text-slate-950 hover:underline cursor-pointer transition-colors"
            >
              পুরো বিল পরিশোধ
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 font-mono">৳</span>
            <input
              id="pos-paid-amount-input"
              type="number"
              min="0"
              step="any"
              value={paidAmount || ''}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full h-11 pl-7 pr-3 rounded-md border-2 border-slate-900 bg-white text-lg font-bold font-mono tabular-nums tracking-tight text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 transition-[border-color,box-shadow]"
            />
          </div>

          {/* Quick Cash Buttons */}
          <div className="flex gap-1 pt-0.5">
            {[100, 500, 1000].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setPaidAmount(paidAmount + quick)}
                className="flex-1 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium font-mono tabular-nums text-slate-700 transition-[background-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
              >
                +{quick}৳
              </button>
            ))}
          </div>
        </div>

        {/* 4. Live Due & Change Calculations */}
        <div className="p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-md space-y-1 text-xs">
          {changeAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-800 font-medium bg-emerald-50 border border-emerald-200/60 px-2 py-1.5 rounded">
              <span>কাস্টমারকে ফেরত দিন:</span>
              <span className="text-xs font-bold font-mono tabular-nums tracking-tight">
                {formatCurrency(changeAmount, false)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>এই মেমোর বকেয়া:</span>
            <span className={`font-semibold font-mono tabular-nums tracking-tight ${invoiceDue > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {formatCurrency(invoiceDue, false)}
            </span>
          </div>

          {selectedCustomer && (
            <div className="pt-1.5 border-t border-slate-200/80 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>পূর্বের বকেয়া:</span>
                <span className="font-mono tabular-nums tracking-tight">{formatCurrency(selectedCustomer.currentDue, false)}</span>
              </div>
              <div className="flex justify-between items-center font-medium text-slate-900 text-xs bg-slate-100 px-2 py-1 rounded">
                <span>খাতার নতুন মোট বকেয়া:</span>
                <span className={`font-mono tabular-nums tracking-tight font-bold ${closingDue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
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
            className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-800"
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
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
          className={`w-full h-11 rounded-md font-semibold text-xs sm:text-sm transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-2 shadow-[0_1px_2px_rgba(15,23,42,0.06)] active:scale-[0.98] cursor-pointer ${
            isCartEmpty || isSubmitting
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
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
