'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Eye,
} from '@phosphor-icons/react';
import { Product, ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';
import { QuickPriceModal } from './QuickPriceModal';
import { AddUnitModal } from './AddUnitModal';
import { RecordWastageModal } from './RecordWastageModal';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';
import { ActionDropdown, ActionDropdownItem } from '@/components/shared/ActionDropdown';

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
  const router = useRouter();
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
        headerClassName: 'w-10 text-center',
        cellClassName: 'text-center w-10',
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
              className={`p-1.5 rounded-md transition-all duration-150 cursor-pointer ${
                isExpanded
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isExpanded ? 'ভ্যারিয়েন্ট লুকান' : 'ভ্যারিয়েন্ট তালিকা দেখুন'}
            >
              {isExpanded ? (
                <CaretDown size={14} weight="bold" />
              ) : (
                <CaretRight size={14} weight="bold" />
              )}
            </button>
          );
        },
      },
      {
        key: 'name',
        header: 'পণ্যের নাম',
        headerClassName: 'min-w-[190px]',
        disableToggle: true,
        renderCell: (product) => (
          <div className="py-0.5">
            <Link
              href={`/products/${product.id}`}
              className="font-semibold text-slate-900 hover:text-blue-700 hover:underline text-xs sm:text-[13px] tracking-tight block"
            >
              {product.name}
            </Link>
            {product.banglaName && (
              <div className="text-slate-500 text-[11px] mt-0.5 tracking-tight font-normal">
                {product.banglaName}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'category',
        header: 'ক্যাটাগরি',
        renderCell: (product) => (
          product.category ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
              {product.category.banglaName || product.category.name}
            </span>
          ) : (
            <span className="text-slate-300 text-[11px] italic font-sans">—</span>
          )
        ),
      },
      {
        key: 'brand',
        header: 'ব্র্যান্ড',
        renderCell: (product) => (
          product.brand ? (
            <span className="text-xs font-medium text-slate-700">
              {product.brand.banglaName || product.brand.name}
            </span>
          ) : (
            <span className="text-slate-300 text-[11px] italic font-sans">—</span>
          )
        ),
      },
      {
        key: 'productType',
        header: 'ধরণ',
        headerClassName: 'text-center',
        cellClassName: 'text-center',
        renderCell: (product) => {
          const isMulti = product.hasVariants && product.variants.length > 1;
          const isExpanded = Boolean(expandedRows[product.id]);
          if (isMulti) {
            return (
              <button
                onClick={() => toggleRow(product.id)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                  isExpanded
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100/70'
                }`}
                title="ক্লিক করে ভ্যারিয়েন্ট দেখুন"
              >
                <Package size={11} weight="bold" />
                {product.variants.length}টি ভ্যারিয়েন্ট
              </button>
            );
          }
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
              একক পণ্য
            </span>
          );
        },
      },
      {
        key: 'sku',
        header: 'SKU',
        renderCell: (product) => {
          const isMulti = product.hasVariants && product.variants.length > 1;
          const primaryVariant = product.variants[0];

          if (isMulti) {
            return (
              <span className="text-slate-400 text-[11px] italic font-sans">
                ভ্যারিয়েন্টে দেখুন
              </span>
            );
          }

          return (
            <div className="font-mono text-xs font-bold text-slate-700 tabular-nums truncate max-w-[120px]">
              {primaryVariant?.sku || '—'}
            </div>
          );
        },
      },
      {
        key: 'barcode',
        header: 'বারকোড',
        renderCell: (product) => {
          const isMulti = product.hasVariants && product.variants.length > 1;
          const primaryVariant = product.variants[0];

          if (isMulti) {
            return (
              <span className="text-slate-400 text-[11px] italic font-sans">
                ভ্যারিয়েন্টে দেখুন
              </span>
            );
          }

          if (!primaryVariant?.barcode) {
            return <span className="text-slate-300 text-[11px] italic font-sans">—</span>;
          }

          return (
            <div className="font-mono text-[11px] text-slate-600 tabular-nums">
              {primaryVariant.barcode}
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
            <div className="text-right">
              <div className="font-mono font-bold text-slate-900 text-xs sm:text-[13px] tabular-nums tracking-tight">
                {product.stockQuantity}{' '}
                <span className="text-[11px] font-normal text-slate-500 font-sans">
                  {product.baseUnitName}
                </span>
              </div>
              <div className="mt-0.5">
                {isLowStock ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    <Warning size={10} weight="fill" />
                    স্টক সংকট
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    <CheckCircle size={10} weight="bold" />
                    পর্যাপ্ত
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: 'units',
        header: 'প্যাকেজিং / বাল্ক ইউনিট',
        renderCell: (product) => {
          const isMulti = product.hasVariants && product.variants.length > 1;
          const primaryVariant = product.variants[0];
          const units = primaryVariant?.units || [];

          if (isMulti) {
            return (
              <span className="text-slate-400 text-[11px] italic font-sans">
                ভ্যারিয়েন্টে দেখুন
              </span>
            );
          }

          if (units.length === 0) {
            return (
              <span className="text-slate-400 text-[11px] italic font-sans">
                মূল এককে বিক্রি ({product.baseUnitName})
              </span>
            );
          }

          return (
            <div className="flex flex-wrap gap-1 max-w-[190px]">
              {units.map((u) => (
                <span
                  key={u.id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums bg-slate-50 text-slate-700 border border-slate-200/90"
                  title={`১ ${u.unitName} = ${u.conversionFactor} ${product.baseUnitName}`}
                >
                  <Package size={10} weight="bold" />
                  <span>{u.unitName}</span>
                </span>
              ))}
            </div>
          );
        },
      },
      {
        key: 'prices',
        header: 'দর ও মূল্য',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        renderCell: (product) => {
          const isMulti = product.hasVariants && product.variants.length > 1;
          const primaryVariant = product.variants[0];

          if (isMulti) {
            const retailPrices = product.variants.map((v) => v.retailPrice).filter((p) => p > 0);
            const minPrice = Math.min(...retailPrices);
            const maxPrice = Math.max(...retailPrices);

            return (
              <div className="text-right font-mono tabular-nums">
                <div className="text-xs font-bold text-slate-900 tracking-tight">
                  {minPrice === maxPrice ? `৳${minPrice}` : `৳${minPrice} – ৳${maxPrice}`}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-sans">
                  ভ্যারিয়েন্ট রেঞ্জ
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-0.5 font-mono tabular-nums tracking-tight text-right">
              <div className="text-slate-900 font-bold text-xs">
                খুচরা: ৳{primaryVariant?.retailPrice ?? 0}
              </div>
              <div className="text-slate-600 text-[11px]">
                পাইকারি: ৳{primaryVariant?.wholesalePrice ?? 0}
              </div>
              <div className="text-slate-400 text-[10px]">
                ক্রয়: ৳{primaryVariant?.currentPurchasePrice ?? 0}
              </div>
            </div>
          );
        },
      },
      {
        key: 'actions',
        header: 'অ্যাকশন',
        headerClassName: 'text-center w-12',
        cellClassName: 'text-center w-12',
        disableToggle: true,
        renderCell: (product) => {
          const primaryVariant = product.variants[0];
          const isMulti = product.hasVariants && product.variants.length > 1;

          // Assemble dropdown items
          const items: ActionDropdownItem[] = [
            {
              label: 'প্রোফাইল ৩৬০°',
              icon: <Eye size={14} weight="bold" />,
              onClick: () => router.push(`/products/${product.id}`),
            },
            {
              label: 'এডিট',
              icon: <PencilSimple size={14} weight="bold" />,
              onClick: () => onEditProduct(product),
            },
          ];

          if (!isMulti && primaryVariant) {
            items.push(
              {
                label: 'প্রাইস আপডেট',
                icon: <Coins size={14} weight="bold" />,
                onClick: () => handleOpenPrice(primaryVariant, product.name),
              },
              {
                label: 'কার্টন ইউনিট',
                icon: <Package size={14} weight="bold" />,
                onClick: () => handleOpenUnit(primaryVariant, product.name),
              },
              {
                label: 'ওয়েস্টেজ এন্ট্রি',
                icon: <WarningCircle size={14} weight="bold" />,
                onClick: () => handleOpenWastage(primaryVariant, product.name),
              }
            );
          } else if (isMulti) {
            items.push({
              label: expandedRows[product.id] ? 'ভ্যারিয়েন্ট বন্ধ' : 'ভ্যারিয়েন্ট দেখুন',
              icon: <Package size={14} weight="bold" />,
              onClick: () => toggleRow(product.id),
            });
          }

          return <ActionDropdown items={items} title={`${product.name} অ্যাকশন`} />;
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
        onRowClick={(product) => router.push(`/products/${product.id}`)}
        isRowExpanded={(product) => Boolean(expandedRows[product.id])}
        renderExpandedRow={(product) => (
          <div className="w-full bg-slate-50/70 border-y border-slate-200/80 py-1 pl-4 pr-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/70">
                    <th className="py-2 pl-6 pr-3">ভ্যারিয়েন্ট সাইজ</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">বারকোড</th>
                    <th className="py-2 px-3 text-center">মোড</th>
                    <th className="py-2 px-3 text-right">মজুত স্টক</th>
                    <th className="py-2 px-3">কার্টন / বস্তা রূপান্তর</th>
                    <th className="py-2 px-3 text-right">দর (খুচরা / পাইকারি / ক্রয়)</th>
                    <th className="py-2 px-3 text-center w-12">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50">
                  {product.variants.map((variant) => {
                    const isLow = variant.stockQuantity <= variant.lowStockAlert;

                    // Variant action menu items
                    const variantItems: ActionDropdownItem[] = [
                      {
                        label: 'প্রাইস আপডেট',
                        icon: <Coins size={14} weight="bold" />,
                        onClick: () => handleOpenPrice(variant, product.name),
                      },
                      {
                        label: 'কার্টন ইউনিট',
                        icon: <Package size={14} weight="bold" />,
                        onClick: () => handleOpenUnit(variant, product.name),
                      },
                      {
                        label: 'ওয়েস্টেজ এন্ট্রি',
                        icon: <WarningCircle size={14} weight="bold" />,
                        onClick: () => handleOpenWastage(variant, product.name),
                      },
                    ];

                    if (product.variants.length > 1) {
                      variantItems.push({
                        label: 'ডিলিট',
                        icon: <Trash size={14} weight="bold" />,
                        danger: true,
                        disabled: deletingVariantId === variant.id,
                        onClick: () => handleDeleteVariant(variant.id, variant.variantName),
                      });
                    }

                    return (
                      <tr
                        key={variant.id}
                        className="hover:bg-indigo-50/25 transition-colors group"
                      >
                        {/* ১. সাইজের নাম উইথ ট্রি ব্রাঞ্চ */}
                        <td className="py-2.5 pl-4 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 font-mono text-sm select-none">↳</span>
                            <div>
                              <div className="font-semibold text-slate-900 text-xs sm:text-[13px]">
                                {variant.variantName}
                              </div>
                              {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ২. SKU */}
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          <span className="font-bold text-slate-700 text-xs">
                            {variant.sku}
                          </span>
                        </td>

                        {/* ৩. বারকোড */}
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          {variant.barcode ? (
                            <span className="text-[11px] text-slate-600">
                              {variant.barcode}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[10px] italic font-sans">—</span>
                          )}
                        </td>

                        {/* ৩. কন্ট্রোল / মোড */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                              variant.allowDecimalQty
                                ? 'bg-sky-50 text-sky-700 border-sky-200/70'
                                : 'bg-amber-50 text-amber-700 border-amber-200/70'
                            }`}
                          >
                            {variant.allowDecimalQty ? 'ওজনযোগ্য' : 'প্যাকেট'}
                          </span>
                        </td>

                        {/* ৪. মজুত স্টক */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                            {variant.stockQuantity}{' '}
                            <span className="text-[10px] font-normal text-slate-500 font-sans">
                              {variant.baseUnitName}
                            </span>
                          </div>
                          {isLow && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-rose-700 bg-rose-50 px-1 rounded border border-rose-200 mt-0.5">
                              সংকট
                            </span>
                          )}
                        </td>

                        {/* ৫. প্যাকেজিং / বাল্ক ইউনিট চিপস */}
                        <td className="py-2.5 px-3">
                          {variant.units && variant.units.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {variant.units.map((u) => (
                                <span
                                  key={u.id}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums bg-white text-slate-700 border border-slate-200 shadow-2xs"
                                  title={`১ ${u.unitName} = ${u.conversionFactor} ${variant.baseUnitName}`}
                                >
                                  <Package size={10} weight="bold" />
                                  <span>{u.unitName}</span>
                                  <span className="text-slate-400 font-sans">({u.conversionFactor})</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic font-sans">—</span>
                          )}
                        </td>

                        {/* ৬. দর ও মূল্য (খুচরা / পাইকারি / ক্রয়) */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          <div className="text-slate-900 font-bold text-xs">
                            খুচরা: ৳{variant.retailPrice}
                          </div>
                          <div className="text-slate-600 text-[11px]">
                            পাইকারি: ৳{variant.wholesalePrice}
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            ক্রয়: ৳{variant.currentPurchasePrice}
                          </div>
                        </td>

                        {/* ৭. থ্রি-ডট অ্যাকশন মেনু */}
                        <td className="py-2.5 px-3 text-center w-12">
                          <ActionDropdown items={variantItems} title={`${variant.variantName} অ্যাকশন`} />
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Fallback Modals */}
      {activeVariantForPrice && (
        <QuickPriceModal
          isOpen={Boolean(activeVariantForPrice)}
          onClose={() => setActiveVariantForPrice(null)}
          variant={activeVariantForPrice.variant}
          productName={activeVariantForPrice.productName}
        />
      )}

      {activeVariantForUnit && (
        <AddUnitModal
          isOpen={Boolean(activeVariantForUnit)}
          onClose={() => setActiveVariantForUnit(null)}
          variant={activeVariantForUnit.variant}
          productName={activeVariantForUnit.productName}
        />
      )}

      {activeVariantForWastage && (
        <RecordWastageModal
          isOpen={Boolean(activeVariantForWastage)}
          onClose={() => setActiveVariantForWastage(null)}
          variant={activeVariantForWastage.variant}
          productName={activeVariantForWastage.productName}
        />
      )}
    </>
  );
}
