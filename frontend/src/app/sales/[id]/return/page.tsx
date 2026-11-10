import { Metadata } from 'next';
import { SaleReturnClient } from '@/features/sales/components/SaleReturnClient';

export const metadata: Metadata = {
  title: 'পণ্য ফেরত ও স্টক রিস্টকিং | ইদ্রিস ব্রাদার্স',
  description: 'বিক্রয় মেমোর পণ্য ফেরত, স্টক রিস্টকিং ও ক্যাশ/খাতা রিফান্ড',
};

interface SaleReturnPageProps {
  params: Promise<{ id: string }>;
}

export default async function SaleReturnPage({ params }: SaleReturnPageProps) {
  const { id } = await params;
  return <SaleReturnClient saleId={id} />;
}
