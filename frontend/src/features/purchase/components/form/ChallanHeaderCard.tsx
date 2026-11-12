'use client';

import React, { useState, useEffect, useId } from 'react';
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
  const formId = useId();

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
      <div className="bg-surface-card rounded-xl border border-border-default shadow-2xs overflow-hidden">
        {/* কার্ড হেডার */}
        <div className="px-5 py-3.5 bg-surface-subtle/60 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-soft text-brand-deep">
              <FileText size={16} weight="bold" />
            </span>
            <h2 className="text-sm font-bold text-ink-primary">
              ১. চালান ও সরবরাহকারীর বিবরণ
            </h2>
          </div>
          <span className="text-xs text-ink-secondary font-medium">মোকাম পরিচিতি</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ১. মহাজন / আড়তদার সিলেক্টর */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={`${formId}-supplier-btn`} className="text-xs font-semibold text-ink-body">
                  মহাজন ও গদি নির্বাচন <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs font-semibold text-brand-deep hover:text-brand-hover flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={12} weight="bold" />
                  <span>নতুন মহাজন</span>
                </button>
              </div>

              <button
                id={`${formId}-supplier-btn`}
                type="button"
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-2.5 bg-surface-card border border-border-strong rounded-lg text-xs sm:text-sm text-ink-primary flex items-center justify-between text-left cursor-pointer hover:border-brand-mid transition-all shadow-2xs"
              >
                <div className="truncate">
                  {supplierName ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink-primary">{supplierName}</span>
                      {selectedSupplierObj && selectedSupplierObj.currentPayable > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-due-bg text-due-text font-bold border border-due-border">
                          পূর্বের পাওনা: {formatCurrency(selectedSupplierObj.currentPayable)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-ink-muted">মহাজন বাছুন...</span>
                  )}
                </div>
                <CaretDown size={14} weight="bold" className="text-ink-secondary shrink-0" />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 surface-glass-popover border border-border-default rounded-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 border-b border-border-subtle bg-surface-subtle">
                    <input
                      type="text"
                      aria-label="মহাজন খুঁজুন"
                      autoFocus
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="মহাজন খুঁজুন..."
                      className="w-full px-2.5 py-1.5 bg-surface-card border border-border-strong rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-brand-deep"
                    />
                  </div>

                  <div className="overflow-y-auto divide-y divide-border-subtle flex-1">
                    {isLoadingSuppliers ? (
                      <div className="p-4 text-center text-xs text-ink-secondary">মহাজন লোড হচ্ছে...</div>
                    ) : filteredSuppliers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-ink-secondary">কোনো মহাজন পাওয়া যায়নি</div>
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
                          className={`w-full p-2.5 text-left text-xs hover:bg-brand-soft/50 flex items-center justify-between transition-colors cursor-pointer ${
                            supplierId === s.id ? 'bg-brand-soft font-bold text-brand-deep' : 'text-ink-body'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            {s.companyName && (
                              <div className="text-xs text-ink-secondary font-normal">{s.companyName}</div>
                            )}
                          </div>
                          {s.currentPayable > 0 && (
                            <span className="text-xs font-mono text-due-text font-bold">
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

            {/* ২. মোকাম চালান নম্বর */}
            <div>
              <label htmlFor={`${formId}-purchase-no`} className="block text-xs font-semibold text-ink-body mb-1.5">
                মোকাম মেমো ও চালান নম্বর
              </label>
              <input
                id={`${formId}-purchase-no`}
                type="text"
                value={purchaseNumber}
                onChange={(e) => setPurchaseNumber(e.target.value)}
                placeholder="চালান / মেমো নম্বর"
                className="w-full px-3 py-2.5 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep font-mono text-xs sm:text-sm text-ink-primary font-medium placeholder:font-sans"
              />
            </div>
          </div>

          {/* চালান নোট */}
          <div>
            <label htmlFor={`${formId}-note`} className="block text-xs font-semibold text-ink-body mb-1">
              ড্রাইভার ও গাড়ি সংক্রান্ত নোট (ঐচ্ছিক)
            </label>
            <input
              id={`${formId}-note`}
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="গাড়ি / ড্রাইভারের নোট"
              className="w-full px-3 py-2 rounded-lg border border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-deep text-xs text-ink-primary"
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
