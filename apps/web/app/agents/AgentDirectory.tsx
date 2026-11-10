'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search, Star, MessageCircle, Calendar, ShieldCheck, ChevronDown,
  Award, Users, X, Check, TrendingUp, Phone
} from 'lucide-react';
import type { Profile } from '@/lib/types';
import { THANE_TOP_AGENTS } from '@/lib/thane-agents';

type Props = { agents: Profile[] };
type ModalState = {
  mode: 'contact' | 'message' | 'visit';
  name: string;
  agency?: string | null;
  photo?: string | null;
} | null;

const CITIES = ['All Cities', 'Thane', 'Mumbai', 'Pune'];
const SERVICES = ['All Services', 'Buy', 'Sell', 'Rent'];
const RATINGS = ['Any rating', '4.5+', '4.0+', '3.5+'];
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const chip = (on: boolean) => 'rounded-full border px-4 py-2 text-sm font-semibold transition ' + (on ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400');

function EnquiryModal({ state, close }: { state: NonNullable<ModalState>; close: () => void }) {
  const title = state.mode === 'visit' ? 'Schedule a visit' : state.mode === 'message' ? 'Message agent' : 'Contact agent';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <button onClick={close} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"><X className="h-4 w-4" /></button>
        <div className="mb-5 flex items-center gap-3 pr-8">
          {state.photo ? <img src={state.photo} alt={state.name} className="h-12 w-12 rounded-2xl object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-extrabold text-slate-500">{state.name.charAt(0).toUpperCase()}</div>}
          <div><p className="font-extrabold text-slate-950">{title}</p><p className="text-xs text-slate-500">{state.name}{state.agency ? ' · ' + state.agency : ''}</p></div>
        </div>
        <div className="space-y-3">
          <input placeholder="Your name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
          <input placeholder="Your phone number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
          {state.mode === 'visit' && <div className="grid grid-cols-2 gap-3"><input type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" /><select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></div>}
          <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"><option>Looking to Buy</option><option>Looking to Rent</option><option>Sell / Rent out my property</option><option>Investment advice</option></select>
          <textarea rows={3} placeholder={state.mode === 'visit' ? 'Tell the agent what you would like to visit…' : 'Tell the agent what you are looking for…'} className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
        </div>
        <button onClick={close} className="mt-4 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700">{state.mode === 'visit' ? 'Request Visit' : state.mode === 'message' ? 'Send Message' : 'Send Enquiry'}</button>
        <p className="mt-2 text-center text-xs text-slate-400">GoNest routes your request to the selected professional.</p>
      </div>
    </div>
  );
}

function Actions({ open }: { open: (mode: ModalState extends null ? never : NonNullable<ModalState>['mode']) => void }) {
  return (
    <div className="mt-auto grid grid-cols-3 gap-2 pt-5">
      <button onClick={() => open('contact')} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Phone className="h-4 w-4" />Contact</button>
      <button onClick={() => open('message')} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><MessageCircle className="h-4 w-4" />Message</button>
      <button onClick={() => open('visit')} className="flex flex-col items-center gap-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700"><Calendar className="h-4 w-4" />Schedule</button>
    </div>
  );
}

function Rating({ rating, reviews }: { rating: number | null; reviews?: number }) {
  return <div className="mt-3 flex items-center gap-1">{[1,2,3,4,5].map(i => <Star key={i} className={'h-3.5 w-3.5 ' + (rating != null && i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />)}<span className="ml-1 text-xs font-semibold text-slate-500">{rating != null ? rating.toFixed(1) : 'No rating'}{reviews ? ' · ' + reviews + ' reviews' : ''}</span></div>;
}

function AgentCard({ agent }: { agent: Profile }) {
  const [modal, setModal] = useState<ModalState>(null);
  const name = agent.full_name ?? 'GoNest agent';
  const verified = Boolean(agent.agent_verified && agent.rera_number);
  const market = (agent.service_pincodes ?? [])[0]?.startsWith('411') ? 'Pune' : (agent.service_pincodes ?? [])[0]?.startsWith('400') ? 'Mumbai / Thane' : 'India';
  const show = (mode: NonNullable<ModalState>['mode']) => setModal({ mode, name, agency: agent.agency_name, photo: agent.avatar_url });

  return <>
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <Link href={'/agents/' + agent.id} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        {agent.avatar_url ? <img src={agent.avatar_url} alt={name + ' profile'} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500"><span className="text-5xl font-semibold">{name.charAt(0).toUpperCase()}</span><span className="mt-2 text-xs font-semibold uppercase tracking-widest">Profile photo not added</span></div>}
        <span className={'absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm ' + (verified ? 'bg-emerald-50 text-emerald-800' : 'bg-white/95 text-slate-700')}>{verified ? 'GoNest verified' : 'Profile under review'}</span>
        <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">{agent.total_listings} active listings</span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-lg font-extrabold text-slate-950">{name}</h3><p className="mt-1 truncate text-sm font-medium text-slate-500">{agent.agency_name ?? 'Independent agent'}</p></div>{agent.rating != null && <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{agent.rating.toFixed(1)}</span>}</div>
        <Rating rating={agent.rating} reviews={agent.review_count} />
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /><div className="min-w-0"><p className="text-xs font-bold text-emerald-800">{verified ? 'RERA details verified' : 'RERA details submitted'}</p><p className="truncate text-xs text-emerald-700">{agent.rera_number ?? 'Verification status shown separately'}</p></div></div></div>
        <div className="mt-4 grid grid-cols-3 gap-2">{[{v:agent.total_listings,l:'Listings'},{v:agent.service_pincodes?.length ?? 0,l:'PIN areas'},{v:market,l:'Market'}].map(x => <div key={x.l} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center"><p className="truncate text-sm font-extrabold text-slate-950">{x.v}</p><p className="text-[11px] text-slate-400">{x.l}</p></div>)}</div>
        <div className="mt-4"><p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Covers</p><div className="flex flex-wrap gap-1.5">{(agent.service_localities ?? []).slice(0,5).map(x => <span key={x} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{x}</span>)}{(agent.service_pincodes ?? []).slice(0,2).map(x => <span key={x} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{x}</span>)}</div></div>
        {agent.bio && <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{agent.bio}</p>}
        <Actions open={show} />
      </div>
    </article>
    {modal && <EnquiryModal state={modal} close={() => setModal(null)} />}
  </>;
}

function PublicAgencyCard({ agency }: { agency: (typeof THANE_TOP_AGENTS)[number] }) {
  const [modal, setModal] = useState<ModalState>(null);
  const services = agency.services?.length ? agency.services : ['Rent','Buy','Sell'];
  const pin = agency.address.match(/\b\d{6}\b/)?.[0] ?? null;
  const open = (mode: NonNullable<ModalState>['mode']) => setModal({ mode, name: agency.name, agency: agency.area });

  return <>
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <Link href={'/agents/business/' + slug(agency.name)} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        {agency.imageUrl ? <img src={agency.imageUrl} alt={agency.name + ' profile'} className="h-full w-full object-contain bg-white p-8 transition duration-500 group-hover:scale-[1.02]" /> : <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500"><span className="text-4xl font-semibold">{agency.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}</span><span className="mt-2 text-xs font-semibold uppercase tracking-widest">Agency profile</span></div>}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-slate-800 shadow-sm">Public business profile</span>
        <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">0 active GoNest listings</span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-extrabold text-slate-950">{agency.name}</h3><p className="mt-1 text-sm font-medium text-slate-500">{agency.area} · {agency.city}</p></div>{agency.rating != null && <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{agency.rating.toFixed(1)}</span>}</div>
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"><p className="text-xs font-bold text-slate-700">Public business snapshot</p><p className="mt-0.5 text-xs text-slate-500">Not a GoNest verification badge.</p></div>
        <div className="mt-4 flex flex-wrap gap-1.5">{services.map(x => <span key={x} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{x}</span>)}{pin && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{pin}</span>}</div>
        <p className="mt-4 line-clamp-3 text-sm leading-5 text-slate-600">{agency.address}</p>
        {agency.publicReviewCount != null && <p className="mt-3 text-sm font-bold text-slate-900">{agency.publicReviewCount.toLocaleString('en-IN')} public reviews</p>}
        <Actions open={open} />
      </div>
    </article>
    {modal && <EnquiryModal state={modal} close={() => setModal(null)} />}
  </>;
}

export function AgentDirectory({ agents }: Props) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All Cities');
  const [service, setService] = useState('All Services');
  const [rating, setRating] = useState('Any rating');
  const [area, setArea] = useState('Any area');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const areas = useMemo(() => Array.from(new Set([...THANE_TOP_AGENTS.flatMap(a => a.area.split(' · ')), ...agents.flatMap(a => a.service_localities ?? [])].map(x => x.trim()).filter(Boolean))).sort(), [agents]);
  const registered = useMemo(() => agents.filter(a => {
    if (a.role !== 'agent') return false;
    const locations = [...(a.service_localities ?? []), ...(a.service_pincodes ?? [])].join(' ').toLowerCase();
    const prefixes: Record<string,string[]> = { Mumbai:['400'], Thane:['4006','401'], Pune:['411','412'] };
    const cityMatch = city === 'All Cities' || locations.includes(city.toLowerCase()) || (prefixes[city] ?? []).some(p => (a.service_pincodes ?? []).some(pin => pin.startsWith(p)));
    const text = [a.full_name,a.agency_name,a.bio,a.rera_number,...(a.service_localities ?? []),...(a.service_pincodes ?? [])].filter(Boolean).join(' ').toLowerCase();
    const ratingMatch = rating === 'Any rating' || (a.rating != null && a.rating >= Number(rating.replace('+','')));
    const areaMatch = area === 'Any area' || (a.service_localities ?? []).includes(area);
    return cityMatch && ratingMatch && areaMatch && (!verifiedOnly || Boolean(a.agent_verified && a.rera_number)) && (!query.trim() || text.includes(query.toLowerCase().trim()));
  }), [agents,city,rating,area,verifiedOnly,query]);

  const publicAgencies = useMemo(() => THANE_TOP_AGENTS.filter(a => {
    const text = [a.name,a.city,a.area,a.address,...(a.services ?? []),a.businessType ?? ''].join(' ').toLowerCase();
    const ratingMatch = rating === 'Any rating' || (a.rating != null && a.rating >= Number(rating.replace('+','')));
    return !verifiedOnly && (city === 'All Cities' || a.city === city) && (area === 'Any area' || a.area.includes(area)) && ratingMatch && (service === 'All Services' || (a.services ?? ['Rent','Buy','Sell']).includes(service)) && (!query.trim() || text.includes(query.toLowerCase().trim()));
  }), [city,area,rating,verifiedOnly,service,query]);

  const totalActive = agents.filter(a => a.role === 'agent').reduce((n,a) => n + a.total_listings, 0);
  const rated = agents.filter(a => a.role === 'agent' && a.rating != null);
  const avg = rated.length ? (rated.reduce((n,a) => n + (a.rating ?? 0),0) / rated.length).toFixed(2) : '—';
  const clear = () => { setQuery(''); setCity('All Cities'); setService('All Services'); setRating('Any rating'); setArea('Any area'); setVerifiedOnly(false); };

  return <div className="min-h-screen bg-slate-50">
    <section className="border-b border-slate-100 bg-white"><div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"><ShieldCheck className="h-3.5 w-3.5" />Verified profiles + public business snapshots</div>
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_420px]"><div><h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">Find a property professional.</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Compare real estate agents and brokerages across Thane, Mumbai and Pune. Verification status, RERA details and public business information stay clearly separated.</p></div>
        <div className="grid grid-cols-3 gap-3">{[{v:registered.length,l:'Agent profiles',i:Users},{v:totalActive + '+',l:'Active listings',i:TrendingUp},{v:avg,l:'Avg. rating',i:Star}].map(s => { const I=s.i; return <div key={s.l} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center"><I className="mx-auto mb-1.5 h-5 w-5 text-blue-600" /><p className="text-xl font-extrabold text-slate-950">{s.v}</p><p className="mt-0.5 text-[11px] text-slate-400">{s.l}</p></div>; })}</div>
      </div>
    </div></section>

    <div className="sticky top-[72px] z-20 border-b border-slate-100 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
      <div className="relative min-w-[220px] flex-1 md:flex-none"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Agent or agency name…" className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-400 md:w-56" /></div>
      {[{v:city,set:setCity,opts:CITIES},{v:service,set:setService,opts:SERVICES},{v:rating,set:setRating,opts:RATINGS}].map((f,i)=><div key={i} className="relative"><select value={f.v} onChange={e=>f.set(e.target.value)} className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-semibold outline-none focus:border-blue-400">{f.opts.map(x=><option key={x}>{x}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /></div>)}
      <select value={area} onChange={e=>setArea(e.target.value)} className={chip(area !== 'Any area') + ' appearance-none'}><option>Any area</option>{areas.map(x=><option key={x}>{x}</option>)}</select>
      <button onClick={()=>setVerifiedOnly(v=>!v)} className={chip(verifiedOnly)}>{verifiedOnly && <Check className="mr-1 inline h-3.5 w-3.5" />}GoNest verified</button>
      {(query || city!=='All Cities' || service!=='All Services' || rating!=='Any rating' || area!=='Any area' || verifiedOnly) && <button onClick={clear} className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"><X className="h-3.5 w-3.5" />Clear</button>}
      <span className="ml-auto whitespace-nowrap text-sm font-medium text-slate-500">{registered.length + publicAgencies.length} results</span>
    </div></div>

    <section className="mx-auto max-w-7xl px-4 py-9 md:px-6"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest professionals</p><h2 className="mt-1 text-2xl font-extrabold text-slate-950">Real estate agent profiles</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Image-led profiles inspired by the Figma layout, with clear verification signals and direct GoNest enquiry actions.</p></div><span className="text-sm font-semibold text-slate-500">{registered.length + publicAgencies.length} results</span></div>
      {registered.length + publicAgencies.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{registered.map(a=><AgentCard key={a.id} agent={a}/>)}{publicAgencies.map(a=><PublicAgencyCard key={a.name} agency={a}/>)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center"><Users className="mx-auto mb-4 h-14 w-14 text-slate-200" /><p className="mb-2 text-xl font-extrabold text-slate-500">No agents match</p><p className="mb-4 text-sm text-slate-400">Try a different city, service or area filter.</p><button onClick={clear} className="text-sm font-semibold text-blue-600 hover:underline">Clear all filters</button></div>}
    </section>

    <section className="border-t border-slate-100 bg-white py-14"><div className="mx-auto max-w-3xl px-4 text-center md:px-6"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600"><Award className="h-8 w-8 text-white" /></div><h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Are you a property professional?</h2><p className="mx-auto mb-7 mt-3 max-w-lg text-base leading-6 text-slate-600">Create a GoNest profile and submit your details for review. Verified profiles can build trust with buyers and renters across Mumbai, Thane and Pune.</p><div className="flex flex-col justify-center gap-3 sm:flex-row"><Link href="/dashboard" className="rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700">Register as Agent — Free</Link><Link href="/dashboard" className="rounded-2xl border border-slate-200 px-8 py-4 text-sm font-semibold text-slate-700 hover:border-slate-300">Learn about requirements</Link></div><div className="mt-7 flex flex-wrap justify-center gap-5 text-sm text-slate-500">{['RERA details required for verification','Review before publish','Free profile','GoNest enquiry workflow'].map(x=><span key={x} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />{x}</span>)}</div></div></section>
  </div>;
}
