import { Metadata } from 'next';
import { SaleInvoiceDetailClient } from '@/features/sales/components/SaleInvoiceDetailClient';

export const metadata: Metadata = {
  title: 'বিক্রয় মেমো ভাউচার | ইদ্রিস ব্রাদার্স',
  description: 'বিক্রয় ইনভয়েস ভাউচার, অডিট ও রসিদ প্রিন্ট',
};

interface SaleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SaleDetailPage({ params }: SaleDetailPageProps) {
  const { id } = await params;
  return <SaleInvoiceDetailClient saleId={id} />;
}
