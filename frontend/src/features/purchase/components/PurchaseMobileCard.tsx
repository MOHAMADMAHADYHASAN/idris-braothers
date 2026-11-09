'use client';

import React from 'react';
import { Eye, Truck, Receipt } from '@phosphor-icons/react';
import { Purchase } from '../purchase.types';
import { formatCurrency } from '@/lib/decimal';

interface PurchaseMobileCardProps {
  purchase: Purchase;
  onOpenDetail: (purchase: Purchase) => void;
}

export function PurchaseMobileCard({ purchase, onOpenDetail }: PurchaseMobileCardProps) {
  const isPaid = purchase.dueAmount <= 0;
  const dateStr = new Date(purchase.createdAt).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden transition-[border-color,box-shadow] duration-150">
      {/* ১. ২-লাইন হেডার (Challan # + Date + Status Badge) */}
      <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
              #{purchase.purchaseNumber}
            </span>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {dateStr}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">
            {purchase.supplier?.companyName || purchase.supplier?.name || 'অজ্ঞাত মহাজন'}
          </p>
        </div>

        {/* স্ট্যাটাস ব্যাজ */}
        <div className="shrink-0">
          {isPaid ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              পরিশোধিত
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              বকেয়া চালান
            </span>
          )}
        </div>
      </div>

      {/* ২. কী-ভ্যালু গ্রিড */}
      <div className="p-3 text-xs space-y-2">
        <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              মোকাম / ঠিকানা
            </span>
            <span className="text-slate-600 text-xs truncate block">
              {purchase.supplier?.address || 'মোকাম তথ্য নেই'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              গাড়িভাড়া
            </span>
            <span className="font-mono text-xs tabular-nums text-slate-700 font-semibold">
              {purchase.transportCost > 0 ? `৳${formatCurrency(purchase.transportCost)}` : '০'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              নগদ পরিশোধ
            </span>
            <span className="font-mono text-xs font-bold text-emerald-700 tabular-nums">
              ৳{formatCurrency(purchase.paidAmount)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              সর্বমোট বিল
            </span>
            <span className="font-mono text-sm font-black text-slate-900 tabular-nums">
              ৳{formatCurrency(purchase.grandTotal)}
            </span>
            {purchase.dueAmount > 0 && (
              <span className="block text-[11px] font-mono text-amber-800 font-bold tabular-nums">
                বকেয়া: ৳{formatCurrency(purchase.dueAmount)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ৩. পিনড বটম অ্যাকশন বার */}
      <div className="p-2 bg-slate-50/80 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onOpenDetail(purchase)}
          className="w-full h-9 px-3 rounded-md bg-white border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
        >
          <Eye size={14} weight="bold" />
          <span>চালানপত্র ও চালান আইটেম দেখুন</span>
        </button>
      </div>
    </div>
  );
}
