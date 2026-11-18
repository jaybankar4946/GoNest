import Link from 'next/link';
import { ShieldCheck, Layers, Search, Heart, MessageCircle, ClipboardCheck } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { DemoHomes } from '@/components/home/DemoHomes';
import { HomeSearch } from './HomeSearch';
import { HomeEMI } from './HomeEMI';
import { getFeatured, getCities, getHomeStats, getPopularLocalities, getAgents } from '@/lib/api';
import { AgentShowcase } from '@/components/home/AgentShowcase';
import { SlideRail } from '@/components/home/SlideRail';
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

export default async function HomePage() {
  const [featured, cities, stats, popular, agents] = await Promise.all([getFeatured(6), getCities(), getHomeStats(), getPopularLocalities(8), getAgents()]);
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
        {/* Featured */}
        {featured.length > 0 && (
          <section className="bg-gray-50 py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Featured collection</p>
                  <h2 className="text-4xl font-extrabold text-gray-900" style={{ ...display, letterSpacing: '-0.025em' }}>Featured properties</h2>
                </div>
                <Link href="/search" className="hidden md:block text-sm font-semibold text-blue-600 hover:text-blue-700">View all →</Link>
              </div>
              <SlideRail>
                {featured.map(l => (
                  <div key={l.id} className="w-[278px] shrink-0 snap-start sm:w-[310px]">
                    <PropertyCard listing={l} />
                  </div>
                ))}
              </SlideRail>
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
            <SlideRail>
              {[
                { name: 'Villa Carino', config: '1 BHK', area: '438–453 sq ft carpet', location: 'Beside The Walk, Hiranandani Estate', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fvilla-carino-desk.jpg&w=1200', href: '/homes/villa-carino', status: 'Ready to move' },
                { name: 'Solitaire', config: '1 BHK', area: '366–409 sq ft carpet', location: 'Hiranandani Estate, Thane West', image: 'https://jll-global-gdim-res.cloudinary.com/image/upload/t_ip-resi-v2-property-detail-web/v1623152189/IN/Horizon/Resi/Prod/JLL_Mumbai_Hiranandani_Solitaire_4300_EXT_1.jpg', href: '/homes/solitaire', status: 'Ready to move' },
                { name: 'Delanna', config: '2 BHK', area: '698–703 sq ft carpet', location: 'Hiranandani Estate, Thane West', image: 'https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fdelenna-new-desk-bnrx1up.jpg&w=1200', href: '/homes/delanna', status: 'Ready to move' },
                { name: 'Aralia', config: '3 BHK', area: 'Area varies by published layout', location: 'Hiranandani Estate, Thane West', image: 'https://www.houseofhiranandani.com/banner-desk-aralia.jpg', href: '/homes/aralia', status: 'Ready to move' },
                { name: 'Eagleridge Wing B', config: '2, 2.5 & 3 BHK', area: '641–999 sq ft', location: 'Hiranandani Estate, Thane West', image: 'https://www.hiranandani.com/img/hiranandani-estate-thane/eagleridge/eagleridge.jpg', href: '/homes/eagleridge-wing-b', status: 'Ready to move' },
                { name: 'Villa Rica', config: '2 BHK', area: 'Area varies by unit', location: 'Hiranandani Estate, Thane', image: 'https://www.addressofchoice.com/aoc_assets/elevation/41837/Hiranandani_Villa_Rica_41837.jpeg', href: '/homes/villa-rica', status: 'Ready to move' },
                { name: 'Hill Grange', config: 'Multiple configurations', area: 'Area varies by unit', location: 'Hiranandani Estate, Thane', image: 'https://im.proptiger.com/1/504452/6/44981810.jpeg', href: '/homes/hill-cranje', status: 'Ready to move' },
                { name: 'Skylark Enclave', config: '2 & 3 BHK', area: 'Area varies by unit', location: 'Hiranandani Estate, Thane', image: 'https://imgcdn.houssed.com/assets/Files/Projects/8667/Project%20Image/a36f59f2e94b5b11eb1ae0ef11593f51.webp', href: '/homes/skylark-enclave', status: 'Ready to move' },
                { name: 'Rodas Enclave – Annora', config: 'Multiple configurations', area: 'Area varies by unit', location: 'Hiranandani Estate, Thane', image: 'https://is1-2.housingcdn.com/4f2250e8/599b97385ee7ee2cb1a25c7afe2efe00/v5/fs/hiranandani_rodas_enclave_annora-hiranandani_developers_pvt_ltd.jpg', href: '/homes/annora', status: 'Ready to move' },
                { name: 'Villa Nebula', config: 'Multiple configurations', area: 'Area varies by unit', location: 'Hiranandani Estate, Thane', image: 'https://www.ghar.tv/projectimages/9057/photo-91412.jpg', href: '/homes/villa-nebula', status: 'Ready to move' },
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
            </SlideRail>
            <p className="mt-2 text-xs leading-5 text-gray-500">Project reference information. Prices and individual unit availability are not assumed; confirm the exact unit, documents and current status before making a decision.</p>
          </div>
        </section>

        <AgentShowcase agents={agents} />

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
