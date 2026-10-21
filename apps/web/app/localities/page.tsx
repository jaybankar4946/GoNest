import Link from 'next/link';
import type { Metadata } from 'next';
import { localityGuides } from '@/lib/locality-guides';

export const metadata: Metadata = {
  title: 'Mumbai & Pune Locality Guides',
  description: 'Explore GoNest locality guides for Mumbai and Pune. Compare neighbourhood context, property search options and practical checks before buying or renting.',
  alternates: { canonical: '/localities' },
};

export default function LocalitiesPage() {
  const cities = ['Mumbai', 'Pune'] as const;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500"><Link href="/">Home</Link> / Locality guides</nav>
      <header className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">GoNest neighbourhood guide</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">Explore Mumbai and Pune localities</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">Understand the practical questions to compare when buying or renting. Local conditions differ by street, building and society, so verify details for each property.</p>
      </header>
      {cities.map((city) => <section key={city} className="mt-10">
        <h2 className="text-2xl font-bold text-slate-950">{city}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localityGuides.filter((guide) => guide.city === city).map((guide) => <article key={guide.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{guide.city}</p>
            <h3 className="mt-2 text-xl font-bold text-slate-950">{guide.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{guide.overview}</p>
            <Link className="mt-4 inline-flex font-semibold text-blue-700 hover:text-blue-900" href={`/localities/${guide.slug}`}>Read locality guide <span aria-hidden="true" className="ml-1">→</span></Link>
          </article>)}
        </div>
      </section>)}
      <section className="mt-12 rounded-2xl bg-slate-50 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-950">Ready to explore homes?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Browse current listings and verify price, availability and property details with the listing contact before making a decision.</p>
        <div className="mt-4 flex flex-wrap gap-3"><Link href="/buy" className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white">Buy properties</Link><Link href="/rent" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800">Rent properties</Link><Link href="/projects" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800">Explore projects</Link></div>
      </section>
    </main>
  );
}
