'use client';
import { SlidersHorizontal, LayoutGrid, Map } from 'lucide-react';
import type { FilterState } from './types';

type Props = {
  filters: FilterState;
  resultCount: number;
  viewMode: 'grid' | 'map';
  onFiltersChange: (f: FilterState) => void;
  onViewModeToggle: () => void;
};

export function GnFilterBar({ filters, resultCount, viewMode, onFiltersChange, onViewModeToggle }: Props) {
  const sel = (field: keyof FilterState) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onFiltersChange({ ...filters, [field]: e.target.value });

  const selectStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: '#374151',
    background: 'white',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: '8px 12px',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div className="sticky top-16 z-40 bg-white border-b" style={{ borderColor: 'rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div className="mx-auto px-8 lg:px-20 py-3 flex items-center gap-3 flex-wrap" style={{ maxWidth: 1440 }}>
        <div className="flex items-center gap-1.5 text-sm" style={{ fontFamily: 'var(--font-body)', color: '#9ca3af' }}>
          <SlidersHorizontal className="h-4 w-4" />
          <span>{resultCount} results</span>
        </div>

        <div className="h-4 w-px mx-1" style={{ background: 'rgba(0,0,0,0.1)' }} />

        <select style={selectStyle} value={filters.price} onChange={sel('price')}>
          <option value="">Any price</option>
          <option value="0-500k">Under $500K</option>
          <option value="500k-1m">$500K – $1M</option>
          <option value="1m-2m">$1M – $2M</option>
          <option value="2m+">$2M+</option>
        </select>

        <select style={selectStyle} value={filters.bedrooms} onChange={sel('bedrooms')}>
          <option value="">Any beds</option>
          <option value="1">1+ bed</option>
          <option value="2">2+ beds</option>
          <option value="3">3+ beds</option>
          <option value="4">4+ beds</option>
        </select>

        <select style={selectStyle} value={filters.propertyType} onChange={sel('propertyType')}>
          <option value="">Any type</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="villa">Villa</option>
        </select>

        <select style={selectStyle} value={filters.sortBy} onChange={sel('sortBy')}>
          <option value="">Sort by</option>
          <option value="Price: Low to High">Price: Low to High</option>
          <option value="Price: High to Low">Price: High to Low</option>
          <option value="Most Popular">Most Popular</option>
        </select>

        <div className="ml-auto flex items-center gap-1 p-1 rounded-xl" style={{ background: '#f4f5f7' }}>
          <button
            onClick={() => viewMode !== 'grid' && onViewModeToggle()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              fontFamily: 'var(--font-body)',
              background: viewMode === 'grid' ? 'white' : 'transparent',
              color: viewMode === 'grid' ? '#0057FF' : '#6b7280',
              boxShadow: viewMode === 'grid' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              fontWeight: viewMode === 'grid' ? 600 : 400,
            }}
          >
            <LayoutGrid className="h-4 w-4" /> Grid
          </button>
          <button
            onClick={() => viewMode !== 'map' && onViewModeToggle()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              fontFamily: 'var(--font-body)',
              background: viewMode === 'map' ? 'white' : 'transparent',
              color: viewMode === 'map' ? '#0057FF' : '#6b7280',
              boxShadow: viewMode === 'map' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              fontWeight: viewMode === 'map' ? 600 : 400,
            }}
          >
            <Map className="h-4 w-4" /> Map
          </button>
        </div>
      </div>
    </div>
  );
}
