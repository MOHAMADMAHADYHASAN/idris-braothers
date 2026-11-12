'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { usePurchaseStore } from '../../usePurchaseStore';
import { PurchaseStickyHeader } from './PurchaseStickyHeader';
import { ChallanHeaderCard } from './ChallanHeaderCard';
import { ChallanItemPickerCard } from './ChallanItemPickerCard';
import { ChallanSettlementCard } from './ChallanSettlementCard';
import { ChallanItemMatrixCard } from './ChallanItemMatrixCard';
import { WarningCircle } from '@phosphor-icons/react';
import { confirmAction, toast } from '@/lib/feedback';

export function PurchaseChallanClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    supplierId,
    items,
    isSubmitting,
    draftError,
    submitChallan,
    resetDraft,
  } = usePurchaseStore();

  const handleSave = async () => {
    if (!supplierId) {
      toast.warning('অনুগ্রহ করে আগে মহাজন বা আড়তের গদি নির্বাচন করুন!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (items.length === 0) {
      toast.warning('চালানে কমপক্ষে একটি পণ্য যোগ করতে হবে!');
      return;
    }

    try {
      const created = await submitChallan();
      toast.success(`চালান #${created.purchaseNumber} সফলভাবে এন্ট্রি হয়েছে এবং মজুত স্টক বৃদ্ধি পেয়েছে!`);
      startTransition(() => {
        router.push('/purchases');
      });
    } catch (err) {
      // Error is set in store (draftError)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = async () => {
    if (items.length > 0) {
      const ok = await confirmAction({
        title: 'খসড়া চালান রিসেট',
        message: 'আপনি কি নিশ্চিত যে সম্পূর্ণ খসড়া চালান মুছে নতুন করে শুরু করতে চান?',
        confirmLabel: 'হ্যাঁ, রিসেট করুন',
        tone: 'warning',
      });
      if (!ok) {
        return;
      }
    }
    resetDraft();
  };

  return (
    <div className="min-h-screen bg-surface-canvas pb-20 font-sans">
      {/* ১. টপ স্টিকি অ্যাকশন বার */}
      <PurchaseStickyHeader
        isSubmitting={isSubmitting || isPending}
        itemCount={items.length}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* ২. মূল কন্টেন্ট ক্যানভাস */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* এরর ব্যানার */}
        {draftError && (
          <div className="p-4 rounded-xl bg-due-bg border border-due-border text-due-text flex items-start gap-3 shadow-2xs animate-in fade-in duration-150">
            <WarningCircle size={18} weight="fill" className="text-due-text shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs sm:text-sm">চালান সংরক্ষণে সমস্যা:</div>
              <div className="text-xs mt-0.5">{draftError}</div>
            </div>
          </div>
        )}

        {/* ৩. অ্যাসিমেট্রিক ২-কলাম গ্রিড (Desktop 66% - 33%) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* বাম পাশ: মূল চালান ক্যানভাস (৬৬% প্রস্থ) */}
          <div className="lg:col-span-2 space-y-6">
            {/* কার্ড ১: চালান ও মহাজন বিবরণ */}
            <ChallanHeaderCard />

            {/* কার্ড ২: পণ্য যোগ করার বার */}
            <ChallanItemPickerCard />
          </div>

          {/* ডান পাশ: স্টিকি আর্থিক নিষ্পত্তি সাইডবার (৩৩% প্রস্থ) */}
          <div className="lg:col-span-1">
            <ChallanSettlementCard />
          </div>
        </div>

        {/* ৪. বটম ফুল-উইডথ সেকশন (১০০% অনুভূমিক স্থান) — চালান আইটেম ম্যাট্রিক্স */}
        <div className="pt-2">
          <ChallanItemMatrixCard />
        </div>
      </main>
    </div>
  );
}
