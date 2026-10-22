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
  title: { default: 'GoNest – Homes in Mumbai & Pune', template: '%s | GoNest' },
  description: 'Explore homes to buy or rent, new projects, and property professionals in Mumbai and Pune. Check listing status and property details before deciding.',
  keywords: ['property Mumbai', 'property Pune', 'apartments for sale Mumbai', 'apartments for sale Pune', 'rent homes Mumbai', 'rent homes Pune'],
  openGraph: { siteName: 'GoNest', type: 'website', locale: 'en_IN', title: 'GoNest – Find Your Next Home Across India', description: 'Explore homes to buy or rent, new projects, and property professionals in Mumbai and Pune.', url: 'https://gonest.in' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${manrope.variable}`}>
      <body><AuthProvider>{children}<BottomNav /><Analytics /></AuthProvider></body>
    </html>
  );
}
