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
  const initials = broker.name.split(/\\s+/).map(x => x[0]).slice(0,2).join('').toUpperCase();
  const contactSubject = encodeURIComponent(`GoNest enquiry for ${broker.name}`);
  const contactBody = encodeURIComponent(`Agency: ${broker.name}\\nArea: ${broker.area}\\n\\nPlease share my enquiry with this agency.\\n\\nName: \\nMobile: \\nEmail: \\nRequirement: \\nMessage: `);
  return <><Nav /><main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
    <Link href="/agents" className="text-sm font-semibold text-blue-700 hover:underline">← Agent directory</Link>
    <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[.8fr_1.2fr]">
        <div className="flex min-h-64 items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-5">
          {broker.teamMembers?.length ? (
            <div className="grid w-full max-w-md grid-cols-3 gap-2">
              {broker.teamMembers.map((member) => (
                <a key={member.name} href={member.sourceUrl} target="_blank" rel="noreferrer" title={`${member.name} · official team profile`} className="overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                  <img src={member.photoUrl} alt={`${member.name}, ${broker.name}`} loading="lazy" referrerPolicy="no-referrer" className="aspect-[4/5] w-full object-cover" />
                  <span className="block truncate px-1.5 py-1 text-center text-[10px] font-bold text-slate-700">{member.name}</span>
                </a>
              ))}
            </div>
          ) : broker.profileImageUrl ? <img src={broker.profileImageUrl} alt={broker.name + ' public business identity'} referrerPolicy="no-referrer" className="h-28 w-28 rounded-2xl border border-slate-200 bg-white p-3 object-contain shadow-sm" /> : <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-slate-200 bg-white text-3xl font-extrabold text-slate-500 shadow-sm">{initials}</div>}
        </div>
        <div className="p-6 md:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Public business listing · Thane</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">{broker.name}</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">{broker.area}</p>
          <div className="mt-3 flex items-center gap-2"><span className="text-amber-500">★</span><strong className="text-sm text-slate-950">{broker.rating.toFixed(1)}</strong><span className="text-sm text-slate-500">({broker.reviews.toLocaleString('en-IN')} public reviews)</span></div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{broker.note}. Services shown: {broker.services.join(', ')}.</p>
          <p className="mt-4 text-sm leading-6 text-slate-500">{broker.address}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#contact-agent" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Contact Agent</a>
            <a href="#available-homes" className="inline-flex items-center justify-center rounded-xl border border-blue-200 px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">Schedule a Visit</a>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Public directory profile · This business has not yet claimed a GoNest agent account. Public ratings are external snapshots, not GoNest reviews or verification.</p>
        </div>
      </div>
    </section>

    <section id="contact-agent" className="mt-8 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-7 md:grid-cols-[1fr_.85fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest contact request</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Tell us what you’re looking for</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Prepare an enquiry for {broker.name}. GoNest can route it once this business claims and verifies its profile.</p>
          <form action="mailto:info@gonest.in" method="get" encType="text/plain" className="mt-5 grid gap-3">
            <input name="subject" type="hidden" value={`GoNest enquiry — ${broker.name}`} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">Full name<input name="name" required placeholder="Your name" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-500" /></label>
              <label className="text-xs font-semibold text-slate-600">Mobile number<input name="phone" required inputMode="tel" placeholder="10-digit mobile number" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-500" /></label>
            </div>
            <label className="text-xs font-semibold text-slate-600">Email address<input name="email" type="email" placeholder="you@example.com" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-500" /></label>
            <label className="text-xs font-semibold text-slate-600">I’m interested in<select name="requirement" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900"><option>Buying a property</option><option>Renting a property</option><option>Selling a property</option><option>General consultation</option></select></label>
            <label className="text-xs font-semibold text-slate-600">Message<textarea name="message" rows={3} placeholder="Share your preferred area, budget and requirements…" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-500" /></label>
            <button type="submit" className="min-h-12 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Prepare email enquiry</button>
            <p className="text-xs leading-5 text-slate-500">This opens your email app addressed to GoNest support. It does not yet create a lead in the agent dashboard or send directly to the agency.</p>
          </form>
        </div>
        <aside className="rounded-2xl bg-slate-50 p-5 md:p-6">
          <h3 className="font-extrabold text-slate-950">How GoNest contact works</h3>
          <ol className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
            <li><strong className="text-slate-900">1. Share your requirement</strong><br/>Tell us your location, budget and property needs.</li>
            <li><strong className="text-slate-900">2. Agency profile claim</strong><br/>The business must claim and verify its GoNest profile before direct lead routing is enabled.</li>
            <li><strong className="text-slate-900">3. Track your request</strong><br/>Dashboard tracking will be available after the agency is onboarded.</li>
          </ol>
          <div className="mt-6 rounded-xl border border-blue-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Need a visit now?</p>
            <p className="mt-1 text-sm text-slate-600">Choose a specific active GoNest listing below to check real booking slots.</p>
            <a href="#available-homes" className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:underline">Browse homes and availability ↓</a>
          </div>
        </aside>
      </div>
    </section>

    <section id="available-homes" className="mt-12 scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Explore by service area</p><h2 className="mt-2 text-2xl font-extrabold text-slate-950 md:text-3xl">Available GoNest homes near {locality}</h2><p className="mt-2 text-sm text-slate-600">These are independent active listings in the area, not inventory claimed by {broker.name}.</p></div><span className="text-sm font-semibold text-slate-500">{listings.length} listings found</span></div>
      {listings.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map((listing) => <article key={listing.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><PropertyCard listing={listing}/><details className="border-t border-slate-100"><summary className="cursor-pointer px-5 py-4 text-sm font-extrabold text-blue-700 hover:bg-blue-50">Schedule visit · Check live slots</summary><div className="border-t border-slate-100 bg-slate-50"><p className="px-4 pt-4 text-xs leading-5 text-slate-600">Choose an available date and time. The request remains pending until the listing poster confirms it.</p><ScheduleVisit listingId={listing.id} prefill={{name:'',phone:'',email:''}}/></div></details></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><h3 className="font-bold text-slate-900">No matching active GoNest homes yet</h3><p className="mt-2 text-sm text-slate-600">Browse the directory or search all available homes in Thane.</p><Link href="/search?q=Thane" className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Search Thane homes</Link></div>}
    </section>
  </main><Footer/></>;
}
