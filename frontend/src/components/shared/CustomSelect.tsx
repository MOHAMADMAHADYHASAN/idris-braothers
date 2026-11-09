'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { CaretDown, Check, MagnifyingGlass, X } from '@phosphor-icons/react';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  badge?: string;
  color?: string;
}

interface CustomSelectProps<T = string> {
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  enableSearch?: boolean;
  className?: string;
  buttonClassName?: string;
  prefix?: React.ReactNode;
}

/**
 * Gold-Standard Portal Dropdown (Clipping Prevention Architecture)
 * - Mounts via createPortal to document.body, guaranteeing it will NEVER be clipped
 *   by parent `overflow-x-auto` or `overflow-hidden` on tables and cards.
 * - Auto-flips upwards if close to the viewport bottom.
 * - In-menu keyboard navigation (ArrowDown, ArrowUp, Enter, Escape).
 */
export function CustomSelect<T = string>({
  options,
  value,
  onChange,
  placeholder = 'নির্বাচন করুন...',
  enableSearch = false,
  className = '',
  buttonClassName = '',
  prefix,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    openUpwards: boolean;
  }>({ top: 0, left: 0, width: 200, openUpwards: false });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute position relative to viewport on open or scroll/resize
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 220; // approximate menu height
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    const top = openUpwards ? rect.top - 4 : rect.bottom + 4;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 180) - 8));
    const width = Math.max(rect.width, 170);

    setDropdownPosition({
      top,
      left,
      width,
      openUpwards,
    });
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      updatePosition();
      setSearch('');
      setIsOpen(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click or window resize
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Filter options based on local search
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        toggleDropdown();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % Math.max(1, filteredOptions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightIndex]) {
        onChange(filteredOptions[highlightIndex].value);
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
  };

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative inline-block ${className}`} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`h-8 px-2.5 rounded-md border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between gap-2 transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] cursor-pointer ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {prefix && <span className="shrink-0 text-slate-400">{prefix}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <CaretDown
          size={12}
          weight="bold"
          className={`text-slate-400 transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Portal Menu Container */}
      {isMounted &&
        isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: dropdownPosition.openUpwards ? undefined : `${dropdownPosition.top}px`,
              bottom: dropdownPosition.openUpwards
                ? `${window.innerHeight - dropdownPosition.top}px`
                : undefined,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 99999,
            }}
            className="bg-white border border-slate-200/90 rounded-md shadow-[0_4px_20px_rgba(15,23,42,0.12)] overflow-hidden flex flex-col max-h-60 animate-in fade-in-0 zoom-in-95 duration-100"
          >
            {/* Optional search header */}
            {(enableSearch || options.length > 6) && (
              <div className="p-1.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5 shrink-0">
                <MagnifyingGlass size={13} weight="bold" className="text-slate-400 ml-1" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlightIndex(0);
                  }}
                  placeholder="খুঁজুন..."
                  className="w-full text-xs bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="p-0.5 text-slate-400 hover:text-slate-700"
                  >
                    <X size={12} weight="bold" />
                  </button>
                )}
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto py-1 max-h-48">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-400 text-center">
                  কোনো অপশন পাওয়া যায়নি
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = idx === highlightIndex;

                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setHighlightIndex(idx)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white font-semibold'
                          : isHighlighted
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check size={12} weight="bold" className="shrink-0 text-white" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
