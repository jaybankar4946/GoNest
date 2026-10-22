'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';

type Props = { agents: Profile[] };

export function AgentDirectory({ agents }: Props) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Relevant');

  // Only profiles with both a recorded registration number and GoNest verification
  // are included in the verified directory. No demo or third-party agency figures.
  const verifiedAgents = useMemo(
    () => agents.filter((agent) =>
      agent.role === 'agent' &&
      agent.agent_verified &&
      Boolean(agent.rera_number?.trim())
    ),
    [agents],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = verifiedAgents.filter((agent) => {
      const searchable = [
        agent.full_name,
        agent.agency_name,
        agent.bio,
        agent.rera_number,
      ].filter(Boolean).join(' ').toLowerCase();
      return !term || searchable.includes(term);
    });

    return [...matches].sort((a, b) => {
      if (sort === 'Highest rated') {
        return (b.rating ?? -1) - (a.rating ?? -1);
      }
      if (sort === 'Most listings') {
        return (b.total_listings ?? 0) - (a.total_listings ?? 0);
      }
      if (sort === 'Most reviewed') {
        return (b.review_count ?? 0) - (a.review_count ?? 0);
      }
      return (b.total_listings ?? 0) - (a.total_listings ?? 0);
    });
  }, [verifiedAgents, search, sort]);

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-9 md:px-8 md:py-12">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">Home</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-slate-700">Real estate agents</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Find a real estate agent</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Browse registered GoNest agents, review their profiles and connect about buying, selling or renting in Mumbai and Pune.
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px_auto]">
            <label className="block">
              <span className="sr-only">Search agent or agency</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Agent name, company or registration number"
                className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="sr-only">Sort agents</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option>Relevant</option>
                <option>Highest rated</option>
                <option>Most reviewed</option>
                <option>Most listings</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setSearch(search.trim())}
              className="h-12 rounded-lg bg-blue-700 px-6 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Find agents
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-9">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Real estate agents</h2>
              <p className="mt-1 text-sm text-slate-600">
                {filtered.length.toLocaleString('en-IN')} {filtered.length === 1 ? 'verified profile' : 'verified profiles'}
                {search.trim() ? ' matching your search' : ' available'}
              </p>
            </div>
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-sm font-semibold text-blue-700 hover:underline">
                Clear search
              </button>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {filtered.map((agent) => (
                <article key={agent.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                  <Link
                    href={`/agents/${agent.id}`}
                    aria-label={`View ${agent.full_name ?? 'agent'} profile`}
                    className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xl font-bold text-slate-600"
                  >
                    {agent.avatar_url
                      ? <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" />
                      : (agent.full_name ?? 'G').charAt(0).toUpperCase()}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Link href={`/agents/${agent.id}`} className="text-lg font-bold text-slate-950 hover:text-blue-700 hover:underline">
                        {agent.full_name ?? 'GoNest agent'}
                      </Link>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        <span aria-hidden="true">✓</span> GoNest verified
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{agent.agency_name ?? 'Independent agent'}</p>
                    {agent.bio && <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-600">{agent.bio}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">MahaRERA</span>
                        <span className="max-w-52 truncate">{agent.rera_number}</span>
                        <a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="font-semibold text-blue-700 hover:underline">Check ↗</a>
                      </span>
                      {agent.rating != null && (
                        <span><span aria-hidden="true">★</span> <strong className="text-slate-900">{agent.rating.toFixed(1)}</strong>{agent.review_count > 0 ? ` · ${agent.review_count} reviews` : ' · No reviews yet'}</span>
                      )}
                      <span>{agent.total_listings ?? 0} listings</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
                    <Link href={`/agents/${agent.id}`} className="inline-flex min-w-32 items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
                      View profile
                    </Link>
                    <Link href={`/agents/${agent.id}#contact`} className="inline-flex min-w-32 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                      Contact agent
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <h3 className="text-xl font-bold text-slate-950">
                {verifiedAgents.length === 0 ? 'Verified agent profiles are being onboarded' : 'No agents found'}
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {verifiedAgents.length === 0
                  ? 'GoNest only shows agent profiles that have a recorded registration number and have passed GoNest verification. Agents can register and complete their profile to be considered for this directory.'
                  : 'Try a different name, company or registration number, or clear your search.'}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => setSearch('')} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                  Clear search
                </button>
                <Link href="/list-with-gonest" className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
                  Register as an agent
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
          <div className="grid gap-8 md:grid-cols-[1fr_320px] md:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">Are you a real estate agent?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Create your GoNest profile, submit your registration details and manage your property inventory from one dashboard. Profiles appear in the verified directory only after review.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/list-with-gonest" className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
                Register as an agent
              </Link>
              <Link href="/auth" className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                Already registered? Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
