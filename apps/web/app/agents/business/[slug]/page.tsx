import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { THANE_TOP_AGENTS } from '@/lib/thane-agents';
import { BusinessEnquiryForm } from './BusinessEnquiryForm';

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return THANE_TOP_AGENTS.map((agency) => ({ slug: slugify(agency.name) }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agency = THANE_TOP_AGENTS.find(item => slugify(item.name) === slug);
  return { title: agency ? `${agency.name} | GoNest Agent Directory` : 'Agency profile | GoNest', description: agency ? `${agency.name}, ${agency.area}, ${agency.city}. Public business listing on GoNest.` : 'Explore real estate agencies on GoNest.' };
}
export default async function PublicBusinessProfile({ params }: Props) {
  const { slug } = await params;
  const agency = THANE_TOP_AGENTS.find(item => slugify(item.name) === slug);
  if (!agency) notFound();
  const pin = agency.address.match(/\\b\\d{6}\\b/)?.[0] ?? null;
  const operations = ['Rent', 'Buy', 'Sell'];
  return <><Nav/><main className="mx-auto max-w-4xl px-5 py-10 md:px-8">
    <Link href="/agents" className="text-sm font-semibold text-blue-700 hover:underline">← Agent directory</Link>
    <article className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative flex aspect-[16/7] items-center justify-center bg-slate-100">
        {agency.imageUrl ? <img src={agency.imageUrl} alt={agency.name + ' profile'} className="h-full w-full object-contain bg-white p-8"/> : <div className="flex flex-col items-center text-slate-500"><span className="text-5xl font-semibold">{agency.name.split(/\\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}</span><span className="mt-2 text-xs font-semibold uppercase tracking-widest">Agency profile</span></div>}
      </div>
      <div className="p-6 md:p-9">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Real estate agency · {agency.city}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">{agency.name}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600">{agency.area} · {agency.city}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">RERA details not provided</span>
          {pin && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{pin}</span>}
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">0 active listings</span>
          {agency.rating != null && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">★ {agency.rating.toFixed(1)}{agency.publicReviewCount != null ? ` · ${agency.publicReviewCount.toLocaleString('en-IN')} public reviews` : ' · public rating'}</span>}
        </div>
        <p className="mt-5 text-sm font-bold text-slate-900">{operations.join(' · ')} Operations</p>
        <p className="mt-4 text-sm leading-7 text-slate-700">{agency.address}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {agency.phone && <a href={'tel:' + agency.phone.replace(/[^+\\d]/g, '')} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Call agency</a>}
          {agency.websiteUrl && <a href={agency.websiteUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">Official website</a>}
          <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(agency.mapQuery)} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">Directions</a>
        </div>
      </div>
    </article>
    <div id="contact-agency"><BusinessEnquiryForm agency={{ name: agency.name, slug }} /></div>
  </main><Footer/></>
}
