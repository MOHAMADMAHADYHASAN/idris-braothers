import { Metadata } from 'next';
import { ProductFormClient } from '@/features/product/components/form/ProductFormClient';

export const metadata: Metadata = {
  title: 'পণ্য সম্পাদনা | ইদ্রিস ব্রাদার্স',
  description: 'পণ্যের বিবরণ, দর ও ইনভেন্টরি স্টক সম্পাদনা করুন',
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  return <ProductFormClient productId={id} />;
}
