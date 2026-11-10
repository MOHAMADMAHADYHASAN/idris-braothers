import { Metadata } from 'next';
import { PurchaseDetailClient } from '@/features/purchase/components/PurchaseDetailClient';

export const metadata: Metadata = {
  title: 'মোকাম চালান বিবরণী | ইদ্রিস ব্রাদার্স',
  description: 'চালানের বিস্তারিত বিবরণ, পণ্য তালিকা ও আর্থিক নিষ্পত্তি',
};

interface PurchaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  const { id } = await params;
  return <PurchaseDetailClient purchaseId={id} />;
}
