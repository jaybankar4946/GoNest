import Link from 'next/link';
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, Compass, House, KeyRound, ShieldCheck } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HomeSearch } from './HomeSearch';
import { getFeatured, getCities, getPopularLocalities } from '@/lib/api';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'GoNest — Find Homes in Mumbai & Pune',
  description: 'Explore property options in Mumbai and Pune, or submit genuine homes and projects to help build a more transparent local property marketplace.',
};

const display = { fontFamily: 'var(--font-manrope), var(--font-display)' } as const;

export default async function HomePage() {
  const [featured, cities, popular] = await Promise.all([
    getFeatured(6),
    getCities(),
    getPopularLocalities(8),
  ]);

  return (
    <>
      <Nav />
      <main className="bg-white text-gray-950">
        <section className="border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-4 text-sm font-semibold text-blue-700">Mumbai · Pune · Buy · Rent · New projects</p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl" style={{ ...display, letterSpacing: '-0.045em' }}>
                Find your next home in Mumbai & Pune.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Discover local property options as genuine inventory comes online. Compare the details that matter, and help us build a more transparent marketplace.
              </p>
              <div className="mx-auto mt-8 max-w-4xl text-left">
                <HomeSearch cities={cities} />
              </div>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/buy" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800">Explore homes to buy</Link>
                <Link href="/rent" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-300 hover:bg-blue-50">Find a rental</Link>
                <Link href="/dashboard/new" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-300 hover:bg-blue-50">Owners &amp; agents: submit a property</Link>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {cities.filter((city) => /mumbai|pune/i.test(city.name)).map((city) => (
                  <Link key={city.id} href={`/search?city=${city.id}`} className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:border-blue-300 hover:bg-blue-50">
                    Explore {city.name}
                  </Link>
                ))}
                <Link href="/builders" className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100">Developers: submit a project</Link>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Explore GoNest" className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/buy', title: 'Buy a home', desc: 'Find homes for sale', icon: House },
              { href: '/rent', title: 'Rent a home', desc: 'Find a place to rent', icon: KeyRound },
              { href: '/projects', title: 'New projects', desc: 'Explore project information', icon: Building2 },
              { href: '/dashboard/new', title: 'Post property free', desc: 'Submit a property for review', icon: Compass },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-blue-700 group-hover:bg-blue-50"><Icon size={21} /></span>
                  <span className="min-w-0"><span className="block font-semibold">{item.title}</span><span className="mt-1 block text-sm text-gray-500">{item.desc}</span></span>
                  <ArrowRight size={16} className="ml-auto shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700" />
                </Link>
              );
            })}
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="bg-gray-50">
            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-blue-700">Explore available homes</p>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...display, letterSpacing: '-0.03em' }}>Homes to consider</h2>
                  <p className="mt-2 text-sm text-gray-600">Only active, non-sample listings are shown here.</p>
                </div>
                <Link href="/search" className="hidden items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 sm:inline-flex">View all <ArrowRight size={16} /></Link>
              </div>
              <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}
              </div>
              <div className="mt-7 sm:hidden"><Link href="/search" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">View all homes <ArrowRight size={16} /></Link></div>
            </div>
          </section>
        ) : (
          <section className="border-y border-gray-100 bg-gray-50">
            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <p className="mb-2 text-sm font-semibold text-blue-700">Inventory is being onboarded</p>
                <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl" style={{ ...display, letterSpacing: '-0.035em' }}>Good property decisions start with honest information.</h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">We don’t fill search results with demo homes. Our launch focus is genuine supply across Mumbai and Pune. Explore project information, or submit a real property for review.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/dashboard/new" className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800">Post property free</Link>
                  <Link href="/builders" className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">Developer partnerships</Link>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold">Before you decide</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
                  <li className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /><span>Confirm price and availability directly with the advertiser.</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /><span>Check RERA and project details through official sources where applicable.</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /><span>Review ownership documents and property conditions before committing.</span></li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {popular.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...display, letterSpacing: '-0.03em' }}>Explore neighbourhoods</h2>
              <p className="mt-2 text-sm text-gray-600">Browse locations with information available on GoNest.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((locality) => (
                <Link key={locality.id} href={`/search?q=${encodeURIComponent(locality.name)}${locality.cityId ? `&city=${locality.cityId}` : ''}`} className="rounded-xl border border-gray-200 px-4 py-4 transition hover:border-blue-300 hover:bg-blue-50/40">
                  <span className="block font-semibold">{locality.name}</span>
                  <span className="mt-1 block text-sm text-gray-500">{locality.city}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="border-y border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
              <div>
                <p className="mb-2 text-sm font-semibold text-blue-700">Built around clarity</p>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...display, letterSpacing: '-0.03em' }}>More context. Fewer surprises.</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-gray-600">A property listing is a starting point. Confirm the facts that matter before you visit, negotiate or sign.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  ['Listing status', 'Check whether the listing is active and reconfirm availability.'],
                  ['Property details', 'Review area, charges, photos and documents with the advertiser.'],
                  ['RERA information', 'Check applicable registration details with the official authority.'],
                ].map(([title, desc]) => (
                  <div key={title} className="border-l-2 border-blue-100 pl-4">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
          <div className="flex flex-col gap-5 rounded-2xl bg-blue-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ ...display, letterSpacing: '-0.025em' }}>Have a property to list?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Owners and agents can submit genuine properties for review. Developers can share project information. GoNest does not present demo homes as live inventory.</p>
            </div>
            <Link href="/dashboard/new" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800">Post property free <ArrowRight size={16} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
