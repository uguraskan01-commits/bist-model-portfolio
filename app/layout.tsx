import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'xuProf PRO | Akıllı Hisse Puanlama & Model Portföy Karar Sistemi',
  description: 'Borsa İstanbul çok faktörlü teknik, temel, momentum, KAP ve konsensüs hedef puanlama ve dinamik model portföy takip sistemi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-[#0A0B0E] text-zinc-100 antialiased">{children}</body>
    </html>
  );
}