'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backTitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Gold-Standard Enterprise Admin Page Header
 * - Desktop (md+): Static, natural part of the canvas (no background blur needed).
 * - Mobile (< md): Sticky top-0 edge-to-edge backdrop blur (prevents scrolled text bleed).
 */
export function AdminPageHeader({
  title,
  subtitle,
  backHref,
  backTitle = 'ফিরে যান',
  icon,
  badge,
  actions,
  className = '',
}: AdminPageHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-30 surface-glass-header border-b border-border-default/80 px-4 py-2.5 md:static md:px-0 md:py-0 md:border-0 md:bg-transparent ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
        {/* Left: Back button + Icon + Title + Live Status Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="p-1.5 rounded-md text-ink-secondary hover:text-brand-deep hover:bg-brand-soft/60 transition-[background-color,color,transform] duration-150 active:scale-[0.98] shrink-0"
              title={backTitle}
              aria-label={backTitle}
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
          )}

          {icon && (
            <div className="w-9 h-9 rounded-lg bg-brand-soft border border-brand-light/70 text-brand-deep flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-ink-primary text-sm sm:text-base leading-snug">
                {title}
              </h1>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {subtitle && (
              <p className="text-xs text-ink-secondary truncate mt-0.5 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Primary Action Buttons */}
        {actions && (
          <div className="flex items-center justify-end gap-2 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
