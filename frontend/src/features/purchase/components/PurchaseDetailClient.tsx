'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Package,
  Buildings,
  Phone,
  MapPin,
  CalendarBlank,
  Truck,
  Tag,
  Coins,
  CheckCircle,
  WarningCircle,
  Spinner,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { Purchase } from '../purchase.types';
import { usePurchaseStore } from '../usePurchaseStore';

interface PurchaseDetailClientProps {
  purchaseId: string;
}

export function PurchaseDetailClient({ purchaseId }: PurchaseDetailClientProps) {
  const { fetchPurchaseById, selectedPurchase } = usePurchaseStore();
  const [purchase, setPurchase] = useState<Purchase | null>(
    selectedPurchase?.id === purchaseId ? selectedPurchase : null
  );
  const [isLoading, setIsLoading] = useState(!purchase);

  useEffect(() => {
    if (!purchase || purchase.id !== purchaseId) {
      setIsLoading(true);
      fetchPurchaseById(purchaseId)
        .then((p) => {
          if (p) setPurchase(p);
        })
        .finally(() => setIsLoading(false));
    }
  }, [purchaseId, purchase, fetchPurchaseById]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner size={32} weight="bold" className="animate-spin text-slate-700" />
          <p className="text-xs font-semibold text-slate-600">চালানের বিবরণ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <WarningCircle size={40} weight="fill" className="text-rose-500 mb-2" />
        <h2 className="text-base font-bold text-slate-900">চালানটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">চালান নম্বরটি সঠিক কিনা যাচাই করুন।</p>
        <Link
          href="/purchases"
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          চালান তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  const dateStr = new Date(purchase.createdAt).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 font-sans print:bg-white print:pb-0">
      {/* ১. টপ স্টিকি হেডার (প্রিন্টে লুকানো থাকবে) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/purchases"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="চালান তালিকায় ফিরুন"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  মোকাম চালান #{purchase.purchaseNumber}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    purchase.dueAmount > 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {purchase.dueAmount > 0 ? 'বকেয়া চালান' : 'পরিশোধিত'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">{dateStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer size={15} weight="bold" />
              <span>চালান প্রিন্ট</span>
            </button>
          </div>
        </div>
      </header>

      {/* ২. চালান ভাউচার ক্যানভাস (A4 স্ট্যান্ডার্ড) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 print:p-0 print:max-w-none">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
          {/* ইনভয়েস হেডার ও মেসার্স তথ্য */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-200/80 pb-6 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                ক্রেতা ও গদি
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                মেসার্স ইদ্রিস ব্রাদার্স
              </h2>
              <p className="text-xs text-slate-500">মরিচপট্টি, ফেনী বাজার, ফেনী</p>
              <p className="text-xs text-slate-500">পাইকারি ও খুচরা মুদি-মসলা আড়ত</p>
            </div>

            <div className="sm:text-right font-mono">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">
                চালান পরিচিতি
              </span>
              <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                #{purchase.purchaseNumber}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-sans">{dateStr}</div>
            </div>
          </div>

          {/* মহাজন ও সরবরাহকারীর কার্ড */}
          {purchase.supplier && (
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  মহাজন ও মোকামের তথ্য
                </span>
                <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Buildings size={16} weight="bold" className="text-slate-500" />
                  <span>{purchase.supplier.companyName || purchase.supplier.name}</span>
                </div>
                {purchase.supplier.companyName && (
                  <p className="text-xs text-slate-600 mt-0.5">সত্ত্বাধিকারী: {purchase.supplier.name}</p>
                )}
                {purchase.supplier.address && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} weight="bold" />
                    <span>{purchase.supplier.address}</span>
                  </p>
                )}
              </div>

              {purchase.supplier.phone && (
                <div className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                  <Phone size={13} weight="bold" />
                  <span>{purchase.supplier.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* চালান আইটেম টেবিল */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              রিসিভকৃত পণ্যের বিবরণী ({(purchase.items || []).length}টি আইটেম)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3">পণ্যের নাম</th>
                    <th className="py-2.5 px-3">ক্রয় একক</th>
                    <th className="py-2.5 px-3 text-right">চালান পরিমাণ</th>
                    <th className="py-2.5 px-3 text-right">কেনা দর (৳)</th>
                    <th className="py-2.5 px-3 text-right">মোট টাকা (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {(purchase.items || []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                          {item.variant?.product?.id || item.product?.id ? (
                            <Link
                              href={`/products/${item.variant?.product?.id || item.product?.id}`}
                              className="hover:underline hover:text-blue-700"
                            >
                              {item.variant?.product?.banglaName ||
                                item.variant?.product?.name ||
                                item.product?.banglaName ||
                                item.product?.name}
                            </Link>
                          ) : (
                            item.variant?.product?.banglaName ||
                            item.variant?.product?.name ||
                            item.product?.banglaName ||
                            item.product?.name ||
                            'অজ্ঞাত পণ্য'
                          )}
                        </div>
                        {item.variant && item.variant.variantName !== 'Regular' && item.variant.variantName !== 'Default' && (
                          <span className="text-[10px] text-indigo-700 font-semibold">
                            ভ্যারিয়েন্ট: {item.variant.variantName}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {item.unitName}
                        </span>
                        {item.conversionFactor > 1 && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            ১ {item.unitName} = {item.conversionFactor} {item.variant?.baseUnitName || item.product?.baseUnitName || 'কেজি'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {item.quantity}{' '}
                        <span className="text-slate-500 font-normal font-sans text-[11px]">
                          {item.unitName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {formatCurrency(item.subTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* আর্থিক হিসাব সামারি কার্ড (২-কলামে বিভক্ত) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* নোট / মন্তব্য */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                অভ্যন্তরীণ নোট ও মন্তব্য
              </span>
              <p className="text-xs text-slate-700">
                {purchase.note || 'এই চালানে কোনো বিশেষ নোট যুক্ত করা হয়নি।'}
              </p>
            </div>

            {/* হিসাব ও নিষ্পত্তি গ্রিড */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">পণ্যের উপমোট:</span>
                <span>{formatCurrency(purchase.subTotal)}</span>
              </div>
              {purchase.transportCost > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">(+) গাড়িভাড়া ও কুলি খরচ:</span>
                  <span>{formatCurrency(purchase.transportCost)}</span>
                </div>
              )}
              {purchase.discount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">(-) মহাজন ছাড় / কমিশন:</span>
                  <span>{formatCurrency(purchase.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span className="font-sans">সর্বমোট চালান ব্যয়:</span>
                <span>{formatCurrency(purchase.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span className="font-sans">নগদ পরিশোধ:</span>
                <span>{formatCurrency(purchase.paidAmount)}</span>
              </div>
              <div
                className={`pt-1 border-t border-slate-100 flex justify-between font-bold ${
                  purchase.dueAmount > 0 ? 'text-rose-600 text-sm' : 'text-slate-500'
                }`}
              >
                <span className="font-sans">মহাজন খাতায় বাকি:</span>
                <span>{formatCurrency(purchase.dueAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
