import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Buy Property in Mumbai & Pune',
  description: 'Explore homes and apartments for sale in Mumbai and Pune. Compare price, location, property details and listing freshness, then verify documents and availability before you commit.',
  alternates: { canonical: '/buy' },
  openGraph: {
    title: 'Buy Property in Mumbai & Pune | GoNest',
    description: 'Compare homes for sale in Mumbai and Pune and review property details before enquiring.',
    url: 'https://gonest.in/buy',
    type: 'website',
  },
};

export default async function BuyPage() {
  return (<><Nav /><SearchResults cities={await getCities()} init={{purpose:'sale'}} /><Footer /></>);
}
