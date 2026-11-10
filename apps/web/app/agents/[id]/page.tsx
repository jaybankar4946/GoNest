import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { ScheduleVisit } from '@/components/property/ScheduleVisit';
import { getAgentById, getAgentListings } from '@/lib/api';
import { telHref, waHref } from '@/lib/contact';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { AgentContactForm } from './AgentContactForm';
import { OwnerEditButton } from '@/components/owner/OwnerEditButton';

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
  const serviceAreas = [...(agent.service_localities ?? []), ...(agent.service_pincodes ?? [])];
  const isVerified = Boolean(agent.agent_verified && agent.rera_number);

  return (
    <>
      <Nav />
      <main className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-7 md:px-8 md:py-10">
          <Link href="/agents" className="inline-flex items-center text-sm font-semibold text-blue-700 hover:underline">
            ← All agents
          </Link>

          <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[340px_1fr]">
              <div className="relative min-h-[320px] bg-slate-100">
                {agent.avatar_url ? (
                  <img src={agent.avatar_url} alt={agent.full_name ?? 'Agent profile'} className="h-full min-h-[320px] w-full object-cover" />
                ) : (
                  <div className="flex h-full min-h-[320px] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-7xl font-extrabold text-slate-400">
                    {(agent.full_name ?? 'G').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-xs font-extrabold text-slate-900 shadow-sm">
                  {agent.total_listings} active listings
                </span>
              </div>

              <div className="p-6 md:p-9">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-700">
                    {agent.role === 'agent' ? 'Real estate agent / broker' : 'Property owner'}
                  </span>
                  {isVerified && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800">✓ GoNest verified</span>
                  )}
                </div>

                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
                  {agent.full_name ?? 'GoNest member'}
                </h1>
                <p className="mt-2 text-base font-semibold text-slate-500">{agent.agency_name ?? 'Independent professional'}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {agent.rating != null && (
                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-900">
                      ★ {agent.rating.toFixed(1)} · {agent.review_count ?? 0} reviews
                    </span>
                  )}
                  {agent.phone_verified && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">✓ Phone verified</span>
                  )}
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    {agent.rera_number ? `RERA details submitted · ${agent.rera_number}` : 'RERA details not provided'}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Services</p>
                  <p className="mt-2 text-base font-extrabold text-slate-950">Rent · Buy · Sell Operations</p>
                </div>

                {serviceAreas.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Service areas</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {serviceAreas.map(area => (
                        <span key={area} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{area}</span>
                      ))}
                    </div>
                  </div>
                )}

                {agent.bio && (
                  <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-600">{agent.bio}</p>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  <OwnerEditButton kind="profile" id={id} ownerId={agent.id} />
                  <a href="#contact-agent" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Contact</a>
                  {agent.phone && (
                    <a href={waHref(agent.phone, `Hi ${agent.full_name ?? ''}, I found your profile on GoNest and would like to enquire about your properties.`)} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                      WhatsApp
                    </a>
                  )}
                  {agent.phone && <a href={telHref(agent.phone)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">Call</a>}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Current inventory</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950 md:text-3xl">
                  Properties listed by {agent.full_name ?? 'this professional'}
                </h2>
              </div>
              <p className="text-sm font-semibold text-slate-500">{listings.length} active listing{listings.length === 1 ? '' : 's'}</p>
            </div>

            {listings.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h3 className="font-bold text-slate-900">No active listings right now</h3>
                <p className="mt-2 text-sm text-slate-600">Check back later or browse other GoNest professionals.</p>
                <Link href="/agents" className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Browse other profiles</Link>
              </div>
            ) : (
              <>
                <p className="mb-5 max-w-3xl text-sm leading-6 text-slate-600">
                  Open a property to review its details, contact the poster and request a visit. Visit requests remain pending until confirmed.
                </p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map(listing => (
                    <article key={listing.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <PropertyCard listing={listing} />
                      <details className="border-t border-slate-100">
                        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-extrabold text-blue-700 hover:bg-blue-50">
                          Schedule a property visit · Check available times <span className="float-right" aria-hidden="true">＋</span>
                        </summary>
                        <div className="border-t border-slate-100 bg-slate-50">
                          <p className="px-4 pt-4 text-xs leading-5 text-slate-600">Choose a date and available time. Your request remains pending until the owner or agent confirms it.</p>
                          <ScheduleVisit listingId={listing.id} prefill={{ name: '', phone: '', email: '' }} />
                        </div>
                      </details>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          <AgentContactForm agentName={agent.full_name ?? 'this professional'} phone={agent.phone ?? null} />
        </div>
      </main>
      <Footer />
    </>
  );
}
