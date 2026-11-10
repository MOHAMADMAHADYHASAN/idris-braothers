'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash, Plus, Minus, ShoppingBag, Lightning } from '@phosphor-icons/react';
import { usePosStore } from '../usePosStore';
import { formatCurrency, formatNumber, formatWeight } from '@/lib/decimal';

export function PosCartTable() {
  const { cart, updateQuantity, removeItem, clearCart, getSubTotal } = usePosStore();

  if (cart.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 text-ink-secondary border border-dashed border-border-strong rounded-xl bg-surface-card">
        <div className="w-10 h-10 rounded-lg bg-brand-soft border border-brand-light text-brand-deep flex items-center justify-center mb-2">
          <ShoppingBag size={22} weight="duotone" />
        </div>
        <p className="font-semibold text-sm text-ink-primary">বিক্রয় কার্ট সম্পূর্ণ খালি</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-card rounded-xl border border-border-default overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* Cart Table Header */}
      <div className="px-3.5 py-2.5 bg-surface-subtle/70 border-b border-border-default flex items-center justify-between">
        <span className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
          আইটেম তালিকা ({formatNumber(cart.length)} টি)
        </span>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-due-text hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Trash size={13} weight="bold" />
          <span>কার্ট খালি করুন</span>
        </button>
      </div>

      {/* Cart Items List with Spring Animation */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
        <AnimatePresence initial={false}>
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
              className="p-3 hover:bg-surface-subtle/50 transition-[background-color] duration-150 flex items-center justify-between gap-3 group"
            >
              {/* Left: Product & Unit Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-semibold text-ink-primary text-xs sm:text-sm truncate">
                    {item.banglaName || item.productName}
                  </h4>
                  {item.isReverseCalculated && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-xs font-bold bg-wholesale-bg text-wholesale-text border border-wholesale-border/50 inline-flex items-center gap-0.5">
                      <Lightning size={11} weight="fill" />
                      টাকা মোড
                    </span>
                  )}
                </div>

                {/* Unit & Unit Rate */}
                <div className="flex items-center gap-1.5 mt-1 text-xs text-ink-secondary font-mono tabular-nums flex-wrap">
                  <span className="font-semibold text-ink-primary bg-surface-subtle px-1.5 py-0.5 rounded border border-border-default">
                    {item.selectedUnitName}
                  </span>
                  <span>দর: {formatCurrency(item.unitPrice, false)}</span>
                  {item.conversionFactor > 1 && (
                    <span className="text-xs text-ink-secondary">
                      ({formatNumber(item.conversionFactor)} {item.baseUnitName})
                    </span>
                  )}
                </div>

                {/* Base Weight Details */}
                <div className="text-xs text-ink-secondary mt-0.5 font-mono tabular-nums">
                  স্টক হ্রাস: {formatWeight(item.baseQuantity, item.baseUnitName)}
                </div>
              </div>

              {/* Center: Tactile Stepper */}
              {!item.isReverseCalculated ? (
                <div className="flex items-center border border-border-strong rounded-lg bg-surface-card overflow-hidden shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-ink-body hover:bg-surface-subtle active:bg-border-default transition-colors cursor-pointer"
                    title="পরিমাণ কমান"
                  >
                    <Minus size={13} weight="bold" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold font-mono text-ink-primary tabular-nums">
                    {formatNumber(item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-ink-body hover:bg-surface-subtle active:bg-border-default transition-colors cursor-pointer"
                    title="পরিমাণ বাড়ান"
                  >
                    <Plus size={13} weight="bold" />
                  </button>
                </div>
              ) : (
                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-wholesale-text bg-wholesale-bg px-2 py-1 rounded border border-wholesale-border/70 font-mono tabular-nums">
                    {formatCurrency(item.customTotalPrice, false)} ফিক্সড
                  </span>
                </div>
              )}

              {/* Right: Subtotal & Delete */}
              <div className="text-right min-w-[74px] shrink-0">
                <div className="font-bold text-xs sm:text-sm text-ink-primary font-mono tabular-nums">
                  {formatCurrency(item.subTotal, false)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-ink-secondary hover:text-due-text mt-0.5 inline-flex items-center gap-1 cursor-pointer transition-colors"
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
      <div className="px-3.5 py-2.5 bg-brand-soft/60 border-t border-brand-light flex justify-between items-center text-xs">
        <span className="font-semibold text-ink-body">কার্ট উপমোট:</span>
        <span className="font-bold text-brand-deep text-sm font-mono tabular-nums">
          {formatCurrency(getSubTotal(), false)}
        </span>
      </div>
    </div>
  );
}
