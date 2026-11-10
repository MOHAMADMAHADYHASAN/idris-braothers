'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface StoreShutterHeroProps {
  storeName?: string;
  storeTagline?: string;
  imageSrc?: string;
}

export function StoreShutterHero({
  storeName = 'ইদ্রিস ব্রাদার্স',
  storeTagline = 'মুদি ও মসলার আড়ত • মরিচপট্টি, ফেনী বাজার',
  imageSrc = '/images/shutter/store_shutter.jpg',
}: StoreShutterHeroProps) {
  const [isOpen, setIsOpen] = useState(false);

  const rollUpShutter = useCallback(() => {
    setIsOpen(true);
  }, []);

  const rollDownShutter = useCallback(() => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen for scroll, mouse wheel, or touch swipe up
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
      {/* 1. Floating Toggle Button (Appears on top-right when shutter is open so user can close shop if needed) */}
      {isOpen && (
        <button
          onClick={rollDownShutter}
          title="দোকানের শাটার নামান (দোকান বন্ধ করুন)"
          className="fixed top-3.5 right-4 z-50 flex items-center gap-2 bg-slate-900 text-slate-200 hover:text-white px-3 py-1.5 rounded-none border border-slate-700 shadow-md text-xs font-medium transition-[background-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>শাটার নামান (দোকান বন্ধ)</span>
        </button>
      )}

      {/* 2. Fullscreen Rolling Shutter Curtain */}
      <div
        className={`fixed inset-0 z-50 w-full h-screen overflow-hidden select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? '-translate-y-full opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
      >
        {/* Fullscreen Background Store Photograph */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${imageSrc}')`,
          }}
        />

        {/* Clean Matte Black Overlay (No Scanlines) */}
        <div className="absolute inset-0 bg-black/65 pointer-events-none" />

        {/* Center Minimal Editorial Branding & Action */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          <div className="max-w-xl mx-auto flex flex-col items-center">
            {/* Store Name */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
              {storeName}
            </h1>

            {/* Hairline Divider */}
            <div className="w-16 h-px bg-white/40 my-4" />

            {/* Single-line Subtitle */}
            <p className="text-white/85 text-xs sm:text-sm font-normal tracking-wide">
              {storeTagline}
            </p>

            {/* Eagle-style Bordered Info Strip */}
            <div className="mt-6 border border-white/25 bg-black/35 px-4 py-2 flex items-center justify-center gap-x-3 sm:gap-x-4 text-[11px] sm:text-xs text-white/85 tracking-wide whitespace-nowrap">
              <span>পাইকারি ও খুচরা</span>
              <span className="text-white/30">|</span>
              <span>POS ক্যাশ ও খাতা</span>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="hidden sm:inline">ফেনী বড় বাজার</span>
            </div>

            {/* Single Flat Amber CTA Button (No Icon, Sharp Edge) */}
            <div className="mt-8 flex flex-col items-center">
              <button
                type="button"
                onClick={rollUpShutter}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm px-8 py-3 rounded-none transition-colors duration-150 active:scale-[0.99] cursor-pointer tracking-wide"
              >
                শাটার তুলুন (দোকান খুলুন)
              </button>

              <span className="mt-3 text-[11px] text-white/65 tracking-wider">
                সকালের কাউন্টার শুরু করুন
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
