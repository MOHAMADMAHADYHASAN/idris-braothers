'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Plus, ArrowsClockwise } from '@phosphor-icons/react';
import { useProductStore } from '@/features/product/useProductStore';
import { ProductListTable } from '@/features/product/components/ProductListTable';
import { ProductMobileCard } from '@/features/product/components/ProductMobileCard';
import { ProductKpiSummary } from '@/features/product/components/ProductKpiSummary';
import { ProductFilterBar } from '@/features/product/components/ProductFilterBar';
import { QuickPriceModal } from '@/features/product/components/QuickPriceModal';
import { AddUnitModal } from '@/features/product/components/AddUnitModal';
import { RecordWastageModal } from '@/features/product/components/RecordWastageModal';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminPagination } from '@/components/shared/AdminPagination';
import { Product, ProductVariant } from '@/features/product/product.types';

export default function ProductsPage() {
  const router = useRouter();
  const {
    products,
    pagination,
    isLoading,
    fetchProducts,
    fetchMetadata,
    setPage,
    deleteVariant,
  } = useProductStore();

  // Quick Action Modals state (Price, Unit, Wastage)
  const [priceModalData, setPriceModalData] = useState<{
    variant: ProductVariant;
    productName: string;
  } | null>(null);

  const [unitModalData, setUnitModalData] = useState<{
    variant: ProductVariant;
    productName: string;
  } | null>(null);

  const [wastageModalData, setWastageModalData] = useState<{
    variant: ProductVariant;
    productName: string;
  } | null>(null);

  useEffect(() => {
    fetchMetadata();
    fetchProducts();
  }, [fetchMetadata, fetchProducts]);

  const handleEditProduct = (product: Product) => {
    router.push(`/products/edit/${product.id}`);
  };

  const handleDeleteVariant = async (variantId: string, variantName: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${variantName}" ভ্যারিয়েন্টটি মুছতে চান?`)) {
      return;
    }
    try {
      const res = await deleteVariant(variantId);
      if (res?.deactivated) {
        alert(
          `ঐতিহাসিক বিক্রয় বা পারচেজ রেকর্ড থাকার কারণে "${variantName}" ভ্যারিয়েন্টটি স্থায়ীভাবে মুছে না ফেলে নিষ্ক্রিয় (Deactivated) করা হয়েছে।`
        );
      }
    } catch (err: any) {
      alert(err.message || 'ভ্যারিয়েন্ট মুছতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans pb-16">
      {/* ১. স্টিকি পেজ হেডার (AdminPageHeader) */}
      <div className="bg-white border-b border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <AdminPageHeader
            title="পণ্য ক্যাটালগ ও ইনভেন্টরি"
            subtitle="মরিচপট্টি, ফেনী বাজার — ঐতিহ্যবাহী মুদি ও মসলার মাল্টি-ইউনিট স্টক, রূপান্তর ও মূল্য ব্যবস্থাপনা"
            backHref="/"
            backTitle="ড্যাশবোর্ডে ফিরে যান"
            icon={<Package size={16} weight="bold" />}
            badge={
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                ক্যাটালগ
              </span>
            }
            actions={
              <>
                <button
                  type="button"
                  onClick={() => fetchProducts()}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-md border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-[background-color,border-color,transform] duration-150 disabled:opacity-50 cursor-pointer"
                  title="তালিকা রিফ্রেশ করুন"
                >
                  <ArrowsClockwise
                    size={14}
                    weight="bold"
                    className={isLoading ? 'animate-spin' : ''}
                  />
                  <span className="hidden sm:inline">রিফ্রেশ</span>
                </button>

                <Link
                  href="/products/new"
                  className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 transition-[background-color,transform] duration-150 shadow-[0_1px_2px_rgba(15,23,42,0.08)] cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span>+ নতুন পণ্য</span>
                </Link>
              </>
            }
          />
        </div>
      </div>

      {/* মূল কন্টেন্ট ক্যানভাস */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3.5">
        {/* ১. ৪-কার্ডের সুনির্দিষ্ট ইনভেন্টরি KPI সামারি */}
        <ProductKpiSummary />

        {/* ২. অ্যাকশন ও পোর্টাল ফিল্টার বার */}
        <ProductFilterBar />

        {/* ৩. ডেস্কটপ টেবিল ভিউ (Golden Column Alignment) */}
        <div className="hidden md:block">
          <ProductListTable
            products={products}
            isLoading={isLoading}
            onEditProduct={handleEditProduct}
            onOpenPriceModal={(v, name) => setPriceModalData({ variant: v, productName: name })}
            onOpenUnitModal={(v, name) => setUnitModalData({ variant: v, productName: name })}
            onOpenWastageModal={(v, name) => setWastageModalData({ variant: v, productName: name })}
          />
        </div>

        {/* ৪. মোবাইল রেসপন্সিভ কার্ড স্ট্রিম */}
        <div className="block md:hidden space-y-2.5">
          {isLoading && products.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200/90 p-8 text-center">
              <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">পণ্য তালিকা লোড হচ্ছে...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200/90 p-8 text-center text-slate-500">
              <Package size={28} weight="bold" className="mx-auto mb-2 text-slate-400" />
              <p className="text-xs font-semibold">কোনো পণ্য পাওয়া যায়নি</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductMobileCard
                key={product.id}
                product={product}
                onEditProduct={handleEditProduct}
                onOpenPriceModal={(v, name) => setPriceModalData({ variant: v, productName: name })}
                onOpenUnitModal={(v, name) => setUnitModalData({ variant: v, productName: name })}
                onOpenWastageModal={(v, name) => setWastageModalData({ variant: v, productName: name })}
                onDeleteVariant={handleDeleteVariant}
              />
            ))
          )}
        </div>

        {/* ৫. পেজিনেশন বার */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg border border-slate-200/90 p-2 shadow-2xs">
            <AdminPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={setPage}
              itemLabel="পণ্য"
            />
          </div>
        )}
      </main>


      {/* কুইক দর পরিবর্তন মডাল */}
      <QuickPriceModal
        isOpen={Boolean(priceModalData)}
        onClose={() => setPriceModalData(null)}
        variant={priceModalData?.variant || null}
        productName={priceModalData?.productName || ''}
      />

      {/* নতুন বস্তা/কার্টন রূপান্তর ইউনিট মডাল */}
      <AddUnitModal
        isOpen={Boolean(unitModalData)}
        onClose={() => setUnitModalData(null)}
        variant={unitModalData?.variant || null}
        productName={unitModalData?.productName || ''}
      />

      {/* অপচয় ও শুকিয়ে যাওয়া ঘাটতি এন্ট্রি মডাল */}
      <RecordWastageModal
        isOpen={Boolean(wastageModalData)}
        onClose={() => setWastageModalData(null)}
        variant={wastageModalData?.variant || null}
        productName={wastageModalData?.productName || ''}
      />
    </div>
  );
}
