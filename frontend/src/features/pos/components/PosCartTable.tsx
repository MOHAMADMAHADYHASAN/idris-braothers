'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trash,
  Plus,
  Minus,
  ShoppingBag,
  Lightning,
  PencilSimple,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { usePosStore } from '../usePosStore';
import { formatCurrency, formatNumber, formatWeight } from '@/lib/decimal';

const QUICK_WEIGHT_CHIPS = [
  { label: '২৫০গ', qty: 0.25 },
  { label: '৫০০গ', qty: 0.5 },
  { label: '৭৫০গ', qty: 0.75 },
  { label: '১কেজি', qty: 1 },
  { label: '৫কেজি', qty: 5 },
  { label: '২৫কেজি', qty: 25 },
  { label: '৫০কেজি', qty: 50 },
];

function InlineQtyInput({
  value,
  allowDecimal,
  onCommit,
}: {
  value: number;
  allowDecimal: boolean;
  onCommit: (nextQty: number) => void;
}) {
  const [draft, setDraft] = useState<string>(String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraft(String(value));
    }
  }, [value, isFocused]);

  const commitDraft = () => {
    setIsFocused(false);
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed > 0) {
      const normalized = allowDecimal ? parsed : Math.max(1, Math.round(parsed));
      onCommit(normalized);
      setDraft(String(normalized));
    } else {
      setDraft(String(value));
    }
  };

  return (
    <input
      type="number"
      step={allowDecimal ? 'any' : '1'}
      min="0"
      aria-label="পরিমাণ"
      value={draft}
      onFocus={(e) => {
        setIsFocused(true);
        e.target.select();
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed > 0 && (allowDecimal || Number.isInteger(parsed))) {
          onCommit(parsed);
        }
      }}
      onBlur={commitDraft}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      className="w-16 h-8 px-1 text-center text-xs font-bold font-mono text-ink-primary bg-surface-card tabular-nums focus:outline-hidden focus:bg-brand-soft/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

function InlinePriceEditor({
  unitPrice,
  isCustomPrice,
  onSave,
  onReset,
}: {
  unitPrice: number;
  isCustomPrice?: boolean;
  onSave: (nextPrice: number) => void;
  onReset: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(unitPrice));

  useEffect(() => {
    if (!editing) {
      setDraft(String(unitPrice));
    }
  }, [unitPrice, editing]);

  const commitPrice = () => {
    setEditing(false);
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed > 0 && parsed !== unitPrice) {
      onSave(parsed);
    } else {
      setDraft(String(unitPrice));
    }
  };

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1">
        <span className="text-xs text-ink-secondary">দর: ৳</span>
        <input
          type="number"
          step="any"
          min="1"
          autoFocus
          aria-label="একক দর"
          value={draft}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitPrice}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitPrice();
            } else if (e.key === 'Escape') {
              setEditing(false);
              setDraft(String(unitPrice));
            }
          }}
          className="w-20 px-1.5 py-0.5 rounded border border-brand-deep bg-surface-card text-xs font-bold font-mono text-ink-primary focus:outline-hidden"
        />
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          setDraft(String(unitPrice));
          setEditing(true);
        }}
        className="inline-flex items-center gap-1 text-ink-secondary hover:text-brand-deep transition-colors cursor-pointer group/price"
        title="ক্লিক করে দর পরিবর্তন করুন"
      >
        <span>দর:</span>
        <span className="underline decoration-dotted decoration-border-strong underline-offset-2 font-semibold text-ink-primary group-hover/price:text-brand-deep">
          {formatCurrency(unitPrice, false)}
        </span>
        <PencilSimple size={11} weight="bold" className="opacity-65 group-hover/price:opacity-100" />
      </button>

      {isCustomPrice && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-wholesale-bg text-wholesale-text border border-wholesale-border/50 text-xs font-semibold cursor-pointer hover:bg-amber-100"
          title="মূল দরে ফিরে যান"
        >
          <span>কাস্টম</span>
          <ArrowCounterClockwise size={10} weight="bold" />
        </button>
      )}
    </div>
  );
}

export function PosCartTable() {
  const {
    cart,
    updateQuantity,
    updateUnitPrice,
    resetCustomPrice,
    removeItem,
    clearCart,
    getSubTotal,
  } = usePosStore();

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
          {cart.map((item) => {
            const isDecimalItem = item.allowDecimalQty !== false;
            const showQuickWeights =
              !item.isReverseCalculated && isDecimalItem && item.baseUnitName === 'কেজি';

            return (
              <motion.div
                key={item.id}
                layout="position"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
                className="p-3 hover:bg-surface-subtle/40 transition-[background-color] duration-150 space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2.5">
                  {/* Left: Product, Variant & Inline Price Edit */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-semibold text-ink-primary text-xs sm:text-sm truncate">
                        {item.banglaName || item.productName}
                      </h4>
                      {item.variantName && item.variantName !== 'Default' && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold bg-brand-soft text-brand-deep border border-brand-light">
                          {item.variantName}
                        </span>
                      )}
                      {item.isReverseCalculated && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-xs font-bold bg-wholesale-bg text-wholesale-text border border-wholesale-border/50 inline-flex items-center gap-0.5">
                          <Lightning size={11} weight="fill" />
                          টাকা মোড
                        </span>
                      )}
                    </div>

                    {/* Unit & Inline Rate Editor */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-ink-secondary font-mono tabular-nums flex-wrap">
                      <span className="font-semibold text-ink-primary bg-surface-subtle px-1.5 py-0.5 rounded border border-border-default">
                        {item.selectedUnitName}
                      </span>
                      {!item.isReverseCalculated ? (
                        <InlinePriceEditor
                          unitPrice={item.unitPrice}
                          isCustomPrice={item.isCustomPrice}
                          onSave={(nextPrice) => updateUnitPrice(item.id, nextPrice)}
                          onReset={() => resetCustomPrice(item.id)}
                        />
                      ) : (
                        <span>দর: {formatCurrency(item.unitPrice, false)}</span>
                      )}
                    </div>

                    {/* Base Weight / Stock Deduction Details */}
                    <div className="text-xs text-ink-secondary mt-0.5 font-mono tabular-nums">
                      স্টক হ্রাস: {formatWeight(item.baseQuantity, item.baseUnitName)}
                    </div>
                  </div>

                  {/* Center: Direct Quantity Input + Stepper */}
                  {!item.isReverseCalculated ? (
                    <div className="flex items-center border border-border-strong rounded-lg bg-surface-card overflow-hidden shadow-2xs shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-8 flex items-center justify-center text-ink-body hover:bg-surface-subtle active:bg-border-default transition-colors cursor-pointer border-r border-border-default"
                        title="পরিমাণ কমান"
                      >
                        <Minus size={12} weight="bold" />
                      </button>
                      <InlineQtyInput
                        value={item.quantity}
                        allowDecimal={isDecimalItem}
                        onCommit={(nextQty) => updateQuantity(item.id, nextQty)}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-8 flex items-center justify-center text-ink-body hover:bg-surface-subtle active:bg-border-default transition-colors cursor-pointer border-l border-border-default"
                        title="পরিমাণ বাড়ান"
                      >
                        <Plus size={12} weight="bold" />
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
                </div>

                {/* Quick Weight Chips for Weighable KG Items */}
                {showQuickWeights && (
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {QUICK_WEIGHT_CHIPS.map((preset) => (
                      <button
                        key={preset.qty}
                        type="button"
                        onClick={() => updateQuantity(item.id, preset.qty)}
                        className={`px-2 py-0.5 rounded text-xs font-semibold font-mono border transition-colors cursor-pointer ${
                          Math.abs(item.quantity - preset.qty) < 0.0001
                            ? 'bg-brand-deep text-white border-brand-deep'
                            : 'bg-surface-subtle text-ink-body border-border-default hover:bg-brand-soft hover:text-brand-deep'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
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
