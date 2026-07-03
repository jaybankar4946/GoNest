import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';
export const metadata = { title: 'Buy Property in Mumbai' };
export default async function BuyPage() {
  return (<><Nav /><SearchResults cities={await getCities()} init={{ purpose:'sale' }} /><Footer /></>);
}
