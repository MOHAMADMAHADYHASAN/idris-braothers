'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Buildings,
  Phone,
  MapPin,
  WarningCircle,
  Spinner,
} from '@phosphor-icons/react';
import { formatCurrency, formatNumber, formatDateTimeBn } from '@/lib/decimal';
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
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner size={32} weight="bold" className="animate-spin text-brand-deep" />
          <p className="text-xs font-semibold text-ink-secondary">চালানের বিবরণ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-surface-canvas flex flex-col items-center justify-center p-6">
        <WarningCircle size={40} weight="fill" className="text-danger mb-2" />
        <h2 className="text-base font-bold text-ink-primary">চালানটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-xs text-ink-secondary mt-1 mb-4">চালান নম্বরটি সঠিক কিনা যাচাই করুন।</p>
        <Link
          href="/purchases"
          className="px-4 py-2 rounded-lg bg-brand-deep hover:bg-brand-hover text-white text-xs font-semibold"
        >
          চালান তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  const dateStr = formatDateTimeBn(purchase.createdAt);

  return (
    <div className="min-h-screen bg-surface-canvas pb-20 font-sans print:bg-white print:pb-0">
      {/* ১. টপ স্টিকি হেডার */}
      <header className="sticky top-0 z-40 bg-surface-card border-b border-border-default shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/purchases"
              className="p-2 rounded-lg text-ink-secondary hover:text-brand-deep hover:bg-brand-soft border border-border-default transition-colors"
              title="চালান তালিকায় ফিরুন"
              aria-label="চালান তালিকায় ফিরুন"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-ink-primary">
                  মোকাম চালান #{purchase.purchaseNumber}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                    purchase.dueAmount > 0
                      ? 'bg-due-bg text-due-text border-due-border'
                      : 'bg-cash-bg text-cash-text border-cash-border'
                  }`}
                >
                  {purchase.dueAmount > 0 ? 'বকেয়া চালান' : 'পরিশোধিত'}
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5 font-mono tabular-nums">{dateStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-brand-deep hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer size={15} weight="bold" />
              <span>চালান প্রিন্ট</span>
            </button>
          </div>
        </div>
      </header>

      {/* ২. চালান ভাউচার ক্যানভাস */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 print:p-0 print:max-w-none">
        <div className="bg-surface-card rounded-xl border border-border-default shadow-sm p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
          {/* ইনভয়েস হেডার */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-border-default pb-6 gap-4">
            <div>
              <span className="text-xs font-bold text-ink-secondary">
                ক্রেতা ও গদি
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-ink-primary mt-0.5">
                মেসার্স ইদ্রিস ব্রাদার্স
              </h2>
              <p className="text-xs text-ink-secondary">মরিচপট্টি, ফেনী বাজার, ফেনী</p>
              <p className="text-xs text-ink-secondary">পাইকারি ও খুচরা মুদি-মসলা আড়ত</p>
            </div>

            <div className="sm:text-right font-mono">
              <span className="text-xs font-bold text-ink-secondary font-sans">
                চালান পরিচিতি
              </span>
              <div className="text-base sm:text-lg font-bold text-ink-primary mt-0.5">
                #{purchase.purchaseNumber}
              </div>
              <div className="text-xs text-ink-secondary mt-0.5 font-sans">{dateStr}</div>
            </div>
          </div>

          {/* মহাজন ও সরবরাহকারীর কার্ড */}
          {purchase.supplier && (
            <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-ink-secondary block mb-0.5">
                  মহাজন ও মোকামের তথ্য
                </span>
                <div className="font-bold text-ink-primary text-sm sm:text-base flex items-center gap-2">
                  <Buildings size={16} weight="bold" className="text-brand-deep" />
                  <span>{purchase.supplier.companyName || purchase.supplier.name}</span>
                </div>
                {purchase.supplier.companyName && (
                  <p className="text-xs text-ink-body mt-0.5">স্বত্বাধিকারী: {purchase.supplier.name}</p>
                )}
                {purchase.supplier.address && (
                  <p className="text-xs text-ink-secondary flex items-center gap-1 mt-0.5">
                    <MapPin size={12} weight="bold" />
                    <span>{purchase.supplier.address}</span>
                  </p>
                )}
              </div>

              {purchase.supplier.phone && (
                <div className="text-xs text-ink-body flex items-center gap-1 font-mono font-semibold">
                  <Phone size={13} weight="bold" />
                  <span>{purchase.supplier.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* চালান আইটেম টেবিল */}
          <div>
            <h3 className="text-sm font-bold text-ink-primary mb-2.5">
              রিসিভকৃত পণ্যের বিবরণী ({formatNumber((purchase.items || []).length)}টি আইটেম)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border-default">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-subtle text-xs font-bold text-ink-secondary border-b border-border-default">
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3">পণ্যের নাম</th>
                    <th className="py-2.5 px-3">ক্রয় একক</th>
                    <th className="py-2.5 px-3 text-right">চালান পরিমাণ</th>
                    <th className="py-2.5 px-3 text-right">কেনা দর (৳)</th>
                    <th className="py-2.5 px-3 text-right">মোট টাকা (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {(purchase.items || []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-subtle/50">
                      <td className="py-2.5 px-3 text-center font-mono text-ink-secondary">
                        {formatNumber(idx + 1)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-ink-primary text-xs sm:text-sm">
                          {item.variant?.product?.id || item.product?.id ? (
                            <Link
                              href={`/products/${item.variant?.product?.id || item.product?.id}`}
                              className="hover:underline hover:text-brand-deep"
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
                          <span className="text-xs text-brand-deep font-semibold">
                            ভ্যারিয়েন্ট: {item.variant.variantName}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-surface-subtle text-ink-body border border-border-default">
                          {item.unitName}
                        </span>
                        {item.conversionFactor > 1 && (
                          <span className="text-xs text-ink-secondary font-mono block mt-0.5">
                            ১ {item.unitName} = {formatNumber(item.conversionFactor)} {item.variant?.baseUnitName || item.product?.baseUnitName || 'কেজি'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-ink-primary">
                        {formatNumber(item.quantity)}{' '}
                        <span className="text-ink-secondary font-normal font-sans text-xs">
                          {item.unitName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-ink-body">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-ink-primary">
                        {formatCurrency(item.subTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* আর্থিক হিসাব সামারি */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-default">
              <span className="text-xs font-bold text-ink-secondary block mb-1">
                অভ্যন্তরীণ নোট ও মন্তব্য
              </span>
              <p className="text-xs text-ink-body">
                {purchase.note || 'এই চালানে কোনো বিশেষ নোট যুক্ত করা হয়নি।'}
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-ink-secondary">
                <span className="font-sans">পণ্যের উপমোট:</span>
                <span>{formatCurrency(purchase.subTotal)}</span>
              </div>
              {purchase.transportCost > 0 && (
                <div className="flex justify-between text-ink-secondary">
                  <span className="font-sans">(+) গাড়িভাড়া ও কুলি খরচ:</span>
                  <span>{formatCurrency(purchase.transportCost)}</span>
                </div>
              )}
              {purchase.discount > 0 && (
                <div className="flex justify-between text-ink-secondary">
                  <span className="font-sans">(-) মহাজন ছাড় ও কমিশন:</span>
                  <span>{formatCurrency(purchase.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border-default flex justify-between font-bold text-brand-deep text-sm">
                <span className="font-sans">সর্বমোট চালান ব্যয়:</span>
                <span>{formatCurrency(purchase.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-cash-text font-semibold">
                <span className="font-sans">নগদ পরিশোধ:</span>
                <span>{formatCurrency(purchase.paidAmount)}</span>
              </div>
              <div
                className={`pt-1.5 border-t border-border-subtle flex justify-between font-bold ${
                  purchase.dueAmount > 0 ? 'text-due-text text-sm' : 'text-ink-secondary'
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
