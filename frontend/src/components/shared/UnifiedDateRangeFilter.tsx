'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarBlank, X, Check, ArrowRight } from '@phosphor-icons/react';
import {
  DateFilterPreset,
  DEFAULT_PRESETS,
  resolveDateFilter,
  ResolvedDateRange,
  isValidYmd,
} from '@/lib/dateFilter';
import { toBanglaDigits } from '@/lib/decimal';

interface Props {
  presets?: DateFilterPreset[];
  defaultFilter?: string;
  className?: string;
  onRangeChange?: (range: ResolvedDateRange) => void;
  syncWithUrl?: boolean;
}

function UnifiedDateRangeFilterInner({
  presets = DEFAULT_PRESETS,
  defaultFilter = 'today',
  className = '',
  onRangeChange,
  syncWithUrl = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Resolve current active state from URL search params (or default)
  const urlFilter = searchParams?.get('filter') || defaultFilter;
  const urlStart = searchParams?.get('startDate') || '';
  const urlEnd = searchParams?.get('endDate') || '';

  const [activeFilter, setActiveFilter] = useState<string>(urlFilter);
  const [currentStart, setCurrentStart] = useState<string>(urlStart);
  const [currentEnd, setCurrentEnd] = useState<string>(urlEnd);

  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [startInput, setStartInput] = useState<string>(urlStart);
  const [endInput, setEndInput] = useState<string>(urlEnd);

  const popoverRef = useRef<HTMLDivElement>(null);
  const onRangeChangeRef = useRef(onRangeChange);
  const lastDispatchedSignatureRef = useRef<string>('');

  useEffect(() => {
    onRangeChangeRef.current = onRangeChange;
  });

  // Sync internal state if URL changes externally (e.g. browser back/forward or router.push)
  useEffect(() => {
    if (!syncWithUrl) return;
    const f = searchParams?.get('filter') || defaultFilter;
    const s = searchParams?.get('startDate') || '';
    const e = searchParams?.get('endDate') || '';

    const signature = `${f}|${s}|${e}`;
    if (lastDispatchedSignatureRef.current === signature) {
      return;
    }
    lastDispatchedSignatureRef.current = signature;

    setActiveFilter(f);
    setCurrentStart(s);
    setCurrentEnd(e);
    if (s) setStartInput(s);
    if (e) setEndInput(e);

    if (onRangeChangeRef.current) {
      const resolved = resolveDateFilter({ filter: f, startDate: s, endDate: e });
      onRangeChangeRef.current(resolved);
    }
  }, [searchParams, defaultFilter, syncWithUrl]);

  // Initial trigger if not syncing with URL
  useEffect(() => {
    if (syncWithUrl) return;
    if (onRangeChangeRef.current) {
      const resolved = resolveDateFilter({ filter: defaultFilter });
      onRangeChangeRef.current(resolved);
    }
  }, [syncWithUrl, defaultFilter]);

  // Click outside listener for the custom date popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const pushStateToUrl = (filterVal: string, start?: string, end?: string) => {
    if (!syncWithUrl) return;
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('filter', filterVal);
    if (start && end) {
      params.set('startDate', start);
      params.set('endDate', end);
    } else {
      params.delete('startDate');
      params.delete('endDate');
    }
    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectPreset = (value: string) => {
    setShowPicker(false);
    if (syncWithUrl) {
      pushStateToUrl(value);
    } else {
      setActiveFilter(value);
      setCurrentStart('');
      setCurrentEnd('');
      setStartInput('');
      setEndInput('');
      if (onRangeChangeRef.current) {
        const resolved = resolveDateFilter({ filter: value });
        onRangeChangeRef.current(resolved);
      }
    }
  };

  const handleApplyCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!startInput || !endInput) return;

    setShowPicker(false);
    if (syncWithUrl) {
      pushStateToUrl('custom', startInput, endInput);
    } else {
      setActiveFilter('custom');
      setCurrentStart(startInput);
      setCurrentEnd(endInput);
      if (onRangeChangeRef.current) {
        const resolved = resolveDateFilter({
          filter: 'custom',
          startDate: startInput,
          endDate: endInput,
        });
        onRangeChangeRef.current(resolved);
      }
    }
  };

  const handleClear = () => {
    setStartInput('');
    setEndInput('');
    handleSelectPreset(defaultFilter);
  };

  const isCustomActive = activeFilter === 'custom' || Boolean(currentStart && currentEnd);

  return (
    <div className={`relative flex items-center gap-1.5 ${className}`} ref={popoverRef}>
      {/* ── Preset Pills Bar ── */}
      <div className="flex items-center p-0.5 rounded-lg bg-surface-subtle border border-border-default text-xs">
        {presets.map((p) => {
          const isActive = activeFilter === p.value && !isCustomActive;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => handleSelectPreset(p.value)}
              className={`py-1 px-2.5 text-xs font-semibold rounded-md transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-brand-deep text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* ── Custom Date Toggle Button ── */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`h-8 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] cursor-pointer ${
          isCustomActive
            ? 'bg-wholesale-bg border-wholesale-border text-wholesale-text ring-1 ring-wholesale-border'
            : 'bg-surface-card border-border-strong text-ink-body hover:bg-surface-subtle'
        }`}
        title="কাস্টম তারিখ নির্বাচন করুন"
      >
        <CalendarBlank size={14} weight="bold" className={isCustomActive ? 'text-wholesale-text' : 'text-ink-secondary'} />
        {isCustomActive && currentStart && currentEnd ? (
          <span className="text-xs font-mono tabular-nums font-bold">
            {toBanglaDigits(currentStart)} ~ {toBanglaDigits(currentEnd)}
          </span>
        ) : (
          <span>কাস্টম</span>
        )}
      </button>

      {/* ── Custom Date Floating Popover ── */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
            className="absolute right-0 top-full mt-1.5 w-76 bg-surface-card border border-border-default rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.12)] p-3.5 z-50 pointer-events-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <span className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                <CalendarBlank size={14} weight="bold" className="text-brand-deep" />
                তারিখের সীমা নির্বাচন করুন
              </span>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                <X size={14} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-2.5 py-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-ink-secondary block mb-1">
                  শুরুর তারিখ
                </label>
                <input
                  type="date"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs font-mono tabular-nums border border-border-strong rounded-md bg-surface-card text-ink-primary focus:outline-hidden focus:border-brand-deep focus:ring-1 focus:ring-brand-deep"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-secondary block mb-1">
                  শেষের তারিখ
                </label>
                <input
                  type="date"
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs font-mono tabular-nums border border-border-strong rounded-md bg-surface-card text-ink-primary focus:outline-hidden focus:border-brand-deep focus:ring-1 focus:ring-brand-deep"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 h-8 rounded-md border border-border-strong text-xs font-semibold text-ink-body hover:bg-surface-subtle active:scale-[0.98] transition-colors cursor-pointer"
                >
                  রিসেট
                </button>
                <button
                  type="submit"
                  disabled={!startInput || !endInput}
                  className="flex-1 h-8 rounded-md bg-brand-deep text-white text-xs font-bold hover:bg-brand-hover active:scale-[0.98] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check size={13} weight="bold" />
                  <span>প্রয়োগ করুন</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function UnifiedDateRangeFilter(props: Props) {
  return (
    <React.Suspense
      fallback={
        <div className={`h-8 bg-slate-100 rounded-md border border-slate-200/80 animate-pulse w-48 ${props.className || ''}`} />
      }
    >
      <UnifiedDateRangeFilterInner {...props} />
    </React.Suspense>
  );
}
