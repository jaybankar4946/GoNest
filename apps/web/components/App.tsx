'use client';
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Search, Heart, MapPin, Bed, Bath, Square, Star,
  ArrowRight, Home, Building2, Award, Shield, TrendingUp,
  User, Plus, Check, Clock, Eye, BarChart2, FileText,
  Trash2, ExternalLink, ChevronLeft,
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './ui/select';
import { mockListings } from '@/lib/mock-data';
import type { Listing } from '@/lib/mock-data';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GnHeader } from './gn/GnHeader';
import { GnCard } from './gn/GnCard';
import { GnFilterBar } from './gn/GnFilterBar';
import { GnModal } from './gn/GnModal';
import { formatPrice } from './gn/types';
import type { ViewMode, ListingTab, FilterState } from './gn/types';

// ─── Logo (shared) ─────────────────────────────────────────────────────────────
function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0057FF" />
      <path d="M16 6L6 14v12h7v-7h6v7h7V14L16 6z" fill="white" />
      <circle cx="16" cy="13" r="2.5" fill="#FF5A5F" />
    </svg>
  );
}

// ─── Hero Search ───────────────────────────────────────────────────────────────
function HeroSearch({ onSearch }: { onSearch: (tab: ListingTab, loc: string) => void }) {
  const [tab, setTab] = useState<ListingTab>('buy');
  const [loc, setLoc] = useState('');
  const [price, setPrice] = useState('');
  const [ptype, setPtype] = useState('');
  const cities = ['New York', 'Los Angeles', 'Miami', 'Austin', 'San Francisco'];

  return (
    <section className="relative flex flex-col items-center justify-center"
      style={{ minHeight: 440, background: 'linear-gradient(160deg, #f8faff 0%, #eef3ff 50%, #fff0f0 100%)' }}>
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #0057FF 0%, transparent 70%)' }} />
      <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #FF5A5F 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full px-6 text-center" style={{ maxWidth: 860 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-medium"
            style={{ background: 'rgba(0,87,255,0.08)', color: '#0057FF', fontFamily: 'var(--font-body)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#0057FF' }} />
            10,000+ verified listings across 500 cities
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 40, color: '#0f0f12' }}>
            Find your perfect home,{' '}
            <span style={{ color: '#0057FF' }}>faster than ever</span>
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="flex items-center justify-center gap-6 mb-6">
          {(['buy', 'rent', 'resale'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="relative pb-2 text-base capitalize"
              style={{ fontFamily: 'var(--font-body)', fontWeight: tab === t ? 600 : 400, color: tab === t ? '#0057FF' : '#9ca3af' }}>
              {t}
              {tab === t && (
                <motion.div layoutId="hero-tab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: '#0057FF' }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
            </button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="flex items-center bg-white rounded-full p-2 gap-1"
          style={{ boxShadow: '0 4px 24px rgba(0,87,255,0.12), 0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,87,255,0.1)' }}>

          <div className="flex-1 flex items-center gap-2 px-4">
            <MapPin className="h-4 w-4 shrink-0" style={{ color: '#0057FF' }} />
            <input type="text" placeholder="City, neighborhood, ZIP..."
              value={loc} onChange={(e) => setLoc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch(tab, loc)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ fontFamily: 'var(--font-body)', color: '#0f0f12' }} />
          </div>

          <div className="h-8 w-px" style={{ background: 'rgba(0,0,0,0.1)' }} />

          <div className="flex items-center px-3" style={{ minWidth: 150 }}>
            <Select value={price} onValueChange={setPrice}>
              <SelectTrigger className="border-0 shadow-none p-0 h-auto focus:ring-0 text-sm"
                style={{ fontFamily: 'var(--font-body)' }}>
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any price</SelectItem>
                <SelectItem value="0-500k">Under $500K</SelectItem>
                <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                <SelectItem value="1m+">$1M+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-8 w-px" style={{ background: 'rgba(0,0,0,0.1)' }} />

          <div className="flex items-center px-3" style={{ minWidth: 160 }}>
            <Select value={ptype} onValueChange={setPtype}>
              <SelectTrigger className="border-0 shadow-none p-0 h-auto focus:ring-0 text-sm"
                style={{ fontFamily: 'var(--font-body)' }}>
                <SelectValue placeholder="Property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any type</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button onClick={() => onSearch(tab, loc)}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-semibold"
            style={{ background: '#0057FF', fontFamily: 'var(--font-body)', boxShadow: '0 4px 12px rgba(0,87,255,0.35)' }}>
            <Search className="h-4 w-4" /> Search
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-2 mt-5 flex-wrap">
          <span className="text-xs" style={{ color: '#9ca3af', fontFamily: 'var(--font-body)' }}>Popular:</span>
          {cities.map((c) => (
            <button key={c} onClick={() => onSearch(tab, c)}
              className="text-xs px-3 py-1 rounded-full border hover:border-blue-300 hover:bg-blue-50 transition-colors"
              style={{ borderColor: 'rgba(0,0,0,0.1)', color: '#374151', fontFamily: 'var(--font-body)' }}>
              {c}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Map Placeholder ───────────────────────────────────────────────────────────
function MapView({ listings, selectedId, onSelect }: {
  listings: Listing[];
  selectedId: string | null;
  onSelect: (l: Listing) => void;
}) {
  const pins = [
    { x: '25%', y: '30%' }, { x: '55%', y: '20%' }, { x: '70%', y: '45%' },
    { x: '35%', y: '60%' }, { x: '15%', y: '55%' }, { x: '80%', y: '65%' },
    { x: '45%', y: '78%' }, { x: '60%', y: '70%' },
  ];
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 50%, #e8f0fe 100%)' }}>
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="gn-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0057FF" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gn-grid)" />
      </svg>
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 800 600">
        <line x1="0" y1="200" x2="800" y2="200" stroke="#94a3b8" strokeWidth="3" />
        <line x1="0" y1="350" x2="800" y2="350" stroke="#94a3b8" strokeWidth="5" />
        <line x1="200" y1="0" x2="200" y2="600" stroke="#94a3b8" strokeWidth="3" />
        <line x1="500" y1="0" x2="500" y2="600" stroke="#94a3b8" strokeWidth="5" />
        <rect x="220" y="60" width="260" height="120" rx="8" fill="#c7d7f0" opacity="0.6" />
        <rect x="540" y="220" width="160" height="100" rx="8" fill="#c7d7f0" opacity="0.6" />
        <rect x="40" y="220" width="140" height="80" rx="8" fill="#c7d7f0" opacity="0.6" />
        <rect x="230" y="380" width="220" height="100" rx="8" fill="#c7d7f0" opacity="0.6" />
      </svg>
      {listings.slice(0, 8).map((l, i) => {
        const pos = pins[i] || { x: '50%', y: '50%' };
        const sel = l.id === selectedId;
        return (
          <button key={l.id} onClick={() => onSelect(l)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: pos.x, top: pos.y }}>
            <div className="px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap"
              style={{
                fontFamily: 'var(--font-display)',
                background: sel ? '#0f0f12' : 'white',
                color: sel ? 'white' : '#0f0f12',
                boxShadow: sel ? '0 4px 16px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.15)',
                transform: sel ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.15s',
              }}>
              {formatPrice(l.price, l.priceType)}
            </div>
          </button>
        );
      })}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl text-xs"
        style={{ color: '#6b7280', fontFamily: 'var(--font-body)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <MapPin className="h-3.5 w-3.5 inline mr-1" style={{ color: '#0057FF' }} /> Map view
      </div>
    </div>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ listings, savedIds, onSearch, onCardClick, onSaveToggle }: {
  listings: Listing[];
  savedIds: Set<string>;
  onSearch: (tab: ListingTab, loc: string) => void;
  onCardClick: (l: Listing) => void;
  onSaveToggle: (id: string) => void;
}) {
  const featured = listings.filter((l) => l.featured).slice(0, 6);
  return (
    <div className="min-h-screen bg-white">
      <HeroSearch onSearch={onSearch} />

      {/* Stats */}
      <section className="border-y" style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#f8fafc' }}>
        <div className="mx-auto px-8 lg:px-20 py-10" style={{ maxWidth: 1440 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { Icon: Home, val: '10,000+', label: 'Active Listings', color: '#0057FF' },
              { Icon: Building2, val: '500+', label: 'Cities Covered', color: '#FF5A5F' },
              { Icon: Award, val: '50,000+', label: 'Happy Customers', color: '#10b981' },
              { Icon: Shield, val: '2,000+', label: 'Verified Agents', color: '#f59e0b' },
            ].map(({ Icon, val, label, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: color + '14' }}>
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#0f0f12', lineHeight: 1 }}>{val}</div>
                  <div className="text-sm mt-0.5" style={{ fontFamily: 'var(--font-body)', color: '#6b7280' }}>{label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto px-8 lg:px-20" style={{ maxWidth: 1440 }}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-sm font-semibold mb-2" style={{ color: '#0057FF', fontFamily: 'var(--font-body)' }}>HAND-PICKED</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: '#0f0f12', letterSpacing: '-0.02em' }}>
                Featured Properties
              </h2>
            </div>
            <button onClick={() => onSearch('premium', '')}
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: '#0057FF', fontFamily: 'var(--font-body)' }}>
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <GnCard listing={l} isSaved={savedIds.has(l.id)} onCardClick={onCardClick} onSaveToggle={onSaveToggle} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why GoNest */}
      <section className="py-16 lg:py-24" style={{ background: '#f8fafc' }}>
        <div className="mx-auto px-8 lg:px-20" style={{ maxWidth: 1440 }}>
          <div className="text-center mb-14">
            <div className="text-sm font-semibold mb-2" style={{ color: '#0057FF', fontFamily: 'var(--font-body)' }}>WHY GONEST</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: '#0f0f12', letterSpacing: '-0.02em' }}>
              The smarter way to find a home
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { Icon: Search, title: 'Smart Search', desc: 'Advanced filters and AI-powered recommendations to find exactly what you need.', color: '#0057FF' },
              { Icon: Shield, title: 'Verified Listings', desc: 'Every property is verified by our team. No fake listings, no wasted viewings.', color: '#FF5A5F' },
              { Icon: TrendingUp, title: 'Market Insights', desc: 'Live pricing data and neighborhood trends to help you decide confidently.', color: '#10b981' },
            ].map(({ Icon, title, desc, color }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl hover:shadow-lg transition-shadow"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: color + '12' }}>
                  <Icon className="h-7 w-7" style={{ color }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#0f0f12', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', color: '#6b7280', lineHeight: 1.65, fontSize: 15 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto px-8 lg:px-20" style={{ maxWidth: 1440 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl px-12 lg:px-20 py-16 text-center text-white"
            style={{ background: 'linear-gradient(135deg, #0057FF 0%, #003fd4 60%, #1a1a2e 100%)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Ready to find your dream home?
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', opacity: 0.85, fontSize: 17, marginBottom: 32 }}>
              Join 50,000+ customers who found their perfect property with GoNest.
            </p>
            <button onClick={() => onSearch('buy', '')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base bg-white hover:scale-105 transition-transform"
              style={{ color: '#0057FF', fontFamily: 'var(--font-body)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
              Browse Properties <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t py-10" style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#f8fafc' }}>
        <div className="mx-auto px-8 lg:px-20" style={{ maxWidth: 1440 }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size={28} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>
                <span style={{ color: '#0057FF' }}>Go</span><span style={{ color: '#FF5A5F' }}>Nest</span>
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9ca3af' }}>
              &copy; 2026 GoNest Inc. Premium Real Estate Marketplace.
            </p>
            <div className="flex gap-5">
              {['Privacy', 'Terms', 'Contact'].map((l) => (
                <a key={l} href="#" className="text-sm hover:underline" style={{ fontFamily: 'var(--font-body)', color: '#6b7280' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Search Results ────────────────────────────────────────────────────────────
function SearchPage({ listings, activeTab, savedIds, onCardClick, onSaveToggle }: {
  listings: Listing[];
  activeTab: ListingTab;
  savedIds: Set<string>;
  onCardClick: (l: Listing) => void;
  onSaveToggle: (id: string) => void;
}) {
  const [filters, setFilters] = useState<FilterState>({ price: '', bedrooms: '', propertyType: '', sortBy: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [mapSel, setMapSel] = useState<string | null>(null);

  const filtered = listings.filter((l) => {
    if (activeTab === 'buy' && l.priceType !== 'sale') return false;
    if (activeTab === 'rent' && l.priceType !== 'rent') return false;
    if (activeTab === 'premium' && !l.featured) return false;
    if (filters.bedrooms && l.bedrooms < parseInt(filters.bedrooms)) return false;
    if (filters.propertyType && l.propertyType !== filters.propertyType) return false;
    if (filters.price === '0-500k' && l.price > 500000) return false;
    if (filters.price === '500k-1m' && (l.price < 500000 || l.price > 1000000)) return false;
    if (filters.price === '1m-2m' && (l.price < 1000000 || l.price > 2000000)) return false;
    if (filters.price === '2m+' && l.price < 2000000) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'Price: Low to High') return a.price - b.price;
    if (filters.sortBy === 'Price: High to Low') return b.price - a.price;
    if (filters.sortBy === 'Most Popular') return b.reviewCount - a.reviewCount;
    return 0;
  });

  const tabLabel = activeTab === 'buy' ? 'Homes for Sale' : activeTab === 'rent' ? 'Homes for Rent' : activeTab === 'premium' ? 'Premium Properties' : 'Resale Listings';

  return (
    <div className="min-h-screen bg-white">
      <GnFilterBar filters={filters} resultCount={filtered.length} viewMode={viewMode}
        onFiltersChange={setFilters} onViewModeToggle={() => setViewMode((v) => v === 'grid' ? 'map' : 'grid')} />

      {viewMode === 'map' ? (
        <div className="flex" style={{ height: 'calc(100vh - 136px)' }}>
          <div className="w-2/5 overflow-y-auto border-r p-4 space-y-3" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            {filtered.map((l) => (
              <div key={l.id}
                className="flex gap-3 p-3 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: mapSel === l.id ? '#f0f4ff' : 'white',
                  border: '1px solid ' + (mapSel === l.id ? '#0057FF' : 'rgba(0,0,0,0.07)'),
                  boxShadow: mapSel === l.id ? '0 0 0 2px rgba(0,87,255,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
                onClick={() => { setMapSel(l.id); onCardClick(l); }}
                onMouseEnter={() => setMapSel(l.id)}
                onMouseLeave={() => setMapSel(null)}>
                <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <ImageWithFallback src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm line-clamp-1" style={{ fontFamily: 'var(--font-display)', color: '#0f0f12' }}>{l.title}</div>
                  <div className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-body)', color: '#9ca3af' }}>{l.city}, {l.state}</div>
                  <div className="font-bold text-sm mt-1" style={{ fontFamily: 'var(--font-display)', color: '#0057FF' }}>{formatPrice(l.price, l.priceType)}</div>
                  <div className="text-xs" style={{ fontFamily: 'var(--font-body)', color: '#9ca3af' }}>{l.bedrooms} bd &middot; {l.bathrooms} ba</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 p-4">
            <MapView listings={filtered} selectedId={mapSel}
              onSelect={(l) => { setMapSel(l.id); onCardClick(l); }} />
          </div>
        </div>
      ) : (
        <div className="mx-auto px-8 lg:px-20 py-8" style={{ maxWidth: 1440 }}>
          <div className="mb-6">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#0f0f12' }}>{tabLabel}</h1>
            <p className="mt-1" style={{ fontFamily: 'var(--font-body)', color: '#9ca3af', fontSize: 14 }}>
              {filtered.length} {filtered.length === 1 ? 'property' : 'properties'} found
            </p>
          </div>
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((l) => (
                <GnCard key={l.id} listing={l} isSaved={savedIds.has(l.id)} onCardClick={onCardClick} onSaveToggle={onSaveToggle} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: '#f0f4ff' }}>
                <Search className="h-9 w-9" style={{ color: '#0057FF' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#0f0f12', marginBottom: 8 }}>No properties found</h2>
              <p style={{ fontFamily: 'var(--font-body)', color: '#9ca3af' }}>Try adjusting your filters.</p>
              <button onClick={() => setFilters({ price: '', bedrooms: '', propertyType: '', sortBy: '' })}
                className="mt-6 px-5 py-2.5 rounded-xl border text-sm font-medium"
                style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#374151', fontFamily: 'var(--font-body)' }}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Saved Page ────────────────────────────────────────────────────────────────
function SavedPage({ listings, savedIds, onCardClick, onRemove }: {
  listings: Listing[];
  savedIds: Set<string>;
  onCardClick: (l: Listing) => void;
  onRemove: (id: string) => void;
}) {
  const saved = listings.filter((l) => savedIds.has(l.id));
  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <div className="mx-auto px-8 lg:px-20 py-10" style={{ maxWidth: 1440 }}>
        <div className="mb-8">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#0f0f12', letterSpacing: '-0.02em' }}>Saved Homes</h1>
          <p className="mt-1" style={{ fontFamily: 'var(--font-body)', color: '#6b7280' }}>{saved.length} {saved.length === 1 ? 'property' : 'properties'} saved</p>
        </div>
        {saved.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: '#f0f4ff' }}>
              <Heart className="h-9 w-9" style={{ color: '#0057FF' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#0f0f12', marginBottom: 8 }}>No saved homes yet</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: '#9ca3af' }}>Click the heart icon on any listing to save it here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {saved.map((l) => (
              <div key={l.id} className="relative group">
                <div className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} onClick={() => onCardClick(l)}>
                  <div className="relative" style={{ aspectRatio: '4/3', background: '#f4f5f7' }}>
                    <ImageWithFallback src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1 rounded-xl"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
                      {formatPrice(l.price, l.priceType)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-1 mb-1"
                      style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: '#0f0f12' }}>{l.title}</h3>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" style={{ color: '#9ca3af' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#6b7280' }}>{l.city}, {l.state}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'rgba(0,0,0,0.06)', fontFamily: 'var(--font-body)', color: '#9ca3af' }}>
                      {l.bedrooms} bd &middot; {l.bathrooms} ba &middot; {l.sqft.toLocaleString()} ft²
                    </div>
                  </div>
                </div>
                <button onClick={() => onRemove(l.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" style={{ color: '#ef4444' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Agent Dashboard ───────────────────────────────────────────────────────────
function DashboardPage({ listings }: { listings: Listing[] }) {
  const stats = [
    { label: 'Active Listings', value: '12', delta: '+2 this month', Icon: Home, color: '#0057FF' },
    { label: 'Total Views', value: '3,847', delta: '+18% vs last month', Icon: Eye, color: '#10b981' },
    { label: 'Leads Received', value: '64', delta: '+9 this week', Icon: FileText, color: '#f59e0b' },
    { label: 'Avg. Days Listed', value: '23', delta: '-4 from avg', Icon: Clock, color: '#8b5cf6' },
  ];
  const leads = [
    { name: 'James Wilson', prop: 'Modern Luxury Villa', time: '2 hrs ago', status: 'New' },
    { name: 'Priya Nair', prop: 'Luxury Penthouse', time: '5 hrs ago', status: 'Responded' },
    { name: 'Marcus Lee', prop: 'Mountain View Estate', time: '1 day ago', status: 'Closed' },
    { name: 'Aisha Rahman', prop: 'Beachfront Retreat', time: '2 days ago', status: 'Pending' },
  ];
  const statusColor: Record<string, string> = { New: '#0057FF', Responded: '#10b981', Closed: '#6b7280', Pending: '#f59e0b' };

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <div className="mx-auto px-8 lg:px-20 py-10" style={{ maxWidth: 1440 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: '#0f0f12', letterSpacing: '-0.02em' }}>Agent Dashboard</h1>
            <p className="mt-1" style={{ fontFamily: 'var(--font-body)', color: '#6b7280' }}>Welcome back, John.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: '#0057FF', fontFamily: 'var(--font-body)', boxShadow: '0 4px 12px rgba(0,87,255,0.3)' }}>
            <Plus className="h-4 w-4" /> Add Listing
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, delta, Icon, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#6b7280' }}>{label}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '14' }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#0f0f12', lineHeight: 1 }}>{value}</div>
              <div className="mt-1.5 text-xs" style={{ fontFamily: 'var(--font-body)', color: '#10b981' }}>{delta}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#0f0f12' }}>My Listings</h2>
            </div>
            {listings.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 border-b transition-colors"
                style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <ImageWithFallback src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold line-clamp-1 text-sm" style={{ fontFamily: 'var(--font-display)', color: '#0f0f12' }}>{l.title}</div>
                  <div className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-body)', color: '#9ca3af' }}>{l.city}, {l.state}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)', color: '#0057FF' }}>{formatPrice(l.price, l.priceType)}</div>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
                    <span className="text-xs" style={{ color: '#10b981', fontFamily: 'var(--font-body)' }}>Active</span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-2" />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#0f0f12' }}>Recent Leads</h2>
            </div>
            {leads.map((lead) => (
              <div key={lead.name} className="px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)', color: '#0f0f12' }}>{lead.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: statusColor[lead.status] + '14', color: statusColor[lead.status], fontFamily: 'var(--font-body)' }}>
                    {lead.status}
                  </span>
                </div>
                <div className="text-xs line-clamp-1" style={{ fontFamily: 'var(--font-body)', color: '#6b7280' }}>{lead.prop}</div>
                <div className="text-xs mt-1" style={{ color: '#9ca3af', fontFamily: 'var(--font-body)' }}>{lead.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel ───────────────────────────────────────────────────────────────
function AdminPage({ listings }: { listings: Listing[] }) {
  const [section, setSection] = useState<'listings' | 'users' | 'analytics'>('listings');
  const users = [
    { name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Agent', status: 'Active' },
    { name: 'Michael Chen', email: 'michael@example.com', role: 'Buyer', status: 'Active' },
    { name: 'Emma Rodriguez', email: 'emma@example.com', role: 'Agent', status: 'Verified' },
    { name: 'David Park', email: 'david@example.com', role: 'Agent', status: 'Pending' },
  ];
  const navs = [
    { id: 'listings' as const, label: 'Listings', Icon: Home },
    { id: 'users' as const, label: 'Users', Icon: User },
    { id: 'analytics' as const, label: 'Analytics', Icon: BarChart2 },
  ];
  const statusBg: Record<string, string> = { Active: '#f0fdf4', Verified: '#f0f4ff', Pending: '#fffbeb' };
  const statusFg: Record<string, string> = { Active: '#16a34a', Verified: '#0057FF', Pending: '#d97706' };

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      <aside className="w-60 bg-white border-r hidden md:block" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>
              <span style={{ color: '#0057FF' }}>Go</span><span style={{ color: '#FF5A5F' }}>Nest</span>
              <span style={{ color: '#9ca3af', fontWeight: 500, fontSize: 12 }}> Admin</span>
            </span>
          </div>
        </div>
        <nav className="p-3">
          {navs.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setSection(id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left mb-1"
              style={{ fontFamily: 'var(--font-body)', background: section === id ? '#f0f4ff' : 'transparent', color: section === id ? '#0057FF' : '#6b7280' }}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#0f0f12' }}>
            {navs.find((n) => n.id === section)?.label}
          </h1>
        </div>

        {section === 'listings' && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  {['Property', 'Location', 'Price', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-6 py-4"
                      style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: '#6b7280', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l, i) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: i < listings.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                          <ImageWithFallback src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold line-clamp-1"
                          style={{ fontFamily: 'var(--font-display)', color: '#0f0f12', maxWidth: 160 }}>{l.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4" style={{ fontFamily: 'var(--font-body)', color: '#6b7280' }}>{l.city}, {l.state}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold" style={{ fontFamily: 'var(--font-display)', color: '#0057FF' }}>{formatPrice(l.price, l.priceType)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#f0fdf4', color: '#16a34a', fontFamily: 'var(--font-body)' }}>Active</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                          style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#374151', fontFamily: 'var(--font-body)' }}>Edit</button>
                        <button className="text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-red-50"
                          style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444', fontFamily: 'var(--font-body)' }}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section === 'users' && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  {['User', 'Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-6 py-4"
                      style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: '#6b7280', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.email} className="hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: i < users.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs text-white" style={{ background: '#0057FF', fontSize: 11 }}>
                            {u.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#0f0f12', fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontFamily: 'var(--font-body)', color: '#9ca3af', fontSize: 12 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#f4f5f7', color: '#374151', fontFamily: 'var(--font-body)' }}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: statusBg[u.status] || '#f4f5f7', color: statusFg[u.status] || '#374151', fontFamily: 'var(--font-body)' }}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                        style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#374151', fontFamily: 'var(--font-body)' }}>Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section === 'analytics' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {[
              { label: 'Total Listings', value: '10,284', change: '+12% MoM' },
              { label: 'Monthly Visitors', value: '124,500', change: '+8% MoM' },
              { label: 'Lead Submissions', value: '3,842', change: '+22% MoM' },
              { label: 'Avg. Response Time', value: '4.2 hrs', change: '-0.8 hrs' },
            ].map(({ label, value, change }) => (
              <div key={label} className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: '#0f0f12', lineHeight: 1 }}>{value}</div>
                <div className="mt-2 text-sm font-medium" style={{ color: '#10b981', fontFamily: 'var(--font-body)' }}>{change}</div>
                <div className="flex items-end gap-1.5 mt-4" style={{ height: 48 }}>
                  {[0.4, 0.6, 0.5, 0.8, 0.65, 0.9, 1].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t"
                      style={{ height: (h * 100) + '%', background: 'rgba(0,87,255,' + (0.15 + h * 0.35) + ')' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<ViewMode>('home');
  const [activeTab, setActiveTab] = useState<ListingTab>('buy');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(['1', '3']));
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const handleTabChange = useCallback((tab: ListingTab) => {
    setActiveTab(tab);
    setView('search');
  }, []);

  const handleSearch = useCallback((tab: ListingTab, _loc: string) => {
    setActiveTab(tab);
    setView('search');
  }, []);

  const handleSaveToggle = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleViewChange = useCallback((v: ViewMode) => {
    setView(v);
    setSelectedListing(null);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {view === 'admin' ? (
        <div className="flex items-center gap-4 px-6 py-4 border-b bg-white"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <button onClick={() => setView('home')}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: '#6b7280', fontFamily: 'var(--font-body)' }}>
            <ChevronLeft className="h-4 w-4" /> Back to site
          </button>
        </div>
      ) : (
        <GnHeader currentView={view} activeTab={activeTab} savedCount={savedIds.size}
          onTabChange={handleTabChange} onViewChange={handleViewChange} />
      )}

      {view === 'home' && (
        <HomePage listings={mockListings} savedIds={savedIds}
          onSearch={handleSearch} onCardClick={setSelectedListing} onSaveToggle={handleSaveToggle} />
      )}
      {view === 'search' && (
        <SearchPage listings={mockListings} activeTab={activeTab} savedIds={savedIds}
          onCardClick={setSelectedListing} onSaveToggle={handleSaveToggle} />
      )}
      {view === 'saved' && (
        <SavedPage listings={mockListings} savedIds={savedIds}
          onCardClick={setSelectedListing} onRemove={handleSaveToggle} />
      )}
      {view === 'dashboard' && <DashboardPage listings={mockListings} />}
      {view === 'admin' && <AdminPage listings={mockListings} />}

      {selectedListing && (
        <GnModal listing={selectedListing} isSaved={savedIds.has(selectedListing.id)}
          onClose={() => setSelectedListing(null)} onSaveToggle={handleSaveToggle} />
      )}
    </div>
  );
}
