import Link from 'next/link';
import type { Metadata } from 'next';
import { MapPin, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { HOMES } from './data';

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Hiranandani Projects & Property Guide | GoNest',
  description: 'Explore Hiranandani residential project references across Mumbai, Thane and Navi Mumbai, with source-linked developer photos and project information.',
};

const groups = [
  { label: 'Mumbai', test: /Mumbai|Powai|Chembur|Kandivali|Borivali|Bandra/i },
  { label: 'Thane', test: /Thane|Rodas|Lake Enclave|One Hiranandani Park/i },
  { label: 'Navi Mumbai & MMR', test: /Panvel|Kalyan/i },
];

export default function HiranandaniHomesPage() {
  return <><Nav/><main className="min-h-screen bg-slate-50">
    <section className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">GoNest · Developer project directory</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">Explore Hiranandani projects.</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">A source-linked guide to residential projects and townships. Compare project references, view developer-published imagery, and open the original source before making a decision.</p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-white/20 px-4 py-2">{HOMES.length} project references</span>
          <span className="rounded-full border border-white/20 px-4 py-2">Mumbai · Thane · MMR</span>
          <a className="rounded-full bg-white px-4 py-2 font-bold text-slate-950" href="https://www.houseofhiranandani.com/residential-projects" target="_blank" rel="noreferrer">Official developer directory ↗</a>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        <strong>Important:</strong> These are project discovery references, not confirmed GoNest sale/rental listings. No unit-level availability or asking price is implied. Some photos are exact project images; where the official source only provided a township image, the detail page says so. Artist impressions are not photographs of a completed building. Confirm the exact phase, MahaRERA details, unit plan, seller authority and current price before booking.
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {groups.map(g=><a key={g.label} href={'#'+g.label.toLowerCase().replaceAll(' ','-').replaceAll('&','and')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">{g.label}</a>)}
      </div>
      {groups.map(g=>{
        const items=HOMES.filter(h=>g.test.test(h.locality));
        return <section key={g.label} id={g.label.toLowerCase().replaceAll(' ','-').replaceAll('&','and')} className="mb-12 scroll-mt-24">
          <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-extrabold text-slate-950">{g.label}</h2><p className="mt-1 text-sm text-slate-500">{items.length} project references</p></div></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(h=><article key={h.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <Link href={'/homes/'+h.slug} className="group block">
                <div className="relative h-56 overflow-hidden bg-slate-200"><img src={h.image} alt={h.name+' developer project photo'} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800">{h.status.split('·')[0].trim()}</span></div>
                <div className="p-5"><h3 className="text-lg font-extrabold text-slate-950">{h.name}</h3><p className="mt-2 flex items-start gap-2 text-sm text-slate-600"><MapPin size={16} className="mt-0.5 shrink-0"/>{h.locality}</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Configuration</p><p className="mt-1 text-sm font-bold text-slate-900">{h.config}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Unit price</p><p className="mt-1 text-sm font-bold text-slate-900">Not verified</p></div></div><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700">View project details <ArrowUpRight size={16}/></span></div>
              </Link>
              <div className="border-t border-slate-100 px-5 py-3"><a href={h.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-700">Open source information ↗</a></div>
            </article>)}
          </div>
        </section>;
      })}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600"><ShieldCheck size={18} className="mr-2 inline text-emerald-700"/>GoNest has not independently verified the availability, title or legal status of each individual unit. A project reference does not mean a unit is for sale or rent.</div>
    </section>
  </main><Footer/></>;
}
