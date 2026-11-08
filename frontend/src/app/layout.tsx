import type { Metadata } from 'next';
import { Hind_Siliguri, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono-numbers',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ইদ্রিস ব্রাদার্স - মুদি ও মসলার আড়ত ও পিওএস কাউন্টার',
  description: 'Traditional Grocery & Spice POS, Multi-Unit Inventory and Khata Management System (Morichpotti, Feni Bazar)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-canvas text-ink-primary">
        {children}
      </body>
    </html>
  );
}
