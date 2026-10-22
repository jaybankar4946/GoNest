import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getAgentById, getAgentListings } from '@/lib/api';
import { AgentEnquiryForm } from '@/components/agents/AgentEnquiryForm';
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
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xl font-extrabold text-slate-950">{listings.length}</p><p className="mt-1 text-xs text-slate-500">Active listings</p></div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xl font-extrabold text-slate-950">{agent.review_count ?? 0}</p><p className="mt-1 text-xs text-slate-500">Reviews</p></div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xl font-extrabold text-slate-950">{agent.rating == null ? '—' : agent.rating.toFixed(1)}</p><p className="mt-1 text-xs text-slate-500">Rating</p></div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xl font-extrabold text-slate-950">{agent.agent_verified ? 'Verified' : 'Pending'}</p><p className="mt-1 text-xs text-slate-500">GoNest status</p></div>
              </div>
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
              <p className="mb-5 max-w-3xl text-sm leading-6 text-slate-600">Review this professional’s active property inventory, then send an enquiry through GoNest. Visit requests remain pending until confirmed.</p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}</div>
            </>
          )}
          <div id="enquire" className="mt-8 max-w-2xl"><AgentEnquiryForm listings={listings.map((listing) => ({ id: listing.id, title: listing.title }))} agentName={agent.full_name ?? 'this professional'} /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
