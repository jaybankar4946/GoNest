'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, SlidersHorizontal } from 'lucide-react';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { searchListings } from '@/lib/api';
import type { ListingFull, City } from '@/lib/types';

const pill = (active: boolean): React.CSSProperties => ({
  padding: '9px 16px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)',
  fontWeight: active ? 600 : 400, color: active ? 'var(--primary)' : 'var(--ink)',
  background: active ? 'var(--primary-soft)' : 'var(--surface)',
  border: '1px solid ' + (active ? 'var(--primary)' : 'var(--border)'),
});
const pageBtn = (active: boolean): React.CSSProperties => ({
  padding: '8px 14px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)',
  fontWeight: active ? 600 : 400, color: active ? '#fff' : 'var(--ink)',
  background: active ? 'var(--ink)' : 'var(--surface)',
  border: '1px solid ' + (active ? 'var(--ink)' : 'var(--border)'), minWidth: 38,
});
const chip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 14px',
  borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600,
  color: 'var(--primary)', background: 'var(--primary-soft)', border: '1px solid transparent',
};

export function SearchResults({ cities, init }: { cities: City[]; init: Record<string,string> }) {
  const router = useRouter();
  const pathname = usePathname();

  const [results, setResults] = useState<ListingFull[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [f, setF] = useState({
    q: init.q ?? '', purpose: init.purpose ?? '', cityId: init.city ?? '',
    beds: init.beds ?? '', type: init.type ?? '',
    sort: (init.sort ?? 'newest') as 'newest'|'price_asc'|'price_desc'|'popular',
    page: init.page ? Number(init.page) : 1,
  });

  const PAGE_SIZE = 24;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const cityName = cities.find(c => c.id === f.cityId)?.name;

  const syncUrl = useCallback((next: typeof f) => {
    const params = new URLSearchParams();
    if (next.q) params.set('q', next.q);
    if (next.purpose) params.set('purpose', next.purpose);
    if (next.cityId) params.set('city', next.cityId);
    if (next.beds) params.set('beds', next.beds);
    if (next.type) params.set('type', next.type);
    if (next.sort !== 'newest') params.set('sort', next.sort);
    if (next.page > 1) params.set('page', String(next.page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await searchListings({
        q: f.q||undefined, purpose: f.purpose||undefined, cityId: f.cityId||undefined,
        minBedrooms: f.beds ? Number(f.beds) : undefined, propertyType: f.type||undefined,
        sort: f.sort, page: f.page,
      });
      setResults(r.listings); setTotal(r.total);
    } finally { setLoading(false); }
  }, [f]);

  useEffect(() => { load(); }, [load]);

  const upd = (k: string, v: string) => setF(p => { const next = { ...p, [k]: v, page: 1 }; syncUrl(next); return next; });
  const clear = (k: string) => upd(k, '');
  const goToPage = (page: number) => setF(p => { const next = { ...p, page }; syncUrl(next); return next; });

  const activeChips: { key: string; label: string }[] = [];
  if (f.purpose) activeChips.push({ key: 'purpose', label: f.purpose === 'sale' ? 'Buy' : 'Rent' });
  if (cityName)  activeChips.push({ key: 'cityId', label: cityName });
  if (f.beds)    activeChips.push({ key: 'beds', label: `${f.beds}+ BHK` });
  if (f.type)    activeChips.push({ key: 'type', label: f.type.charAt(0).toUpperCase()+f.type.slice(1) });

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-5) var(--space-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <button onClick={()=>setShowFilters(s=>!s)} style={pill(showFilters)}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SlidersHorizontal size={14} strokeWidth={2} /> Filters
          </span>
        </button>
        <select style={pill(f.sort !== 'newest') as any} value={f.sort} onChange={e=>upd('sort',e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="popular">Most popular</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
          {loading ? '…' : `${total} ${total===1?'property':'properties'}`}
        </span>
      </div>

      {activeChips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
          {activeChips.map(c => (
            <span key={c.key} style={chip}>
              {c.label}
              <button onClick={()=>clear(c.key)} style={{ display: 'flex' }}><X size={12} strokeWidth={2.5} /></button>
            </span>
          ))}
        </div>
      )}

      {showFilters && (
        <div style={{
          display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', padding: 'var(--space-3)',
          background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)',
        }}>
          <select style={pill(!!f.purpose)} value={f.purpose} onChange={e=>upd('purpose',e.target.value)}>
            <option value="">Buy or Rent</option><option value="sale">Buy</option><option value="rent">Rent</option>
          </select>
          <select style={pill(!!f.cityId)} value={f.cityId} onChange={e=>upd('cityId',e.target.value)}>
            <option value="">Any city</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select style={pill(!!f.beds)} value={f.beds} onChange={e=>upd('beds',e.target.value)}>
            <option value="">Any BHK</option>
            {['1','2','3','4'].map(n => <option key={n} value={n}>{n}+ BHK</option>)}
          </select>
          <select style={pill(!!f.type)} value={f.type} onChange={e=>upd('type',e.target.value)}>
            <option value="">Any type</option>
            {['apartment','villa','house','plot','commercial'].map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 'var(--space-5) var(--space-4)' }}>
          {Array.from({length:6}).map((_,i) => <PropertyCardSkeleton key={i} />)}
        </div>
      )}

      {!loading && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
          <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>No properties found</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-soft)' }}>Try adjusting your filters.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 'var(--space-5) var(--space-4)' }}>
          {results.map(l => <PropertyCard key={l.id} listing={l} />)}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
          <button style={pageBtn(false)} disabled={f.page<=1} onClick={()=>goToPage(f.page-1)}>‹ Prev</button>
          {Array.from({length:totalPages}, (_,i)=>i+1)
            .filter(p => p===1 || p===totalPages || Math.abs(p-f.page)<=1)
            .map((p,i,arr) => (
              <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i>0 && arr[i-1]!==p-1 && <span style={{ color: 'var(--ink-faint)' }}>…</span>}
                <button style={pageBtn(p===f.page)} onClick={()=>goToPage(p)}>{p}</button>
              </span>
          ))}
          <button style={pageBtn(false)} disabled={f.page>=totalPages} onClick={()=>goToPage(f.page+1)}>Next ›</button>
        </div>
      )}
    </main>
  );
}
