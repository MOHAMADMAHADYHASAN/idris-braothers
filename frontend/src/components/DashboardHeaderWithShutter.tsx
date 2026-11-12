'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Storefront, ShoppingCart, ArrowRight, LockKey } from '@phosphor-icons/react';
import { StoreShutterHero } from '@/components/StoreShutterHero';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';

export function DashboardHeaderWithShutter() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseShutter = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <StoreShutterHero
        storeName="ইদ্রিস ব্রাদার্স"
        storeTagline="মরিচপট্টি, ফেনী বাজার"
        imageSrc="/images/shutter/store_shutter.jpg"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        hideFloatingTrigger
      />

      {/* Unified Max-W-7XL Header (Zero Floating Overlap) */}
      <header className="surface-glass-header border-b border-border-default/80 sticky top-0 z-30 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-brand-deep text-white flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(30,74,122,0.18)]">
              <Storefront size={20} weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-sm sm:text-base text-ink-primary leading-snug">
                  ইদ্রিস ব্রাদার্স
                </h1>
                <Badge variant="cash">কাউন্টার চালু</Badge>
              </div>
              <p className="text-xs text-ink-secondary truncate">
                মরিচপট্টি, ফেনী বাজার
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCloseShutter}
              title="দোকানের শাটার নামান"
            >
              <LockKey size={14} weight="bold" className="text-ink-secondary" />
              <span className="hidden sm:inline">শাটার নামান</span>
            </Button>

            <Link
              href="/pos"
              className={buttonClasses({ variant: 'primary', size: 'sm' })}
            >
              <ShoppingCart size={16} weight="bold" />
              <span>পিওএস ক্যাশ কাউন্টার</span>
              <ArrowRight size={14} weight="bold" className="hidden sm:block" />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
