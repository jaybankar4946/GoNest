'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, SlidersHorizontal, X, Check } from 'lucide-react';
import { getAllLocalities } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { parseQuery } from '@/lib/parseQuery';
import type { City, Locality } from '@/lib/types';

export type PropertySearchValues = {
  q: string; purpose: 'sale' | 'rent'; cityId: string; localityId: string;
  min: string; max: string; type: string; beds: string; baths: string;
  minArea: string; maxArea: string; furnishing: string; availability: string;
  amenities: string[]; pincode: string;
};

type Props = {
  cities: City[];
  initial?: Partial<PropertySearchValues>;
  mode?: 'home' | 'results';
  onSearch?: (values: PropertySearchValues) => void;
};

const TYPES = ['apartment', 'villa', 'house', 'plot', 'studio', 'pg', 'commercial'];
const AMENITIES = ['Lift', 'Parking', 'Security / CCTV', 'Power backup', 'Gym', 'Swimming pool', 'Clubhouse', 'Children play area', 'Garden', 'Gated community', '24x7 water supply', 'Piped gas', 'Intercom', 'Visitor parking'];
const field = 'w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50';
const label = 'mb-1.5 block text-xs font-semibold text-slate-500';

const empty = (purpose: 'sale'|'rent' = 'sale'): PropertySearchValues => ({
  q:'', purpose, cityId:'', localityId:'', min:'', max:'', type:'', beds:'', baths:'',
  minArea:'', maxArea:'', furnishing:'', availability:'', amenities:[], pincode:''
});

export function PropertySearchBar({ cities, initial = {}, mode = 'results', onSearch }: Props) {
  const router = useRouter();
  const [v, setV] = useState<PropertySearchValues>(() => ({...empty(initial.purpose ?? 'sale'), ...initial, amenities: initial.amenities ?? []}));
  const [advanced, setAdvanced] = useState(false);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const cityLocalities = useMemo(() => v.cityId ? localities.filter(l => l.city_id === v.cityId) : localities, [localities, v.cityId]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [focusedSuggestion, setFocusedSuggestion] = useState(0);

  useEffect(() => {
    let active = true;
    getAllLocalities().then(items => { if (active) setLocalities(items); }).catch(() => { if (active) setLocalities([]); });
    return () => { active = false; };
  }, []);

  const suggestions = useMemo(() => {
    const term = v.q.trim().toLowerCase();
    if (!term) return [];
    const cityMatches = cities.filter(c => c.name.toLowerCase().includes(term)).slice(0, 4).map(c => ({label:c.name, cityId:c.id, localityId:'', kind:'City'}));
    const localityMatches = localities.filter(l => l.name.toLowerCase().includes(term) && (!v.cityId || l.city_id === v.cityId)).slice(0, 6).map(l => ({label:l.name, cityId:l.city_id, localityId:l.id, kind:'Locality'}));
    if (/^\d{3,6}$/.test(term)) return [{label:term, cityId:v.cityId, localityId:'', kind:'PIN code'}];
    return [...localityMatches, ...cityMatches].slice(0, 7);
  }, [v.q, cities, localities, v.cityId]);

  const set = <K extends keyof PropertySearchValues>(key: K, value: PropertySearchValues[K]) => setV(prev => ({...prev, [key]:value}));
  const chooseSuggestion = (item: {label:string;cityId:string;localityId:string;kind:string}) => {
    if (item.kind === 'PIN code') setV(prev => ({...prev, pincode:item.label, q:''}));
    else setV(prev => ({...prev, q:item.label, cityId:item.cityId || prev.cityId, localityId:item.localityId}));
    setSuggestionsOpen(false);
  };
  const submit = () => {
    const parsed = parseQuery(v.q);
    const next: PropertySearchValues = {...v, purpose:parsed.purpose??v.purpose, q:parsed.q??v.q.trim(), beds:parsed.beds??v.beds, min:parsed.minPrice!=null?String(parsed.minPrice):v.min, max:parsed.maxPrice!=null?String(parsed.maxPrice):v.max, type:parsed.type??v.type};
    if (onSearch) { onSearch(next); return; }
    const params = new URLSearchParams();
    params.set('purpose',next.purpose);
    if(next.q) params.set('q',next.q);
    if(next.cityId) params.set('city',next.cityId);
    if(next.localityId) params.set('locality',next.localityId);
    if(next.pincode) params.set('pin',next.pincode);
    if(next.min) params.set('min',next.min);
    if(next.max) params.set('max',next.max);
    if(next.type) params.set('type',next.type);
    if(next.beds) params.set('beds',next.beds);
    if(next.baths) params.set('baths',next.baths);
    if(next.minArea) params.set('minArea',next.minArea);
    if(next.maxArea) params.set('maxArea',next.maxArea);
    if(next.furnishing) params.set('furnishing',next.furnishing);
    if(next.availability) params.set('availability',next.availability);
    if(next.amenities.length) params.set('amenities',next.amenities.join(','));
    router.push('/search?'+params.toString());
  };

  const activeCount = [v.type,v.beds,v.baths,v.minArea,v.maxArea,v.furnishing,v.availability,v.pincode].filter(Boolean).length + v.amenities.length;
  const budgets = v.purpose === 'rent' ? [10000,15000,25000,40000,60000,100000] : [2500000,5000000,7500000,10000000,20000000,50000000];
  const classicBudgets = v.purpose === 'rent' ? [15000,25000,40000,60000,100000] : [5000000,10000000,20000000,50000000];

  return (
    <section className="relative z-20 w-full max-w-3xl overflow-visible rounded-3xl bg-white text-left shadow-2xl">
      <div className="flex overflow-hidden rounded-t-3xl border-b border-gray-100">
        {(['sale','rent'] as const).map(p => <button key={p} type="button" onClick={() => setV(prev => ({...prev,purpose:p,min:'',max:''}))} className={'flex-1 py-4 text-sm font-semibold transition-colors '+(v.purpose===p?'bg-blue-600 text-white':'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700')}>{p==='sale'?'Buy':'Rent'}</button>)}
      </div>
      <div className="p-5 sm:p-6">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500"/>
          <input value={v.q} onChange={e=>{set('q',e.target.value);setSuggestionsOpen(true);setFocusedSuggestion(0);set('localityId','');}} onFocus={()=>setSuggestionsOpen(true)} onBlur={()=>setTimeout(()=>setSuggestionsOpen(false),140)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(suggestionsOpen&&suggestions[focusedSuggestion])chooseSuggestion(suggestions[focusedSuggestion]);else submit();}if(e.key==='ArrowDown'){e.preventDefault();setFocusedSuggestion(i=>Math.min(i+1,Math.max(0,suggestions.length-1)));}if(e.key==='Escape')setSuggestionsOpen(false);}} placeholder="Try: 2 BHK apartment in Thane under 1 crore" className="w-full rounded-2xl border border-gray-200 py-3.5 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"/>
          {suggestionsOpen&&suggestions.length>0&&<div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl">{suggestions.map((item,i)=><button key={item.kind+item.label} type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>chooseSuggestion(item)} className={'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50 '+(focusedSuggestion===i?'bg-blue-50':'')}><MapPin className="h-4 w-4 text-blue-500"/><span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">{item.label}</span><span className="text-xs text-gray-400">{item.kind}</span></button>)}</div>}
        </div>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative"><MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500"/><select aria-label="City" value={v.cityId} onChange={e=>setV(p=>({...p,cityId:e.target.value,localityId:''}))} className={field+' appearance-none pl-10'}><option value="">Any city</option>{cities.map(city=><option key={city.id} value={city.id}>{city.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/></div>
          <div className="relative"><select aria-label="Bedrooms" value={v.beds} onChange={e=>set('beds',e.target.value)} className={field+' appearance-none'}><option value="">Any BHK</option>{['1','2','3','4'].map(n=><option key={n} value={n}>{n}+ BHK</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/></div>
          <div className="relative"><select aria-label="Maximum budget" value={v.max} onChange={e=>set('max',e.target.value)} className={field+' appearance-none'}><option value="">Any budget</option>{classicBudgets.map(n=><option key={n} value={n}>Up to {formatPrice(n,v.purpose)}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/></div>
        </div>
        <button type="button" onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"><Search className="h-4 w-4"/>Search properties</button>
        <div className="mt-4 border-t border-gray-100 pt-3"><button type="button" onClick={()=>setAdvanced(!advanced)} aria-expanded={advanced} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"><SlidersHorizontal className="h-4 w-4"/>{advanced?'Hide advanced filters':'Advanced filters'}{activeCount>0&&<span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">{activeCount}</span>}<ChevronDown className={'h-4 w-4 transition '+(advanced?'rotate-180':'')}/></button></div>
        {advanced&&<div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className={label}>Minimum price</label><select value={v.min} onChange={e=>set('min',e.target.value)} className={field}><option value="">No minimum</option>{budgets.map(n=><option key={n} value={n}>{formatPrice(n,v.purpose)}</option>)}</select></div>
          <div><label className={label}>Property type</label><select className={field} value={v.type} onChange={e=>set('type',e.target.value)}><option value="">Any type</option>{TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
          <div><label className={label}>City</label><select className={field} value={v.cityId} onChange={e=>setV(p=>({...p,cityId:e.target.value,localityId:''}))}><option value="">All cities</option>{cities.map(city=><option key={city.id} value={city.id}>{city.name}</option>)}</select></div>
          <div><label className={label}>Locality</label><select className={field} value={v.localityId} disabled={!v.cityId} onChange={e=>set('localityId',e.target.value)}><option value="">All localities</option>{cityLocalities.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
          <div><label className={label}>PIN code</label><input className={field} inputMode="numeric" maxLength={6} value={v.pincode} onChange={e=>set('pincode',e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="6-digit PIN"/></div>
          <div><label className={label}>Bathrooms</label><select className={field} value={v.baths} onChange={e=>set('baths',e.target.value)}><option value="">Any bathrooms</option>{['1','2','3','4'].map(n=><option key={n} value={n}>{n}+ bathrooms</option>)}</select></div>
          <div><label className={label}>Minimum area (sq ft)</label><input className={field} type="number" min="0" value={v.minArea} onChange={e=>set('minArea',e.target.value)} placeholder="e.g. 500"/></div>
          <div><label className={label}>Maximum area (sq ft)</label><input className={field} type="number" min="0" value={v.maxArea} onChange={e=>set('maxArea',e.target.value)} placeholder="e.g. 1500"/></div>
          <div><label className={label}>Furnishing</label><select className={field} value={v.furnishing} onChange={e=>set('furnishing',e.target.value)}><option value="">Any furnishing</option><option value="unfurnished">Unfurnished</option><option value="semi-furnished">Semi-furnished</option><option value="fully-furnished">Fully furnished</option></select></div>
          <div><label className={label}>Availability</label><select className={field} value={v.availability} onChange={e=>set('availability',e.target.value)}><option value="">Any availability</option><option value="now">Available now</option><option value="30">Within 30 days</option><option value="90">Within 90 days</option></select></div>
          <div className="sm:col-span-2 lg:col-span-3"><p className={label}>Amenities</p><div className="flex flex-wrap gap-2">{AMENITIES.map(a=><button type="button" key={a} onClick={()=>setV(p=>({...p,amenities:p.amenities.includes(a)?p.amenities.filter(x=>x!==a):[...p.amenities,a]}))} className={'rounded-full border px-3.5 py-2 text-sm font-medium transition '+(v.amenities.includes(a)?'border-blue-600 bg-blue-50 text-blue-700':'border-gray-200 bg-white text-gray-600 hover:border-gray-300')}>{v.amenities.includes(a)&&<Check className="mr-1 inline h-3.5 w-3.5"/>}{a}</button>)}</div></div>
        </div>}
      </div>
    </section>
  );
}
