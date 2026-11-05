import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { BrainCircuit, Home, KeyRound, Building2, ArrowRight, Calculator, ShieldCheck } from 'lucide-react';

const journeys = [
  { title: 'Buy a home', href: '/buy', description: 'Explore resale homes and open any listing to calculate purchase costs, down payment, EMI and affordability.', Icon: Home },
  { title: 'Rent a home', href: '/rent', description: 'Compare rental homes and estimate deposit, monthly outgoings, brokerage and move-in cash.', Icon: KeyRound },
  { title: 'Explore new projects', href: '/projects', description: 'Review project information and estimate unit costs, builder charges, booking balance and loan scenarios.', Icon: Building2 },
];

export const metadata = {
  title: 'Home Finder Intelligence | GoNest',
  description: 'Make a more informed home decision with listing-level cost, affordability and verification tools from GoNest.',
};

export default function HomeFinderPage() {
  return <><Nav /><main className="min-h-screen bg-slate-50">
    <section className="bg-slate-950 px-5 py-16 text-white sm:py-20"><div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-200"><BrainCircuit size={18}/> GoNest Home Finder Intelligence</div>
      <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">Find a home. Understand the real cost. Decide with confidence.</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Home Finder Intelligence brings practical decision support into individual GoNest resale, rental and new-project listings. Start with a journey below, then open a listing to use its own facts and editable cost assumptions.</p>
      <Link href="/decision-centre" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-blue-50"><Calculator size={17}/> Open Decision Tools <ArrowRight size={16}/></Link>
    </div></section>
    <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="mb-7"><h2 className="text-2xl font-extrabold text-slate-950">Choose your home journey</h2><p className="mt-2 text-sm text-slate-600">The right tools appear in context on each listing.</p></div>
      <div className="grid gap-5 md:grid-cols-3">{journeys.map(({title,href,description,Icon})=><Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon size={22}/></span><h3 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h3><p className="mt-2 min-h-20 text-sm leading-6 text-slate-600">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700">Explore listings <ArrowRight size={16}/></span></Link>)}</div>
      <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2"><div className="flex gap-3"><ShieldCheck className="mt-1 shrink-0 text-emerald-700" size={20}/><div><h3 className="font-bold text-slate-900">Transparent listing signals</h3><p className="mt-1 text-sm leading-6 text-slate-600">Verification and availability are shown only when supported by recorded GoNest information. Always reconfirm details with the listing poster.</p></div></div><div className="flex gap-3"><Calculator className="mt-1 shrink-0 text-blue-700" size={20}/><div><h3 className="font-bold text-slate-900">Editable decision assumptions</h3><p className="mt-1 text-sm leading-6 text-slate-600">Model costs using your own price, loan, deposit and fee assumptions. Estimates are planning aids, not valuations or financial approvals.</p></div></div></div>
    </section>
  </main><Footer /></>;
}
