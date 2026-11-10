'use client';

import React from 'react';
import { Tag, Package, Stack } from '@phosphor-icons/react';

interface BasicInfoCardProps {
  name: string;
  setName: (v: string) => void;
  banglaName: string;
  setBanglaName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  hasVariants: boolean;
  setHasVariants: (v: boolean) => void;
  isEditMode: boolean;
}

export function BasicInfoCard({
  name,
  setName,
  banglaName,
  setBanglaName,
  description,
  setDescription,
  hasVariants,
  setHasVariants,
  isEditMode,
}: BasicInfoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-indigo-50 text-indigo-600">
            <Tag size={16} weight="bold" />
          </span>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            ১. মৌলিক পণ্যের বিবরণ
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">আবশ্যকীয় ফিল্ডসমূহ</span>
      </div>

      <div className="p-5 space-y-4">
        {/* পণ্যের নাম (English / Primary) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            পণ্যের নাম (English / Primary Name) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="উদাঃ Teer Soybean Oil / Miniket Rice 50kg"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-900 font-medium placeholder:text-slate-400"
          />
        </div>

        {/* বাংলা নাম (বাংলা ইনভয়েস ও মেমোর জন্য) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            বাংলা নাম (মেমো ও চালানের মুদ্রণ ফরম্যাট)
          </label>
          <input
            type="text"
            value={banglaName}
            onChange={(e) => setBanglaName(e.target.value)}
            placeholder="উদাঃ তীর সয়াবিন তেল / মিনিকেট চাল ৫০ কেজি"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* পণ্যের ধরণ নির্বাচন (একক পণ্য বনাম ভ্যারিয়েন্ট) */}
        <div className="pt-1">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            পণ্যের ধরণ নির্বাচন করুন <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* একক পণ্য বাটন */}
            <button
              type="button"
              onClick={() => setHasVariants(false)}
              className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                !hasVariants
                  ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/30 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  !hasVariants ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Package size={20} weight="bold" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">একক পণ্য (Single Product)</div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  নির্দিষ্ট এক সাইজ বা ওজনের পণ্য। যেমন: প্যাকেট লবণ, খোলা চিনি বা ৫০ কেজির আটার বস্তা।
                </p>
              </div>
            </button>

            {/* ভ্যারিয়েন্ট পণ্য বাটন */}
            <button
              type="button"
              onClick={() => setHasVariants(true)}
              className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                hasVariants
                  ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/30 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  hasVariants ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Stack size={20} weight="bold" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">ভ্যারিয়েন্ট পণ্য (Multi-Size)</div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  একাধিক সাইজ বা ওজনে বিক্রি হয়। যেমন: তেল (৫০০ মিলি, ১ লিটার, ৫ লিটার) যার প্রতিটির আলাদা দাম ও বারকোড থাকে।
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* বিবরণ / নোট */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            বিবরণ বা অভ্যন্তরীণ নোট (ঐচ্ছিক)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="পণ্য সম্পর্কিত বিশেষ বিবরণ, পাইকারি লট বা ব্র্যান্ডের তথ্য..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
}
