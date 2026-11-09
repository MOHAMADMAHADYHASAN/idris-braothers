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
          className="fixed top-3.5 right-4 z-50 flex items-center gap-2 bg-slate-900 text-slate-200 hover:text-white px-3 py-1.5 rounded-md border border-slate-700 shadow-md text-xs font-medium transition-[background-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>শাটার নামান (দোকান বন্ধ)</span>
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* 2. Fullscreen Rolling Shutter Curtain */}
      <div
        className={`fixed inset-0 z-50 w-full h-screen overflow-hidden select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? '-translate-y-full opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Fullscreen Background Store Photograph */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100"
          style={{
            backgroundImage: `url('${imageSrc}')`,
          }}
        />

        {/* Realistic Metallic Rolling Shutter Texture & Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.45) 0px,
              rgba(0, 0, 0, 0.45) 3px,
              rgba(255, 255, 255, 0.09) 4px,
              transparent 5px,
              transparent 22px
            )`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/80 pointer-events-none" />

        {/* Center Content & Branding */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 py-10 md:py-14 text-center">
          
          {/* Top Shop Status Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-md border border-amber-500/30 text-xs font-medium tracking-wide text-amber-300 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>দোকানের শাটার নামানো • সকালের কাউন্টার শুরু করুন</span>
          </div>

          {/* Main Shutter Branding Box */}
          <div className="max-w-2xl mx-auto space-y-3 px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400 shadow-lg mb-1">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
              {storeName}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium drop-shadow-sm">
              {storeTagline}
            </p>

            {/* Shutter Pull Button */}
            <div className="pt-3 flex flex-col items-center">
              <button
                onClick={rollUpShutter}
                className="group relative inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-md shadow-lg transition-[background-color,transform] duration-150 active:scale-[0.98] cursor-pointer border border-amber-300"
              >
                <svg className="w-4 h-4 transition-transform duration-150 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>শাটার তুলুন (দোকান খুলুন)</span>
              </button>
            </div>
          </div>

          {/* Bottom Shutter Lock Handle & Scroll Prompt */}
          <div
            onClick={rollUpShutter}
            className="flex flex-col items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer group pb-2"
          >
            <span className="text-xs font-semibold tracking-widest uppercase opacity-80 group-hover:opacity-100">
              নিচে স্ক্রোল করুন
            </span>
            <div className="w-7 h-11 border-2 border-slate-300/60 group-hover:border-amber-400 rounded-full flex items-start justify-center p-1.5 transition-colors">
              <div className="w-1.5 h-2.5 bg-amber-400 rounded-full animate-bounce" />
            </div>
          </div>

        </div>

        {/* Realistic Metallic Bottom Rail Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-2xl border-t border-amber-300/40" />
      </div>
    </>
  );
}
