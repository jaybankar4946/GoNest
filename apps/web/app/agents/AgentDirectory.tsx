'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { telHref, waHref } from '@/lib/contact';

type Props = { agents: Profile[] };

const cities = ['All markets', 'Mumbai', 'Thane', 'Navi Mumbai', 'Pune'];
const languages = ['Any language', 'English', 'Hindi', 'Marathi', 'Gujarati'];
const specialties = ['All specialties', 'Residential', 'Luxury homes', 'New projects', 'Resale', 'Rentals', 'Investment'];
const budgetOptions = ['Any price range', 'Under ₹50 lakh', '₹50 lakh–₹1 crore', '₹1–2 crore', '₹2–5 crore', 'Above ₹5 crore'];

function includesText(agent: Profile, term: string) {
  if (!term) return true;
  const searchable = [
    agent.full_name, agent.agency_name, agent.bio, agent.rera_number,
    ...(agent.service_localities ?? []), ...(agent.service_pincodes ?? []),
  ].filter(Boolean).join(' ').toLowerCase();
  return searchable.includes(term.toLowerCase());
}

function AgentCard({ agent }: { agent: Profile }) {
  const areas = [...new Set([...(agent.service_localities ?? []), ...(agent.service_pincodes ?? [])])];
  const hasRera = Boolean(agent.rera_number);
  return (
    <article className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:grid-cols-[112px_minmax(0,1fr)] sm:p-5">
      <Link href={`/agents/${agent.id}`} aria-label={`View ${agent.full_name ?? 'agent'} profile`} className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-3xl font-extrabold text-slate-500">
        {agent.avatar_url ? <img src={agent.avatar_url} alt={`${agent.full_name ?? 'Agent'} profile photo`} className="h-full w-full object-cover" /> : <span>{(agent.full_name ?? 'G').split(/\\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span>}
      </Link>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/agents/${agent.id}`} className="text-lg font-extrabold text-slate-950 hover:text-blue-700">{agent.full_name ?? 'GoNest property professional'}</Link>
            <p className="mt-0.5 text-sm text-slate-600">{agent.agency_name ?? 'Independent property professional'}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${agent.agent_verified ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{agent.agent_verified ? 'GoNest profile checked' : 'Verification pending'}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {agent.rating != null && (agent.review_count ?? 0) > 0
            ? <span className="font-bold text-amber-700">★ {agent.rating.toFixed(1)} <span className="font-normal text-slate-500">({agent.review_count} reviews)</span></span>
            : <span className="text-slate-500">No GoNest reviews yet</span>}
          {hasRera && <span className="text-slate-600">RERA no. {agent.rera_number}</span>}
        </div>
        {areas.length > 0 && <p className="mt-2 line-clamp-2 text-sm text-slate-600"><span className="font-semibold text-slate-800">Areas served:</span> {areas.join(' · ')}</p>}
        {agent.bio && <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{agent.bio}</p>}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex gap-5 text-sm">
            <span><strong className="text-slate-950">{agent.total_listings ?? 0}</strong> <span className="text-slate-500">listings</span></span>
            <span><strong className="text-slate-950">{agent.review_count ?? 0}</strong> <span className="text-slate-500">reviews</span></span>
          </div>
          <div className="flex flex-wrap gap-2">
            {agent.phone && <a href={telHref(agent.phone)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">Call</a>}
            {agent.phone && <a href={waHref(agent.phone, `Hi ${agent.full_name ?? ''}, I found your GoNest profile and would like to enquire.`)} target="_blank" rel="noreferrer" className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50">WhatsApp</a>}
            <Link href={`/agents/${agent.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 hover:border-blue-300">View profile</Link>
          </div>
        </div>
      </div>
      {hasRera && <p className="sm:col-start-2 -mt-1 text-xs text-slate-500">Registration details supplied on profile. <a href="https://maharera.maharashtra.gov.in/agents-search-result" target="_blank" rel="noreferrer" className="font-semibold text-blue-700 underline">Check official MahaRERA register ↗</a></p>}
      {agent.is_sample && <p className="sm:col-start-2 text-xs text-slate-400">Sample profile · not a verified customer endorsement</p>}
    </article>
  );
}

export function AgentDirectory({ agents }: Props) {
  const [agentName, setAgentName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('All markets');
  const [transaction, setTransaction] = useState('Buying');
  const [specialty, setSpecialty] = useState('All specialties');
  const [language, setLanguage] = useState('Any language');
  const [budget, setBudget] = useState('Any price range');
  const [sort, setSort] = useState('Recommended');

  const directoryAgents = useMemo(() => agents.filter(agent => agent.role === 'agent'), [agents]);
  const filtered = useMemo(() => {
    const result = directoryAgents.filter(agent => {
      const nameMatch = !agentName.trim() || [agent.full_name, agent.agency_name].filter(Boolean).join(' ').toLowerCase().includes(agentName.trim().toLowerCase());
      const placeMatch = includesText(agent, location.trim());
      const cityMatch = city === 'All markets' || includesText(agent, city);
      const specialtyMatch = specialty === 'All specialties' || includesText(agent, specialty);
      const languageMatch = language === 'Any language' || includesText(agent, language);
      // The current public profile schema does not yet store agent-level transaction specialties,
      // language capabilities or team price ranges. Do not manufacture those attributes.
      const budgetMatch = budget === 'Any price range';
      return nameMatch && placeMatch && cityMatch && specialtyMatch && languageMatch && budgetMatch;
    });
    return result.sort((a, b) => {
      if (sort === 'Highest rated') return (b.rating ?? -1) - (a.rating ?? -1) || (b.review_count ?? 0) - (a.review_count ?? 0);
      if (sort === 'Most listings') return (b.total_listings ?? 0) - (a.total_listings ?? 0);
      if (sort === 'Most reviewed') return (b.review_count ?? 0) - (a.review_count ?? 0);
      return Number(Boolean(b.agent_verified)) - Number(Boolean(a.agent_verified)) || (b.total_listings ?? 0) - (a.total_listings ?? 0);
    });
  }, [directoryAgents, agentName, location, city, specialty, language, budget, sort]);

  const reset = () => { setAgentName(''); setLocation(''); setCity('All markets'); setTransaction('Buying'); setSpecialty('All specialties'); setLanguage('Any language'); setBudget('Any price range'); setSort('Recommended'); };
  const verifiedCount = directoryAgents.filter(agent => agent.agent_verified).length;
  const activeCount = directoryAgents.reduce((sum, agent) => sum + (agent.total_listings ?? 0), 0);

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <p className="text-sm font-bold text-blue-700">GoNest · Find a property professional</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">Real estate agents in Mumbai, Thane, Navi Mumbai & Pune</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">Find a local professional for your next home. Compare service areas, published credentials, GoNest reviews and current listing activity.</p>
          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">City, neighbourhood or PIN code</span><input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Baner, Hiranandani Estate, 400607" className="min-h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Agent name or company</span><input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Search by agent or agency" className="min-h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Market</span><select value={city} onChange={e => setCity(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">{cities.map(x => <option key={x}>{x}</option>)}</select></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">I am</span><select value={transaction} onChange={e => setTransaction(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"><option>Buying</option><option>Selling</option><option>Renting</option></select></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Specialty</span><select value={specialty} onChange={e => setSpecialty(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">{specialties.map(x => <option key={x}>{x}</option>)}</select></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Language</span><select value={language} onChange={e => setLanguage(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">{languages.map(x => <option key={x}>{x}</option>)}</select></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Price range</span><select value={budget} onChange={e => setBudget(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">{budgetOptions.map(x => <option key={x}>{x}</option>)}</select></label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Filters will become fully data-driven as agent expertise, language and transaction history are captured in profiles.</p>
              <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Clear filters</button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm text-slate-600">
            <span><strong className="text-slate-950">{directoryAgents.length.toLocaleString('en-IN')}</strong> agent profiles</span>
            <span><strong className="text-slate-950">{verifiedCount.toLocaleString('en-IN')}</strong> GoNest-checked profiles</span>
            <span><strong className="text-slate-950">{activeCount.toLocaleString('en-IN')}</strong> profile-linked listings</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-2xl font-extrabold text-slate-950">Agents matching your search</h2><p className="mt-1 text-sm text-slate-600">Compare individual professionals and their agencies.</p></div>
          <div className="flex items-center gap-2 text-sm"><span className="text-slate-500">Sort by</span><select value={sort} onChange={e => setSort(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800"><option>Recommended</option><option>Highest rated</option><option>Most reviewed</option><option>Most listings</option></select></div>
        </div>
        {filtered.length ? <div className="grid gap-4 lg:grid-cols-2">{filtered.map(agent => <AgentCard key={agent.id} agent={agent} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center"><h3 className="text-xl font-extrabold text-slate-950">No agents match these filters yet</h3><p className="mt-2 text-sm text-slate-600">Try a nearby locality or clear filters to see all available agent profiles.</p><button type="button" onClick={reset} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Clear filters</button></div>}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 md:px-8">
        <div className="grid gap-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div><h2 className="text-2xl font-extrabold text-slate-950">Get help finding a local agent</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Tell us what kind of home you are looking for and connect with a professional serving your area.</p></div>
          <Link href="/buy" className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Explore homes</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-8">
        <h2 className="text-xl font-extrabold text-slate-950">Popular agent markets</h2>
        <div className="mt-3 flex flex-wrap gap-2">{['Bandra', 'Andheri', 'Powai', 'Worli', 'Thane', 'Hiranandani Estate', 'Ghodbunder Road', 'Navi Mumbai', 'Vashi', 'Baner', 'Wakad', 'Hinjawadi', 'Kharadi', 'Kothrud'].map(area => <button key={area} type="button" onClick={() => { setLocation(area); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50">{area}</button>)}</div>
      </section>
    </>
  );
}
