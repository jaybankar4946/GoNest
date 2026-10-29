import Link from 'next/link';
import { ShieldCheck, Layers, Eye, Search, Heart, MessageCircle, Check, ClipboardCheck, BadgeCheck, Calendar, FileCheck2, Landmark, Flag, Users, Navigation } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { DemoHomes } from '@/components/home/DemoHomes';
import { HomeSearch } from './HomeSearch';
import { HomeEMI } from './HomeEMI';
import { getFeatured, getCities, getHomeStats, getPopularLocalities, getAgents } from '@/lib/api';
import { THANE_TOP_AGENTS, businessMapsUrl } from '@/lib/thane-agents';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = { title: 'GoNest – Find Homes to Buy or Rent in India' };

const HERO = 'https://images.unsplash.com/photo-1762811054947-605b20298615?w=1600&h=900&fit=crop&auto=format';
const display = { fontFamily: 'var(--font-manrope), var(--font-display)' } as const;

const WHY = [
  { icon: ClipboardCheck, title: 'Reviewed before it goes live', desc: 'Every listing is checked by the GoNest team before it appears in search.' },
  { icon: ShieldCheck, title: 'Verified owners & agents', desc: 'Look for the verification badge and the RERA number on agent profiles.' },
  { icon: Layers, title: 'Everything on one page', desc: 'Price, area, BHK, photos, location on a map and contact options together.' },
  { icon: Search, title: 'Search that matches how you look', desc: 'Filter by locality, budget, BHK and type, then switch between list and map.' },
  { icon: Heart, title: 'Save and come back', desc: 'Shortlist homes to your account and compare them later.' },
  { icon: MessageCircle, title: 'Talk to the owner directly', desc: 'Call, WhatsApp, send an enquiry or book a visit slot in one tap.' },
];

const TRUST = [
  { icon: ClipboardCheck, title: 'Reviewed listings', items: ['Checked by the GoNest team before going live', 'Duplicate and unusual-price warnings for reviewers', 'Rejected listings never appear in search'] },
  { icon: BadgeCheck, title: 'Verified badge', items: ['Shown only after GoNest review', 'Platform-verified marks a deeper check', 'Not a guarantee of title or ownership'] },
  { icon: Users, title: 'Agent profiles', items: ['RERA number shown when the agent provides it', 'Verified agents carry a badge', 'See every active listing by an agent'] },
  { icon: Flag, title: 'Report anything', items: ['Report button on every listing', 'Reasons include fake, wrong price, already sold', 'Owners can mark listings sold or rented'] },
];
export default async function HomePage() {
  const [featured, cities, stats, popular, agentProfiles] = await Promise.all([getFeatured(6), getCities(), getHomeStats(), getPopularLocalities(8), getAgents()]);
  const directoryAgents = agentProfiles.filter((agent) => agent.role === 'agent');
  const strip = [
    { v: stats.listings, l: 'Live listings' },
    { v: stats.verified, l: 'Verified listings' },
    { v: stats.people, l: 'Owners & agents' },
    { v: stats.cities, l: 'Cities' },
  ];
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative" style={{ minHeight: 640, background: '#0b1220' }}>
          <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/65 via-gray-950/50 to-gray-950/85" />
          <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20 pb-20">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-8">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Reviewed listings from verified owners and agents
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-[68px] font-extrabold text-white leading-none max-w-4xl mb-4" style={{ ...display, letterSpacing: '-0.035em' }}>
              Find your next home.
            </h1>
            <p className="text-lg text-white/70 max-w-lg leading-relaxed mb-10">
              Search apartments, villas and plots to buy or rent, with clear prices, real photos and direct contact.
            </p>
            <HomeSearch cities={cities} />
            {cities.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {cities.slice(0, 6).map(c => (
                  <Link key={c.id} href={`/search?city=${c.id}`} className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 rounded-full transition-all">{c.name}</Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Home pathways — visual cards inspired by Zillow's editorial layout */}
        <section className="border-b border-gray-100 bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="mb-8 max-w-2xl sm:mb-10">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Your next move</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl" style={{ ...display, letterSpacing: '-0.03em' }}>How can GoNest help?</h2>
              <p className="mt-3 text-base leading-7 text-gray-600">Whether you’re buying, renting or listing a property, take your next step with confidence.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 md:gap-7">
              {[
                {title:'Buy a home',desc:'Explore homes, compare prices and understand the costs before you make your move.',href:'/buy',cta:'Explore homes',image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',alt:'Contemporary residential home exterior'},
                {title:'Rent a home',desc:'Find a place that fits your life, with rent, deposit and stated charges made clear.',href:'/rent',cta:'Find a rental',image:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',alt:'Bright contemporary home interior'},
                {title:'Sell or rent out',desc:'Reach people looking for a home. Add your property details and submit them for review.',href:'/list-with-gonest',cta:'List with GoNest',image:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85',alt:'Premium residential property'},
              ].map(item=>(
                <article key={item.title} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                  <Link href={item.href} className="block overflow-hidden" aria-label={item.cta}>
                    <div className="relative h-52 overflow-hidden bg-slate-100 sm:h-56">
                      <img src={item.image} alt={item.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transform-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent transition-opacity duration-300 group-hover:from-slate-950/15" />
                    </div>
                  </Link>
                  <div className="p-6 sm:p-7">
                    <h3 className="text-xl font-extrabold tracking-tight text-gray-950 sm:text-2xl">{item.title}</h3>
                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-gray-600 sm:text-base">{item.desc}</p>
                    <Link href={item.href} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition duration-200 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      {item.cta}<span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <DemoHomes />
        {/* Live stats (real counts) */}
        {stats.listings >= 20 && (<section className="border-y border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {strip.map(s => (
              <div key={s.l} className="text-center py-2 px-4">
                <p className="text-2xl font-extrabold text-gray-900" style={display}>{s.v.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.l}</p>
              </div>
            ))}
          </div>
        </section>)}

        {/* Featured */}
        {featured.length > 0 && (
          <section className="bg-gray-50 py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full mb-4"><BadgeCheck className="w-3.5 h-3.5" /> Featured</div>
                  <h2 className="text-4xl font-extrabold text-gray-900" style={{ ...display, letterSpacing: '-0.025em' }}>Featured properties</h2>
                </div>
                <Link href="/search" className="hidden md:block text-sm font-semibold text-blue-600 hover:text-blue-700">View all →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '36px 24px' }}>
                {featured.map(l => <PropertyCard key={l.id} listing={l} />)}
              </div>
            </div>
          </section>
        )}

        {/* Popular locations */}
        {popular.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6" style={{ ...display, letterSpacing: '-0.02em' }}>Popular locations</h2>
              <div className="flex flex-wrap gap-3">
                {popular.map(l => (
                  <Link key={l.id} href={`/search?q=${encodeURIComponent(l.name)}${l.cityId ? `&city=${l.cityId}` : ''}`} className="px-5 py-3 rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-sm font-medium text-gray-800 transition-all">
                    {l.name}<span className="text-gray-400">, {l.city}</span>
                  </Link>))}
              </div>
            </div>
          </section>
        )}

        {/* Hiranandani homes — Zillow-inspired recommendations carousel */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Featured collection · Thane</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl" style={{ ...display, letterSpacing: '-0.03em' }}>Homes For You</h2>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">Explore Hiranandani Estate homes and project details.</p>
              </div>
              <Link href="/search?q=Hiranandani" className="shrink-0 text-sm font-bold text-blue-700 hover:text-blue-900">See all homes →</Link>
            </div>
            <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-6 sm:px-6">
              {[
                { name: 'Villa Carino', config: '1 BHK', area: '438–453 sq ft carpet', location: 'Beside The Walk, Hiranandani Estate', image: 'https://www.houseofhiranandani.com/villa-carino-desk.jpg', href: '/homes/villa-carino', status: 'Ready to move' },
                { name: 'Solitaire', config: '1 BHK', area: '366–409 sq ft carpet', location: 'Hiranandani Estate, Thane West', image: 'https://www.houseofhiranandani.com/solitiar_desk_bnr.jpg', href: '/homes/solitaire', status: 'Ready to move' },
                { name: 'Delanna', config: '2 BHK', area: '698–703 sq ft carpet', location: 'Hiranandani Estate, Thane West', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fdelenna-new-desk-bnrx1up.jpg&w=1200', href: '/homes/delanna', status: 'Ready to move' },
                { name: 'Aralia', config: '3 BHK', area: 'Area varies by published layout', location: 'Hiranandani Estate, Thane West', image: 'https://www.houseofhiranandani.com/banner-desk-aralia.jpg', href: '/homes/aralia', status: 'Project details' },
                { name: 'Eagleridge Wing B', config: '2, 2.5 & 3 BHK', area: '641–999 sq ft', location: 'Hiranandani Estate, Thane West', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=1200', href: '/homes/eagleridge-wing-b', status: 'Project details' },
                { name: 'Villa Rica', config: '2 BHK', area: 'Area varies by unit', location: 'Hiranandani Estate, Thane', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=1200', href: '/homes/villa-rica', status: 'Project details' },
                { name: 'Hill Grange', config: 'Multiple configurations', area: 'Area varies by unit', location: 'Hiranandani Estate, Thane', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=1200', href: '/homes/hill-cranje', status: 'Project details' },
                { name: 'Skylark Enclave', config: '2 & 3 BHK', area: 'Area varies by unit', location: 'Hiranandani Estate, Thane', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=1200', href: '/homes/skylark-enclave', status: 'Project details' },
                { name: 'Rodas Enclave – Annora', config: 'Multiple configurations', area: 'Area varies by unit', location: 'Hiranandani Estate, Thane', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=1200', href: '/homes/annora', status: 'Project details' },
                { name: 'Villa Nebula', config: 'Multiple configurations', area: 'Area varies by unit', location: 'Hiranandani Estate, Thane', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=1200', href: '/homes/villa-nebula', status: 'Project details' },
              ].map(home => (
                <article key={home.href} className="w-[278px] shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg sm:w-[310px]">
                  <Link href={home.href} className="block">
                    <div className="relative h-48 bg-gray-100">
                      <img src={home.image} alt={home.name + ', Hiranandani Estate'} loading="lazy" className="h-full w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-gray-800 shadow-sm">{home.status}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-extrabold text-gray-950">{home.name}</h3>
                      <p className="mt-1 min-h-10 text-sm text-gray-600">{home.location}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-800">
                        <span className="rounded-md bg-gray-100 px-2.5 py-1.5">{home.config}</span>
                        <span className="rounded-md bg-gray-100 px-2.5 py-1.5">{home.area}</span>
                      </div>
                      <span className="mt-4 inline-flex text-sm font-bold text-blue-700">View details →</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">Project reference information. Prices and individual unit availability are not assumed; confirm the exact unit, documents and current status before making a decision.</p>
          </div>
        </section>

        {/* Verified real estate agents — live profiles, not illustrative broker listings */}
        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Mumbai · Pune · Thane · Navi Mumbai</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl" style={{ ...display, letterSpacing: '-0.03em' }}>Verified real estate agents</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">Compare agent photos, brokerage, customer ratings where available, active listing counts, service areas and registration details. Verified badges appear only on profiles GoNest has verified.</p>
              </div>
              <Link href="/agents" className="shrink-0 text-sm font-bold text-blue-700 hover:text-blue-900">Find Verified Agents →</Link>
            </div>
            {directoryAgents.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {directoryAgents.slice(0, 6).map((agent) => (
                  <article key={agent.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <Link href={`/agents/${agent.id}`} aria-label={`View ${agent.full_name ?? 'agent'} profile`} className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-100 text-xl font-extrabold text-slate-500">
                          {agent.avatar_url ? <img src={agent.avatar_url} alt={agent.full_name ? `${agent.full_name} profile` : 'Agent profile'} loading="lazy" className="h-full w-full object-cover" /> : (agent.full_name ?? 'A').charAt(0).toUpperCase()}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/agents/${agent.id}`} className="block text-lg font-extrabold leading-tight text-slate-950 hover:text-blue-700">{agent.full_name ?? 'Agent profile'}</Link>
                          <p className="mt-1 text-sm text-slate-500">{agent.agency_name ?? 'Independent agent'}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {agent.agent_verified && agent.rera_number ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">✓ Verified agent</span> : <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">Verification pending</span>}
                            {agent.rating != null && <span className="text-sm font-extrabold text-amber-700">★ {agent.rating.toFixed(1)} <span className="font-normal text-slate-500">({agent.review_count ?? 0} reviews)</span></span>}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-500">MahaRERA registration</p>
                        <p className="mt-1 break-all text-sm font-bold text-slate-900">{agent.rera_number || 'Not provided'}</p>
                        {agent.rera_number && <a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-bold text-blue-700 hover:underline">Check registration ↗</a>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100">
                      {[{ value: agent.total_listings ?? 0, label: 'Listings' }, { value: agent.review_count ?? 0, label: 'Reviews' }, { value: agent.rating == null ? '—' : agent.rating.toFixed(1), label: 'Rating' }].map((stat) => <div key={stat.label} className="px-2 py-3 text-center"><p className="text-lg font-extrabold text-slate-950">{stat.value}</p><p className="text-xs text-slate-500">{stat.label}</p></div>)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-4">
                      <Link href={`/agents/${agent.id}`} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-blue-700">View profile</Link>
                      <Link href="/agents" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Find agents</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <h3 className="text-lg font-extrabold text-slate-950">Agent profiles are being onboarded</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">No agent profiles are currently available from the GoNest database. Ratings, photos and sales figures will appear when supported by real profile data.</p>
                <Link href="/agents" className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Find Verified Agents →</Link>
              </div>
            )}
            <p className="mt-4 text-xs leading-5 text-slate-500">Ratings and reviews appear only when recorded in GoNest. A verification badge is shown only when the profile is marked verified and has a registration number on file.</p>
          </div>
        </section>

        {/* Post property CTA */}
        <section className="bg-blue-600 py-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full opacity-30 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-700 rounded-full opacity-30 -translate-x-1/3 translate-y-1/3" />
          <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl font-extrabold text-white mb-4" style={{ ...display, letterSpacing: '-0.025em' }}>List your property.<br />Reach people looking right now.</h2>
            <p className="text-blue-100 text-base leading-relaxed mb-8">Create an account as an owner or agent, add photos and details, and submit for review. Approved listings go live on GoNest.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/list-with-gonest" className="bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-sm shadow-lg">Post a property</Link>
              <Link href="/agents" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors text-sm">Browse agents →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
