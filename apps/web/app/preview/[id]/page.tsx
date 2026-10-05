'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { getListingById, imgUrl } from '@/lib/api';
import { formatPrice, bhkLabel, capitalize } from '@/lib/format';
import type { ListingFull } from '@/lib/types';

const display = { fontFamily: 'var(--font-manrope), var(--font-display)' } as const;

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [l, setL] = useState<ListingFull | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    if (authLoading) return;
    getListingById(id).then(d => { setL(d); setState(d ? 'ready' : 'missing'); }).catch(() => setState('missing'));
  }, [id, authLoading, user]);

  const imgs = l ? [...(l.listing_images ?? [])].sort((a, b) => a.sort_order - b.sort_order) : [];
  const city = (l?.city as any)?.name ?? '';
  const locality = (l?.locality as any)?.name ?? '';
  const poster = l?.poster as any;
  const specs = l ? [l.bedrooms > 0 && bhkLabel(l.bedrooms, l.property_type), l.bathrooms > 0 && `${l.bathrooms} bath`, l.sqft && `${l.sqft.toLocaleString('en-IN')} ft²`, l.furnishing && l.furnishing.replace('-', ' '), l.facing && `${capitalize(l.facing)} facing`].filter(Boolean) as string[] : [];

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px', minHeight: '60vh' }}>
        {state === 'loading' && <p style={{ color: '#6B7280' }}>Loading…</p>}
        {state === 'missing' && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Listing not available</p>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>It may not exist, or you may need to <Link href="/auth" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>sign in</Link> as its owner or an admin.</p>
            <Link href="/dashboard" style={{ color: 'var(--primary)', fontWeight: 600 }}>Back to dashboard</Link>
          </div>
        )}
        {state === 'ready' && l && (
          <>
            <div style={{ background: l.status === 'active' ? '#ECFDF5' : '#FFFBEB', border: '1px solid ' + (l.status === 'active' ? '#A7F3D0' : '#FDE68A'), color: l.status === 'active' ? '#065F46' : '#92400E', borderRadius: 14, padding: '10px 16px', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
              {l.status === 'active' ? 'This listing is live.' : `Preview only. Status: ${l.status.replace('_', ' ')}. It is not public until an admin approves it.`}
              {l.status === 'active' && <> <Link href={`/property/${l.id}`} style={{ textDecoration: 'underline' }}>Open public page</Link></>}
              {l.status === 'rejected' && l.rejection_reason && <> Reason: {l.rejection_reason}</>}
            </div>
            {imgs[0] && <div style={{ borderRadius: 28, overflow: 'hidden', aspectRatio: '16/9', background: '#F3F4F6', marginBottom: 12 }}><img src={imgUrl(imgs[0].storage_path)} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
            {imgs.length > 1 && <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>{imgs.slice(1, 8).map(i => <img key={i.id} src={imgUrl(i.storage_path)} alt="" style={{ width: 110, height: 76, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />)}</div>}
            <h1 style={{ ...display, fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', color: '#111827' }}>{l.title}</h1>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '6px 0 16px' }}>{locality}{locality && city ? ', ' : ''}{city}</p>
            <div style={{ ...display, fontSize: 34, fontWeight: 800, color: 'var(--primary)', marginBottom: 14 }}>{formatPrice(l.price, l.purpose)}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>{specs.map(s => <span key={s} style={{ background: '#F3F4F6', padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#374151' }}>{s}</span>)}</div>
            {l.description && <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 20 }}>{l.description}</p>}
            {poster && <p style={{ fontSize: 13, color: '#6B7280' }}>Listed by {poster.full_name ?? 'owner'} · {poster.role === 'agent' ? 'Agent' : 'Owner'}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <Link href={`/dashboard/edit/${l.id}`} style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>Edit listing</Link>
              <Link href="/dashboard" style={{ padding: '10px 20px', borderRadius: 12, background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 13 }}>Back to dashboard</Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
