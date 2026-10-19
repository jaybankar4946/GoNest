'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search, Star, Phone, MessageCircle, Calendar, ShieldCheck, ChevronDown,
  Award, Users, X, ExternalLink, Check, TrendingUp, MapPin,
} from 'lucide-react';
import type { Profile } from '@/lib/types';

type Props = { agents: Profile[] };

const CITY_OPTS = ['All Cities', 'Mumbai', 'Pune', 'Both'];
const SPEC_OPTS = ['All Specializations', 'Luxury', 'IT Corridor', 'Affordable', 'NRI Buyers', 'New Projects', 'Investment', 'Commercial', 'Rental'];
const LANG_OPTS = ['Any Language', 'English', 'Hindi', 'Marathi', 'Gujarati', 'Malayalam', 'Kannada'];
const SORT_OPTS = ['Top Rated', 'Most Listings', 'Most Reviews', 'Recently Joined'];
const LANG_CODES: Record<string, string> = { English: 'EN', Hindi: 'HI', Marathi: 'MR', Gujarati: 'GU', Malayalam: 'ML', Kannada: 'KN' };
const SPEC_TERMS: Record<string, string[]> = {
  Luxury: ['luxury', 'premium', 'high-value'], 'IT Corridor': ['it corridor', 'it professional', 'hinjewadi', 'powai'],
  Affordable: ['affordable', 'budget', 'value homes'], 'NRI Buyers': ['nri'], 'New Projects': ['new project', 'new launch', 'developer'],
  Investment: ['investment', 'investor'], Commercial: ['commercial', 'office'], Rental: ['rental', 'rent', 'leasing'],
};
const CITY_TERMS: Record<string, string[]> = {
  Mumbai: ['mumbai', 'thane', 'navi mumbai', 'mulund', 'bandra', 'worli', 'andheri', 'borivali'],
  Pune: ['pune', 'baner', 'wakad', 'hinjewadi', 'kharadi', 'aundh', 'hadapsar'],
};

function profileText(agent: Profile) {
  return [agent.full_name, agent.agency_name, agent.bio].filter(Boolean).join(' ').toLowerCase();
}
function inferredLanguages(agent: Profile) {
  const bio = (agent.bio ?? '').toLowerCase();
  const matches: string[] = [];
  for (const [name, code] of Object.entries(LANG_CODES)) {
    if (bio.includes(name.toLowerCase()) || new RegExp('(^|[^a-z])' + code.toLowerCase() + '([^a-z]|$)').test(bio)) matches.push(code);
  }
  return matches;
}
function inferredSpecializations(agent: Profile) {
  const bio = (agent.bio ?? '').toLowerCase();
  return Object.entries(SPEC_TERMS).filter(([, terms]) => terms.some((term) => bio.includes(term))).map(([label]) => label);
}
function matchesCity(agent: Profile, city: string) {
  if (city === 'All Cities') return true;
  const text = profileText(agent);
  if (city === 'Both') return CITY_TERMS.Mumbai.some((term) => text.includes(term)) && CITY_TERMS.Pune.some((term) => text.includes(term));
  return (CITY_TERMS[city] ?? []).some((term) => text.includes(term));
}

function AgentCard({ agent }: { agent: Profile }) {
  const [open, setOpen] = useState(false);
  const specializations = inferredSpecializations(agent);
  const languages = inferredLanguages(agent);
  const hasReraNumber = Boolean(agent.rera_number?.trim());

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
        <div className="p-5">
          <div className="mb-4 flex items-start gap-4">
            <Link href={`/agents/${agent.id}`} className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-100 bg-slate-100 text-xl font-extrabold text-slate-500">
              {agent.avatar_url ? <img src={agent.avatar_url} alt={agent.full_name ?? 'Agent'} className="h-full w-full object-cover" /> : (agent.full_name ?? 'G').charAt(0).toUpperCase()}
              {agent.agent_verified && <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500"><Check className="h-3 w-3 text-white" /></span>}
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/agents/${agent.id}`} className="block break-words text-base font-extrabold leading-tight text-gray-900 hover:text-blue-700">{agent.full_name ?? 'GoNest professional'}</Link>
                  <p className="mt-0.5 break-words text-sm text-gray-500">{agent.agency_name ?? 'Independent professional'}</p>
                </div>
                {agent.agent_verified && <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-right text-[10px] font-bold text-blue-700">GoNest reviewed</span>}
              </div>
              <div className="mt-2 flex items-center gap-1">
                {[1,2,3,4,5].map((i) => <Star key={i} className={`h-3.5 w-3.5 ${agent.rating != null && i <= Math.round(agent.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}
                {agent.rating != null ? <><span className="ml-1 text-xs font-bold text-gray-700">{agent.rating.toFixed(2)}</span><span className="text-xs text-gray-400">({agent.review_count} reviews)</span></> : <span className="text-xs text-gray-400">No public rating yet</span>}
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-800">{hasReraNumber ? 'MahaRERA number provided' : 'MahaRERA status not confirmed'}</p>
                <p className="break-all text-xs text-emerald-700">{hasReraNumber ? agent.rera_number : 'Check registration before engaging'}</p>
              </div>
            </div>
            <a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-emerald-700 hover:underline">Verify <ExternalLink className="h-3 w-3" /></a>
          </div>
          <p className="mb-4 text-xs leading-5 text-gray-500">A number supplied on a profile is not proof of current licence status. Confirm directly with MahaRERA.</p>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              { val: (agent.total_listings ?? 0).toLocaleString('en-IN'), label: 'Listings' },
              { val: new Date(agent.created_at).getFullYear() || '—', label: 'Joined' },
              { val: '—', label: 'Deals' },
            ].map((s) => <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 text-center"><p className="text-sm font-extrabold text-gray-900">{s.val}</p><p className="text-xs text-gray-400">{s.label}</p></div>)}
          </div>

          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400"><MapPin className="h-3.5 w-3.5" /> Service areas</p>
            <p className="text-sm leading-5 text-gray-600">{agent.bio?.trim() || 'Service localities have not been added to this profile yet.'}</p>
          </div>
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Specializes in</p>
            <div className="flex flex-wrap gap-1.5">{specializations.length ? specializations.map((s) => <span key={s} className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">{s}</span>) : <span className="text-xs text-gray-400">Not specified in profile</span>}</div>
          </div>
          <div className="mb-5 flex min-h-6 items-center gap-2">
            <p className="shrink-0 text-xs font-bold uppercase tracking-wide text-gray-400">Languages:</p>
            <div className="flex flex-wrap gap-1">{languages.length ? languages.map((l) => <span key={l} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">{l}</span>) : <span className="text-xs text-gray-400">Not specified</span>}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {agent.phone && agent.phone_verified ? <a href={`tel:${agent.phone.replace(/[^\d+]/g, '')}`} className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Phone className="h-4 w-4" />Call</a> : <span className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 py-2.5 text-xs font-semibold text-gray-400"><Phone className="h-4 w-4" />Call</span>}
            <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><MessageCircle className="h-4 w-4" />Message</button>
            <Link href={`/agents/${agent.id}`} className="flex flex-col items-center gap-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"><Calendar className="h-4 w-4" />Meet</Link>
          </div>
        </div>
      </article>

      {open && <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
        <button aria-label="Close enquiry dialog" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div role="dialog" aria-modal="true" aria-labelledby={`enquiry-title-${agent.id}`} className="relative z-10 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
          <button onClick={() => setOpen(false)} aria-label="Close" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"><X className="h-4 w-4" /></button>
          <div className="mb-5 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 font-bold">{agent.avatar_url ? <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" /> : (agent.full_name ?? 'G').charAt(0)}</div><div><h2 id={`enquiry-title-${agent.id}`} className="font-bold text-gray-900">{agent.full_name ?? 'GoNest professional'}</h2><p className="text-xs text-gray-500">{agent.agency_name ?? 'Independent professional'}</p></div></div>
          <p className="mb-4 text-sm leading-6 text-gray-600">Continue to this agent’s GoNest profile to review their published information and available contact options.</p>
          <Link href={`/agents/${agent.id}`} className="flex w-full items-center justify-center rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-700">Open agent profile</Link>
          {agent.phone && agent.phone_verified && <a href={`tel:${agent.phone.replace(/[^\d+]/g, '')}`} className="mt-2 flex w-full items-center justify-center rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">Call verified phone</a>}
          <p className="mt-3 text-center text-xs text-gray-400">MahaRERA status should be confirmed independently.</p>
        </div>
      </div>}
    </>
  );
}

export function AgentDirectory({ agents }: Props) {
  const [city, setCity] = useState('All Cities');
  const [spec, setSpec] = useState('All Specializations');
  const [lang, setLang] = useState('Any Language');
  const [sort, setSort] = useState('Top Rated');
  const [query, setQuery] = useState('');
  const publicAgents = useMemo(() => agents.filter((a) => a.role === 'agent'), [agents]);
  const totalListings = publicAgents.reduce((sum, a) => sum + (a.total_listings ?? 0), 0);
  const rated = publicAgents.filter((a) => a.rating != null);
  const avgRating = rated.length ? (rated.reduce((sum, a) => sum + (a.rating ?? 0), 0) / rated.length).toFixed(2) : '—';

  const filtered = useMemo(() => publicAgents.filter((a) => {
    const text = profileText(a);
    if (!matchesCity(a, city)) return false;
    if (spec !== 'All Specializations' && !inferredSpecializations(a).includes(spec)) return false;
    if (lang !== 'Any Language' && !inferredLanguages(a).includes(LANG_CODES[lang])) return false;
    if (query && !text.includes(query.trim().toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'Top Rated') return (b.rating ?? -1) - (a.rating ?? -1);
    if (sort === 'Most Listings') return (b.total_listings ?? 0) - (a.total_listings ?? 0);
    if (sort === 'Most Reviews') return (b.review_count ?? 0) - (a.review_count ?? 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }), [publicAgents, city, spec, lang, query, sort]);

  const clear = () => { setCity('All Cities'); setSpec('All Specializations'); setLang('Any Language'); setQuery(''); setSort('Top Rated'); };

  return <div className="bg-[#fbfcfe]">
    <section className="border-b border-gray-100 bg-white py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"><ShieldCheck className="h-3.5 w-3.5" /> MAHARERA REGISTRATION CHECK</div>
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div><h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl" style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.025em' }}>Find a Verified Agent.</h1><p className="mt-3 max-w-lg text-base leading-relaxed text-gray-500">Discover real-estate professionals in Mumbai and Pune. Review available profile details and independently confirm MahaRERA registration before you engage.</p></div>
          <div className="grid grid-cols-3 gap-3">
            {[{ val: publicAgents.length.toLocaleString('en-IN'), label: 'Agent Profiles', Icon: Users }, { val: totalListings.toLocaleString('en-IN'), label: 'Published Listings', Icon: TrendingUp }, { val: avgRating, label: 'Avg. Profile Rating', Icon: Star }].map((s) => <div key={s.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-center md:p-4"><s.Icon className="mx-auto mb-1.5 h-5 w-5 text-blue-600" /><p className="text-xl font-extrabold text-gray-900 md:text-2xl">{s.val}</p><p className="mt-0.5 text-[11px] leading-4 text-gray-500 md:text-xs">{s.label}</p></div>)}
          </div>
        </div>
      </div>
    </section>

    <section className="sticky top-[68px] z-20 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
        <div className="relative min-w-[220px] flex-1 sm:flex-none"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Agent or agency name…" aria-label="Search agent or agency" className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-400 sm:w-56" /></div>
        {[{ value: city, set: setCity, opts: CITY_OPTS, label: 'City' }, { value: spec, set: setSpec, opts: SPEC_OPTS, label: 'Specialization' }, { value: lang, set: setLang, opts: LANG_OPTS, label: 'Language' }].map((filter) => <div key={filter.label} className="relative"><label className="sr-only">{filter.label}</label><select value={filter.value} onChange={(e) => filter.set(e.target.value)} className="max-w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm font-semibold outline-none focus:border-blue-400"><option disabled value=""> {filter.label} </option>{filter.opts.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" /></div>)}
        {(city !== 'All Cities' || spec !== 'All Specializations' || lang !== 'Any Language' || query) && <button onClick={clear} className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"><X className="h-3.5 w-3.5" />Clear</button>}
        <div className="ml-auto flex items-center gap-2"><div className="relative"><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort agents" className="max-w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-xs font-semibold outline-none"><option>Top Rated</option><option>Most Listings</option><option>Most Reviews</option><option>Recently Joined</option></select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" /></div><span className="whitespace-nowrap text-sm font-medium text-gray-500">{filtered.length} agents</span></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      {filtered.length === 0 ? <div className="py-20 text-center"><Users className="mx-auto mb-4 h-14 w-14 text-gray-200" /><p className="mb-2 text-xl font-bold text-gray-500">No agents match</p><p className="mb-4 text-sm text-gray-400">Try a different search. City, specialization and language filters use information present in profile text.</p><button onClick={clear} className="text-sm font-semibold text-blue-600 hover:underline">Clear all filters</button></div> : <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((agent) => <AgentCard key={agent.id} agent={agent} />)}</div>}
    </section>

    <section className="border-t border-gray-100 bg-gray-50 py-14 md:py-16">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600"><Award className="h-8 w-8 text-white" /></div>
        <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900" style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.025em' }}>Are you a registered broker?</h2>
        <p className="mx-auto mb-8 max-w-lg text-base text-gray-500">Join GoNest's professional network and create a profile for buyers and renters across Mumbai and Pune. Free listing, subject to GoNest's onboarding and verification process.</p>
        <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/dashboard" className="rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700">Register as Agent — Free</Link><a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="rounded-2xl border border-gray-200 bg-white px-8 py-4 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300">Learn about requirements <ExternalLink className="ml-1 inline h-3.5 w-3.5" /></a></div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-500">{['MahaRERA status checked separately', 'Profile review', 'Free listing', 'No fabricated lead claims'].map((f) => <span key={f} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />{f}</span>)}</div>
      </div>
    </section>
    <p className="mx-auto max-w-7xl px-4 py-5 text-xs leading-5 text-gray-400 md:px-6">Profile statistics and information reflect records currently published on GoNest. MahaRERA registration, service areas, experience and languages should be confirmed independently where not supported by verified records.</p>
  </div>;
}
