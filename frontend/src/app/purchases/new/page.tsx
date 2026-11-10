import { Metadata } from 'next';
import { PurchaseChallanClient } from '@/features/purchase/components/form/PurchaseChallanClient';

export const metadata: Metadata = {
  title: 'মোকাম চালান এন্ট্রি ও স্টক-ইন | ইদ্রিস ব্রাদার্স',
  description: 'মহাজন চালান, বস্তা সাইজ, গাড়িভাড়া ও ক্রয়মূল্য নিষ্পত্তি',
};

export default function NewPurchasePage() {
  return <PurchaseChallanClient />;
}
