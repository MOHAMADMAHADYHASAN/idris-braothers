'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CaretDown, Check, Plus, Buildings, CalendarBlank } from '@phosphor-icons/react';
import { usePurchaseStore } from '../../usePurchaseStore';
import { supplierKhataService } from '@/features/supplier-khata/supplierKhata.service';
import { Supplier } from '@/features/supplier-khata/supplierKhata.types';
import { InlineSupplierModal } from './InlineSupplierModal';
import { formatCurrency } from '@/lib/decimal';

export function ChallanHeaderCard() {
  const {
    supplierId,
    supplierName,
    purchaseNumber,
    note,
    setSupplier,
    setPurchaseNumber,
    setNote,
  } = usePurchaseStore();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load suppliers
  useEffect(() => {
    async function loadSuppliers() {
      setIsLoadingSuppliers(true);
      try {
        const res = await supplierKhataService.getSuppliers({ limit: 100 });
        setSuppliers(res.suppliers);
      } catch (err) {
        console.error('Failed to load suppliers for challan', err);
      } finally {
        setIsLoadingSuppliers(false);
      }
    }
    loadSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.companyName && s.companyName.toLowerCase().includes(term)) ||
      (s.address && s.address.toLowerCase().includes(term))
    );
  });

  const selectedSupplierObj = suppliers.find((s) => s.id === supplierId);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* কার্ড হেডার */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <FileText size={16} weight="bold" />
            </span>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              ১. চালান ও সরবরাহকারীর বিবরণ
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">মোকাম পরিচিতি</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ১. মহাজন / আড়তদার সিলেক্টর উইথ ইনলাইন কুইক ক্রিয়েট */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  মহাজন / গদি নির্বাচন <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <Plus size={12} weight="bold" />
                  <span>+ নতুন মহাজন</span>
                </button>
              </div>

              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-400 focus:ring-2 focus:ring-slate-900 transition-all shadow-2xs"
              >
                <div className="truncate">
                  {supplierName ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{supplierName}</span>
                      {selectedSupplierObj && selectedSupplierObj.currentPayable > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          পূর্বের পাওনা: {formatCurrency(selectedSupplierObj.currentPayable)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">খাতুনগঞ্জ/মৌলভীবাজারের মহাজন বাছুন...</span>
                  )}
                </div>
                <CaretDown size={14} weight="bold" className="text-slate-400 shrink-0" />
              </div>

              {/* ড্রপডাউন পপওভার */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <input
                      type="text"
                      autoFocus
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="মহাজন বা গদির নাম খুঁজুন..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                    {isLoadingSuppliers ? (
                      <div className="p-4 text-center text-xs text-slate-400">মহাজন লোড হচ্ছে...</div>
                    ) : filteredSuppliers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">কোনো মহাজন পাওয়া যায়নি</div>
                    ) : (
                      filteredSuppliers.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSupplier(s.id, s.companyName ? `${s.name} (${s.companyName})` : s.name);
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          className={`w-full p-2.5 text-left text-xs hover:bg-indigo-50/40 flex items-center justify-between transition-colors cursor-pointer ${
                            supplierId === s.id ? 'bg-indigo-50 font-bold text-indigo-900' : 'text-slate-800'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            {s.companyName && (
                              <div className="text-[11px] text-slate-500 font-normal">{s.companyName}</div>
                            )}
                          </div>
                          {s.currentPayable > 0 && (
                            <span className="text-[10px] font-mono text-rose-600 font-bold">
                              বাকি: {formatCurrency(s.currentPayable)}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ২. মোকাম চালান / মেমো নম্বর */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                মোকাম মেমো / চালান নম্বর
              </label>
              <input
                type="text"
                value={purchaseNumber}
                onChange={(e) => setPurchaseNumber(e.target.value)}
                placeholder="উদাঃ CH-84920 বা আড়ত মেমো নম্বর"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs sm:text-sm text-slate-900 font-medium placeholder:font-sans"
              />
            </div>
          </div>

          {/* অভ্যন্তরীণ চালান নোট */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ড্রাইভার / গাড়ি সংক্রান্ত নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ট্রাক নম্বর, ড্রাইভারের ফোন বা মোকাম সংক্রান্ত বিশেষ তথ্য..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* ইনলাইন ফাস্ট-ক্রিয়েট মহাজন মোডাল */}
      <InlineSupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newSupplier) => {
          setSuppliers((prev) => [newSupplier, ...prev]);
          setSupplier(
            newSupplier.id,
            newSupplier.companyName
              ? `${newSupplier.name} (${newSupplier.companyName})`
              : newSupplier.name
          );
        }}
      />
    </>
  );
}
