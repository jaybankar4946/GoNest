import { Suspense } from 'react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';
export const metadata = { title: 'Rent Property in Mumbai' };
export default async function RentPage() {
  const cities = await getCities();
  return (<><Nav /><Suspense fallback={null}><SearchResults cities={cities} init={{purpose:'rent'}} /></Suspense><Footer /></>);
}
