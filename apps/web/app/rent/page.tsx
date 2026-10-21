import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Rent Property in Mumbai & Pune',
  description: 'Find homes and apartments for rent in Mumbai and Pune. Compare rent, deposit, furnishing and location; confirm availability, brokerage and terms directly before paying.',
  alternates: { canonical: '/rent' },
  openGraph: {
    title: 'Rent Property in Mumbai & Pune | GoNest',
    description: 'Explore rental homes in Mumbai and Pune, with property details and direct enquiry options.',
    url: 'https://gonest.in/rent',
    type: 'website',
  },
};

export default async function RentPage() {
  return (<><Nav /><SearchResults cities={await getCities()} init={{purpose:'rent'}} /><Footer /></>);
}
