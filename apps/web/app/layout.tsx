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
  metadataBase: new URL('https://gonest.in'),
  title: { default: 'GoNest – Find Your Next Home Across India', template: '%s | GoNest' },
  description: 'Explore homes to buy or rent, new projects, and property professionals across Mumbai, Bengaluru, Delhi NCR, Pune and Hyderabad. Check listing status and property details before deciding.',
  keywords: ['property Mumbai', 'property Bengaluru', 'property Delhi NCR', 'property Pune', 'property Hyderabad', 'apartments for sale India', 'rent homes India'],
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    siteName: 'GoNest',
    type: 'website',
    locale: 'en_IN',
    title: 'GoNest – Begin Your Next Chapter with US',
    description: 'Discover, buy, rent and list residential properties with GoNest.',
    url: 'https://gonest.in',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'GoNest — Begin Your Next Chapter with US' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoNest – Begin Your Next Chapter with US',
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
