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
  return <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <Link href={'/agents/' + agent.id} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
      {agent.avatar_url ? <img src={agent.avatar_url} alt={name + ' profile'} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"/> : <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500"><span className="text-5xl font-semibold">{name.charAt(0).toUpperCase()}</span><span className="mt-2 text-xs font-semibold uppercase tracking-widest">Profile photo not added</span></div>}
      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-emerald-800 shadow-sm">GoNest verified</span>
      <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">{agent.total_listings} active listing{agent.total_listings === 1 ? '' : 's'}</span>
    </Link>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <div className="min-w-0">
        <h3 className="truncate text-lg font-extrabold text-slate-950">{name}</h3>
        <p className="mt-1 truncate text-sm font-medium text-slate-600">{agent.agency_name ?? 'Independent agent'}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {agent.phone_verified && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">Phone verified</span>}
        {agent.rera_number && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">RERA details on file</span>}
      </div>
      {agent.bio && <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{agent.bio}</p>}
      {!agent.bio && <p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">{(agent.service_localities ?? []).slice(0,3).join(' · ') || 'Local property professional'}</p>}
      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <Link href={'/agents/' + agent.id} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-800 hover:border-slate-400">View profile</Link>
        <Link href={'/agents/' + agent.id + '#contact-agent'} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white hover:bg-blue-700">Contact</Link>
      </div>
    </div>
  </article>;
}

function PublicAgencyListingCard({ agency }: { agency: (typeof THANE_TOP_AGENTS)[number] }) {
  return <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
      {agency.imageUrl ? <img src={agency.imageUrl} alt={agency.name + ' business profile'} className="h-full w-full object-contain bg-white p-8"/> : <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/80 bg-white text-3xl font-extrabold text-slate-600 shadow-sm">{agency.name.split(/\\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div>}
      <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">{agency.city} · {agency.area}</span>
    </div>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <h3 className="text-lg font-extrabold text-slate-950">{agency.name}</h3>
      <p className="mt-2 text-sm leading-5 text-slate-600">{agency.address}</p>
      {agency.rating != null && <p className="mt-2 text-sm font-bold text-slate-900">★{agency.rating.toFixed(1)} <span className="font-normal text-slate-500">({agency.publicReviewCount?.toLocaleString('en-IN')} public reviews)</span></p>}
      {agency.businessType && <p className="mt-3 text-sm font-medium text-slate-700">{agency.businessType}</p>}
      {agency.services?.length ? <p className="mt-3 text-sm font-bold text-slate-900">{agency.services.join(' · ')}</p> : null}
      {agency.phone && <a href={'tel:' + agency.phone.replace(/[^+\\d]/g, '')} className="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:underline">Call {agency.phone}</a>}
      {agency.websiteUrl && <a href={agency.websiteUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-blue-700 hover:underline">Official website</a>}
      <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(agency.mapQuery)} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-slate-600 hover:underline">Directions & business details</a>
      <div className="mt-auto pt-5"><Link href={`/agents/business/${agencySlug(agency.name)}`} className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">View business profile</Link></div>
    </div>
  </article>;
}

export function AgentDirectory({ agents }: Props) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [service, setService] = useState('All Services');
  const [minRating, setMinRating] = useState('Any rating');
  const publicAgencies = useMemo(() => THANE_TOP_AGENTS.filter(a =>
    (city === 'All Cities' || a.city === city) &&
    (service === 'All Services' || (a.services ?? []).includes(service)) &&
    (minRating === 'Any rating' || (a.rating != null && a.rating >= Number(minRating))) &&
    (a.name + ' ' + a.city + ' ' + a.area + ' ' + a.address + ' ' + (a.services ?? []).join(' ') + ' ' + (a.businessType ?? '')).toLowerCase().includes(search.toLowerCase().trim())
  ), [city, service, minRating, search]);
  const registeredAgents = useMemo(() => agents.filter(a => a.role === 'agent' && a.agent_verified && Boolean(a.rera_number) && (city === 'All Cities' || [...(a.service_localities ?? []), ...(a.service_pincodes ?? [])].join(' ').toLowerCase().includes(city.toLowerCase())) && (!search.trim() || [a.full_name, a.agency_name, a.bio, a.rera_number, ...(a.service_localities ?? [])].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase().trim()))), [agents, city, search]);

  return <>
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest Agent Directory</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">Find real estate agents in Thane, Mumbai and Pune</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Discover property professionals using the same visual listing experience as Buy and Rent. GoNest-verified agents and public business profiles are clearly distinguished.</p>
        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search agent, agency, RERA or locality" className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500"/>
          <select value={city} onChange={e=>setCity(e.target.value)} className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">{cities.map(c=><option key={c}>{c}</option>)}</select>
          <select value={service} onChange={e=>setService(e.target.value)} className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">{serviceFilters.map(s=><option key={s}>{s}</option>)}</select>
          <select value={minRating} onChange={e=>setMinRating(e.target.value)} className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700"><option>Any rating</option><option value="4">4.0+ public rating</option><option value="4.5">4.5+ public rating</option></select>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-9 md:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest professionals</p><h2 className="mt-1 text-2xl font-extrabold text-slate-950">Real estate agent profiles</h2><p className="mt-1 text-sm text-slate-600">Explore agent and brokerage profiles in the same image-led, responsive card layout as property search. GoNest verification is shown only where profile evidence has been reviewed.</p></div><span className="text-sm font-semibold text-slate-500">{registeredAgents.length + publicAgencies.length} results</span></div>
      {(registeredAgents.length + publicAgencies.length) > 0 ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{registeredAgents.map(a=><AgentListingCard key={a.id} agent={a}/>)}{publicAgencies.map(agency=><PublicAgencyListingCard key={agency.name} agency={agency}/>)}</div> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No agent profiles match these filters.</p>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blue-50 p-5"><div><h3 className="font-extrabold text-slate-950">Are you a property professional?</h3><p className="mt-1 text-sm text-slate-600">Create a GoNest profile and submit your details for review.</p></div><Link href="/dashboard" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Create GoNest profile</Link></div>
    </section>
  </>;
}
