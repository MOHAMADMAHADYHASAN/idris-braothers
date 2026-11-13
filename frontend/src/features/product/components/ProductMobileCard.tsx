'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Coins,
  WarningCircle,
  PencilSimple,
  Trash,
  CaretDown,
  CaretRight,
  Warning,
} from '@phosphor-icons/react';
import { Product, ProductVariant } from '../product.types';
import { formatCurrency, formatNumber, formatWeight } from '@/lib/decimal';

interface ProductMobileCardProps {
  product: Product;
  onEditProduct: (product: Product) => void;
  onOpenPriceModal: (variant: ProductVariant, productName: string) => void;
  onOpenWastageModal: (variant: ProductVariant, productName: string) => void;
  onDeleteVariant: (variantId: string, variantName: string) => void;
}

export function ProductMobileCard({
  product,
  onEditProduct,
  onOpenPriceModal,
  onOpenWastageModal,
  onDeleteVariant,
}: ProductMobileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const primaryVariant = product.variants[0];
  const hasMultipleVariants = product.hasVariants && product.variants.length > 1;

  const isLowStock = product.variants.some(
    (v) => v.stockQuantity <= v.lowStockAlert
  );

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden transition-[border-color,box-shadow] duration-150">
      {/* ১. হেডার */}
      <div className="p-3 bg-surface-subtle/60 border-b border-border-subtle flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${product.id}`}
            className="font-bold text-ink-primary text-sm hover:underline hover:text-brand-deep block truncate"
          >
            {product.name}
          </Link>
          {(product.banglaName || product.category || product.brand) && (
            <p className="text-xs text-ink-secondary mt-0.5 truncate">
              {[
                product.banglaName,
                product.category ? (product.category.banglaName || product.category.name) : null,
                product.brand ? (product.brand.banglaName || product.brand.name) : null,
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
          )}
        </div>

        {/* স্টক স্ট্যাটাস ব্যাজ (কেবল সংকট থাকলে) */}
        {isLowStock && (
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-due-bg text-due-text border border-due-border">
              <Warning size={12} weight="fill" />
              <span>স্টক সংকট</span>
            </span>
          </div>
        )}
      </div>

      {/* ২. কী-ভ্যালু গ্রিড */}
      <div className="p-3 text-xs space-y-2.5">
        <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-border-subtle">
          <div>
            <span className="text-xs font-semibold text-ink-secondary block">
              SKU ও বারকোড
            </span>
            <span className="font-mono text-ink-primary font-semibold tabular-nums text-xs">
              {hasMultipleVariants ? '—' : primaryVariant?.sku || '—'}
            </span>
            {!hasMultipleVariants && primaryVariant?.barcode && (
              <span className="block font-mono text-xs text-ink-secondary tabular-nums">
                {primaryVariant.barcode}
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-ink-secondary block">
              মোট মজুত স্টক
            </span>
            <span
              className={`font-mono text-sm font-black tabular-nums ${
                isLowStock ? 'text-due-text' : 'text-ink-primary'
              }`}
            >
              {formatWeight(
                product.stockQuantity ?? primaryVariant?.stockQuantity ?? 0,
                primaryVariant?.baseUnitName || 'কেজি'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
          <div className="text-ink-secondary">
            কেনা: {formatCurrency(primaryVariant?.currentPurchasePrice ?? 0, false)}
          </div>
          <div className="font-bold text-ink-primary">
            খুচরা: {formatCurrency(primaryVariant?.retailPrice ?? 0, false)}
          </div>
          <div className="text-wholesale-text font-semibold">
            পাইকারি: {formatCurrency(primaryVariant?.wholesalePrice ?? 0, false)}
          </div>
        </div>

        {/* ৩. মাল্টি-ভ্যারিয়েন্ট একর্ডিয়ন */}
        {hasMultipleVariants && (
          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-surface-subtle hover:bg-brand-soft text-ink-body hover:text-brand-deep font-semibold text-xs transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Package size={14} weight="bold" className="text-brand-deep" />
                <span>সব ভ্যারিয়েন্ট দেখুন ({formatNumber(product.variants.length)} টি)</span>
              </span>
              {isExpanded ? (
                <CaretDown size={13} weight="bold" />
              ) : (
                <CaretRight size={13} weight="bold" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-1.5">
                {product.variants.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-lg bg-surface-subtle/80 border border-border-default text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink-primary">
                        {v.variantName}
                      </span>
                      <span className="font-mono tabular-nums font-bold text-ink-primary">
                        স্টক: {formatWeight(v.stockQuantity, v.baseUnitName)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-ink-secondary font-mono tabular-nums">
                      <span>SKU: {v.sku}</span>
                      <span>
                        খুচরা: {formatCurrency(v.retailPrice, false)} | কেনা: {formatCurrency(v.currentPurchasePrice, false)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-border-default">
                      <button
                        type="button"
                        onClick={() => onOpenPriceModal(v, `${product.name} (${v.variantName})`)}
                        className="px-2.5 py-1 rounded bg-surface-card border border-border-default text-ink-body hover:bg-surface-subtle text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Coins size={12} weight="bold" className="text-wholesale-solid" />
                        <span>দর পরিবর্তন</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenWastageModal(v, `${product.name} (${v.variantName})`)}
                        className="px-2.5 py-1 rounded bg-surface-card border border-border-default text-ink-body hover:bg-surface-subtle text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <WarningCircle size={12} weight="bold" className="text-danger" />
                        <span>ঘাটতি</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteVariant(v.id, v.variantName)}
                        className="p-1 rounded text-due-text hover:bg-due-bg ml-auto cursor-pointer"
                        title="ভ্যারিয়েন্ট মুছুন"
                        aria-label={`${v.variantName} ভ্যারিয়েন্ট মুছুন`}
                      >
                        <Trash size={13} weight="bold" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ৪. পিনড বটম অ্যাকশন বার */}
      <div className="p-2.5 bg-surface-subtle/60 border-t border-border-subtle grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => onOpenPriceModal(primaryVariant, product.name)}
          className="h-9 px-2 rounded-lg bg-surface-card border border-border-strong hover:bg-surface-subtle active:scale-[0.98] text-ink-body text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Coins size={14} weight="bold" className="text-wholesale-solid" />
          <span>দর পরিবর্তন</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenWastageModal(primaryVariant, product.name)}
          className="h-9 px-2 rounded-lg bg-surface-card border border-border-strong hover:bg-surface-subtle active:scale-[0.98] text-ink-body text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <WarningCircle size={14} weight="bold" className="text-danger" />
          <span>ঘাটতি</span>
        </button>

        <button
          type="button"
          onClick={() => onEditProduct(product)}
          className="h-9 px-2 rounded-lg bg-brand-deep hover:bg-brand-hover active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <PencilSimple size={14} weight="bold" />
          <span>এডিট</span>
        </button>
      </div>
    </div>
  );
}
