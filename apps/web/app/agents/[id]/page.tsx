import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getAgentById, getAgentListings, imgUrl } from '@/lib/api';
import { telHref, waHref } from '@/lib/contact';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentById(id);
  return { title: agent?.full_name ? `${agent.full_name} | GoNest` : 'Agent Profile' };
}

export default async function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgentById(id);
  if (!agent) notFound();
  const listings = await getAgentListings(id);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <Link href="/agents" className="text-sm font-semibold text-blue-700 hover:underline">← All agents & owners</Link>
        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {listings[0]?.listing_images?.[0]?.storage_path && <div className="relative h-48 w-full overflow-hidden bg-slate-100 md:h-64"><img src={imgUrl(listings[0].listing_images[0].storage_path)} alt={`Property listed by ${agent.full_name ?? "this agent"}`} className="h-full w-full object-cover" /><span className="absolute bottom-3 left-4 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-semibold text-white">Property from this agent’s GoNest inventory</span></div>}
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start md:p-8">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-100 text-4xl font-extrabold text-slate-500">
              {agent.avatar_url ? <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" /> : (agent.full_name ?? 'G').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700">{agent.role === 'agent' ? 'Real estate agent / broker' : 'Property owner'}</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">{agent.full_name ?? 'GoNest member'}</h1>
              <p className="mt-2 text-base text-slate-600">{agent.agency_name ?? 'Independent professional'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {agent.agent_verified && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">✓ GoNest verified</span>}
                {agent.phone_verified && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">✓ Phone verified</span>}
                {agent.rera_number && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">RERA: {agent.rera_number}</span>}
                {agent.rating != null && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">★ {agent.rating.toFixed(1)} · {agent.review_count} reviews</span>}
              </div>
              {agent.bio && <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-600">{agent.bio}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                {agent.phone && <a href={telHref(agent.phone)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Call professional</a>}
                {agent.phone && <a href={waHref(agent.phone, `Hi ${agent.full_name ?? ''}, I found your profile on GoNest and would like to enquire about your properties.`)} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">WhatsApp</a>}
                {listings.length > 0 && <a href={`/property/${listings[0].id}`} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 hover:border-blue-400">Schedule a property visit ↓</a>}
              </div>
              {!agent.phone && <p className="mt-4 text-xs text-slate-500">Direct contact details have not been published for this profile. Open a listing below to use its available enquiry or visit-request options.</p>}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-bold uppercase tracking-widest text-blue-700">Current inventory</p><h2 className="mt-2 text-2xl font-extrabold text-slate-950 md:text-3xl">Properties listed by {agent.full_name ?? 'this professional'}</h2></div>
            <p className="text-sm text-slate-500">{listings.length} active listing{listings.length === 1 ? '' : 's'}</p>
          </div>
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center"><h3 className="font-bold text-slate-900">No active listings right now</h3><p className="mt-2 text-sm text-slate-600">Check back later or browse other GoNest professionals.</p><Link href="/agents" className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Browse other profiles</Link></div>
          ) : (
            <>
              <p className="mb-5 max-w-3xl text-sm leading-6 text-slate-600">Open a property to review its details, contact the poster and request a visit. Visit requests are subject to confirmation by the owner or agent.</p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}</div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
