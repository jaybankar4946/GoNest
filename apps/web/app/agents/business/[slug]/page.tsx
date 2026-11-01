import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { ScheduleVisit } from '@/components/property/ScheduleVisit';
import { searchListings } from '@/lib/api';
import { THANE_TOP_AGENTS } from '@/lib/thane-agents';

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return THANE_TOP_AGENTS.map((broker) => ({ slug: slugify(broker.name) }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const broker = THANE_TOP_AGENTS.find((item) => slugify(item.name) === slug);
  return { title: broker ? `${broker.name} | GoNest Agent Directory` : 'Agent profile | GoNest', description: broker ? `${broker.name} in ${broker.area}. Explore public business information and available GoNest properties in the service area.` : 'Explore real estate professionals on GoNest.' };
}
export default async function PublicBusinessProfile({ params }: Props) {
  const { slug } = await params;
  const broker = THANE_TOP_AGENTS.find((item) => slugify(item.name) === slug);
  if (!broker) notFound();
  const locality = broker.area.split('·')[0].trim();
  const { listings } = await searchListings({ q: locality, page: 1 });
  return <><Nav /><main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
    <Link href="/agents" className="text-sm font-semibold text-blue-700 hover:underline">← Agent directory</Link>
    <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[.8fr_1.2fr]">
        <div className="flex min-h-64 items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-8">
          {broker.profileImageUrl ? <img src={broker.profileImageUrl} alt={broker.name + ' public business identity'} referrerPolicy="no-referrer" title="Illustrative portrait, not a verified staff photograph" className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md" /> : <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-slate-200 bg-white text-3xl font-extrabold text-slate-500 shadow-sm">{broker.name.split(/\s+/).map(x => x[0]).slice(0,2).join('').toUpperCase()}</div>}
        </div>
        <div className="p-6 md:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Public business listing · Thane</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">{broker.name}</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">{broker.area}</p>
          <div className="mt-3 flex items-center gap-2"><span className="text-amber-500">★</span><strong className="text-sm text-slate-950">{broker.rating.toFixed(1)}</strong><span className="text-sm text-slate-500">({broker.reviews.toLocaleString('en-IN')} public reviews)</span></div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{broker.note}. Services shown: {broker.services.join(', ')}.</p>
          <p className="mt-4 text-sm leading-6 text-slate-500">{broker.address}</p>
          <div id="contact" className="mt-6 flex flex-wrap gap-3">
            <a href="#available-homes" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Contact</a>
            <a href="#available-homes" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 hover:border-blue-400">Message</a>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">This is a public business-directory profile, not a claimed GoNest agent account. Ratings and business details are external snapshots, not GoNest reviews or verification. Contact and message actions take you to available GoNest property enquiries; visit requests are sent to the relevant listing poster.</p>
        </div>
      </div>
    </section>
    <section id="available-homes" className="mt-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Explore by service area</p><h2 className="mt-2 text-2xl font-extrabold text-slate-950 md:text-3xl">Available GoNest homes near {locality}</h2><p className="mt-2 text-sm text-slate-600">These are independent active listings in the area, not inventory claimed by {broker.name}.</p></div><span className="text-sm font-semibold text-slate-500">{listings.length} listings found</span></div>
      {listings.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map((listing) => <article key={listing.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><PropertyCard listing={listing}/><details className="border-t border-slate-100"><summary className="cursor-pointer px-5 py-4 text-sm font-extrabold text-blue-700 hover:bg-blue-50">Schedule visit · View booking window</summary><div className="border-t border-slate-100 bg-slate-50"><p className="px-4 pt-4 text-xs leading-5 text-slate-600">Select an available date and time. The request is pending until the listing poster confirms it.</p><ScheduleVisit listingId={listing.id} prefill={{name:'',phone:'',email:''}}/></div></details></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><h3 className="font-bold text-slate-900">No matching active GoNest homes yet</h3><p className="mt-2 text-sm text-slate-600">Browse the directory or search all available homes in Thane.</p><Link href="/search?q=Thane" className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Search Thane homes</Link></div>}
    </section>
  </main><Footer/></>;
}
