import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HomeSearch } from './HomeSearch';
import { getFeatured, getCities, getPopularLocalities } from '@/lib/api';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'GoNest – Find a Home in Mumbai & Pune',
  description: 'Explore homes to buy or rent across Mumbai and Pune. Compare property details and contact owners or agents.',
};

const HERO = 'https://images.unsplash.com/photo-1762811054947-605b20298615?w=1600&h=900&fit=crop&auto=format';
const display = { fontFamily: 'var(--font-manrope), var(--font-display)' } as const;

export default async function HomePage() {
  const [featured, cities, popular] = await Promise.all([
    getFeatured(4),
    getCities(),
    getPopularLocalities(6),
  ]);

  const launchCities = cities.filter((city) => /mumbai|pune/i.test(city.name));

  return (
    <>
      <Nav />
      <main>
        <section className="relative isolate overflow-hidden bg-slate-950">
          <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/55 to-slate-950/25" />
          <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center px-5 py-16 sm:px-8 lg:min-h-[600px] lg:grid-cols-[1fr_0.9fr] lg:gap-12 lg:px-10">
            <div className="max-w-2xl text-white">
              <p className="mb-5 text-sm font-semibold tracking-wide text-white/80">A clearer way to find your next home</p>
              <h1 className="mb-5 text-5xl font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl" style={display}>
                Find a place to call home.
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                Explore homes to buy or rent across Mumbai and Pune. Compare the details that matter, then connect with the owner or agent.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/buy" className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100">
                  Explore homes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/list-with-gonest" className="inline-flex items-center justify-center rounded-lg border border-white/50 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                  List with GoNest
                </Link>
              </div>
              {launchCities.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {launchCities.map((city) => (
                    <Link key={city.id} href={`/search?city=${city.id}`} className="rounded-full border border-white/25 px-3.5 py-1.5 text-sm text-white/90 transition hover:bg-white/10">
                      {city.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-10 rounded-2xl bg-white p-3 shadow-2xl sm:p-5 lg:mt-0">
              <div className="px-2 pb-3 pt-1 sm:px-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-950" style={display}>Search homes</h2>
                <p className="mt-1 text-sm text-slate-500">Start with your location, budget and space.</p>
              </div>
              <HomeSearch cities={cities} />
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="bg-white py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">A good place to start</p>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl" style={display}>Homes worth exploring</h2>
                  <p className="mt-2 text-sm text-slate-600">A small selection to help you begin your search.</p>
                </div>
                <Link href="/search" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 sm:inline-flex">
                  View all homes <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}
              </div>
              <div className="mt-6 sm:hidden">
                <Link href="/search" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                  View all homes <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {popular.length > 0 && (
          <section className="border-y border-slate-100 bg-slate-50 py-11 sm:py-12">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="mb-5">
                <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl" style={display}>Explore popular localities</h2>
                <p className="mt-1 text-sm text-slate-600">Narrow your search to the neighbourhood that feels right.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {popular.map((locality) => (
                  <Link key={locality.id} href={`/search?q=${encodeURIComponent(locality.name)}${locality.cityId ? `&city=${locality.cityId}` : ''}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    {locality.name}<span className="text-slate-400">, {locality.city}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-white py-10 sm:py-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950" style={display}>Have a property or project to share?</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Owners, agents and developers can introduce their inventory to people searching on GoNest.</p>
            </div>
            <Link href="/list-with-gonest" className="inline-flex w-fit shrink-0 items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              List with GoNest <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
