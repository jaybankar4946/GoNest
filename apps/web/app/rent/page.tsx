import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Rent Property in Mumbai & Pune',
  description: 'Search rental homes and apartments in Mumbai and Pune on GoNest. Compare property details and contact information. Only published, non-sample listings appear in property search.',
  alternates: { canonical: '/rent' },
  openGraph: {
    title: 'Rent Property in Mumbai & Pune | GoNest',
    description: 'Explore rental homes in Mumbai and Pune. Review property details and check current listing status on GoNest.',
    url: 'https://gonest.in/rent',
    type: 'website',
  },
};

export default async function RentPage() {
  return (
    <>
      <Nav />
      <SearchResults cities={await getCities()} init={{ purpose: 'rent' }} />
      <section aria-labelledby="rent-guide-title" style={{ background: '#fff', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px 52px', color: '#374151' }}>
          <h2 id="rent-guide-title" style={{ fontSize: 24, lineHeight: 1.3, fontWeight: 800, color: '#111827', marginBottom: 14 }}>
            Find a rental home in Mumbai or Pune
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 850, marginBottom: 14 }}>
            GoNest helps renters explore property information in Mumbai and Pune and compare options by budget, configuration and location. Search results show published listings only; sample or demo properties are not presented as real rental homes.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 850, marginBottom: 20 }}>
            Rental availability, rent and deposits can change. Confirm the latest terms, viewing arrangements and the identity of the person offering the property before paying money or signing an agreement. If no live rental listing matches your search yet, check back as inventory is reviewed and added.
          </p>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 14, fontWeight: 700 }}>
            <Link href="/buy" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>Browse homes for sale</Link>
            <Link href="/projects" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>Explore new projects</Link>
            <Link href="/agents" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>Find property professionals</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
