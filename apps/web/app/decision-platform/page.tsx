import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '@/app/search/SearchResults';
import { getCities, getHomeStats } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Property Decision Platform',
  description: 'Discover homes, compare real property details, understand costs and manage your next steps with GoNest.',
};

export default async function DecisionPlatformPage() {
  const [cities, stats] = await Promise.all([getCities(), getHomeStats()]);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
        <section className="bg-[#10213D] text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-200">GoNest · Property decision platform</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
                Find the right home.
                <span className="block text-blue-300">Understand the whole decision.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                Search real GoNest listings, inspect property details, compare your options, estimate costs and keep enquiries and visits together in your account.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#discover" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#10213D] hover:bg-blue-50">Explore properties</a>
                <Link href="/dashboard" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Open my workspace</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                <p className="text-xs font-medium text-blue-100">Public live listings</p>
                <p className="mt-2 text-3xl font-extrabold tabular-nums">{stats.listings.toLocaleString('en-IN')}</p>
                <p className="mt-1 text-xs text-blue-100/80">Real, active records only</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                <p className="text-xs font-medium text-blue-100">Listings with a trust signal</p>
                <p className="mt-2 text-3xl font-extrabold tabular-nums">{stats.verified.toLocaleString('en-IN')}</p>
                <p className="mt-1 text-xs text-blue-100/80">Not a substitute for due diligence</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/15 bg-white/10 p-5">
                <p className="text-xs font-medium text-blue-100">One connected journey</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm font-semibold sm:grid-cols-4">
                  <span>01 · Discover</span><span>02 · Review</span><span>03 · Enquire</span><span>04 · Visit</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="discover" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-8 sm:py-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Live property discovery</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Search homes across your target locations</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Use the existing GoNest search, filters, list/map views and saved-search workflow. Results are loaded from the connected marketplace database.</p>
            </div>
            <Link href="/agents" className="text-sm font-bold text-blue-700 hover:underline">Find an agent →</Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SearchResults cities={cities} init={{}} />
          </div>
          {stats.listings === 0 && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
              <strong>Live supply is not yet populated.</strong> Search and filters are connected, but there are currently no active, non-sample listings eligible for public results. Sample/demo records are intentionally excluded so buyers are not shown invented availability.
              <div className="mt-3"><Link href="/list-with-gonest" className="font-bold underline">List a property with GoNest</Link></div>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Your workspace</p>
              <h3 className="mt-2 text-xl font-extrabold">Manage enquiries and visits</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Return to your saved homes, enquiries, visit requests and account activity.</p>
              <span className="mt-5 inline-block text-sm font-bold text-blue-700">Open workspace →</span>
            </Link>
            <Link href="/projects" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">New homes</p>
              <h3 className="mt-2 text-xl font-extrabold">Explore residential projects</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Review project information and submit an enquiry where a project record supports it.</p>
              <span className="mt-5 inline-block text-sm font-bold text-blue-700">Explore projects →</span>
            </Link>
            <Link href="/list-with-gonest" className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Supply marketplace</p>
              <h3 className="mt-2 text-xl font-extrabold">Bring genuine supply to GoNest</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Owners, agents and developers can submit properties or projects for review.</p>
              <span className="mt-5 inline-block text-sm font-bold text-blue-700">Start onboarding →</span>
            </Link>
          </div>
          <p className="mt-6 text-xs leading-5 text-slate-500">Property prices, availability, ownership, RERA status, taxes and transaction costs must be confirmed against current documents and official sources. GoNest trust labels describe the review status recorded on the platform; they are not legal guarantees.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
