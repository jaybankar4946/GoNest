'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PropertyCard } from '@/components/property/PropertyCard';
import { searchListings } from '@/lib/api';
import type { ListingFull, City } from '@/lib/types';

const sel: React.CSSProperties = {padding:'8px 14px',borderRadius:9999,fontSize:13,color:'#111',border:'1px solid #E5E5E5',background:'#fff',cursor:'pointer'};
const pageBtn = (active:boolean): React.CSSProperties => ({
  padding:'8px 14px',borderRadius:9999,fontSize:13,fontWeight:active?600:400,
  color:active?'#fff':'#111',background:active?'#111':'#fff',
  border:'1px solid '+(active?'#111':'#E5E5E5'),cursor:'pointer',minWidth:36,
});

export function SearchResults({ cities, init }: { cities: City[]; init: Record<string,string> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    page:    init.page ? Number(init.page) : 1,
  });

  const PAGE_SIZE = 24;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Keep the URL in sync with filters so refresh/share preserves state
  const syncUrl = useCallback((next: typeof f) => {
    const params = new URLSearchParams();
    if (next.q)       params.set('q', next.q);
    if (next.purpose) params.set('purpose', next.purpose);
    if (next.cityId)  params.set('city', next.cityId);
    if (next.beds)    params.set('beds', next.beds);
    if (next.type)    params.set('type', next.type);
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
        minBedrooms: f.beds ? Number(f.beds) : undefined,
        propertyType: f.type||undefined, sort: f.sort, page: f.page,
      });
      setResults(r.listings); setTotal(r.total);
    } finally { setLoading(false); }
  }, [f]);

  useEffect(() => { load(); }, [load]);

  // Any filter change resets to page 1; page changes stay as-is
  const upd = (k: string, v: string) => setF(p => {
    const next = { ...p, [k]: v, page: 1 };
    syncUrl(next);
    return next;
  });

  const goToPage = (page: number) => setF(p => {
    const next = { ...p, page };
    syncUrl(next);
    return next;
  });

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
        <select style={sel} value={f.sort} onChange={e=>upd('sort',e.target.value)}>
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

      {totalPages > 1 && (
        <div style={{display:'flex',justifyContent:'center',gap:6,marginTop:48,flexWrap:'wrap'}}>
          <button style={pageBtn(false)} disabled={f.page<=1} onClick={()=>goToPage(f.page-1)}>‹ Prev</button>
          {Array.from({length:totalPages}, (_,i)=>i+1)
            .filter(p => p===1 || p===totalPages || Math.abs(p-f.page)<=1)
            .map((p,i,arr) => (
              <span key={p} style={{display:'flex',alignItems:'center',gap:6}}>
                {i>0 && arr[i-1]!==p-1 && <span style={{color:'#9B9B9B'}}>…</span>}
                <button style={pageBtn(p===f.page)} onClick={()=>goToPage(p)}>{p}</button>
              </span>
          ))}
          <button style={pageBtn(false)} disabled={f.page>=totalPages} onClick={()=>goToPage(f.page+1)}>Next ›</button>
        </div>
      )}
    </main>
  );
}
