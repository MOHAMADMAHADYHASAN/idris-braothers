import { Metadata } from 'next';
import { ProductProfile360Client } from '@/features/product/components/ProductProfile360Client';

export const metadata: Metadata = {
  title: 'পণ্য ৩৬০° প্রোফাইল ও অডিট | ইদ্রিস ব্রাদার্স',
  description: 'পণ্যের সার্বিক স্বাস্থ্য, স্টক ম্যাট্রিক্স, লাভ মার্জিন ও বারকোড স্টিকার প্রিন্টার',
};

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  return <ProductProfile360Client productId={id} />;
}
