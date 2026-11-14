'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trash,
  Plus,
  Minus,
  ShoppingBag,
  Lightning,
  PencilSimple,
  ArrowCounterClockwise,
  ArrowUUpLeft,
  Keyboard,
} from '@phosphor-icons/react';
import { usePosStore } from '../usePosStore';
import { CartItem } from '../pos.types';
import { formatCurrency, formatNumber, formatWeight } from '@/lib/decimal';

const QUICK_WEIGHT_CHIPS = [
  { label: '২৫০গ', qty: 0.25 },
  { label: '৫০০গ', qty: 0.5 },
  { label: '১কেজি', qty: 1 },
  { label: '৫কেজি', qty: 5 },
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
      className="w-14 h-8 px-1 text-center text-xs font-bold font-mono text-ink-primary bg-surface-card tabular-nums focus:outline-hidden focus:bg-brand-soft/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
        <span className="text-2xs text-ink-secondary">দর: ৳</span>
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
          className="w-16 px-1 py-0.5 rounded border border-brand-deep bg-surface-card text-2xs font-bold font-mono text-ink-primary focus:outline-hidden"
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
        className="inline-flex items-center gap-0.5 text-2xs text-ink-secondary hover:text-brand-deep transition-colors cursor-pointer group/price"
        title="দর পরিবর্তন করুন"
      >
        <span>দর: {formatCurrency(unitPrice, false)}</span>
        <PencilSimple size={10} weight="bold" className="opacity-60 group-hover/price:opacity-100" />
      </button>

      {isCustomPrice && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-wholesale-bg text-wholesale-text border border-wholesale-border/50 text-2xs font-semibold cursor-pointer"
          title="মূল দরে ফিরুন"
        >
          <span>রিসেট</span>
          <ArrowCounterClockwise size={9} weight="bold" />
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

  const [undoSnapshot, setUndoSnapshot] = useState<CartItem[] | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClearCart = () => {
    setUndoSnapshot([...cart]);
    clearCart();

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setUndoSnapshot(null);
    }, 4000);
  };

  const handleUndo = () => {
    if (undoSnapshot) {
      usePosStore.setState({ cart: undoSnapshot });
      setUndoSnapshot(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-surface-card rounded-2xl border border-border-default shadow-xs overflow-hidden">
      {/* 1. Header: Digital Order Sheet */}
      <div className="px-4 py-3 bg-surface-card border-b border-border-default flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs sm:text-sm text-ink-primary">
            চলতি বিক্রয় রসিদ
          </span>
          <span className="px-2 py-0.5 rounded-full text-2xs font-mono font-bold bg-brand-soft text-brand-deep border border-brand-light">
            {formatNumber(cart.length)} আইটেম
          </span>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            className="text-xs font-semibold text-ink-secondary hover:text-due-text flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash size={13} weight="bold" />
            <span>খালি করুন</span>
          </button>
        )}
      </div>

      {/* Undo Banner Toast */}
      <AnimatePresence>
        {undoSnapshot !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-3.5 py-2 bg-wholesale-bg border-b border-wholesale-border/60 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-wholesale-text">
                {formatNumber(undoSnapshot.length)} টি আইটেম মুছে ফেলা হয়েছে
              </span>
              <button
                type="button"
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-wholesale-solid text-white text-xs font-bold cursor-pointer hover:bg-wholesale-hover transition-colors"
              >
                <ArrowUUpLeft size={12} weight="bold" />
                <span>ফেরত আনুন</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Scrollable Cart Items Stream */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/80 min-h-0">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-ink-secondary">
            <div className="w-14 h-14 rounded-2xl bg-surface-subtle flex items-center justify-center mb-3 text-ink-muted">
              <ShoppingBag size={28} weight="duotone" />
            </div>
            <p className="font-bold text-sm text-ink-primary mb-1">রসিদে কোনো পণ্য নেই</p>
            <p className="text-xs text-ink-secondary max-w-[200px] leading-relaxed mb-4">
              বাম পাশের কার্ডে ট্যাপ করুন অথবা বারকোড স্ক্যানার গান দিয়ে স্ক্যান করুন
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-subtle border border-border-default text-xs font-medium text-ink-body">
              <Keyboard size={14} weight="regular" />
              <span>সার্চ শর্টকাট: <strong className="font-mono text-brand-deep">F2</strong></span>
            </div>
          </div>
        ) : (
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
                  className="p-3.5 hover:bg-surface-subtle/30 transition-colors space-y-2 group"
                >
                  {/* Top Line: Item Name & Delete Button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-ink-primary text-xs sm:text-sm truncate">
                          {item.banglaName || item.productName}
                        </h4>
                        {item.variantName && item.variantName !== 'Default' && (
                          <span className="shrink-0 px-1.5 py-0.2 rounded text-2xs font-semibold bg-brand-soft text-brand-deep border border-brand-light">
                            {item.variantName}
                          </span>
                        )}
                        {item.isReverseCalculated && (
                          <span className="shrink-0 px-1.5 py-0.2 rounded text-2xs font-bold bg-wholesale-bg text-wholesale-text border border-wholesale-border/50 inline-flex items-center gap-0.5">
                            <Lightning size={10} weight="fill" />
                            টাকা মোড
                          </span>
                        )}
                      </div>

                      {/* Unit & Inline Price Tag */}
                      <div className="flex items-center gap-2 mt-1 font-mono text-2xs text-ink-secondary">
                        <span className="font-semibold text-ink-body bg-surface-subtle px-1.5 py-0.5 rounded border border-border-subtle">
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
                          <span>রেট: {formatCurrency(item.unitPrice, false)}</span>
                        )}
                      </div>
                    </div>

                    {/* Subtotal in Crisp Mono */}
                    <div className="text-right shrink-0">
                      <span className="font-black text-sm sm:text-base text-ink-primary font-mono tabular-nums block">
                        {formatCurrency(item.subTotal, false)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-2xs text-ink-muted hover:text-due-text mt-0.5 inline-flex items-center gap-0.5 transition-colors cursor-pointer"
                        title="আইটেমটি মুছুন"
                      >
                        <Trash size={11} weight="bold" />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Middle Line: Stepper + Presets */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {!item.isReverseCalculated ? (
                      <div className="flex items-center border border-border-strong rounded-lg bg-surface-card overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-ink-body hover:bg-surface-subtle active:bg-border-default transition-colors cursor-pointer border-r border-border-default"
                          title="পরিমাণ কমান"
                          aria-label="পরিমাণ কমান"
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
                          className="w-8 h-8 flex items-center justify-center text-ink-body hover:bg-surface-subtle active:bg-border-default transition-colors cursor-pointer border-l border-border-default"
                          title="পরিমাণ বাড়ান"
                          aria-label="পরিমাণ বাড়ান"
                        >
                          <Plus size={12} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-2xs font-semibold text-wholesale-text bg-wholesale-bg px-2 py-1 rounded border border-wholesale-border/70 font-mono">
                        {formatCurrency(item.customTotalPrice, false)} ফিক্সড বাজেট
                      </span>
                    )}

                    {/* Quick Weight Chips */}
                    {showQuickWeights && (
                      <div className="flex items-center gap-1">
                        {QUICK_WEIGHT_CHIPS.map((preset) => (
                          <button
                            key={preset.qty}
                            type="button"
                            onClick={() => updateQuantity(item.id, preset.qty)}
                            className={`px-1.5 py-0.5 rounded text-2xs font-semibold font-mono border transition-colors cursor-pointer ${
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
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* 3. Subtotal Bar */}
      {cart.length > 0 && (
        <div className="px-4 py-2.5 bg-surface-subtle/50 border-t border-border-default flex justify-between items-center text-xs shrink-0">
          <span className="font-semibold text-ink-secondary">আইটেম সাবটোটাল:</span>
          <span className="font-bold text-ink-primary font-mono tabular-nums text-sm">
            {formatCurrency(getSubTotal(), false)}
          </span>
        </div>
      )}
    </div>
  );
}
