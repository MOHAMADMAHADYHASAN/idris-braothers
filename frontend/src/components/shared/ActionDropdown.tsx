'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DotsThreeVertical } from '@phosphor-icons/react';

export interface ActionDropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionDropdownProps {
  items: ActionDropdownItem[];
  align?: 'left' | 'right';
  buttonClassName?: string;
  title?: string;
  width?: number;
}

/**
 * Enterprise Action Dropdown (Three Dots Menu)
 * - Mounts via createPortal to document.body, eliminating table clipping issues.
 * - Auto-repositions and flips upwards when near the bottom of viewport.
 * - Full event isolation (stopPropagation) to prevent row selection/expansion triggers.
 * - Clean Bengali label with iconography for zero cognitive load.
 */
export function ActionDropdown({
  items,
  align = 'right',
  buttonClassName = '',
  title = 'অ্যাকশন মেনু',
  width = 165,
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = width;
    const menuHeight = items.length * 36 + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

    const top = openUpwards ? rect.top - menuHeight - 4 : rect.bottom + 4;
    const left = align === 'right' ? Math.max(8, rect.right - menuWidth) : Math.max(8, rect.left);

    setPosition({ top, left });
  };

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
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
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className={`p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer inline-flex items-center justify-center ${
          isOpen ? 'bg-slate-100 text-slate-900' : ''
        } ${buttonClassName}`}
        title={title}
      >
        <DotsThreeVertical size={16} weight="bold" />
      </button>

      {isMounted &&
        isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${width}px`,
              zIndex: 99999,
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl border border-slate-200/90 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.14)] p-1 text-xs font-sans animate-in fade-in zoom-in-95 duration-100"
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer select-none text-[11px] sm:text-xs ${
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : item.danger
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <span className={item.danger ? 'text-rose-500 flex-shrink-0' : 'text-slate-500 flex-shrink-0'}>
                  {item.icon}
                </span>
                <span className="truncate flex-1 whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
