import Link from 'next/link';
import { ShieldCheck, Layers, Eye, Search, Heart, MessageCircle, Check, ClipboardCheck, BadgeCheck, Calendar, FileCheck2, Landmark, Flag, Users, Navigation } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { ProjectReferenceImage } from '@/components/property/ProjectReferenceImage';
import { HomeSearch } from './HomeSearch';
import { getFeatured, getCities, getHomeStats, getAgents, getPopularLocalities, searchListings } from '@/lib/api';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = { title: 'GoNest – Find Your Home in Mumbai' };

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
  const [featured, cities, stats, agents, popular, hiranandaniSearch] = await Promise.all([getFeatured(6), getCities(), getHomeStats(), getAgents(), getPopularLocalities(8), searchListings({ q: 'Hiranandani', purpose: 'sale', page: 1 }).catch(() => ({ listings: [], total: 0, page: 1 }))]);
  const hiranandaniListings = hiranandaniSearch.listings.filter(l => /hiranandani|villa carino|eagle.?ridge/i.test(`${l.title} ${(l.locality as any)?.name ?? ''}`)).slice(0, 10);
  const topAgents = [...agents].sort((a, b) => Number(b.agent_verified) - Number(a.agent_verified)).slice(0, 4);
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
            <p className="text-lg text-white/70 max-w-xl leading-relaxed mb-8">
              Discover homes to buy or rent across Mumbai and Pune. Compare real listing details, then contact the owner or agent directly.
            </p>
            <HomeSearch cities={cities} />
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/buy" className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-gray-950 shadow-lg transition hover:bg-blue-50">
                For buyers: Explore homes in Mumbai &amp; Pune
              </Link>
              <Link href="/list-with-gonest" className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                For developers: Submit your projects
              </Link>
            </div>
            {cities.filter(c => /mumbai|pune/i.test(c.name)).length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                {cities.filter(c => /mumbai|pune/i.test(c.name)).map(c => (
                  <Link key={c.id} href={`/search?city=${c.id}`} className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 rounded-full transition-all">{c.name}</Link>
                ))}
              </div>
            )}
          </div>
        </section>

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

        {/* Homes for you — Zillow-style horizontal carousel */}
        <section className="border-y border-gray-100 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-950" style={{ ...display, letterSpacing: '-0.025em' }}>Homes For You</h2>
                <p className="mt-1 text-sm text-gray-600">Ready-to-move homes in Hiranandani Estate, Thane</p>
              </div>
              <Link href="/search?q=Hiranandani" className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-900">See all homes <span aria-hidden="true">→</span></Link>
            </div>
            <div className="-mx-6 overflow-x-auto px-6 pb-3" aria-label="Homes for you carousel">
              <div className="flex snap-x snap-mandatory gap-4">
                {[
                  { name: 'Villa Carino', slug: 'villa-carino', config: '1 BHK', area: '438–453 sq ft carpet', locality: 'Beside The Walk, Hiranandani Estate', status: 'Ready to move', image: 'https://www.houseofhiranandani.com/villa-carino-desk.jpg' },
                  { name: 'Solitaire', slug: 'solitaire', config: '1 BHK', area: '366–409 sq ft carpet', locality: 'Hiranandani Estate, Thane West', status: 'Ready to move', image: 'https://www.houseofhiranandani.com/solitiar_desk_bnr.jpg' },
                  { name: 'Delanna', slug: 'delanna', config: '2 BHK', area: '698–703 sq ft carpet', locality: 'Hiranandani Estate, Thane West', status: 'Ready to move', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fdelenna-new-desk-bnrx1up.jpg&w=3840' },
                  { name: 'Aralia', slug: 'aralia', config: '3 BHK', area: '1,084–1,204 sq ft carpet', locality: 'Hiranandani Estate, Thane West', status: 'Ready to move', image: 'https://www.houseofhiranandani.com/banner-desk-aralia.jpg' },
                  { name: 'Eagleridge Wing B', slug: 'eagleridge-wing-b', config: '2, 2.5 & 3 BHK', area: '641–999 sq ft', locality: 'Hiranandani Estate, Thane West', status: 'Project details', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840' },
                  { name: 'Villa Rica', slug: 'villa-rica', config: '2 BHK', area: 'Area varies by unit', locality: 'Hiranandani Estate, Thane', status: 'Project details', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840' },
                  { name: 'Hill Grange', slug: 'hill-cranje', config: 'Multiple configurations', area: 'Area varies by unit', locality: 'Hiranandani Estate, Thane', status: 'Project details', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840' },
                  { name: 'Skylark Enclave', slug: 'skylark-enclave', config: '2 & 3 BHK', area: 'Area varies by unit', locality: 'Hiranandani Estate, Thane', status: 'Project details', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840' },
                  { name: 'Rodas Enclave – Annora', slug: 'annora', config: 'Multiple configurations', area: 'Area varies by unit', locality: 'Hiranandani Estate, Thane', status: 'Project details', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840' },
                  { name: 'Villa Nebula', slug: 'villa-nebula', config: 'Multiple configurations', area: 'Area varies by unit', locality: 'Hiranandani Estate, Thane', status: 'Project details', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840' },
                ].map((home) => (
                  <article key={home.slug} className="w-[272px] shrink-0 snap-start overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md sm:w-[300px]">
                    <Link href={`/homes/${home.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100" aria-label={`View ${home.name}`}>
                      <ProjectReferenceImage src={home.image} alt={`${home.name}, Hiranandani Estate`} />
                      <span className="absolute left-3 top-3 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm">{home.status}</span>
                    </Link>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-gray-950">{home.name}</h3>
                      <p className="mt-1 line-clamp-1 text-sm text-gray-600">{home.locality}</p>
                      <p className="mt-3 text-sm font-semibold text-gray-900">{home.config}</p>
                      <p className="mt-0.5 text-sm text-gray-600">{home.area}</p>
                      <Link href={`/homes/${home.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900">View details <span aria-hidden="true">→</span></Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Agents (real profiles) */}
        {topAgents.length > 0 && (
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-3" style={{ ...display, letterSpacing: '-0.025em' }}>Agents and owners on GoNest</h2>
                <p className="text-gray-500 text-base">Browse profiles and their active listings.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {topAgents.map(a => (
                  <Link key={a.id} href={`/agents/${a.id}`} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center block">
                    <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 text-2xl font-bold flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      {a.avatar_url ? <img src={a.avatar_url} alt="" className="w-full h-full object-cover" /> : (a.full_name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-base" style={display}>{a.full_name ?? 'GoNest member'}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 mb-3">{a.role === 'agent' ? 'Agent' : 'Owner'}{a.agency_name ? ` · ${a.agency_name}` : ''}</p>
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      {a.agent_verified && <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><Check className="w-3 h-3" />Verified</span>}
                      {a.rera_number && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">RERA {a.rera_number}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Compact illustrated action tabs inspired by Zillow */}
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-7 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl" style={{ ...display, letterSpacing: '-0.03em' }}>Where would you like to start?</h2>
              <p className="mt-2 text-sm text-slate-600">A simple next step for every move.</p>
            </div>
            <div className="mb-6 flex flex-wrap justify-center gap-2" aria-label="Explore GoNest">
              <a href="#buy-home" className="rounded-full border border-slate-900 bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700">Buy</a>
              <a href="#rent-home" className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">Rent</a>
              <a href="#sell-home" className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">Sell</a>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <article id="buy-home" className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
                  <svg viewBox="0 0 300 160" role="img" aria-label="Illustration of a home to buy" className="h-full w-full max-w-xs">
                    <ellipse cx="150" cy="143" rx="95" ry="8" fill="#dbeafe"/>
                    <circle cx="224" cy="35" r="17" fill="#fde68a"/>
                    <path d="M48 86 L150 23 L252 86" fill="#7c8fe8" stroke="#4f46e5" strokeWidth="4" strokeLinejoin="round"/>
                    <rect x="68" y="82" width="164" height="57" rx="5" fill="#fff" stroke="#4f46e5" strokeWidth="3"/>
                    <rect x="133" y="96" width="34" height="43" rx="3" fill="#a5b4fc"/>
                    <rect x="83" y="96" width="31" height="25" rx="3" fill="#bae6fd" stroke="#60a5fa" strokeWidth="2"/>
                    <rect x="186" y="96" width="31" height="25" rx="3" fill="#bae6fd" stroke="#60a5fa" strokeWidth="2"/>
                    <path d="M45 139 H255" stroke="#86b6a0" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M45 128 Q34 112 44 102 Q57 115 52 129 M54 133 Q61 112 74 116 Q71 131 54 133" fill="#65a889"/>
                    <path d="M239 134 Q226 113 240 105 Q253 119 246 134 M246 136 Q257 116 270 121 Q265 136 246 136" fill="#65a889"/>
                    <path d="M137 95 L150 84 L163 95" fill="#818cf8"/>
                  </svg>
                </div>
                <div className="px-5 pb-5 pt-4">
                  <h3 className="text-lg font-bold text-slate-950" style={display}>Buy a home</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-slate-600">Explore homes and compare the details before you decide.</p>
                  <Link href="/buy" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Explore homes <span className="ml-2" aria-hidden="true">→</span></Link>
                </div>
              </article>
              <article id="rent-home" className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
                  <svg viewBox="0 0 300 160" role="img" aria-label="Illustration of a welcoming rental apartment" className="h-full w-full max-w-xs">
                    <ellipse cx="150" cy="143" rx="95" ry="8" fill="#ccfbf1"/>
                    <circle cx="76" cy="37" r="16" fill="#fde68a"/>
                    <rect x="75" y="39" width="150" height="100" rx="7" fill="#fff" stroke="#0f766e" strokeWidth="3"/>
                    <rect x="91" y="55" width="49" height="40" rx="4" fill="#a5f3fc" stroke="#67e8f9" strokeWidth="2"/>
                    <path d="M115 55 V95 M91 75 H140" stroke="#fff" strokeWidth="3"/>
                    <rect x="158" y="55" width="48" height="84" rx="3" fill="#99f6e4"/>
                    <circle cx="194" cy="99" r="3" fill="#0f766e"/>
                    <path d="M99 119 H145 V139 H99 Z" fill="#fda4af"/>
                    <path d="M94 118 Q121 100 149 118 L145 127 H99 Z" fill="#fb7185"/>
                    <path d="M45 139 H255" stroke="#86b6a0" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M49 134 Q36 116 49 106 Q62 120 55 134 M54 136 Q66 117 77 123 Q72 137 54 136" fill="#34a879"/>
                    <path d="M235 136 Q223 116 237 108 Q250 122 243 136 M243 137 Q255 119 268 124 Q261 138 243 137" fill="#34a879"/>
                    <path d="M159 47 L181 29 L205 47" fill="#5eead4" stroke="#0f766e" strokeWidth="3" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="px-5 pb-5 pt-4">
                  <h3 className="text-lg font-bold text-slate-950" style={display}>Rent a home</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-slate-600">Find a place that fits your budget and arrange a viewing.</p>
                  <Link href="/rent" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Find rentals <span className="ml-2" aria-hidden="true">→</span></Link>
                </div>
              </article>
              <article id="sell-home" className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100">
                  <svg viewBox="0 0 300 160" role="img" aria-label="Illustration of listing a home for sale" className="h-full w-full max-w-xs">
                    <ellipse cx="150" cy="143" rx="95" ry="8" fill="#fed7aa"/>
                    <circle cx="222" cy="35" r="16" fill="#fde68a"/>
                    <path d="M54 81 L130 30 L206 81" fill="#fb923c" stroke="#c2410c" strokeWidth="3.5" strokeLinejoin="round"/>
                    <rect x="72" y="78" width="116" height="61" rx="5" fill="#fff" stroke="#c2410c" strokeWidth="3"/>
                    <rect x="118" y="101" width="27" height="38" rx="3" fill="#fed7aa"/>
                    <rect x="84" y="91" width="23" height="21" rx="3" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="2"/>
                    <rect x="153" y="91" width="23" height="21" rx="3" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="2"/>
                    <rect x="202" y="75" width="45" height="57" rx="5" fill="#fff" stroke="#f97316" strokeWidth="3"/>
                    <path d="M212 89 H237 M212 98 H237 M212 107 H230" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="225" cy="63" r="16" fill="#fb7185"/>
                    <path d="M218 63 L223 68 L233 57" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M45 139 H255" stroke="#86b6a0" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M45 135 Q34 116 47 107 Q59 121 53 135 M53 136 Q64 117 77 123 Q70 138 53 136" fill="#65a889"/>
                  </svg>
                </div>
                <div className="px-5 pb-5 pt-4">
                  <h3 className="text-lg font-bold text-slate-950" style={display}>Sell a home</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-slate-600">List your property and reach people looking for their next home.</p>
                  <Link href="/dashboard/new" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">List your property <span className="ml-2" aria-hidden="true">→</span></Link>
                </div>
              </article>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
