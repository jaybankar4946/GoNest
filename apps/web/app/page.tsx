import Link from 'next/link';
import { ShieldCheck, Layers, Eye, Search, Heart, MessageCircle, Check, ClipboardCheck, BadgeCheck, Calendar, FileCheck2, Landmark, Flag, Users, Navigation } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HomeSearch } from './HomeSearch';
import { getFeatured, getCities, getHomeStats, getAgents, getPopularLocalities } from '@/lib/api';
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
  const [featured, cities, stats, agents, popular] = await Promise.all([getFeatured(6), getCities(), getHomeStats(), getAgents(), getPopularLocalities(8)]);
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

        {/* Trust */}
        <section className="py-24 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full mb-5"><ShieldCheck className="w-3.5 h-3.5" /> How trust works on GoNest</div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3" style={{ ...display, letterSpacing: '-0.025em' }}>What “Verified” actually means.</h2>
              <p className="text-gray-500 max-w-lg mx-auto">A badge only appears after a real review step, and we say plainly what it does and does not cover.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TRUST.map(c => { const Icon = c.icon; return (
                <div key={c.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-blue-600" /></div>
                  <h3 className="font-bold text-gray-900 mb-3" style={display}>{c.title}</h3>
                  <ul className="space-y-2">{c.items.map(it => <li key={it} className="flex items-start gap-2 text-sm text-gray-600"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-1" /> {it}</li>)}</ul>
                </div>); })}
            </div>
          </div>
        </section>

        {/* Why GoNest */}
        <section className="bg-gray-950 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full mb-5"><Eye className="w-3.5 h-3.5" /> Why GoNest</div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ ...display, letterSpacing: '-0.03em' }}>
                Property portals show listings.<br /><span className="text-blue-400">GoNest helps you decide.</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WHY.map(w => { const Icon = w.icon; return (
                <div key={w.title} className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 rounded-2xl p-6 transition-all">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-blue-400" /></div>
                  <h3 className="font-bold text-white text-base mb-2" style={display}>{w.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{w.desc}</p>
                </div>); })}
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

        {/* Post property CTA */}
        <section className="bg-blue-600 py-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full opacity-30 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-700 rounded-full opacity-30 -translate-x-1/3 translate-y-1/3" />
          <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl font-extrabold text-white mb-4" style={{ ...display, letterSpacing: '-0.025em' }}>List your property.<br />Reach people looking right now.</h2>
            <p className="text-blue-100 text-base leading-relaxed mb-8">Create an account as an owner or agent, add photos and details, and submit for review. Approved listings go live on GoNest.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/new" className="bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-sm shadow-lg">Post a property</Link>
              <Link href="/agents" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors text-sm">Browse agents →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
