'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Plus,
  MagnifyingGlass,
  Warning,
  Coins,
  Tag,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { useProductStore } from '@/features/product/useProductStore';
import { ProductListTable } from '@/features/product/components/ProductListTable';
import { AddProductModal } from '@/features/product/components/AddProductModal';
import { Product } from '@/features/product/product.types';

export default function ProductsPage() {
  const {
    products,
    categories,
    brands,
    isLoading,
    searchQuery,
    selectedCategoryId,
    selectedBrandId,
    lowStockOnly,
    fetchProducts,
    fetchMetadata,
    setSearchQuery,
    setSelectedCategoryId,
    setSelectedBrandId,
    setLowStockOnly,
  } = useProductStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchMetadata();
    fetchProducts();
  }, [fetchMetadata, fetchProducts]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  // KPI Calculations with Tabular Numbers
  const totalProducts = products.length;
  const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 1), 0);
  const lowStockCount = products.filter((p) =>
    p.variants.some((v) => v.stockQuantity <= v.lowStockAlert)
  ).length;

  const totalInventoryCapital = products.reduce((acc, p) => {
    const pVal = p.variants.reduce((vAcc, v) => vAcc + v.stockQuantity * v.currentPurchasePrice, 0);
    return acc + pVal;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation Bar - Crisp 1px Border Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer"
              title="ড্যাশবোর্ডে ফিরুন"
            >
              <ArrowLeft size={18} weight="bold" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
                <Package size={16} weight="bold" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight leading-tight">
                  পণ্য ক্যাটালগ ও ইনভেন্টরি
                </h1>
                <p className="text-[10px] text-slate-500 hidden sm:block tracking-tight">
                  ইদ্রিস ব্রাদার্স • মরিচপট্টি, ফেনী বাজার
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchProducts()}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="তালিকা রিফ্রেশ করুন"
            >
              <ArrowsClockwise size={16} weight="bold" className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-[0_1px_2px_rgba(15,23,42,0.06)] active:scale-[0.98] transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
            >
              <Plus size={14} weight="bold" />
              <span>নতুন পণ্য যোগ করুন</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* KPI Summary Cards - Linear-Grade Neutral Framing */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
              <Package size={17} weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-500 tracking-tight">মোট মূল পণ্য</div>
              <div className="text-base sm:text-lg font-bold text-slate-900 font-mono tabular-nums tracking-tight">
                {totalProducts} টি
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
              <Tag size={17} weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-500 tracking-tight">মোট ভ্যারিয়েন্ট (SKU)</div>
              <div className="text-base sm:text-lg font-bold text-slate-900 font-mono tabular-nums tracking-tight">
                {totalVariants} টি
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
              <Warning size={17} weight="bold" className={lowStockCount > 0 ? 'text-rose-600' : ''} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-500 tracking-tight">স্টক সংকট সতর্কতা</div>
              <div
                className={`text-base sm:text-lg font-bold font-mono tabular-nums tracking-tight ${
                  lowStockCount > 0 ? 'text-rose-700' : 'text-slate-900'
                }`}
              >
                {lowStockCount} টি
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
              <Coins size={17} weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-500 tracking-tight truncate">ক্রয়মূল্যে মোট মূলধন</div>
              <div className="text-base sm:text-lg font-bold text-slate-900 font-mono tabular-nums tracking-tight truncate">
                ৳{totalInventoryCapital.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlass
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="পণ্য, বাংলা নাম, SKU বা বারকোড খুঁজুন..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchProducts({ search: e.target.value });
              }}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 transition-[border-color,box-shadow]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Category Filter */}
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => {
                const val = e.target.value || null;
                setSelectedCategoryId(val);
                fetchProducts({ categoryId: val || undefined });
              }}
              className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 bg-white text-slate-800"
            >
              <option value="">সকল ক্যাটাগরি</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.banglaName || c.name}
                </option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={selectedBrandId || ''}
              onChange={(e) => {
                const val = e.target.value || null;
                setSelectedBrandId(val);
                fetchProducts({ brandId: val || undefined });
              }}
              className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 bg-white text-slate-800"
            >
              <option value="">সকল ব্র্যান্ড</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.banglaName || b.name}
                </option>
              ))}
            </select>

            {/* Low Stock Toggle Button */}
            <button
              onClick={() => {
                const newVal = !lowStockOnly;
                setLowStockOnly(newVal);
                fetchProducts({ lowStockOnly: newVal });
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] cursor-pointer ${
                lowStockOnly
                  ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Warning size={13} weight={lowStockOnly ? 'fill' : 'bold'} />
              <span>স্টক সংকট</span>
            </button>
          </div>
        </div>

        {/* Product List Table */}
        <ProductListTable
          products={products}
          isLoading={isLoading}
          onEditProduct={handleEditProduct}
        />
      </main>

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        initialProduct={editingProduct}
      />
    </div>
  );
}
