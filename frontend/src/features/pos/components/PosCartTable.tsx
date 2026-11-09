'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash, Plus, Minus, ShoppingBag, Lightning } from '@phosphor-icons/react';
import { usePosStore } from '../usePosStore';
import { formatCurrency, formatWeight } from '@/lib/decimal';

export function PosCartTable() {
  const { cart, updateQuantity, removeItem, clearCart, getSubTotal } = usePosStore();

  if (cart.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 text-slate-400 border border-dashed border-slate-200/90 rounded-lg bg-white">
        <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/70 text-slate-400 flex items-center justify-center mb-2">
          <ShoppingBag size={22} weight="duotone" />
        </div>
        <p className="font-semibold text-xs text-slate-700">বিক্রয় কার্ট সম্পূর্ণ খালি</p>
        <p className="text-[11px] text-slate-400 mt-0.5 tracking-tight">
          বামের তালিকা থেকে পণ্য নির্বাচন করে কার্টে যোগ করুন
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* Cart Table Header */}
      <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 tracking-tight">
          আইটেম তালিকা ({cart.length} টি)
        </span>
        <button
          type="button"
          onClick={clearCart}
          className="text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Trash size={13} weight="bold" />
          <span>কার্ট খালি করুন</span>
        </button>
      </div>

      {/* Cart Items List with Spring Animation */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        <AnimatePresence initial={false}>
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
              className="p-3 hover:bg-slate-50/60 transition-[background-color] duration-150 flex items-center justify-between gap-3 group"
            >
              {/* Left: Product & Unit Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-[13px] tracking-tight truncate">
                    {item.banglaName || item.productName}
                  </h4>
                  {item.isReverseCalculated && (
                    <span className="shrink-0 px-1 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5">
                      <Lightning size={10} weight="fill" />
                      টাকা মোড
                    </span>
                  )}
                </div>

                {/* Unit & Unit Rate */}
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 font-mono tabular-nums tracking-tight">
                  <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/70 text-[10px]">
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
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono tabular-nums tracking-tight">
                  স্টক হ্রাস: {formatWeight(item.baseQuantity, item.baseUnitName)}
                </div>
              </div>

              {/* Center: Tactile Stepper (Touch-Friendly >= 32px) */}
              {!item.isReverseCalculated ? (
                <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                    title="পরিমাণ কমান"
                  >
                    <Minus size={13} weight="bold" />
                  </button>
                  <span className="w-9 sm:w-10 text-center text-xs font-bold font-mono text-slate-900 tabular-nums tracking-tight">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                    title="পরিমাণ বাড়ান"
                  >
                    <Plus size={13} weight="bold" />
                  </button>
                </div>
              ) : (
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-mono tabular-nums tracking-tight">
                    ৳{item.customTotalPrice} ফিক্সড
                  </span>
                </div>
              )}

              {/* Right: Subtotal & Delete */}
              <div className="text-right min-w-[70px] shrink-0">
                <div className="font-bold text-xs sm:text-sm text-slate-900 font-mono tabular-nums tracking-tight">
                  {formatCurrency(item.subTotal, false)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-[11px] text-slate-400 hover:text-rose-600 mt-0.5 inline-flex items-center gap-0.5 cursor-pointer transition-colors"
                >
                  <Trash size={12} weight="bold" />
                  <span>মুছুন</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cart Subtotal Quick Strip */}
      <div className="px-3.5 py-2.5 bg-slate-50/80 border-t border-slate-200/80 flex justify-between items-center text-xs">
        <span className="font-medium text-slate-600">কার্ট উপমোট:</span>
        <span className="font-bold text-slate-900 text-sm font-mono tabular-nums tracking-tight">
          {formatCurrency(getSubTotal(), false)}
        </span>
      </div>
    </div>
  );
}
