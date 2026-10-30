'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { THANE_TOP_AGENTS, businessMapsUrl } from '@/lib/thane-agents';
import { telHref, waHref } from '@/lib/contact';

type Props = { agents: Profile[] };

const FAQ = [
  { q: 'How do I verify an agent’s MahaRERA registration?', a: 'Use the official MahaRERA portal to check the registration number and current status. A number displayed on GoNest should always be checked against the official register.' },
  { q: 'Are all agents on GoNest verified?', a: 'The directory highlights profiles with GoNest verification and registration details on file. Always confirm the licence is current on the official MahaRERA portal before engaging an agent.' },
  { q: 'How do I contact an agent?', a: 'Use Call or Message when contact information is available, or open the agent profile to review the details they have published.' },
  { q: 'How can I join the GoNest agent network?', a: 'Create a GoNest account and complete the profile and verification steps. Verification badges are shown only when the corresponding information is recorded.' },
];

const HERO = 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1800&h=850&fit=crop&auto=format';
const cities = ['All Cities', 'Mumbai', 'Pune', 'Thane', 'Navi Mumbai'];
const specializations = ['All Specializations', 'Residential', 'Commercial', 'Luxury', 'Rentals', 'Investment', 'New Projects'];
const languages = ['Any Language', 'English', 'Hindi', 'Marathi', 'Gujarati', 'Malayalam'];

function AgentCard({ agent, top = false }: { agent: Profile; top?: boolean }) {
  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${top ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-200'}`}>
                {agent.property_cover_url && <Link href={`/agents/${agent.id}`} className="relative block h-36 overflow-hidden bg-slate-100"><img src={agent.property_cover_url} alt={`Property listed by ${agent.full_name ?? "this agent"}`} loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]" /><span className="absolute bottom-2 left-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-bold text-white">From agent’s live GoNest inventory</span></Link>}
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <Link href={`/agents/${agent.id}`} aria-label={`View ${agent.full_name ?? 'agent'} profile`} className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-100 text-xl font-extrabold text-slate-500">
                      {agent.avatar_url ? <img src={agent.avatar_url} alt={`${agent.full_name ?? "Agent"} profile`} className="h-full w-full object-cover" /> : <span className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-100 to-blue-50 text-xl font-extrabold text-slate-500">{(agent.full_name ?? "G").charAt(0).toUpperCase()}<small className="text-[9px] font-semibold tracking-wide">PHOTO PENDING</small></span>}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/agents/${agent.id}`} className="block text-lg font-extrabold leading-tight text-slate-950 hover:text-blue-700">{agent.full_name ?? 'GoNest agent'}</Link>
                      <p className="mt-1 text-sm text-slate-500">{agent.agency_name ?? 'Independent agent'}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {top && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">Top Agent</span>}
                        {agent.agent_verified ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">GoNest verified</span> : <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">Verification pending</span>}
                        {agent.rating != null && <span className="text-sm font-extrabold text-amber-700">★ {agent.rating.toFixed(2)} <span className="font-normal text-slate-500">({agent.review_count} reviews)</span></span>}
                      </div>
                    </div>
                  </div>
                  {agent.rera_number ? <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">RERA registration · supplied on profile</p><p className="mt-1 break-all text-sm font-extrabold tracking-wide text-slate-900">{agent.rera_number}</p><a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">Check official register ↗</a></div> : <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">RERA registration has not been provided on this profile.</div>}
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
  );
}

export function AgentDirectory({ agents }: Props) {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('All Cities');
  const [specialization, setSpecialization] = useState('All Specializations');
  const [language, setLanguage] = useState('Any Language');
  const [sort, setSort] = useState('Top Rated');

  const agentProfiles = useMemo(
    () => agents.filter((agent) => agent.role === 'agent'),
    [agents],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = agentProfiles.filter((agent) => {
      const areas = [...(agent.service_localities ?? []), ...(agent.service_pincodes ?? [])].join(' ');
      const text = [agent.full_name, agent.agency_name, agent.bio, agent.rera_number, areas].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = !term || text.includes(term);
      const locationTerm = location.trim().toLowerCase();
      const matchesLocation = !locationTerm || areas.toLowerCase().includes(locationTerm) || text.includes(locationTerm);
      const matchesCity = city === 'All Cities' || text.includes(city.toLowerCase()) ||
        (city === 'Thane' && text.includes('mumbai')) || (city === 'Navi Mumbai' && text.includes('navi'));
      const matchesSpecialization = specialization === 'All Specializations' || text.includes(specialization.toLowerCase()) ||
        (specialization === 'Residential' && text.includes('property'));
      const langTerm = language === 'Any Language' ? '' : language.toLowerCase();
      const matchesLanguage = !langTerm || text.includes(langTerm) ||
        (language === 'English' && Boolean(agent.full_name));
      return matchesSearch && matchesLocation && matchesCity && matchesSpecialization && matchesLanguage;
    });
    return [...result].sort((a, b) => {
      if (sort === 'Top Rated') return (b.rating ?? -1) - (a.rating ?? -1);
      if (sort === 'Most Reviews') return (b.review_count ?? 0) - (a.review_count ?? 0);
      return (b.total_listings ?? 0) - (a.total_listings ?? 0);
    });
  }, [agentProfiles, search, location, city, specialization, language, sort]);

  const isFiltered = search.trim() !== '' || location.trim() !== '' || city !== 'All Cities' || specialization !== 'All Specializations' || language !== 'Any Language';
  const topAgents = isFiltered ? [] : [...filtered].filter((a) => a.rating != null && (a.review_count ?? 0) > 0).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.review_count ?? 0) - (a.review_count ?? 0)).slice(0, 3);
  const topIds = new Set(topAgents.map((a) => a.id));
  const rest = filtered.filter((a) => !topIds.has(a.id));
  const rated = agentProfiles.filter((agent) => agent.rating != null);
  const averageRating = rated.length
    ? rated.reduce((sum, agent) => sum + (agent.rating ?? 0), 0) / rated.length
    : null;
  const totalListings = agentProfiles.reduce((sum, agent) => sum + (agent.total_listings ?? 0), 0);

  return (
    <>
      <section className="relative overflow-hidden border-b border-blue-100 bg-slate-50">
        <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-blue-50/65" />
        <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="grid items-end gap-7 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3 py-1.5 text-xs font-bold text-blue-800"><span aria-hidden="true">⌖</span> GoNest Agent Directory</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">Find a real estate agent in Mumbai, Maharashtra</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Find local property professionals to help you buy, sell or rent. Review profile details and confirm registration before you engage.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ value: agentProfiles.length.toLocaleString('en-IN'), label: 'Agent profiles' }, { value: totalListings.toLocaleString('en-IN'), label: 'Listed properties' }, { value: averageRating == null ? '—' : averageRating.toFixed(2), label: 'Average rating' }].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/95 p-3 text-center shadow-sm sm:p-4">
                  <p className="text-xl font-extrabold text-slate-950 sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-xs leading-4 text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-md md:grid-cols-[minmax(200px,1.2fr)_minmax(190px,1.1fr)_repeat(3,minmax(125px,1fr))_minmax(140px,auto)]">
            <label className="relative block">
              <span className="sr-only">Agent or agency name</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Agent or agency name…" className="h-full min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label><span className="sr-only">Service locality, neighbourhood or PIN code</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Locality, neighbourhood or PIN code" className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500" /></label>
            <label><span className="sr-only">City</span><select value={city} onChange={(event) => setCity(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500">{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span className="sr-only">Specialization</span><select value={specialization} onChange={(event) => setSpecialization(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500">{specializations.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span className="sr-only">Language</span><select value={language} onChange={(event) => setLanguage(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500">{languages.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span className="sr-only">Sort agents</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"><option>Top Rated</option><option>Most Reviews</option><option>Most Listings</option></select></label>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Explore by location</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Real estate agents near you</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">Compare local agencies and agent profiles. Public directory information is clearly distinguished from GoNest verification.</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-slate-600">{THANE_TOP_AGENTS.length} local businesses</span>
          </div>
          <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3 xl:grid-cols-4">
            {THANE_TOP_AGENTS.map((broker, index) => (
              <article key={broker.name} className="group w-[82vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:w-auto md:max-w-none">
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
                  {broker.profileImageUrl ? (
                    <img src={broker.profileImageUrl} alt={`${broker.name} business profile image`} loading="lazy" referrerPolicy="no-referrer" className="h-24 w-24 rounded-2xl border border-slate-200 bg-white p-2 object-contain shadow-sm" />
                  ) : (
                    <div aria-label={`${broker.name} logo placeholder`} className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-200 bg-white text-3xl font-extrabold text-slate-500 shadow-sm">
                      {broker.name.split(/\\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800">#{index + 1} · Thane</span>
                  <span className="absolute bottom-3 left-3 rounded-md bg-slate-950/75 px-2.5 py-1 text-[10px] font-semibold text-white">{broker.imageSourceLabel ?? "Business identity pending"}</span>
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-2 min-h-12 text-lg font-extrabold text-slate-950">{broker.name}</h3>
                  <p className="mt-1 min-h-10 text-sm font-medium text-slate-600">{broker.area}</p>
                  <div className="mt-2 flex items-center gap-2"><span className="text-amber-500">★</span><strong className="text-sm text-slate-950">{broker.rating.toFixed(1)}</strong><span className="text-sm text-slate-500">({broker.reviews.toLocaleString("en-IN")} public reviews)</span></div>
                  <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600">{broker.note}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{broker.services.map(service => <span key={service} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{service}</span>)}</div>
                  <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{broker.address}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <a href={businessMapsUrl(broker)} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-700 hover:text-blue-900">View business →</a>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(broker.name + " Thane reviews")}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-600 hover:text-slate-950">Read reviews ↗</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">Public business-directory ratings are snapshots and may change. They are not GoNest reviews or endorsements. Images are business identity marks where sourced; otherwise a neutral initials placeholder is shown until a matching public team photo can be verified.</p>
        </div>
      </section>

      {topAgents.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-10 md:px-8">
          <h2 className="text-xl font-extrabold text-slate-950">Top agents</h2>
          <p className="mb-5 mt-1 text-sm text-slate-600">Ranked by customer rating and number of reviews. Placement is never sold.</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{topAgents.map((agent) => <AgentCard key={agent.id} agent={agent} top />)}</div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-950">GoNest agent profiles</h2>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-800">{filtered.length} agents</span>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700">⌕</div>
            <h3 className="mt-4 text-xl font-extrabold text-slate-950">{agentProfiles.length === 0 ? 'Agent profiles are being onboarded' : 'No agents match these filters'}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{agentProfiles.length === 0 ? 'Agent profiles appear when a professional has joined GoNest. Verification and registration details are shown only when supplied and reviewed.' : 'Try another search or reset the filters to see available agent profiles.'}</p>
            <button type="button" onClick={() => { setSearch(''); setCity('All Cities'); setSpecialization('All Specializations'); setLanguage('Any Language'); setSort('Top Rated'); }} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Reset filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="flex flex-col gap-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">For buyers and renters</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Need help finding the right agent?</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">Explore local professionals and review the information they have published. Contact details are available on individual profiles when provided.</p>
          </div>
          <Link href="/agents" className="inline-flex shrink-0 justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Explore agent profiles</Link>
        </div>
      </section>
      <section className="border-y border-slate-200 bg-slate-50 py-12 md:py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">For registered brokers</p>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-950 md:text-3xl">Are you a real estate agent?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Join GoNest to help buyers and renters discover your services. Complete your profile and provide the required registration details for review.</p>
            <Link href="/dashboard" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Join GoNest as an agent</Link>
            <p className="mt-3 text-xs text-slate-500">Profile photos, registration details and verification status are displayed only when supplied and reviewed.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-slate-950">Popular areas for agents</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Bandra', 'Andheri', 'Juhu', 'Thane', 'Navi Mumbai', 'Powai', 'Worli', 'Lower Parel', 'Kandivali', 'Dadar', 'Pune'].map((area) => <button key={area} type="button" onClick={() => { setLocation(area); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800">{area}</button>)}
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
            <div className="mt-4 divide-y divide-slate-100">{FAQ.map((item) => <details key={item.q} className="group py-4"><summary className="cursor-pointer list-none pr-6 font-semibold text-slate-800">{item.q}<span className="float-right text-blue-700 group-open:rotate-45">＋</span></summary><p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p></details>)}</div>
          </div>
        </div>
      </section>
    </>
  );
}
