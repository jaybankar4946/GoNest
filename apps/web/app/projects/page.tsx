import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';
export const metadata = { title: 'New Projects in Mumbai' };
export default async function ProjectsPage() {
  return (<><Nav /><SearchResults cities={await getCities()} init={{purpose:'sale',type:'apartment'}} /><Footer /></>);
}
