import { Metadata } from 'next';
import { SupplierStatementClient } from '@/features/supplier-khata/components/SupplierStatementClient';

export const metadata: Metadata = {
  title: 'মহাজন খাতা ও হিসাব বিবরণী | ইদ্রিস ব্রাদার্স',
  description: 'মহাজন মোকাম খতিয়ান, চালান ভাউচার ও দেনা পরিশোধ বিবরণী',
};

interface SupplierStatementPageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierStatementPage({ params }: SupplierStatementPageProps) {
  const { id } = await params;
  return <SupplierStatementClient supplierId={id} />;
}
