'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';

type Props = { agents: Profile[] };
type LocalBroker = {
  name: string;
  area: string;
  address: string;
  rating: number;
  reviews: number;
  services: string[];
  note: string;
};

const LOCAL_BROKERS: LocalBroker[] = [
  { name: 'R.B Estate Agency', area: 'Kasarvadavali · Ghodbunder Road', address: 'Shop No 4, Mayuresh Apartment, opposite Hyper City, Kasarvadavali, Thane West, Thane 400615', rating: 4.9, reviews: 1635, services: ['Buy', 'Sell', 'Rent'], note: 'Residential and commercial brokerage' },
  { name: 'Kanhaiya Properties', area: 'Hiranandani Estate · Ghodbunder Road', address: 'Arcadia Building, 512-A, Ghodbunder Road, Hiranandani Estate, Thane West, Thane 400607', rating: 5.0, reviews: 270, services: ['Buy', 'Sell', 'Rent'], note: 'Local property brokerage and consultancy' },
  { name: 'Krishna Housing', area: 'Panch Pakhdi · Bhakti Mandir', address: 'Shop No 5, Gagangiri Cooperative Housing Society, opposite Malvan Restaurant, Bhakti Mandir, Panch Pakhdi, Thane West 400602', rating: 4.9, reviews: 244, services: ['Buy', 'Sell', 'Rent'], note: 'Residential and commercial property services' },
  { name: 'Shivam Properties', area: 'Manpada · Dhokali', address: 'Shop No 14, Runwal Estate, behind R Mall, Dhokali, Thane West 400607', rating: 4.9, reviews: 219, services: ['Buy', 'Sell', 'Rent'], note: 'Property brokerage and consultancy' },
  { name: 'Royalti', area: 'Kolshet Road · Lodha Supremus', address: 'Office 1110, 11th Floor, Gate 2, Lodha Supremus, Kolshet Road, Thane West 400607', rating: 4.8, reviews: 191, services: ['Buy', 'Sell', 'Rent'], note: 'Real estate consulting and brokerage' },
  { name: 'Ganesha Properties', area: 'Hiranandani Estate', address: 'Office 14, Silverlink CHS, Hiranandani Estate, Thane West 400607', rating: 5.0, reviews: 139, services: ['Buy', 'Sell', 'Rent'], note: 'Local property agency' },
  { name: 'Akhtar Realtors', area: 'Majiwada · Balkum', address: 'Piramal Vaikunth, Vatsal Tower, near ISKCON temple gate, Balkum Pada, Majiwada, Thane 400601', rating: 5.0, reviews: 112, services: ['Buy', 'Sell', 'Rent'], note: 'Property consultancy and rental services' },
  { name: 'Avenue Properties', area: 'Uthalsar · Castle Mill Circle', address: 'Shop 48, Nirmaladevi C Dighe Sankul, Meenatai Thakrey Chowk, Uthalsar, Thane West 400601', rating: 5.0, reviews: 110, services: ['Buy', 'Sell', 'Rent'], note: 'Residential and commercial property agency' },
  { name: 'Homesfy Realty Ltd', area: 'Cadbury Junction · Eastern Express Highway', address: 'Dev Corpora, Eastern Express Highway, near Cadbury Junction, Thane West 400601', rating: 4.6, reviews: 889, services: ['Buy', 'Sell', 'Rent'], note: 'Real estate brokerage and advisory' },
  { name: 'Quick Deals Realty', area: 'Majiwada Junction', address: 'Swati Sagar Industrial Estate, near Shreya Chemist, Majiwada Junction, Thane West 400601', rating: 4.9, reviews: 72, services: ['Buy', 'Sell', 'Rent'], note: 'Local property brokerage' },
];

const AREAS = ['All Thane', 'Hiranandani Estate', 'Ghodbunder Road', 'Kasarvadavali', 'Panch Pakhdi', 'Manpada', 'Majiwada', 'Uthalsar', 'Kolshet Road', 'Cadbury Junction'];

function initials(name: string) {
  return name.split(/\\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export function AgentDirectory({ agents }: Props) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('All Thane');
  const [service, setService] = useState('All services');
  const [sort, setSort] = useState('Most reviewed');

  const localBrokers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return LOCAL_BROKERS
      .filter((broker) => {
        const matchesQuery = !term || [broker.name, broker.area, broker.address, broker.note].join(' ').toLowerCase().includes(term);
        const matchesArea = area === 'All Thane' || (broker.area + ' ' + broker.address).toLowerCase().includes(area.toLowerCase());
        const matchesService = service === 'All services' || broker.services.includes(service);
        return matchesQuery && matchesArea && matchesService;
      })
      .sort((a, b) => {
        if (sort === 'Highest rated') return b.rating - a.rating || b.reviews - a.reviews;
        if (sort === 'Name A–Z') return a.name.localeCompare(b.name);
        return b.reviews - a.reviews;
      });
  }, [query, area, service, sort]);

  const verifiedAgents = useMemo(() => agents.filter((agent) =>
    agent.role === 'agent' && agent.agent_verified && Boolean(agent.rera_number?.trim())
  ), [agents]);

  const filteredAgents = useMemo(() => {
    const term = query.trim().toLowerCase();
    return verifiedAgents.filter((agent) =>
      !term || [agent.full_name, agent.agency_name, agent.bio, agent.rera_number].filter(Boolean).join(' ').toLowerCase().includes(term)
    );
  }, [verifiedAgents, query]);

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">Home</Link><span className="mx-2">/</span><span className="text-slate-700">Real estate agents</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Real estate agents in Thane, Maharashtra</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">Find local property brokers for buying, selling or renting. Search by agency or neighbourhood, compare publicly listed ratings, and contact a professional that fits your needs.</p>

          <form className="mt-7 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-12 md:p-5" onSubmit={(event) => event.preventDefault()}>
            <label className="block md:col-span-5">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800">City, neighbourhood or broker</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Thane, Hiranandani Estate, broker name" className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="block md:col-span-3">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800">Neighbourhood</span>
              <select value={area} onChange={(event) => setArea(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none">
                {AREAS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800">Service</span>
              <select value={service} onChange={(event) => setService(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none">
                {['All services', 'Buy', 'Sell', 'Rent'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800">Sort by</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none">
                <option>Most reviewed</option><option>Highest rated</option><option>Name A–Z</option>
              </select>
            </label>
            <div className="flex items-center gap-3 md:col-span-12">
              <button type="submit" className="h-10 rounded-md bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800">Find agents</button>
              <button type="button" onClick={() => { setQuery(''); setArea('All Thane'); setService('All services'); setSort('Most reviewed'); }} className="text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-blue-700">Clear filters</button>
            </div>
          </form>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 font-semibold text-slate-700">Popular areas</span>
            {['Hiranandani Estate', 'Ghodbunder Road', 'Majiwada', 'Panch Pakhdi'].map((item) => (
              <button key={item} type="button" onClick={() => setArea(item)} className={`rounded-full border px-3 py-1.5 ${area === item ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'}`}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-9">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-xl font-bold text-slate-950">Local broker directory</h2><p className="mt-1 text-sm text-slate-600">{localBrokers.length} {localBrokers.length === 1 ? 'brokerage' : 'brokerages'} found in Thane</p></div>
            <span className="text-xs text-slate-500">Public directory information · Not GoNest verified</span>
          </div>
          <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-500">Ratings and review counts are from public business listings and can change or differ by platform. They are shown for discovery only and are not GoNest reviews or a guarantee of quality.</p>

          {localBrokers.length ? <div className="divide-y divide-slate-200 border-y border-slate-200">
            {localBrokers.map((broker, index) => (
              <article key={broker.name} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-base font-bold text-slate-700">{initials(broker.name)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-slate-500">{index + 1}</span><h3 className="text-lg font-bold text-slate-950">{broker.name}</h3><span className="rounded-sm border border-slate-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Local brokerage</span></div>
                  <p className="mt-1 text-sm text-slate-600">{broker.note}</p>
                  <p className="mt-2 text-sm text-slate-600"><span className="font-medium text-slate-800">Area:</span> {broker.area}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{broker.address}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                    <span><span className="text-amber-500">★</span> <strong className="text-slate-900">{broker.rating.toFixed(1)}</strong> <span>({broker.reviews.toLocaleString('en-IN')} public reviews)</span></span>
                    <span className="flex gap-1.5">{broker.services.map((item) => <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{item}</span>)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(broker.name + ', ' + broker.address)}`} target="_blank" rel="noreferrer" className="inline-flex min-w-32 items-center justify-center rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">View business</a>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(broker.name + ' Thane reviews')}`} target="_blank" rel="noreferrer" className="inline-flex min-w-32 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">Read reviews</a>
                </div>
              </article>
            ))}
          </div> : <div className="rounded-lg border border-slate-200 px-5 py-12 text-center"><h3 className="font-semibold text-slate-900">No brokers match these filters</h3><p className="mt-1 text-sm text-slate-600">Try another neighbourhood or clear the filters.</p></div>}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-xl font-bold text-slate-950">GoNest verified professionals</h2><p className="mt-1 text-sm text-slate-600">GoNest agent profiles are listed separately and appear here only after registration details and verification have been reviewed.</p></div>
            <Link href="/list-with-gonest" className="inline-flex items-center justify-center rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Register as an agent</Link>
          </div>
          {filteredAgents.length ? <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white px-4">
            {filteredAgents.map((agent) => <article key={agent.id} className="flex items-center gap-4 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 font-bold text-slate-600">{agent.avatar_url ? <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" /> : initials(agent.full_name ?? 'GoNest agent')}</div>
              <div className="min-w-0 flex-1"><Link href={`/agents/${agent.id}`} className="font-semibold text-slate-950 hover:text-blue-700 hover:underline">{agent.full_name ?? 'GoNest agent'}</Link><p className="text-sm text-slate-600">{agent.agency_name ?? 'Independent agent'} · MahaRERA {agent.rera_number}</p></div>
              <Link href={`/agents/${agent.id}`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">View profile</Link>
            </article>)}
          </div> : <div className="mt-4 rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600">No GoNest-verified agent profiles are currently available. Public business directory listings above are independent and are not represented as GoNest-verified profiles.</div>}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-9 md:px-8">
          <h2 className="text-xl font-bold text-slate-950">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-slate-200">
            <details className="py-4"><summary className="cursor-pointer font-semibold text-slate-900">How do I find a property broker in Thane?</summary><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Search by broker name or neighbourhood, narrow the list with filters, and check the business details and reviews on the linked public listing before making a decision.</p></details>
            <details className="py-4"><summary className="cursor-pointer font-semibold text-slate-900">Are these GoNest-verified agents?</summary><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">No. The local brokerage section is a discovery list based on public business information. GoNest verification is shown separately only for profiles that have completed GoNest's review process.</p></details>
            <details className="py-4"><summary className="cursor-pointer font-semibold text-slate-900">Can I register my brokerage with GoNest?</summary><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Yes. Create an agent account, complete your professional profile, submit registration details and manage your inventory from the dashboard. Public verification is subject to review.</p></details>
          </div>
        </div>
      </section>
    </>
  );
}
