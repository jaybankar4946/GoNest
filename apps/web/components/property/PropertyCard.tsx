'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Heart, Eye, MapPin, BedDouble, Bath, Ruler, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, bhkLabel, capitalize } from '@/lib/format';
import { imgUrl } from '@/lib/api';
import type { ListingFull } from '@/lib/types';

type Props = { listing: ListingFull; isSaved?: boolean; onToggle?: (id: string) => void; onQuickView?: (id: string) => void };

const BADGE: Record<string, { label: string; bg: string }> = {
  platform_verified: { label: 'GoNest Verified', bg: 'var(--primary)' },
  verified: { label: 'Verified', bg: '#3D3D3D' },
};

export function PropertyCard({ listing: l, isSaved, onToggle, onQuickView }: Props) {
  const imgs = [...(l.listing_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const city = (l.city as any)?.name ?? '';
  const loc = (l.locality as any)?.name ?? '';
  const badge = BADGE[l.verification_level];
  const sub = l.bedrooms > 0 ? `${bhkLabel(l.bedrooms, l.property_type)} ${capitalize(l.property_type)}` : capitalize(l.property_type);

  const go = (dir: 1 | -1, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIdx(i => (i + dir + imgs.length) % imgs.length);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }} transition={{ duration: 0.22 }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link href={`/property/${l.id}`} style={{ display: 'block', borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)', transition: 'box-shadow .25s' }}>

        <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--gray-1)', overflow: 'hidden' }}>
          {imgs.length > 0 ? (
            <img src={imgUrl(imgs[idx].storage_path)} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--gray-3)' }}>No photo</div>
          )}

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.16) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.30) 100%)' }} />

          <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.96)', padding: '5px 12px', borderRadius: 10, boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#111' }}>{formatPrice(l.price, l.purpose)}</span>
          </div>

          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
            {badge && <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: badge.bg, padding: '4px 10px', borderRadius: 9999 }}>{badge.label}</span>}
            {l.featured && !badge && <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: 'var(--accent)', padding: '4px 10px', borderRadius: 9999 }}>Featured</span>}
          </div>

          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {onToggle && (
              <motion.button whileTap={{ scale: 0.85 }} onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle(l.id); }}
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
                <Heart size={14} fill={isSaved ? 'var(--accent)' : 'none'} stroke={isSaved ? 'var(--accent)' : '#111'} />
              </motion.button>
            )}
            {onQuickView && (
              <button onClick={e => { e.preventDefault(); e.stopPropagation(); onQuickView(l.id); }}
                className="opacity-0 group-hover:opacity-100"
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', opacity: hover ? 1 : 0, transition: 'opacity .2s' }}>
                <Eye size={14} stroke="#111" />
              </button>
            )}
          </div>

          {imgs.length > 1 && hover && (
            <>
              <button onClick={e => go(-1, e)} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={e => go(1, e)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <ChevronRight size={14} />
              </button>
            </>
          )}

          {imgs.length > 1 && (
            <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 4 }}>
              {imgs.map((_, i) => (
                <span key={i} style={{ width: i === idx ? 14 : 4, height: 4, borderRadius: 9999, background: '#fff', opacity: i === idx ? 1 : 0.5, transition: 'width .2s' }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 14px 16px' }}>
          <h3 className="line-clamp-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: '#111', marginBottom: 4 }}>{sub}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            <MapPin size={12} color="var(--gray-3)" />
            <span style={{ fontSize: 13, color: 'var(--gray-4)' }} className="line-clamp-1">{loc}{loc && city ? ', ' : ''}{city}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            {l.bedrooms > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151' }}>
                <BedDouble size={13} color="var(--gray-3)" /> {l.bedrooms}
              </span>
            )}
            {l.bathrooms > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151' }}>
                <Bath size={13} color="var(--gray-3)" /> {l.bathrooms}
              </span>
            )}
            {l.sqft && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151' }}>
                <Ruler size={13} color="var(--gray-3)" /> {l.sqft.toLocaleString('en-IN')} ft²
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
