'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';

type Props = { agents: Profile[] };

const FAQ = [
  { q: 'How do I choose a real-estate agent?', a: 'Compare local experience, relevant listings, communication and registration details. Ask questions and independently check credentials before making a commitment.' },
  { q: 'Does a GoNest verification badge mean MahaRERA registration is verified?', a: 'Not necessarily. GoNest profile review and MahaRERA registration are separate checks. Confirm the registration number and current status on the official MahaRERA portal.' },
  { q: 'How can I contact an agent?', a: 'Open the professional profile to review published details and available listings. Call is shown only when a public, phone-verified number is available.' },
  { q: 'What is the difference between an agent and a broker?', a: 'The terms are often used interchangeably, but legal requirements depend on the activity and applicable rules. Check the current MahaRERA requirements for your transaction.' },
];

const cityShortcuts = ['Mumbai', 'Pune', 'Thane', 'Navi Mumbai', 'Pimpri-Chinchwad'];

export function AgentDirectory({ agents }: Props) {
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'agent' | 'owner' | 'all'>('agent');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasListingsOnly, setHasListingsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevant' | 'rating' | 'listings'>('relevant');

  const publicAgents = useMemo(() => agents.filter((agent) => agent.role === 'agent'), [agents]);
  const totalListings = publicAgents.reduce((sum, agent) => sum + (agent.total_listings ?? 0), 0);
  const ratedAgents = publicAgents.filter((agent) => agent.rating != null);
  const averageRating = ratedAgents.length
    ? (ratedAgents.reduce((sum, agent) => sum + (agent.rating ?? 0), 0) / ratedAgents.length).toFixed(2)
    : null;
  const goNestReviewed = publicAgents.filter((agent) => agent.agent_verified).length;

  const filtered = useMemo(() => {
    const locationTerm = location.trim().toLowerCase();
    const nameTerm = name.trim().toLowerCase();
    return agents.filter((agent) => {
      const profileText = [agent.full_name, agent.agency_name, agent.bio].filter(Boolean).join(' ').toLowerCase();
      const matchesLocation = !locationTerm || profileText.includes(locationTerm);
      const matchesName = !nameTerm || [agent.full_name, agent.agency_name].filter(Boolean).join(' ').toLowerCase().includes(nameTerm);
      const matchesRole = role === 'all' || agent.role === role;
      const matchesVerified = !verifiedOnly || agent.agent_verified;
      const matchesListings = !hasListingsOnly || (agent.total_listings ?? 0) > 0;
      return matchesLocation && matchesName && matchesRole && matchesVerified && matchesListings;
    }).sort((a, b) => {
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
        <div className="mx-auto max-w-7xl px-5 pb-8 pt-7 md:px-8 md:pb-12 md:pt-10">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700 hover:underline">Home</Link><span className="mx-2">/</span><span className="font-medium text-slate-700">Agents</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> REAL-ESTATE PROFESSIONAL DIRECTORY
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">Find the right agent for your next move.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">Explore GoNest professional profiles across Mumbai and Pune. Review published listings, ratings and registration details before you connect.</p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-extrabold text-slate-950">{publicAgents.length}</p><p className="mt-1 text-sm text-slate-500">Agent profiles</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-extrabold text-slate-950">{totalListings.toLocaleString('en-IN')}</p><p className="mt-1 text-sm text-slate-500">Listings on agent profiles</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-extrabold text-slate-950">{averageRating ?? '—'}</p><p className="mt-1 text-sm text-slate-500">Average published profile rating</p>
            </div>
          </div>

          <form onSubmit={(event) => event.preventDefault()} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Location</span>
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, locality or PIN code" className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Agent or agency name…" className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
              </label>
              <button type="submit" className="h-12 rounded-xl bg-blue-700 px-7 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300">Find an agent</button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold uppercase tracking-wide text-slate-500">Popular markets</span>
              {cityShortcuts.map((area) => <button key={area} type="button" onClick={() => setLocation(area)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${location.toLowerCase() === area.toLowerCase() ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700'}`}>{area}</button>)}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Location search matches information currently published in agent names, agencies and bios. Structured service-area matching will be available when verified locality data is added.</p>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-11">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">GoNest professionals</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">{location.trim() ? `Agent profiles matching “${location.trim()}”` : 'Real-estate agents in Mumbai & Pune'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Compare public profile information, published listing counts and available registration details.</p>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            Sort by
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="h-11 min-w-40 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600">
              <option value="relevant">Recommended</option><option value="rating">Top rated</option><option value="listings">Most listings</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 py-4">
          <span className="mr-1 text-sm font-semibold text-slate-600">Show</span>
          {[
            { value: 'agent' as const, label: 'Agents' },
            { value: 'owner' as const, label: 'Property owners' },
            { value: 'all' as const, label: 'All profiles' },
          ].map((option) => <button key={option.value} type="button" onClick={() => setRole(option.value)} aria-pressed={role === option.value} className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${role === option.value ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'}`}>{option.label}</button>)}
          <button type="button" aria-pressed={verifiedOnly} onClick={() => setVerifiedOnly((value) => !value)} className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${verifiedOnly ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}`}>GoNest profile reviewed</button>
          <button type="button" aria-pressed={hasListingsOnly} onClick={() => setHasListingsOnly((value) => !value)} className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${hasListingsOnly ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}`}>Has listings</button>
          {(verifiedOnly || hasListingsOnly || location || name || role !== 'agent' || sortBy !== 'relevant') && <button type="button" onClick={clearFilters} className="px-2 py-2 text-sm font-semibold text-blue-700 hover:underline">Clear all</button>}
          <span className="ml-auto text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? 'profile' : 'profiles'}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="my-8 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-700">⌕</div>
            <h3 className="mt-5 text-xl font-bold text-slate-950">{agents.length === 0 ? 'Be among the first professionals on GoNest' : 'No matching profiles found'}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{agents.length === 0 ? 'No public agent profiles are available yet. As professionals publish complete profiles, they can appear in this directory.' : 'Try another name or area, change the profile type, or clear filters to see more results.'}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {agents.length > 0 && <button type="button" onClick={clearFilters} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:border-blue-400">Clear filters</button>}
              <Link href="/dashboard" className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800">Create a professional profile</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((agent) => (
              <article key={agent.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <Link href={`/agents/${agent.id}`} className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-2xl font-extrabold text-slate-500">
                      {agent.avatar_url ? <img src={agent.avatar_url} alt={agent.full_name ? `${agent.full_name} profile` : 'Professional profile'} className="h-full w-full object-cover" /> : (agent.full_name ?? 'G').charAt(0).toUpperCase()}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{agent.role === 'agent' ? 'REAL-ESTATE AGENT' : 'PROPERTY OWNER'}</p>
                      <Link href={`/agents/${agent.id}`} className="mt-1 block break-words text-lg font-extrabold leading-6 text-slate-950 hover:text-blue-700">{agent.full_name ?? 'GoNest member'}</Link>
                      <p className="mt-1 break-words text-sm text-slate-600">{agent.agency_name ?? 'Independent professional'}</p>
                      {agent.rating != null ? <p className="mt-2 text-sm font-bold text-slate-900"><span className="text-amber-500">★</span> {agent.rating.toFixed(2)} <span className="font-normal text-slate-500">({agent.review_count} reviews)</span></p> : <p className="mt-2 text-xs text-slate-500">No public rating yet</p>}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700">{agent.agent_verified ? 'GoNest profile reviewed' : 'Profile review not confirmed'}</p>
                        <p className="mt-1 break-all text-sm text-slate-600">{agent.rera_number ? `MahaRERA number provided: ${agent.rera_number}` : 'No MahaRERA number published'}</p>
                      </div>
                      <a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="shrink-0 text-xs font-bold text-blue-700 hover:underline">Check RERA ↗</a>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">A number provided on a profile is not proof of current registration. Confirm details on the official registry.</p>
                  </div>

                  {agent.bio && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{agent.bio}</p>}

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                    <div><p className="text-xl font-extrabold text-slate-950">{(agent.total_listings ?? 0).toLocaleString('en-IN')}</p><p className="mt-1 text-xs text-slate-500">Published listings</p></div>
                    <div><p className="text-xl font-extrabold text-slate-950">{(agent.review_count ?? 0).toLocaleString('en-IN')}</p><p className="mt-1 text-xs text-slate-500">Published reviews</p></div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {agent.phone && agent.phone_verified ? <a href={`tel:${agent.phone.replace(/[^\d+]/g, '')}`} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-2 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">Call</a> : <span className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-400">Call</span>}
                    <Link href={`/agents/${agent.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-2 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">Message</Link>
                    <Link href={`/agents/${agent.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-2 py-2 text-xs font-bold text-white transition hover:bg-blue-800">Meet</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="grid gap-6 rounded-2xl bg-[#eef4fb] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-9">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-700">Are you a registered broker?</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">Join GoNest’s professional network.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Create a profile and help buyers and renters discover your services. Registration details are reviewed separately; a profile is not an endorsement or a guarantee of leads.</p>
            </div>
            <Link href="/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800">Register as an agent — free <span className="ml-2" aria-hidden="true">→</span></Link>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">MahaRERA verification</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Check registration status directly with the official Maharashtra Real Estate Regulatory Authority before engaging an agent.</p>
              <a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700 underline underline-offset-2">Visit MahaRERA ↗</a>
              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                <li>✓ Check registration status and validity</li><li>✓ Match the registration to the agent or agency</li><li>✓ Confirm listing details before paying or signing</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5 md:p-7">
              <h2 className="text-xl font-extrabold text-slate-950">Frequently asked questions</h2>
              <div className="mt-3 divide-y divide-slate-100">
                {FAQ.map((item) => <details key={item.q} className="group py-4"><summary className="cursor-pointer list-none pr-6 font-semibold text-slate-800">{item.q}<span className="float-right text-blue-700 transition group-open:rotate-45">＋</span></summary><p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p></details>)}
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-100 pt-6">
            <p className="text-xs leading-5 text-slate-500">GoNest displays information available in public professional profiles. Ratings, review counts and listing counts reflect available platform data and may change. Verify credentials and transaction details independently.</p>
          </div>
        </div>
      </section>
    </>
  );
}
