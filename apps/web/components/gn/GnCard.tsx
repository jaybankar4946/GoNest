'use client';
import { Heart, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { formatPrice, bhkLabel } from './types';
import type { Listing } from '@/lib/mock-data';

type Props = {
  listing: Listing;
  isSaved: boolean;
  onCardClick: (l: Listing) => void;
  onSaveToggle: (id: string) => void;
};

export function GnCard({ listing: l, isSaved, onCardClick, onSaveToggle }: Props) {
  return (
    <div className="group cursor-pointer" onClick={() => onCardClick(l)}>
      <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '4/3', background: '#F0F0F0' }}>
        <ImageWithFallback
          src={l.images[0]}
          alt={l.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onSaveToggle(l.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
        >
          <Heart className="h-3.5 w-3.5" fill={isSaved ? '#111111' : 'none'} stroke="#111111" />
        </button>
      </div>

      <div className="pt-3">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#111111' }}>
          {formatPrice(l.price, l.priceType)}
        </div>
        <div className="mt-0.5" style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#111111' }}>
          {l.bedrooms > 0 ? `${bhkLabel(l.bedrooms, l.propertyType)} ${l.propertyType === 'apartment' ? 'Apartment' : l.propertyType.charAt(0).toUpperCase() + l.propertyType.slice(1)}` : l.title}
        </div>
        <div className="mt-0.5" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B6B6B' }}>
          {l.locality}, {l.city}
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm font-medium" style={{ color: '#111111', fontFamily: 'var(--font-body)' }}>
          View Property <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
