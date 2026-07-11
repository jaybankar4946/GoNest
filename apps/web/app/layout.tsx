import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
export const metadata: Metadata = {
  title: { default: 'GoNest – Find Your Home in Mumbai', template: '%s | GoNest' },
  description: 'Search verified properties to buy or rent in Mumbai. Guided by intelligence, powered by trust.',
  keywords: ['property Mumbai','buy flat Mumbai','rent apartment Mumbai','real estate Mumbai'],
  openGraph: { siteName: 'GoNest', type: 'website', locale: 'en_IN' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
