'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { City, Locality, PropertyType } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { AlertCircle, Calculator, CheckCircle2, Info, LoaderCircle, MapPin } from 'lucide-react';

type Comparable = { id: string; title: string; price: number; sqft: number; property_type: string; bedrooms: number; city_id: string; locality_id: string };
const TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment / Flat' }, { value: 'villa', label: 'Villa' },
  { value: 'house', label: 'Independent house' }, { value: 'plot', label: 'Plot / Land' },
  { value: 'commercial', label: 'Commercial' }, { value: 'office', label: 'Office' },
];

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function HomeValueEstimator({ cities }: { cities: City[] }) {
  const [cityId, setCityId] = useState(cities.find(c => /mumbai/i.test(c.name))?.id ?? '');
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [localityId, setLocalityId] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('2');
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [searched, setSearched] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!cityId) { setLocalities([]); setLocalityId(''); return; }
      setLoadingLocalities(true);
      const { data, error: queryError } = await supabase.from('localities')
        .select('id,city_id,name,slug,latitude,longitude').eq('city_id', cityId).order('name');
      if (cancelled) return;
      setLocalities((data ?? []) as Locality[]);
      setLocalityId('');
      setLoadingLocalities(false);
      if (queryError) setError('Could not load localities. Please try again.');
      else setError('');
    }
    void load();
    return () => { cancelled = true; };
  }, [cityId]);

  const selectedCity = cities.find(c => c.id === cityId);
  const selectedLocality = localities.find(l => l.id === localityId);
  const result = useMemo(() => {
    if (comparables.length < 5 || !area || Number(area) <= 0) return null;
    const perSqft = comparables.map(l => l.price / l.sqft).filter(n => Number.isFinite(n) && n > 0);
    if (perSqft.length < 5) return null;
    const central = median(perSqft);
    return { low: Math.round(central * Number(area) * 0.92), mid: Math.round(central * Number(area)), high: Math.round(central * Number(area) * 1.08), medianPerSqft: Math.round(central) };
  }, [comparables, area]);

  async function calculate() {
    setError('');
    setSearched(false);
    if (!cityId || !localityId || !area || !Number.isFinite(Number(area)) || Number(area) < 100) {
      setError('Choose a city and locality, then enter a valid area in square feet (minimum 100).');
      return;
    }
    setCalculating(true);
    let query = supabase.from('listings')
      .select('id,title,price,sqft,property_type,bedrooms,city_id,locality_id')
      .eq('status', 'active').eq('is_sample', false).eq('purpose', 'sale')
      .eq('city_id', cityId).eq('locality_id', localityId).eq('property_type', propertyType)
      .not('sqft', 'is', null).gt('sqft', 0).gt('price', 0).limit(100);
    if (propertyType !== 'plot') query = query.gte('bedrooms', Math.max(0, Number(bedrooms) - 1)).lte('bedrooms', Number(bedrooms) + 1);
    const { data, error: queryError } = await query;
    setCalculating(false);
    if (queryError) {
      setError('We could not retrieve comparable listings. Please try again later.');
      return;
    }
    setComparables((data ?? []) as Comparable[]);
    setSearched(true);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
      <form className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={e => { e.preventDefault(); void calculate(); }}>
        <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-3 text-blue-700"><Calculator size={22} /></span><div><h2 className="text-xl font-bold text-slate-950">Estimate your home value</h2><p className="mt-1 text-sm text-slate-500">Takes about a minute</p></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">City<select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" value={cityId} onChange={e => { setCityId(e.target.value); setSearched(false); }} required><option value="">Select city</option>{cities.filter(c => /mumbai|pune/i.test(c.name)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Locality<select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" value={localityId} onChange={e => { setLocalityId(e.target.value); setSearched(false); }} required disabled={!cityId || loadingLocalities}><option value="">{loadingLocalities ? 'Loading localities…' : 'Select locality'}</option>{localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Property type<select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" value={propertyType} onChange={e => { setPropertyType(e.target.value as PropertyType); setSearched(false); }} required>{TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
          {propertyType !== 'plot' && <label className="text-sm font-semibold text-slate-700">Bedrooms<select className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" value={bedrooms} onChange={e => setBedrooms(e.target.value)}><option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3 BHK</option><option value="4">4 BHK</option><option value="5">5+ BHK</option></select></label>}
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Built-up / listing area (sq ft)<input className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" type="number" min="100" max="100000" step="1" inputMode="numeric" value={area} onChange={e => { setArea(e.target.value); setSearched(false); }} placeholder="e.g. 950" required /><span className="mt-1 block text-xs font-normal text-slate-500">Use the same area basis as comparable listings. Carpet area and built-up area are not interchangeable.</span></label>
        </div>
        {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</p>}
        <button disabled={calculating || loadingLocalities} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{calculating ? <><LoaderCircle size={18} className="animate-spin" /> Comparing listings…</> : <><Calculator size={18} /> Estimate home value</>}</button>
        <p className="mt-3 text-xs leading-5 text-slate-500">No personal contact details are required to see this estimate.</p>
      </form>

      <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-7">
        <div className="flex items-center gap-2 text-blue-200"><MapPin size={17} /><span className="text-sm font-semibold">Your estimate</span></div>
        {!searched && <div className="mt-7"><h2 className="text-2xl font-bold">Start with your property details</h2><p className="mt-3 text-sm leading-6 text-slate-300">We’ll compare active, non-sample GoNest sale listings in the selected locality and property category. If the data is too limited, we’ll say so.</p><div className="mt-6 rounded-2xl border border-slate-700 p-4"><div className="flex items-start gap-3"><Info size={19} className="mt-0.5 shrink-0 text-blue-200" /><p className="text-sm leading-6 text-slate-300">This first version uses asking prices per square foot. It does not yet use registered sale deeds, government guidance values or a trained valuation model.</p></div></div></div>}
        {searched && comparables.length < 5 && <div className="mt-7"><div className="flex items-center gap-2 text-amber-200"><AlertCircle size={22} /><h2 className="text-xl font-bold">Not enough comparable data yet</h2></div><p className="mt-3 text-sm leading-6 text-slate-300">We found {comparables.length} matching active listings. GoNest needs at least 5 comparable listings for this preliminary estimate, so we won’t generate a potentially misleading price.</p><p className="mt-4 text-sm text-slate-300">Try another locality or property type, or browse <a className="font-semibold text-blue-200 underline" href="/buy">current properties for sale</a>.</p></div>}
        {searched && result && <div className="mt-7"><div className="text-sm text-slate-300">Indicative listing-based range</div><div className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{formatPrice(result.low, 'sale')} – {formatPrice(result.high, 'sale')}</div><div className="mt-3 text-sm text-slate-300">Midpoint estimate: <strong className="text-white">{formatPrice(result.mid, 'sale')}</strong></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-800 p-3"><p className="text-xs text-slate-300">Comparable listings</p><p className="mt-1 text-xl font-bold">{comparables.length}</p></div><div className="rounded-xl bg-slate-800 p-3"><p className="text-xs text-slate-300">Median asking price / sq ft</p><p className="mt-1 text-xl font-bold">{formatPrice(result.medianPerSqft, 'sale')}</p></div></div><div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-700 p-3 text-sm leading-6 text-slate-300"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />Based on {comparables.length} active asking listings in {selectedLocality?.name}, {selectedCity?.name}. The range is a simple ±8% band around the median price-per-square-foot calculation, not a statistical confidence interval or appraisal.</div></div>}
      </div>
    </section>
  );
}
