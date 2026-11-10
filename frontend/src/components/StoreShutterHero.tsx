'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface StoreShutterHeroProps {
  storeName?: string;
  storeTagline?: string;
  imageSrc?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideFloatingTrigger?: boolean;
}

export function StoreShutterHero({
  storeName = 'ইদ্রিস ব্রাদার্স',
  storeTagline = 'মরিচপট্টি, ফেনী বাজার',
  imageSrc = '/images/shutter/store_shutter.jpg',
  isOpen: controlledOpen,
  onOpenChange,
  hideFloatingTrigger = false,
}: StoreShutterHeroProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpenState = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange]
  );

  const rollUpShutter = useCallback(() => {
    setOpenState(true);
  }, [setOpenState]);

  const rollDownShutter = useCallback(() => {
    setOpenState(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setOpenState]);

  // Listen for scroll, mouse wheel, or touch swipe up while shutter is down
  useEffect(() => {
    if (isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 15) {
        rollUpShutter();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchCurrentY = e.touches[0].clientY;
      if (touchStartY - touchCurrentY > 30) {
        rollUpShutter();
      }
    };

    const handleScroll = () => {
      if (window.scrollY > 20) {
        rollUpShutter();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, rollUpShutter]);

  return (
    <>
      {/* Standalone fallback trigger if rendered without Dashboard header integration */}
      {!hideFloatingTrigger && isOpen && (
        <button
          type="button"
          onClick={rollDownShutter}
          title="দোকানের শাটার নামান (দোকান বন্ধ করুন)"
          className="fixed top-3.5 right-4 z-50 flex items-center gap-2 bg-brand-deep hover:bg-brand-hover text-white px-3 py-1.5 rounded-lg border border-brand-mid shadow-md text-xs font-semibold transition-[background-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>শাটার নামান</span>
        </button>
      )}

      {/* Fullscreen Rolling Shutter Curtain (Minimal Matte Editorial View) */}
      <div
        className={`fixed inset-0 z-50 w-full h-screen overflow-hidden select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? '-translate-y-full opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
      >
        {/* Background Store Photograph */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${imageSrc}')`,
          }}
        />

        {/* Clean Matte Black Overlay */}
        <div className="absolute inset-0 bg-black/65 pointer-events-none" />

        {/* Center Branding & Single Flat Amber CTA */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          <div className="max-w-xl mx-auto flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              {storeName}
            </h1>

            <div className="w-16 h-px bg-white/40 my-4" />

            <p className="text-white/90 text-xs sm:text-sm font-normal">
              {storeTagline}
            </p>

            {/* Bordered Info Strip */}
            <div className="mt-6 border border-white/25 bg-black/35 px-4 py-2 flex items-center justify-center gap-x-3 sm:gap-x-4 text-xs text-white/90 whitespace-nowrap">
              <span>পাইকারি ও খুচরা</span>
              <span className="text-white/30">|</span>
              <span>পিওএস ক্যাশ ও খাতা</span>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <button
                type="button"
                onClick={rollUpShutter}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm px-8 py-3 rounded-none transition-colors duration-150 active:scale-[0.99] cursor-pointer"
              >
                শাটার তুলুন • দোকান খুলুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
