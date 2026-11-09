'use client';

import React from 'react';
import {
  X,
  Printer,
  Package,
  Buildings,
  Phone,
  MapPin,
  CalendarBlank,
} from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/lib/decimal';
import { usePurchaseStore } from '../usePurchaseStore';

export function PurchaseDetailModal() {
  const { selectedPurchase, isDetailModalOpen, closeDetailModal } = usePurchaseStore();

  if (!isDetailModalOpen || !selectedPurchase) return null;

  const dateStr = new Date(selectedPurchase.createdAt).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white w-full max-w-3xl max-h-[92vh] flex flex-col rounded-lg shadow-2xl border border-slate-200/90 overflow-hidden"
      >
        {/* হেডার */}
        <div className="px-4 py-3 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
              <Package size={18} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  চালানপত্র #{selectedPurchase.purchaseNumber}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <CalendarBlank size={12} weight="bold" />
                  {dateStr}
                </span>
                {selectedPurchase.supplier && (
                  <span className="flex items-center gap-1">
                    <Buildings size={12} weight="bold" />
                    {selectedPurchase.supplier.companyName || selectedPurchase.supplier.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 border border-slate-200/90 rounded-md hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150"
              title="চালান প্রিন্ট করুন"
            >
              <Printer size={15} weight="bold" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>
            <button
              onClick={closeDetailModal}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-[background-color,color] duration-150"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* বডি (স্ক্রলেবল) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* মহাজন বিবরণ কার্ড */}
          {selectedPurchase.supplier && (
            <div className="bg-slate-50/80 p-3 rounded-md border border-slate-200/90 flex items-center justify-between text-xs flex-wrap gap-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  মহাজন ও গদির তথ্য
                </span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {selectedPurchase.supplier.companyName || selectedPurchase.supplier.name}
                </span>
                {selectedPurchase.supplier.companyName && (
                  <span className="text-slate-500 block text-[11px]">মালিক: {selectedPurchase.supplier.name}</span>
                )}
              </div>
              <div className="text-right">
                {selectedPurchase.supplier.phone && (
                  <span className="flex items-center gap-1 font-mono tabular-nums text-slate-600 justify-end text-xs">
                    <Phone size={12} weight="bold" />
                    {selectedPurchase.supplier.phone}
                  </span>
                )}
                {selectedPurchase.supplier.address && (
                  <span className="flex items-center gap-1 text-slate-500 justify-end mt-0.5 text-[11px]">
                    <MapPin size={11} weight="bold" />
                    {selectedPurchase.supplier.address}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* আইটেম টেবিল */}
          <div className="border border-slate-200/90 rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-medium">
                  <th className="py-2 px-3">পণ্যের নাম</th>
                  <th className="py-2 px-3">ইউনিট ও বস্তার সাইজ</th>
                  <th className="py-2 px-3 text-right">পরিমাণ</th>
                  <th className="py-2 px-3 text-right">কেনা দর (টাকা)</th>
                  <th className="py-2 px-3.5 text-right">মোট টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedPurchase.items?.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {item.product?.name || 'অজ্ঞাত পণ্য'}
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 border border-slate-200/80">
                        {item.unitName}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                      ৳{formatCurrency(item.unitCost)}
                    </td>
                    <td className="py-2 px-3.5 text-right font-mono tabular-nums tracking-tight font-bold text-slate-900">
                      ৳{formatCurrency(item.subTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* আর্থিক হিসাব বিবরণী কার্ড */}
          <div className="bg-slate-50/80 p-3.5 rounded-md border border-slate-200/90 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>পণ্য উপমোট (Subtotal):</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                ৳{formatCurrency(selectedPurchase.subTotal)}
              </span>
            </div>
            {selectedPurchase.transportCost > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>গাড়িভাড়া / কুলি (+):</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  +৳{formatCurrency(selectedPurchase.transportCost)}
                </span>
              </div>
            )}
            {selectedPurchase.discount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>চালান ছাড় (-):</span>
                <span className="font-mono tabular-nums font-semibold">
                  -৳{formatCurrency(selectedPurchase.discount)}
                </span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-xs sm:text-sm text-slate-900">
              <span>সর্বমোট চালান বিল (Grand Total):</span>
              <span className="font-mono tabular-nums tracking-tight text-sm sm:text-base">৳{formatCurrency(selectedPurchase.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>নগদ পরিশোধ:</span>
              <span className="font-mono tabular-nums">৳{formatCurrency(selectedPurchase.paidAmount)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-amber-800 text-xs sm:text-sm">
              <span>মহাজন খাতায় বাকি যোগ হয়েছে:</span>
              <span className="font-mono tabular-nums tracking-tight text-sm sm:text-base">৳{formatCurrency(selectedPurchase.dueAmount)}</span>
            </div>
          </div>

          {selectedPurchase.note && (
            <div className="p-2.5 bg-slate-50/80 rounded-md border border-slate-200/80 text-xs text-slate-600">
              <strong className="block text-slate-400 text-[10px] uppercase font-semibold">
                চালান নোট / মন্তব্য
              </strong>
              <span>{selectedPurchase.note}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
