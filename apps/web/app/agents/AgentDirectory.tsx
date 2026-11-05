'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { THANE_TOP_AGENTS } from '@/lib/thane-agents';
import { BusinessEnquiryForm } from './BusinessEnquiryForm';

type Props = { agents: Profile[] };
const cities = ['All Cities', 'Thane', 'Mumbai', 'Pune'];
const serviceFilters = ['All Services', 'Buy', 'Sell', 'Rent'];

function ContactForm({ agency, onClose }: { agency: string; onClose: () => void }) {
  const slug = agency.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label={'Contact ' + agency} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
      <div className="mb-4 flex justify-end"><button type="button" onClick={onClose} aria-label="Close" className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button></div>
      <BusinessEnquiryForm agencyName={agency} agencySlug={slug} onClose={onClose} />
    </div>
  </div>;
}
function RegisteredAgentCard({ agent }: { agent: Profile }) {
  return <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3"><div className="h-14 w-14 overflow-hidden rounded-full bg-slate-100">{agent.avatar_url ? <img src={agent.avatar_url} alt="" className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-xl font-bold text-slate-500">{(agent.full_name ?? 'A').charAt(0)}</div>}</div><div className="min-w-0"><h3 className="font-extrabold text-slate-950">{agent.full_name ?? 'GoNest agent'}</h3><p className="text-sm text-slate-500">{agent.agency_name ?? 'Independent agent'}</p></div></div>
    {agent.bio && <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{agent.bio}</p>}
    <p className="mt-3 text-xs text-slate-500">MahaRERA details on file: {agent.rera_number}</p>
    <Link href={'/agents/' + agent.id} className="mt-4 inline-flex justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">View agent profile</Link>
  </article>;
}

export function AgentDirectory({ agents }: Props) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [service, setService] = useState('All Services');
  const [minRating, setMinRating] = useState('Any rating');
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const publicAgencies = useMemo(() => THANE_TOP_AGENTS.filter(a =>
    (city === 'All Cities' || a.city === city) &&
    (service === 'All Services' || (a.services ?? []).includes(service)) &&
    (minRating === 'Any rating' || (a.rating ?? 0) >= Number(minRating)) &&
    (a.name + ' ' + a.city + ' ' + a.area + ' ' + a.address + ' ' + (a.services ?? []).join(' ') + ' ' + (a.businessType ?? '')).toLowerCase().includes(search.toLowerCase().trim())
  ), [city, service, minRating, search]);
  const registeredAgents = useMemo(() => agents.filter(a => a.role === 'agent' && a.agent_verified && Boolean(a.rera_number) && (city === 'All Cities' || [...(a.service_localities ?? []), ...(a.service_pincodes ?? [])].join(' ').toLowerCase().includes(city.toLowerCase())) && (!search.trim() || [a.full_name, a.agency_name, a.bio, a.rera_number, ...(a.service_localities ?? [])].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase().trim()))), [agents, city, search]);

  return <>
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest Agent Directory</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">Find real estate agents in Thane, Mumbai and Pune</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Browse local agencies and GoNest agent profiles. Public business listings are separate from GoNest-verified professionals.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search agency, agent or locality" className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-500"/>
          <select value={city} onChange={e=>setCity(e.target.value)} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">{cities.map(c=><option key={c}>{c}</option>)}</select>
          <select value={service} onChange={e=>setService(e.target.value)} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">{serviceFilters.map(s=><option key={s}>{s}</option>)}</select>
          <select value={minRating} onChange={e=>setMinRating(e.target.value)} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"><option>Any rating</option><option value="4">4.0+ public rating</option><option value="4.5">4.5+ public rating</option></select>
        </div>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Are you a property professional?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Create a GoNest profile and submit your details for review.</p>
          </div>
          <Link href="https://gonest-l7x7j1a67-jackfink9663-hues-projects.vercel.app/dashboard" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Create GoNest profile</Link>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-extrabold text-slate-950">Local real estate agencies</h2><p className="mt-1 text-sm text-slate-600">Business information for Thane, Mumbai and Pune.</p></div><span className="text-sm font-semibold text-slate-500">{publicAgencies.length} agencies</span></div>
      {publicAgencies.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{publicAgencies.map((agency) => <article key={agency.name} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-extrabold text-slate-600">{agency.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div><div className="min-w-0"><h3 className="text-lg font-extrabold leading-6 text-slate-950">{agency.name}</h3><p className="mt-1 text-sm font-semibold text-blue-700">{agency.city} · {agency.area}</p>{agency.rating != null && <p className="mt-1 text-sm font-bold text-slate-900">★ {agency.rating.toFixed(1)} <span className="font-normal text-slate-500">({agency.publicReviewCount?.toLocaleString()} public reviews)</span></p>}</div></div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{agency.address}</p>{agency.businessType && <p className="mt-3 text-sm font-medium text-slate-700">{agency.businessType}</p>}{agency.services?.length ? <div className="mt-3 flex flex-wrap gap-2">{agency.services.map(item=><span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{item}</span>)}</div> : null}{agency.rating != null && <p className="mt-3 text-xs leading-5 text-slate-500">Public rating and review count; these are not GoNest reviews or an independent GoNest endorsement.</p>}
        <div className="mt-auto pt-5"><button type="button" onClick={()=>setSelectedAgency(agency.name)} className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">Contact</button></div>
      </article>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No agencies match this search.</p>}
      <p className="mt-4 text-xs text-slate-500">Public business listings are not claimed GoNest accounts and are not GoNest-verified.</p>
    </section>

    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">Are you a property professional?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Create a GoNest profile and submit your details for review.</p>
          </div>
          <Link href="https://gonest.in/dashboard" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Create GoNest profile</Link>
        </div>
      </div>
    </section>

    {selectedAgency && <ContactForm agency={selectedAgency} onClose={()=>setSelectedAgency(null)}/>}
  </>;
}
