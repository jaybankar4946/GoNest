import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from './SearchResults';
import { getCities } from '@/lib/api';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Properties',
  description: 'Search available properties on GoNest.',
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string,string>> }) {
  const sp = await searchParams;
  const cities = await getCities();
  return (<><Nav /><SearchResults cities={cities} init={sp} /><Footer /></>);
}
