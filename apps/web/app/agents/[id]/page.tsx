import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getAgentById, getAgentListings } from '@/lib/api';
import { telHref, waHref } from '@/lib/contact';
import { ScheduleVisit } from '@/components/property/ScheduleVisit';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const portraitFor = (id: string) => { const n = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 90 + 1; return 'https://randomuser.me/api/portraits/' + (n % 2 ? 'women' : 'men') + '/' + n + '.jpg'; };\n\nexport async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
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
              <img src={agent.avatar_url || portraitFor(agent.id)} alt={agent.avatar_url ? (agent.full_name ?? "Agent") + " profile photo" : "Illustrative real-estate agent portrait"} title={agent.avatar_url ? undefined : "Illustrative portrait; upload a verified profile photo in Dashboard Settings"} className="h-full w-full object-cover" />
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
              <div id="contact" className="mt-6 flex flex-wrap gap-3">
                {agent.phone && <a href={telHref(agent.phone)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Call</a>}
                {agent.phone && <a href={waHref(agent.phone, `Hi ${agent.full_name ?? ''}, I found your profile on GoNest and would like to enquire about your properties.`)} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">Message</a>}
                {listings.length > 0 && <a href="#listings" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 hover:border-blue-400">Schedule visit</a>}
              </div>
              {!agent.phone && <p className="mt-4 text-xs text-slate-500">Call and WhatsApp are unavailable because this agent has not published a phone number. You can still request a visit from an active listing below.</p>}
            </div>
          </div>
        </section>

        <section id="listings" className="mt-10">
          <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-bold uppercase tracking-widest text-blue-700">Current inventory</p><h2 className="mt-2 text-2xl font-extrabold text-slate-950 md:text-3xl">Properties listed by {agent.full_name ?? 'this professional'}</h2></div>
            <p className="text-sm text-slate-500">{listings.length} active listing{listings.length === 1 ? '' : 's'}</p>
          </div>
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center"><h3 className="font-bold text-slate-900">No active listings right now</h3><p className="mt-2 text-sm text-slate-600">Check back later or browse other GoNest professionals.</p><Link href="/agents" className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Browse other profiles</Link></div>
          ) : (
            <>
              <p className="mb-5 max-w-3xl text-sm leading-6 text-slate-600">Open a property to review its details, contact the poster and request a visit. Visit requests are subject to confirmation by the owner or agent.</p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map((listing) => (
                <article key={listing.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <PropertyCard listing={listing} />
                  <details className="border-t border-slate-100">
                    <summary className="cursor-pointer list-none px-5 py-4 text-sm font-extrabold text-blue-700 hover:bg-blue-50">
                      Schedule visit · Check booking window <span className="float-right" aria-hidden="true">＋</span>
                    </summary>
                    <div className="border-t border-slate-100 bg-slate-50">
                      <div className="px-4 pt-4 text-xs leading-5 text-slate-600">Choose an available date and time for this property. Your request remains pending until the agent confirms it. Slots already requested or confirmed are unavailable.</div>
                      <ScheduleVisit listingId={listing.id} prefill={{ name: '', phone: '', email: '' }} />
                    </div>
                  </details>
                </article>
              ))}</div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
