'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { THANE_TOP_AGENTS } from '@/lib/thane-agents';

type Props = { agents: Profile[] };
const cities = ['All Cities', 'Thane', 'Mumbai', 'Pune'];
const serviceFilters = ['All Services', 'Buy', 'Sell', 'Rent'];
const agencySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function AgentListingCard({ agent }: { agent: Profile }) {
  const name = agent.full_name ?? 'GoNest agent';
  const verified = agent.agent_verified && Boolean(agent.rera_number);
  const operations = ['Rent', 'Buy', 'Sell'];
  return <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <Link href={'/agents/' + agent.id} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
      {agent.avatar_url ? <img src={agent.avatar_url} alt={name + ' profile'} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"/> : <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500"><span className="text-5xl font-semibold">{name.charAt(0).toUpperCase()}</span><span className="mt-2 text-xs font-semibold uppercase tracking-widest">Profile photo not added</span></div>}
      <span className={"absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm " + (verified ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>{verified ? "GoNest verified" : "Profile under review"}</span>
      <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">{agent.total_listings} active listings</span>
    </Link>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <h3 className="truncate text-lg font-extrabold text-slate-950">{name}</h3>
      <p className="mt-1 truncate text-sm font-medium text-slate-600">{agent.agency_name ?? 'Independent agent'}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{agent.rera_number ? 'RERA details submitted' : 'RERA details not provided'}</span>
        {(agent.service_pincodes ?? []).map(pin=><span key={pin} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{pin}</span>)}
        {(agent.service_localities ?? []).map(locality=><span key={locality} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{locality}</span>)}
      </div>
      {agent.bio && <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{agent.bio}</p>}
      <p className="mt-3 text-sm font-bold text-slate-900">{operations.join(' · ')}</p>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <Link href={'/agents/' + agent.id} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-800 hover:border-slate-400">View profile</Link>
        <Link href={'/agents/' + agent.id + '#contact-agent'} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white hover:bg-blue-700">Contact</Link>
      </div>
    </div>
  </article>;
}

function PublicAgencyListingCard({ agency }: { agency: (typeof THANE_TOP_AGENTS)[number] }) {
  const services = ['Rent', 'Buy', 'Sell'];
  const pin = agency.address.match(/\\b\\d{6}\\b/)?.[0] ?? null;
  const slug = agencySlug(agency.name);
  const profileHref = `/agents/business/${slug}`;
  return <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <Link href={profileHref} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
      {agency.imageUrl ? <img src={agency.imageUrl} alt={agency.name + ' profile'} className="h-full w-full object-contain bg-white p-8"/> : <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500"><span className="text-5xl font-semibold">{agency.name.split(/\\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}</span><span className="mt-2 text-xs font-semibold uppercase tracking-widest">Agency profile</span></div>}
      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-slate-800 shadow-sm">Business profile</span>
      <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">0 active listings</span>
    </Link>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <h3 className="text-lg font-extrabold text-slate-950">{agency.name}</h3>
      <p className="mt-1 text-sm font-medium text-slate-600">{agency.area} · {agency.city}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">RERA details not provided</span>
        {pin && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{pin}</span>}
      </div>
      <p className="mt-3 text-sm font-bold text-slate-900">{services.join(' · ')}</p>
      <p className="mt-3 text-sm leading-5 text-slate-600">{agency.address}</p>
      {agency.rating != null && <p className="mt-3 text-sm font-bold text-slate-900">★{agency.rating.toFixed(1)} <span className="font-normal text-slate-500">({agency.publicReviewCount != null ? agency.publicReviewCount.toLocaleString('en-IN') + ' public reviews' : 'public rating'})</span></p>}
      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <Link href={profileHref} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-800 hover:border-slate-400">View profile</Link>
        <Link href={profileHref + '#contact-agency'} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white hover:bg-blue-700">Contact</Link>
      </div>
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
  const areaOptions = useMemo(() => Array.from(new Set([...THANE_TOP_AGENTS.flatMap(a => a.area.split(' · ')), ...agents.flatMap(a => a.service_localities ?? [])].map(x => x.trim()).filter(Boolean))).sort(), [agents]);
  const publicAgencies = useMemo(() => THANE_TOP_AGENTS.filter(a =>
    (city === 'All Cities' || a.city === city) &&
    !verifiedOnly &&
    (area === 'Any area' || a.area.includes(area)) &&
    (!loc.trim() || (a.city + ' ' + a.area + ' ' + a.address).toLowerCase().includes(loc.toLowerCase().trim())) &&
    (service === 'All Services' || (a.services ?? []).includes(service)) &&
    (minRating === 'Any rating' || (a.rating != null && a.rating >= Number(minRating))) &&
    (a.name + ' ' + a.city + ' ' + a.area + ' ' + a.address + ' ' + (a.services ?? []).join(' ') + ' ' + (a.businessType ?? '')).toLowerCase().includes(search.toLowerCase().trim())
  ), [city, service, minRating, search, loc, verifiedOnly, area]);
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
          <span className="ml-auto text-sm text-slate-500" aria-live="polite">{registeredAgents.length + publicAgencies.length} found</span>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blue-50 p-5"><div><h3 className="font-extrabold text-slate-950">Are you a property professional?</h3><p className="mt-1 text-sm text-slate-600">Create a GoNest profile and submit your details for review.</p></div><Link href="/dashboard" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Create GoNest profile</Link></div>
      </div>
    </section>
    <section id="agent-results" className="mx-auto max-w-7xl px-5 py-9 md:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest professionals</p><h2 className="mt-1 text-2xl font-extrabold text-slate-950">Real estate agent profiles</h2><p className="mt-1 text-sm text-slate-600">Explore agent and brokerage profiles in the same image-led, responsive card layout as property search. New agent profiles appear after account creation; verification status is shown separately while details are reviewed.</p></div><span className="text-sm font-semibold text-slate-500">{registeredAgents.length + publicAgencies.length} results</span></div>
      {(registeredAgents.length + publicAgencies.length) > 0 ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">{registeredAgents.map(a=><AgentListingCard key={a.id} agent={a}/>)}{publicAgencies.map(agency=><PublicAgencyListingCard key={agency.name} agency={agency}/>)}</div> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No agent profiles match these filters.</p>}
    </section>
  </>;
}
