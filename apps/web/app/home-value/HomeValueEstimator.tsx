'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { City, Locality, PropertyType } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { AlertCircle, Calculator, CheckCircle2, Info, LoaderCircle, MapPin } from 'lucide-react';

type Comparable = { id: string; title: string; price: number; sqft: number; property_type: string; bedrooms: number | null; city_id: string; locality_id: string | null };
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
  const [matchScope, setMatchScope] = useState<'locality_bedrooms' | 'locality_type' | 'city_type'>('locality_bedrooms');
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
    if (comparables.length < 3 || !area || Number(area) <= 0) return null;
    const rates = comparables.map(l => ({ rate: Number(l.price) / Number(l.sqft) }))
      .filter(x => Number.isFinite(x.rate) && x.rate > 0);
    if (rates.length < 3) return null;
    const sorted = rates.map(x => x.rate).sort((a, b) => a - b);
    const q1 = sorted[Math.floor((sorted.length - 1) * 0.25)];
    const q3 = sorted[Math.floor((sorted.length - 1) * 0.75)];
    const iqr = q3 - q1;
    const filtered = iqr > 0 ? rates.filter(x => x.rate >= Math.max(0, q1 - 1.5 * iqr) && x.rate <= q3 + 1.5 * iqr) : rates;
    const usable = filtered.length >= 3 ? filtered : rates;
    const central = median(usable.map(x => x.rate));
    const band = matchScope === 'locality_bedrooms' ? 0.08 : matchScope === 'locality_type' ? 0.12 : 0.18;
    return { low: Math.round(central * Number(area) * (1 - band)), mid: Math.round(central * Number(area)), high: Math.round(central * Number(area) * (1 + band)), medianPerSqft: Math.round(central), usedCount: usable.length, excludedCount: comparables.length - usable.length, band };
  }, [comparables, area, matchScope]);

  async function calculate() {
    setError('');
    setSearched(false);
    if (!cityId || !localityId || !area || !Number.isFinite(Number(area)) || Number(area) < 100 || Number(area) > 100000) {
      setError('Choose a city and locality, then enter an area between 100 and 100,000 square feet.');
      return;
    }
    setCalculating(true);
    try {
      const base = () => supabase.from('listings')
        .select('id,title,price,sqft,property_type,bedrooms,city_id,locality_id')
        .eq('status', 'active').eq('is_sample', false).eq('purpose', 'sale')
        .eq('city_id', cityId).eq('property_type', propertyType)
        .not('sqft', 'is', null).gt('sqft', 0).gt('price', 0)
        .order('created_at', { ascending: false }).limit(500);
      let scope: 'locality_bedrooms' | 'locality_type' | 'city_type' = 'locality_bedrooms';
      let { data, error: queryError } = await base().eq('locality_id', localityId)
        .gte('bedrooms', propertyType === 'plot' ? 0 : Math.max(0, Number(bedrooms) - 1))
        .lte('bedrooms', propertyType === 'plot' ? 99 : Number(bedrooms) + 1);
      if (queryError) throw queryError;
      if ((data ?? []).length < 3) {
        scope = 'locality_type';
        const fallback = await base().eq('locality_id', localityId);
        if (fallback.error) throw fallback.error;
        data = fallback.data;
      }
      if ((data ?? []).length < 3) {
        scope = 'city_type';
        const fallback = await base();
        if (fallback.error) throw fallback.error;
        data = fallback.data;
      }
      const valid = ((data ?? []) as Comparable[]).filter(row =>
        Number(row.price) > 0 && Number(row.sqft) >= 100 && Number(row.sqft) <= 100000 &&
        Number.isFinite(Number(row.price) / Number(row.sqft))
      );
      setComparables(valid);
      setMatchScope(scope);
      setSearched(true);
    } catch {
      setError('We could not retrieve comparable listings. Please try again later.');
    } finally {
      setCalculating(false);
    }
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
        {!searched && <div className="mt-7"><h2 className="text-2xl font-bold">Start with your property details</h2><p className="mt-3 text-sm leading-6 text-slate-300">We’ll compare active, non-sample GoNest sale listings in the selected locality and property category. If the data is too limited, we’ll say so.</p><div className="mt-6 rounded-2xl border border-slate-700 p-4"><div className="flex items-start gap-3"><Info size={19} className="mt-0.5 shrink-0 text-blue-200" /><p className="text-sm leading-6 text-slate-300">The estimate uses asking prices, not registered transaction prices or government guidance values. The range widens when comparable data is less specific.</p></div></div></div>}
        {searched && comparables.length < 3 && <div className="mt-7"><div className="flex items-center gap-2 text-amber-200"><AlertCircle size={22} /><h2 className="text-xl font-bold">Not enough comparable data yet</h2></div><p className="mt-3 text-sm leading-6 text-slate-300">We found {comparables.length} matching active listings. GoNest needs at least 3 comparable listings for this preliminary estimate, so we won’t generate a potentially misleading price.</p><p className="mt-4 text-sm text-slate-300">Try another locality or property type, or browse <a className="font-semibold text-blue-200 underline" href="/buy">current properties for sale</a>.</p></div>}
        {searched && result && <div className="mt-7"><div className="text-sm text-slate-300">Indicative listing-based range</div><div className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{formatPrice(result.low, 'sale')} – {formatPrice(result.high, 'sale')}</div><div className="mt-3 text-sm text-slate-300">Midpoint estimate: <strong className="text-white">{formatPrice(result.mid, 'sale')}</strong></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-800 p-3"><p className="text-xs text-slate-300">Comparable listings used</p><p className="mt-1 text-xl font-bold">{result.usedCount}</p></div><div className="rounded-xl bg-slate-800 p-3"><p className="text-xs text-slate-300">Median asking price / sq ft</p><p className="mt-1 text-xl font-bold">{formatPrice(result.medianPerSqft, 'sale')}</p></div></div><div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-700 p-3 text-sm leading-6 text-slate-300"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />Based on {matchScope === 'locality_bedrooms' ? `similar homes in ${selectedLocality?.name}` : matchScope === 'locality_type' ? `matching property types in ${selectedLocality?.name}` : `matching property types across ${selectedCity?.name}`}. {result.excludedCount > 0 ? `Excluded ${result.excludedCount} extreme price-per-sq-ft outlier(s). ` : ''}This is an indicative asking-price comparison, not a formal valuation.</div></div>}
      </div>
    </section>
  );
}
