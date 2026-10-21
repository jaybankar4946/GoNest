import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { getCities } from '@/lib/api';
import { HomeValueEstimator } from './HomeValueEstimator';

export const metadata: Metadata = {
  title: 'Home Value Estimator for Mumbai & Pune',
  description: 'Get an indicative property value range from available GoNest listings in Mumbai and Pune. See how locality, property type and area affect the estimate.',
  alternates: { canonical: '/home-value' },
  openGraph: {
    title: 'GoNest Home Value Estimator',
    description: 'Explore an indicative home value range using available comparable asking listings.',
    url: 'https://gonest.in/home-value',
    type: 'website',
  },
};

export default async function HomeValuePage() {
  const cities = await getCities();
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500"><Link href="/">Home</Link> / Home Value</nav>
        <header className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">GoNest Home Value</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">What could your property be worth?</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Start with an indicative range based on comparable active GoNest sale listings in the same locality. We show when there is not enough comparable data rather than inventing a valuation.</p>
        </header>
        <div className="mt-8"><HomeValueEstimator cities={cities} /></div>
        <section className="mt-12 grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 p-5"><h2 className="font-bold text-slate-950">1. Match the property</h2><p className="mt-2 text-sm leading-6 text-slate-600">Locality, property type and area help narrow comparable listings.</p></article>
          <article className="rounded-2xl border border-slate-200 p-5"><h2 className="font-bold text-slate-950">2. Compare available listings</h2><p className="mt-2 text-sm leading-6 text-slate-600">The initial model uses current asking prices, not confirmed transaction prices.</p></article>
          <article className="rounded-2xl border border-slate-200 p-5"><h2 className="font-bold text-slate-950">3. Verify before acting</h2><p className="mt-2 text-sm leading-6 text-slate-600">Confirm carpet area, condition, building details, title and recent registered transactions with qualified professionals.</p></article>
        </section>
        <aside className="mt-8 rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Important:</strong> This is an indicative comparison tool, not a bank valuation, appraisal, legal opinion or guaranteed sale price. Asking prices may differ from actual transaction prices. Results depend on listing coverage, data accuracy and similarity of available properties.</aside>
      </main>
      <Footer />
    </>
  );
}
