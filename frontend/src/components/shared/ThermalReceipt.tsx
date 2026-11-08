'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { ThermalReceiptData } from '@/features/pos/pos.types';
import { formatCurrency } from '@/lib/decimal';

interface ThermalReceiptProps {
  data: ThermalReceiptData;
  onClose: () => void;
  paperWidth?: '58mm' | '80mm';
}

export function ThermalReceipt({
  data,
  onClose,
  paperWidth = '80mm',
}: ThermalReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const is58mm = paperWidth === '58mm';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-emerald-600" />
            থার্মাল ক্যাশ মেমো রসিদ ({paperWidth})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট দিন
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Slip */}
        <div className="p-4 overflow-x-hidden">
          <div
            className={`thermal-receipt mx-auto font-mono text-black text-xs leading-tight bg-white p-3 border border-dashed border-slate-300 rounded ${
              is58mm ? 'max-w-[58mm]' : 'max-w-[80mm]'
            }`}
          >
            {/* Header: Store Identity */}
            <div className="text-center pb-2 border-b border-dashed border-black">
              <h2 className="text-base font-black tracking-tight uppercase">
                {data.storeInfo.name}
              </h2>
              <p className="text-[11px]">{data.storeInfo.tagline}</p>
              <p className="text-[10px] mt-0.5">{data.storeInfo.address}</p>
              <p className="text-[10px]">{data.storeInfo.market}</p>
              <p className="text-[11px] font-bold mt-1">মোবাইল: {data.storeInfo.phone}</p>
            </div>

            {/* Meta: Invoice & Date */}
            <div className="py-2 border-b border-dashed border-black text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>মেমো নং:</span>
                <span className="font-bold">{data.invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>তারিখ ও সময়:</span>
                <span>{data.invoice.date} {data.invoice.time}</span>
              </div>
              <div className="flex justify-between">
                <span>বিক্রয় ধরন:</span>
                <span className="font-bold">{data.invoice.saleType}</span>
              </div>

              {/* Customer Due Khata Details */}
              {data.customer && (
                <div className="pt-1 mt-1 border-t border-dotted border-black/60">
                  <div className="flex justify-between">
                    <span>খদ্দের:</span>
                    <span className="font-bold">{data.customer.name}</span>
                  </div>
                  {data.customer.phone && (
                    <div className="flex justify-between">
                      <span>ফোন:</span>
                      <span>{data.customer.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>পূর্বের বকেয়া:</span>
                    <span>{formatCurrency(data.customer.previousDue, false)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-dashed border-black">
              <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-black">
                <span className="w-1/2">বিবরণ</span>
                <span className="w-1/4 text-center">পরিমাণ</span>
                <span className="w-1/4 text-right">টাকা</span>
              </div>

              <div className="divide-y divide-dotted divide-black/40 text-[11px] pt-1">
                {data.items.map((item, idx) => (
                  <div key={idx} className="py-1">
                    <div className="font-bold">{item.name}</div>
                    <div className="flex justify-between text-[10px] text-black/80">
                      <span>{item.rate}/দর</span>
                      <span>{item.qty} {item.unit}</span>
                      <span className="font-bold text-black">{item.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary & Settlement Math */}
            <div className="py-2 border-b border-dashed border-black text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>মোট আইটেম বিল:</span>
                <span>{formatCurrency(data.summary.subTotal, false)}</span>
              </div>
              {data.summary.discount > 0 && (
                <div className="flex justify-between text-black">
                  <span>বিশেষ ছাড় (-):</span>
                  <span>{formatCurrency(data.summary.discount, false)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-0.5 border-t border-black">
                <span>সর্বমোট বিল:</span>
                <span>{formatCurrency(data.summary.grandTotal, false)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-800">
                <span>নগদ গ্রহণ:</span>
                <span>{formatCurrency(data.summary.cashPaid, false)}</span>
              </div>

              {/* Running Khata Balance */}
              <div className="flex justify-between pt-1 border-t border-dotted border-black">
                <span>এই মেমোর বাকি:</span>
                <span className="font-bold">{formatCurrency(data.summary.invoiceDue, false)}</span>
              </div>
              {data.customer && (
                <div className="flex justify-between font-black text-xs pt-0.5 bg-black/5 p-1 rounded">
                  <span>খাতার মোট অবশিষ্ট বকেয়া:</span>
                  <span>{formatCurrency(data.summary.customerTotalDueAfterSale, false)}</span>
                </div>
              )}
            </div>

            {/* Footer Blessing / Note */}
            <div className="pt-2 text-center text-[10px] space-y-0.5">
              <p className="font-bold">ধন্যবাদ, আবার আসবেন!</p>
              <p className="text-[9px]">বিক্রিত মাল ফেরত বা পরিবর্তনযোগ্য নয়</p>
              <p className="text-[8px] text-black/60 pt-1">সফটওয়্যার: ইদ্রিস ব্রাদার্স পিওএস সিস্টেম</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
