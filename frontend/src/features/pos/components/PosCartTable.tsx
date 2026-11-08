'use client';

import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, Zap } from 'lucide-react';
import { usePosStore } from '../usePosStore';
import { formatCurrency, formatWeight } from '@/lib/decimal';

export function PosCartTable() {
  const { cart, updateQuantity, removeItem, clearCart, getSubTotal } = usePosStore();

  if (cart.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <ShoppingBag className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
        <p className="font-bold text-sm text-slate-600">বিক্রয় কার্ট সম্পূর্ণ খালি</p>
        <p className="text-xs text-slate-400 mt-0.5">
          বামের তালিকা থেকে পণ্য সিলেক্ট করে যোগ করুন
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
      {/* Cart Table Header */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          আইটেম তালিকা ({cart.length} টি)
        </span>
        <button
          type="button"
          onClick={clearCart}
          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          কার্ট খালি করুন
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {cart.map((item) => (
          <div
            key={item.id}
            className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3"
          >
            {/* Left: Product & Unit Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                  {item.banglaName || item.productName}
                </h4>
                {item.isReverseCalculated && (
                  <span className="shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" />
                    টাকা মোড
                  </span>
                )}
              </div>

              {/* Unit & Unit Rate */}
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                  {item.selectedUnitName}
                </span>
                <span>দর: {formatCurrency(item.unitPrice, false)}</span>
                {item.conversionFactor > 1 && (
                  <span className="text-[10px] text-slate-400">
                    ({item.conversionFactor} {item.baseUnitName})
                  </span>
                )}
              </div>

              {/* Base Weight Details */}
              <div className="text-[10px] text-slate-400 mt-0.5 tabular-numbers">
                স্টক কমবে: {formatWeight(item.baseQuantity, item.baseUnitName)}
              </div>
            </div>

            {/* Center: Stepper (Touch-Friendly >= 36px) */}
            {!item.isReverseCalculated ? (
              <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                  title="পরিমাণ কমান"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 sm:w-12 text-center text-xs sm:text-sm font-black text-slate-900 tabular-numbers">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                  title="পরিমাণ বাড়ান"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 tabular-numbers">
                  ৳{item.customTotalPrice} ফিক্সড
                </span>
              </div>
            )}

            {/* Right: Subtotal & Delete */}
            <div className="text-right min-w-[70px] shrink-0">
              <div className="font-black text-xs sm:text-sm text-slate-900 tabular-numbers">
                {formatCurrency(item.subTotal, false)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-[11px] text-slate-400 hover:text-rose-600 mt-1 inline-flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                মুছুন
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Subtotal Quick Strip */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex justify-between items-center text-xs">
        <span className="font-bold text-slate-600">কার্ট মোট:</span>
        <span className="font-black text-slate-900 text-sm tabular-numbers">
          {formatCurrency(getSubTotal(), false)}
        </span>
      </div>
    </div>
  );
}
