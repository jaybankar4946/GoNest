'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';

type Props = { agents: Profile[] };


type LocalBrokerage = { name: string; area: string; address: string; phone: string; rating: string; reviews: number; focus: string; rera?: string; website?: string; source: string };

const LOCAL_BROKERAGES: LocalBrokerage[] = [
  { name: 'R.B Estate Agency', area: 'Thane West · Kasarvadavali', address: 'Shop 4, Mayuresh Apartment, Ghodbunder Road, Thane West', phone: '+919820975747', rating: '4.9', reviews: 1635, focus: 'Residential property · Ghodbunder Road corridor', source: 'Public business listing' },
  { name: 'Shivam Properties', area: 'Thane West · Dhokali', address: 'Shop 14, Runwal Estate, behind R Mall, Dhokali, Thane West', phone: '+918080807060', rating: '4.9', reviews: 219, focus: 'Residential buying, renting and resale', source: 'Public business listing' },
  { name: 'Stanley Estate Consultants', area: 'Mumbai · Andheri East', address: 'Twin Arcade Premises, Military Road, Marol, Andheri East', phone: '+919821026455', rating: '4.9', reviews: 490, focus: 'Residential and commercial property', source: 'Public business listing' },
  { name: 'Kwick Property Consultants', area: 'Mumbai · Andheri West', address: 'Amar Jyoti Building, Manish Nagar, Four Bungalows, Andheri West', phone: '+919833220013', rating: '4.9', reviews: 297, focus: 'Buying, renting and property consulting', source: 'Public business listing' },
  { name: 'Chembur Properties (Roopam Estate Agency)', area: 'Mumbai · Chembur', address: 'Central Avenue Road, Vishwakarma G, Chembur', phone: '+919820182285', rating: '4.9', reviews: 174, focus: 'Chembur residential and commercial property', source: 'Public business listing' },
  { name: 'Jagah Dekho', area: 'Mumbai · Mulund West', address: 'Sai Arcade, Netaji Subhash Chandra Road, near Mulund station', phone: '+918879135850', rating: '4.9', reviews: 389, focus: 'Residential, rental and commercial consulting', source: 'Public business listing' },
  { name: 'EK-OM Real Estate', area: 'Mumbai · Chembur / Deonar', address: 'Raikar Chambers, Govandi Station Road, Deonar, Chembur', phone: '+919820720888', rating: '4.9', reviews: 336, focus: 'Residential and commercial property', source: 'Public business listing' },
  { name: 'Namo Property Consultant', area: 'Mumbai · Kandivali East', address: 'Whispering Palms Shopping Center, Lokhandwala Township, Kandivali East', phone: '+919833529163', rating: '5.0', reviews: 270, focus: 'Residential and commercial property consulting', source: 'Public business listing' },
  { name: 'Krishna Housing', area: 'Thane West · Panch Pakhadi', address: 'Shop 5, Gagangiri CHS, Bhakti Mandir, Panch Pakhadi, Thane West', phone: '+919769560646', rating: '4.9', reviews: 244, focus: 'Residential, commercial and rental consulting', source: 'Public business listing' },
  { name: 'RTF Properties', area: 'Thane West · Wagle Estate / MMR', address: '316, 3rd Floor, Centrum, S.G. Barve Road, Wagle Estate, Thane West', phone: '+919920630736', rating: '', reviews: 0, focus: 'Buying, selling and residential/commercial advisory', rera: 'A031182600909', website: 'https://rtfproperties.in/', source: 'Agency website; RERA claim should be checked on MahaRERA' },
];

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

  const filtered = useMemo(() => {
    const locationTerm = location.trim().toLowerCase();
    const nameTerm = name.trim().toLowerCase();
    return agents.filter((agent) => {
      const profileText = [agent.full_name, agent.agency_name, agent.bio].filter(Boolean).join(' ').toLowerCase();
      const matchesLocation = !locationTerm || profileText.includes(locationTerm);
      const matchesName = !nameTerm || [agent.full_name, agent.agency_name].filter(Boolean).join(' ').toLowerCase().includes(nameTerm);
      const matchesRole = role === 'all' || agent.role === role;
      return matchesLocation && matchesName && matchesRole;
    });
  }, [agents, location, name, role]);

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-800/50 via-slate-950 to-slate-950" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-blue-300">GoNest · Find local expertise</p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-6xl">A great agent makes all the difference.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">Find a real estate agent or connect with a property owner. Explore profiles, available listings and the details you need to make a confident next move.</p>
          <form className="mt-9 grid gap-3 rounded-2xl bg-white p-3 shadow-2xl md:grid-cols-[1fr_1fr_auto] md:p-4" onSubmit={(event) => event.preventDefault()}>
            <label className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Location or area</span>
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Mumbai, Thane, Bandra" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </label>
            <label className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Name or company</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Agent name or brokerage" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </label>
            <button type="submit" className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-blue-700">Search agents</button>
          </form>
          <p className="mt-3 text-xs text-slate-400">Search uses information currently published in GoNest profiles. Area matches depend on what each professional has written in their profile.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-700">LOCAL PROFESSIONALS</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">Real estate agents on GoNest</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">Compare real profiles, brokerage affiliations, RERA details where provided, ratings where available and active listing counts.</p>
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

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><span className="text-2xl">⌕</span></div>
            <h3 className="mt-5 text-xl font-bold text-slate-950">{agents.length === 0 ? 'Be one of the first professionals on GoNest' : 'No matching profiles found'}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{agents.length === 0 ? 'There are no public agent or owner profiles available yet. As professionals publish profiles on GoNest, they will appear here.' : 'Try another name or area, or clear the filters to see more profiles.'}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {agents.length > 0 && <button type="button" onClick={() => { setLocation(''); setName(''); setRole('all'); }} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800">Clear filters</button>}
              <Link href="/dashboard" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Join GoNest</Link>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">{filtered.length} profile{filtered.length === 1 ? '' : 's'} found</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((agent) => (
                <Link key={agent.id} href={`/agents/${agent.id}`} className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-2xl font-extrabold text-slate-500">
                      {agent.avatar_url ? <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" /> : (agent.full_name ?? 'G').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{agent.role === 'agent' ? 'Real estate agent' : 'Property owner'}</p>
                      <h3 className="mt-1 truncate text-lg font-extrabold text-slate-950 group-hover:text-blue-700">{agent.full_name ?? 'GoNest member'}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{agent.agency_name ?? 'Independent professional'}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {agent.agent_verified && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">✓ GoNest verified</span>}
                    {agent.rera_number && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">RERA: {agent.rera_number}</span>}
                    {!agent.agent_verified && !agent.rera_number && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Details to confirm</span>}
                  </div>
                  {agent.bio && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{agent.bio}</p>}
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-5 mt-5">
                    <div>
                      {agent.rating != null && <p className="font-bold text-slate-900">★ {agent.rating.toFixed(1)} <span className="text-xs font-normal text-slate-500">({agent.review_count} reviews)</span></p>}
                      <p className="mt-1 text-sm text-slate-600"><span className="font-bold text-slate-900">{agent.total_listings ?? 0}</span> active listing{(agent.total_listings ?? 0) === 1 ? '' : 's'}</p>
                    </div>
                    <span className="text-sm font-bold text-blue-700">View profile →</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>


      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-8 md:pb-16">
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">Mumbai & MMR · public business shortlist</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">10 local brokerages to contact</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">An initial discovery shortlist built from publicly available business profiles and agency websites—not a GoNest endorsement or a verified “top 10” ranking. Ratings and review counts shown are from public business listings and may change. Confirm the agent’s identity, active MahaRERA registration where required, fees and current property availability before proceeding.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LOCAL_BROKERAGES.map((broker, index) => {
            const waMessage = encodeURIComponent(`Hi, I found ${broker.name} through GoNest. I am looking for property in ${broker.area}. Please share current available options, full costs, your MahaRERA registration details (if applicable), and whether I can schedule a site visit.`);
            return (
              <article key={broker.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-extrabold text-blue-700">{String(index + 1).padStart(2, '0')}</div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">External business · not GoNest-verified</span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-950">{broker.name}</h3>
                <p className="mt-1 text-sm font-semibold text-blue-700">{broker.area}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{broker.focus}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{broker.address}</p>
                {broker.rating && <p className="mt-3 text-sm font-bold text-slate-900">★ {broker.rating} <span className="font-normal text-slate-500">· {broker.reviews.toLocaleString('en-IN')} public reviews</span></p>}
                {broker.rera && <p className="mt-2 text-xs leading-5 text-slate-600">Agency-published MahaRERA number: <span className="font-semibold">{broker.rera}</span> · verify current status on the official register.</p>}
                <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4 mt-4">
                  <a href={`tel:${broker.phone}`} className="flex-1 rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-bold text-white hover:bg-blue-700">Call</a>
                  <a href={`https://wa.me/${broker.phone.replace(/\D/g, '')}?text=${waMessage}`} target="_blank" rel="noreferrer" className="flex-1 rounded-xl bg-emerald-600 px-3 py-3 text-center text-sm font-bold text-white hover:bg-emerald-700">Ask / schedule visit</a>
                  {broker.website && <a href={broker.website} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 hover:border-blue-400">Website ↗</a>}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">{broker.source} · Contact details should be reconfirmed before use.</p>
              </article>
            );
          })}
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="font-bold text-slate-900">Customer safety checklist</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Ask for the agent’s full name and MahaRERA registration certificate; verify it on the official portal; request written brokerage/fees; never pay a token amount to an unverified personal account; and confirm the property’s current availability directly before travelling.</p>
          <a href="https://www.maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:underline">Open official MahaRERA ↗</a>
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
