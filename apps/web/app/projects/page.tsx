import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';

export const revalidate = 60;
export const metadata = {
  title: 'New Homes & Projects | GoNest',
  description: 'Explore residential apartment listings and new-home opportunities across Mumbai and nearby markets on GoNest.',
};

export default async function ProjectsPage() {
  const cities = await getCities();
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white">
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-200"><Building2 className="h-4 w-4" /> NEW-HOME DISCOVERY</p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">Find a new home with clearer information.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">Compare available apartment listings by location, budget and configuration. Check each listing’s details and review status before contacting the owner or agent.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#project-search" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Explore listings <ArrowRight className="h-4 w-4" /></a>
              <Link href="/developers" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">For developers</Link>
            </div>
            <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 text-blue-300" /><div><p className="font-semibold">Locality-first search</p><p className="mt-1 text-sm text-slate-400">Start with the area that suits you.</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-300" /><div><p className="font-semibold">Clear listing details</p><p className="mt-1 text-sm text-slate-400">Compare price, size and configuration where provided.</p></div></div>
              <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-blue-300" /><div><p className="font-semibold">Understand review status</p><p className="mt-1 text-sm text-slate-400">A platform badge is not a title guarantee.</p></div></div>
            </div>
          </div>
        </section>
        <section id="project-search" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Browse homes</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">Available residential listings</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Use the filters to narrow your search. Project-level pricing, unit availability and RERA information are shown only when recorded for an individual listing.</p></div>
          <SearchResults cities={cities} init={{purpose:'sale',type:'apartment'}} />
        </section>
        <section className="border-t border-slate-100 bg-slate-50"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Are you a developer?</h2><p className="mt-1 max-w-2xl text-sm text-slate-600">Tell us about your organisation and the inventory you want to bring to GoNest.</p></div><Link href="/developers" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">Developer onboarding <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
      <Footer />
    </>
  );
}
