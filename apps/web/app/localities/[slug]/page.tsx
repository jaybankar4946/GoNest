import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocalityGuide, localityGuides } from '@/lib/locality-guides';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return localityGuides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getLocalityGuide(slug);
  if (!guide) return { title: 'Locality not found', robots: { index: false, follow: true } };
  return {
    title: `${guide.name}, ${guide.city} Property Guide`,
    description: `Explore the ${guide.name}, ${guide.city} property guide from GoNest. Review neighbourhood context and practical checks for buying or renting.`,
    alternates: { canonical: `/localities/${guide.slug}` },
    openGraph: { title: `${guide.name}, ${guide.city} Property Guide | GoNest`, description: guide.overview, type: 'article', url: `https://gonest.in/localities/${guide.slug}` },
  };
}

export default async function LocalityPage({ params }: Props) {
  const { slug } = await params;
  const guide = getLocalityGuide(slug);
  if (!guide) notFound();
  const related = localityGuides.filter((item) => item.city === guide.city && item.slug !== guide.slug);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${guide.name}, ${guide.city}, India`,
    description: guide.overview,
    address: { '@type': 'PostalAddress', addressLocality: guide.city, addressCountry: 'IN' },
    url: `https://gonest.in/localities/${guide.slug}`,
  };
  const localityQuery = encodeURIComponent(guide.name);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500"><Link href="/">Home</Link> / <Link href="/localities">Locality guides</Link> / {guide.name}</nav>
      <header className="rounded-3xl bg-slate-950 px-6 py-9 text-white sm:px-10 sm:py-12">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-300">{guide.city} · Locality guide</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">{guide.name} property guide</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200">{guide.overview}</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link href={`/buy?q=${localityQuery}`} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950">Explore homes to buy</Link><Link href={`/rent?q=${localityQuery}`} className="rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white">Explore rentals</Link></div>
      </header>
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-950">What to compare in {guide.name}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">{guide.highlights.map((item) => <li key={item} className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700"><span className="mr-2 font-bold text-blue-700">✓</span>{item}</li>)}</ul>
      </section>
      <section className="mt-10 grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 p-6"><h2 className="text-xl font-bold text-slate-950">Buying in {guide.name}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{guide.buyerNote}</p><Link href={`/buy?q=${localityQuery}`} className="mt-4 inline-flex font-semibold text-blue-700">Browse buying options →</Link></article>
        <article className="rounded-2xl border border-slate-200 p-6"><h2 className="text-xl font-bold text-slate-950">Renting in {guide.name}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{guide.renterNote}</p><Link href={`/rent?q=${localityQuery}`} className="mt-4 inline-flex font-semibold text-blue-700">Browse rental options →</Link></article>
      </section>
      <aside className="mt-10 rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Important:</strong> This guide is general neighbourhood information, not a guarantee of prices, availability, legal status or commute times. Confirm current property details and independently verify relevant documents before transacting.</aside>
      {related.length > 0 && <section className="mt-10"><h2 className="text-2xl font-bold text-slate-950">More localities in {guide.city}</h2><div className="mt-4 flex flex-wrap gap-3">{related.map((item) => <Link key={item.slug} href={`/localities/${item.slug}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-700">{item.name}</Link>)}</div></section>}
      <div className="mt-10"><Link href="/localities" className="font-semibold text-blue-700">← All locality guides</Link></div>
    </main>
  );
}
