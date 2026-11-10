'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  PencilSimple,
  Barcode,
  Printer,
  Package,
  Coins,
  WarningCircle,
  CheckCircle,
  Tag,
  TrendUp,
  Receipt,
  Scales,
  Spinner,
  Storefront,
  Trash,
  Plus,
  Info,
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/decimal';
import { generateCode128Bars } from '@/lib/barcode';
import { Product, ProductVariant, StockWastage } from '../product.types';
import { productService } from '../product.service';
import { QuickPriceModal } from './QuickPriceModal';
import { AddUnitModal } from './AddUnitModal';
import { RecordWastageModal } from './RecordWastageModal';

interface ProductProfile360ClientProps {
  productId: string;
}

export function ProductProfile360Client({ productId }: ProductProfile360ClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [wastages, setWastages] = useState<StockWastage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Action Modals State
  const [activeVariantForPrice, setActiveVariantForPrice] = useState<ProductVariant | null>(null);
  const [activeVariantForUnit, setActiveVariantForUnit] = useState<ProductVariant | null>(null);
  const [activeVariantForWastage, setActiveVariantForWastage] = useState<ProductVariant | null>(null);

  // Barcode Sticker Generator State
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [priceTypeToPrint, setPriceTypeToPrint] = useState<'RETAIL' | 'WHOLESALE' | 'NONE'>('RETAIL');
  const [stickerCount, setStickerCount] = useState<number>(24);
  const [isPrintingStickers, setIsPrintingStickers] = useState(false);

  const barcodeSectionRef = useRef<HTMLDivElement>(null);

  const loadProductData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [prodData, wastageData] = await Promise.all([
        productService.getProductById(productId),
        productService.getWastageHistory({ productId, limit: 15 }).catch(() => ({ wastages: [] })),
      ]);
      setProduct(prodData);
      setWastages(wastageData.wastages || []);
      if (prodData.variants && prodData.variants.length > 0) {
        setSelectedVariantId(prodData.variants[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'পণ্যের তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner size={32} weight="bold" className="animate-spin text-slate-700" />
          <p className="text-xs font-semibold text-slate-600">পণ্য প্রোফাইল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <WarningCircle size={40} weight="fill" className="text-rose-500 mb-2" />
        <h2 className="text-base font-bold text-slate-900">{error || 'পণ্যটি খুঁজে পাওয়া যায়নি'}</h2>
        <Link
          href="/products"
          className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          পণ্য তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  // Financial Calculations
  const totalStock = product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  const totalAssetValue = product.variants.reduce(
    (sum, v) => sum + (v.stockQuantity || 0) * (v.currentPurchasePrice || 0),
    0
  );
  const totalPotentialRevenue = product.variants.reduce(
    (sum, v) => sum + (v.stockQuantity || 0) * (v.retailPrice || 0),
    0
  );
  const potentialGrossProfit = totalPotentialRevenue - totalAssetValue;
  const overallMarginPercent =
    totalPotentialRevenue > 0 ? (potentialGrossProfit / totalPotentialRevenue) * 100 : 0;

  const isLowStock = totalStock <= (product.lowStockAlert || 10);

  // Barcode string
  const barcodeValue =
    selectedVariant?.barcode || selectedVariant?.sku || `${product.id.slice(-6).toUpperCase()}`;
  const barcodeData = generateCode128Bars(barcodeValue, 2);

  const handlePrintStickers = () => {
    setIsPrintingStickers(true);
    setTimeout(() => {
      window.print();
      setIsPrintingStickers(false);
    }, 150);
  };

  const scrollToBarcode = () => {
    barcodeSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 font-sans print:bg-white print:p-0 print:pb-0">
      {/* ১. টপ স্টিকি হেডার (প্রিন্টে লুকানো থাকবে) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/products"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
              title="পণ্য তালিকায় ফিরে যান"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  {product.banglaName || product.name}
                </h1>
                {product.banglaName && product.name && (
                  <span className="text-xs text-slate-500 font-medium truncate hidden sm:inline">
                    ({product.name})
                  </span>
                )}
                {product.category && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {product.category.banglaName || product.category.name}
                  </span>
                )}
                {product.brand && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                    {product.brand.banglaName || product.brand.name}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                    isLowStock
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  স্টক: {totalStock} {product.baseUnitName} {isLowStock ? '(কম মজুত!)' : '(পর্যাপ্ত)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                আইডি: {product.id.slice(-8).toUpperCase()} • একক: {product.baseUnitName} •{' '}
                {product.hasVariants
                  ? `${product.variants.length} টি ভ্যারিয়েন্টযুক্ত পণ্য`
                  : 'সাধারণ সিঙ্গেল পণ্য'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* বারকোড স্টিকার প্রিন্ট জাম্প */}
            <button
              type="button"
              onClick={scrollToBarcode}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Barcode size={15} weight="bold" className="text-slate-600" />
              <span className="hidden sm:inline">বারকোড স্টিকার</span>
            </button>

            {/* এডিট পণ্য বাটন */}
            <Link
              href={`/products/edit/${product.id}`}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <PencilSimple size={14} weight="bold" />
              <span>এডিট পণ্য</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ২. থার্মাল বারকোড প্রিন্ট শিট (শুধুমাত্র প্রিন্টের সময় রেন্ডার হবে) */}
      <div className="hidden print:block p-4">
        <div className="text-center font-bold text-xs mb-2">
          মেসার্স ইদ্রিস ব্রাদার্স — বারকোড স্টিকার প্রিন্ট
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: stickerCount }).map((_, idx) => (
            <div
              key={idx}
              className="border border-black p-2 rounded text-center flex flex-col items-center justify-between text-[11px] break-inside-avoid"
              style={{ width: '50mm', height: '30mm', pageBreakInside: 'avoid' }}
            >
              <div className="font-bold text-[10px] leading-tight truncate w-full">
                ইদ্রিস ব্রাদার্স • ফেনী
              </div>
              <div className="font-bold text-[11px] leading-tight truncate w-full">
                {product.banglaName || product.name}
              </div>
              {selectedVariant?.variantName && selectedVariant.variantName !== 'Default' && (
                <div className="text-[10px] text-slate-700 leading-tight">
                  সাইজ: {selectedVariant.variantName}
                </div>
              )}
              {/* Barcode SVG */}
              <svg
                width={barcodeData.totalWidth}
                height="32"
                viewBox={`0 0 ${barcodeData.totalWidth} 32`}
                className="my-0.5 max-w-full"
              >
                {barcodeData.bars.map((bar, bIdx) => (
                  <rect
                    key={bIdx}
                    x={bar.x}
                    y="0"
                    width={bar.width}
                    height="32"
                    fill="#000000"
                  />
                ))}
              </svg>
              <div className="font-mono text-[9px] tracking-widest">{barcodeValue}</div>
              {priceTypeToPrint !== 'NONE' && (
                <div className="font-bold font-mono text-[11px] leading-tight mt-0.5">
                  দর: {formatCurrency(
                    priceTypeToPrint === 'WHOLESALE'
                      ? selectedVariant?.wholesalePrice || 0
                      : selectedVariant?.retailPrice || 0
                  )}
                  /{product.baseUnitName}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ৩. মূল ক্যানভাস (Desktop 66% - 34%) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* বাঁয়ে: ওভারভিউ, ভ্যারিয়েন্ট ও অডিট ম্যাট্রিক্স (৮ কলাম / ~৬৬%) */}
          <div className="lg:col-span-8 space-y-6">
            {/* কার্ড ১: পণ্যের পরিচিতি ও ট্যাক্সোনমি */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Package size={16} weight="bold" className="text-slate-500" />
                  পণ্যের মূল পরিচিতি ও শ্রেণীবিন্যাস
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    product.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {product.isActive ? 'সক্রিয় পণ্য' : 'নিষ্ক্রিয়'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    বাংলা নাম
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {product.banglaName || 'নাম দেওয়া নেই'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    ইংরেজি নাম (POS / Receipt)
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {product.name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    ক্যাটাগরি
                  </span>
                  <span className="font-semibold text-slate-800">
                    {product.category?.banglaName || product.category?.name || 'ক্যাটাগরি নেই'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    ব্র্যান্ড / প্রস্তুতকারক
                  </span>
                  <span className="font-semibold text-slate-800">
                    {product.brand?.banglaName || product.brand?.name || 'নিজস্ব / খোলা মাল'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    ওজন ও বিক্রয় মোড
                  </span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Scales size={14} weight="bold" className="text-slate-500" />
                    {selectedVariant?.allowDecimalQty
                      ? 'লুজ ওজনযোগ্য পণ্য (দশমিক ওজন যেমন ০.২৫ কেজি এলাউড)'
                      : 'সিলড প্যাকেট / বোতল (শুধুমাত্র পূর্ণসংখ্যা যেমন ১, ২, ৫)'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    বেস হিসাব একক
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {product.baseUnitName}
                  </span>
                </div>
              </div>

              {product.description && (
                <div className="pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    পণ্য বিবরণী ও সংরক্ষণ নির্দেশিকা
                  </span>
                  <p className="text-slate-700 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>

            {/* কার্ড ২: ভ্যারিয়েন্ট ও প্যাকেজিং রূপান্তর ম্যাট্রিক্স */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Storefront size={16} weight="bold" className="text-slate-500" />
                    ভ্যারিয়েন্ট, মূল্য ও প্যাকেজিং রূপান্তর ম্যাট্রিক্স
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    প্রতিটি ভ্যারিয়েন্টের মজুত স্টক, লাভ মার্জিন এবং বস্তা/কার্টন কনভার্সন
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">ভ্যারিয়েন্ট / সাইজ</th>
                      <th className="py-2.5 px-3">SKU ও বারকোড</th>
                      <th className="py-2.5 px-3 text-right">মজুত স্টক</th>
                      <th className="py-2.5 px-3 text-right">কেনাদর (৳)</th>
                      <th className="py-2.5 px-3 text-right">পাইকারি দর (৳)</th>
                      <th className="py-2.5 px-3 text-right">খুচরা দর (৳)</th>
                      <th className="py-2.5 px-3 text-center">লাভ মার্জিন</th>
                      <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.variants.map((v) => {
                      const retailProfit = (v.retailPrice || 0) - (v.currentPurchasePrice || 0);
                      const retailMargin =
                        v.retailPrice > 0 ? (retailProfit / v.retailPrice) * 100 : 0;

                      const wholesaleProfit = (v.wholesalePrice || 0) - (v.currentPurchasePrice || 0);
                      const wholesaleMargin =
                        v.wholesalePrice > 0 ? (wholesaleProfit / v.wholesalePrice) * 100 : 0;

                      return (
                        <React.Fragment key={v.id}>
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                {v.variantName === 'Default' ? 'সাধারণ (স্ট্যান্ডার্ড)' : v.variantName}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                একক: {v.baseUnitName}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 font-mono text-[11px]">
                              <div className="text-slate-800 font-semibold">{v.sku || '-'}</div>
                              <div className="text-slate-400 text-[10px]">{v.barcode || '-'}</div>
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                              <span
                                className={
                                  v.stockQuantity <= v.lowStockAlert
                                    ? 'text-rose-700 font-black'
                                    : 'text-slate-900'
                                }
                              >
                                {v.stockQuantity} {v.baseUnitName}
                              </span>
                              {v.stockQuantity <= v.lowStockAlert && (
                                <span className="block text-[10px] text-rose-500 font-semibold">
                                  অ্যালার্ট (&le;{v.lowStockAlert})
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 font-medium">
                              {formatCurrency(v.currentPurchasePrice)}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-purple-800">
                              {formatCurrency(v.wholesalePrice)}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-slate-900">
                              {formatCurrency(v.retailPrice)}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  retailProfit >= 0
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                                title={`খুচরা মার্জিন: ${retailMargin.toFixed(1)}%, পাইকারি মার্জিন: ${wholesaleMargin.toFixed(1)}%`}
                              >
                                +{retailMargin.toFixed(0)}%
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setActiveVariantForPrice(v)}
                                  className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                  title="দর পরিবর্তন"
                                >
                                  <Coins size={13} weight="bold" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveVariantForUnit(v)}
                                  className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                  title="কার্টন/বস্তা ইউনিট যোগ"
                                >
                                  <Package size={13} weight="bold" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveVariantForWastage(v)}
                                  className="p-1 rounded border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="ওয়েস্টেজ এন্ট্রি"
                                >
                                  <WarningCircle size={13} weight="bold" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* প্যাকেজিং ইউনিট সাব-রো (বস্তা, কার্টন, পাল্লা) */}
                          {v.units && v.units.length > 0 && (
                            <tr className="bg-slate-50/40">
                              <td colSpan={8} className="py-2 px-4 border-b border-slate-100">
                                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                                    <Package size={12} weight="bold" className="text-slate-400" />
                                    প্যাকেজিং ইউনিটসমূহ:
                                  </span>
                                  {v.units.map((u) => (
                                    <div
                                      key={u.id}
                                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono shadow-2xs"
                                    >
                                      <span className="font-bold text-slate-900">{u.unitName}</span>
                                      <span className="text-slate-400 text-[10px]">
                                        (= {u.conversionFactor} {v.baseUnitName})
                                      </span>
                                      {u.wholesalePrice && (
                                        <span className="text-purple-700 font-bold">
                                          পাইকারি {formatCurrency(u.wholesalePrice)}
                                        </span>
                                      )}
                                      {u.retailPrice && (
                                        <span className="text-slate-800 font-bold">
                                          খুচরা {formatCurrency(u.retailPrice)}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* কার্ড ৩: স্টক ওয়েস্টেজ ও ঘাটতি হিস্ট্রি */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <WarningCircle size={16} weight="bold" className="text-rose-500" />
                    স্টক ওয়েস্টেজ ও ঘাটতি অডিট হিস্ট্রি
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    শুকিয়ে যাওয়া, ইঁদুরে কাটা বা ক্ষতিগ্রস্ত মালের পূর্ববর্তী রেকর্ড
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVariantForWastage(product.variants[0])}
                  className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={13} weight="bold" />
                  <span>ঘাটতি এন্ট্রি করুন</span>
                </button>
              </div>

              {wastages.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  এই পণ্যের কোনো ওয়েস্টেজ বা ঘাটতির রেকর্ড নেই (১০০% ক্লিন অডিট)।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-2 px-3">তারিখ</th>
                        <th className="py-2 px-3">ভ্যারিয়েন্ট</th>
                        <th className="py-2 px-3 text-right">ঘাটতির পরিমাণ</th>
                        <th className="py-2 px-3 text-right">কেনাদর লোকসান (৳)</th>
                        <th className="py-2 px-3">ঘাটতির সুনির্দিষ্ট কারণ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {wastages.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {new Date(w.recordedAt).toLocaleDateString('bn-BD', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {w.variant?.variantName || 'সাধারণ'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-rose-700">
                            -{w.quantity} {product.baseUnitName}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-rose-700">
                            {formatCurrency(w.lossAmount)}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            <span>{w.reason}</span>
                            {w.note && (
                              <span className="text-slate-400 text-[10px] block">{w.note}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ডানে: লাইভ ভ্যালুয়েশন ও বারকোড স্টিকার জেনারেটর (৪ কলাম / ~৩৪% - Sticky) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* কার্ড ৪: ইনভেন্টরি ভ্যালুয়েশন ও মুনাফা অ্যানালিটিক্স */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <span className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <TrendUp size={16} weight="bold" className="text-emerald-600" />
                লাইভ ইনভেন্টরি ভ্যালুয়েশন ও প্রফিট প্রিভিউ
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>মোট মজুত স্টক:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {totalStock} {product.baseUnitName}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>ইনভেন্টরি কেনা মূলধন (Asset):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(totalAssetValue)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>সম্ভাব্য বিক্রয় রেভিনিউ:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(totalPotentialRevenue)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                  <span className="text-emerald-700">সম্ভাব্য মোট গ্রস মুনাফা:</span>
                  <span className="font-mono text-emerald-700 font-black text-sm">
                    {formatCurrency(potentialGrossProfit)} ({overallMarginPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* কার্ড ৫: থার্মাল বারকোড স্টিকার প্রিন্ট জেনারেটর */}
            <div
              ref={barcodeSectionRef}
              className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3.5"
            >
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Barcode size={16} weight="bold" className="text-slate-600" />
                  থার্মাল বারকোড স্টিকার প্রিন্টার
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">50mm × 30mm</span>
              </div>

              {/* ভ্যারিয়েন্ট সিলেক্টর */}
              {product.variants.length > 1 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ভ্যারিয়েন্ট নির্ধারণ করুন
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                  >
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.variantName} (স্টক: {v.stockQuantity} {v.baseUnitName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* দর অপশন */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  স্টিকারে প্রদর্শিত মূল্য
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setPriceTypeToPrint('RETAIL')}
                    className={`py-1 rounded text-[11px] font-bold border cursor-pointer ${
                      priceTypeToPrint === 'RETAIL'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    খুচরা দর
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceTypeToPrint('WHOLESALE')}
                    className={`py-1 rounded text-[11px] font-bold border cursor-pointer ${
                      priceTypeToPrint === 'WHOLESALE'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    পাইকারি দর
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceTypeToPrint('NONE')}
                    className={`py-1 rounded text-[11px] font-bold border cursor-pointer ${
                      priceTypeToPrint === 'NONE'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    দাম ছাড়া
                  </button>
                </div>
              </div>

              {/* স্টিকার কপি কাউন্ট */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-700">স্টিকার কপি সংখ্যা</label>
                  <span className="font-mono text-xs font-black text-slate-900">
                    {stickerCount} কপি
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {[1, 10, 24, 50, 100].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setStickerCount(count)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border cursor-pointer ${
                        stickerCount === count
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={stickerCount}
                    onChange={(e) => setStickerCount(parseInt(e.target.value, 10) || 1)}
                    className="w-14 px-1.5 py-0.5 text-center font-mono font-bold text-xs rounded border border-slate-300"
                  />
                </div>
              </div>

              {/* লাইভ ভিজ্যুয়াল স্টিকার প্রিভিউ বক্স */}
              <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 space-y-1 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  থার্মাল স্টিকার প্রিভিউ
                </span>

                <div className="bg-white p-2.5 rounded border border-slate-300 shadow-2xs inline-block max-w-[200px] w-full text-center">
                  <div className="font-bold text-[10px] text-slate-700 leading-tight">
                    ইদ্রিস ব্রাদার্স • ফেনী
                  </div>
                  <div className="font-bold text-xs text-slate-900 leading-tight truncate mt-0.5">
                    {product.banglaName || product.name}
                  </div>
                  {selectedVariant?.variantName && selectedVariant.variantName !== 'Default' && (
                    <div className="text-[10px] text-slate-500 font-medium">
                      সাইজ: {selectedVariant.variantName}
                    </div>
                  )}

                  {/* Barcode Lines */}
                  <div className="flex justify-center my-1">
                    <svg
                      width={Math.min(160, barcodeData.totalWidth)}
                      height="28"
                      viewBox={`0 0 ${barcodeData.totalWidth} 28`}
                      className="max-w-full"
                    >
                      {barcodeData.bars.map((bar, bIdx) => (
                        <rect
                          key={bIdx}
                          x={bar.x}
                          y="0"
                          width={bar.width}
                          height="28"
                          fill="#000000"
                        />
                      ))}
                    </svg>
                  </div>

                  <div className="font-mono text-[9px] text-slate-600 tracking-wider">
                    {barcodeValue}
                  </div>

                  {priceTypeToPrint !== 'NONE' && (
                    <div className="font-bold font-mono text-xs text-slate-900 mt-0.5">
                      দর: {formatCurrency(
                        priceTypeToPrint === 'WHOLESALE'
                          ? selectedVariant?.wholesalePrice || 0
                          : selectedVariant?.retailPrice || 0
                      )}
                      /{product.baseUnitName}
                    </div>
                  )}
                </div>
              </div>

              {/* প্রিন্ট ট্রিগার বাটন */}
              <button
                type="button"
                onClick={handlePrintStickers}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Printer size={15} weight="bold" />
                <span>{stickerCount} কপি স্টিকার প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* কুইক অ্যাকশন মোডালসমূহ */}
      <QuickPriceModal
        isOpen={Boolean(activeVariantForPrice)}
        onClose={() => {
          setActiveVariantForPrice(null);
          loadProductData();
        }}
        variant={activeVariantForPrice}
        productName={product.name}
      />

      <AddUnitModal
        isOpen={Boolean(activeVariantForUnit)}
        onClose={() => {
          setActiveVariantForUnit(null);
          loadProductData();
        }}
        variant={activeVariantForUnit}
        productName={product.name}
      />

      <RecordWastageModal
        isOpen={Boolean(activeVariantForWastage)}
        onClose={() => {
          setActiveVariantForWastage(null);
          loadProductData();
        }}
        variant={activeVariantForWastage}
        productName={product.name}
      />
    </div>
  );
}
