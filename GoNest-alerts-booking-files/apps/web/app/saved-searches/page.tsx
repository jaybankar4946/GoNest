'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { getSavedSearches, setSearchAlerts, deleteSavedSearch, type SavedSearch } from '@/lib/api';

const href = (s: SavedSearch) => { const p = new URLSearchParams(); if (s.purpose) p.set('purpose', s.purpose); if (s.city_id) p.set('city', s.city_id); if (s.min_bedrooms) p.set('beds', String(s.min_bedrooms)); if (s.property_type) p.set('type', s.property_type); if (s.max_price) p.set('max', String(s.max_price)); if (s.min_price) p.set('min', String(s.min_price)); return `/search?${p.toString()}`; };
export default function SavedSearchesPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [busy, setBusy] = useState(true);
  useEffect(() => { if (loading) return; if (!user) { setBusy(false); return; } getSavedSearches().then(setItems).finally(() => setBusy(false)); }, [user, loading]);
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px', minHeight: '60vh' }}>
        <h1 style={{ fontFamily: 'var(--font-manrope), var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Saved searches</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Get a notification when a new listing matches. Save a search from the search page.</p>
        {!user && !loading ? <p style={{ color: '#6B7280' }}><Link href="/auth?next=/saved-searches" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Sign in</Link> to see your saved searches.</p>
          : busy ? <p style={{ color: '#6B7280' }}>Loading…</p>
          : items.length === 0 ? <p style={{ color: '#6B7280' }}>No saved searches yet. <Link href="/search" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Start a search</Link> and choose “Save this search”.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{items.map(s => (
              <div key={s.id} style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div><p style={{ fontWeight: 700, fontSize: 14 }}>{s.name ?? 'Saved search'}</p><Link href={href(s)} style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'underline' }}>View results</Link></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={async () => { await setSearchAlerts(s.id, !s.notify_enabled); setItems(p => p.map(x => x.id === s.id ? { ...x, notify_enabled: !s.notify_enabled } : x)); }} style={{ padding: '8px 14px', borderRadius: 12, fontSize: 12, fontWeight: 600, border: '1px solid #E5E7EB', background: s.notify_enabled ? '#ECFDF5' : '#fff', color: s.notify_enabled ? '#065F46' : '#6B7280' }}>{s.notify_enabled ? 'Alerts on' : 'Alerts off'}</button>
                  <button onClick={async () => { await deleteSavedSearch(s.id); setItems(p => p.filter(x => x.id !== s.id)); }} style={{ padding: '8px 14px', borderRadius: 12, fontSize: 12, fontWeight: 600, border: '1px solid #FECACA', color: '#DC2626', background: '#fff' }}>Delete</button>
                </div>
              </div>))}</div>}
      </main>
      <Footer />
    </>
  );
}
