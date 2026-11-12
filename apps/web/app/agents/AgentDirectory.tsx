'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';

type Props = { agents: Profile[]; brokerages: any[] };
const agencySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function AgentListingCard({ agent }: { agent: Profile }) {
  const name = agent.full_name ?? 'GoNest agent';
  const verified = agent.agent_verified && Boolean(agent.rera_number);
  return <article className="flex h-full gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
    <Link href={'/agents/' + agent.id} aria-label={'View ' + name} className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-slate-100">
      {agent.avatar_url ? <img src={agent.avatar_url} alt={name} className="h-full w-full object-cover"/> : <span className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-500">{name.charAt(0).toUpperCase()}</span>}
    </Link>
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-base font-bold text-slate-950">{name}</h3><span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (verified ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>{verified ? "Verified" : "Under review"}</span></div>
      <p className="mt-0.5 truncate text-sm text-slate-600">{agent.agency_name ?? 'Independent agent'}</p>
      <p className="mt-1 text-xs text-slate-500">{agent.rera_number ? 'RERA details submitted' : 'RERA details not provided'} · {agent.total_listings ?? 0} active listings</p>
      {(agent.service_localities ?? []).length > 0 && <p className="mt-1 truncate text-xs text-slate-500">{(agent.service_localities ?? []).join(' · ')}</p>}
      <div className="mt-3 flex flex-wrap gap-2"><Link href={'/agents/' + agent.id} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">View profile</Link><Link href={'/agents/' + agent.id + '#contact-agent'} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Contact</Link></div>
    </div>
  </article>;
}

function PublicAgencyListingCard({ agency }: { agency: any }) {
  const name = agency.business_name ?? 'Property agency';
  const area = (agency.localities ?? []).join(' · ');
  const city = agency.city?.name ?? '';
  const pin = agency.public_business_address?.match(/\b\d{6}\b/)?.[0] ?? null;
  const slug = agencySlug(name);
  const profileHref = '/agents/business/' + slug;
  const verified = agency.verification_status === 'verified';
  return <article className="flex h-full gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
    <Link href={profileHref} aria-label={'View ' + name} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-slate-100 text-lg font-bold text-slate-600">{name.split(/\s+/).slice(0,2).map((w:string)=>w[0]).join('').toUpperCase()}</Link>
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-bold text-slate-950">{name}</h3><span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (verified ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>{verified ? "Verified" : "Business profile"}</span></div>
      <p className="mt-0.5 text-sm text-slate-600">{[area, city].filter(Boolean).join(' · ')}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{agency.public_business_address ?? 'Address not provided'}{pin ? ' · ' + pin : ''}</p>
      <p className="mt-1 text-xs text-slate-500">{agency.rera_registration ? 'RERA details submitted' : 'RERA details not provided'}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-3"><Link href={profileHref} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">View profile</Link>{agency.public_business_phone && <a href={'tel:' + agency.public_business_phone} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Contact</a>}</div>
    </div>
  </article>;
}

export function AgentDirectory({ agents, brokerages }: Props) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [service, setService] = useState('All Services');
  const [minRating, setMinRating] = useState('Any rating');
  const [loc, setLoc] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [area, setArea] = useState('Any area');
  const areaOptions = useMemo(() => Array.from(new Set([...brokerages.flatMap(a => a.localities ?? []), ...agents.flatMap(a => a.service_localities ?? [])].map((x:string) => x.trim()).filter(Boolean))).sort(), [agents, brokerages]);
  const publicAgencies = useMemo(() => brokerages.filter(a => {
    const cityName = a.city?.name ?? '';
    const areas = (a.localities ?? []).join(' ');
    const text = [a.business_name, cityName, areas, a.public_business_address, a.public_business_phone, a.rera_registration].filter(Boolean).join(' ').toLowerCase();
    return (city === 'All Cities' || cityName === city)
      && (!verifiedOnly || a.verification_status === 'verified')
      && (area === 'Any area' || (a.localities ?? []).some((x:string) => x.includes(area)))
      && (!loc.trim() || (cityName + ' ' + areas + ' ' + (a.public_business_address ?? '')).toLowerCase().includes(loc.toLowerCase().trim()))
      && (service === 'All Services')
      && (minRating === 'Any rating')
      && text.includes(search.toLowerCase().trim());
  }), [brokerages, city, verifiedOnly, area, loc, service, minRating, search]);
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
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest professionals</p><h2 className="mt-1 text-2xl font-extrabold text-slate-950">Real estate agent profiles</h2><p className="mt-1 text-sm text-slate-600">Compact agent and agency profiles with clear contact details and verification status.</p></div><span className="text-sm font-semibold text-slate-500">{registeredAgents.length + publicAgencies.length} results</span></div>
      {(registeredAgents.length + publicAgencies.length) > 0 ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">{registeredAgents.map(a=><AgentListingCard key={a.id} agent={a}/>)}{publicAgencies.map(agency=><PublicAgencyListingCard key={agency.name} agency={agency}/>)}</div> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No agent profiles match these filters.</p>}
    </section>
  </>;
}
