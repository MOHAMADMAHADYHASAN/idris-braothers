'use client';

import React, { useState, useMemo } from 'react';
import {
  CaretDown,
  CaretRight,
  Coins,
  Package,
  WarningCircle,
  PencilSimple,
  CheckCircle,
  Warning,
  Trash,
} from '@phosphor-icons/react';
import { Product, ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';
import { QuickPriceModal } from './QuickPriceModal';
import { AddUnitModal } from './AddUnitModal';
import { RecordWastageModal } from './RecordWastageModal';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';

interface ProductListTableProps {
  products: Product[];
  isLoading: boolean;
  onEditProduct: (product: Product) => void;
  onOpenPriceModal?: (variant: ProductVariant, productName: string) => void;
  onOpenUnitModal?: (variant: ProductVariant, productName: string) => void;
  onOpenWastageModal?: (variant: ProductVariant, productName: string) => void;
}

export function ProductListTable({
  products,
  isLoading,
  onEditProduct,
  onOpenPriceModal,
  onOpenUnitModal,
  onOpenWastageModal,
}: ProductListTableProps) {
  const { deleteVariant } = useProductStore();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);

  // Modals state (fallback if not handled externally)
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

  const handleOpenPrice = (variant: ProductVariant, productName: string) => {
    if (onOpenPriceModal) {
      onOpenPriceModal(variant, productName);
    } else {
      setActiveVariantForPrice({ variant, productName });
    }
  };

  const handleOpenUnit = (variant: ProductVariant, productName: string) => {
    if (onOpenUnitModal) {
      onOpenUnitModal(variant, productName);
    } else {
      setActiveVariantForUnit({ variant, productName });
    }
  };

  const handleOpenWastage = (variant: ProductVariant, productName: string) => {
    if (onOpenWastageModal) {
      onOpenWastageModal(variant, productName);
    } else {
      setActiveVariantForWastage({ variant, productName });
    }
  };

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

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        key: 'expand',
        header: '',
        headerClassName: 'w-9 text-center',
        cellClassName: 'text-center w-9',
        disableToggle: true,
        renderCell: (product) => {
          const hasMultipleVariants = product.hasVariants && product.variants.length > 1;
          const isExpanded = Boolean(expandedRows[product.id]);
          if (!hasMultipleVariants) {
            return <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-auto" />;
          }
          return (
            <button
              onClick={() => toggleRow(product.id)}
              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isExpanded ? 'লুকান' : 'ভ্যারিয়েন্ট বিস্তারিত দেখুন'}
            >
              {isExpanded ? (
                <CaretDown size={13} weight="bold" />
              ) : (
                <CaretRight size={13} weight="bold" />
              )}
            </button>
          );
        },
      },
      {
        key: 'name',
        header: 'পণ্যের নাম ও ক্যাটাগরি',
        disableToggle: true,
        renderCell: (product) => (
          <div>
            <div className="font-semibold text-slate-900 text-xs sm:text-[13px] tracking-tight">
              {product.name}
            </div>
            {product.banglaName && (
              <div className="text-slate-500 text-[11px] mt-0.5 tracking-tight">
                {product.banglaName}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              {product.category && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                  {product.category.banglaName || product.category.name}
                </span>
              )}
              {product.brand && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200/60">
                  {product.brand.banglaName || product.brand.name}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'typeSku',
        header: 'ধরণ ও SKU',
        renderCell: (product) => {
          const primaryVariant = product.variants[0];
          if (product.hasVariants && product.variants.length > 1) {
            return (
              <div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                  <Package size={11} weight="bold" />
                  বহুমুখী ({product.variants.length} SKU)
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  ক্লিক করে সাইজ দেখুন
                </p>
              </div>
            );
          }
          return (
            <div>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                একক পণ্য
              </span>
              <div className="font-mono text-slate-500 text-[11px] mt-0.5 tabular-nums tracking-tight truncate max-w-[120px]">
                {primaryVariant?.sku || 'N/A'}
              </div>
              {primaryVariant?.barcode && (
                <div className="font-mono text-slate-400 text-[10px] tabular-nums tracking-tight">
                  ▊ {primaryVariant.barcode}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: 'stockQuantity',
        header: 'মজুত স্টক',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        renderCell: (product) => {
          const isLowStock = product.variants.some((v) => v.stockQuantity <= v.lowStockAlert);
          return (
            <div>
              <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm tabular-nums tracking-tight">
                {product.stockQuantity}{' '}
                <span className="text-[11px] font-normal text-slate-500">
                  {product.baseUnitName}
                </span>
              </div>
              {isLowStock ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mt-0.5">
                  <Warning size={10} weight="fill" />
                  স্টক সংকট
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
                  <CheckCircle size={10} weight="bold" />
                  পর্যাপ্ত
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'units',
        header: 'ইউনিট ও রূপান্তর',
        renderCell: (product) => {
          const primaryVariant = product.variants[0];
          return (
            <div>
              <div className="text-slate-800 font-medium text-xs">
                মূল: {product.baseUnitName}
              </div>
              {primaryVariant?.units && primaryVariant.units.length > 0 && (
                <div className="text-[11px] text-slate-500 mt-0.5 space-y-0.5 font-mono tabular-nums tracking-tight">
                  {primaryVariant.units.map((u) => (
                    <div key={u.id} className="truncate max-w-[150px]">
                      • ১ {u.unitName} = {u.conversionFactor} {product.baseUnitName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: 'prices',
        header: 'ক্রয় ও বিক্রয় মূল্য',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        renderCell: (product) => {
          const hasMultipleVariants = product.hasVariants && product.variants.length > 1;
          const primaryVariant = product.variants[0];
          if (product.hasVariants && hasMultipleVariants) {
            return (
              <div className="text-slate-500 text-[11px] italic">
                ভ্যারিয়েন্ট অনুযায়ী আলাদা
              </div>
            );
          }
          return (
            <div className="space-y-0.5 font-mono tabular-nums tracking-tight">
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
          );
        },
      },
      {
        key: 'actions',
        header: 'অ্যাকশন',
        headerClassName: 'text-center',
        cellClassName: 'text-center',
        disableToggle: true,
        renderCell: (product) => {
          const primaryVariant = product.variants[0];
          return (
            <div className="inline-flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-md border border-slate-200/80 shadow-2xs">
              {primaryVariant && (
                <button
                  onClick={() => handleOpenPrice(primaryVariant, product.name)}
                  className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors active:scale-[0.96] cursor-pointer"
                  title="বাজারদর ও বিক্রয়মূল্য পরিবর্তন"
                >
                  <Coins size={14} weight="bold" />
                </button>
              )}
              {primaryVariant && (
                <button
                  onClick={() => handleOpenUnit(primaryVariant, product.name)}
                  className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors active:scale-[0.96] cursor-pointer"
                  title="নতুন বস্তা বা কার্টন রূপান্তর ইউনিট যোগ করুন"
                >
                  <Package size={14} weight="bold" />
                </button>
              )}
              {primaryVariant && (
                <button
                  onClick={() => handleOpenWastage(primaryVariant, product.name)}
                  className="p-1 text-slate-600 hover:text-amber-700 hover:bg-white rounded transition-colors active:scale-[0.96] cursor-pointer"
                  title="অপচয় বা শুকিয়ে যাওয়া ঘাটতি এন্ট্রি"
                >
                  <WarningCircle size={14} weight="bold" />
                </button>
              )}
              <button
                onClick={() => onEditProduct(product)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors active:scale-[0.96] cursor-pointer"
                title="পণ্যের বিবরণ সম্পাদনা"
              >
                <PencilSimple size={14} weight="bold" />
              </button>
            </div>
          );
        },
      },
    ],
    [expandedRows, deletingVariantId, onEditProduct]
  );

  return (
    <>
      <DynamicDataTable<Product>
        tableId="products-catalog-register"
        data={products}
        columns={columns}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        isRowExpanded={(product) => Boolean(expandedRows[product.id])}
        renderExpandedRow={(product) => (
          <div className="p-3 pl-10">
            <div className="bg-white rounded-md border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-3.5 py-2 bg-slate-100/70 border-b border-slate-200/70 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                <span>
                  {product.name} - এর অন্তর্ভূক্ত ভ্যারিয়েন্ট তালিকা ({product.variants.length} টি SKU)
                </span>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase border-b border-slate-100 font-semibold tracking-wider">
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
                    <tr key={variant.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {variant.variantName}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600 tabular-nums tracking-tight">
                        <div>{variant.sku}</div>
                        {variant.barcode && (
                          <div className="text-slate-400 text-[10px]">
                            ▊ {variant.barcode}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                            variant.allowDecimalQty
                              ? 'bg-sky-50 text-sky-700 border border-sky-200/70'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                          }`}
                        >
                          {variant.allowDecimalQty ? 'ওজনযোগ্য' : 'প্যাকেট'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums tracking-tight">
                        {variant.stockQuantity}{' '}
                        <span className="text-[11px] font-normal text-slate-500">
                          {variant.baseUnitName}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600 font-mono tabular-nums tracking-tight">
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
                      <td className="py-2 px-3 text-right font-mono tabular-nums tracking-tight">
                        <div className="text-slate-900 font-semibold text-xs">
                          খুচরা: ৳{variant.retailPrice}
                        </div>
                        <div className="text-slate-600 text-[10px]">
                          পাইকারি: ৳{variant.wholesalePrice} | ক্রয়: ৳{variant.currentPurchasePrice}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="inline-flex items-center gap-0.5 bg-slate-50 p-0.5 rounded border border-slate-200/70">
                          <button
                            onClick={() => handleOpenPrice(variant, product.name)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors active:scale-[0.96] cursor-pointer"
                            title="মূল্য পরিবর্তন"
                          >
                            <Coins size={13} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleOpenUnit(variant, product.name)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors active:scale-[0.96] cursor-pointer"
                            title="কার্টন ইউনিট যোগ"
                          >
                            <Package size={13} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleOpenWastage(variant, product.name)}
                            className="p-1 text-slate-600 hover:text-amber-700 hover:bg-white rounded transition-colors active:scale-[0.96] cursor-pointer"
                            title="অপচয় বা শুকিয়ে যাওয়া ঘাটতি এন্ট্রি"
                          >
                            <WarningCircle size={13} weight="bold" />
                          </button>
                          {product.variants.length > 1 && (
                            <button
                              onClick={() => handleDeleteVariant(variant.id, variant.variantName)}
                              disabled={deletingVariantId === variant.id}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded disabled:opacity-50 transition-colors active:scale-[0.96]"
                              title="ভ্যারিয়েন্ট মুছুন / নিষ্ক্রিয় করুন"
                            >
                              <Trash size={13} weight="bold" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        emptyState={
          <div className="p-12 text-center">
            <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-500 border border-slate-200/70 flex items-center justify-center mx-auto mb-2.5">
              <Package size={22} weight="bold" />
            </div>
            <h4 className="text-xs font-semibold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
              অনুসন্ধানের সাথে কোনো পণ্য মিলেনি অথবা ক্যাটালগে এখনো পণ্য যুক্ত করা হয়নি।
            </p>
          </div>
        }
      />

      {/* Quick Rate Modal (Render fallback only if not managed externally) */}
      {!onOpenPriceModal && (
        <QuickPriceModal
          isOpen={Boolean(activeVariantForPrice)}
          onClose={() => setActiveVariantForPrice(null)}
          variant={activeVariantForPrice?.variant || null}
          productName={activeVariantForPrice?.productName || ''}
        />
      )}

      {/* Add Unit Modal */}
      {!onOpenUnitModal && (
        <AddUnitModal
          isOpen={Boolean(activeVariantForUnit)}
          onClose={() => setActiveVariantForUnit(null)}
          variant={activeVariantForUnit?.variant || null}
          productName={activeVariantForUnit?.productName || ''}
        />
      )}

      {/* Record Wastage Modal */}
      {!onOpenWastageModal && (
        <RecordWastageModal
          isOpen={Boolean(activeVariantForWastage)}
          onClose={() => setActiveVariantForWastage(null)}
          variant={activeVariantForWastage?.variant || null}
          productName={activeVariantForWastage?.productName || ''}
        />
      )}
    </>
  );
}
