import { Metadata } from 'next';
import { ProductFormClient } from '@/features/product/components/form/ProductFormClient';

export const metadata: Metadata = {
  title: 'নতুন পণ্য যোগ করুন | ইদ্রিস ব্রাদার্স',
  description: 'ইনভেন্টরিতে নতুন পণ্য, ভ্যারিয়েন্ট ও রূপান্তর ইউনিট যোগ করুন',
};

export default function NewProductPage() {
  return <ProductFormClient />;
}
