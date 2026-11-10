'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useProductStore } from '../../useProductStore';
import { Product, CreateProductDTO, UpdateProductDTO, CreateVariantDTO } from '../../product.types';
import { ProductStickyHeader } from './ProductStickyHeader';
import { BasicInfoCard } from './BasicInfoCard';
import { TaxonomyCard } from './TaxonomyCard';
import { InventorySettingsCard } from './InventorySettingsCard';
import { PricingMarginCard } from './PricingMarginCard';
import { PackagingUnitsCard, FormUnitItem } from './PackagingUnitsCard';
import { VariantsStockMatrixCard, FormVariantItem } from './VariantsStockMatrixCard';
import { WarningCircle, Spinner } from '@phosphor-icons/react';
import { generateRandom6Digits } from '@/lib/skuGenerator';

interface ProductFormClientProps {
  productId?: string;
  initialProduct?: Product | null;
}

export function ProductFormClient({ productId, initialProduct }: ProductFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    createProduct,
    updateProduct,
    fetchProductById,
    fetchMetadata,
    categories,
    brands,
    createCategory,
    createBrand,
    isSaving,
  } = useProductStore();

  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(!initialProduct && Boolean(productId));
  const [loadedProduct, setLoadedProduct] = useState<Product | null>(initialProduct || null);

  // Form Fields
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [banglaName, setBanglaName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');

  // Single Product Form Fields
  const [baseUnitName, setBaseUnitName] = useState<string>('কেজি');
  const [allowDecimalQty, setAllowDecimalQty] = useState<boolean>(true);
  const [sku, setSku] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [currentPurchasePrice, setCurrentPurchasePrice] = useState<string>('');
  const [wholesalePrice, setWholesalePrice] = useState<string>('');
  const [retailPrice, setRetailPrice] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<string>('0');
  const [lowStockAlert, setLowStockAlert] = useState<string>('10');
  const [simpleUnits, setSimpleUnits] = useState<FormUnitItem[]>([]);

  // Variable Product Form Fields
  const [variants, setVariants] = useState<FormVariantItem[]>([]);

  // Feedback State
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Load Metadata
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Auto-assign initial 6-digit SKU on create mode (non-blocking & editable)
  useEffect(() => {
    if (!productId && !initialProduct) {
      setSku((prev) => prev || generateRandom6Digits());
    }
  }, [productId, initialProduct]);

  // Load product if editing via URL param
  useEffect(() => {
    if (productId && !initialProduct) {
      setIsLoadingProduct(true);
      fetchProductById(productId)
        .then((prod) => {
          if (prod) {
            setLoadedProduct(prod);
          } else {
            setError('পণ্যটি খুঁজে পাওয়া যায়নি');
          }
        })
        .catch((err) => setError(err.message || 'পণ্য লোড করতে ব্যর্থ হয়েছে'))
        .finally(() => setIsLoadingProduct(false));
    }
  }, [productId, initialProduct, fetchProductById]);

  // Hydrate form from product
  useEffect(() => {
    const target = loadedProduct || initialProduct;
    if (target) {
      setName(target.name);
      setBanglaName(target.banglaName || '');
      setDescription(target.description || '');
      setCategoryId(target.categoryId || '');
      setBrandId(target.brandId || '');
      setHasVariants(target.hasVariants);

      if (!target.hasVariants && target.variants.length > 0) {
        const v = target.variants[0];
        setBaseUnitName(v.baseUnitName);
        setAllowDecimalQty(v.allowDecimalQty);
        setSku(v.sku || '');
        setBarcode(v.barcode || '');
        setCurrentPurchasePrice(v.currentPurchasePrice?.toString() || '');
        setWholesalePrice(v.wholesalePrice?.toString() || '');
        setRetailPrice(v.retailPrice?.toString() || '');
        setStockQuantity(v.stockQuantity?.toString() || '0');
        setLowStockAlert(v.lowStockAlert?.toString() || '10');
        setSimpleUnits(
          (v.units || []).map((u) => ({
            id: u.id,
            unitName: u.unitName,
            conversionFactor: u.conversionFactor.toString(),
            wholesalePrice: u.wholesalePrice ? u.wholesalePrice.toString() : '',
            retailPrice: u.retailPrice ? u.retailPrice.toString() : '',
            barcode: u.barcode || '',
          }))
        );
      } else if (target.hasVariants) {
        setVariants(
          target.variants.map((v) => ({
            id: v.id,
            variantName: v.variantName,
            sku: v.sku || '',
            barcode: v.barcode || '',
            baseUnitName: v.baseUnitName || 'কেজি',
            allowDecimalQty: v.allowDecimalQty,
            currentPurchasePrice: v.currentPurchasePrice?.toString() || '',
            wholesalePrice: v.wholesalePrice?.toString() || '',
            retailPrice: v.retailPrice?.toString() || '',
            stockQuantity: v.stockQuantity?.toString() || '0',
            lowStockAlert: v.lowStockAlert?.toString() || '10',
            units: (v.units || []).map((u) => ({
              id: u.id,
              unitName: u.unitName,
              conversionFactor: u.conversionFactor.toString(),
              wholesalePrice: u.wholesalePrice ? u.wholesalePrice.toString() : '',
              retailPrice: u.retailPrice ? u.retailPrice.toString() : '',
              barcode: u.barcode || '',
            })),
          }))
        );
      }
      setIsDirty(false);
    }
  }, [loadedProduct, initialProduct]);

  const isEditMode = Boolean(loadedProduct || initialProduct);

  const handleCancel = () => {
    if (isDirty) {
      if (!confirm('আপনার করা পরিবর্তনগুলো সংরক্ষিত হবে না। আপনি কি সত্যিই পণ্য তালিকায় ফিরে যেতে চান?')) {
        return;
      }
    }
    router.push('/products');
  };

  const handleSave = async () => {
    setError(null);

    // ১. মৌলিক ভ্যালিডেশন
    if (!name.trim()) {
      setError('পণ্যের মূল নাম (English/Primary) অবশ্যই পূরণ করতে হবে');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      if (isEditMode) {
        const targetId = (loadedProduct || initialProduct)!.id;

        if (!hasVariants) {
          // সিঙ্গল প্রোডাক্ট আপডেট
          const pPrice = parseFloat(currentPurchasePrice);
          const wPrice = parseFloat(wholesalePrice);
          const rPrice = parseFloat(retailPrice);

          if (isNaN(pPrice) || pPrice <= 0 || isNaN(wPrice) || wPrice <= 0 || isNaN(rPrice) || rPrice <= 0) {
            setError('বর্তমান ক্রয়মূল্য, পাইকারি ও খুচরা বিক্রয়মূল্য অবশ্যই ০-এর বেশি হতে হবে');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }

          const existingPrimaryVariant = (loadedProduct || initialProduct)!.variants[0];

          const payload: UpdateProductDTO = {
            name: name.trim(),
            banglaName: banglaName.trim() || undefined,
            description: description.trim() || undefined,
            categoryId: categoryId || undefined,
            brandId: brandId || undefined,
            baseUnitName: baseUnitName.trim() || 'কেজি',
            allowDecimalQty,
            sku: sku.trim() || undefined,
            barcode: barcode.trim() || undefined,
            currentPurchasePrice: pPrice,
            wholesalePrice: wPrice,
            retailPrice: rPrice,
            stockQuantity: parseFloat(stockQuantity) || 0,
            lowStockAlert: parseFloat(lowStockAlert) || 10,
            units: simpleUnits
              .filter((u) => u.unitName.trim() && parseFloat(u.conversionFactor) > 0)
              .map((u) => ({
                unitName: u.unitName.trim(),
                conversionFactor: parseFloat(u.conversionFactor),
                wholesalePrice: u.wholesalePrice ? parseFloat(u.wholesalePrice) : undefined,
                retailPrice: u.retailPrice ? parseFloat(u.retailPrice) : undefined,
                barcode: u.barcode?.trim() || undefined,
              })),
            variants: existingPrimaryVariant
              ? [
                  {
                    id: existingPrimaryVariant.id,
                    variantName: existingPrimaryVariant.variantName || 'Regular',
                    sku: sku.trim() || undefined,
                    barcode: barcode.trim() || undefined,
                    baseUnitName: baseUnitName.trim() || 'কেজি',
                    allowDecimalQty,
                    currentPurchasePrice: pPrice,
                    wholesalePrice: wPrice,
                    retailPrice: rPrice,
                    stockQuantity: parseFloat(stockQuantity) || 0,
                    lowStockAlert: parseFloat(lowStockAlert) || 10,
                    units: simpleUnits
                      .filter((u) => u.unitName.trim() && parseFloat(u.conversionFactor) > 0)
                      .map((u) => ({
                        unitName: u.unitName.trim(),
                        conversionFactor: parseFloat(u.conversionFactor),
                        wholesalePrice: u.wholesalePrice ? parseFloat(u.wholesalePrice) : undefined,
                        retailPrice: u.retailPrice ? parseFloat(u.retailPrice) : undefined,
                        barcode: u.barcode?.trim() || undefined,
                      })),
                  },
                ]
              : undefined,
          };

          await updateProduct(targetId, payload);
        } else {
          // ভ্যারিয়েন্ট প্রোডাক্ট আপডেট
          if (variants.length === 0) {
            setError('অন্তত একটি ভ্যারিয়েন্ট যোগ করতে হবে');
            return;
          }

          const preparedVariants = [];
          for (const [idx, v] of variants.entries()) {
            if (!v.variantName.trim()) {
              setError(`ভ্যারিয়েন্ট #${idx + 1}-এর নাম প্রদান করুন`);
              return;
            }
            const pPrice = parseFloat(v.currentPurchasePrice);
            const wPrice = parseFloat(v.wholesalePrice);
            const rPrice = parseFloat(v.retailPrice);
            if (isNaN(pPrice) || pPrice <= 0 || isNaN(wPrice) || wPrice <= 0 || isNaN(rPrice) || rPrice <= 0) {
              setError(`ভ্যারিয়েন্ট "${v.variantName}"-এর সকল দর সঠিকভাবে পূরণ করুন`);
              return;
            }

            preparedVariants.push({
              id: v.id && !v.id.startsWith('temp-') ? v.id : undefined,
              variantName: v.variantName.trim(),
              sku: v.sku.trim() || undefined,
              barcode: v.barcode.trim() || undefined,
              baseUnitName: v.baseUnitName.trim() || 'কেজি',
              allowDecimalQty: v.allowDecimalQty,
              currentPurchasePrice: pPrice,
              wholesalePrice: wPrice,
              retailPrice: rPrice,
              stockQuantity: parseFloat(v.stockQuantity) || 0,
              lowStockAlert: parseFloat(v.lowStockAlert) || 10,
              units: (v.units || [])
                .filter((u) => u.unitName.trim() && parseFloat(u.conversionFactor) > 0)
                .map((u) => ({
                  unitName: u.unitName.trim(),
                  conversionFactor: parseFloat(u.conversionFactor),
                  wholesalePrice: u.wholesalePrice ? parseFloat(u.wholesalePrice) : undefined,
                  retailPrice: u.retailPrice ? parseFloat(u.retailPrice) : undefined,
                  barcode: u.barcode?.trim() || undefined,
                })),
            });
          }

          const payload: UpdateProductDTO = {
            name: name.trim(),
            banglaName: banglaName.trim() || undefined,
            description: description.trim() || undefined,
            categoryId: categoryId || undefined,
            brandId: brandId || undefined,
            variants: preparedVariants,
          };

          await updateProduct(targetId, payload);
        }
      } else {
        // ক্রিয়েট মোড
        if (!hasVariants) {
          // সিঙ্গল প্রোডাক্ট তৈরি
          const pPrice = parseFloat(currentPurchasePrice);
          const wPrice = parseFloat(wholesalePrice);
          const rPrice = parseFloat(retailPrice);

          if (isNaN(pPrice) || pPrice <= 0 || isNaN(wPrice) || wPrice <= 0 || isNaN(rPrice) || rPrice <= 0) {
            setError('বর্তমান ক্রয়মূল্য, পাইকারি ও খুচরা বিক্রয়মূল্য অবশ্যই ০-এর বেশি হতে হবে');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }

          const payload: CreateProductDTO = {
            name: name.trim(),
            banglaName: banglaName.trim() || undefined,
            description: description.trim() || undefined,
            categoryId: categoryId || undefined,
            brandId: brandId || undefined,
            hasVariants: false,
            baseUnitName: baseUnitName.trim() || 'কেজি',
            allowDecimalQty,
            sku: sku.trim() || undefined,
            barcode: barcode.trim() || undefined,
            currentPurchasePrice: pPrice,
            wholesalePrice: wPrice,
            retailPrice: rPrice,
            stockQuantity: parseFloat(stockQuantity) || 0,
            lowStockAlert: parseFloat(lowStockAlert) || 10,
            units: simpleUnits
              .filter((u) => u.unitName.trim() && parseFloat(u.conversionFactor) > 0)
              .map((u) => ({
                unitName: u.unitName.trim(),
                conversionFactor: parseFloat(u.conversionFactor),
                wholesalePrice: u.wholesalePrice ? parseFloat(u.wholesalePrice) : undefined,
                retailPrice: u.retailPrice ? parseFloat(u.retailPrice) : undefined,
                barcode: u.barcode?.trim() || undefined,
              })),
          };

          await createProduct(payload);
        } else {
          // ভ্যারিয়েন্ট প্রোডাক্ট তৈরি
          if (variants.length === 0) {
            setError('অন্তত একটি ভ্যারিয়েন্ট যোগ করতে হবে');
            return;
          }

          const preparedVariants: CreateVariantDTO[] = [];
          for (const [idx, v] of variants.entries()) {
            if (!v.variantName.trim()) {
              setError(`ভ্যারিয়েন্ট #${idx + 1}-এর নাম প্রদান করুন`);
              return;
            }
            const pPrice = parseFloat(v.currentPurchasePrice);
            const wPrice = parseFloat(v.wholesalePrice);
            const rPrice = parseFloat(v.retailPrice);
            if (isNaN(pPrice) || pPrice <= 0 || isNaN(wPrice) || wPrice <= 0 || isNaN(rPrice) || rPrice <= 0) {
              setError(`ভ্যারিয়েন্ট "${v.variantName}"-এর সকল দর সঠিকভাবে পূরণ করুন`);
              return;
            }

            preparedVariants.push({
              variantName: v.variantName.trim(),
              sku: v.sku.trim() || undefined,
              barcode: v.barcode.trim() || undefined,
              baseUnitName: v.baseUnitName.trim() || 'কেজি',
              allowDecimalQty: v.allowDecimalQty,
              currentPurchasePrice: pPrice,
              wholesalePrice: wPrice,
              retailPrice: rPrice,
              stockQuantity: parseFloat(v.stockQuantity) || 0,
              lowStockAlert: parseFloat(v.lowStockAlert) || 10,
              units: (v.units || [])
                .filter((u) => u.unitName.trim() && parseFloat(u.conversionFactor) > 0)
                .map((u) => ({
                  unitName: u.unitName.trim(),
                  conversionFactor: parseFloat(u.conversionFactor),
                  wholesalePrice: u.wholesalePrice ? parseFloat(u.wholesalePrice) : undefined,
                  retailPrice: u.retailPrice ? parseFloat(u.retailPrice) : undefined,
                  barcode: u.barcode?.trim() || undefined,
                })),
            });
          }

          const payload: CreateProductDTO = {
            name: name.trim(),
            banglaName: banglaName.trim() || undefined,
            description: description.trim() || undefined,
            categoryId: categoryId || undefined,
            brandId: brandId || undefined,
            hasVariants: true,
            variants: preparedVariants,
          };

          await createProduct(payload);
        }
      }

      // সফল সেভ
      startTransition(() => {
        router.push('/products');
      });
    } catch (err: any) {
      setError(err.message || 'পণ্য সংরক্ষণ করতে সমস্যা হয়েছে');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner size={32} weight="bold" className="animate-spin text-slate-700" />
          <p className="text-xs font-semibold text-slate-600">পণ্যের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 font-sans">
      {/* ১. টপ স্টিকি অ্যাকশন বার */}
      <ProductStickyHeader
        isEditMode={isEditMode}
        productName={name || loadedProduct?.name}
        isSaving={isSaving || isPending}
        hasVariants={hasVariants}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* ২. মূল ফর্ম কনটেন্ট ক্যানভাস */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* এরর ব্যানার */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-2xs animate-in fade-in duration-150">
            <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs sm:text-sm">একটি সমস্যা হয়েছে:</div>
              <div className="text-xs mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* ৩. অ্যাসিমেট্রিক ২-কলাম গ্রিড (Desktop 66% - 33%) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* বাম পাশ: মূল ক্যানভাস (৬৬% প্রস্থ) */}
          <div className="lg:col-span-2 space-y-6">
            {/* কার্ড ১: বেসিক তথ্য */}
            <BasicInfoCard
              name={name}
              setName={(v) => {
                setName(v);
                setIsDirty(true);
              }}
              banglaName={banglaName}
              setBanglaName={(v) => {
                setBanglaName(v);
                setIsDirty(true);
              }}
              description={description}
              setDescription={(v) => {
                setDescription(v);
                setIsDirty(true);
              }}
              hasVariants={hasVariants}
              setHasVariants={(v) => {
                setHasVariants(v);
                setIsDirty(true);
              }}
              isEditMode={isEditMode}
            />

            {/* যদি একক পণ্য হয়: কার্ড ২ (দর ও লাভ মার্জিন) এবং কার্ড ৩ (কার্টন রূপান্তর) */}
            {!hasVariants && (
              <>
                <PricingMarginCard
                  currentPurchasePrice={currentPurchasePrice}
                  setCurrentPurchasePrice={(v) => {
                    setCurrentPurchasePrice(v);
                    setIsDirty(true);
                  }}
                  wholesalePrice={wholesalePrice}
                  setWholesalePrice={(v) => {
                    setWholesalePrice(v);
                    setIsDirty(true);
                  }}
                  retailPrice={retailPrice}
                  setRetailPrice={(v) => {
                    setRetailPrice(v);
                    setIsDirty(true);
                  }}
                  baseUnitName={baseUnitName}
                />

                <PackagingUnitsCard
                  units={simpleUnits}
                  setUnits={(action) => {
                    setSimpleUnits(action);
                    setIsDirty(true);
                  }}
                  baseUnitName={baseUnitName}
                />
              </>
            )}
          </div>

          {/* ডান পাশ: স্টিকি সাইডবার কন্ট্রোলস (৩৩% প্রস্থ) */}
          <div className="lg:col-span-1 space-y-6">
            {/* কার্ড ৪: ক্যাটাগরি ও ব্র্যান্ড */}
            <TaxonomyCard
              categoryId={categoryId}
              setCategoryId={(v) => {
                setCategoryId(v);
                setIsDirty(true);
              }}
              brandId={brandId}
              setBrandId={(v) => {
                setBrandId(v);
                setIsDirty(true);
              }}
              categories={categories}
              brands={brands}
              onCreateCategory={createCategory}
              onCreateBrand={createBrand}
            />

            {/* যদি একক পণ্য হয়: কার্ড ৫ (ইনভেন্টরি ও বেস ইউনিট) */}
            {!hasVariants && (
              <InventorySettingsCard
                baseUnitName={baseUnitName}
                setBaseUnitName={(v) => {
                  setBaseUnitName(v);
                  setIsDirty(true);
                }}
                allowDecimalQty={allowDecimalQty}
                setAllowDecimalQty={(v) => {
                  setAllowDecimalQty(v);
                  setIsDirty(true);
                }}
                stockQuantity={stockQuantity}
                setStockQuantity={(v) => {
                  setStockQuantity(v);
                  setIsDirty(true);
                }}
                lowStockAlert={lowStockAlert}
                setLowStockAlert={(v) => {
                  setLowStockAlert(v);
                  setIsDirty(true);
                }}
                sku={sku}
                setSku={(v) => {
                  setSku(v);
                  setIsDirty(true);
                }}
                barcode={barcode}
                setBarcode={(v) => {
                  setBarcode(v);
                  setIsDirty(true);
                }}
                isEditMode={isEditMode}
              />
            )}
          </div>
        </div>

        {/* ৪. বটম ফুল-উইডথ সেকশন (১০০% অনুভূমিক স্থান) — ভ্যারিয়েন্ট ম্যাট্রিক্স */}
        {hasVariants && (
          <div className="pt-2">
            <VariantsStockMatrixCard
              variants={variants}
              setVariants={(action) => {
                setVariants(action);
                setIsDirty(true);
              }}
              defaultBaseUnit={baseUnitName}
              productName={name}
              simpleSku={sku}
            />
          </div>
        )}
      </main>
    </div>
  );
}
