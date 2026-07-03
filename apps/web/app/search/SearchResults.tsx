'use client';
import { useState, useEffect, useCallback } from 'react';
import { PropertyCard } from '@/components/property/PropertyCard';
import { searchListings } from '@/lib/api';
import type { ListingFull, City } from '@/lib/types';
 
const sel: React.CSSProperties = {padding:'8px 14px',borderRadius:9999,fontSize:13,color:'#111',border:'1px solid #E5E5E5',background:'#fff',cursor:'pointer'};
 
export function SearchResults({ cities, init }: { cities: City[]; init: Record<string,string> }) {
  const [results, setResults] = useState<ListingFull[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
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
        <span style={{marginLeft:'auto',fontSize:13,color:'#6B6B6B'}}>
          {loading ? '…' : `${total} ${total===1?'property':'properties'}`}
        </span>
      </div>
 
      {!loading && results.length === 0 && (
        <div style={{textAlign:'center',padding:'80px 0'}}>
          <p style={{fontSize:17,fontWeight:600,marginBottom:6}}>No properties found</p>
          <p style={{fontSize:14,color:'#6B6B6B'}}>Try adjusting your filters.</p>
        </div>
      )}
 
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'36px 20px'}}>
        {results.map(l=><PropertyCard key={l.id} listing={l} />)}
      </div>
    </main>
  );
}
