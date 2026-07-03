'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { formatPrice, bhkLabel } from '@/lib/format';
import { imgUrl } from '@/lib/api';
import type { ListingFull } from '@/lib/types';
 
type Props = { listing: ListingFull; isSaved?: boolean; onToggle?: (id: string) => void };
 
export function PropertyCard({ listing: l, isSaved, onToggle }: Props) {
  const imgs = [...(l.listing_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const src  = imgs[0] ? imgUrl(imgs[0].storage_path) : null;
  const loc  = l.listing_images as any;
  const city     = (l.city     as any)?.name ?? '';
  const locality = (l.locality as any)?.name ?? '';
 
  const badge =
    l.verification_level === 'platform_verified' ? 'GoNest Verified' :
    l.verification_level === 'verified'           ? 'Verified'        : null;
 
  const sub = l.bedrooms > 0
    ? `${bhkLabel(l.bedrooms, l.property_type)} ${l.property_type.charAt(0).toUpperCase() + l.property_type.slice(1)}`
    : l.property_type.charAt(0).toUpperCase() + l.property_type.slice(1);
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Link href={`/property/${l.id}`} style={{ position: 'relative', display: 'block', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', background: '#F0F0F0' }}>
        {src
          ? <img src={src} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseOut={e  => (e.currentTarget.style.transform = 'scale(1)')} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#C8C8C8' }}>No photo</div>
        }
        {badge && (
          <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: '#111', padding: '3px 9px', borderRadius: 9999 }}>
            {badge}
          </span>
        )}
        {onToggle && (
          <button onClick={e => { e.preventDefault(); onToggle(l.id); }}
            style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
            <Heart size={14} fill={isSaved ? '#111' : 'none'} stroke="#111" />
          </button>
        )}
      </Link>
      <Link href={`/property/${l.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>{formatPrice(l.price, l.purpose)}</span>
        <span style={{ fontSize: 14, color: '#111' }}>{sub}</span>
        <span style={{ fontSize: 13, color: '#6B6B6B' }}>{locality}{locality && city ? ', ' : ''}{city}</span>
      </Link>
    </div>
  );
}
