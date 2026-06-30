'use client';
import { X, Heart, MapPin, Bed, Bath, Square, Star, Phone, Share2 } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { formatPrice } from './types';
import type { Listing } from '@/lib/mock-data';
import { useEffect } from 'react';

type Props = {
  listing: Listing;
  isSaved: boolean;
  onClose: () => void;
  onSaveToggle: (id: string) => void;
};

export function GnModal({ listing: l, isSaved, onClose, onSaveToggle }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div
        className="relative bg-white w-full sm:rounded-3xl overflow-hidden"
        style={{ maxWidth: 780, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative" style={{ aspectRatio: '16/9', background: '#f4f5f7' }}>
          <ImageWithFallback src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />

          <button onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-105"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
            <X className="h-5 w-5" style={{ color: '#0f0f12' }} />
          </button>

          <div className="absolute bottom-4 left-4">
            <div className="px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-sm"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: '#0f0f12', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
              {formatPrice(l.price, l.priceType)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#0f0f12', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {l.title}
            </h2>
            <button
              onClick={() => onSaveToggle(l.id)}
              className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-transform hover:scale-105"
              style={{ background: isSaved ? '#fff0f0' : '#f4f5f7' }}
            >
              <Heart className="h-5 w-5" fill={isSaved ? '#FF5A5F' : 'none'} stroke={isSaved ? '#FF5A5F' : '#6b7280'} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 mb-6">
            <MapPin className="h-4 w-4" style={{ color: '#9ca3af' }} />
            <span style={{ fontFamily: 'var(--font-body)', color: '#6b7280', fontSize: 15 }}>{l.city}, {l.state}</span>
            <span className="mx-2" style={{ color: '#e5e7eb' }}>·</span>
            <Star className="h-4 w-4" style={{ color: '#f59e0b' }} fill="#f59e0b" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#374151' }}>{l.rating}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9ca3af' }}>({l.reviewCount} reviews)</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-5 rounded-2xl" style={{ background: '#f8fafc' }}>
            {[
              { Icon: Bed, val: l.bedrooms, label: 'Bedrooms' },
              { Icon: Bath, val: l.bathrooms, label: 'Bathrooms' },
              { Icon: Square, val: l.sqft.toLocaleString() + ' ft²', label: 'Area' },
            ].map(({ Icon, val, label }) => (
              <div key={label} className="text-center">
                <Icon className="h-5 w-5 mx-auto mb-2" style={{ color: '#0057FF' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#0f0f12' }}>{val}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="mb-8" style={{ fontFamily: 'var(--font-body)', color: '#4b5563', lineHeight: 1.7, fontSize: 15 }}>
            {l.description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={l.whatsapp ? `https://wa.me/${l.whatsapp}` : '#'}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold"
              style={{ background: '#0057FF', fontFamily: 'var(--font-body)', boxShadow: '0 4px 16px rgba(0,87,255,0.3)' }}
            >
              <Phone className="h-4 w-4" /> Contact Agent
            </a>
            <button
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border font-semibold text-sm"
              style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#374151', fontFamily: 'var(--font-body)' }}
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
