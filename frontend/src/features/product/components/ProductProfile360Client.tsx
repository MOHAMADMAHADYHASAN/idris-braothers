'use client';

import React, { useState, useEffect, useId, useRef } from 'react';
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
import {
  formatCurrency,
  formatNumber,
  formatWeight,
  formatPercent,
  formatDateBn,
} from '@/lib/decimal';
import { generateCode128Bars } from '@/lib/barcode';
import { Product, ProductVariant, StockWastage } from '../product.types';
import { productService } from '../product.service';
import { QuickPriceModal } from './QuickPriceModal';
import { RecordWastageModal } from './RecordWastageModal';

interface ProductProfile360ClientProps {
  productId: string;
}

export function ProductProfile360Client({ productId }: ProductProfile360ClientProps) {
  const barcodeFormId = useId();
  const variantSelectId = `${barcodeFormId}-variant`;
  const stickerCountId = `${barcodeFormId}-count`;
  const [product, setProduct] = useState<Product | null>(null);
  const [wastages, setWastages] = useState<StockWastage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Action Modals State
  const [activeVariantForPrice, setActiveVariantForPrice] = useState<ProductVariant | null>(null);
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
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner size={32} weight="bold" className="animate-spin text-brand-deep" />
          <p className="text-xs font-semibold text-ink-secondary">পণ্য প্রোফাইল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-surface-canvas flex flex-col items-center justify-center p-6">
        <WarningCircle size={40} weight="fill" className="text-danger mb-2" />
        <h2 className="text-base font-bold text-ink-primary">{error || 'পণ্যটি খুঁজে পাওয়া যায়নি'}</h2>
        <Link
          href="/products"
          className="mt-4 px-4 py-2 rounded-lg bg-brand-deep hover:bg-brand-hover text-white text-xs font-semibold"
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
    <div className="min-h-screen bg-surface-canvas pb-20 font-sans print:bg-white print:p-0 print:pb-0">
      {/* ১. টপ স্টিকি হেডার */}
      <header className="sticky top-0 z-40 bg-surface-card border-b border-border-default shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/products"
              className="p-2 rounded-lg text-ink-secondary hover:text-brand-deep hover:bg-brand-soft border border-border-default transition-colors shrink-0"
              title="পণ্য তালিকায় ফিরে যান"
              aria-label="পণ্য তালিকায় ফিরে যান"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-ink-primary truncate">
                  {product.banglaName || product.name}
                </h1>
                {product.banglaName && product.name && (
                  <span className="text-xs text-ink-secondary font-medium truncate hidden sm:inline">
                    • {product.name}
                  </span>
                )}
                {product.category && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-surface-subtle text-ink-body border border-border-default shrink-0">
                    {product.category.banglaName || product.category.name}
                  </span>
                )}
                {product.brand && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-brand-soft text-brand-deep border border-brand-light shrink-0">
                    {product.brand.banglaName || product.brand.name}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-bold border shrink-0 ${
                    isLowStock
                      ? 'bg-due-bg text-due-text border-due-border'
                      : 'bg-cash-bg text-cash-text border-cash-border'
                  }`}
                >
                  স্টক: {formatWeight(totalStock, product.baseUnitName)} • {isLowStock ? 'কম মজুত' : 'পর্যাপ্ত'}
                </span>
              </div>
              <p className="text-xs text-ink-secondary truncate mt-0.5">
                আইডি: {product.id.slice(-8).toUpperCase()} • একক: {product.baseUnitName} •{' '}
                {product.hasVariants
                  ? `${formatNumber(product.variants.length)} টি ভ্যারিয়েন্টযুক্ত পণ্য`
                  : 'সাধারণ একক পণ্য'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={scrollToBarcode}
              className="px-3 py-2 rounded-lg border border-border-strong hover:bg-surface-subtle text-ink-body text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Barcode size={15} weight="bold" className="text-ink-secondary" />
              <span className="hidden sm:inline">বারকোড স্টিকার</span>
            </button>

            <Link
              href={`/products/edit/${product.id}`}
              className="px-3.5 py-2 rounded-lg bg-brand-deep hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
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
                <div className="text-[10px] text-ink-body leading-tight">
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
            {/* কার্ড ১: পণ্যের পরিচিতি ও শ্রেণীবিন্যাস */}
            <div className="bg-surface-card rounded-xl border border-border-default p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                  <Package size={16} weight="bold" className="text-brand-deep" />
                  পণ্যের মূল পরিচিতি ও শ্রেণীবিন্যাস
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold border ${
                    product.isActive
                      ? 'bg-cash-bg text-cash-text border-cash-border'
                      : 'bg-due-bg text-due-text border-due-border'
                  }`}
                >
                  {product.isActive ? 'সক্রিয় পণ্য' : 'নিষ্ক্রিয়'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-ink-secondary text-xs font-semibold block">
                    বাংলা নাম
                  </span>
                  <span className="font-bold text-ink-primary text-sm">
                    {product.banglaName || 'নাম দেওয়া নেই'}
                  </span>
                </div>

                <div>
                  <span className="text-ink-secondary text-xs font-semibold block">
                    ইংরেজি ও মেমো নাম
                  </span>
                  <span className="font-semibold text-ink-primary text-sm">
                    {product.name}
                  </span>
                </div>

                <div>
                  <span className="text-ink-secondary text-xs font-semibold block">
                    ক্যাটাগরি
                  </span>
                  <span className="font-semibold text-ink-body">
                    {product.category?.banglaName || product.category?.name || 'ক্যাটাগরি নেই'}
                  </span>
                </div>

                <div>
                  <span className="text-ink-secondary text-xs font-semibold block">
                    ব্র্যান্ড ও প্রস্তুতকারক
                  </span>
                  <span className="font-semibold text-ink-body">
                    {product.brand?.banglaName || product.brand?.name || 'নিজস্ব / খোলা মাল'}
                  </span>
                </div>

                <div>
                  <span className="text-ink-secondary text-xs font-semibold block">
                    ওজন ও বিক্রয় মোড
                  </span>
                  <span className="font-semibold text-ink-body flex items-center gap-1">
                    <Scales size={14} weight="bold" className="text-brand-deep" />
                    {selectedVariant?.allowDecimalQty
                      ? 'ওজনযোগ্য পণ্য (ভগ্নাংশ ০.২৫ কেজি বিক্রয়যোগ্য)'
                      : 'প্যাকেট / বোতল (পূর্ণসংখ্যা বিক্রয়যোগ্য)'}
                  </span>
                </div>

                <div>
                  <span className="text-ink-secondary text-xs font-semibold block">
                    মূল হিসাব একক
                  </span>
                  <span className="font-mono font-bold text-ink-primary">
                    {product.baseUnitName}
                  </span>
                </div>
              </div>

              {product.description && (
                <div className="pt-3 border-t border-border-subtle text-xs">
                  <span className="text-ink-secondary text-xs font-semibold block mb-1">
                    পণ্য বিবরণী ও সংরক্ষণ নির্দেশিকা
                  </span>
                  <p className="text-ink-body leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>

            {/* কার্ড ২: ভ্যারিয়েন্ট ও প্যাকেজিং রূপান্তর ম্যাট্রিক্স */}
            <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                  <Storefront size={16} weight="bold" className="text-brand-deep" />
                  ভ্যারিয়েন্ট ও দর-স্টক ম্যাট্রিক্স
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-subtle/80 border-b border-border-default text-ink-secondary font-bold text-xs">
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
                  <tbody className="divide-y divide-border-subtle">
                    {product.variants.map((v) => {
                      const retailProfit = (v.retailPrice || 0) - (v.currentPurchasePrice || 0);
                      const retailMargin =
                        v.retailPrice > 0 ? (retailProfit / v.retailPrice) * 100 : 0;

                      const wholesaleProfit = (v.wholesalePrice || 0) - (v.currentPurchasePrice || 0);
                      const wholesaleMargin =
                        v.wholesalePrice > 0 ? (wholesaleProfit / v.wholesalePrice) * 100 : 0;

                      return (
                        <React.Fragment key={v.id}>
                          <tr className="hover:bg-surface-subtle/60 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-ink-primary text-xs sm:text-sm">
                                {v.variantName === 'Default' ? 'সাধারণ (মূল পণ্য)' : v.variantName}
                              </div>
                              <span className="text-xs text-ink-secondary font-mono">
                                একক: {v.baseUnitName} • {v.allowDecimalQty ? 'দশমিক ওজন' : 'পূর্ণসংখ্যা পিস'}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 font-mono text-xs">
                              <div className="text-ink-primary font-semibold">{v.sku || '-'}</div>
                              <div className="text-ink-secondary">{v.barcode || '-'}</div>
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                              <span
                                className={
                                  v.stockQuantity <= v.lowStockAlert
                                    ? 'text-due-text font-black'
                                    : 'text-ink-primary'
                                }
                              >
                                {formatWeight(v.stockQuantity, v.baseUnitName)}
                              </span>
                              {v.stockQuantity <= v.lowStockAlert && (
                                <span className="block text-xs text-due-text font-semibold">
                                  অ্যালার্ট (&le;{formatNumber(v.lowStockAlert)})
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-ink-body font-medium">
                              {formatCurrency(v.currentPurchasePrice)}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-wholesale-text">
                              {formatCurrency(v.wholesalePrice)}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-ink-primary">
                              {formatCurrency(v.retailPrice)}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                                  retailProfit >= 0
                                    ? 'bg-cash-bg text-cash-text border-cash-border'
                                    : 'bg-due-bg text-due-text border-due-border'
                                }`}
                                title={`খুচরা মার্জিন: ${formatPercent(retailMargin, 1)}, পাইকারি মার্জিন: ${formatPercent(wholesaleMargin, 1)}`}
                              >
                                {formatPercent(retailMargin, 0, true)}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setActiveVariantForPrice(v)}
                                  className="p-1.5 rounded border border-border-default hover:bg-surface-subtle text-ink-secondary hover:text-brand-deep transition-colors cursor-pointer"
                                  title="দর পরিবর্তন"
                                  aria-label={`${v.variantName} দর পরিবর্তন`}
                                >
                                  <Coins size={14} weight="bold" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveVariantForWastage(v)}
                                  className="p-1.5 rounded border border-border-default hover:bg-due-bg text-ink-secondary hover:text-due-text transition-colors cursor-pointer"
                                  title="ওয়েস্টেজ এন্ট্রি"
                                  aria-label={`${v.variantName} ওয়েস্টেজ এন্ট্রি`}
                                >
                                  <WarningCircle size={14} weight="bold" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* কার্ড ৩: স্টক ওয়েস্টেজ ও ঘাটতি হিস্ট্রি */}
            <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                  <WarningCircle size={16} weight="bold" className="text-danger" />
                  স্টক ওয়েস্টেজ ও ঘাটতি অডিট হিস্ট্রি
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveVariantForWastage(product.variants[0])}
                  className="px-3 py-1.5 rounded-lg bg-due-bg text-due-text border border-due-border text-xs font-semibold hover:bg-due-bg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={13} weight="bold" />
                  <span>ঘাটতি এন্ট্রি করুন</span>
                </button>
              </div>

              {wastages.length === 0 ? (
                <div className="py-8 text-center text-ink-secondary text-xs">
                  এই পণ্যের কোনো ওয়েস্টেজ বা ঘাটতির রেকর্ড নেই।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-subtle/80 border-b border-border-default text-ink-secondary font-bold text-xs">
                        <th className="py-2.5 px-3">তারিখ</th>
                        <th className="py-2.5 px-3">ভ্যারিয়েন্ট</th>
                        <th className="py-2.5 px-3 text-right">ঘাটতির পরিমাণ</th>
                        <th className="py-2.5 px-3 text-right">কেনাদর লোকসান (৳)</th>
                        <th className="py-2.5 px-3">ঘাটতির কারণ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {wastages.map((w) => (
                        <tr key={w.id} className="hover:bg-surface-subtle/50">
                          <td className="py-2.5 px-3 font-mono text-xs text-ink-secondary">
                            {formatDateBn(w.recordedAt)}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-ink-primary">
                            {w.variant?.variantName || 'সাধারণ'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-due-text">
                            -{formatWeight(w.quantity, product.baseUnitName)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-due-text">
                            {formatCurrency(w.lossAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-ink-body">
                            <span>{w.reason}</span>
                            {w.note && (
                              <span className="text-ink-secondary text-xs block">{w.note}</span>
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

          {/* ডানে: লাইভ ভ্যালুয়েশন ও বারকোড স্টিকার জেনারেটর */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* কার্ড ৪: ইনভেন্টরি ভ্যালুয়েশন */}
            <div className="bg-surface-card rounded-xl border border-border-default p-4 shadow-2xs space-y-3">
              <span className="text-sm font-bold text-ink-primary border-b border-border-subtle pb-2 flex items-center gap-1.5">
                <TrendUp size={16} weight="bold" className="text-success" />
                লাইভ ইনভেন্টরি ভ্যালুয়েশন
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-ink-secondary">
                  <span>মোট মজুত স্টক:</span>
                  <span className="font-mono font-bold text-ink-primary">
                    {formatWeight(totalStock, product.baseUnitName)}
                  </span>
                </div>

                <div className="flex justify-between text-ink-secondary">
                  <span>ইনভেন্টরি কেনা মূলধন:</span>
                  <span className="font-mono font-bold text-ink-primary">
                    {formatCurrency(totalAssetValue)}
                  </span>
                </div>

                <div className="flex justify-between text-ink-secondary">
                  <span>সম্ভাব্য বিক্রয় মূল্য:</span>
                  <span className="font-mono font-bold text-ink-primary">
                    {formatCurrency(totalPotentialRevenue)}
                  </span>
                </div>

                <div className="border-t border-border-default pt-2 flex justify-between font-bold">
                  <span className="text-cash-text">সম্ভাব্য গ্রস মুনাফা:</span>
                  <span className="font-mono text-cash-text font-black text-sm">
                    {formatCurrency(potentialGrossProfit)} ({formatPercent(overallMarginPercent, 1)})
                  </span>
                </div>
              </div>
            </div>

            {/* কার্ড ৫: থার্মাল বারকোড স্টিকার প্রিন্টার */}
            <div
              ref={barcodeSectionRef}
              className="bg-surface-card rounded-xl border border-border-default p-4 shadow-2xs space-y-3.5"
            >
              <div className="border-b border-border-subtle pb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                  <Barcode size={16} weight="bold" className="text-brand-deep" />
                  বারকোড স্টিকার প্রিন্টার
                </span>
                <span className="text-xs font-bold text-ink-secondary font-mono">50mm × 30mm</span>
              </div>

              {product.variants.length > 1 && (
                <div>
                  <label htmlFor={variantSelectId} className="block text-xs font-bold text-ink-body mb-1">
                    ভ্যারিয়েন্ট নির্ধারণ করুন
                  </label>
                  <select
                    id={variantSelectId}
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-border-strong text-xs font-semibold bg-surface-card text-ink-primary"
                  >
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.variantName} (স্টক: {formatWeight(v.stockQuantity, v.baseUnitName)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink-body mb-1">
                  স্টিকারে প্রদর্শিত মূল্য
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPriceTypeToPrint('RETAIL')}
                    className={`py-1.5 rounded-md text-xs font-bold border cursor-pointer transition-colors ${
                      priceTypeToPrint === 'RETAIL'
                        ? 'bg-brand-deep text-white border-brand-deep'
                        : 'bg-surface-subtle text-ink-body border-border-default'
                    }`}
                  >
                    খুচরা দর
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceTypeToPrint('WHOLESALE')}
                    className={`py-1.5 rounded-md text-xs font-bold border cursor-pointer transition-colors ${
                      priceTypeToPrint === 'WHOLESALE'
                        ? 'bg-wholesale-solid text-white border-wholesale-hover'
                        : 'bg-surface-subtle text-ink-body border-border-default'
                    }`}
                  >
                    পাইকারি দর
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceTypeToPrint('NONE')}
                    className={`py-1.5 rounded-md text-xs font-bold border cursor-pointer transition-colors ${
                      priceTypeToPrint === 'NONE'
                        ? 'bg-brand-deep text-white border-brand-deep'
                        : 'bg-surface-subtle text-ink-body border-border-default'
                    }`}
                  >
                    দাম ছাড়া
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor={stickerCountId} className="text-xs font-bold text-ink-body">স্টিকার কপি সংখ্যা</label>
                  <span className="font-mono text-xs font-black text-brand-deep">
                    {formatNumber(stickerCount)} কপি
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[1, 10, 24, 50, 100].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setStickerCount(count)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border cursor-pointer transition-colors ${
                        stickerCount === count
                          ? 'bg-brand-deep text-white border-brand-deep'
                          : 'bg-surface-subtle text-ink-body border-border-default hover:bg-brand-soft'
                      }`}
                    >
                      {formatNumber(count)}
                    </button>
                  ))}
                  <input
                    id={stickerCountId}
                    type="number"
                    min="1"
                    max="500"
                    value={stickerCount}
                    onChange={(e) => setStickerCount(parseInt(e.target.value, 10) || 1)}
                    className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded-md border border-border-strong bg-surface-card text-ink-primary"
                  />
                </div>
              </div>

              {/* লাইভ স্টিকার প্রিভিউ বক্স */}
              <div className="p-3 bg-surface-subtle rounded-lg border border-dashed border-border-strong space-y-1.5 text-center">
                <span className="text-xs text-ink-secondary font-bold block">
                  থার্মাল স্টিকার প্রিভিউ
                </span>

                <div className="bg-surface-card p-2.5 rounded border border-border-strong shadow-2xs inline-block max-w-[200px] w-full text-center">
                  <div className="font-bold text-xs text-ink-body leading-tight">
                    ইদ্রিস ব্রাদার্স • ফেনী
                  </div>
                  <div className="font-bold text-xs text-ink-primary leading-tight truncate mt-0.5">
                    {product.banglaName || product.name}
                  </div>
                  {selectedVariant?.variantName && selectedVariant.variantName !== 'Default' && (
                    <div className="text-xs text-ink-secondary font-medium">
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

                  <div className="font-mono text-xs text-ink-body tracking-wider">
                    {barcodeValue}
                  </div>

                  {priceTypeToPrint !== 'NONE' && (
                    <div className="font-bold font-mono text-xs text-ink-primary mt-0.5">
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

              <button
                type="button"
                onClick={handlePrintStickers}
                className="w-full py-2.5 rounded-lg bg-brand-deep hover:bg-brand-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Printer size={15} weight="bold" />
                <span>{formatNumber(stickerCount)} কপি স্টিকার প্রিন্ট করুন</span>
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
