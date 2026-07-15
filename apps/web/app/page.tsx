import Link from 'next/link';
import { Building2, Home as HomeIcon, Warehouse, LandPlot, Briefcase, ShieldCheck, Tag, Users } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HomeSearch } from './HomeSearch';
import { getFeatured, getCities } from '@/lib/api';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GoNest – Find Your Home in Mumbai',
};

const TYPES = [
  { label: 'Apartments', type: 'apartment', Icon: Building2 },
  { label: 'Villas', type: 'villa', Icon: HomeIcon },
  { label: 'Houses', type: 'house', Icon: Warehouse },
  { label: 'Plots', type: 'plot', Icon: LandPlot },
  { label: 'Commercial', type: 'commercial', Icon: Briefcase },
];

const TRUST = [
  { Icon: ShieldCheck, t: 'Verified Listings', b: 'Every property is checked before going live.' },
  { Icon: Tag, t: 'Transparent Pricing', b: 'No hidden charges. What you see is what you pay.' },
  { Icon: Users, t: 'Trusted Professionals', b: 'Verified owners and agents only.' },
];

export default async function HomePage() {
  const [featured, cities] = await Promise.all([getFeatured(3), getCities()]);

  return (
    <>
      <Nav />
      <main>

        {/* Hero */}
        <section style={{ padding: '72px 24px 60px', textAlign: 'center', background: 'linear-gradient(180deg,#F7F9FF 0%,#fff 100%)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,5vw,46px)', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}>
              Find your next home.
            </h1>
            <p style={{ fontSize: 16, color: '#6B6B6B', marginBottom: 36 }}>
              Search verified apartments, villas &amp; plots — from owners and agents you can trust.
            </p>

            <HomeSearch />

            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 20, flexWrap: 'wrap' }}>
              {[['Buy', '/buy'], ['Rent', '/rent'], ['New Projects', '/projects']].map(([l, h]) => (
                <Link key={l} href={h} style={{ padding: '6px 16px', borderRadius: 9999, fontSize: 13, color: '#6B6B6B', fontWeight: 500 }}>
                  {l}
                </Link>
              ))}
            </div>

            {cities.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {cities.slice(0, 5).map(c => (
                  <Link key={c.id} href={`/search?city=${c.id}`}
                    style={{ padding: '6px 16px', borderRadius: 9999, fontSize: 12.5, color: '#374151', border: '1px solid var(--border)', background: '#fff', transition: 'color .15s,border-color .15s' }}
                    className="hover:border-[var(--primary)] hover:text-[var(--primary)]">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured */}
        {featured.length > 0 && (
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 24px 76px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 26 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>Featured Properties</h2>
              <Link href="/search" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View all →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '32px 20px' }}>
              {featured.map(l => <PropertyCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}

        {/* Categories */}
        <section style={{ background: 'var(--gray-1)', padding: '56px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', marginBottom: 22 }}>Explore by type</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
              {TYPES.map(({ label, type, Icon }) => (
                <Link key={type} href={`/search?type=${type}`}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14, background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 18px', transition: 'box-shadow .2s,border-color .2s', boxShadow: 'var(--shadow-sm)' }}
                  className="hover:shadow-[var(--shadow-lg)] hover:border-[var(--primary)]">
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gray-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={19} color="var(--primary)" />
                  </span>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: '#111' }}>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why GoNest */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 84px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 40 }}>
            {TRUST.map(({ Icon, t, b }) => (
              <div key={t}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gray-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={20} color="var(--primary)" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 6 }}>{t}</h3>
                <p style={{ fontSize: 13.5, color: '#6B6B6B', lineHeight: 1.65 }}>{b}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
