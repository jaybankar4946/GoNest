'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, SlidersHorizontal, X, Check } from 'lucide-react';
import { getAllLocalities } from '@/lib/api';
import { formatPrice } from '@/lib/format';
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
const AMENITIES = ['Parking', 'Lift', 'Gym', 'Swimming pool', 'Security', 'Power backup', 'Garden', 'Clubhouse', 'Pet friendly'];
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
    if (/^\\d{3,6}$/.test(term)) return [{label:term, cityId:v.cityId, localityId:'', kind:'PIN code'}];
    return [...localityMatches, ...cityMatches].slice(0, 7);
  }, [v.q, cities, localities, v.cityId]);

  const set = <K extends keyof PropertySearchValues>(key: K, value: PropertySearchValues[K]) => setV(prev => ({...prev, [key]:value}));
  const chooseSuggestion = (item: {label:string;cityId:string;localityId:string;kind:string}) => {
    if (item.kind === 'PIN code') setV(prev => ({...prev, pincode:item.label, q:''}));
    else setV(prev => ({...prev, q:item.label, cityId:item.cityId || prev.cityId, localityId:item.localityId}));
    setSuggestionsOpen(false);
  };
  const submit = () => {
    if (onSearch) { onSearch(v); return; }
    const params = new URLSearchParams();
    params.set('purpose', v.purpose);
    const location = v.q.trim();
    if (location) params.set('q', location);
    if (v.cityId) params.set('city', v.cityId);
    if (v.localityId) params.set('locality', v.localityId);
    if (v.pincode) params.set('pin', v.pincode);
    if (v.min) params.set('min', v.min);
    if (v.max) params.set('max', v.max);
    if (v.type) params.set('type', v.type);
    if (v.beds) params.set('beds', v.beds);
    if (v.baths) params.set('baths', v.baths);
    if (v.minArea) params.set('minArea', v.minArea);
    if (v.maxArea) params.set('maxArea', v.maxArea);
    if (v.furnishing) params.set('furnishing', v.furnishing);
    if (v.availability) params.set('availability', v.availability);
    if (v.amenities.length) params.set('amenities', v.amenities.join(','));
    router.push('/search?' + params.toString());
  };

  const activeCount = [v.type,v.beds,v.baths,v.minArea,v.maxArea,v.furnishing,v.availability,v.pincode].filter(Boolean).length + v.amenities.length;
  const budgets = v.purpose === 'rent' ? [10000,15000,25000,40000,60000,100000] : [2500000,5000000,7500000,10000000,20000000,50000000];

  return (
    <section className="relative z-20 w-full rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_18px_55px_-30px_rgba(15,23,42,.28)] sm:p-4">
      <div className="mb-3 flex items-center gap-1 rounded-full bg-slate-100 p-1 sm:mb-4 sm:inline-flex">
        {(['sale','rent'] as const).map(p => <button key={p} type="button" onClick={() => setV(prev => ({...prev,purpose:p,min:'',max:''}))} className={'rounded-full px-5 py-2 text-sm font-bold transition ' + (v.purpose===p?'bg-white text-slate-950 shadow-sm':'text-slate-500 hover:text-slate-900')}>{p==='sale'?'Buy':'Rent'}</button>)}
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(220px,1.6fr)_minmax(140px,.8fr)_minmax(140px,.8fr)_minmax(140px,.8fr)_auto] md:items-end">
        <div className="relative min-w-0">
          <label className={label}>Location</label>
          <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
            <MapPin className="mr-2 h-4 w-4 shrink-0 text-blue-600"/>
            <input value={v.q} onChange={e=>{set('q',e.target.value);setSuggestionsOpen(true);setFocusedSuggestion(0);set('localityId','');}} onFocus={()=>setSuggestionsOpen(true)} onBlur={()=>setTimeout(()=>setSuggestionsOpen(false),140)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(suggestionsOpen&&suggestions[focusedSuggestion])chooseSuggestion(suggestions[focusedSuggestion]);else submit();} if(e.key==='ArrowDown'){e.preventDefault();setFocusedSuggestion(i=>Math.min(i+1,Math.max(0,suggestions.length-1)));} if(e.key==='Escape')setSuggestionsOpen(false);}} placeholder="City, locality, landmark or PIN" className="w-full min-w-0 py-3 text-sm outline-none placeholder:text-slate-400"/>
            {v.q && <button type="button" onClick={()=>set('q','')} aria-label="Clear location" className="p-1 text-slate-400 hover:text-slate-800"><X className="h-4 w-4"/></button>}
          </div>
          {suggestionsOpen && suggestions.length>0 && <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">{suggestions.map((item,i)=><button key={item.kind+item.label} type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>chooseSuggestion(item)} className={'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 '+(focusedSuggestion===i?'bg-blue-50':'')}><MapPin className="h-4 w-4 text-slate-400"/><span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{item.label}</span><span className="text-xs text-slate-400">{item.kind}</span></button>)}</div>}
        </div>
        <div><label className={label}>Minimum price</label><select value={v.min} onChange={e=>set('min',e.target.value)} className={field}><option value="">No minimum</option>{budgets.map(n=><option key={n} value={n}>{formatPrice(n,v.purpose)}</option>)}</select></div>
        <div><label className={label}>Maximum price</label><select value={v.max} onChange={e=>set('max',e.target.value)} className={field}><option value="">No maximum</option>{budgets.map(n=><option key={n} value={n}>{formatPrice(n,v.purpose)}</option>)}</select></div>
        <div><label className={label}>Bedrooms</label><select value={v.beds} onChange={e=>set('beds',e.target.value)} className={field}><option value="">Any beds</option>{['1','2','3','4','5'].map(n=><option key={n} value={n}>{n}+ bedrooms</option>)}</select></div>
        <button type="button" onClick={submit} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"><Search className="h-4 w-4"/>Search</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <button type="button" onClick={()=>setAdvanced(!advanced)} aria-expanded={advanced} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"><SlidersHorizontal className="h-4 w-4"/>{advanced?'Hide filters':'Advanced filters'}{activeCount>0&&<span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">{activeCount}</span>}<ChevronDown className={'h-4 w-4 transition '+(advanced?'rotate-180':'')}/></button>
        <div className="flex flex-wrap gap-2">{v.type&&<button onClick={()=>set('type','')} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"> {v.type} ×</button>}{v.furnishing&&<button onClick={()=>set('furnishing','')} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{v.furnishing} ×</button>}</div>
      </div>
      {advanced&&<div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <div><label className={label}>City</label><select className={field} value={v.cityId} onChange={e=>setV(p=>({...p,cityId:e.target.value,localityId:''}))}><option value="">All cities</option>{cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className={label}>Locality</label><select className={field} value={v.localityId} disabled={!v.cityId} onChange={e=>set('localityId',e.target.value)}><option value="">All localities</option>{cityLocalities.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
        <div><label className={label}>PIN code</label><input className={field} inputMode="numeric" maxLength={6} value={v.pincode} onChange={e=>set('pincode',e.target.value.replace(/\\D/g,'').slice(0,6))} placeholder="6-digit PIN"/></div>
        <div><label className={label}>Property type</label><select className={field} value={v.type} onChange={e=>set('type',e.target.value)}><option value="">Any type</option>{TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
        <div><label className={label}>Bathrooms</label><select className={field} value={v.baths} onChange={e=>set('baths',e.target.value)}><option value="">Any bathrooms</option>{['1','2','3','4'].map(n=><option key={n} value={n}>{n}+ bathrooms</option>)}</select></div>
        <div><label className={label}>Minimum area (sq ft)</label><input className={field} type="number" min="0" value={v.minArea} onChange={e=>set('minArea',e.target.value)} placeholder="e.g. 500"/></div>
        <div><label className={label}>Maximum area (sq ft)</label><input className={field} type="number" min="0" value={v.maxArea} onChange={e=>set('maxArea',e.target.value)} placeholder="e.g. 1500"/></div>
        <div><label className={label}>Furnishing</label><select className={field} value={v.furnishing} onChange={e=>set('furnishing',e.target.value)}><option value="">Any furnishing</option><option value="unfurnished">Unfurnished</option><option value="semi-furnished">Semi-furnished</option><option value="fully-furnished">Fully furnished</option></select></div>
        <div><label className={label}>Availability</label><select className={field} value={v.availability} onChange={e=>set('availability',e.target.value)}><option value="">Any availability</option><option value="now">Available now</option><option value="30">Within 30 days</option><option value="90">Within 90 days</option></select></div>
        <div className="sm:col-span-2 lg:col-span-4"><p className={label}>Amenities</p><div className="flex flex-wrap gap-2">{AMENITIES.map(a=><button type="button" key={a} onClick={()=>setV(p=>({...p,amenities:p.amenities.includes(a)?p.amenities.filter(x=>x!==a):[...p.amenities,a]}))} className={'rounded-full border px-3.5 py-2 text-sm font-medium transition '+(v.amenities.includes(a)?'border-blue-600 bg-blue-50 text-blue-700':'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}>{v.amenities.includes(a)&&<Check className="mr-1 inline h-3.5 w-3.5"/>}{a}</button>)}</div></div>
      </div>}
    </section>
  );
}
