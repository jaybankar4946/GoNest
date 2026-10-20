'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { telHref, waHref } from '@/lib/contact';

type Props = { agents: Profile[] };


const FAQ = [
  { q: 'How do I find a good real estate agent?', a: 'Look for relevant local experience, clear communication, current listings and registration details where applicable. Speak with more than one professional before deciding.' },
  { q: 'How can I check an agent’s RERA registration?', a: 'Use the official MahaRERA search to verify the registration details. A number displayed on a profile is not, by itself, proof that it is current.' },
  { q: 'How do I contact an agent on GoNest?', a: 'Open a profile to review the details and listings available on GoNest. Contact options depend on the information the professional has published.' },
  { q: 'What is the difference between an agent and an owner?', a: 'An owner lists a property they own or represent directly. An agent or broker helps clients discover properties and coordinate transactions.' },
];

export function AgentDirectory({ agents }: Props) {
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasListingsOnly, setHasListingsOnly] = useState(false);

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
    });
  }, [agents, location, name, role, verifiedOnly, hasListingsOnly]);

  const verifiedCount = agents.filter((agent) => agent.agent_verified).length;
  const totalListings = agents.reduce((sum, agent) => sum + (agent.total_listings ?? 0), 0);
  const ratedAgents = agents.filter((agent) => agent.rating != null);
  const averageRating = ratedAgents.length ? ratedAgents.reduce((sum, agent) => sum + (agent.rating ?? 0), 0) / ratedAgents.length : null;
  return (
    <>
      <section className="bg-gray-950 py-10 text-white md:py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-200">GoNest · Real estate professionals</div>
          <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">Find a Trusted Agent.<br />Move with Confidence.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300">Explore published agent and owner profiles, compare available listings and contact professionals directly. Verification and registration details appear only when recorded.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {[{value: agents.length.toLocaleString("en-IN"), label: "Public profiles"}, {value: verifiedCount.toLocaleString("en-IN"), label: "GoNest verified"}, {value: totalListings.toLocaleString("en-IN"), label: "Listed properties"}, {value: averageRating == null ? "—" : averageRating.toFixed(1), label: "Avg. recorded rating"}].map((stat) => <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-3.5"><p className="text-xl font-extrabold md:text-2xl">{stat.value}</p><p className="mt-1 text-xs text-gray-400">{stat.label}</p></div>)}
            </div>
          </div>
          <form className="mt-8 grid gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg md:grid-cols-[1fr_1fr_auto] md:p-4" onSubmit={(event) => event.preventDefault()}>
            <label className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-xs font-semibold text-slate-600">Location or area</span>
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Mumbai, Thane, Bandra" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </label>
            <label className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Name or company</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Agent name or brokerage" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </label>
            <button type="submit" className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-blue-700">Search agents</button>
          </form>
          <p className="mt-3 text-xs text-gray-400">Search uses information currently published in GoNest profiles. Area matches depend on what each professional has written in their profile.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">Real estate professionals</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Showing published GoNest profiles only. Ratings and registration details appear only when recorded.</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filter by profile type">
            {[
              { value: 'all', label: 'All profiles' },
              { value: 'agent', label: 'Agents' },
              { value: 'owner', label: 'Owners' },
            ].map((option) => (
              <button key={option.value} type="button" onClick={() => setRole(option.value)} aria-pressed={role === option.value} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${role === option.value ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400'}`}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-5">
          <span className="mr-1 text-sm font-semibold text-slate-700">Refine:</span>
          <button type="button" aria-pressed={verifiedOnly} onClick={() => setVerifiedOnly(v => !v)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${verifiedOnly ? "border-blue-600 bg-blue-50 text-blue-800" : "border-slate-300 bg-white text-slate-700"}`}>✓ GoNest verified</button>
          <button type="button" aria-pressed={hasListingsOnly} onClick={() => setHasListingsOnly(v => !v)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${hasListingsOnly ? "border-blue-600 bg-blue-50 text-blue-800" : "border-slate-300 bg-white text-slate-700"}`}>Has active listings</button>
          {(verifiedOnly || hasListingsOnly) && <button type="button" onClick={() => {setVerifiedOnly(false);setHasListingsOnly(false);}} className="px-2 py-2 text-sm font-semibold text-blue-700 underline">Clear filters</button>}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><span className="text-2xl">⌕</span></div>
            <h3 className="mt-5 text-xl font-bold text-slate-950">{agents.length === 0 ? 'Be one of the first professionals on GoNest' : 'No matching profiles found'}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{agents.length === 0 ? 'There are no public agent or owner profiles available yet. As professionals publish profiles on GoNest, they will appear here.' : 'Try another name or area, or clear the filters to see more profiles.'}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {agents.length > 0 && <button type="button" onClick={() => { setLocation(''); setName(''); setRole('all'); setVerifiedOnly(false); setHasListingsOnly(false); }} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800">Clear filters</button>}
              <Link href="/dashboard" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Join GoNest</Link>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">{filtered.length} profile{filtered.length === 1 ? '' : 's'} found</p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((agent) => (
                <article key={agent.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
                  <div className="p-5 md:p-6">
                    <div className="flex items-start gap-4">
                      <Link href={`/agents/${agent.id}`} aria-label={`View ${agent.full_name ?? 'professional'} profile`} className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 text-2xl font-extrabold text-slate-500">
                        {agent.avatar_url ? <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" /> : (agent.full_name ?? 'G').charAt(0).toUpperCase()}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{agent.role === 'agent' ? 'Real estate agent' : 'Property owner'}</p>
                        <Link href={`/agents/${agent.id}`} className="mt-1 block text-lg font-extrabold leading-tight text-slate-950 hover:text-blue-700">{agent.full_name ?? 'GoNest member'}</Link>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{agent.agency_name ?? 'Independent professional'}</p>
                        {agent.rating != null && <p className="mt-2 text-sm font-bold text-amber-700">★ {agent.rating.toFixed(1)} <span className="font-normal text-slate-500">({agent.review_count} reviews)</span></p>}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {agent.agent_verified && <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">✓ GoNest verified</span>}
                      {agent.phone_verified && <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Phone verified</span>}
                      {agent.rera_number && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">RERA listed · {agent.rera_number}</span>}
                      {!agent.agent_verified && !agent.rera_number && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Verification details not listed</span>}
                    </div>
                    {agent.bio && <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{agent.bio}</p>}
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 bg-slate-50/70">
                    <div className="px-2 py-3 text-center"><p className="text-lg font-extrabold text-slate-950">{agent.total_listings ?? 0}</p><p className="text-[11px] text-slate-500">Active listings</p></div>
                    <div className="px-2 py-3 text-center"><p className="text-lg font-extrabold text-slate-950">{agent.review_count ?? 0}</p><p className="text-[11px] text-slate-500">Reviews</p></div>
                    <div className="px-2 py-3 text-center"><p className="text-lg font-extrabold text-slate-950">{agent.rating != null ? agent.rating.toFixed(1) : '—'}</p><p className="text-[11px] text-slate-500">Rating</p></div>
                  </div>
                  <div className="mt-auto p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {agent.phone ? <a href={telHref(agent.phone)} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">Call</a> : <span className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-400">Call unavailable</span>}
                      {agent.phone ? <a href={waHref(agent.phone, `Hi ${agent.full_name ?? ''}, I found your profile on GoNest and would like to enquire.`)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">Message</a> : <Link href={`/agents/${agent.id}`} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-300">Message</Link>}
                    </div>
                    <Link href={`/agents/${agent.id}`} className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-800 transition hover:bg-blue-100">View profile & arrange a visit <span aria-hidden="true">→</span></Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>


      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-8 md:pb-16">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center md:p-12">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Partner directory</p>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-950">More verified professionals coming soon</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">We’ve removed demonstration brokerage entries. Only real estate professionals who create a GoNest profile will appear in this directory; verification badges are shown only after verification is completed.</p>
          <Link href="/dashboard" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Join GoNest</Link>
        </div>
      </section>

      <section className="bg-slate-50 py-14 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[0.8fr_1.2fr] md:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700">For property professionals</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Grow your business with GoNest.</h2>
            <p className="mt-4 leading-7 text-slate-600">Create your professional profile, publish property listings and help more people discover your services.</p>
            <Link href="/dashboard" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Join GoNest →</Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="text-xl font-extrabold text-slate-950">Frequently asked questions</h2>
            <div className="mt-5 divide-y divide-slate-100">
              {FAQ.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="cursor-pointer list-none pr-6 font-semibold text-slate-800 marker:hidden">{item.q}<span className="float-right text-blue-700 group-open:rotate-45">＋</span></summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
