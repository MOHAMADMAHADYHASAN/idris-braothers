'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash, Package, Sparkle, Tag, Info, Check } from '@phosphor-icons/react';
import { Product, CreateProductDTO, CreateVariantDTO } from '../product.types';
import { useProductStore } from '../useProductStore';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product | null;
}

interface TempVariant {
  id: string;
  variantName: string;
  sku: string;
  barcode: string;
  baseUnitName: string;
  allowDecimalQty: boolean;
  currentPurchasePrice: string;
  retailPrice: string;
  wholesalePrice: string;
  stockQuantity: string;
  lowStockAlert: string;
  units: Array<{
    unitName: string;
    conversionFactor: string;
    retailPrice: string;
    wholesalePrice: string;
    barcode: string;
  }>;
}

function calculateMargin(costStr: string, sellStr: string, label: string) {
  const cost = parseFloat(costStr);
  const sell = parseFloat(sellStr);
  if (isNaN(cost) || isNaN(sell) || cost <= 0 || sell <= 0) return null;

  const profit = sell - cost;
  const marginPct = (profit / sell) * 100;
  const isLoss = profit < 0;

  return (
    <div
      className={`text-[11px] font-medium px-2 py-0.5 rounded-md mt-1 inline-flex items-center gap-1.5 border transition-colors ${
        isLoss
          ? 'bg-rose-50 text-rose-700 border-rose-200/70'
          : profit === 0
          ? 'bg-amber-50 text-amber-700 border-amber-200/70'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200/70'
      }`}
    >
      <span className="text-slate-500">{label}:</span>
      <span className="font-semibold font-mono tabular-nums tracking-tight">
        {profit >= 0 ? '+' : ''}৳{profit.toFixed(2)}
      </span>
      <span className="text-[10px] font-mono tabular-nums tracking-tight opacity-80">({marginPct.toFixed(1)}%)</span>
    </div>
  );
}

export function AddProductModal({ isOpen, onClose, initialProduct }: AddProductModalProps) {
  const {
    createProduct,
    updateProduct,
    createCategory,
    createBrand,
    categories,
    brands,
    units: unitMasterList,
    isSaving,
  } = useProductStore();

  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [banglaName, setBanglaName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');

  // Inline Fast-Create Category & Brand states
  const [showCategoryPopup, setShowCategoryPopup] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatBangla, setNewCatBangla] = useState<string>('');
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);

  const [showBrandPopup, setShowBrandPopup] = useState<boolean>(false);
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [newBrandBangla, setNewBrandBangla] = useState<string>('');
  const [isCreatingBrand, setIsCreatingBrand] = useState<boolean>(false);

  // Simple Product Form Fields
  const [baseUnitName, setBaseUnitName] = useState<string>('কেজি');
  const [allowDecimalQty, setAllowDecimalQty] = useState<boolean>(true);
  const [sku, setSku] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [currentPurchasePrice, setCurrentPurchasePrice] = useState<string>('');
  const [retailPrice, setRetailPrice] = useState<string>('');
  const [wholesalePrice, setWholesalePrice] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<string>('0');
  const [lowStockAlert, setLowStockAlert] = useState<string>('10');
  const [simpleUnits, setSimpleUnits] = useState<
    Array<{
      unitName: string;
      conversionFactor: string;
      retailPrice: string;
      wholesalePrice: string;
    }>
  >([]);

  // Variable Product Form Fields
  const [variants, setVariants] = useState<TempVariant[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setBanglaName(initialProduct.banglaName || '');
      setDescription(initialProduct.description || '');
      setCategoryId(initialProduct.categoryId || '');
      setBrandId(initialProduct.brandId || '');
      setHasVariants(initialProduct.hasVariants);

      if (!initialProduct.hasVariants && initialProduct.variants.length > 0) {
        const v = initialProduct.variants[0];
        setBaseUnitName(v.baseUnitName);
        setAllowDecimalQty(v.allowDecimalQty);
        setSku(v.sku || '');
        setBarcode(v.barcode || '');
        setCurrentPurchasePrice(v.currentPurchasePrice.toString());
        setRetailPrice(v.retailPrice.toString());
        setWholesalePrice(v.wholesalePrice.toString());
        setStockQuantity(v.stockQuantity.toString());
        setLowStockAlert(v.lowStockAlert.toString());
        setSimpleUnits(
          (v.units || []).map((u) => ({
            unitName: u.unitName,
            conversionFactor: u.conversionFactor.toString(),
            retailPrice: u.retailPrice ? u.retailPrice.toString() : '',
            wholesalePrice: u.wholesalePrice ? u.wholesalePrice.toString() : '',
          }))
        );
      } else if (initialProduct.hasVariants) {
        setVariants(
          initialProduct.variants.map((v) => ({
            id: v.id,
            variantName: v.variantName,
            sku: v.sku,
            barcode: v.barcode || '',
            baseUnitName: v.baseUnitName,
            allowDecimalQty: v.allowDecimalQty,
            currentPurchasePrice: v.currentPurchasePrice.toString(),
            retailPrice: v.retailPrice.toString(),
            wholesalePrice: v.wholesalePrice.toString(),
            stockQuantity: v.stockQuantity.toString(),
            lowStockAlert: v.lowStockAlert.toString(),
            units: (v.units || []).map((u) => ({
              unitName: u.unitName,
              conversionFactor: u.conversionFactor.toString(),
              retailPrice: u.retailPrice ? u.retailPrice.toString() : '',
              wholesalePrice: u.wholesalePrice ? u.wholesalePrice.toString() : '',
              barcode: u.barcode || '',
            })),
          }))
        );
      }
    } else {
      resetForm();
    }
  }, [initialProduct, isOpen]);

  const resetForm = () => {
    setName('');
    setBanglaName('');
    setDescription('');
    setCategoryId('');
    setBrandId('');
    setHasVariants(false);
    setBaseUnitName('কেজি');
    setAllowDecimalQty(true);
    setSku('');
    setBarcode('');
    setCurrentPurchasePrice('');
    setRetailPrice('');
    setWholesalePrice('');
    setStockQuantity('0');
    setLowStockAlert('10');
    setSimpleUnits([]);
    setVariants([
      {
        id: 'temp-1',
        variantName: '৫০০ গ্রাম প্যাকেট',
        sku: '',
        barcode: '',
        baseUnitName: 'প্যাকেট',
        allowDecimalQty: false,
        currentPurchasePrice: '',
        retailPrice: '',
        wholesalePrice: '',
        stockQuantity: '0',
        lowStockAlert: '10',
        units: [],
      },
      {
        id: 'temp-2',
        variantName: '১ কেজি প্যাকেট',
        sku: '',
        barcode: '',
        baseUnitName: 'প্যাকেট',
        allowDecimalQty: false,
        currentPurchasePrice: '',
        retailPrice: '',
        wholesalePrice: '',
        stockQuantity: '0',
        lowStockAlert: '10',
        units: [],
      },
    ]);
    setError(null);
  };

  if (!isOpen) return null;

  // Inline Category Creator
  const handleCreateCategoryInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsCreatingCategory(true);
    try {
      const created = await createCategory({
        name: newCatName.trim(),
        banglaName: newCatBangla.trim() || undefined,
      });
      setCategoryId(created.id);
      setNewCatName('');
      setNewCatBangla('');
      setShowCategoryPopup(false);
    } catch (err: any) {
      alert(err.message || 'নতুন ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Inline Brand Creator
  const handleCreateBrandInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setIsCreatingBrand(true);
    try {
      const created = await createBrand({
        name: newBrandName.trim(),
        banglaName: newBrandBangla.trim() || undefined,
      });
      setBrandId(created.id);
      setNewBrandName('');
      setNewBrandBangla('');
      setShowBrandPopup(false);
    } catch (err: any) {
      alert(err.message || 'নতুন ব্র্যান্ড তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setIsCreatingBrand(false);
    }
  };

  // Quick Size Presets for Variable Products
  const handleApplyPreset = (preset: 'packets' | 'oil' | 'grains') => {
    if (preset === 'packets') {
      setVariants([
        {
          id: `temp-${Date.now()}-1`,
          variantName: '৫০০ গ্রাম প্যাকেট',
          sku: '',
          barcode: '',
          baseUnitName: 'প্যাকেট',
          allowDecimalQty: false,
          currentPurchasePrice: '',
          retailPrice: '',
          wholesalePrice: '',
          stockQuantity: '0',
          lowStockAlert: '12',
          units: [
            {
              unitName: '২৪ প্যাকেট কার্টন',
              conversionFactor: '24',
              retailPrice: '',
              wholesalePrice: '',
              barcode: '',
            },
          ],
        },
        {
          id: `temp-${Date.now()}-2`,
          variantName: '১ কেজি প্যাকেট',
          sku: '',
          barcode: '',
          baseUnitName: 'প্যাকেট',
          allowDecimalQty: false,
          currentPurchasePrice: '',
          retailPrice: '',
          wholesalePrice: '',
          stockQuantity: '0',
          lowStockAlert: '12',
          units: [
            {
              unitName: '১২ প্যাকেট কার্টন',
              conversionFactor: '12',
              retailPrice: '',
              wholesalePrice: '',
              barcode: '',
            },
          ],
        },
      ]);
    } else if (preset === 'oil') {
      setVariants([
        {
          id: `temp-${Date.now()}-1`,
          variantName: '১ লিটার বোতল',
          sku: '',
          barcode: '',
          baseUnitName: 'বোতল',
          allowDecimalQty: false,
          currentPurchasePrice: '',
          retailPrice: '',
          wholesalePrice: '',
          stockQuantity: '0',
          lowStockAlert: '12',
          units: [
            {
              unitName: '১২ বোতল কার্টন',
              conversionFactor: '12',
              retailPrice: '',
              wholesalePrice: '',
              barcode: '',
            },
          ],
        },
        {
          id: `temp-${Date.now()}-2`,
          variantName: '৫ লিটার ক্যান',
          sku: '',
          barcode: '',
          baseUnitName: 'ক্যান',
          allowDecimalQty: false,
          currentPurchasePrice: '',
          retailPrice: '',
          wholesalePrice: '',
          stockQuantity: '0',
          lowStockAlert: '6',
          units: [
            {
              unitName: '৪ ক্যান কার্টন',
              conversionFactor: '4',
              retailPrice: '',
              wholesalePrice: '',
              barcode: '',
            },
          ],
        },
      ]);
    } else if (preset === 'grains') {
      setVariants([
        {
          id: `temp-${Date.now()}-1`,
          variantName: 'খোলা / কেজি',
          sku: '',
          barcode: '',
          baseUnitName: 'কেজি',
          allowDecimalQty: true,
          currentPurchasePrice: '',
          retailPrice: '',
          wholesalePrice: '',
          stockQuantity: '0',
          lowStockAlert: '50',
          units: [
            {
              unitName: '২৫ কেজি বস্তা',
              conversionFactor: '25',
              retailPrice: '',
              wholesalePrice: '',
              barcode: '',
            },
            {
              unitName: '৫০ কেজি বস্তা',
              conversionFactor: '50',
              retailPrice: '',
              wholesalePrice: '',
              barcode: '',
            },
          ],
        },
      ]);
    }
  };

  const handleAddSimpleUnit = () => {
    setSimpleUnits([
      ...simpleUnits,
      { unitName: '', conversionFactor: '', retailPrice: '', wholesalePrice: '' },
    ]);
  };

  const handleRemoveSimpleUnit = (index: number) => {
    setSimpleUnits(simpleUnits.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: `temp-${Date.now()}`,
        variantName: '',
        sku: '',
        barcode: '',
        baseUnitName: 'কেজি',
        allowDecimalQty: true,
        currentPurchasePrice: '',
        retailPrice: '',
        wholesalePrice: '',
        stockQuantity: '0',
        lowStockAlert: '10',
        units: [],
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      setError('অন্তত একটি ভ্যারিয়েন্ট থাকা আবশ্যক');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('পণ্যের নাম লিখুন');
      return;
    }

    try {
      if (initialProduct) {
        // Edit Mode
        await updateProduct(initialProduct.id, {
          name: name.trim(),
          banglaName: banglaName.trim() || undefined,
          description: description.trim() || undefined,
          categoryId: categoryId || undefined,
          brandId: brandId || undefined,
        });
        onClose();
        return;
      }

      // Create Mode
      if (!hasVariants) {
        // 1. Simple Product
        const pPrice = parseFloat(currentPurchasePrice);
        const rPrice = parseFloat(retailPrice);
        const wPrice = parseFloat(wholesalePrice);

        if (isNaN(pPrice) || pPrice <= 0 || isNaN(rPrice) || rPrice <= 0 || isNaN(wPrice) || wPrice <= 0) {
          setError('বর্তমান ক্রয়মূল্য, খুচরা ও পাইকারি বিক্রয়মূল্য অবশ্যই ০ এর বেশি হতে হবে');
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
          retailPrice: rPrice,
          wholesalePrice: wPrice,
          stockQuantity: parseFloat(stockQuantity) || 0,
          lowStockAlert: parseFloat(lowStockAlert) || 10,
          units: simpleUnits
            .filter((u) => u.unitName.trim() && parseFloat(u.conversionFactor) > 0)
            .map((u) => ({
              unitName: u.unitName.trim(),
              conversionFactor: parseFloat(u.conversionFactor),
              retailPrice: u.retailPrice ? parseFloat(u.retailPrice) : undefined,
              wholesalePrice: u.wholesalePrice ? parseFloat(u.wholesalePrice) : undefined,
            })),
        };

        await createProduct(payload);
      } else {
        // 2. Variable Product
        if (variants.length === 0) {
          setError('অন্তত একটি ভ্যারিয়েন্ট যোগ করুন');
          return;
        }

        const preparedVariants: CreateVariantDTO[] = [];
        for (const [idx, v] of variants.entries()) {
          if (!v.variantName.trim()) {
            setError(`ভ্যারিয়েন্ট #${idx + 1}-এর নাম লিখুন`);
            return;
          }
          const pPrice = parseFloat(v.currentPurchasePrice);
          const rPrice = parseFloat(v.retailPrice);
          const wPrice = parseFloat(v.wholesalePrice);
          if (isNaN(pPrice) || pPrice <= 0 || isNaN(rPrice) || rPrice <= 0 || isNaN(wPrice) || wPrice <= 0) {
            setError(`ভ্যারিয়েন্ট "${v.variantName}"-এর মূল্যসমূহ সঠিকভাবে পূরণ করুন`);
            return;
          }

          preparedVariants.push({
            variantName: v.variantName.trim(),
            sku: v.sku.trim() || undefined,
            barcode: v.barcode.trim() || undefined,
            baseUnitName: v.baseUnitName.trim() || 'কেজি',
            allowDecimalQty: v.allowDecimalQty,
            currentPurchasePrice: pPrice,
            retailPrice: rPrice,
            wholesalePrice: wPrice,
            stockQuantity: parseFloat(v.stockQuantity) || 0,
            lowStockAlert: parseFloat(v.lowStockAlert) || 10,
            units: v.units
              .filter((u) => u.unitName.trim() && parseFloat(u.conversionFactor) > 0)
              .map((u) => ({
                unitName: u.unitName.trim(),
                conversionFactor: parseFloat(u.conversionFactor),
                retailPrice: u.retailPrice ? parseFloat(u.retailPrice) : undefined,
                wholesalePrice: u.wholesalePrice ? parseFloat(u.wholesalePrice) : undefined,
                barcode: u.barcode.trim() || undefined,
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

      onClose();
    } catch (err: any) {
      setError(err.message || 'পণ্য সংরক্ষণ করতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
        className="bg-white rounded-lg shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] border border-slate-200/90 max-w-3xl w-full my-8 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <Package size={18} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                {initialProduct ? 'পণ্য সম্পাদনা (Edit Product)' : 'নতুন পণ্য যোগ করুন (Add Product)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                খুচরা ও পাইকারি বিক্রয় এবং স্টক ট্র্যাক করার জন্য পণ্য তালিকাভুক্ত করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-[background-color,color] duration-150"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-md">
              {error}
            </div>
          )}

          {/* Section 1: Common / Parent Info */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  পণ্যের মূল নাম (Product Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. শুকনা মরিচ বা ডানো দুধ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  বাংলা নাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="e.g. পঞ্চগড়ের বোম্বাই শুকনা মরিচ"
                  value={banglaName}
                  onChange={(e) => setBanglaName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                />
              </div>
            </div>

            {/* Category & Brand with Inline Fast-Create */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">
                    ক্যাটাগরি (Category)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryPopup(!showCategoryPopup)}
                    className="text-[11px] font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-0.5 hover:underline"
                  >
                    <Plus size={11} weight="bold" />
                    নতুন
                  </button>
                </div>

                {showCategoryPopup && (
                  <div className="mb-2 p-2.5 bg-slate-50 rounded-md border border-slate-200 space-y-2 animate-in fade-in duration-100">
                    <div className="text-[11px] font-semibold text-slate-800">নতুন ক্যাটাগরি তৈরি করুন:</div>
                    <input
                      type="text"
                      placeholder="ক্যাটাগরি নাম (e.g. Spices)"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="বাংলা নাম (e.g. মসলাপাতি)"
                      value={newCatBangla}
                      onChange={(e) => setNewCatBangla(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-slate-900"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCategoryPopup(false)}
                        className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateCategoryInline}
                        disabled={isCreatingCategory || !newCatName.trim()}
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        {isCreatingCategory ? 'তৈরি হচ্ছে...' : 'সংরক্ষণ'}
                      </button>
                    </div>
                  </div>
                )}

                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                >
                  <option value="">-- ক্যাটাগরি নির্বাচন করুন --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.banglaName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">
                    ব্র্যান্ড (Brand)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBrandPopup(!showBrandPopup)}
                    className="text-[11px] font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-0.5 hover:underline"
                  >
                    <Plus size={11} weight="bold" />
                    নতুন
                  </button>
                </div>

                {showBrandPopup && (
                  <div className="mb-2 p-2.5 bg-slate-50 rounded-md border border-slate-200 space-y-2 animate-in fade-in duration-100">
                    <div className="text-[11px] font-semibold text-slate-800">নতুন ব্র্যান্ড তৈরি করুন:</div>
                    <input
                      type="text"
                      placeholder="ব্র্যান্ড নাম (e.g. Radhuni)"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="বাংলা নাম (e.g. রাঁধুনী)"
                      value={newBrandBangla}
                      onChange={(e) => setNewBrandBangla(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-slate-900"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowBrandPopup(false)}
                        className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateBrandInline}
                        disabled={isCreatingBrand || !newBrandName.trim()}
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        {isCreatingBrand ? 'তৈরি হচ্ছে...' : 'সংরক্ষণ'}
                      </button>
                    </div>
                  </div>
                )}

                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                >
                  <option value="">-- সাধারণ / খোলা পণ্য (কোনো ব্র্যান্ড নেই) --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.banglaName || b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Simple vs Variable Segmented Control */}
          {!initialProduct && (
            <div className="p-3 rounded-md border border-slate-200/90 bg-slate-50/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Sparkle size={14} className="text-slate-600" />
                  পণ্যটিতে কি একাধিক সাইজ বা ভ্যারিয়েন্ট আছে?
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  চাল, চিনি বা তেলের মতো একক পণ্যে সাধারণ রাখুন। গুঁড়া দুধ (৫০০ গ্রাম, ১ কেজি) হলে ভ্যারিয়েন্ট নির্বাচন করুন।
                </p>
              </div>
              <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => setHasVariants(false)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-[background-color,color] duration-150 ${
                    !hasVariants
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সাধারণ পণ্য
                </button>
                <button
                  type="button"
                  onClick={() => setHasVariants(true)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-[background-color,color] duration-150 ${
                    hasVariants
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  মাল্টি-ভ্যারিয়েন্ট
                </button>
              </div>
            </div>
          )}

          {/* MODE 1: SIMPLE PRODUCT FORM */}
          {!hasVariants && (
            <div className="space-y-3.5 pt-1">
              {/* Unit & Decimal Control */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/60 rounded-md border border-slate-200/80">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    মূল একক (Base Unit) *
                  </label>
                  <select
                    value={baseUnitName}
                    onChange={(e) => setBaseUnitName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                  >
                    {unitMasterList.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} {u.banglaName ? `(${u.banglaName})` : ''}
                      </option>
                    ))}
                    {!unitMasterList.some((u) => u.name === baseUnitName) && (
                      <option value={baseUnitName}>{baseUnitName}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ওজন / ভগ্নাংশ কন্ট্রোল (Decimal Control)
                  </label>
                  <select
                    value={allowDecimalQty ? 'true' : 'false'}
                    onChange={(e) => setAllowDecimalQty(e.target.value === 'true')}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                  >
                    <option value="true">খোলা / ওজনযোগ্য (০.২৫০ কেজি বা ২০ টাকার বিক্রি সম্ভব)</option>
                    <option value="false">সিল করা প্যাকেট / বোতল (শুধুমাত্র ১, ২ ইত্যাদি পূর্ণসংখ্যা)</option>
                  </select>
                </div>
              </div>

              {/* Pricing Grid with Live Margins */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    বর্তমান ক্রয়মূল্য (বাজারদর) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-semibold">৳</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 320"
                      value={currentPurchasePrice}
                      onChange={(e) => setCurrentPurchasePrice(e.target.value)}
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight font-semibold text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    খুচরা বিক্রয়মূল্য (Retail) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-semibold">৳</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 360"
                      value={retailPrice}
                      onChange={(e) => setRetailPrice(e.target.value)}
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight font-semibold text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                    />
                  </div>
                  {calculateMargin(currentPurchasePrice, retailPrice, 'খুচরা লাভ')}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    পাইকারি বিক্রয়মূল্য (Wholesale) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-semibold">৳</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 335"
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(e.target.value)}
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight font-semibold text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                    />
                  </div>
                  {calculateMargin(currentPurchasePrice, wholesalePrice, 'পাইকারি লাভ')}
                </div>
              </div>

              {/* Stock & Alerts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    প্রারম্ভিক স্টক ({baseUnitName})
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    সংকট সতর্কতা স্টক
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    বারকোড (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="স্ক্যান বা কোড"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SKU (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="খালি রাখলে অটো"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums tracking-tight uppercase text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow]"
                  />
                </div>
              </div>

              {/* Simple Product Carton / Sack Units */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800">
                    পাইকারি ইউনিট রূপান্তর (যেমন: ৫০ কেজি বস্তা বা কার্টন)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSimpleUnit}
                    className="text-xs text-slate-700 hover:text-slate-900 font-medium inline-flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} weight="bold" />
                    ইউনিট যোগ করুন
                  </button>
                </div>

                {simpleUnits.map((u, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-2 p-2 bg-slate-50/60 rounded-md border border-slate-200/70 items-center"
                  >
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="ইউনিটের নাম (e.g. ৫০ কেজি বস্তা)"
                        value={u.unitName}
                        onChange={(e) => {
                          const updated = [...simpleUnits];
                          updated[i].unitName = e.target.value;
                          setSimpleUnits(updated);
                        }}
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder={`কত ${baseUnitName}?`}
                        value={u.conversionFactor}
                        onChange={(e) => {
                          const updated = [...simpleUnits];
                          updated[i].conversionFactor = e.target.value;
                          setSimpleUnits(updated);
                        }}
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white font-mono tabular-nums tracking-tight"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="খুচরা দর (ঐচ্ছিক)"
                        value={u.retailPrice}
                        onChange={(e) => {
                          const updated = [...simpleUnits];
                          updated[i].retailPrice = e.target.value;
                          setSimpleUnits(updated);
                        }}
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white font-mono tabular-nums tracking-tight"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        placeholder="পাইকারি দর"
                        value={u.wholesalePrice}
                        onChange={(e) => {
                          const updated = [...simpleUnits];
                          updated[i].wholesalePrice = e.target.value;
                          setSimpleUnits(updated);
                        }}
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white font-mono tabular-nums tracking-tight mr-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSimpleUnit(i)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-[background-color,color] duration-150 active:scale-[0.96]"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: VARIABLE PRODUCT (MULTI-VARIANTS BUILDER) */}
          {hasVariants && (
            <div className="space-y-3.5 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">পণ্যের ভ্যারিয়েন্ট তালিকা (SKU List)</h4>
                  <p className="text-[11px] text-slate-500">
                    প্রতিটি সাইজের জন্য স্বাধীন স্টক, বারকোড এবং ক্রয়/বিক্রয় মূল্য নির্ধারণ করুন
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-[background-color] duration-150 active:scale-[0.98] self-start sm:self-auto"
                >
                  <Plus size={13} weight="bold" />
                  নতুন ভ্যারিয়েন্ট যোগ করুন
                </button>
              </div>

              {/* Quick Grocery Presets */}
              <div className="p-2.5 bg-slate-50/70 rounded-md border border-slate-200/80 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600">দ্রুত সাইজ ফরম্যাট:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('packets')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-[background-color,border-color,transform] duration-150 active:scale-[0.97]"
                >
                  + গুঁড়া দুধ (৫০০ গ্রাম ও ১ কেজি)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('oil')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-[background-color,border-color,transform] duration-150 active:scale-[0.97]"
                >
                  + সয়াবিন তেল (১ লিটার ও ৫ লিটার)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('grains')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-[background-color,border-color,transform] duration-150 active:scale-[0.97]"
                >
                  + চাল/ডাল (কেজি + বস্তা রূপান্তর)
                </button>
              </div>

              <div className="space-y-2.5">
                {variants.map((v, i) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-md border border-slate-200/90 bg-slate-50/50 space-y-2.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Tag size={13} className="text-slate-500" />
                        ভ্যারিয়েন্ট #{i + 1}
                      </span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(i)}
                          className="text-xs text-rose-500 hover:text-rose-700 inline-flex items-center gap-1 transition-colors active:scale-[0.96]"
                        >
                          <Trash size={12} />
                          মুছুন
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          ভ্যারিয়েন্টের নাম *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ৫০০ গ্রাম প্যাকেট বা দেশি"
                          value={v.variantName}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[i].variantName = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          মূল একক (Base Unit) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. প্যাকেট বা পিস"
                          value={v.baseUnitName}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[i].baseUnitName = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          ভগ্নাংশ অনুমোদন
                        </label>
                        <select
                          value={v.allowDecimalQty ? 'true' : 'false'}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[i].allowDecimalQty = e.target.value === 'true';
                            setVariants(updated);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-slate-900"
                        >
                          <option value="false">সিল করা প্যাকেট (১, ২)</option>
                          <option value="true">ওজনযোগ্য (দশমিক)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          ক্রয়মূল্য *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="৳ Cost"
                          value={v.currentPurchasePrice}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[i].currentPurchasePrice = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white font-mono tabular-nums tracking-tight font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          খুচরা দর *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="৳ Retail"
                          value={v.retailPrice}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[i].retailPrice = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white font-mono tabular-nums tracking-tight font-semibold"
                        />
                        {calculateMargin(v.currentPurchasePrice, v.retailPrice, 'খুচরা লাভ')}
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          পাইকারি দর *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="৳ Wholesale"
                          value={v.wholesalePrice}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[i].wholesalePrice = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white font-mono tabular-nums tracking-tight font-semibold"
                        />
                        {calculateMargin(v.currentPurchasePrice, v.wholesalePrice, 'পাইকারি লাভ')}
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          স্টক সংখ্যা
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={v.stockQuantity}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[i].stockQuantity = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white font-mono tabular-nums tracking-tight"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          বারকোড
                        </label>
                        <input
                          type="text"
                          placeholder="Barcode"
                          value={v.barcode}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[i].barcode = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white font-mono tabular-nums tracking-tight"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-[background-color,color] duration-150 active:scale-[0.98]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : initialProduct ? 'আপডেট সম্পন্ন করুন' : 'পণ্য ক্যাটালগে যুক্ত করুন'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
