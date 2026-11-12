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

const brandTitle = 'GoNest – Discover. Connect. Move Forward.';
const brandDescription = 'Discover, buy, rent and list residential properties with GoNest.';

export const metadata: Metadata = {
  metadataBase: new URL('https://gonest.in'),
  title: { default: brandTitle, template: '%s | GoNest' },
  description: brandDescription,
  applicationName: 'GoNest',
  keywords: ['property Mumbai', 'property Bengaluru', 'property Delhi NCR', 'property Pune', 'property Hyderabad', 'apartments for sale India', 'rent homes India'],
  icons: {
    icon: [{ url: '/gonest-icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/gonest-icon.svg'],
    apple: [{ url: '/gonest-icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    siteName: 'GoNest',
    type: 'website',
    locale: 'en_IN',
    title: brandTitle,
    description: brandDescription,
    url: 'https://gonest.in',
    images: [{ url: '/gonest-social.svg', width: 1200, height: 630, alt: 'GoNest – Discover. Connect. Move Forward.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: brandTitle,
    description: brandDescription,
    images: ['/gonest-social.svg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${manrope.variable}`}>
      <body><AuthProvider>{children}<BottomNav /><Analytics /><DemoMode /></AuthProvider></body>
    </html>
  );
}
