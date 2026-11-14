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
  Plus,
  Info,
  ShoppingCart,
  SlidersHorizontal,
  FileText,
  ClockCounterClockwise,
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
import { CustomSelect } from '@/components/shared/CustomSelect';

interface ProductProfile360ClientProps {
  productId: string;
}

type TabType = 'variants' | 'barcode' | 'wastage' | 'specs';

export function ProductProfile360Client({ productId }: ProductProfile360ClientProps) {
  const barcodeFormId = useId();
  const variantSelectId = `${barcodeFormId}-variant`;
  const stickerCountId = `${barcodeFormId}-count`;

  const [product, setProduct] = useState<Product | null>(null);
  const [wastages, setWastages] = useState<StockWastage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('variants');

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
        productService.getWastageHistory({ productId, limit: 30 }).catch(() => ({ wastages: [] })),
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
        <div className="flex flex-col items-center gap-3 bg-surface-card p-6 rounded-2xl border border-border-default shadow-xs">
          <Spinner size={32} weight="bold" className="animate-spin text-brand-deep" />
          <p className="text-xs font-semibold text-ink-secondary">পণ্য প্রোফাইল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-surface-canvas flex flex-col items-center justify-center p-6">
        <div className="bg-surface-card p-8 rounded-2xl border border-border-default shadow-sm max-w-md w-full text-center">
          <WarningCircle size={44} weight="fill" className="text-danger mx-auto mb-3" />
          <h2 className="text-base font-bold text-ink-primary mb-1">{error || 'পণ্যটি খুঁজে পাওয়া যায়নি'}</h2>
          <p className="text-xs text-ink-secondary mb-5">
            পণ্যের আইডি সঠিক আছে কিনা যাচাই করুন অথবা পণ্য তালিকায় ফিরে যান।
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-deep hover:bg-brand-hover text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>পণ্য তালিকায় ফিরুন</span>
          </Link>
        </div>
      </div>
    );
  }

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  // Financial & Inventory Aggregations
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

  const lowStockThreshold = product.lowStockAlert || 10;
  const isLowStock = totalStock <= lowStockThreshold;

  // Wastage Aggregations
  const totalWastageQty = wastages.reduce((sum, w) => sum + (w.quantity || 0), 0);
  const totalWastageLoss = wastages.reduce((sum, w) => sum + (w.lossAmount || 0), 0);

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

  const switchToBarcodeTab = () => {
    setActiveTab('barcode');
    setTimeout(() => {
      barcodeSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-surface-canvas pb-20 font-sans print:bg-white print:p-0 print:pb-0">
      {/* ১. টপ হেডার ও ব্রেডক্রাম্ব */}
      <header className="sticky top-0 z-30 bg-surface-canvas/90 backdrop-blur-md border-b border-border-default/80 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/products"
              className="p-2 rounded-xl text-ink-secondary hover:text-brand-deep hover:bg-brand-soft border border-border-default bg-surface-card transition-colors shrink-0 shadow-2xs"
              title="পণ্য তালিকায় ফিরে যান"
              aria-label="পণ্য তালিকায় ফিরে যান"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>

            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-1.5 text-xs text-ink-secondary truncate">
                <li>
                  <Link href="/products" className="hover:text-brand-deep transition-colors">
                    পণ্য তালিকা
                  </Link>
                </li>
                <li className="text-border-strong">/</li>
                {product.category && (
                  <>
                    <li className="truncate">
                      {product.category.banglaName || product.category.name}
                    </li>
                    <li className="text-border-strong">/</li>
                  </>
                )}
                <li className="font-semibold text-ink-primary truncate">
                  {product.banglaName || product.name}
                </li>
              </ol>
            </nav>
          </div>

          {/* হেডার কুইক অ্যাকশনস */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/pos"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cash-bg text-cash-text border border-cash-border hover:bg-cash-bg/80 text-xs font-bold transition-colors shadow-2xs"
              title="পিওএস বিক্রয় উইন্ডোতে যান"
            >
              <ShoppingCart size={15} weight="bold" />
              <span>পিওএস এ বিক্রি</span>
            </Link>

            <Link
              href={`/products/edit/${product.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-deep hover:bg-brand-hover text-white text-xs font-bold transition-colors shadow-2xs"
            >
              <PencilSimple size={15} weight="bold" />
              <span>পণ্য এডিট</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ২. থার্মাল বারকোড প্রিন্ট শিট (শুধুমাত্র প্রিন্টারের জন্য রেন্ডার হবে) */}
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

      {/* ৩. মূল বডি কনটেইনার */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 print:hidden">
        {/* ৩.১ প্রোডাক্ট আইডেন্টিটি হিরো কার্ড */}
        <section className="bg-surface-card rounded-2xl border border-border-default p-5 sm:p-6 shadow-xs transition-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* বামে: পণ্যের প্রাথমিক পরিচিতি */}
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-soft border border-brand-light/70 flex items-center justify-center text-brand-deep shrink-0 shadow-2xs">
                <Package size={32} weight="duotone" />
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-ink-primary">
                    {product.banglaName || product.name}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      product.isActive
                        ? 'bg-cash-bg text-cash-text border-cash-border'
                        : 'bg-surface-subtle text-ink-secondary border-border-default'
                    }`}
                  >
                    {product.isActive ? 'সক্রিয় পণ্য' : 'নিষ্ক্রিয়'}
                  </span>
                </div>

                {product.banglaName && product.name && (
                  <p className="text-xs sm:text-sm text-ink-secondary font-medium">
                    {product.name}
                  </p>
                )}

                {/* ট্যাগ ও মেটা ব্যাজ */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {product.category && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-subtle text-ink-body border border-border-default">
                      <Tag size={13} weight="bold" className="text-ink-secondary" />
                      {product.category.banglaName || product.category.name}
                    </span>
                  )}

                  {product.brand && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-soft text-brand-deep border border-brand-light">
                      <Storefront size={13} weight="bold" />
                      {product.brand.banglaName || product.brand.name}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-subtle text-ink-body border border-border-default">
                    <Scales size={13} weight="bold" className="text-ink-secondary" />
                    {selectedVariant?.allowDecimalQty ? 'ওজনযোগ্য (ভগ্নাংশ ০.২৫ কেজি)' : 'প্যাকেট / বোতল'}
                  </span>

                  <span className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-surface-subtle text-ink-secondary border border-border-default">
                    হিসাব একক: {product.baseUnitName}
                  </span>

                  <span className="px-2 py-1 rounded-lg text-xs font-mono text-ink-secondary border border-border-subtle">
                    আইডি: {product.id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* ডানে: লাইভ স্টক স্ট্যাটাস ও কুইক অ্যাকশন বোতাম */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border-subtle">
              {/* লাইভ স্টক বক্স */}
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-3 w-full sm:w-auto ${
                  isLowStock
                    ? 'bg-due-bg/50 border-due-border text-due-text'
                    : 'bg-cash-bg/40 border-cash-border text-cash-text'
                }`}
              >
                <div className="shrink-0">
                  {isLowStock ? (
                    <WarningCircle size={28} weight="fill" className="text-danger" />
                  ) : (
                    <CheckCircle size={28} weight="fill" className="text-success" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold block text-ink-secondary">
                    {isLowStock ? 'সতর্কতা: কম স্টক' : 'পর্যাপ্ত স্টক'}
                  </span>
                  <div className="font-mono font-black text-lg sm:text-xl text-ink-primary">
                    {formatWeight(totalStock, product.baseUnitName)}
                  </div>
                  <span className="text-2xs text-ink-secondary font-mono">
                    অ্যালার্ট সীমা: &le; {formatNumber(lowStockThreshold)} {product.baseUnitName}
                  </span>
                </div>
              </div>

              {/* কুইক অ্যাকশন বাটন সারি */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
                <button
                  type="button"
                  onClick={() => setActiveVariantForPrice(selectedVariant || product.variants[0])}
                  className="px-3 py-2 rounded-xl border border-border-strong hover:bg-surface-subtle text-ink-body hover:text-brand-deep text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  title="বর্তমান কেনা ও বিক্রয় দর পরিবর্তন করুন"
                >
                  <Coins size={14} weight="bold" className="text-brand-deep" />
                  <span>দর পরিবর্তন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveVariantForWastage(selectedVariant || product.variants[0])}
                  className="px-3 py-2 rounded-xl border border-border-strong hover:bg-due-bg text-ink-body hover:text-due-text text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  title="ঘাটতি বা নষ্ট পণ্যের এন্ট্রি করুন"
                >
                  <WarningCircle size={14} weight="bold" className="text-danger" />
                  <span>ঘাটতি এন্ট্রি</span>
                </button>

                <button
                  type="button"
                  onClick={switchToBarcodeTab}
                  className="px-3 py-2 rounded-xl border border-border-strong hover:bg-surface-subtle text-ink-body text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  title="থার্মাল বারকোড স্টিকার স্টুডিও"
                >
                  <Barcode size={15} weight="bold" className="text-ink-secondary" />
                  <span>বারকোড স্টিকার</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ৩.২ আর্থিক ও ইনভেন্টরি ভাইটাল স্ট্রিপ (৪-কার্ড কেপিআই গ্রিড) */}
        <section aria-label="আর্থিক ও স্টক ভাইটাল মেট্রিক্স">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ১. মোট মজুত */}
            <div className="bg-surface-card rounded-2xl border border-border-default p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand-deep border border-brand-light flex items-center justify-center shrink-0">
                <Package size={22} weight="bold" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ink-secondary block truncate">মোট বর্তমান স্টক</span>
                <span className="font-mono text-base sm:text-lg font-black text-ink-primary tabular-nums block truncate">
                  {formatWeight(totalStock, product.baseUnitName)}
                </span>
                <span className="text-2xs text-ink-secondary truncate block font-medium">
                  {product.hasVariants
                    ? `${formatNumber(product.variants.length)} টি ভ্যারিয়েন্টে`
                    : 'সাধারণ একক লট'}
                </span>
              </div>
            </div>

            {/* ২. কেনা মূলধন */}
            <div className="bg-surface-card rounded-2xl border border-border-default p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-surface-subtle text-ink-body border border-border-default flex items-center justify-center shrink-0">
                <Coins size={22} weight="bold" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ink-secondary block truncate">ইনভেন্টরি কেনা মূলধন</span>
                <span className="font-mono text-base sm:text-lg font-black text-ink-primary tabular-nums block truncate">
                  {formatCurrency(totalAssetValue)}
                </span>
                <span className="text-2xs text-ink-secondary truncate block font-medium">
                  গড় কেনাদর অনুযায়ী মোট আসল
                </span>
              </div>
            </div>

            {/* ৩. সম্ভাব্য বিক্রয় মূল্য */}
            <div className="bg-surface-card rounded-2xl border border-border-default p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-surface-subtle text-ink-body border border-border-default flex items-center justify-center shrink-0">
                <Receipt size={22} weight="bold" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ink-secondary block truncate">সম্ভাব্য বিক্রয় মূল্য</span>
                <span className="font-mono text-base sm:text-lg font-black text-ink-primary tabular-nums block truncate">
                  {formatCurrency(totalPotentialRevenue)}
                </span>
                <span className="text-2xs text-ink-secondary truncate block font-medium">
                  খুচরা দরে মোট সম্ভাব্য আয়
                </span>
              </div>
            </div>

            {/* ৪. প্রত্যাশিত গ্রস মুনাফা ও মার্জিন */}
            <div className="bg-surface-card rounded-2xl border border-border-default p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-cash-bg text-cash-text border border-cash-border flex items-center justify-center shrink-0">
                <TrendUp size={22} weight="bold" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ink-secondary block truncate">সম্ভাব্য গ্রস মুনাফা</span>
                <span className="font-mono text-base sm:text-lg font-black text-cash-text tabular-nums block truncate">
                  {formatCurrency(potentialGrossProfit)}
                </span>
                <span className="text-2xs font-mono font-bold text-cash-text truncate block">
                  মার্জিন: {formatPercent(overallMarginPercent, 1)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ৩.৩ সেগমেন্টেড ট্যাব কন্ট্রোলার */}
        <div className="border-b border-border-default">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveTab('variants')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                activeTab === 'variants'
                  ? 'bg-brand-deep text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-card'
              }`}
            >
              <Storefront size={16} weight={activeTab === 'variants' ? 'fill' : 'regular'} />
              <span>দর, স্টক ও ভ্যারিয়েন্ট</span>
              <span
                className={`px-2 py-0.5 rounded-full text-2xs font-mono font-bold ${
                  activeTab === 'variants' ? 'bg-white/20 text-white' : 'bg-surface-subtle text-ink-secondary'
                }`}
              >
                {formatNumber(product.variants.length)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('barcode')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                activeTab === 'barcode'
                  ? 'bg-brand-deep text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-card'
              }`}
            >
              <Barcode size={16} weight={activeTab === 'barcode' ? 'fill' : 'regular'} />
              <span>বারকোড স্টুডিও</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wastage')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                activeTab === 'wastage'
                  ? 'bg-brand-deep text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-card'
              }`}
            >
              <WarningCircle size={16} weight={activeTab === 'wastage' ? 'fill' : 'regular'} />
              <span>ওয়েস্টেজ ও ঘাটতি অডিট</span>
              {wastages.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-2xs font-mono font-bold ${
                    activeTab === 'wastage' ? 'bg-white/20 text-white' : 'bg-due-bg text-due-text'
                  }`}
                >
                  {formatNumber(wastages.length)}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-brand-deep text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-card'
              }`}
            >
              <Info size={16} weight={activeTab === 'specs' ? 'fill' : 'regular'} />
              <span>স্পেসিফিকেশন ও বিবরণ</span>
            </button>
          </div>
        </div>

        {/* ৩.৪ ট্যাব কনটেন্ট এরিয়া */}
        <section>
          {/* ট্যাব ১: দর, স্টক ও ভ্যারিয়েন্ট ম্যাট্রিক্স */}
          {activeTab === 'variants' && (
            <div className="bg-surface-card rounded-2xl border border-border-default shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                    <Storefront size={16} weight="bold" className="text-brand-deep" />
                    <span>ভ্যারিয়েন্ট অনুযায়ী কেনা, পাইকারি ও খুচরা দর তালিকা</span>
                  </h3>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    প্রতিটি ভ্যারিয়েন্টের লাইভ স্টক, কেনাদর, পাইকারি দর ও খুচরা মার্জিন বিশ্লেষণ
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveVariantForPrice(selectedVariant || product.variants[0])}
                    className="px-3 py-1.5 rounded-xl bg-brand-soft text-brand-deep border border-brand-light text-xs font-bold hover:bg-brand-soft/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Coins size={14} weight="bold" />
                    <span>দর পরিবর্তন</span>
                  </button>
                </div>
              </div>

              {/* ডেস্কটপ ভিউ: হাই-ডেনসিটি মেম্বারশিপ টেবিল */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-subtle/70 border-b border-border-default text-ink-secondary font-bold text-xs">
                      <th className="py-3 px-4">ভ্যারিয়েন্ট / সাইজ</th>
                      <th className="py-3 px-4">SKU ও বারকোড</th>
                      <th className="py-3 px-4 text-right">বর্তমান স্টক</th>
                      <th className="py-3 px-4 text-right">কেনাদর (৳)</th>
                      <th className="py-3 px-4 text-right">পাইকারি দর (৳)</th>
                      <th className="py-3 px-4 text-right">খুচরা দর (৳)</th>
                      <th className="py-3 px-4 text-center">খুচরা লাভ</th>
                      <th className="py-3 px-4 text-center">অ্যাকশন</th>
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

                      const isVariantLow = v.stockQuantity <= v.lowStockAlert;

                      return (
                        <tr key={v.id} className="hover:bg-surface-subtle/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-ink-primary text-sm">
                              {v.variantName === 'Default' ? 'মূল পণ্য' : v.variantName}
                            </div>
                            <span className="text-2xs text-ink-secondary font-mono">
                              একক: {v.baseUnitName} • {v.allowDecimalQty ? 'দশমিক ওজন' : 'পূর্ণসংখ্যা পিস'}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-xs">
                            <div className="text-ink-primary font-semibold">{v.sku || '-'}</div>
                            <div className="text-ink-secondary text-2xs">{v.barcode || '-'}</div>
                          </td>

                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            <span
                              className={`text-sm font-black ${
                                isVariantLow ? 'text-due-text' : 'text-ink-primary'
                              }`}
                            >
                              {formatWeight(v.stockQuantity, v.baseUnitName)}
                            </span>
                            {isVariantLow && (
                              <span className="block text-2xs text-due-text font-semibold">
                                অ্যালার্ট (&le;{formatNumber(v.lowStockAlert)})
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right font-mono tabular-nums text-ink-body font-semibold">
                            {formatCurrency(v.currentPurchasePrice)}
                          </td>

                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-wholesale-text">
                            <div>{formatCurrency(v.wholesalePrice)}</div>
                            <span className="text-2xs text-ink-secondary" title="পাইকারি মার্জিন">
                              +{formatPercent(wholesaleMargin, 0)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-mono tabular-nums font-black text-ink-primary">
                            <div>{formatCurrency(v.retailPrice)}</div>
                            <span className="text-2xs text-cash-text font-bold" title="খুচরা মার্জিন">
                              +{formatPercent(retailMargin, 0)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                                retailProfit >= 0
                                  ? 'bg-cash-bg text-cash-text border-cash-border'
                                  : 'bg-due-bg text-due-text border-due-border'
                              }`}
                              title={`খুচরা লাভ: ৳ ${retailProfit.toFixed(2)} (${retailMargin.toFixed(1)}%), পাইকারি লাভ: ৳ ${wholesaleProfit.toFixed(2)} (${wholesaleMargin.toFixed(1)}%)`}
                            >
                              {formatCurrency(retailProfit)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setActiveVariantForPrice(v)}
                                className="p-2 rounded-lg border border-border-default hover:bg-surface-subtle text-ink-secondary hover:text-brand-deep transition-colors cursor-pointer"
                                title="দর পরিবর্তন করুন"
                                aria-label={`${v.variantName} দর পরিবর্তন`}
                              >
                                <Coins size={15} weight="bold" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveVariantForWastage(v)}
                                className="p-2 rounded-lg border border-border-default hover:bg-due-bg text-ink-secondary hover:text-due-text transition-colors cursor-pointer"
                                title="ওয়েস্টেজ এন্ট্রি করুন"
                                aria-label={`${v.variantName} ওয়েস্টেজ এন্ট্রি`}
                              >
                                <WarningCircle size={15} weight="bold" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* মোবাইল ভিউ: কার্ড স্ট্রিম */}
              <div className="md:hidden divide-y divide-border-subtle">
                {product.variants.map((v) => {
                  const retailProfit = (v.retailPrice || 0) - (v.currentPurchasePrice || 0);
                  const retailMargin =
                    v.retailPrice > 0 ? (retailProfit / v.retailPrice) * 100 : 0;
                  const isVariantLow = v.stockQuantity <= v.lowStockAlert;

                  return (
                    <div key={v.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-ink-primary text-sm">
                            {v.variantName === 'Default' ? 'মূল পণ্য' : v.variantName}
                          </div>
                          <div className="text-2xs text-ink-secondary font-mono">
                            SKU: {v.sku || '-'} • বারকোড: {v.barcode || '-'}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-mono font-black text-sm block ${
                              isVariantLow ? 'text-due-text' : 'text-ink-primary'
                            }`}
                          >
                            {formatWeight(v.stockQuantity, v.baseUnitName)}
                          </span>
                          {isVariantLow && (
                            <span className="text-2xs text-due-text font-semibold">কম স্টক</span>
                          )}
                        </div>
                      </div>

                      {/* মূল্য গ্রিড */}
                      <div className="grid grid-cols-3 gap-2 bg-surface-subtle/80 p-2.5 rounded-xl border border-border-subtle text-center text-xs">
                        <div>
                          <span className="text-2xs text-ink-secondary block">কেনাদর</span>
                          <span className="font-mono font-bold text-ink-body">
                            {formatCurrency(v.currentPurchasePrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-2xs text-ink-secondary block">পাইকারি</span>
                          <span className="font-mono font-bold text-wholesale-text">
                            {formatCurrency(v.wholesalePrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-2xs text-ink-secondary block">খুচরা</span>
                          <span className="font-mono font-black text-ink-primary">
                            {formatCurrency(v.retailPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-2xs font-mono font-bold text-cash-text">
                          মুনাফা: {formatCurrency(retailProfit)} ({formatPercent(retailMargin, 0)})
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveVariantForPrice(v)}
                            className="px-2.5 py-1.5 rounded-lg border border-border-default hover:bg-surface-subtle text-xs font-bold text-ink-body flex items-center gap-1"
                          >
                            <Coins size={13} weight="bold" />
                            <span>দর</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveVariantForWastage(v)}
                            className="px-2.5 py-1.5 rounded-lg border border-border-default hover:bg-due-bg text-xs font-bold text-due-text flex items-center gap-1"
                          >
                            <WarningCircle size={13} weight="bold" />
                            <span>ঘাটতি</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ট্যাব ২: থার্মাল বারকোড স্টিকার স্টুডিও */}
          {activeTab === 'barcode' && (
            <div ref={barcodeSectionRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* বামে: কনফিগারেশন প্যানেল */}
              <div className="lg:col-span-7 bg-surface-card rounded-2xl border border-border-default p-5 sm:p-6 shadow-xs space-y-5">
                <div className="border-b border-border-subtle pb-3">
                  <h3 className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                    <Barcode size={18} weight="bold" className="text-brand-deep" />
                    <span>থার্মাল বারকোড স্টিকার প্রিন্ট স্টুডিও</span>
                  </h3>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    স্ট্যান্ডার্ড 50mm × 30mm সাইজের রোল স্টিকার প্রিন্ট করুন
                  </p>
                </div>

                {/* ভ্যারিয়েন্ট সিলেক্টর (যদি একের অধিক থাকে) */}
                {product.variants.length > 1 && (
                  <div>
                    <label htmlFor={variantSelectId} className="block text-xs font-bold text-ink-primary mb-1.5">
                      ভ্যারিয়েন্ট নির্ধারণ করুন
                    </label>
                    <CustomSelect
                      id={variantSelectId}
                      options={product.variants.map((v) => ({
                        value: v.id,
                        label: `${v.variantName} (স্টক: ${formatWeight(v.stockQuantity, v.baseUnitName)})`,
                      }))}
                      value={selectedVariantId}
                      onChange={setSelectedVariantId}
                      className="w-full"
                      buttonClassName="w-full h-10"
                    />
                  </div>
                )}

                {/* স্টিকারে প্রদর্শিত মূল্য নির্বাচন */}
                <div>
                  <label className="block text-xs font-bold text-ink-primary mb-1.5">
                    স্টিকারে প্রদর্শিত বিক্রয়মূল্য
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPriceTypeToPrint('RETAIL')}
                      className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                        priceTypeToPrint === 'RETAIL'
                          ? 'bg-brand-deep text-white border-brand-deep shadow-2xs'
                          : 'bg-surface-subtle text-ink-body border-border-default hover:bg-surface-card'
                      }`}
                    >
                      খুচরা দর
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceTypeToPrint('WHOLESALE')}
                      className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                        priceTypeToPrint === 'WHOLESALE'
                          ? 'bg-wholesale-solid text-white border-wholesale-hover shadow-2xs'
                          : 'bg-surface-subtle text-ink-body border-border-default hover:bg-surface-card'
                      }`}
                    >
                      পাইকারি দর
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceTypeToPrint('NONE')}
                      className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                        priceTypeToPrint === 'NONE'
                          ? 'bg-brand-deep text-white border-brand-deep shadow-2xs'
                          : 'bg-surface-subtle text-ink-body border-border-default hover:bg-surface-card'
                      }`}
                    >
                      দাম ছাড়া
                    </button>
                  </div>
                </div>

                {/* কপি সংখ্যা */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor={stickerCountId} className="text-xs font-bold text-ink-primary">
                      স্টিকার কপি সংখ্যা
                    </label>
                    <span className="font-mono text-xs font-black text-brand-deep">
                      {formatNumber(stickerCount)} কপি
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[1, 10, 24, 48, 100].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setStickerCount(count)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                          stickerCount === count
                            ? 'bg-brand-deep text-white border-brand-deep shadow-2xs'
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
                      className="w-20 px-2.5 py-1.5 text-center font-mono font-bold text-xs rounded-xl border border-border-strong bg-surface-card text-ink-primary"
                    />
                  </div>
                </div>

                {/* প্রিন্ট বোতাম */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePrintStickers}
                    disabled={isPrintingStickers}
                    className="w-full py-3 rounded-xl bg-brand-deep hover:bg-brand-hover text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
                  >
                    <Printer size={18} weight="bold" />
                    <span>{formatNumber(stickerCount)} কপি থার্মাল স্টিকার প্রিন্ট করুন</span>
                  </button>
                  <p className="text-2xs text-ink-secondary text-center mt-2">
                    টিপ: ব্রাউজার প্রিন্ট ডায়ালগে Paper Size &quot;50mm x 30mm&quot; বা রোল নির্বাচন করুন।
                  </p>
                </div>
              </div>

              {/* ডানে: লাইভ স্টিকার প্রিভিউ */}
              <div className="lg:col-span-5 bg-surface-card rounded-2xl border border-border-default p-5 sm:p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-full border-b border-border-subtle pb-3 text-left">
                  <span className="text-xs font-bold text-ink-primary block">
                    লাইভ থার্মাল স্টিকার প্রিভিউ
                  </span>
                  <span className="text-2xs text-ink-secondary font-mono">
                    সাইজ: 50mm × 30mm • Code128 বারকোড
                  </span>
                </div>

                {/* বাস্তবসম্মত 50mm x 30mm স্টিকার প্রিভিউ বক্স */}
                <div className="p-4 bg-surface-subtle rounded-2xl border border-dashed border-border-strong w-full flex items-center justify-center min-h-[220px]">
                  <div
                    className="bg-white text-slate-900 border border-slate-300 rounded-lg p-3 shadow-md flex flex-col items-center justify-between text-center select-none"
                    style={{ width: '220px', minHeight: '140px' }}
                  >
                    <div className="text-[11px] font-bold tracking-tight text-slate-700 w-full truncate">
                      মেসার্স ইদ্রিস ব্রাদার্স • ফেনী
                    </div>
                    <div className="text-[13px] font-black text-slate-900 leading-tight w-full truncate mt-0.5">
                      {product.banglaName || product.name}
                    </div>

                    {selectedVariant?.variantName && selectedVariant.variantName !== 'Default' && (
                      <div className="text-[11px] font-semibold text-slate-600">
                        সাইজ: {selectedVariant.variantName}
                      </div>
                    )}

                    {/* Barcode Graphic */}
                    <div className="my-1.5 flex justify-center w-full">
                      <svg
                        width={Math.min(180, barcodeData.totalWidth)}
                        height="30"
                        viewBox={`0 0 ${barcodeData.totalWidth} 30`}
                        className="max-w-full"
                      >
                        {barcodeData.bars.map((bar, bIdx) => (
                          <rect
                            key={bIdx}
                            x={bar.x}
                            y="0"
                            width={bar.width}
                            height="30"
                            fill="#000000"
                          />
                        ))}
                      </svg>
                    </div>

                    <div className="font-mono text-[10px] tracking-widest text-slate-700">
                      {barcodeValue}
                    </div>

                    {priceTypeToPrint !== 'NONE' && (
                      <div className="font-bold font-mono text-[13px] text-slate-950 mt-1">
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

                <div className="text-2xs text-ink-secondary">
                  প্রিন্টারে এই লেআউটে স্বয়ংক্রিয়ভাবে {formatNumber(stickerCount)} টি স্টিকার তৈরি হবে।
                </div>
              </div>
            </div>
          )}

          {/* ট্যাব ৩: ওয়েস্টেজ ও ঘাটতি অডিট */}
          {activeTab === 'wastage' && (
            <div className="bg-surface-card rounded-2xl border border-border-default shadow-xs overflow-hidden space-y-0">
              {/* সামারি ব্যানার */}
              <div className="p-4 sm:p-5 border-b border-border-subtle bg-surface-subtle/40 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                    <WarningCircle size={16} weight="bold" className="text-danger" />
                    <span>স্টক ঘাটতি ও ওয়েস্টেজ অডিট হিস্ট্রি</span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs mt-1 text-ink-secondary">
                    <span>
                      মোট রেকর্ড: <strong className="font-mono text-ink-primary">{formatNumber(wastages.length)}</strong> টি
                    </span>
                    <span>•</span>
                    <span>
                      মোট নষ্ট ওজন:{' '}
                      <strong className="font-mono text-due-text font-bold">
                        {formatWeight(totalWastageQty, product.baseUnitName)}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      আর্থিক লোকসান:{' '}
                      <strong className="font-mono text-due-text font-bold">
                        {formatCurrency(totalWastageLoss)}
                      </strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveVariantForWastage(product.variants[0])}
                  className="px-3.5 py-2 rounded-xl bg-due-bg text-due-text border border-due-border text-xs font-bold hover:bg-due-bg/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={14} weight="bold" />
                  <span>নতুন ঘাটতি এন্ট্রি করুন</span>
                </button>
              </div>

              {wastages.length === 0 ? (
                <div className="py-16 text-center text-ink-secondary text-xs space-y-2">
                  <CheckCircle size={36} weight="duotone" className="text-cash-text mx-auto" />
                  <p className="font-bold text-ink-primary">কোনো ওয়েস্টেজ বা ঘাটতির রেকর্ড নেই</p>
                  <p className="text-2xs text-ink-secondary">
                    এই পণ্যের ইনভেন্টরিতে কোনো ঘাটতি বা ড্যামেজ এন্ট্রি পাওয়া যায়নি।
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-subtle/70 border-b border-border-default text-ink-secondary font-bold text-xs">
                        <th className="py-3 px-4">তারিখ</th>
                        <th className="py-3 px-4">ভ্যারিয়েন্ট</th>
                        <th className="py-3 px-4 text-right">ঘাটতির পরিমাণ</th>
                        <th className="py-3 px-4 text-right">কেনাদর লোকসান (৳)</th>
                        <th className="py-3 px-4">ঘাটতির কারণ ও নোট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {wastages.map((w) => (
                        <tr key={w.id} className="hover:bg-surface-subtle/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-ink-secondary">
                            {formatDateBn(w.recordedAt)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-ink-primary">
                            {w.variant?.variantName || 'মূল পণ্য'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-due-text">
                            -{formatWeight(w.quantity, product.baseUnitName)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-due-text">
                            {formatCurrency(w.lossAmount)}
                          </td>
                          <td className="py-3 px-4 text-ink-body">
                            <span className="font-semibold">{w.reason}</span>
                            {w.note && (
                              <span className="text-ink-secondary text-2xs block mt-0.5">{w.note}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ট্যাব ৪: স্পেসিফিকেশন ও নোট */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* টেকনিক্যাল স্পেসিফিকেশন */}
              <div className="lg:col-span-8 bg-surface-card rounded-2xl border border-border-default p-5 sm:p-6 shadow-xs space-y-5">
                <div className="border-b border-border-subtle pb-3">
                  <h3 className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                    <FileText size={18} weight="bold" className="text-brand-deep" />
                    <span>পণ্যের প্রযুক্তিগত স্পেসিফিকেশন ও বিবরণ</span>
                  </h3>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    প্যাকেজিং, বিক্রয় মোড ও অভ্যন্তরীণ কনফিগারেশন বিবরণ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-surface-subtle/50 rounded-xl border border-border-subtle">
                    <span className="text-2xs text-ink-secondary font-bold block mb-1">বাংলা নাম</span>
                    <span className="font-bold text-ink-primary text-sm">
                      {product.banglaName || 'নাম দেওয়া নেই'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-subtle/50 rounded-xl border border-border-subtle">
                    <span className="text-2xs text-ink-secondary font-bold block mb-1">ইংরেজি নাম</span>
                    <span className="font-semibold text-ink-primary text-sm">
                      {product.name}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-subtle/50 rounded-xl border border-border-subtle">
                    <span className="text-2xs text-ink-secondary font-bold block mb-1">ক্যাটাগরি</span>
                    <span className="font-semibold text-ink-body">
                      {product.category?.banglaName || product.category?.name || 'ক্যাটাগরি নেই'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-subtle/50 rounded-xl border border-border-subtle">
                    <span className="text-2xs text-ink-secondary font-bold block mb-1">ব্র্যান্ড / প্রস্তুতকারক</span>
                    <span className="font-semibold text-ink-body">
                      {product.brand?.banglaName || product.brand?.name || 'নিজস্ব / খোলা মাল'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-subtle/50 rounded-xl border border-border-subtle">
                    <span className="text-2xs text-ink-secondary font-bold block mb-1">মূল হিসাব একক</span>
                    <span className="font-mono font-bold text-ink-primary">
                      {product.baseUnitName}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-subtle/50 rounded-xl border border-border-subtle">
                    <span className="text-2xs text-ink-secondary font-bold block mb-1">বিক্রয় ও ওজন মোড</span>
                    <span className="font-semibold text-ink-body">
                      {selectedVariant?.allowDecimalQty
                        ? 'ওজনযোগ্য (ভগ্নাংশ ০.২৫ কেজি বিক্রয়যোগ্য)'
                        : 'প্যাকেট / বোতল (কেবল পূর্ণসংখ্যা)'}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-subtle/50 rounded-xl border border-border-subtle">
                    <span className="text-2xs text-ink-secondary font-bold block mb-1">কম স্টক অ্যালার্ট সীমা</span>
                    <span className="font-mono font-bold text-ink-primary">
                      &le; {formatNumber(product.lowStockAlert || 10)} {product.baseUnitName}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-subtle/50 rounded-xl border border-border-subtle">
                    <span className="text-2xs text-ink-secondary font-bold block mb-1">ভ্যারিয়েন্ট স্ট্রাকচার</span>
                    <span className="font-semibold text-ink-body">
                      {product.hasVariants
                        ? `${formatNumber(product.variants.length)} টি স্বতন্ত্র ভ্যারিয়েন্টযুক্ত`
                        : 'সাধারণ একক পণ্য'}
                    </span>
                  </div>
                </div>

                {/* বিবরণী ও সংরক্ষণ নির্দেশিকা */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-ink-primary block mb-1.5">
                    পণ্য বিবরণী ও স্টোরেজ নির্দেশিকা
                  </span>
                  <div className="p-3.5 bg-surface-subtle/70 rounded-xl border border-border-subtle text-xs text-ink-body leading-relaxed whitespace-pre-wrap">
                    {product.description || 'এই পণ্যের জন্য অতিরিক্ত কোনো বিবরণ বা সংরক্ষণ নির্দেশনা যুক্ত করা হয়নি।'}
                  </div>
                </div>
              </div>

              {/* সিস্টেম মেটা ও হিস্ট্রি */}
              <div className="lg:col-span-4 bg-surface-card rounded-2xl border border-border-default p-5 shadow-xs space-y-4">
                <span className="text-xs font-bold text-ink-primary border-b border-border-subtle pb-2 block">
                  সিস্টেম অডিট ও মেটাডাটা
                </span>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-2xs text-ink-secondary block">ডাটাবেজ আইডি</span>
                    <span className="font-mono text-2xs text-ink-primary font-bold break-all">
                      {product.id}
                    </span>
                  </div>

                  <div>
                    <span className="text-2xs text-ink-secondary block">তৈরির তারিখ</span>
                    <span className="font-mono text-ink-body">
                      {product.createdAt ? formatDateBn(product.createdAt) : 'রেকর্ড নেই'}
                    </span>
                  </div>

                  <div>
                    <span className="text-2xs text-ink-secondary block">সর্বশেষ আপডেট</span>
                    <span className="font-mono text-ink-body">
                      {product.updatedAt ? formatDateBn(product.updatedAt) : 'রেকর্ড নেই'}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border-subtle">
                    <Link
                      href={`/products/edit/${product.id}`}
                      className="w-full py-2 rounded-xl bg-brand-soft text-brand-deep hover:bg-brand-soft/80 border border-brand-light text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <PencilSimple size={14} weight="bold" />
                      <span>পণ্য তথ্য এডিট করুন</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ৪. কুইক অ্যাকশন মোডালসমূহ */}
      <QuickPriceModal
        isOpen={Boolean(activeVariantForPrice)}
        onClose={() => {
          setActiveVariantForPrice(null);
          loadProductData();
        }}
        variant={activeVariantForPrice}
        productName={product.banglaName || product.name}
      />

      <RecordWastageModal
        isOpen={Boolean(activeVariantForWastage)}
        onClose={() => {
          setActiveVariantForWastage(null);
          loadProductData();
        }}
        variant={activeVariantForWastage}
        productName={product.banglaName || product.name}
      />
    </div>
  );
}
