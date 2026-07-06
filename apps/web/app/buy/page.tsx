import { Suspense } from 'react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';
export const metadata = { title: 'Buy Property in Mumbai' };
export default async function BuyPage() {
  const cities = await getCities();
  return (<><Nav /><Suspense fallback={null}><SearchResults cities={cities} init={{purpose:'sale'}} /></Suspense><Footer /></>);
}
