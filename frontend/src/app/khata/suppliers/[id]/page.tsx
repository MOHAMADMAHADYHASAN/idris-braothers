import { Metadata } from 'next';
import { SupplierStatementClient } from '@/features/supplier-khata/components/SupplierStatementClient';

export const metadata: Metadata = {
  title: 'মহাজন লেজার ও হিসাব বিবরণী | ইদ্রিস ব্রাদার্স',
  description: 'মহাজন চালান ও লেজার বিবরণী, দেনা পরিশোধ ও ভাউচার হিস্ট্রি',
};

interface SupplierStatementPageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierStatementPage({ params }: SupplierStatementPageProps) {
  const { id } = await params;
  return <SupplierStatementClient supplierId={id} />;
}
