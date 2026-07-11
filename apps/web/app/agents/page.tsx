import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { getAgents } from '@/lib/api';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Verified Agents & Owners in Mumbai' };

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-7) var(--space-4) var(--space-8)' }}>
        <h1 style={{
          fontFamily: 'var(--font)', fontSize: 'var(--text-2xl)', fontWeight: 700,
          letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 'var(--space-2)',
        }}>
          Agents &amp; Owners
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-soft)', marginBottom: 'var(--space-6)' }}>
          Browse verified professionals listing on GoNest.
        </p>

        {agents.length === 0 ? (
          <div style={{
            padding: 'var(--space-6)', textAlign: 'center', background: 'var(--surface-2)',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-soft)' }}>No agents or owners yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 'var(--space-4)' }}>
            {agents.map((a) => (
              <Link key={a.id} href={`/agents/${a.id}`}
                style={{
                  display: 'block', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)',
                  transition: 'box-shadow var(--dur-base) var(--ease), transform var(--dur-base) var(--ease)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-full)', background: 'var(--primary-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--primary)', flexShrink: 0,
                  }}>
                    {(a.full_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }} className="line-clamp-1">
                      {a.full_name ?? 'Unnamed'}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)' }}>
                      {a.role === 'agent' ? 'Agent' : 'Owner'}{a.agency_name ? ` · ${a.agency_name}` : ''}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {a.agent_verified && (
                    <span style={{
                      fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary)',
                      background: 'var(--primary-soft)', padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    }}>
                      ✓ Verified
                    </span>
                  )}
                  {a.rera_number && (
                    <span style={{
                      fontSize: 'var(--text-xs)', color: 'var(--ink-soft)', background: 'var(--surface-3)',
                      padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    }}>
                      RERA: {a.rera_number}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)', marginTop: 'var(--space-3)' }}>
                  {a.total_listings ?? 0} listing{(a.total_listings ?? 0) === 1 ? '' : 's'}
                  {a.rating ? ` · ★ ${a.rating.toFixed(1)} (${a.review_count})` : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
