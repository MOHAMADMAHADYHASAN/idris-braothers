'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, X, DownloadSimple, Copy, Check } from '@phosphor-icons/react';
import { ThermalReceiptData } from '@/features/pos/pos.types';
import { formatCurrency, formatNumber, toBanglaDigits } from '@/lib/decimal';
import { downloadEscPosFile, generateEscPosCommands } from '@/lib/escpos';

interface ThermalReceiptProps {
  data: ThermalReceiptData;
  onClose: () => void;
  paperWidth?: '58mm' | '80mm';
}

export function ThermalReceipt({
  data,
  onClose,
  paperWidth: initialPaperWidth = '80mm',
}: ThermalReceiptProps) {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(initialPaperWidth);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPrn = () => {
    downloadEscPosFile(data, paperWidth);
  };

  const handleCopyRawEscPos = () => {
    const { textPayload } = generateEscPosCommands(data, paperWidth);
    navigator.clipboard.writeText(textPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const is58mm = paperWidth === '58mm';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white rounded-lg border border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.12)] max-w-md w-full overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="p-3 bg-surface-subtle border-b border-border-default flex items-center justify-between gap-2 no-print shrink-0">
          <div className="flex items-center gap-1.5">
            {/* Paper Size Switcher Pills */}
            <div className="inline-flex rounded-md border border-border-default p-0.5 bg-surface-card">
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ${
                  paperWidth === '80mm'
                    ? 'bg-brand-deep text-white'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                ৮০ মিমি
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ${
                  paperWidth === '58mm'
                    ? 'bg-brand-deep text-white'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                ৫৮ মিমি
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyRawEscPos}
              className="p-1.5 rounded-md border border-border-strong text-ink-body hover:text-ink-primary hover:bg-surface-subtle transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer"
              title="ESC/POS টেক্সট কপি করুন"
            >
              {copied ? (
                <Check size={14} weight="bold" className="text-success" />
              ) : (
                <Copy size={14} weight="bold" />
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPrn}
              className="p-1.5 rounded-md border border-border-strong text-ink-body hover:text-ink-primary hover:bg-surface-subtle transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer"
              title="ESC/POS বাইনারি ডাউনলোড (.prn)"
            >
              <DownloadSimple size={14} weight="bold" />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-brand-deep text-white text-xs font-semibold hover:bg-brand-hover transition-[background-color,transform] duration-150 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Printer size={14} weight="bold" />
              <span>প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Slip Canvas */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-100/60 print:p-0 print:bg-white">
          <div
            id="printable-thermal-receipt"
            className={`thermal-receipt mx-auto font-mono text-black text-xs leading-tight bg-white p-3.5 border border-dashed border-slate-300 rounded shadow-2xs print:border-none print:shadow-none print:p-0 ${
              is58mm ? 'max-w-[58mm] w-[58mm]' : 'max-w-[80mm] w-[80mm]'
            }`}
          >
            {/* Header: Store Identity */}
            <div className="text-center pb-2 border-b border-dashed border-black">
              <h2 className="text-base font-black tracking-tight">
                {data.storeInfo.name}
              </h2>
              <p className="text-[11px] font-medium">{data.storeInfo.tagline}</p>
              <p className="text-[10px] mt-0.5">{data.storeInfo.address}</p>
              <p className="text-[10px]">{data.storeInfo.market}</p>
              <p className="text-[11px] font-bold mt-1 tabular-nums">
                মোবাইল: {data.storeInfo.phone}
              </p>
            </div>

            {/* Meta: Invoice & Date */}
            <div className="py-2 border-b border-dashed border-black text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>মেমো নং:</span>
                <span className="font-bold tabular-nums">{data.invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>তারিখ ও সময়:</span>
                <span className="tabular-nums">
                  {toBanglaDigits(data.invoice.date)} {toBanglaDigits(data.invoice.time)}
                </span>
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
                      <span className="tabular-nums">{data.customer.phone}</span>
                    </div>
                  )}
                  {data.customer.previousDue > 0 && (
                    <div className="flex justify-between text-black font-bold">
                      <span>পূর্বের বকেয়া:</span>
                      <span className="tabular-nums font-mono">
                        {formatCurrency(data.customer.previousDue, false)}
                      </span>
                    </div>
                  )}
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
                    <div className="flex justify-between text-[10px] text-black">
                      <span className="tabular-nums">{formatCurrency(item.rate, false)}/দর</span>
                      <span className="tabular-nums">
                        {formatNumber(item.qty)} {item.unit}
                      </span>
                      <span className="font-bold tabular-nums">{formatCurrency(item.total, false)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary & Settlement Math */}
            <div className="py-2 border-b border-dashed border-black text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>মোট আইটেম বিল:</span>
                <span className="tabular-nums font-mono">
                  {formatCurrency(data.summary.subTotal, false)}
                </span>
              </div>
              {data.summary.discount > 0 && (
                <div className="flex justify-between">
                  <span>বিশেষ ছাড় (-):</span>
                  <span className="tabular-nums font-mono">
                    {formatCurrency(data.summary.discount, false)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-0.5 border-t border-black">
                <span>সর্বমোট বিল:</span>
                <span className="tabular-nums font-mono">
                  {formatCurrency(data.summary.grandTotal, false)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>নগদ গ্রহণ:</span>
                <span className="tabular-nums font-mono">
                  {formatCurrency(data.summary.cashPaid, false)}
                </span>
              </div>

              {/* Running Khata Balance */}
              {data.summary.invoiceDue > 0 && (
                <div className="flex justify-between pt-1 border-t border-dotted border-black font-bold">
                  <span>এই মেমোর বাকি:</span>
                  <span className="tabular-nums font-mono">
                    {formatCurrency(data.summary.invoiceDue, false)}
                  </span>
                </div>
              )}
              {data.customer && (
                <div className="flex justify-between font-black text-xs pt-1 border-t border-black">
                  <span>খাতার মোট অবশিষ্ট বকেয়া:</span>
                  <span className="tabular-nums font-mono">
                    {formatCurrency(data.summary.customerTotalDueAfterSale, false)}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Blessing / Note */}
            <div className="pt-2 text-center text-[10px] space-y-0.5">
              <p className="font-bold">ধন্যবাদ, আবার আসবেন!</p>
              <p className="text-[9px]">বিক্রিত মাল ফেরত বা পরিবর্তনযোগ্য নয়</p>
              <p className="text-[8px] text-black/70 pt-1">
                সফটওয়্যার: ইদ্রিস ব্রাদার্স পিওএস সিস্টেম
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
