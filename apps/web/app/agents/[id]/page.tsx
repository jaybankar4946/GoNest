import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getAgentById, getAgentListings } from '@/lib/api';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentById(id);
  return { title: agent?.full_name ? `${agent.full_name} | GoNest` : 'Agent Profile' };
}

export default async function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgentById(id);
  if (!agent) notFound();

  const listings = await getAgentListings(id);

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#111', flexShrink: 0 }}>
            {(agent.full_name ?? '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', marginBottom: 2 }}>
              {agent.full_name ?? 'Unnamed'}
            </h1>
            <p style={{ fontSize: 14, color: '#6B6B6B' }}>
              {agent.role === 'agent' ? 'Agent' : 'Owner'}{agent.agency_name ? ` · ${agent.agency_name}` : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {agent.agent_verified && (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: '#111', padding: '4px 12px', borderRadius: 9999 }}>
              ✓ GoNest Verified
            </span>
          )}
          {agent.rera_number && (
            <span style={{ fontSize: 12, color: '#374151', background: '#F7F7F7', padding: '4px 12px', borderRadius: 9999 }}>
              RERA: {agent.rera_number}
            </span>
          )}
          {agent.phone_verified && (
            <span style={{ fontSize: 12, color: '#16A34A', background: '#F0FDF4', padding: '4px 12px', borderRadius: 9999 }}>
              ✓ Phone Verified
            </span>
          )}
        </div>

        {agent.bio && (
          <p style={{ fontSize: 14, color: '#3D3D3D', lineHeight: 1.7, maxWidth: 700, marginBottom: 24 }}>
            {agent.bio}
          </p>
        )}

        {agent.rating != null && agent.review_count > 0 && (
          <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 32 }}>
            ★ {agent.rating.toFixed(1)} average rating from {agent.review_count} review{agent.review_count === 1 ? '' : 's'}
          </p>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 20, paddingTop: 8, borderTop: '1px solid #E5E5E5' }}>
          {listings.length} active listing{listings.length === 1 ? '' : 's'}
        </h2>

        {listings.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6B6B6B' }}>No active listings right now.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '36px 20px' }}>
            {listings.map((l) => <PropertyCard key={l.id} listing={l} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
