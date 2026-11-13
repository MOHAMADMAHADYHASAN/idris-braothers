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
  Warning,
  Trash,
  Eye,
} from '@phosphor-icons/react';
import { Product, ProductVariant } from '../product.types';
import { useProductStore } from '../useProductStore';
import { QuickPriceModal } from './QuickPriceModal';
import { RecordWastageModal } from './RecordWastageModal';
import { DynamicDataTable, ColumnDef } from '@/components/shared/DynamicDataTable';
import { ActionDropdown, ActionDropdownItem } from '@/components/shared/ActionDropdown';
import { formatCurrency, formatNumber, formatWeight } from '@/lib/decimal';
import { confirmAction, toast } from '@/lib/feedback';

interface ProductListTableProps {
  products: Product[];
  isLoading: boolean;
  onEditProduct: (product: Product) => void;
  onOpenPriceModal?: (variant: ProductVariant, productName: string) => void;
  onOpenWastageModal?: (variant: ProductVariant, productName: string) => void;
}

export function ProductListTable({
  products,
  isLoading,
  onEditProduct,
  onOpenPriceModal,
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
    const ok = await confirmAction({
      title: 'ভ্যারিয়েন্ট মুছে ফেলুন',
      message: `আপনি কি নিশ্চিত যে "${variantName}" ভ্যারিয়েন্টটি মুছতে চান?`,
      confirmLabel: 'হ্যাঁ, মুছুন',
    });
    if (!ok) {
      return;
    }
    setDeletingVariantId(variantId);
    try {
      const res = await deleteVariant(variantId);
      if (res?.deactivated) {
        toast.info(
          `ঐতিহাসিক বিক্রয় বা পারচেজ রেকর্ড থাকার কারণে "${variantName}" ভ্যারিয়েন্টটি স্থায়ীভাবে মুছে না ফেলে নিষ্ক্রিয় (Deactivated) করা হয়েছে।`
        );
      } else {
        toast.success(`"${variantName}" ভ্যারিয়েন্টটি মুছে ফেলা হয়েছে।`);
      }
    } catch (err: any) {
      toast.error(err.message || 'ভ্যারিয়েন্ট মুছতে সমস্যা হয়েছে');
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
            return null;
          }
          return (
            <button
              type="button"
              onClick={() => toggleRow(product.id)}
              className={`p-1 rounded-md transition-all duration-150 cursor-pointer ${
                isExpanded
                  ? 'bg-brand-deep text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-brand-deep hover:bg-brand-soft'
              }`}
              title={isExpanded ? 'ভ্যারিয়েন্ট লুকান' : 'ভ্যারিয়েন্ট তালিকা দেখুন'}
              aria-label={isExpanded ? `${product.name} ভ্যারিয়েন্ট লুকান` : `${product.name} ভ্যারিয়েন্ট দেখুন`}
              aria-expanded={isExpanded}
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
        renderCell: (product) => {
          const hasMultipleVariants = product.hasVariants && product.variants.length > 1;
          return (
            <div className="py-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/products/${product.id}`}
                  className="font-semibold text-ink-primary hover:text-brand-deep hover:underline text-xs sm:text-sm"
                >
                  {product.name}
                </Link>
                {hasMultipleVariants && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(product.id);
                    }}
                    className="inline-flex items-center gap-1 text-2xs font-semibold px-1.5 py-0.5 rounded bg-brand-soft text-brand-deep border border-brand-light hover:bg-brand-light/60 transition-colors cursor-pointer"
                    title="ভ্যারিয়েন্ট টগল করুন"
                  >
                    <Package size={11} weight="bold" />
                    {formatNumber(product.variants.length)}টি ভ্যারিয়েন্ট
                  </button>
                )}
              </div>
              {product.banglaName && (
                <div className="text-ink-secondary text-xs mt-0.5 font-normal">
                  {product.banglaName}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: 'category',
        header: 'ক্যাটাগরি',
        renderCell: (product) => (
          product.category ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-surface-subtle text-ink-body border border-border-default">
              {product.category.banglaName || product.category.name}
            </span>
          ) : (
            <span className="text-ink-secondary text-xs font-sans">—</span>
          )
        ),
      },
      {
        key: 'brand',
        header: 'ব্র্যান্ড',
        renderCell: (product) => (
          product.brand ? (
            <span className="text-xs font-medium text-ink-body">
              {product.brand.banglaName || product.brand.name}
            </span>
          ) : (
            <span className="text-ink-secondary text-xs font-sans">—</span>
          )
        ),
      },
      {
        key: 'sku',
        header: 'SKU',
        renderCell: (product) => {
          const isMulti = product.hasVariants && product.variants.length > 1;
          const primaryVariant = product.variants[0];

          if (isMulti) {
            return (
              <span className="text-ink-secondary text-xs font-sans">—</span>
            );
          }

          return (
            <div className="font-mono text-xs font-bold text-ink-body tabular-nums truncate max-w-[120px]">
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
              <span className="text-ink-secondary text-xs font-sans">—</span>
            );
          }

          if (!primaryVariant?.barcode) {
            return <span className="text-ink-secondary text-xs font-sans">—</span>;
          }

          return (
            <div className="font-mono text-xs text-ink-secondary tabular-nums">
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
              <div className="font-mono font-bold text-ink-primary text-xs sm:text-sm tabular-nums">
                {formatWeight(product.stockQuantity, product.baseUnitName)}
              </div>
              {isLowStock && (
                <div className="mt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-due-text bg-due-bg px-1.5 py-0.5 rounded border border-due-border">
                    <Warning size={11} weight="fill" />
                    স্টক সংকট
                  </span>
                </div>
              )}
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
                <div className="text-xs font-bold text-ink-primary">
                  {minPrice === maxPrice
                    ? formatCurrency(minPrice, false)
                    : `${formatCurrency(minPrice, false)} – ${formatCurrency(maxPrice, false)}`}
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-0.5 font-mono tabular-nums text-right text-xs">
              <div className="text-ink-primary font-bold">
                খুচরা: {formatCurrency(primaryVariant?.retailPrice ?? 0, false)}
              </div>
              <div className="text-wholesale-text font-semibold">
                পাইকারি: {formatCurrency(primaryVariant?.wholesalePrice ?? 0, false)}
              </div>
              <div className="text-ink-secondary">
                ক্রয়: {formatCurrency(primaryVariant?.currentPurchasePrice ?? 0, false)}
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
          <div className="w-full bg-surface-subtle/60 border-y border-border-default py-1.5 pl-4 pr-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-xs font-bold text-ink-secondary border-b border-border-default">
                    <th className="py-2 pl-8 pr-3">ভ্যারিয়েন্ট</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">বারকোড</th>
                    <th className="py-2 px-3 text-right">মজুত স্টক</th>
                    <th className="py-2 px-3 text-right">দরসমূহ</th>
                    <th className="py-2 px-3 text-center w-12">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {product.variants.map((variant) => {
                    const isLow = variant.stockQuantity <= variant.lowStockAlert;

                    const variantItems: ActionDropdownItem[] = [
                      {
                        label: 'প্রাইস আপডেট',
                        icon: <Coins size={14} weight="bold" />,
                        onClick: () => handleOpenPrice(variant, product.name),
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
                        className="hover:bg-brand-soft/40 transition-colors group"
                      >
                        <td className="py-2 pl-8 pr-3">
                          <div>
                            <div className="font-semibold text-ink-primary text-xs sm:text-sm">
                              {variant.variantName}
                            </div>
                            {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                              <div className="text-xs text-ink-secondary mt-0.5">
                                {Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-2 px-3 font-mono tabular-nums">
                          <span className="font-bold text-ink-body text-xs">
                            {variant.sku}
                          </span>
                        </td>

                        <td className="py-2 px-3 font-mono tabular-nums">
                          {variant.barcode ? (
                            <span className="text-xs text-ink-secondary">
                              {variant.barcode}
                            </span>
                          ) : (
                            <span className="text-ink-secondary text-xs font-sans">—</span>
                          )}
                        </td>

                        <td className="py-2 px-3 text-right font-mono tabular-nums">
                          <div className="font-bold text-ink-primary text-xs sm:text-sm">
                            {formatWeight(variant.stockQuantity, variant.baseUnitName)}
                          </div>
                          {isLow && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-due-text bg-due-bg px-1.5 py-0.5 rounded border border-due-border mt-0.5">
                              সংকট
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3 text-right font-mono tabular-nums text-xs">
                          <div className="text-ink-primary font-bold">
                            খুচরা: {formatCurrency(variant.retailPrice, false)}
                          </div>
                          <div className="text-wholesale-text font-semibold">
                            পাইকারি: {formatCurrency(variant.wholesalePrice, false)}
                          </div>
                          <div className="text-ink-secondary">
                            ক্রয়: {formatCurrency(variant.currentPurchasePrice, false)}
                          </div>
                        </td>

                        <td className="py-2 px-3 text-center w-12">
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
            <Package size={28} weight="bold" className="mx-auto mb-2 text-ink-muted" />
            <h4 className="text-sm font-semibold text-ink-primary">কোনো পণ্য পাওয়া যায়নি</h4>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto mt-1">
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
