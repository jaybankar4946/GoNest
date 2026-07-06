'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { formatPrice, bhkLabel, capitalize } from '@/lib/format';
import { imgUrl } from '@/lib/api';
import type { ListingFull } from '@/lib/types';

type Props = { listing: ListingFull; isSaved?: boolean; onToggle?: (id: string) => void };
const BADGE: Record<string,{label:string;bg:string}> = {
  platform_verified: { label: 'GoNest Verified', bg: 'var(--ink)' },
  verified:           { label: 'Verified',        bg: 'var(--ink-soft)' },
};

export function PropertyCard({ listing: l, isSaved, onToggle }: Props) {
  const [hover, setHover] = useState(false);
  const imgs = [...(l.listing_images ?? [])].sort((a,b) => a.sort_order - b.sort_order);
  const src = imgs[0] ? imgUrl(imgs[0].storage_path) : null;
  const city = (l.city as any)?.name ?? '';
  const loc  = (l.locality as any)?.name ?? '';
  const badge = BADGE[l.verification_level];
  const sub = l.bedrooms > 0
    ? `${bhkLabel(l.bedrooms, l.property_type)} · ${capitalize(l.property_type)}`
    : capitalize(l.property_type);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
    >
      <Link
        href={`/property/${l.id}`}
        style={{
          position: 'relative', display: 'block', overflow: 'hidden',
          borderRadius: 'var(--radius-md)', aspectRatio: '4/3',
          background: 'var(--surface-3)',
          boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
          transform: hover ? 'translateY(-3px)' : 'translateY(0)',
          transition: `all var(--dur-base) var(--ease)`,
        }}
      >
        {src ? (
          <Image
            src={src} alt={l.title} fill sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover', transform: hover ? 'scale(1.045)' : 'scale(1)', transition: `transform var(--dur-slow) var(--ease)` }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
            No photo
          </div>
        )}

        {(badge || l.featured) && (
          <span style={{
            position: 'absolute', top: 12, left: 12, zIndex: 1,
            fontSize: 11, fontWeight: 600, color: '#fff',
            background: badge?.bg ?? 'var(--ink-soft)',
            padding: '4px 11px', borderRadius: 'var(--radius-full)',
            letterSpacing: '0.01em',
          }}>
            {badge?.label ?? 'Featured'}
          </span>
        )}

        {onToggle && (
          <button
            onClick={e => { e.preventDefault(); onToggle(l.id); }}
            style={{
              position: 'absolute', top: 12, right: 12, zIndex: 1,
              width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Heart size={15} fill={isSaved ? 'var(--ink)' : 'none'} stroke="var(--ink)" strokeWidth={1.75} />
          </button>
        )}
      </Link>

      <Link href={`/property/${l.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--ink)', letterSpacing: '-0.01em' }}>
          {formatPrice(l.price, l.purpose)}
        </span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-soft)' }}>{sub}</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)' }}>
          {loc}{loc && city ? ', ' : ''}{city}
        </span>
      </Link>
    </div>
  );
}
