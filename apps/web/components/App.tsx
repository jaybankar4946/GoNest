'use client';
import { useState, useCallback, useMemo } from 'react';
import { Search, Heart, ArrowRight, Shield, Tag, BadgeCheck, X } from 'lucide-react';
import { mockListings, popularCities, categories } from '@/lib/mock-data';
import type { Listing } from '@/lib/mock-data';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GnHeader } from './gn/GnHeader';
import { GnCard } from './gn/GnCard';
import { GnAuth } from './gn/GnAuth';
import { useAuth } from './gn/AuthContext';
import { formatPrice, bhkLabel } from './gn/types';
import type { ViewMode, ListingTab, FilterState } from './gn/types';

const tabLabels: Record<ListingTab, string> = {
  buy: 'Buy', rent: 'Rent', resale: 'Resale', 'new-projects': 'New Projects',
};

// ─── Hero + Search (minimal) ────────────────────────────────────────────────
function Hero({ activeTab, onTabChange, onSearch }: {
  activeTab: ListingTab;
  onTabChange: (t: ListingTab) => void;
  onSearch: (loc: string) => void;
}) {
  const [loc, setLoc] = useState('');
  const tabs: ListingTab[] = ['buy', 'rent', 'resale', 'new-projects'];

  return (
    <section className="px-6" style={{ paddingTop: 80, paddingBottom: 60 }}>
      <div className="mx-auto text-center" style={{ maxWidth: 640 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#111111', marginBottom: 10 }}>
          Find your next home.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: '#6B6B6B', marginBottom: 32 }}>
          Search by city, locality or project.
        </p>

        <div className="flex items-center gap-2 rounded-full p-1.5"
          style={{ border: '1px solid #E5E5E5' }}>
          <Search className="h-4 w-4 ml-3 shrink-0" style={{ color: '#9B9B9B' }} />
          <input
            type="text"
            placeholder="Search city, locality or project"
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(loc)}
            className="flex-1 bg-transparent outline-none text-sm py-2.5"
            style={{ fontFamily: 'var(--font-body)', color: '#111111' }}
          />
          <button onClick={() => onSearch(loc)}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white shrink-0"
            style={{ background: '#111111', fontFamily: 'var(--font-body)' }}>
            Search
          </button>
        </div>

        <div className="flex items-center justify-center gap-1 mt-5 flex-wrap">
          {tabs.map((t) => (
            <button key={t} onClick={() => onTabChange(t)}
              className="px-4 py-1.5 rounded-full text-sm transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: activeTab === t ? 600 : 400,
                color: activeTab === t ? '#111111' : '#6B6B6B',
                background: activeTab === t ? '#F7F7F7' : 'transparent',
              }}>
              {tabLabels[t]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Popular Locations ──────────────────────────────────────────────────────
function PopularLocations({ onSelect }: { onSelect: (city: string) => void }) {
  return (
    <section className="px-6 lg:px-10" style={{ paddingTop: 8, paddingBottom: 56 }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#6B6B6B', letterSpacing: '0.04em', marginBottom: 16, textTransform: 'uppercase' }}>
          Popular Searches
        </h2>
        <div className="flex flex-wrap gap-2">
          {popularCities.map((c) => (
            <button key={c} onClick={() => onSelect(c)}
              className="px-4 py-2 rounded-full text-sm"
              style={{ border: '1px solid #E5E5E5', color: '#111111', fontFamily: 'var(--font-body)' }}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured ────────────────────────────────────────────────────────────────
function Featured({ listings, savedIds, onCardClick, onSaveToggle, onViewAll }: {
  listings: Listing[];
  savedIds: Set<string>;
  onCardClick: (l: Listing) => void;
  onSaveToggle: (id: string) => void;
  onViewAll: () => void;
}) {
  const featured = listings.filter((l) => l.featured).slice(0, 3);
  return (
    <section className="px-6 lg:px-10" style={{ paddingTop: 8, paddingBottom: 64 }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <div className="flex items-end justify-between mb-7">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#111111', letterSpacing: '-0.02em' }}>
            Featured Properties
          </h2>
          <button onClick={onViewAll} className="hidden sm:flex items-center gap-1.5 text-sm font-medium"
            style={{ color: '#111111', fontFamily: 'var(--font-body)' }}>
            View all <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {featured.map((l) => (
            <GnCard key={l.id} listing={l} isSaved={savedIds.has(l.id)} onCardClick={onCardClick} onSaveToggle={onSaveToggle} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Categories ──────────────────────────────────────────────────────────────
function Categories({ onSelect }: { onSelect: (type: string) => void }) {
  return (
    <section className="px-6 lg:px-10" style={{ paddingTop: 8, paddingBottom: 64, background: '#F7F7F7' }}>
      <div className="mx-auto py-12" style={{ maxWidth: 1200 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#111111', letterSpacing: '-0.02em', marginBottom: 28 }}>
          Explore by Category
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <button key={c.type} onClick={() => onSelect(c.type)}
              className="bg-white rounded-2xl p-6 text-left transition-transform hover:-translate-y-0.5"
              style={{ border: '1px solid #E5E5E5' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: '#111111' }}>{c.label}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why GoNest ──────────────────────────────────────────────────────────────
function WhyGoNest() {
  const reasons = [
    { Icon: BadgeCheck, title: 'Verified Listings', desc: 'Every listing is checked.' },
    { Icon: Tag, title: 'Transparent Pricing', desc: 'No hidden surprises.' },
    { Icon: Shield, title: 'Trusted Professionals', desc: 'Verified owners and agents.' },
  ];
  return (
    <section className="px-6 lg:px-10" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#111111', letterSpacing: '-0.02em', marginBottom: 28 }}>
          Why GoNest
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {reasons.map(({ Icon, title, desc }) => (
            <div key={title}>
              <Icon className="h-5 w-5 mb-3" style={{ color: '#111111' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: '#111111', marginBottom: 4 }}>{title}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B6B6B' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="px-6 lg:px-10 border-t" style={{ borderColor: '#E5E5E5', paddingTop: 40, paddingBottom: 40 }}>
      <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-6" style={{ maxWidth: 1200 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#111111' }}>GoNest</span>
        <div className="flex gap-6 flex-wrap justify-center">
          {['Buy', 'Rent', 'Resale', 'New Projects', 'Privacy', 'Terms', 'Contact'].map((l) => (
            <a key={l} href="#" className="text-sm" style={{ fontFamily: 'var(--font-body)', color: '#6B6B6B' }}>{l}</a>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9B9B9B' }}>&copy; 2026 GoNest</span>
      </div>
    </footer>
  );
}

// ─── Home Page ───────────────────────────────────────────────────────────────
function HomePage({ listings, savedIds, activeTab, onTabChange, onSearch, onCardClick, onSaveToggle, onViewAll }: {
  listings: Listing[];
  savedIds: Set<string>;
  activeTab: ListingTab;
  onTabChange: (t: ListingTab) => void;
  onSearch: (loc: string) => void;
  onCardClick: (l: Listing) => void;
  onSaveToggle: (id: string) => void;
  onViewAll: () => void;
}) {
  return (
    <div className="bg-white">
      <Hero activeTab={activeTab} onTabChange={onTabChange} onSearch={onSearch} />
      <PopularLocations onSelect={onSearch} />
      <Featured listings={listings} savedIds={savedIds} onCardClick={onCardClick} onSaveToggle={onSaveToggle} onViewAll={onViewAll} />
      <Categories onSelect={() => onViewAll()} />
      <WhyGoNest />
      <Footer />
    </div>
  );
}

// ─── Search / Results Page ──────────────────────────────────────────────────
function SearchPage({ listings, activeTab, query, savedIds, onCardClick, onSaveToggle }: {
  listings: Listing[];
  activeTab: ListingTab;
  query: string;
  savedIds: Set<string>;
  onCardClick: (l: Listing) => void;
  onSaveToggle: (id: string) => void;
}) {
  const [filters, setFilters] = useState<FilterState>({ price: '', bedrooms: '', propertyType: '', sortBy: '' });
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (activeTab === 'buy' && l.priceType !== 'sale') return false;
      if (activeTab === 'rent' && l.priceType !== 'rent') return false;
      if (query && !`${l.city} ${l.locality} ${l.title}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (filters.propertyType && l.propertyType !== filters.propertyType) return false;
      if (filters.bedrooms && l.bedrooms < parseInt(filters.bedrooms)) return false;
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'low') return a.price - b.price;
      if (filters.sortBy === 'high') return b.price - a.price;
      return 0;
    });
  }, [listings, activeTab, query, filters]);

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 lg:px-10 py-6 border-b" style={{ borderColor: '#E5E5E5' }}>
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1200 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#111111' }}>
              {tabLabels[activeTab]}{query ? ` in ${query}` : ''}
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9B9B9B', marginTop: 2 }}>
              {filtered.length} {filtered.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{ border: '1px solid #111111', color: '#111111', fontFamily: 'var(--font-body)' }}>
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mx-auto mt-4 flex gap-2 flex-wrap" style={{ maxWidth: 1200 }}>
            <select value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              className="px-3 py-2 rounded-full text-sm" style={{ border: '1px solid #E5E5E5', fontFamily: 'var(--font-body)' }}>
              <option value="">Any type</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="house">House</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
            <select value={filters.bedrooms} onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              className="px-3 py-2 rounded-full text-sm" style={{ border: '1px solid #E5E5E5', fontFamily: 'var(--font-body)' }}>
              <option value="">Any BHK</option>
              <option value="1">1+ BHK</option>
              <option value="2">2+ BHK</option>
              <option value="3">3+ BHK</option>
              <option value="4">4+ BHK</option>
            </select>
            <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-3 py-2 rounded-full text-sm" style={{ border: '1px solid #E5E5E5', fontFamily: 'var(--font-body)' }}>
              <option value="">Sort by</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>

      <div className="px-6 lg:px-10 py-10">
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {filtered.map((l) => (
                <GnCard key={l.id} listing={l} isSaved={savedIds.has(l.id)} onCardClick={onCardClick} onSaveToggle={onSaveToggle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: '#111111', marginBottom: 6 }}>No properties found</h2>
              <p style={{ fontFamily: 'var(--font-body)', color: '#9B9B9B', fontSize: 14 }}>Try a different search or adjust filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Saved Page ──────────────────────────────────────────────────────────────
function SavedPage({ listings, savedIds, onCardClick, onRemove }: {
  listings: Listing[];
  savedIds: Set<string>;
  onCardClick: (l: Listing) => void;
  onRemove: (id: string) => void;
}) {
  const saved = listings.filter((l) => savedIds.has(l.id));
  return (
    <div className="bg-white min-h-screen px-6 lg:px-10 py-10">
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#111111', marginBottom: 24 }}>Saved Homes</h1>
        {saved.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="h-8 w-8 mx-auto mb-3" style={{ color: '#D0D0D0' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: '#111111', marginBottom: 4 }}>No saved homes yet</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: '#9B9B9B', fontSize: 14 }}>Tap the heart on any listing to save it here.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {saved.map((l) => (
              <GnCard key={l.id} listing={l} isSaved onCardClick={onCardClick} onSaveToggle={onRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Property Detail Page ───────────────────────────────────────────────────
function PropertyPage({ listing: l, isSaved, onBack, onSaveToggle }: {
  listing: Listing;
  isSaved: boolean;
  onBack: () => void;
  onSaveToggle: (id: string) => void;
}) {
  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 lg:px-10 py-5">
        <button onClick={onBack} className="text-sm font-medium" style={{ color: '#111111', fontFamily: 'var(--font-body)' }}>
          ← Back
        </button>
      </div>

      <div className="px-6 lg:px-10">
        <div className="mx-auto" style={{ maxWidth: 1000 }}>
          <div className="relative rounded-3xl overflow-hidden mb-8" style={{ aspectRatio: '16/9', background: '#F0F0F0' }}>
            <ImageWithFallback src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#111111', letterSpacing: '-0.02em' }}>
              {l.title}
            </h1>
            <button onClick={() => onSaveToggle(l.id)}
              className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ border: '1px solid #E5E5E5' }}>
              <Heart className="h-5 w-5" fill={isSaved ? '#111111' : 'none'} stroke="#111111" />
            </button>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#6B6B6B', marginBottom: 24 }}>
            {l.locality}, {l.city}, {l.state}
          </p>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#111111', marginBottom: 28 }}>
            {formatPrice(l.price, l.priceType)}
          </div>

          {(l.bedrooms > 0 || l.bathrooms > 0) && (
            <div className="flex gap-8 pb-8 mb-8 border-b" style={{ borderColor: '#E5E5E5' }}>
              {l.bedrooms > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#111111' }}>{bhkLabel(l.bedrooms, l.propertyType)}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9B9B9B' }}>Configuration</div>
                </div>
              )}
              {l.bathrooms > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#111111' }}>{l.bathrooms}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9B9B9B' }}>Bathrooms</div>
                </div>
              )}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#111111' }}>{l.sqft.toLocaleString()} ft²</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9B9B9B' }}>Area</div>
              </div>
            </div>
          )}

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 32 }}>
            {l.description}
          </p>

          <a href={l.whatsapp ? `https://wa.me/${l.whatsapp}` : '#'}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm mb-20"
            style={{ background: '#111111', fontFamily: 'var(--font-body)' }}>
            Contact Owner
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard (minimal, post-login) ───────────────────────────────────────
function DashboardPage({ email, onSignOut }: { email?: string; onSignOut: () => void }) {
  return (
    <div className="bg-white min-h-screen px-6 lg:px-10 py-10">
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#111111', marginBottom: 4 }}>Account</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B6B6B', marginBottom: 32 }}>{email}</p>
        <button onClick={onSignOut}
          className="px-5 py-2.5 rounded-full text-sm font-medium"
          style={{ border: '1px solid #111111', color: '#111111', fontFamily: 'var(--font-body)' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<ViewMode>('home');
  const [activeTab, setActiveTab] = useState<ListingTab>('buy');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [query, setQuery] = useState('');
  const { user, signOut } = useAuth();

  const handleTabChange = useCallback((tab: ListingTab) => {
    setActiveTab(tab);
    setView('search');
  }, []);

  const handleSearch = useCallback((loc: string) => {
    setQuery(loc);
    setView('search');
  }, []);

  const handleSaveToggle = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleCardClick = useCallback((l: Listing) => {
    setSelectedListing(l);
    setView('property');
  }, []);

  const handleViewChange = useCallback((v: ViewMode) => {
    if (v === ('auth' as ViewMode) && !user) {
      setView('auth' as ViewMode);
      return;
    }
    setView(v);
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      {view !== ('auth' as ViewMode) && (
        <GnHeader
          currentView={view}
          activeTab={activeTab}
          savedCount={savedIds.size}
          isAuthed={!!user}
          onTabChange={handleTabChange}
          onViewChange={handleViewChange}
        />
      )}

      {view === 'home' && (
        <HomePage listings={mockListings} savedIds={savedIds} activeTab={activeTab}
          onTabChange={handleTabChange} onSearch={handleSearch}
          onCardClick={handleCardClick} onSaveToggle={handleSaveToggle}
          onViewAll={() => setView('search')} />
      )}
      {view === 'search' && (
        <SearchPage listings={mockListings} activeTab={activeTab} query={query} savedIds={savedIds}
          onCardClick={handleCardClick} onSaveToggle={handleSaveToggle} />
      )}
      {view === 'saved' && (
        <SavedPage listings={mockListings} savedIds={savedIds}
          onCardClick={handleCardClick} onRemove={handleSaveToggle} />
      )}
      {view === 'property' && selectedListing && (
        <PropertyPage listing={selectedListing} isSaved={savedIds.has(selectedListing.id)}
          onBack={() => setView('home')} onSaveToggle={handleSaveToggle} />
      )}
      {view === 'dashboard' && (
        <DashboardPage email={user?.email} onSignOut={async () => { await signOut(); setView('home'); }} />
      )}
      {(view === ('auth' as ViewMode)) && (
        <GnAuth onBack={() => setView('home')} onSuccess={() => setView('dashboard')} />
      )}
    </div>
  );
}
