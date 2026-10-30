import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { THANE_TOP_AGENTS, getThaneBrokerBySlug, businessMapsUrl } from '@/lib/thane-agents';

export function generateStaticParams() {
  return THANE_TOP_AGENTS.map((broker) => ({ slug: broker.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const broker = getThaneBrokerBySlug(slug);
  return { title: broker ? `${broker.name} | GoNest agency profile` : 'Agency profile | GoNest', description: broker ? `${broker.name}, ${broker.area}. Public business listing information and contact links.` : 'Local real estate agency profile on GoNest.' };
}

export default async function LocalAgencyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const broker = getThaneBrokerBySlug(slug);
  if (!broker) notFound();
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <Link href="/agents" className="text-sm font-semibold text-blue-700 hover:underline">← Back to agents & agencies</Link>
        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 via-slate-800 to-blue-950 px-6 py-10 text-white md:px-10 md:py-14">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white p-2">
                {broker.profileImageUrl ? <img src={broker.profileImageUrl} alt={broker.name + " public business identity"} className="h-full w-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-3xl font-extrabold text-slate-600">{broker.name.split(/\s+/).map((part) => part[0]).slice(0,2).join('').toUpperCase()}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Local agency · Thane</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{broker.name}</h1>
                <p className="mt-2 text-base text-slate-200">{broker.area}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">Public business listing · not GoNest verified</span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">★ {broker.rating.toFixed(1)} · {broker.reviews.toLocaleString('en-IN')} public reviews</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-8 p-6 md:grid-cols-[1.3fr_0.7fr] md:p-10">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">About this business</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{broker.note}. Public listing information is provided for discovery and has not been independently verified by GoNest.</p>
              <h3 className="mt-7 text-sm font-extrabold uppercase tracking-wide text-slate-500">Services listed</h3>
              <div className="mt-3 flex flex-wrap gap-2">{broker.services.map((service) => <span key={service} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{service}</span>)}</div>
              <h3 className="mt-7 text-sm font-extrabold uppercase tracking-wide text-slate-500">Business address</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">{broker.address}</p>
            </div>
            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-extrabold text-slate-950">Public reputation</h2>
              <p className="mt-3 text-3xl font-extrabold text-slate-950">★ {broker.rating.toFixed(1)}</p>
              <p className="mt-1 text-sm text-slate-600">{broker.reviews.toLocaleString('en-IN')} public reviews</p>
              <p className="mt-3 text-xs leading-5 text-slate-500">Source: {broker.ratingSource}. This is not a GoNest rating or endorsement.</p>
              <div className="mt-5 grid gap-2">
                <a href={businessMapsUrl(broker)} target="_blank" rel="noreferrer" className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700">View on Google Maps ↗</a>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(broker.name + ' Thane reviews')}`} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-800 hover:border-blue-300">Read public reviews ↗</a>
                {broker.websiteUrl && <a href={broker.websiteUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-800 hover:border-blue-300">Official website ↗</a>}
              </div>
            </aside>
          </div>
        </section>
        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 md:p-8">
          <h2 className="text-xl font-extrabold text-slate-950">Is this your agency?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Claim your presence on GoNest by creating an agent or brokerage account. Add your team, genuine property inventory, contact details and registration information for review. This public directory entry is not a claimed GoNest account.</p>
          <Link href="/list-with-gonest" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Claim / list with GoNest</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
