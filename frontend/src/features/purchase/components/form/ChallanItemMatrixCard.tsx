'use client';

import React from 'react';
import { Package, Trash, Receipt } from '@phosphor-icons/react';
import { formatCurrency, formatNumber } from '@/lib/decimal';
import { usePurchaseStore } from '../../usePurchaseStore';

export function ChallanItemMatrixCard() {
  const { items, removeItem } = usePurchaseStore();

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalSubTotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
      {/* কার্ড হেডার */}
      <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep">
            <Receipt size={16} weight="bold" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-ink-primary flex items-center gap-2 flex-wrap">
              চালানভুক্ত পণ্যের তালিকা ও স্টক-ইন ম্যাট্রিক্স
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-soft text-brand-deep border border-brand-light">
                {formatNumber(items.length)}টি আইটেম
              </span>
            </h2>
          </div>
        </div>
        {items.length > 0 && (
          <div className="text-xs font-mono text-ink-secondary font-medium">
            মোট পরিমাণ: <span className="text-ink-primary font-bold">{formatNumber(totalQuantity)}</span> | আইটেম উপমোট:{' '}
            <span className="text-brand-deep font-bold">{formatCurrency(totalSubTotal)}</span>
          </div>
        )}
      </div>

      {/* ফুল-উইডথ টেবিল */}
      <div className="overflow-x-auto">
        {items.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Package size={36} weight="duotone" className="text-ink-muted mx-auto mb-2" />
            <h4 className="text-sm font-bold text-ink-primary">
              চালানে এখনও কোনো পণ্য যোগ করা হয়নি
            </h4>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs min-w-[750px]">
            <thead>
              <tr className="bg-surface-subtle/80 border-b border-border-default text-xs font-bold text-ink-secondary">
                <th className="py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-3">পণ্যের নাম ও সাইজ</th>
                <th className="py-2.5 px-3">ক্রয় একক ও ফ্যাক্টর</th>
                <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                <th className="py-2.5 px-3 text-right">কেনা দর (৳)</th>
                <th className="py-2.5 px-3 text-right">মোট টাকা (৳)</th>
                <th className="py-2.5 px-3">নতুন বিক্রয়দর আপডেট</th>
                <th className="py-2.5 px-3 text-center w-12">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.map((item, idx) => {
                const totalBaseWeight = item.quantity * item.conversionFactor;
                const lineTotal = item.quantity * item.unitCost;

                return (
                  <tr key={idx} className="hover:bg-surface-subtle/60 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-ink-secondary text-xs">
                      {formatNumber(idx + 1)}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-bold text-ink-primary text-xs sm:text-sm block">
                        {item.productName || 'অজ্ঞাত পণ্য'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-surface-subtle text-ink-body border border-border-default">
                        {item.unitName}
                      </span>
                      {item.conversionFactor > 1 && (
                        <div className="text-xs text-ink-secondary mt-0.5 font-mono">
                          ১ {item.unitName} = {formatNumber(item.conversionFactor)} {item.baseUnitName}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <span className="font-bold text-ink-primary text-xs sm:text-sm">
                        {formatNumber(item.quantity)}
                      </span>
                      {item.conversionFactor > 1 && (
                        <div className="text-xs text-brand-deep font-sans font-medium mt-0.5">
                          ({formatNumber(totalBaseWeight)} {item.baseUnitName})
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-ink-primary text-xs sm:text-sm">
                      {formatCurrency(item.unitCost)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-ink-primary text-xs sm:text-sm">
                      {formatCurrency(lineTotal)}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-xs tabular-nums">
                      {item.newRetailPrice || item.newWholesalePrice ? (
                        <div className="space-y-0.5">
                          {item.newRetailPrice && (
                            <div className="text-cash-text font-semibold">
                              খুচরা: {formatCurrency(item.newRetailPrice)}
                            </div>
                          )}
                          {item.newWholesalePrice && (
                            <div className="text-wholesale-text font-semibold">
                              পাইকারি: {formatCurrency(item.newWholesalePrice)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-ink-secondary text-xs font-sans">— অপরিবর্তিত —</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center w-12">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1.5 rounded text-ink-secondary hover:text-due-text hover:bg-due-bg transition-colors cursor-pointer"
                        title="আইটেমটি চালানের তালিকা থেকে বাদ দিন"
                      >
                        <Trash size={14} weight="bold" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
