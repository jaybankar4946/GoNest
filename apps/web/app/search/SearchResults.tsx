'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Map as MapIcon, List, Columns } from 'lucide-react';
import { track } from '@/lib/track';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { PropertyCard } from '@/components/property/PropertyCard';
import { ListingQuickView } from '@/components/property/ListingQuickView';
import { searchListings, getSavedIds, toggleSaved, saveSearch, getLocalities } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthProvider';
import { formatPrice } from '@/lib/format';
import { parseQuery } from '@/lib/parseQuery';
import type { ListingFull, City, Locality } from '@/lib/types';

const MapView = dynamic(() => import('@/components/property/MapView').then(m => m.MapView), { ssr: false });

const sel: React.CSSProperties = {padding:'10px 16px',borderRadius:12,fontSize:13,color:'#111827',border:'1px solid #E5E7EB',background:'#F9FAFB',cursor:'pointer',fontWeight:500};

export function SearchResults({ cities, init }: { cities: City[]; init: Record<string,string> }) {
  const { user } = useAuth();
  const [text, setText] = useState(init.q ?? '');
  const runText = () => { const t = parseQuery(text); setF(p => ({ ...p, q: t.q, purpose: t.purpose ?? p.purpose, beds: t.beds ?? '', type: t.type ?? '', max: t.maxPrice ? String(t.maxPrice) : '', min: t.minPrice ? String(t.minPrice) : '' })); };
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<ListingFull[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view,    setView]    = useState<'list'|'map'|'split'>(init.purpose ? 'split' : 'list');
  const [quickViewId, setQuickViewId] = useState<string|null>(null);
  const [activeListingId, setActiveListingId] = useState<string|null>(null);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [f, setF] = useState({
    q:       init.q       ?? '',
    purpose: init.purpose ?? '',
    cityId:  init.city    ?? '',
    localityId: init.locality ?? '',
    pincode: init.pin ?? '',
    landmark: init.landmark ?? '',
    beds:    init.beds    ?? '',
    type:    init.type    ?? '',
    max:     init.max     ?? '',
    min:     init.min     ?? '',
    sort:    (init.sort   ?? 'newest') as 'newest'|'price_asc'|'price_desc'|'popular',
    baths: init.baths ?? '', minArea: init.minArea ?? '', maxArea: init.maxArea ?? '',
    availability: init.availability ?? '', amenities: init.amenities ? init.amenities.split(',').filter(Boolean) : [],
    furnishing: init.furnishing ?? '',
  });

  useEffect(() => { if (!f.cityId) { setLocalities([]); return; } getLocalities(f.cityId).then(setLocalities).catch(() => setLocalities([])); }, [f.cityId]);

  const load = useCallback(async () => {
    setLoading(true);
    setPage(1);
    try {
      const r = await searchListings({
        q: f.q||undefined, purpose: f.purpose||undefined, cityId: f.cityId||undefined, localityId: f.localityId||undefined, pincode: f.pincode||undefined, landmark: f.landmark||undefined,
        minBedrooms: f.beds ? Number(f.beds) : undefined, minBathrooms: f.baths ? Number(f.baths) : undefined,
        minArea: f.minArea ? Number(f.minArea) : undefined, maxArea: f.maxArea ? Number(f.maxArea) : undefined,
        amenities: f.amenities, availability: f.availability || undefined, furnishing: f.furnishing || undefined,
        propertyType: f.type||undefined, maxPrice: f.max ? Number(f.max) : undefined, minPrice: f.min ? Number(f.min) : undefined, sort: f.sort, page: 1,
      });
      setResults(r.listings); setTotal(r.total); setLoadError(null); track('search', undefined, { total: r.total, purpose: f.purpose || 'any', hasText: !!f.q });
    } catch (error) {
      console.error('GoNest property search failed', error);
      setResults([]);
      setTotal(0);
      setLoadError('We could not load property results. Check your connection and try again.');
    } finally { setLoading(false); }
  }, [f]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (user) getSavedIds(user.id).then(setSaved); else setSaved(new Set()); }, [user]);
  const toggle = async (id: string) => {
    if (!user) { window.location.href = '/auth'; return; }
    const was = saved.has(id);
    const flip = (on: boolean) => setSaved(p => { const n = new Set(p); on ? n.add(id) : n.delete(id); return n; });
    flip(!was);
    try { await toggleSaved(user.id, id, was); if (!was) track('save', id); } catch { flip(was); }
  };
  const upd = (k: string, v: string) => setF(p=>({...p,[k]:v}));
  const updateCity = (value: string) => setF(p => ({...p, cityId:value, localityId:''}));
  const [savedMsg, setSavedMsg] = useState<string|null>(null);
  const saveThis = async () => {
    if (!user) { window.location.href = '/auth?next=/search'; return; }
    const cityName = cities.find(c => c.id === f.cityId)?.name;
    const name = [f.purpose==='rent'?'Rent':f.purpose==='sale'?'Buy':null, f.beds?`${f.beds}+ BHK`:null, f.type?f.type.charAt(0).toUpperCase()+f.type.slice(1):null, cityName, localities.find(l=>l.id===f.localityId)?.name, f.q||null, f.pincode||null, f.landmark||null, f.max?`under ₹${Number(f.max).toLocaleString('en-IN')}`:null].filter(Boolean).join(' · ') || 'All properties';
    try { await saveSearch(user.id, { name, cityId: f.cityId||undefined, purpose: f.purpose||undefined, type: f.type||undefined, min: f.min?Number(f.min):undefined, max: f.max?Number(f.max):undefined, beds: f.beds?Number(f.beds):undefined }); setSavedMsg('Saved. We will notify you about new matches.'); } catch { setSavedMsg('Could not save this search.'); }
    setTimeout(() => setSavedMsg(null), 4000);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const r = await searchListings({
        q: f.q||undefined, purpose: f.purpose||undefined, cityId: f.cityId||undefined, localityId: f.localityId||undefined, pincode: f.pincode||undefined, landmark: f.landmark||undefined,
        minBedrooms: f.beds ? Number(f.beds) : undefined, minBathrooms: f.baths ? Number(f.baths) : undefined,
        minArea: f.minArea ? Number(f.minArea) : undefined, maxArea: f.maxArea ? Number(f.maxArea) : undefined,
        amenities: f.amenities, availability: f.availability || undefined, furnishing: f.furnishing || undefined,
        propertyType: f.type||undefined, maxPrice: f.max ? Number(f.max) : undefined, minPrice: f.min ? Number(f.min) : undefined, sort: f.sort, page: nextPage,
      });
      setResults(p => [...p, ...r.listings]);
      setPage(nextPage);
      setLoadError(null);
    } catch (error) {
      console.error('GoNest load-more search failed', error);
      setLoadError('We could not load more properties. Please try again.');
    } finally { setLoadingMore(false); }
  };

  const hasMore = results.length < total;

  const viewBtn = (v: typeof view, Icon: any, label: string) => (
    <button onClick={()=>setView(v)}
      style={{display:'flex',alignItems:'center',gap:5,padding:'8px 14px',borderRadius:12,fontSize:13,fontWeight:view===v?600:500,
        color:view===v?'#fff':'#111', background:view===v?'var(--primary)':'#fff', border:'1px solid '+(view===v?'var(--primary)':'var(--border)')}}>
      <Icon size={14}/>{label}
    </button>
  );

  const LoadMoreBtn = () => hasMore ? (
    <div style={{display:'flex',justifyContent:'center',marginTop:36}}>
      <button onClick={loadMore} disabled={loadingMore}
        style={{padding:'11px 28px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#111',border:'1px solid #111',background:'#fff',opacity:loadingMore?0.6:1,cursor:loadingMore?'default':'pointer'}}>
        {loadingMore ? 'Loading…' : `Load more (${total - results.length} remaining)`}
      </button>
    </div>
  ) : null;

  return (
    <div style={{background:'#F9FAFB',minHeight:'70vh'}}>
    <main style={{maxWidth:f.purpose ? 'none' : 1200,margin:'0 auto',padding:f.purpose ? '20px 16px 32px' : '36px 24px'}}>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:18,alignItems:'center',background:'#fff',border:'1px solid #E5E7EB',borderRadius:20,padding:14,boxShadow:'var(--shadow-sm)'}}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runText()} onBlur={runText}
          placeholder="e.g. 2 BHK apartment in Thane under 1 crore" style={{...sel,minWidth:260,flex:'1 1 260px',cursor:'text',background:'#fff'}} />
        <select style={sel} value={f.purpose} onChange={e=>upd('purpose',e.target.value)}>
          <option value="">Buy or Rent</option>
          <option value="sale">Buy</option>
          <option value="rent">Rent</option>
        </select>
        <select style={sel} value={f.cityId} onChange={e=>updateCity(e.target.value)}>
          <option value="">Any city</option>
          {cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {f.cityId && <select style={sel} value={f.localityId} onChange={e=>upd('localityId',e.target.value)}><option value="">Any locality</option>{localities.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select>}
        <select style={sel} value={f.beds} onChange={e=>upd('beds',e.target.value)}>
          <option value="">Any BHK</option>
          {['1','2','3','4'].map(n=><option key={n} value={n}>{n}+ BHK</option>)}
        </select>
        <select style={sel} value={f.type} onChange={e=>upd('type',e.target.value)}>
          <option value="">Any type</option>
          {['apartment','villa','house','plot','studio','office','shop','warehouse','commercial'].map(t=>(
            <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
          ))}
        </select>
        <select style={sel} value={f.max} onChange={e=>upd('max',e.target.value)}>
          <option value="">Any budget</option>
          {(f.purpose==='rent' ? [15000,25000,40000,60000,100000] : [5000000,10000000,20000000,50000000])
            .map(n=><option key={n} value={n}>Up to {formatPrice(n, f.purpose==='rent'?'rent':'sale')}</option>)}
        </select>
        <button type="button" aria-expanded={showAdvanced} onClick={()=>setShowAdvanced(v=>!v)} style={{...sel,fontWeight:600,background:showAdvanced?'#EFF6FF':'#fff',borderColor:showAdvanced?'#2563EB':'#E5E7EB',color:showAdvanced?'#1D4ED8':'#111827'}}>More filters {showAdvanced?'−':'+'}</button>
        <button onClick={saveThis} style={{...sel,fontWeight:600,color:'var(--primary)',borderColor:'var(--primary)'}}>Save this search</button>
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

      {showAdvanced && <section aria-label="Advanced property filters" style={{background:'#fff',border:'1px solid #DCE3EC',borderRadius:18,padding:18,marginBottom:18,boxShadow:'0 8px 24px rgba(15,23,42,.05)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:14}}><div><h2 style={{fontSize:16,fontWeight:800,color:'#111827'}}>More ways to find your home</h2><p style={{fontSize:12,color:'#64748B',marginTop:3}}>Filters apply to both the property cards and map results.</p></div><button type="button" onClick={()=>setF(p=>({...p,baths:'',minArea:'',maxArea:'',availability:'',amenities:[],furnishing:'',min:''}))} style={{fontSize:12,fontWeight:700,textDecoration:'underline',color:'#475569'}}>Clear advanced filters</button></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:12}}>
          <label style={{fontSize:12,fontWeight:700,color:'#475569'}}>Minimum budget<input aria-label="Minimum budget" type="number" min="0" value={f.min} onChange={e=>upd('min',e.target.value)} placeholder="₹ Min" style={{...sel,display:'block',width:'100%',marginTop:6,boxSizing:'border-box',background:'#fff'}} /></label>
          <label style={{fontSize:12,fontWeight:700,color:'#475569'}}>Bathrooms<select aria-label="Bathrooms" value={f.baths} onChange={e=>upd('baths',e.target.value)} style={{...sel,display:'block',width:'100%',marginTop:6,background:'#fff'}}><option value="">Any</option>{['1','2','3','4'].map(n=><option key={n} value={n}>{n}+ bathrooms</option>)}</select></label>
          <label style={{fontSize:12,fontWeight:700,color:'#475569'}}>Min area (sq ft)<input type="number" min="0" value={f.minArea} onChange={e=>upd('minArea',e.target.value)} placeholder="Any" style={{...sel,display:'block',width:'100%',marginTop:6,boxSizing:'border-box',background:'#fff'}} /></label>
          <label style={{fontSize:12,fontWeight:700,color:'#475569'}}>Max area (sq ft)<input type="number" min="0" value={f.maxArea} onChange={e=>upd('maxArea',e.target.value)} placeholder="Any" style={{...sel,display:'block',width:'100%',marginTop:6,boxSizing:'border-box',background:'#fff'}} /></label>
          <label style={{fontSize:12,fontWeight:700,color:'#475569'}}>Furnishing<select value={f.furnishing} onChange={e=>upd('furnishing',e.target.value)} style={{...sel,display:'block',width:'100%',marginTop:6,background:'#fff'}}><option value="">Any</option><option value="unfurnished">Unfurnished</option><option value="semi_furnished">Semi-furnished</option><option value="furnished">Furnished</option></select></label>
          <label style={{fontSize:12,fontWeight:700,color:'#475569'}}>Availability<select value={f.availability} onChange={e=>upd('availability',e.target.value)} style={{...sel,display:'block',width:'100%',marginTop:6,background:'#fff'}}><option value="">Any</option><option value="ready_to_move">Ready to move</option><option value="under_construction">Under construction</option><option value="immediate">Immediate possession</option></select></label>
        </div>
        <div style={{marginTop:16}}><p style={{fontSize:12,fontWeight:800,color:'#475569',marginBottom:9}}>Amenities</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{['Parking','Lift','Security','Gym','Swimming pool','Balcony','Power backup','Pet friendly'].map(a=>{const key=a.toLowerCase().replace(/ /g,'_');const on=f.amenities.includes(key);return <button type="button" key={key} aria-pressed={on} onClick={()=>setF(p=>({...p,amenities:on?p.amenities.filter(x=>x!==key):[...p.amenities,key]}))} style={{padding:'8px 12px',borderRadius:999,border:'1px solid '+(on?'#2563EB':'#D1D5DB'),background:on?'#EFF6FF':'#fff',color:on?'#1D4ED8':'#374151',fontSize:12,fontWeight:600}}>{on?'✓ ':''}{a}</button>})}</div></div>
      </section>}

      {savedMsg&&<p role="status" style={{fontSize:13,color:'#065F46',background:'#ECFDF5',padding:'8px 12px',borderRadius:10,marginBottom:12}}>{savedMsg} <a href="/saved-searches" style={{textDecoration:'underline'}}>View saved searches</a></p>}
      <p style={{fontSize:13,color:'var(--gray-4)',marginBottom:12}}>
        {loading ? 'Searching…' : `${total} ${total===1?'property':'properties'} found`}
      </p>

      {loading && results.length === 0 && (<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'36px 20px'}}>{[1,2,3,4,5,6].map(i=><PropertyCardSkeleton key={i}/>)}</div>)}
      {!loading && loadError && (
        <div role="alert" style={{textAlign:'center',padding:'40px 24px',background:'#fff',border:'1px solid #FECACA',borderRadius:24}}>
          <p style={{fontSize:18,fontWeight:800,marginBottom:8,color:'#991B1B'}}>Search temporarily unavailable</p>
          <p style={{fontSize:14,lineHeight:1.7,color:'#6B7280',margin:'0 auto 18px',maxWidth:520}}>{loadError}</p>
          <button type="button" onClick={() => load()} style={{padding:'10px 18px',borderRadius:12,background:'#1D4ED8',color:'#fff',fontSize:13,fontWeight:700}}>Try search again</button>
        </div>
      )}
      {!loading && !loadError && results.length === 0 && (
        <div style={{textAlign:'center',padding:'64px 24px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:24}}>
          <div style={{width:56,height:56,margin:'0 auto 18px',display:'grid',placeItems:'center',borderRadius:16,background:'#EFF6FF',color:'#1D4ED8',fontSize:26}}>⌂</div>
          <p style={{fontSize:22,fontWeight:800,marginBottom:8,color:'#111827'}}>
            {f.purpose==='rent' ? 'We’re onboarding verified rental homes' : f.purpose==='sale' ? 'We’re onboarding verified homes for sale' : 'We’re onboarding the first verified properties'}
          </p>
          <p style={{fontSize:14,lineHeight:1.7,color:'#6B7280',maxWidth:560,margin:'0 auto'}}>
            No live, non-sample property matches are published for these filters yet. We won’t show demo homes as real inventory. Try our source-linked new-project directory or submit a genuine property for review.
          </p>
          <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginTop:22}}>
            <Link href="/builders" style={{display:'inline-flex',alignItems:'center',padding:'11px 17px',borderRadius:12,background:'#2563EB',color:'#fff',fontSize:13,fontWeight:700}}>Explore new projects</Link>
            <Link href="/dashboard" style={{display:'inline-flex',alignItems:'center',padding:'11px 17px',borderRadius:12,border:'1px solid #D1D5DB',background:'#fff',color:'#111827',fontSize:13,fontWeight:700}}>List a property</Link>
            <Link href="/agents" style={{display:'inline-flex',alignItems:'center',padding:'11px 17px',borderRadius:12,border:'1px solid #D1D5DB',background:'#fff',color:'#111827',fontSize:13,fontWeight:700}}>Find local professionals</Link>
          </div>
        </div>
      )}

      {view === 'list' && (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'36px 20px'}}>
            {results.map(l=><div key={l.id} onMouseEnter={() => setActiveListingId(l.id)} onFocus={() => setActiveListingId(l.id)}><PropertyCard listing={l} onQuickView={setQuickViewId} isSaved={saved.has(l.id)} onToggle={toggle} /></div>)}
          </div>
          <LoadMoreBtn />
        </>
      )}

      {view === 'map' && results.length > 0 && (
        <div style={{height:600}}>
          <MapView listings={results} activeListingId={activeListingId} onSelect={(l)=>{setActiveListingId(l.id);setQuickViewId(l.id);}} />
        </div>
      )}

      {view === 'split' && results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-4 items-start">
          <div style={{position:'sticky',top:84,height:'calc(100vh - 104px)',minHeight:560,order:1}} className="hidden lg:block">
            <MapView listings={results} activeListingId={activeListingId} onSelect={(l)=>{setActiveListingId(l.id);setQuickViewId(l.id);}} />
          </div>
          <div style={{minWidth:0,order:2}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'20px 14px'}}>
              {results.map(l=><PropertyCard key={l.id} listing={l} onQuickView={setQuickViewId} isSaved={saved.has(l.id)} onToggle={toggle} />)}
            </div>
            <LoadMoreBtn />
            <div className="lg:hidden" style={{marginTop:20,height:460}}>
              <MapView listings={results} onSelect={(l)=>setQuickViewId(l.id)} />
            </div>
          </div>
        </div>
      )}

      {quickViewId && <ListingQuickView listingId={quickViewId} onClose={()=>setQuickViewId(null)} />}
    </main>
    </div>
  );
}
