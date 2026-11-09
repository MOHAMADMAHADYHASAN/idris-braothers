'use client';

import React, { useState } from 'react';
import {
  CaretDown,
  CaretRight,
  Coins,
  Package,
  WarningCircle,
  PencilSimple,
  MagnifyingGlass,
  CheckCircle,
  Warning,
  Funnel,
  Scales,
  Trash,
} from '@phosphor-icons/react';
import { Product, ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';
import { QuickPriceModal } from './QuickPriceModal';
import { AddUnitModal } from './AddUnitModal';
import { RecordWastageModal } from './RecordWastageModal';

interface ProductListTableProps {
  products: Product[];
  isLoading: boolean;
  onEditProduct: (product: Product) => void;
}

export function ProductListTable({ products, isLoading, onEditProduct }: ProductListTableProps) {
  const { deleteVariant } = useProductStore();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);

  // Modals state
  const [activeVariantForPrice, setActiveVariantForPrice] = useState<{
    variant: ProductVariant;
    productName: string;
  } | null>(null);

  const [activeVariantForUnit, setActiveVariantForUnit] = useState<{
    variant: ProductVariant;
    productName: string;
  } | null>(null);

  const [activeVariantForWastage, setActiveVariantForWastage] = useState<{
    variant: ProductVariant;
    productName: string;
  } | null>(null);

  const toggleRow = (productId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleDeleteVariant = async (variantId: string, variantName: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${variantName}" ভ্যারিয়েন্টটি মুছতে চান?`)) {
      return;
    }
    setDeletingVariantId(variantId);
    try {
      const res = await deleteVariant(variantId);
      if (res?.deactivated) {
        alert(
          `ঐতিহাসিক বিক্রয় বা পারচেজ রেকর্ড থাকার কারণে "${variantName}" ভ্যারিয়েন্টটি স্থায়ীভাবে মুছে না ফেলে নিষ্ক্রিয় (Deactivated) করা হয়েছে।`
        );
      }
    } catch (err: any) {
      alert(err.message || 'ভ্যারিয়েন্ট মুছতে সমস্যা হয়েছে');
    } finally {
      setDeletingVariantId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-12 text-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">পণ্য তালিকা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 border border-slate-200/70 flex items-center justify-center mx-auto mb-3">
          <Package size={24} weight="bold" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          অনুসন্ধানের সাথে কোনো পণ্য মিলেনি অথবা ক্যাটালগে এখনো পণ্য যুক্ত করা হয়নি।
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-500 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">পণ্যের নাম ও ক্যাটাগরি</th>
                <th className="py-3 px-4">ধরণ ও SKU</th>
                <th className="py-3 px-4 text-right">মজুত স্টক</th>
                <th className="py-3 px-4">ইউনিট ও রূপান্তর</th>
                <th className="py-3 px-4 text-right">ক্রয় ও বিক্রয় মূল্য</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const isExpanded = Boolean(expandedRows[product.id]);
                const hasMultipleVariants = product.hasVariants && product.variants.length > 1;
                const primaryVariant = product.variants[0];

                const isLowStock = product.variants.some((v) => v.stockQuantity <= v.lowStockAlert);

                return (
                  <React.Fragment key={product.id}>
                    {/* Primary Product Row */}
                    <tr
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isExpanded ? 'bg-slate-50/40' : ''
                      }`}
                    >
                      {/* Expand / Collapse Button */}
                      <td className="py-3 px-4 text-center">
                        {hasMultipleVariants ? (
                          <button
                            onClick={() => toggleRow(product.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title={isExpanded ? 'লুকান' : 'ভ্যারিয়েন্ট বিস্তারিত দেখুন'}
                          >
                            {isExpanded ? (
                              <CaretDown size={14} weight="bold" />
                            ) : (
                              <CaretRight size={14} weight="bold" />
                            )}
                          </button>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300 mx-auto" />
                        )}
                      </td>

                      {/* Product Name & Details */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {product.name}
                        </div>
                        {product.banglaName && (
                          <div className="text-slate-500 text-xs mt-0.5">
                            {product.banglaName}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {product.category && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                              {product.category.banglaName || product.category.name}
                            </span>
                          )}
                          {product.brand && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200/60">
                              {product.brand.banglaName || product.brand.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type & SKU */}
                      <td className="py-3 px-4">
                        {product.hasVariants ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                              <Package size={11} weight="bold" />
                              বহুমুখী ({product.variants.length} ভ্যারিয়েন্ট)
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">
                              ক্লিক করে সাইজ দেখুন
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                              একক পণ্য
                            </span>
                            <div className="font-mono text-slate-500 text-[11px] mt-1 truncate max-w-[120px]">
                              {primaryVariant?.sku || 'N/A'}
                            </div>
                            {primaryVariant?.barcode && (
                              <div className="font-mono text-slate-400 text-[10px]">
                                ▊ {primaryVariant.barcode}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          {product.stockQuantity}{' '}
                          <span className="text-xs font-normal text-slate-500">
                            {product.baseUnitName}
                          </span>
                        </div>
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-1">
                            <Warning size={11} weight="fill" />
                            স্টক সংকট
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                            <CheckCircle size={11} weight="bold" />
                            পর্যাপ্ত স্টক
                          </span>
                        )}
                      </td>

                      {/* Base Unit & Conversions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-800">
                            {product.baseUnitName}
                          </span>
                          {primaryVariant && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                primaryVariant.allowDecimalQty
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200/70'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                              }`}
                              title={
                                primaryVariant.allowDecimalQty
                                  ? 'খোলা / ওজনযোগ্য (দশমিক বিক্রি সম্ভব)'
                                  : 'সিল করা প্যাকেট (পূর্ণসংখ্যা)'
                              }
                            >
                              {primaryVariant.allowDecimalQty ? 'ওজনযোগ্য' : 'প্যাকেট'}
                            </span>
                          )}
                        </div>
                        {primaryVariant?.units && primaryVariant.units.length > 0 && (
                          <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                            {primaryVariant.units.map((u) => (
                              <div key={u.id} className="truncate max-w-[150px]">
                                • ১ {u.unitName} = {u.conversionFactor} {product.baseUnitName}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Prices */}
                      <td className="py-3 px-4 text-right">
                        {product.hasVariants && hasMultipleVariants ? (
                          <div className="text-slate-500 text-xs">
                            ভ্যারিয়েন্ট অনুযায়ী আলাদা
                          </div>
                        ) : (
                          <div className="space-y-0.5 font-mono">
                            <div className="text-slate-900 font-semibold text-xs">
                              খুচরা: ৳{primaryVariant?.retailPrice}
                            </div>
                            <div className="text-slate-600 text-[11px]">
                              পাইকারি: ৳{primaryVariant?.wholesalePrice}
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              ক্রয়: ৳{primaryVariant?.currentPurchasePrice}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200/60 shadow-2xs">
                          {/* Quick Price Update */}
                          {primaryVariant && (
                            <button
                              onClick={() =>
                                setActiveVariantForPrice({
                                  variant: primaryVariant,
                                  productName: product.name,
                                })
                              }
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                              title="বাজারদর ও বিক্রয়মূল্য পরিবর্তন"
                            >
                              <Coins size={15} weight="bold" />
                            </button>
                          )}

                          {/* Add Custom Unit */}
                          {primaryVariant && (
                            <button
                              onClick={() =>
                                setActiveVariantForUnit({
                                  variant: primaryVariant,
                                  productName: product.name,
                                })
                              }
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                              title="নতুন বস্তা বা কার্টন রূপান্তর ইউনিট যোগ করুন"
                            >
                              <Package size={15} weight="bold" />
                            </button>
                          )}

                          {/* Record Wastage */}
                          {primaryVariant && (
                            <button
                              onClick={() =>
                                setActiveVariantForWastage({
                                  variant: primaryVariant,
                                  productName: product.name,
                                })
                              }
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-white rounded transition-colors"
                              title="অপচয় বা শুকিয়ে যাওয়া ঘাটতি এন্ট্রি"
                            >
                              <WarningCircle size={15} weight="bold" />
                            </button>
                          )}

                          {/* Edit Product */}
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                            title="পণ্যের বিবরণ সম্পাদনা"
                          >
                            <PencilSimple size={15} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Variants Sub-Table */}
                    {hasMultipleVariants && isExpanded && (
                      <tr className="bg-slate-50/70 border-b border-slate-200/60">
                        <td colSpan={7} className="p-4 pl-12">
                          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/70 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                              <span>
                                {product.name} - এর অন্তর্ভূক্ত ভ্যারিয়েন্ট তালিকা ({product.variants.length} টি SKU)
                              </span>
                            </div>
                            <table className="w-full text-xs">
                              <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase border-b border-slate-100 font-semibold">
                                <tr>
                                  <th className="py-2 px-3">ভ্যারিয়েন্ট সাইজ</th>
                                  <th className="py-2 px-3">SKU ও বারকোড</th>
                                  <th className="py-2 px-3">কন্ট্রোল</th>
                                  <th className="py-2 px-3 text-right">মজুত স্টক</th>
                                  <th className="py-2 px-3">কার্টন / বস্তা ইউনিট</th>
                                  <th className="py-2 px-3 text-right">দর (ক্রয় / খুচরা / পাইকারি)</th>
                                  <th className="py-2 px-3 text-center">অ্যাকশন</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {product.variants.map((variant) => (
                                  <tr key={variant.id} className="hover:bg-slate-50/50">
                                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                                      {variant.variantName}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                                      <div>{variant.sku}</div>
                                      {variant.barcode && (
                                        <div className="text-slate-400 text-[10px]">
                                          ▊ {variant.barcode}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                          variant.allowDecimalQty
                                            ? 'bg-sky-50 text-sky-700 border border-sky-200/70'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                                        }`}
                                      >
                                        {variant.allowDecimalQty ? 'ওজনযোগ্য' : 'প্যাকেট'}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                      {variant.stockQuantity}{' '}
                                      <span className="text-xs font-normal text-slate-500">
                                        {variant.baseUnitName}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                                      {variant.units && variant.units.length > 0 ? (
                                        <div className="space-y-0.5">
                                          {variant.units.map((u) => (
                                            <div key={u.id}>
                                              • {u.unitName} ({u.conversionFactor} {variant.baseUnitName})
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-slate-400 italic">কোনো বাল্ক ইউনিট নেই</span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono">
                                      <div className="text-slate-900 font-semibold">
                                        খুচরা: ৳{variant.retailPrice}
                                      </div>
                                      <div className="text-slate-600 text-[10px]">
                                        পাইকারি: ৳{variant.wholesalePrice} | ক্রয়: ৳{variant.currentPurchasePrice}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-200/60">
                                        <button
                                          onClick={() =>
                                            setActiveVariantForPrice({
                                              variant,
                                              productName: product.name,
                                            })
                                          }
                                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded"
                                          title="মূল্য পরিবর্তন"
                                        >
                                          <Coins size={14} weight="bold" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setActiveVariantForUnit({
                                              variant,
                                              productName: product.name,
                                            })
                                          }
                                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded"
                                          title="কার্টন ইউনিট যোগ"
                                        >
                                          <Package size={14} weight="bold" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setActiveVariantForWastage({
                                              variant,
                                              productName: product.name,
                                            })
                                          }
                                          className="p-1 text-slate-600 hover:text-amber-700 hover:bg-white rounded"
                                          title="ঘাটতি রেকর্ড"
                                        >
                                          <WarningCircle size={14} weight="bold" />
                                        </button>
                                        {product.variants.length > 1 && (
                                          <button
                                            onClick={() => handleDeleteVariant(variant.id, variant.variantName)}
                                            disabled={deletingVariantId === variant.id}
                                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded disabled:opacity-50"
                                            title="ভ্যারিয়েন্ট মুছুন / নিষ্ক্রিয় করুন"
                                          >
                                            <Trash size={14} weight="bold" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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

      {/* Quick Rate Modal */}
      <QuickPriceModal
        isOpen={Boolean(activeVariantForPrice)}
        onClose={() => setActiveVariantForPrice(null)}
        variant={activeVariantForPrice?.variant || null}
        productName={activeVariantForPrice?.productName || ''}
      />

      {/* Add Unit Modal */}
      <AddUnitModal
        isOpen={Boolean(activeVariantForUnit)}
        onClose={() => setActiveVariantForUnit(null)}
        variant={activeVariantForUnit?.variant || null}
        productName={activeVariantForUnit?.productName || ''}
      />

      {/* Record Wastage Modal */}
      <RecordWastageModal
        isOpen={Boolean(activeVariantForWastage)}
        onClose={() => setActiveVariantForWastage(null)}
        variant={activeVariantForWastage?.variant || null}
        productName={activeVariantForWastage?.productName || ''}
      />
    </>
  );
}
