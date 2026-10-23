import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Buy Property in Mumbai & Pune',
  description: 'Search homes and apartments for sale in Mumbai and Pune on GoNest. Compare property details and contact information. Only published, non-sample listings appear in property search.',
  alternates: { canonical: '/buy' },
  openGraph: {
    title: 'Buy Property in Mumbai & Pune | GoNest',
    description: 'Explore homes for sale in Mumbai and Pune. Review property details and check current listing status on GoNest.',
    url: 'https://gonest.in/buy',
    type: 'website',
  },
};

export default async function BuyPage() {
  return (
    <>
      <Nav />
      <SearchResults cities={await getCities()} init={{ purpose: 'sale' }} />
      <section aria-labelledby="buy-guide-title" style={{ background: '#fff', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px 52px', color: '#374151' }}>
          <h2 id="buy-guide-title" style={{ fontSize: 24, lineHeight: 1.3, fontWeight: 800, color: '#111827', marginBottom: 14 }}>
            Find a home to buy in Mumbai or Pune
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 850, marginBottom: 14 }}>
            GoNest helps homebuyers explore property information in Mumbai and Pune, compare details such as budget, configuration and location, and connect with property professionals. Search results show published listings only; sample or demo properties are not presented as real homes for sale.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 850, marginBottom: 20 }}>
            Property availability and prices can change. Confirm the latest details directly with the owner, agent or developer and independently review relevant documents before making a decision. Where live resale inventory is not yet available for your search, you can explore new-project information or contact a local professional.
          </p>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 14, fontWeight: 700 }}>
            <Link href="/projects" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>Explore new projects</Link>
            <Link href="/builders" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>Browse developers</Link>
            <Link href="/agents" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>Find property professionals</Link>
            <Link href="/rent" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>Looking to rent instead?</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
