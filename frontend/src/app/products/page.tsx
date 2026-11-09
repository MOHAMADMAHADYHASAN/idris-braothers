'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Plus,
  MagnifyingGlass,
  Warning,
  Funnel,
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

  // KPI Calculations
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
    <div className="min-h-screen bg-surface-canvas flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="ড্যাশবোর্ডে ফিরে যান"
            >
              <ArrowLeft size={18} weight="bold" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-800 flex items-center justify-center shadow-xs">
                <Package size={20} weight="bold" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  পণ্য ক্যাটালগ ও ইনভেন্টরি
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  ইদ্রিস ব্রাদার্স • মরিচপট্টি, ফেনী বাজার
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchProducts()}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="তালিকা রিফ্রেশ করুন"
            >
              <ArrowsClockwise size={18} weight="bold" className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus size={15} weight="bold" />
              <span>নতুন পণ্য যোগ করুন</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards (Neutral Framing, Strict Compliance with AGENT.md) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center">
              <Package size={20} weight="bold" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">মোট মূল পণ্য</div>
              <div className="text-lg font-bold text-slate-900 font-mono">{totalProducts} টি</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center">
              <Tag size={20} weight="bold" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">মোট ভ্যারিয়েন্ট (SKU)</div>
              <div className="text-lg font-bold text-slate-900 font-mono">{totalVariants} টি</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center">
              <Warning size={20} weight="bold" className={lowStockCount > 0 ? 'text-rose-600' : ''} />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">স্টক সংকট সতর্কতা</div>
              <div className={`text-lg font-bold font-mono ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {lowStockCount} টি
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center">
              <Coins size={20} weight="bold" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">বর্তমান ক্রয়মূল্যে মোট মূলধন</div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                ৳{totalInventoryCapital.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlass
              size={16}
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
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            {/* Category Filter */}
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => {
                const val = e.target.value || null;
                setSelectedCategoryId(val);
                fetchProducts({ categoryId: val || undefined });
              }}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-white"
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
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 bg-white"
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                lowStockOnly
                  ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Warning size={14} weight={lowStockOnly ? 'fill' : 'bold'} />
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
