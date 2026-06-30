'use client';
import { Heart, MapPin, Bed, Bath, Square, Star } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { formatPrice } from './types';
import type { Listing } from '@/lib/mock-data';

type Props = {
  listing: Listing;
  isSaved: boolean;
  onCardClick: (l: Listing) => void;
  onSaveToggle: (id: string) => void;
};

export function GnCard({ listing: l, isSaved, onCardClick, onSaveToggle }: Props) {
  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
      onClick={() => onCardClick(l)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', background: '#f4f5f7' }}>
        <ImageWithFallback
          src={l.images[0]}
          alt={l.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: l.priceType === 'sale' ? '#0057FF' : '#10b981', fontFamily: 'var(--font-body)' }}>
            {l.priceType === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
          {l.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: '#FF5A5F', fontFamily: 'var(--font-body)' }}>
              Featured
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.stopPropagation(); onSaveToggle(l.id); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-110"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          <Heart className="h-4 w-4" fill={isSaved ? '#FF5A5F' : 'none'} stroke={isSaved ? '#FF5A5F' : '#6b7280'} />
        </button>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#0f0f12', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            {formatPrice(l.price, l.priceType)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold mb-1.5 line-clamp-1"
          style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: '#0f0f12', letterSpacing: '-0.01em' }}>
          {l.title}
        </h3>

        <div className="flex items-center gap-1.5 mb-4">
          <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: '#9ca3af' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#6b7280' }}>
            {l.city}, {l.state}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Bed className="h-3.5 w-3.5" style={{ color: '#9ca3af' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#374151' }}>{l.bedrooms} bd</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5" style={{ color: '#9ca3af' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#374151' }}>{l.bathrooms} ba</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Square className="h-3.5 w-3.5" style={{ color: '#9ca3af' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#374151' }}>{l.sqft.toLocaleString()} ft²</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} fill="#f59e0b" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#374151' }}>{l.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
