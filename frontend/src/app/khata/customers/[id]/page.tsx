import { Metadata } from 'next';
import { CustomerStatementClient } from '@/features/customer-khata/components/CustomerStatementClient';

export const metadata: Metadata = {
  title: 'কাস্টমার খতিয়ান ও স্টেটমেন্ট | ইদ্রিস ব্রাদার্স',
  description: 'কাস্টমার বাকির খতিয়ান, ট্রানজ্যাকশন লেজার ও দ্রুত পেমেন্ট কালেকশন',
};

interface CustomerStatementPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerStatementPage({ params }: CustomerStatementPageProps) {
  const { id } = await params;
  return <CustomerStatementClient customerId={id} />;
}
