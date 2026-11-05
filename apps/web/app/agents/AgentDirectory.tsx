'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { THANE_TOP_AGENTS } from '@/lib/thane-agents';

type Props = { agents: Profile[] };
const cities = ['All Cities', 'Mumbai', 'Pune', 'Thane', 'Navi Mumbai'];
const specializations = ['All Specializations', 'Residential', 'Commercial', 'Luxury', 'Rentals', 'Investment', 'New Projects'];
const languages = ['Any Language', 'English', 'Hindi', 'Marathi', 'Gujarati', 'Malayalam'];
const popularAreas = ['Bandra', 'Andheri', 'Juhu', 'Thane', 'Navi Mumbai', 'Powai', 'Worli', 'Lower Parel', 'Kandivali', 'Dadar', 'Pune'];
const FAQ = [
  { q: 'How do I verify an agent’s MahaRERA registration?', a: 'Use the official MahaRERA portal to check the registration number and current status. A number displayed on GoNest should always be checked against the official register.' },
  { q: 'Are all agents on GoNest verified?', a: 'No. The GoNest verified label is shown only on profiles that have passed GoNest’s recorded verification checks. Always confirm the current registration status on the official MahaRERA portal before engaging an agent.' },
  { q: 'How do I contact an agent?', a: 'Open the agent profile and use its Contact form to send an enquiry. Contact options depend on the information the agent has provided.' },
  { q: 'How can I join the GoNest agent network?', a: 'Create a GoNest account, choose the agent role and complete your profile. Submit the required registration details for review.' },
];
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
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/80 bg-white text-3xl font-extrabold text-slate-600 shadow-sm">{agency.name.split(/\\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div>
      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm">Public business listing</span>
      <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">{agency.city} · {agency.area}</span>
    </div>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <h3 className="text-lg font-extrabold text-slate-950">{agency.name}</h3>
      <p className="mt-2 text-sm leading-5 text-slate-600">{agency.address}</p>
      {agency.rating != null && <p className="mt-2 text-sm font-bold text-slate-900">★ {agency.rating.toFixed(1)} <span className="font-normal text-slate-500">({agency.publicReviewCount?.toLocaleString('en-IN')} public reviews)</span></p>}
      {agency.businessType && <p className="mt-3 text-sm font-medium text-slate-700">{agency.businessType}</p>}
      {agency.services?.length ? <div className="mt-3 flex flex-wrap gap-2">{agency.services.map(item=><span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{item}</span>)}</div> : null}
      {agency.rating != null && <p className="mt-3 text-xs leading-5 text-slate-500">Public rating and review count; these are not GoNest reviews or an independent GoNest endorsement.</p>}
      <p className="mt-3 text-xs leading-5 text-slate-500">Public directory information. Not claimed or verified by GoNest.</p>
      <div className="mt-auto pt-5"><Link href={`/agents/business/${agencySlug(agency.name)}`} className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">View business profile</Link></div>
    </div>
  </article>;
}

export function AgentDirectory({ agents }: Props) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [location, setLocation] = useState('');
  const [specialization, setSpecialization] = useState('All Specializations');
  const [language, setLanguage] = useState('Any Language');
  const [sort, setSort] = useState('Top Rated');
  const [minRating, setMinRating] = useState('Any rating');
  const publicAgencies = useMemo(() => THANE_TOP_AGENTS.filter(a =>
    (city === 'All Cities' || a.city === city) &&
    (minRating === 'Any rating' || (a.rating ?? 0) >= Number(minRating)) &&
    (a.name + ' ' + a.city + ' ' + a.area + ' ' + a.address + ' ' + (a.services ?? []).join(' ') + ' ' + (a.businessType ?? '')).toLowerCase().includes((search + ' ' + location).toLowerCase().trim())
  ), [city, minRating, search, location]);
  const licensedAgents = useMemo(() => agents.filter(a =>
    a.role === 'agent' && a.agent_verified && Boolean(a.rera_number)
  ), [agents]);
  const filteredAgents = useMemo(() => {
    const q = (search + ' ' + location).toLowerCase().trim();
    const filtered = licensedAgents.filter(a => {
      const profileText = [a.full_name, a.agency_name, a.bio, a.rera_number, ...(a.service_localities ?? []), ...(a.service_pincodes ?? [])].filter(Boolean).join(' ').toLowerCase();
      const cityMatch = city === 'All Cities' || profileText.includes(city.toLowerCase()) || (city === 'Mumbai' && /bandra|andheri|juhu|powai|worli|lower parel|kandivali|dadar/i.test(profileText)) || (city === 'Navi Mumbai' && /vashi|nerul|belapur|kharghar|panvel/i.test(profileText));
      const specializationMatch = specialization === 'All Specializations' || profileText.includes(specialization.toLowerCase());
      const languageMatch = language === 'Any Language' || profileText.includes(language.toLowerCase());
      return cityMatch && specializationMatch && languageMatch && (!q || profileText.includes(q));
    });
    return filtered.sort((a,b) => {
      if (sort === 'Most Reviews') return (b.review_count ?? 0) - (a.review_count ?? 0);
      if (sort === 'Most Listings') return (b.total_listings ?? 0) - (a.total_listings ?? 0);
      return (b.rating ?? -1) - (a.rating ?? -1) || (b.review_count ?? 0) - (a.review_count ?? 0);
    });
  }, [licensedAgents, search, location, city, specialization, language, sort]);
  const averageRating = licensedAgents.filter(a => a.rating != null).length
    ? licensedAgents.filter(a => a.rating != null).reduce((sum,a) => sum + (a.rating ?? 0), 0) / licensedAgents.filter(a => a.rating != null).length
    : null;
  const totalListings = licensedAgents.reduce((sum,a) => sum + (a.total_listings ?? 0), 0);

  return <>
    <section className="relative overflow-hidden border-b border-blue-100 bg-slate-50">
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-blue-50/70" />
      <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="grid items-end gap-7 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="mb-3 inline-flex items-center rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-blue-800">GoNest Agent Directory</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">Find a real estate agent in Mumbai, Maharashtra</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">Find local property professionals to help you buy, sell or rent. Review profile details and confirm registration before you engage.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ value: licensedAgents.length.toLocaleString('en-IN'), label: 'Agent profiles' }, { value: totalListings.toLocaleString('en-IN'), label: 'Listed properties' }, { value: averageRating == null ? '—' : averageRating.toFixed(2), label: 'Average rating' }].map(stat => <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm sm:p-4"><p className="text-xl font-extrabold text-slate-950 sm:text-2xl">{stat.value}</p><p className="mt-1 text-xs text-slate-500">{stat.label}</p></div>)}
          </div>
        </div>
        <div className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-md md:grid-cols-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Agent or agency name" aria-label="Agent or agency name" className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"/>
          <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Service locality, neighbourhood or PIN code" aria-label="Service locality, neighbourhood or PIN code" className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"/>
          <select value={city} onChange={e=>setCity(e.target.value)} aria-label="City" className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">{cities.map(c=><option key={c}>{c}</option>)}</select>
          <select value={specialization} onChange={e=>setSpecialization(e.target.value)} aria-label="Specialization" className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">{specializations.map(s=><option key={s}>{s}</option>)}</select>
          <select value={language} onChange={e=>setLanguage(e.target.value)} aria-label="Language" className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">{languages.map(l=><option key={l}>{l}</option>)}</select>
          <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort agents" className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800"><option>Top Rated</option><option>Most Reviews</option><option>Most Listings</option></select>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-9 md:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest professionals</p><h2 className="mt-1 text-2xl font-extrabold text-slate-950">Verified agent profiles</h2><p className="mt-1 text-sm text-slate-600">Agent cards use the same image-led, responsive listing layout as property search.</p></div><span className="text-sm font-semibold text-slate-500">{filteredAgents.length} results</span></div>
      {filteredAgents.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredAgents.map(a=><AgentListingCard key={a.id} agent={a}/>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="text-sm text-slate-600">No GoNest-verified agent profiles match these filters yet.</p><button type="button" onClick={()=>{setSearch('');setLocation('');setCity('All Cities');setSpecialization('All Specializations');setLanguage('Any Language');setSort('Top Rated');}} className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">Reset filters</button></div>}
    </section>

    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-9 md:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Local discovery</p><h2 className="mt-1 text-2xl font-extrabold text-slate-950">Public real estate businesses</h2><p className="mt-1 text-sm text-slate-600">Public directory profiles are not claimed GoNest accounts or verified agents.</p></div><span className="text-sm font-semibold text-slate-500">{publicAgencies.length} results</span></div>
        {publicAgencies.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{publicAgencies.map(agency=><PublicAgencyListingCard key={agency.name} agency={agency}/>)}</div> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No public businesses match these filters.</p>}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blue-50 p-5"><div><h3 className="font-extrabold text-slate-950">Are you a property professional?</h3><p className="mt-1 text-sm text-slate-600">Create a GoNest profile and submit your details for review.</p></div><Link href="/dashboard" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Create GoNest profile</Link></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-slate-950">Popular areas for agents</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {popularAreas.map(area => <button key={area} type="button" onClick={()=>{setLocation(area);window.scrollTo({top:0,behavior:'smooth'});}} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800">{area}</button>)}
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">GoNest verified agent network</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Agent registration details and profile information should be verified before making a property decision. Use the official portal for current registration status.</p>
          <a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">MahaRERA Info ↗</a>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
          <h2 className="text-xl font-extrabold text-slate-950">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-slate-100">{FAQ.map(item=><details key={item.q} className="group py-4"><summary className="cursor-pointer list-none pr-6 font-semibold text-slate-800">{item.q}<span className="float-right text-blue-700 transition group-open:rotate-45">＋</span></summary><p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p></details>)}</div>
        </div>
      </div>
    </section>
  </>;
}
