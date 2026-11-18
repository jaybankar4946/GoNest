'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';

type Props = { agents: Profile[] };
const cities = ['All Cities', 'Thane', 'Mumbai', 'Pune'];
const serviceFilters = ['All Services', 'Buy', 'Sell', 'Rent'];
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'G';

function AgentListingCard({ agent }: { agent: Profile }) {
  const name = agent.full_name ?? 'GoNest agent';
  const brokerage = agent.agency_name && agent.agency_name !== name ? agent.agency_name : null;
  const verified = agent.agent_verified && Boolean(agent.rera_number);
  const places = [...(agent.service_localities ?? [])].slice(0, 3);
  const pins = (agent.service_pincodes ?? []).slice(0, 2);
  const profileHref = '/agents/' + agent.id;
  return <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-5">
    <div className="flex items-start gap-4">
      <Link href={profileHref} aria-label={'View ' + name} className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 sm:h-[72px] sm:w-[72px]">
        {agent.avatar_url ? <img src={agent.avatar_url} alt={name + ' profile'} loading="lazy" className="h-full w-full object-cover"/> : <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xl font-semibold text-slate-500">{initials(agent.agency_name || name)}</span>}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={profileHref} className="block"><h3 className="truncate text-base font-extrabold text-slate-950 hover:underline sm:text-lg">{name}</h3></Link>
        {brokerage && <p className="truncate text-sm text-slate-600">{brokerage}</p>}
        {agent.rating != null && <p className="mt-1 text-sm font-bold text-slate-900">★ {Number(agent.rating).toFixed(1)} <span className="font-normal text-slate-500">({agent.review_count > 0 ? agent.review_count.toLocaleString('en-IN') : 'rating'})</span></p>}
        {verified && <span className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">✓ GoNest verified</span>}
      </div>
    </div>
    <div className="mt-4 space-y-1 text-sm text-slate-600">
      <p><span className="font-semibold text-slate-900">Services:</span> Rent · Buy · Sell</p>
      {(places.length > 0 || pins.length > 0) && <p className="line-clamp-1"><span className="font-semibold text-slate-900">Areas:</span> {[...places, ...pins].join(' · ')}</p>}
      <p><span className="font-semibold text-slate-900">RERA:</span> {agent.rera_number ? 'details submitted' : 'not provided'}</p>
    </div>
    {agent.bio && <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">{agent.bio}</p>}
    <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
      <Link href={profileHref} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 hover:border-slate-500">View profile</Link>
      <Link href={profileHref + '#contact-agent'} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700">Contact</Link>
    </div>
  </article>;
}

export function AgentDirectory({ agents }: Props) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [service, setService] = useState('All Services');
  const [minRating, setMinRating] = useState('Any rating');
  const [loc, setLoc] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [area, setArea] = useState('Any area');
  const areaOptions = useMemo(() => Array.from(new Set(agents.flatMap(a => a.service_localities ?? []).map(x => x.trim()).filter(Boolean))).sort(), [agents]);
  const registeredAgents = useMemo(() => agents.filter(a => {
    if (a.role !== 'agent') return false;
    const locations = [...(a.service_localities ?? []), ...(a.service_pincodes ?? [])].join(' ').toLowerCase();
    const cityPrefixes: Record<string, string[]> = { Mumbai: ['400'], Thane: ['4006', '401'], Pune: ['411', '412'] };
    const cityMatch = city === 'All Cities' || locations.includes(city.toLowerCase()) || (cityPrefixes[city] ?? []).some(prefix => (a.service_pincodes ?? []).some(pin => pin.startsWith(prefix)));
    const searchable = [a.full_name, a.agency_name, a.bio, a.rera_number, ...(a.service_localities ?? []), ...(a.service_pincodes ?? [])].filter(Boolean).join(' ').toLowerCase();
    const isVerified = Boolean(a.agent_verified && a.rera_number);
    const areaMatch = area === 'Any area' || (a.service_localities ?? []).includes(area);
    const locMatch = !loc.trim() || [...(a.service_localities ?? []), ...(a.service_pincodes ?? [])].join(' ').toLowerCase().includes(loc.toLowerCase().trim());
    return cityMatch && areaMatch && locMatch && (!verifiedOnly || isVerified) && (!search.trim() || searchable.includes(search.toLowerCase().trim()));
  }), [agents, city, search, loc, verifiedOnly, area]);
  const toggleService = (v: string) => setService(service === v ? 'All Services' : v);
  const chipCls = (on: boolean) => "rounded-full border px-4 py-2 text-sm font-semibold transition " + (on ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-800 hover:border-slate-500");

  return <>
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 pb-6 pt-9 md:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">Real estate agents in Thane, Mumbai &amp; Pune</h1>
        <p className="mt-2 text-base text-slate-600">Find a property professional, check their RERA details and contact them directly.</p>
        <form onSubmit={e => { e.preventDefault(); document.getElementById('agent-results')?.scrollIntoView({ behavior: 'smooth' }); }} className="mt-5 flex flex-wrap gap-3" role="search">
          <input value={loc} onChange={e => setLoc(e.target.value)} aria-label="City, neighbourhood or PIN code" placeholder="City, neighbourhood or PIN code" className="min-h-12 min-w-[220px] flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} aria-label="Agent or business name" placeholder="Agent or business name" className="min-h-12 min-w-[220px] flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-500" />
          <button type="submit" className="min-h-12 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white hover:bg-blue-700">Find agent</button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Agent filters">
          <button type="button" aria-pressed={service === 'Buy'} onClick={() => toggleService('Buy')} className={chipCls(service === 'Buy')}>Buying</button>
          <button type="button" aria-pressed={service === 'Sell'} onClick={() => toggleService('Sell')} className={chipCls(service === 'Sell')}>Selling</button>
          <button type="button" aria-pressed={service === 'Rent'} onClick={() => toggleService('Rent')} className={chipCls(service === 'Rent')}>Renting</button>
          <button type="button" aria-pressed={verifiedOnly} onClick={() => setVerifiedOnly(v => !v)} className={chipCls(verifiedOnly)}>GoNest verified</button>
          <button type="button" disabled title="No language data yet" className="cursor-not-allowed rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-400">Language</button>
          <select value={area} onChange={e => setArea(e.target.value)} aria-label="Area" className={chipCls(area !== 'Any area') + ' appearance-none pr-4'}><option>Any area</option>{areaOptions.map(x => <option key={x}>{x}</option>)}</select>
          <span className="ml-auto text-sm text-slate-500" aria-live="polite">{registeredAgents.length} found</span>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blue-50 p-5"><div><h3 className="font-extrabold text-slate-950">Are you a property professional?</h3><p className="mt-1 text-sm text-slate-600">Create a GoNest profile and submit your details for review.</p></div><Link href="/dashboard" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Create GoNest profile</Link></div>
      </div>
    </section>
    <section id="agent-results" className="mx-auto max-w-7xl px-5 py-9 md:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest professionals</p><h2 className="mt-1 text-2xl font-extrabold text-slate-950">Real estate agent profiles</h2><p className="mt-1 text-sm text-slate-600">Explore agent and brokerage profiles in the same image-led, responsive card layout as property search. New agent profiles appear after account creation; verification status is shown separately while details are reviewed.</p></div><span className="text-sm font-semibold text-slate-500">{registeredAgents.length} results</span></div>
      {registeredAgents.length > 0 ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{registeredAgents.map(a=><AgentListingCard key={a.id} agent={a}/>)}</div> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No agent profiles match these filters.</p>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blue-50 p-5"><div><h3 className="font-extrabold text-slate-950">Are you a property professional?</h3><p className="mt-1 text-sm text-slate-600">Create a GoNest profile and submit your details for review.</p></div><Link href="/dashboard" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Create GoNest profile</Link></div>
    </section>
  </>;
}
