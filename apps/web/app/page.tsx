import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HomeSearch } from './HomeSearch';
import { getFeatured, getCities } from '@/lib/api';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'GoNest – Find Your Home in Mumbai' };

export default async function HomePage() {
  const [featured, cities] = await Promise.all([getFeatured(3), getCities()]);

  return (
    <>
      <Nav />
      <main>
        <section style={{
          position: 'relative', padding: 'var(--space-8) var(--space-4) var(--space-7)',
          textAlign: 'center', background: 'linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%)',
        }}>
          <div style={{ maxWidth: 620, margin: '0 auto' }}>
            <h1 style={{
              fontFamily: 'var(--font)', fontSize: 'var(--text-3xl)', fontWeight: 700,
              letterSpacing: '-0.035em', color: 'var(--ink)', lineHeight: 1.08, marginBottom: 'var(--space-3)',
            }}>
              Find your next home.
            </h1>
            <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-soft)', marginBottom: 'var(--space-5)' }}>
              Search verified apartments, villas, and plots across Mumbai.
            </p>
            <HomeSearch />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
              {[['Buy','/buy'],['Rent','/rent'],['New Projects','/projects']].map(([label,href]) => (
                <Link key={label} href={href} style={{
                  padding: '7px 18px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)',
                  color: 'var(--ink-soft)', border: '1px solid var(--border)', background: 'var(--surface)',
                }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-7) var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                Featured properties
              </h2>
              <Link href="/search" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)' }}>
                View all →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 'var(--space-5) var(--space-4)' }}>
              {featured.map(l => <PropertyCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}

        <section style={{ background: 'var(--surface-2)', padding: 'var(--space-7) var(--space-4)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 'var(--space-5)' }}>
              Explore by type
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 'var(--space-3)' }}>
              {[['Apartments','apartment'],['Villas','villa'],['Houses','house'],['Plots','plot'],['Commercial','commercial']].map(([label,type]) => (
                <Link key={type} href={`/search?type=${type}`} style={{
                  display: 'block', background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', fontSize: 'var(--text-base)',
                  fontWeight: 600, color: 'var(--ink)', transition: 'box-shadow var(--dur-base) var(--ease)',
                }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-7) var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 'var(--space-6)' }}>
            {[
              ['Verified listings',      'Every property is checked before going live.'],
              ['Transparent pricing',    'No hidden charges. What you see is what you pay.'],
              ['Trusted professionals',  'Verified owners and agents only.'],
            ].map(([t,b]) => (
              <div key={t}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>{t}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-soft)', lineHeight: 1.65 }}>{b}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
