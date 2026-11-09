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
      <div className="flex items-center p-0.5 rounded-md bg-slate-100 border border-slate-200/90 text-xs">
        {presets.map((p) => {
          const isActive = activeFilter === p.value && !isCustomActive;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => handleSelectPreset(p.value)}
              className={`py-1 px-2.5 text-xs font-semibold rounded transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
        className={`h-7.5 px-2.5 rounded-md border flex items-center gap-1.5 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] cursor-pointer ${
          isCustomActive
            ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-300'
            : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
        }`}
        title="কাস্টম তারিখ নির্বাচন করুন"
      >
        <CalendarBlank size={14} weight="bold" className={isCustomActive ? 'text-amber-700' : 'text-slate-500'} />
        {isCustomActive && currentStart && currentEnd ? (
          <span className="text-[11px] font-mono tabular-nums font-bold">
            {currentStart} ~ {currentEnd}
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
            className="absolute right-0 top-full mt-1.5 w-76 bg-white border border-slate-200/90 rounded-lg shadow-[0_4px_20px_rgba(15,23,42,0.12)] p-3.5 z-50 pointer-events-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CalendarBlank size={14} weight="bold" className="text-slate-700" />
                তারিখের সীমা নির্বাচন করুন
              </span>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={14} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-2.5 py-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  শুরুর তারিখ (Start Date)
                </label>
                <input
                  type="date"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs font-mono tabular-nums border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  শেষের তারিখ (End Date)
                </label>
                <input
                  type="date"
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs font-mono tabular-nums border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 h-8 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-colors cursor-pointer"
                >
                  রিসেট
                </button>
                <button
                  type="submit"
                  disabled={!startInput || !endInput}
                  className="flex-1 h-8 rounded-md bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-[0.98] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1"
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
