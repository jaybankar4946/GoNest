'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { THANE_TOP_AGENTS } from '@/lib/thane-agents';

type Props = { agents: Profile[] };
const cities = ['All Cities', 'Thane', 'Mumbai', 'Pune'];

const agencySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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
  const publicAgencies = useMemo(() => THANE_TOP_AGENTS.filter(a => (city === 'All Cities' || a.city === city) && (a.name + ' ' + a.city + ' ' + a.area + ' ' + a.address).toLowerCase().includes(search.toLowerCase().trim())), [city, search]);
  const registeredAgents = useMemo(() => agents.filter(a => a.role === 'agent' && a.agent_verified && Boolean(a.rera_number) && (city === 'All Cities' || [...(a.service_localities ?? []), ...(a.service_pincodes ?? [])].join(' ').toLowerCase().includes(city.toLowerCase())) && (!search.trim() || [a.full_name, a.agency_name, a.bio, a.rera_number, ...(a.service_localities ?? [])].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase().trim()))), [agents, city, search]);

  return <>
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest Agent Directory</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">Find real estate agents in Thane, Mumbai and Pune</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Browse local agencies and GoNest agent profiles. Public business listings are separate from GoNest-verified professionals.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px]">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search agency, agent or locality" className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-500"/>
          <select value={city} onChange={e=>setCity(e.target.value)} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">{cities.map(c=><option key={c}>{c}</option>)}</select>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-extrabold text-slate-950">Local real estate agencies</h2><p className="mt-1 text-sm text-slate-600">Business information for Thane, Mumbai and Pune.</p></div><span className="text-sm font-semibold text-slate-500">{publicAgencies.length} agencies</span></div>
      {publicAgencies.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{publicAgencies.map((agency) => <article key={agency.name} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-extrabold text-slate-600">{agency.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div><div className="min-w-0"><h3 className="text-lg font-extrabold leading-6 text-slate-950">{agency.name}</h3><p className="mt-1 text-sm font-semibold text-blue-700">{agency.city} · {agency.area}</p></div></div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{agency.address}</p>
        <div className="mt-auto pt-5"><Link href={`/agents/business/${agencySlug(agency.name)}`} className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">Contact</Link></div>
      </article>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No agencies match this search.</p>}
      <p className="mt-4 text-xs text-slate-500">Public business listings are not claimed GoNest accounts and are not GoNest-verified.</p>
    </section>

    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-extrabold text-slate-950">GoNest-verified agent profiles</h2><p className="mt-1 text-sm text-slate-600">Profiles with verification details recorded by GoNest.</p></div><span className="text-sm font-semibold text-slate-500">{registeredAgents.length} agents</span></div>
        {registeredAgents.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{registeredAgents.map(a=><RegisteredAgentCard key={a.id} agent={a}/>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No GoNest-verified agent profiles match these filters yet.</p>}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blue-50 p-5"><div><h3 className="font-extrabold text-slate-950">Are you a property professional?</h3><p className="mt-1 text-sm text-slate-600">Create a GoNest profile and submit your details for review.</p></div><Link href="/dashboard" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Create GoNest profile</Link></div>
      </div>
    </section>
  </>;
}
