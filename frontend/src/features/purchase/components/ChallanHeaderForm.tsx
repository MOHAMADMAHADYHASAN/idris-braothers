'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CaretDown, Check, MapPin } from '@phosphor-icons/react';
import { usePurchaseStore } from '../usePurchaseStore';
import { supplierKhataService } from '@/features/supplier-khata/supplierKhata.service';
import { Supplier } from '@/features/supplier-khata/supplierKhata.types';

export function ChallanHeaderForm() {
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

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-2.5">
        <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
          <FileText size={16} weight="bold" />
        </div>
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">
            চালানের প্রাথমিক তথ্য ও মহাজন নির্বাচন
          </h3>
          <p className="text-[11px] text-slate-500">মোকামের চালান নম্বর ও সরবরাহকারী নির্ধারণ করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* ১. মহাজন / আড়তদার সিলেক্টর */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            মহাজন / আড়ত নির্বাচন <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-[background-color,border-color] duration-150"
          >
            <div className="truncate">
              {supplierName ? (
                <span className="font-medium text-slate-900">{supplierName}</span>
              ) : (
                <span className="text-slate-400">খাতুনগঞ্জ/মৌলভীবাজারের মহাজন বাছুন...</span>
              )}
            </div>
            <CaretDown size={14} weight="bold" className="text-slate-400 shrink-0" />
          </div>

          {/* ড্রপডাউন পপওভার */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden max-h-64 flex flex-col">
              <div className="p-2 border-b border-slate-100 bg-slate-50">
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="মহাজন বা গদির নাম লিখুন..."
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                {isLoadingSuppliers ? (
                  <div className="p-4 text-center text-xs text-slate-400">মহাজন লোড হচ্ছে...</div>
                ) : filteredSuppliers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">কোনো মহাজন পাওয়া যায়নি</div>
                ) : (
                  filteredSuppliers.map((s) => {
                    const isSelected = s.id === supplierId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSupplier(s.id, s.companyName || s.name);
                          setIsDropdownOpen(false);
                          setSearchTerm('');
                        }}
                        className={`p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                          isSelected ? 'bg-slate-100 font-semibold text-slate-900' : ''
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-900">
                            {s.companyName || s.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {s.companyName && <span>মালিক: {s.name}</span>}
                            {s.address && (
                              <span className="flex items-center gap-0.5">
                                <MapPin size={10} weight="bold" />
                                {s.address}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && <Check size={15} weight="bold" className="text-slate-900" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ২. চালান / মেমো নম্বর */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            মোকামের চালান / মেমো নং
          </label>
          <input
            type="text"
            value={purchaseNumber}
            onChange={(e) => setPurchaseNumber(e.target.value)}
            placeholder="যেমন: CHALAN-8472 (খালি রাখলে স্বয়ংক্রিয়)"
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
          />
        </div>

        {/* ৩. নোট / গাড়ির নম্বর */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            নোট / ট্রাক বা গাড়ির নম্বর (ঐচ্ছিক)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="যেমন: ঢাকা মেট্রো-ট ১২-৩৪৫৬ / ড্রাইভার কালাম"
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-[border-color,box-shadow] duration-150"
          />
        </div>
      </div>
    </div>
  );
}
