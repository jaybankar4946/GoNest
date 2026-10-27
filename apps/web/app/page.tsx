import Link from 'next/link';
import { ShieldCheck, Layers, Eye, Search, Heart, MessageCircle, Check, ClipboardCheck, BadgeCheck, Calendar, FileCheck2, Landmark, Flag, Users, Navigation } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HomeSearch } from './HomeSearch';
import { HomeEMI } from './HomeEMI';
import { getFeatured, getCities, getHomeStats, getPopularLocalities } from '@/lib/api';
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
  const [featured, cities, stats, popular] = await Promise.all([getFeatured(6), getCities(), getHomeStats(), getPopularLocalities(8)]);
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
                {title:'Buy a home',desc:'Explore homes, compare prices and understand the costs before you make your move.',href:'/buy',cta:'Explore homes',kind:'buy'},
                {title:'Rent a home',desc:'Find a place that fits your life, with rent, deposit and stated charges made clear.',href:'/rent',cta:'Find a rental',kind:'rent'},
                {title:'Sell or rent out',desc:'Reach people looking for a home. Add your property details and submit them for review.',href:'/list-with-gonest',cta:'List with GoNest',kind:'list'},
              ].map(item=>(
                <article key={item.title} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                  <Link href={item.href} className="block overflow-hidden" aria-label={item.cta}>
                    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-violet-50 to-amber-50 sm:h-48">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(253,230,138,0.72),transparent_28%),radial-gradient(circle_at_83%_24%,rgba(249,168,212,0.48),transparent_28%),radial-gradient(circle_at_78%_82%,rgba(167,243,208,0.62),transparent_32%)]" />
                      <svg viewBox="0 0 420 250" role="img" aria-label={item.kind === 'buy' ? 'Illustration of a house and location pin' : item.kind === 'rent' ? 'Illustration of apartments and a key' : 'Illustration of a home with a property listing sign'} className="relative h-full w-full max-w-[320px] transition-transform duration-500 ease-out group-hover:scale-[1.06]" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="210" cy="218" rx="138" ry="12" fill="#D9E5F3" />
                        <circle cx="72" cy="65" r="22" fill="#FDE68A" opacity="0.95" />
                        <circle cx="347" cy="47" r="15" fill="#FBCFE8" opacity="0.95" />
                        <path d="M56 112C65 100 75 101 80 113C69 119 61 118 56 112Z" fill="#86EFAC" />
                        <path d="M80 113C81 101 91 96 100 103C96 114 88 118 80 113Z" fill="#34D399" />
                        <circle cx="350" cy="204" r="5" fill="#F59E0B" />
                        <path d="M333 211L338 216L333 221L328 216Z" fill="#A78BFA" />
                        {item.kind === 'buy' && <>
                          <path d="M94 126L210 39L326 126V199H94V126Z" fill="#FFFFFF" stroke="#9BB6D4" strokeWidth="3" strokeLinejoin="round" />
                          <path d="M78 127L210 27L342 127" stroke="#285A91" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M177 199V145C177 133 187 123 199 123H221C233 123 243 133 243 145V199" fill="#D8EAFE" stroke="#6D91BA" strokeWidth="3" />
                          <rect x="118" y="137" width="38" height="35" rx="4" fill="#D8EAFE" stroke="#6D91BA" strokeWidth="3" />
                          <path d="M137 137V172M118 154H156" stroke="#6D91BA" strokeWidth="2.5" />
                          <rect x="263" y="137" width="38" height="35" rx="4" fill="#D8EAFE" stroke="#6D91BA" strokeWidth="3" />
                          <path d="M282 137V172M263 154H301" stroke="#6D91BA" strokeWidth="2.5" />
                          <path d="M292 48C292 28 308 12 328 12C348 12 364 28 364 48C364 75 328 104 328 104S292 75 292 48Z" fill="#2563EB" stroke="#FFFFFF" strokeWidth="4" />
                          <circle cx="328" cy="47" r="10" fill="#FFFFFF" />
                          <path d="M73 199H347" stroke="#8DA9C8" strokeWidth="4" strokeLinecap="round" />
                        </>}
                        {item.kind === 'rent' && <>
                          <path d="M107 200V73C107 65 114 58 122 58H238C246 58 253 65 253 73V200" fill="#FFFFFF" stroke="#91AECF" strokeWidth="3" />
                          <path d="M253 200V39C253 31 260 24 268 24H309C317 24 324 31 324 39V200" fill="#DCEBFA" stroke="#6D91BA" strokeWidth="3" />
                          {[0,1,2].map(row => [0,1,2].map(col => <rect key={row+'-'+col} x={126+col*37} y={78+row*34} width="21" height="21" rx="3" fill="#D8EAFE" stroke="#8AA9CB" strokeWidth="2" />))}
                          {[0,1,2,3].map(row => <rect key={row} x="270" y={42+row*34} width="15" height="20" rx="3" fill="#FFFFFF" stroke="#8AA9CB" strokeWidth="2" />)}
                          {[0,1,2,3].map(row => <rect key={row} x="295" y={42+row*34} width="15" height="20" rx="3" fill="#FFFFFF" stroke="#8AA9CB" strokeWidth="2" />)}
                          <rect x="162" y="166" width="36" height="34" rx="4" fill="#B8D6F7" stroke="#6D91BA" strokeWidth="3" />
                          <circle cx="337" cy="164" r="29" fill="#FFFFFF" stroke="#2563EB" strokeWidth="4" />
                          <circle cx="337" cy="155" r="7" stroke="#2563EB" strokeWidth="4" />
                          <path d="M337 162V180M337 172H350M346 172V178" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
                          <path d="M77 200H351" stroke="#8DA9C8" strokeWidth="4" strokeLinecap="round" />
                        </>}
                        {item.kind === 'list' && <>
                          <path d="M89 133L190 57L291 133V199H89V133Z" fill="#FFFFFF" stroke="#91AECF" strokeWidth="3" strokeLinejoin="round" />
                          <path d="M74 133L190 44L306 133" stroke="#285A91" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="163" y="147" width="53" height="52" rx="4" fill="#D8EAFE" stroke="#6D91BA" strokeWidth="3" />
                          <rect x="109" y="143" width="34" height="32" rx="4" fill="#D8EAFE" stroke="#6D91BA" strokeWidth="3" />
                          <rect x="237" y="143" width="34" height="32" rx="4" fill="#D8EAFE" stroke="#6D91BA" strokeWidth="3" />
                          <path d="M304 94H360V161H304Z" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                          <path d="M332 161V197" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" />
                          <path d="M314 113H350M314 125H344M314 137H339" stroke="#6D91BA" strokeWidth="3" strokeLinecap="round" />
                          <rect x="301" y="78" width="62" height="22" rx="11" fill="#2563EB" />
                          <path d="M315 89H349" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                          <path d="M65 199H365" stroke="#8DA9C8" strokeWidth="4" strokeLinecap="round" />
                        </>}
                      </svg>
                      <span className="sr-only">{item.title}</span>
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

        {/* Agent Explore uses the same featured collection card format as Homes For You */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Featured collection · Thane</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl" style={{ ...display, letterSpacing: '-0.03em' }}>Agents For You</h2>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">Explore local real estate agents and brokerages across Thane.</p>
              </div>
              <Link href="/agents" className="shrink-0 text-sm font-bold text-blue-700 hover:text-blue-900">Explore agents →</Link>
            </div>
            <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-6 sm:px-6">
              {THANE_TOP_AGENTS.map((broker, index) => (
                <article key={broker.name} className="w-[78vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:w-[270px]">
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img src={["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=480&fit=crop&auto=format","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=480&fit=crop&auto=format","https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=480&fit=crop&auto=format","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=480&fit=crop&auto=format","https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=480&fit=crop&auto=format","https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=480&fit=crop&auto=format","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=480&fit=crop&auto=format","https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=480&fit=crop&auto=format","https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=480&fit=crop&auto=format","https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=480&fit=crop&auto=format"][index]} alt={`Illustrative property photography for ${broker.name}`} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-gray-800">#{index + 1} · Thane</span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="line-clamp-2 min-h-10 text-base font-extrabold text-gray-950">{broker.name}</h3>
                    <p className="mt-1 line-clamp-2 min-h-8 text-sm text-gray-600">{broker.area}</p>
                    <p className="mt-2 text-sm font-bold text-amber-700">★ {broker.rating.toFixed(1)} <span className="font-normal text-gray-500">({broker.reviews.toLocaleString("en-IN")} public reviews)</span></p>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-600">{broker.note}</p>
                    <Link href="/agents" className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50">Explore agent →</Link>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-500">Public business-directory ratings are snapshots, not GoNest reviews or endorsements. Photos are illustrative property photography, not verified photos of each business or its staff.</p>
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
