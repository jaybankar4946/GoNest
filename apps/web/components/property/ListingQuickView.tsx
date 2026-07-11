'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { getListingById, imgUrl } from '@/lib/api';
import { formatPrice, bhkLabel, capitalize } from '@/lib/format';
import type { ListingFull } from '@/lib/types';

export function ListingQuickView({ listingId, onClose }: { listingId: string; onClose: () => void }) {
  const [l, setL] = useState<ListingFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getListingById(listingId).then(d => { if (alive) { setL(d); setLoading(false); } });
    return () => { alive = false; };
  }, [listingId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const imgs = l ? [...(l.listing_images ?? [])].sort((a, b) => a.sort_order - b.sort_order) : [];
  const city = (l?.city as any)?.name ?? '';
  const locality = (l?.locality as any)?.name ?? '';

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,18,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius-2xl)', maxWidth: 640, width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', zIndex: 2 }}>
          <X size={16} />
        </button>
        {loading || !l ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray-4)', fontFamily: 'var(--font-body)' }}>Loading…</div>
        ) : (
          <>
            <div style={{ aspectRatio: '16/9', background: 'var(--gray-1)', borderTopLeftRadius: 'var(--radius-2xl)', borderTopRightRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
              {imgs[0] && <img src={imgUrl(imgs[0].storage_path)} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ padding: 28 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>{formatPrice(l.price, l.purpose)}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginTop: 4 }}>{l.title}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--gray-4)', marginTop: 2 }}>{locality}{locality && city ? ', ' : ''}{city}</p>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {l.bedrooms > 0 && <div><div style={{ fontWeight: 700, fontSize: 15 }}>{bhkLabel(l.bedrooms, l.property_type)}</div><div style={{ fontSize: 11, color: 'var(--gray-4)' }}>Config</div></div>}
                {l.sqft && <div><div style={{ fontWeight: 700, fontSize: 15 }}>{l.sqft.toLocaleString('en-IN')} ft²</div><div style={{ fontSize: 11, color: 'var(--gray-4)' }}>Area</div></div>}
                <div><div style={{ fontWeight: 700, fontSize: 15 }}>{capitalize(l.property_type)}</div><div style={{ fontSize: 11, color: 'var(--gray-4)' }}>Type</div></div>
              </div>
              {l.description && <p className="line-clamp-3" style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: '#374151', lineHeight: 1.7, marginTop: 16 }}>{l.description}</p>}
              <Link href={`/property/${l.id}`} style={{ display: 'inline-flex', marginTop: 22, padding: '12px 26px', borderRadius: 9999, background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)' }}>
                View full details & contact
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
