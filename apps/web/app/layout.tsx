import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'GoNest – Find Your Home in Mumbai', template: '%s | GoNest' },
  description: 'Search verified properties to buy or rent in Mumbai. Apartments, villas, and plots from verified owners and agents.',
  keywords: ['property Mumbai', 'apartments for sale Mumbai', 'rent flat Mumbai', 'real estate Mumbai'],
  openGraph: { siteName: 'GoNest', type: 'website', locale: 'en_IN' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
