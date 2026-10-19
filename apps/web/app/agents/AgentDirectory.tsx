'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';

type Props = { agents: Profile[] };

const FAQ = [
  { q: 'How should I choose a property agent?', a: 'Compare local experience, relevant active listings, communication and registration details. Speak with the professional and independently verify credentials before making a commitment.' },
  { q: 'Does a GoNest verification badge mean MahaRERA registration is verified?', a: 'No. GoNest profile verification and MahaRERA registration are different checks. Verify the registration number and current status using the official MahaRERA portal.' },
  { q: 'How can I contact a professional?', a: 'Open a profile to review the information and active listings they have published. Contact options depend on the details available on that profile.' },
];

export function AgentDirectory({ agents }: Props) {
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'all' | 'agent' | 'owner'>('agent');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasListingsOnly, setHasListingsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevant' | 'rating' | 'listings'>('relevant');

  const filtered = useMemo(() => {
    const locationTerm = location.trim().toLowerCase();
    const nameTerm = name.trim().toLowerCase();
    const matches = agents.filter((agent) => {
      const publicText = [agent.full_name, agent.agency_name, agent.bio].filter(Boolean).join(' ').toLowerCase();
      const matchesLocation = !locationTerm || publicText.includes(locationTerm);
      const matchesName = !nameTerm || [agent.full_name, agent.agency_name].filter(Boolean).join(' ').toLowerCase().includes(nameTerm);
      const matchesRole = role === 'all' || agent.role === role;
      const matchesVerified = !verifiedOnly || agent.agent_verified;
      const matchesListings = !hasListingsOnly || (agent.total_listings ?? 0) > 0;
      return matchesLocation && matchesName && matchesRole && matchesVerified && matchesListings;
    });
    return [...matches].sort((a, b) => {
      if (sortBy === 'rating') return (b.rating ?? -1) - (a.rating ?? -1) || (b.review_count ?? 0) - (a.review_count ?? 0);
      if (sortBy === 'listings') return (b.total_listings ?? 0) - (a.total_listings ?? 0);
      return Number(Boolean(b.agent_verified)) - Number(Boolean(a.agent_verified)) || (b.total_listings ?? 0) - (a.total_listings ?? 0);
    });
  }, [agents, location, name, role, verifiedOnly, hasListingsOnly, sortBy]);

  const clearFilters = () => {
    setLocation('');
    setName('');
    setRole('agent');
    setVerifiedOnly(false);
    setHasListingsOnly(false);
    setSortBy('relevant');
  };

  return (
    <>
      <section className="border-b border-slate-200 bg-[#f5f8fc]">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-8 md:px-8 md:pb-14 md:pt-12">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700 hover:underline">Home</Link><span className="mx-2">/</span><span className="font-medium text-slate-700">Find an agent</span>
          </nav>
          <div className="max-w-3xl">
            <p className="text-sm font-bold tracking-wide text-blue-700">GONEST · LOCAL REAL ESTATE EXPERTS</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">Find an agent</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">Find a real-estate agent who knows your market. Explore professional profiles across Mumbai, Pune and nearby localities, then compare published information before you connect.</p>
          </div>

          <form onSubmit={(event) => event.preventDefault()} className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Location</span>
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, locality or PIN code" className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Search by name or company" className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
              </label>
              <button type="submit" className="h-12 rounded-xl bg-blue-700 px-7 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300">Find agents</button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Search uses information published on GoNest profiles. Location suggestions are not available yet; enter a city, locality or PIN code to filter profiles.</p>
            <div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-bold uppercase tracking-wide text-slate-500">Popular areas</span>{['Mumbai', 'Pune', 'Thane', 'Navi Mumbai', 'Pimpri-Chinchwad'].map((area) => <button key={area} type="button" onClick={() => setLocation(area)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${location.toLowerCase() === area.toLowerCase() ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700'}`}>{area}</button>)}</div>
          </form>

          <div className="mt-6 flex flex-wrap gap-2" aria-label="Professional type">
            {[
              { value: 'agent' as const, label: 'Real-estate agents' },
              { value: 'owner' as const, label: 'Property owners' },
              { value: 'all' as const, label: 'Everyone' },
            ].map((option) => (
              <button key={option.value} type="button" onClick={() => setRole(option.value)} aria-pressed={role === option.value} className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${role === option.value ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'}`}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">{location.trim() ? `Real-estate agents in ${location.trim()}` : "Real-estate agents in Mumbai & Pune"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Browse available GoNest profiles, compare published information and contact professionals through their profile options.</p>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            Sort by
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="h-11 min-w-40 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600">
              <option value="relevant">Recommended</option>
              <option value="rating">Rating</option>
              <option value="listings">Active listings</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 py-4">
          <span className="mr-1 text-sm font-semibold text-slate-600">Filters</span>
          <button type="button" aria-pressed={verifiedOnly} onClick={() => setVerifiedOnly((value) => !value)} className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${verifiedOnly ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}`}>GoNest verified</button>
          <button type="button" aria-pressed={hasListingsOnly} onClick={() => setHasListingsOnly((value) => !value)} className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${hasListingsOnly ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}`}>Has active listings</button>
          {(verifiedOnly || hasListingsOnly || location || name || role !== 'agent' || sortBy !== 'relevant') && <button type="button" onClick={clearFilters} className="px-2 py-2 text-sm font-semibold text-blue-700 hover:underline">Clear all</button>}
          <span className="ml-auto text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? 'professional' : 'professionals'}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="my-8 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-700">⌕</div>
            <h3 className="mt-5 text-xl font-bold text-slate-950">{agents.length === 0 ? 'Be among the first professionals on GoNest' : 'No matching profiles found'}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{agents.length === 0 ? 'No public agent profiles are available yet. As professionals publish complete profiles, they can appear in this directory.' : 'Try another name or area, change the professional type, or clear filters to see more results.'}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {(agents.length > 0) && <button type="button" onClick={clearFilters} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:border-blue-400">Clear filters</button>}
              <Link href="/dashboard" className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800">Create a professional profile</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((agent) => (
              <article key={agent.id} className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md">
                <Link href={`/agents/${agent.id}`} className="group flex min-w-0 items-start gap-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-100 text-2xl font-extrabold text-slate-500">
                    {agent.avatar_url ? <img src={agent.avatar_url} alt={agent.full_name ? `${agent.full_name} profile` : 'Professional profile'} className="h-full w-full object-cover" /> : (agent.full_name ?? 'G').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{agent.role === 'agent' ? 'Real-estate agent' : 'Property owner'}</p>
                    <h3 className="mt-1 break-words text-lg font-extrabold leading-6 text-slate-950 group-hover:text-blue-700">{agent.full_name ?? 'GoNest member'}</h3>
                    <p className="mt-1 break-words text-sm text-slate-600">{agent.agency_name ?? 'Independent professional'}</p>
                    {agent.rating != null && <p className="mt-2 text-sm font-bold text-slate-900"><span className="text-amber-500">★</span> {agent.rating.toFixed(1)} <span className="font-normal text-slate-500">({agent.review_count} {agent.review_count === 1 ? 'review' : 'reviews'})</span></p>}
                  </div>
                </Link>

                <div className="mt-4 flex flex-wrap gap-2">
                  {agent.agent_verified && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">✓ GoNest verified</span>}
                  {agent.rera_number && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">RERA number provided · verify status</span>}
                  {!agent.agent_verified && !agent.rera_number && <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">Credentials not verified on GoNest</span>}
                </div>

                {agent.bio && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{agent.bio}</p>}

                <div className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 mt-5">
                  <div><p className="text-xl font-extrabold text-slate-950">{agent.total_listings ?? 0}</p><p className="mt-1 text-xs text-slate-500">Published listings</p></div>
                  <div><p className="text-xl font-extrabold text-slate-950">{agent.review_count ?? 0}</p><p className="mt-1 text-xs text-slate-500">Published reviews</p></div>
                </div>
                <Link href={`/agents/${agent.id}`} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800 transition hover:border-blue-500 hover:bg-blue-100">View profile <span className="ml-2" aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="grid gap-6 rounded-2xl bg-[#eef4fb] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-9">
            <div><p className="text-sm font-bold uppercase tracking-wider text-blue-700">Are you a real-estate professional?</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">Help more people find you.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Create a GoNest profile, publish genuine listings and make your service areas clear to buyers and tenants.</p></div>
            <Link href="/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800">Create a professional profile <span className="ml-2" aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
            <div><h2 className="text-xl font-extrabold text-slate-950">Explore agent directories</h2><p className="mt-2 text-sm leading-6 text-slate-600">Explore the main launch markets and narrow your search by locality as profile coverage grows.</p><div className="mt-4 flex flex-wrap gap-2">{['Mumbai', 'Pune', 'Thane', 'Navi Mumbai', 'Pimpri-Chinchwad'].map((area) => <button key={area} type="button" onClick={() => { setLocation(area); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">{area} agents</button>)}</div><a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-bold text-blue-700 underline underline-offset-2">Visit official MahaRERA website ↗</a></div>
            <div className="rounded-2xl border border-slate-200 p-5 md:p-7"><h2 className="text-xl font-extrabold text-slate-950">Frequently asked questions</h2><div className="mt-3 divide-y divide-slate-100">{FAQ.map((item) => <details key={item.q} className="group py-4"><summary className="cursor-pointer list-none pr-6 font-semibold text-slate-800">{item.q}<span className="float-right text-blue-700 transition group-open:rotate-45">＋</span></summary><p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p></details>)}<details className="group py-4"><summary className="cursor-pointer list-none pr-6 font-semibold text-slate-800">What is the difference between an agent and a broker?<span className="float-right text-blue-700 transition group-open:rotate-45">＋</span></summary><p className="mt-3 text-sm leading-6 text-slate-600">Usage and legal requirements can differ. Check applicable MahaRERA registration requirements and current registration status before engaging a professional.</p></details></div></div>
          </div>
        </div>
      </section>
    </>
  );
}
