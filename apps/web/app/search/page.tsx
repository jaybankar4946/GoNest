import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from './SearchResults';
import { getCities } from '@/lib/api';
export const metadata = { title: 'Search Properties' };
export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string,string>> }) {
  const sp = await searchParams;
  const cities = await getCities();
  return (<><Nav /><SearchResults cities={cities} init={sp} /><Footer /></>);
}
