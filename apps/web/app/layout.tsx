import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';
import { BottomNav } from '@/components/layout/BottomNav';
import { Analytics } from '@/components/layout/Analytics';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['600','700','800'], variable: '--font-manrope', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gonest.in'),
  title: { default: 'GoNest | Buy, Rent & Explore Verified Property in Mumbai and Pune', template: '%s | GoNest' },
  description: 'Find homes to buy or rent, explore new residential projects, and discover property professionals in Mumbai and Pune. Check listing freshness, verification details and property information before enquiring.',
  keywords: ['property in Mumbai', 'flats for sale Mumbai', 'flats for rent Mumbai', 'new projects Mumbai', 'property in Pune', 'flats for sale Pune', 'flats for rent Pune', 'new projects Pune', 'real estate agents Mumbai', 'real estate agents Pune'],
  applicationName: 'GoNest',
  category: 'real estate',
  openGraph: {
    siteName: 'GoNest',
    type: 'website',
    locale: 'en_IN',
    title: 'GoNest | Buy, Rent & Explore Property in Mumbai and Pune',
    description: 'Explore homes to buy or rent, new projects, and property professionals in Mumbai and Pune. Review listing status and details before deciding.',
    url: 'https://gonest.in',
  },
  twitter: { card: 'summary_large_image', title: 'GoNest | Mumbai & Pune Property Marketplace', description: 'Explore homes to buy or rent, new projects and property professionals in Mumbai and Pune.' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${jakarta.variable} ${manrope.variable}`}>
      <body><AuthProvider>{children}<BottomNav /><Analytics /></AuthProvider></body>
    </html>
  );
}
