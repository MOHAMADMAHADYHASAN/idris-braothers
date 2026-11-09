import type { Metadata } from 'next';
import { Noto_Sans_Bengali, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const notoSansBengali = Noto_Sans_Bengali({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['bengali'],
  variable: '--font-noto-sans-bengali',
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
      suppressHydrationWarning
      className={`${notoSansBengali.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-surface-canvas text-ink-primary"
      >
        {children}
      </body>
    </html>
  );
}
