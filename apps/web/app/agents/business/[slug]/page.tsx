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
          <div id="contact" className="mt-6">
            <span className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">Direct contact not connected</span>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">This is a public business-directory profile, not a claimed GoNest agent account. Ratings and business details are external snapshots, not GoNest reviews or verification. Direct contact and booking are unavailable until this business claims and verifies its GoNest profile.</p>
        </div>
      </div>
    </section>
    <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="text-base font-bold text-slate-900">GoNest inventory connection unavailable</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">This is an independent public business-directory profile and is not currently connected to a claimed GoNest agent account. We therefore do not show property recommendations, enquiries or visit-booking windows here. Listings will appear on this profile only after the business or its authorised agent is verified and explicitly connected to that inventory.</p>
      <Link href="/agents" className="mt-4 inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-blue-400">Back to Agent Directory</Link>
    </section>
  </main><Footer/></>;
}
