import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';
import { BottomNav } from '@/components/layout/BottomNav';
import { Analytics } from '@/components/layout/Analytics';
import { DemoMode } from '@/components/layout/DemoMode';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['600','700','800'], variable: '--font-manrope', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gonest.in'),
  alternates: { canonical: 'https://www.gonest.in' },
  title: { default: 'GoNest – Discover. Connect. Move Forward.', template: '%s | GoNest' },
  description: 'Discover, buy, rent and list residential properties with GoNest.',
  keywords: ['property Mumbai', 'property Bengaluru', 'property Delhi NCR', 'property Pune', 'property Hyderabad', 'apartments for sale India', 'rent homes India'],
  icons: { icon: '/icon.png', shortcut: '/icon.png', apple: '/icon.png' },
  openGraph: {
    siteName: 'GoNest',
    type: 'website',
    locale: 'en_IN',
    title: 'GoNest',
    description: 'Discover, buy, rent and list residential properties with GoNest.',
    url: 'https://www.gonest.in',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'GoNest' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoNest',
    description: 'Discover, buy, rent and list residential properties with GoNest.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${manrope.variable}`}>
      <body><AuthProvider>{children}<BottomNav /><Analytics /><DemoMode /></AuthProvider></body>
    </html>
  );
}
