'use client';

import React, { useState } from 'react';
import {
  Package,
  Coins,
  WarningCircle,
  PencilSimple,
  Trash,
  CaretDown,
  CaretRight,
  ArrowsLeftRight,
  Warning,
} from '@phosphor-icons/react';
import { Product, ProductVariant } from '../product.types';

interface ProductMobileCardProps {
  product: Product;
  onEditProduct: (product: Product) => void;
  onOpenPriceModal: (variant: ProductVariant, productName: string) => void;
  onOpenUnitModal: (variant: ProductVariant, productName: string) => void;
  onOpenWastageModal: (variant: ProductVariant, productName: string) => void;
  onDeleteVariant: (variantId: string, variantName: string) => void;
}

export function ProductMobileCard({
  product,
  onEditProduct,
  onOpenPriceModal,
  onOpenUnitModal,
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
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden transition-[border-color,box-shadow] duration-150">
      {/* ১. ২-লাইন হেডার (Title + Category + Status Badge) */}
      <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-900 text-sm tracking-tight">
              {product.name}
            </span>
            {product.category && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                {product.category.banglaName || product.category.name}
              </span>
            )}
            {product.brand && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200/70">
                {product.brand.banglaName || product.brand.name}
              </span>
            )}
          </div>
          {product.banglaName && (
            <p className="text-xs text-slate-500 mt-0.5 tracking-tight truncate">
              {product.banglaName}
            </p>
          )}
        </div>

        {/* স্টক স্ট্যাটাস ব্যাজ */}
        <div className="shrink-0">
          {isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <Warning size={11} weight="fill" />
              <span>স্টক সংকট</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              পর্যাপ্ত
            </span>
          )}
        </div>
      </div>

      {/* ২. কী-ভ্যালু গ্রিড (Key-Value Metadata) */}
      <div className="p-3 text-xs space-y-2">
        {/* রো ১: SKU ও মোট মজুত স্টক */}
        <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              SKU / বারকোড
            </span>
            <span className="font-mono text-slate-800 font-semibold tabular-nums text-xs">
              {primaryVariant?.sku || 'N/A'}
            </span>
            {primaryVariant?.barcode && (
              <span className="block font-mono text-[10px] text-slate-400 tabular-nums">
                {primaryVariant.barcode}
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              মোট মজুত স্টক
            </span>
            <span
              className={`font-mono text-sm font-black tabular-nums tracking-tight ${
                isLowStock ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {product.stockQuantity ?? primaryVariant?.stockQuantity ?? 0}{' '}
              <span className="text-[11px] font-semibold text-slate-500">
                {primaryVariant?.baseUnitName || 'কেজি'}
              </span>
            </span>
          </div>
        </div>

        {/* রো ২: রূপান্তর একক ও কেনা/বেচা দর */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              রূপান্তর একক
            </span>
            {primaryVariant?.units && primaryVariant.units.length > 0 ? (
              <div className="mt-0.5 flex flex-wrap gap-1">
                {primaryVariant.units.map((u) => (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium border border-slate-200/80"
                  >
                    <span>{u.unitName}</span>
                    <span className="text-slate-400 font-mono text-[9px]">
                      (= {u.conversionFactor} {primaryVariant.baseUnitName})
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 text-[11px]">একক ইউনিট</span>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              কেনা ও বিক্রয় দর
            </span>
            <div className="mt-0.5 space-y-0.5 font-mono tabular-nums text-xs">
              <div className="text-slate-500 text-[11px]">
                কেনা: ৳{primaryVariant?.currentPurchasePrice ?? 0}
              </div>
              <div className="font-bold text-slate-900">
                খুচরা: ৳{primaryVariant?.retailPrice ?? 0}
              </div>
              <div className="text-slate-600 text-[11px]">
                পাইকারি: ৳{primaryVariant?.wholesalePrice ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* ৩. মাল্টি-ভ্যারিয়েন্ট একর্ডিয়ন (যদি একাধিক ভ্যারিয়েন্ট থাকে) */}
        {hasMultipleVariants && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between py-1 px-2 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                <Package size={13} weight="bold" className="text-slate-500" />
                <span>সব ভ্যারিয়েন্ট দেখুন ({product.variants.length} টি SKU)</span>
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
                    className="p-2 rounded-md bg-slate-50/80 border border-slate-200/70 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {v.variantName}
                      </span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        স্টক: {v.stockQuantity} {v.baseUnitName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 font-mono tabular-nums">
                      <span>SKU: {v.sku}</span>
                      <span>
                        খুচরা: ৳{v.retailPrice} | কেনা: ৳{v.currentPurchasePrice}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => onOpenPriceModal(v, `${product.name} (${v.variantName})`)}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-semibold flex items-center gap-1"
                      >
                        <Coins size={11} weight="bold" />
                        <span>দর পরিবর্তন</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenWastageModal(v, `${product.name} (${v.variantName})`)}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-semibold flex items-center gap-1"
                      >
                        <WarningCircle size={11} weight="bold" />
                        <span>ঘাটতি</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteVariant(v.id, v.variantName)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 ml-auto"
                        title="ভ্যারিয়েন্ট মুছুন"
                      >
                        <Trash size={12} weight="bold" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ৪. পিনড বটম অ্যাকশন বার (Pinned Full-Width h-9 Action Button Bar) */}
      <div className="p-2 bg-slate-50/80 border-t border-slate-100 grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => onOpenPriceModal(primaryVariant, product.name)}
          className="h-9 px-2 rounded-md bg-white border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
        >
          <Coins size={14} weight="bold" className="text-amber-600" />
          <span>দর পরিবর্তন</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenWastageModal(primaryVariant, product.name)}
          className="h-9 px-2 rounded-md bg-white border border-slate-200/90 hover:bg-slate-100 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-[background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs"
        >
          <WarningCircle size={14} weight="bold" className="text-rose-600" />
          <span>ঘাটতি/অপচয়</span>
        </button>

        <button
          type="button"
          onClick={() => onEditProduct(product)}
          className="h-9 px-2 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-[background-color,transform] duration-150 cursor-pointer shadow-2xs"
        >
          <PencilSimple size={14} weight="bold" />
          <span>এডিট</span>
        </button>
      </div>
    </div>
  );
}
