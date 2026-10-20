'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { telHref, waHref } from '@/lib/contact';

type Props = { agents: Profile[] };

const FAQ = [
  { q: 'How do I verify an agent’s MahaRERA registration?', a: 'Use the official MahaRERA portal to check the registration number and current status. A number displayed on GoNest should always be checked against the official register.' },
  { q: 'Are all agents on GoNest verified?', a: 'The directory highlights profiles with GoNest verification and registration details on file. Always confirm the licence is current on the official MahaRERA portal before engaging an agent.' },
  { q: 'How do I contact an agent?', a: 'Use Call or Message when contact information is available, or open the agent profile to review the details they have published.' },
  { q: 'How can I join the GoNest agent network?', a: 'Create a GoNest account and complete the profile and verification steps. Verification badges are shown only when the corresponding information is recorded.' },
];

const cities = ['All Cities', 'Mumbai', 'Pune', 'Thane', 'Navi Mumbai'];
const specializations = ['All Specializations', 'Residential', 'Commercial', 'Luxury', 'Rentals', 'Investment', 'New Projects'];
const languages = ['Any Language', 'English', 'Hindi', 'Marathi', 'Gujarati', 'Malayalam'];

export function AgentDirectory({ agents }: Props) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [specialization, setSpecialization] = useState('All Specializations');
  const [language, setLanguage] = useState('Any Language');
  const [sort, setSort] = useState('Top Rated');

  const licensedAgents = useMemo(
    () => agents.filter((agent) => agent.role === 'agent' && agent.agent_verified && Boolean(agent.rera_number)),
    [agents],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = licensedAgents.filter((agent) => {
      const text = [agent.full_name, agent.agency_name, agent.bio, agent.rera_number].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = !term || text.includes(term);
      const matchesCity = city === 'All Cities' || text.includes(city.toLowerCase()) ||
        (city === 'Thane' && text.includes('mumbai')) || (city === 'Navi Mumbai' && text.includes('navi'));
      const matchesSpecialization = specialization === 'All Specializations' || text.includes(specialization.toLowerCase()) ||
        (specialization === 'Residential' && text.includes('property'));
      const langTerm = language === 'Any Language' ? '' : language.toLowerCase();
      const matchesLanguage = !langTerm || text.includes(langTerm) ||
        (language === 'English' && Boolean(agent.full_name));
      return matchesSearch && matchesCity && matchesSpecialization && matchesLanguage;
    });
    return [...result].sort((a, b) => {
      if (sort === 'Top Rated') return (b.rating ?? -1) - (a.rating ?? -1);
      if (sort === 'Most Reviews') return (b.review_count ?? 0) - (a.review_count ?? 0);
      return (b.total_listings ?? 0) - (a.total_listings ?? 0);
    });
  }, [licensedAgents, search, city, specialization, language, sort]);

  const rated = licensedAgents.filter((agent) => agent.rating != null);
  const averageRating = rated.length
    ? rated.reduce((sum, agent) => sum + (agent.rating ?? 0), 0) / rated.length
    : null;
  const totalListings = licensedAgents.reduce((sum, agent) => sum + (agent.total_listings ?? 0), 0);

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
            <span aria-hidden="true">✓</span> MahaRERA Licensed Agents Only
          </div>
          <div className="grid items-end gap-7 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">Find a Verified Agent.</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Explore agent profiles with GoNest verification and MahaRERA registration details on file. Confirm the licence is current on the official register before engaging an agent.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ value: licensedAgents.length.toLocaleString('en-IN'), label: 'Verified Agents' }, { value: totalListings.toLocaleString('en-IN'), label: 'Active Listings' }, { value: averageRating == null ? '—' : averageRating.toFixed(2), label: 'Avg. Rating' }].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center sm:p-4">
                  <p className="text-xl font-extrabold text-slate-950 sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-xs leading-4 text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(135px,1fr))_auto]">
            <label className="relative block">
              <span className="sr-only">Agent or agency name</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Agent or agency name…" className="h-full min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label><span className="sr-only">City</span><select value={city} onChange={(event) => setCity(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500">{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span className="sr-only">Specialization</span><select value={specialization} onChange={(event) => setSpecialization(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500">{specializations.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span className="sr-only">Language</span><select value={language} onChange={(event) => setLanguage(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500">{languages.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span className="sr-only">Sort agents</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"><option>Top Rated</option><option>Most Reviews</option><option>Most Listings</option></select></label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-950">MahaRERA registration details on file</h2>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-800">{filtered.length} agents</span>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700">⌕</div>
            <h3 className="mt-4 text-xl font-extrabold text-slate-950">{licensedAgents.length === 0 ? 'Verified agent profiles are being onboarded' : 'No agents match these filters'}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{licensedAgents.length === 0 ? 'Only profiles with GoNest verification and a recorded registration number appear in this directory. Registration must still be checked against the official MahaRERA register.' : 'Try another search or reset the filters to see available agent profiles.'}</p>
            <button type="button" onClick={() => { setSearch(''); setCity('All Cities'); setSpecialization('All Specializations'); setLanguage('Any Language'); setSort('Top Rated'); }} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Reset filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((agent) => (
              <article key={agent.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <Link href={`/agents/${agent.id}`} aria-label={`View ${agent.full_name ?? 'agent'} profile`} className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-100 text-xl font-extrabold text-slate-500">
                      {agent.avatar_url ? <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" /> : (agent.full_name ?? 'G').charAt(0).toUpperCase()}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/agents/${agent.id}`} className="block text-lg font-extrabold leading-tight text-slate-950 hover:text-blue-700">{agent.full_name ?? 'GoNest agent'}</Link>
                      <p className="mt-1 text-sm text-slate-500">{agent.agency_name ?? 'Independent agent'}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">MahaRERA details on file</span>
                        {agent.rating != null && <span className="text-sm font-extrabold text-amber-700">★ {agent.rating.toFixed(2)} <span className="font-normal text-slate-500">({agent.review_count} reviews)</span></span>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">Registration number</p>
                    <p className="mt-1 break-all text-sm font-extrabold tracking-wide text-slate-900">{agent.rera_number}</p>
                    <a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">Verify on MahaRERA <span aria-hidden="true">↗</span></a>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 bg-white">
                  {[{ value: agent.total_listings ?? 0, label: 'Listings' }, { value: agent.review_count ?? 0, label: 'Reviews' }, { value: agent.rating == null ? '—' : agent.rating.toFixed(2), label: 'Rating' }].map((stat) => <div key={stat.label} className="px-2 py-3 text-center"><p className="text-lg font-extrabold text-slate-950">{stat.value}</p><p className="text-xs text-slate-500">{stat.label}</p></div>)}
                </div>
                <div className="mt-auto p-4">
                  {agent.bio && <p className="mb-3 line-clamp-2 text-sm leading-6 text-slate-600">{agent.bio}</p>}
                  <div className="grid grid-cols-3 gap-2">
                    {agent.phone ? <a href={telHref(agent.phone)} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-2 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Call</a> : <span className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-2 py-2.5 text-sm font-semibold text-slate-400">Call</span>}
                    {agent.phone ? <a href={waHref(agent.phone, `Hi ${agent.full_name ?? ''}, I found your profile on GoNest and would like to enquire.`)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-2 py-2.5 text-sm font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50">Message</a> : <Link href={`/agents/${agent.id}`} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-2 py-2.5 text-sm font-bold text-slate-700">Message</Link>}
                    <Link href={`/agents/${agent.id}`} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-2 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50">Meet</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-12 md:py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">For registered brokers</p>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-950 md:text-3xl">Are you a registered broker?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Join GoNest’s agent network and get discovered by buyers and renters across Mumbai and Pune. Complete the required profile and verification steps to be considered for the verified directory.</p>
            <Link href="/dashboard" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Register as Agent — Free</Link>
            <p className="mt-3 text-xs text-slate-500">MahaRERA registration required · Verification required · Listing terms apply</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">GoNest verified agent network</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Agent registration details and profile information should be verified before making a property decision. Use the official portal for current registration status.</p>
            <a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">MahaRERA Info ↗</a>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
            <h2 className="text-xl font-extrabold text-slate-950">Frequently asked questions</h2>
            <div className="mt-4 divide-y divide-slate-100">{FAQ.map((item) => <details key={item.q} className="group py-4"><summary className="cursor-pointer list-none pr-6 font-semibold text-slate-800">{item.q}<span className="float-right text-blue-700 group-open:rotate-45">＋</span></summary><p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p></details>)}</div>
          </div>
        </div>
      </section>
    </>
  );
}
