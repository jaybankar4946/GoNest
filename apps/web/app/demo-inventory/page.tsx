import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;
export const metadata = { title: 'Thane West Demo Inventory | GoNest', robots: { index: false, follow: false } };

const inr = (value: number, purpose: string) => {
  const amount = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
  return purpose === 'rent' ? `₹${amount}/mo` : `₹${amount}`;
};

export default async function DemoInventoryPage() {
  const [listingResult, agentResult, builderResult, projectResult, sourceResult] = await Promise.all([
    supabase.from('listings')
      .select('id,title,purpose,price,bedrooms,bathrooms,sqft,status,verification_level,is_sample,slug,availability,city:cities(name),locality:localities(name)')
      .eq('is_sample', true).like('slug', 'demo-thane-west-%').order('slug'),
    supabase.from('gonest_demo_agents')
      .select('id,agency_name,agency_type,service_areas,specialties,rera_verified,is_sample').eq('is_sample', true).order('id'),
    supabase.from('gonest_demo_builders')
      .select('id,developer_name,local_presence_verified,is_sample').eq('is_sample', true).order('id'),
    supabase.from('gonest_demo_projects')
      .select('id,project_name,builder_id,locality_name,stage,rera_status,is_sample,builder:gonest_demo_builders(developer_name)')
      .eq('is_sample', true).order('id'),
    supabase.from('gonest_demo_listing_sources')
      .select('listing_id,source_type,source_name,confirmation_status,last_confirmed_at,project_id')
      .eq('is_sample', true),
  ]);

  const listings = (listingResult.data ?? []) as any[];
  const agents = (agentResult.data ?? []) as any[];
  const builders = (builderResult.data ?? []) as any[];
  const projects = (projectResult.data ?? []) as any[];
  const sources = (sourceResult.data ?? []) as any[];
  const sourceByListing = new Map(sources.map((s) => [s.listing_id, s]));
  const saleCount = listings.filter((l) => l.purpose === 'sale').length;
  const rentCount = listings.filter((l) => l.purpose === 'rent').length;
  const projectListings = listings.filter((l) => sourceByListing.get(l.id)?.source_type === 'builder_demo').length;

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    background: 'var(--surface)', padding: 'var(--space-4)', boxShadow: 'var(--shadow-sm)',
  };
  const muted: React.CSSProperties = { color: 'var(--ink-soft)', fontSize: 'var(--text-sm)' };
  const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', minWidth: 760 };
  const cellStyle: React.CSSProperties = { padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid var(--border)', verticalAlign: 'top', fontSize: 'var(--text-sm)' };

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--space-7) var(--space-4) var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
          <div>
            <p style={{ ...muted, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>GoNest · QA workspace</p>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 750, letterSpacing: '-.03em', margin: '8px 0' }}>Thane West demo inventory</h1>
            <p style={{ ...muted, maxWidth: 760 }}>A controlled sample dataset for testing Buy, Rent, New Projects and supplier-directory workflows. Every listing, project and availability value here is synthetic and unverified.</p>
          </div>
          <Link href="/buy" style={{ padding: '10px 16px', borderRadius: 999, background: 'var(--primary)', color: '#fff', fontWeight: 650, fontSize: 'var(--text-sm)', textDecoration: 'none' }}>View public Buy search →</Link>
        </div>

        <div role="note" style={{ border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 'var(--space-5)', background: 'var(--surface-2)' }}>
          <strong>Sample-data warning.</strong> Names of well-known developers are included only as directory examples. The demo projects are not claims about those developers' actual projects; no RERA number, agent phone, verified badge or live availability is fabricated. Sample listings are clearly marked `[DEMO]` and have unverified status.
        </div>

        <section aria-label="Inventory summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-7)' }}>
          {[
            ['Sample listings', listings.length, 'Across all segments'],
            ['Buy / resale', saleCount - projectListings, 'Sale inventory'],
            ['Rent', rentCount, 'Monthly rent examples'],
            ['New-project units', projectListings, 'Linked to demo projects'],
            ['Demo agents', agents.length, 'No real contact details'],
            ['Builder examples', builders.length, 'Local presence unverified'],
          ].map(([label, value, detail]) => (
            <div key={String(label)} style={cardStyle}>
              <p style={muted}>{label}</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 750, letterSpacing: '-.03em', margin: '6px 0' }}>{value}</p>
              <p style={{ ...muted, fontSize: 'var(--text-xs)' }}>{detail}</p>
            </div>
          ))}
        </section>

        <section style={{ marginBottom: 'var(--space-7)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 6 }}>Listings · {listings.length}</h2>
          <p style={{ ...muted, marginBottom: 'var(--space-3)' }}>Includes segment, locality, price, BHK, listing status, verification and recorded source.</p>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
            <table style={tableStyle}>
              <thead><tr style={{ background: 'var(--surface-2)' }}>
                {['Listing', 'Segment', 'Locality', 'Price', 'Size', 'Availability / trust', 'Source'].map((h) => <th key={h} style={{ ...cellStyle, fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {listings.map((l) => {
                  const source = sourceByListing.get(l.id);
                  const segment = source?.source_type === 'builder_demo' ? 'New project' : l.purpose === 'rent' ? 'Rent' : 'Buy · resale';
                  const locality = Array.isArray(l.locality) ? l.locality[0]?.name : l.locality?.name;
                  return <tr key={l.id}>
                    <td style={cellStyle}><Link href={`/property/${l.id}`} style={{ color: 'var(--primary)', fontWeight: 650, textDecoration: 'none' }}>{l.title}</Link><div style={{ ...muted, fontSize: 'var(--text-xs)', marginTop: 4 }}>{l.slug}</div></td>
                    <td style={cellStyle}><span style={{ padding: '4px 8px', borderRadius: 999, background: 'var(--surface-2)', whiteSpace: 'nowrap' }}>{segment}</span></td>
                    <td style={cellStyle}>{locality ?? 'Thane West'}</td>
                    <td style={{ ...cellStyle, fontWeight: 700, whiteSpace: 'nowrap' }}>{inr(Number(l.price), l.purpose)}</td>
                    <td style={cellStyle}>{l.bedrooms} BHK · {l.sqft ?? '—'} sq ft</td>
                    <td style={cellStyle}><div>{l.availability ?? 'Available (sample)'}</div><div style={{ ...muted, fontSize: 'var(--text-xs)', marginTop: 4 }}>{l.status} · {l.verification_level}</div></td>
                    <td style={cellStyle}>{source?.source_name ?? 'Sample only'}<div style={{ ...muted, fontSize: 'var(--text-xs)', marginTop: 4 }}>{source?.confirmation_status ?? 'sample_only'}</div></td>
                  </tr>;
                })}
              </tbody>
            </table>
            {listings.length === 0 && <p style={{ padding: 24, ...muted }}>No demo listings returned. Check the database seed and public SELECT access.</p>}
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-7)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 6 }}>Agent directory · {agents.length}</h2>
          <p style={{ ...muted, marginBottom: 'var(--space-3)' }}>Example agency records for testing supplier relationships. RERA verification is intentionally false until independently checked.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 'var(--space-3)' }}>
            {agents.map((a) => <article key={a.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{a.agency_name}</h3>
                <span style={{ fontSize: 'var(--text-xs)', padding: '4px 8px', borderRadius: 999, background: 'var(--surface-2)', whiteSpace: 'nowrap' }}>Demo</span>
              </div>
              <p style={muted}>{a.agency_type}</p>
              <p style={{ marginTop: 10, fontSize: 'var(--text-sm)' }}><strong>Coverage:</strong> {a.service_areas}</p>
              <p style={{ marginTop: 6, fontSize: 'var(--text-sm)' }}><strong>Specialties:</strong> {a.specialties}</p>
              <p style={{ ...muted, fontSize: 'var(--text-xs)', marginTop: 10 }}>Phone/email not supplied · RERA not verified</p>
            </article>)}
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-7)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 6 }}>Builder directory · {builders.length}</h2>
          <p style={{ ...muted, marginBottom: 'var(--space-3)' }}>Developer names are examples, not a ranked list. Presence in Thane West and project relationships must be verified before production use.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-3)' }}>
            {builders.map((b) => <article key={b.id} style={cardStyle}>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{b.developer_name}</h3>
              <p style={muted}>Local presence: {b.local_presence_verified ? 'Verified' : 'Not verified'}</p>
              <p style={{ ...muted, fontSize: 'var(--text-xs)', marginTop: 8 }}>Official website and project inventory not asserted by this sample.</p>
            </article>)}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 6 }}>New Projects · {projects.length}</h2>
          <p style={{ ...muted, marginBottom: 'var(--space-3)' }}>Synthetic project records show the intended builder → project → listing relationship. RERA fields remain unverified and empty by design.</p>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
            <table style={tableStyle}>
              <thead><tr style={{ background: 'var(--surface-2)' }}>{['Demo project', 'Builder example', 'Locality', 'Stage', 'RERA'].map((h) => <th key={h} style={{ ...cellStyle, fontWeight: 700 }}>{h}</th>)}</tr></thead>
              <tbody>{projects.map((p) => <tr key={p.id}>
                <td style={cellStyle}>{p.project_name}</td>
                <td style={cellStyle}>{Array.isArray(p.builder) ? p.builder[0]?.developer_name : p.builder?.developer_name ?? 'Unassigned'}</td>
                <td style={cellStyle}>{p.locality_name}</td>
                <td style={cellStyle}>{p.stage.replaceAll('_', ' ')}</td>
                <td style={cellStyle}>{p.rera_status} · no number supplied</td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
