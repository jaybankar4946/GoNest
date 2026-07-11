'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Map as MapIcon, List, Columns } from 'lucide-react';
import { PropertyCard } from '@/components/property/PropertyCard';
import { ListingQuickView } from '@/components/property/ListingQuickView';
import { searchListings } from '@/lib/api';
import type { ListingFull, City } from '@/lib/types';

const MapView = dynamic(() => import('@/components/property/MapView').then(m => m.MapView), { ssr: false });

const sel: React.CSSProperties = {padding:'8px 14px',borderRadius:9999,fontSize:13,color:'#111',border:'1px solid var(--border)',background:'#fff',cursor:'pointer'};

export function SearchResults({ cities, init }: { cities: City[]; init: Record<string,string> }) {
  const [results, setResults] = useState<ListingFull[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState<'list'|'map'|'split'>('list');
  const [quickViewId, setQuickViewId] = useState<string|null>(null);
  const [f, setF] = useState({
    q:       init.q       ?? '',
    purpose: init.purpose ?? '',
    cityId:  init.city    ?? '',
    beds:    init.beds    ?? '',
    type:    init.type    ?? '',
    sort:    (init.sort   ?? 'newest') as 'newest'|'price_asc'|'price_desc'|'popular',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await searchListings({
        q: f.q||undefined, purpose: f.purpose||undefined, cityId: f.cityId||undefined,
        minBedrooms: f.beds ? Number(f.beds) : undefined,
        propertyType: f.type||undefined, sort: f.sort,
      });
      setResults(r.listings); setTotal(r.total);
    } finally { setLoading(false); }
  }, [f]);

  useEffect(() => { load(); }, [load]);
  const upd = (k: string, v: string) => setF(p=>({...p,[k]:v}));

  const viewBtn = (v: typeof view, Icon: any, label: string) => (
    <button onClick={()=>setView(v)}
      style={{display:'flex',alignItems:'center',gap:5,padding:'8px 14px',borderRadius:9999,fontSize:13,fontWeight:view===v?600:400,
        color:view===v?'#fff':'#111', background:view===v?'var(--primary)':'#fff', border:'1px solid '+(view===v?'var(--primary)':'var(--border)')}}>
      <Icon size={14}/>{label}
    </button>
  );

  return (
    <main style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px'}}>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:32,alignItems:'center'}}>
        <select style={sel} value={f.purpose} onChange={e=>upd('purpose',e.target.value)}>
          <option value="">Buy or Rent</option>
          <option value="sale">Buy</option>
          <option value="rent">Rent</option>
        </select>
        <select style={sel} value={f.cityId} onChange={e=>upd('cityId',e.target.value)}>
          <option value="">Any city</option>
          {cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={sel} value={f.beds} onChange={e=>upd('beds',e.target.value)}>
          <option value="">Any BHK</option>
          {['1','2','3','4'].map(n=><option key={n} value={n}>{n}+ BHK</option>)}
        </select>
        <select style={sel} value={f.type} onChange={e=>upd('type',e.target.value)}>
          <option value="">Any type</option>
          {['apartment','villa','house','plot','commercial'].map(t=>(
            <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
          ))}
        </select>
        <select style={sel} value={f.sort} onChange={e=>upd('sort',e.target.value as typeof f.sort)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="popular">Most popular</option>
        </select>

        <div style={{display:'flex',gap:6,marginLeft:'auto'}}>
          {viewBtn('list', List, 'List')}
          {viewBtn('split', Columns, 'Split')}
          {viewBtn('map', MapIcon, 'Map')}
        </div>
      </div>

      <p style={{fontSize:13,color:'var(--gray-4)',marginBottom:20}}>
        {loading ? 'Searching…' : `${total} ${total===1?'property':'properties'} found`}
      </p>

      {!loading && results.length === 0 && (
        <div style={{textAlign:'center',padding:'80px 0'}}>
          <p style={{fontSize:17,fontWeight:600,marginBottom:6}}>No properties found</p>
          <p style={{fontSize:14,color:'var(--gray-4)'}}>Try adjusting your filters.</p>
        </div>
      )}

      {view === 'list' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'36px 20px'}}>
          {results.map(l=><PropertyCard key={l.id} listing={l} onQuickView={setQuickViewId} />)}
        </div>
      )}

      {view === 'map' && results.length > 0 && (
        <div style={{height:600}}>
          <MapView listings={results} onSelect={(l)=>setQuickViewId(l.id)} />
        </div>
      )}

      {view === 'split' && results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 items-start">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'28px 16px'}}>
            {results.map(l=><PropertyCard key={l.id} listing={l} onQuickView={setQuickViewId} />)}
          </div>
          <div style={{position:'sticky',top:80,height:'calc(100vh - 120px)'}}>
            <MapView listings={results} onSelect={(l)=>setQuickViewId(l.id)} />
          </div>
        </div>
      )}

      {quickViewId && <ListingQuickView listingId={quickViewId} onClose={()=>setQuickViewId(null)} />}
    </main>
  );
}
