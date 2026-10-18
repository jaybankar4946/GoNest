import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Mumbai & MMR Builders | GoNest',
  description: 'Explore established real-estate developers across Mumbai and the Mumbai Metropolitan Region. Check each project’s exact MahaRERA registration before booking.',
};

const BUILDERS = [
  { name: 'Lodha', areas: 'Mumbai · Thane · MMR', site: 'https://www.lodhagroup.com' },
  { name: 'Godrej Properties', areas: 'Mumbai · Thane · Navi Mumbai', site: 'https://www.godrejproperties.com' },
  { name: 'Oberoi Realty', areas: 'Mumbai · Thane', site: 'https://www.oberoirealty.com' },
  { name: 'Kalpataru', areas: 'Mumbai · Thane · MMR', site: 'https://www.kalpataru.com' },
  { name: 'Rustomjee', areas: 'Mumbai · Thane · MMR', site: 'https://www.rustomjee.com' },
  { name: 'Runwal', areas: 'Mumbai · Thane · MMR', site: 'https://www.runwal.com' },
  { name: 'Raymond Realty', areas: 'Thane · Mumbai', site: 'https://www.raymondrealty.in' },
  { name: 'Mahindra Lifespaces', areas: 'Mumbai · Navi Mumbai · MMR', site: 'https://www.mahindralifespaces.com' },
  { name: 'Piramal Realty', areas: 'Mumbai · Thane', site: 'https://www.piramalrealty.com' },
  { name: 'Hiranandani', areas: 'Powai · Thane · MMR', site: 'https://www.hiranandani.com' },
  { name: 'Sunteck Realty', areas: 'Mumbai · MMR', site: 'https://www.sunteckindia.com' },
  { name: 'Prestige Group', areas: 'Mumbai · MMR', site: 'https://www.prestigeconstructions.com' },
];

const RERA_SEARCH = 'https://www.maharera.maharashtra.gov.in/projects-search-result';

export default function BuildersPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">GoNest · Supply directory</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 md:text-5xl">Explore builders across Mumbai &amp; MMR.</h1>
          <p className="mt-5 text-lg leading-8 text-gray-600">Start with a developer, then verify the exact project, wing and registration before you shortlist a home. Project prices, unit availability and possession dates can change—confirm them directly.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={RERA_SEARCH} target="_blank" rel="noreferrer" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Search official MahaRERA ↗</a>
            <Link href="/search?purpose=sale" className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-800 hover:border-blue-500">Browse homes for sale</Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUILDERS.map((builder) => (
            <article key={builder.name} className="flex min-h-56 flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-lg font-extrabold text-blue-700">{builder.name.charAt(0)}</div>
              <h2 className="text-xl font-bold text-gray-950">{builder.name}</h2>
              <p className="mt-2 text-sm text-gray-500">{builder.areas}</p>
              <p className="mt-4 text-sm leading-6 text-gray-600">Official developer site for current project information. GoNest has not independently confirmed live inventory or prices for this developer.</p>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-5 text-sm font-semibold">
                <a href={builder.site} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">Developer website ↗</a>
                <a href={RERA_SEARCH} target="_blank" rel="noreferrer" className="text-gray-700 hover:underline">Check MahaRERA ↗</a>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <h2 className="text-lg font-bold text-amber-950">Before you pay a booking amount</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-amber-950 md:grid-cols-2">
            <li>• Match the RERA number to the exact project phase or wing.</li>
            <li>• Check current registration status and declared completion date.</li>
            <li>• Confirm carpet area, total charges and unit availability in writing.</li>
            <li>• Review the latest official disclosures; a developer brand alone is not a project verification.</li>
          </ul>
          <p className="mt-4 text-xs leading-5 text-amber-900">This is a starting directory, not an endorsement or confirmation of any project’s legal status. Official records and the developer’s current written offer take precedence.</p>
        </section>

        <div className="mt-12 flex flex-col justify-between gap-4 rounded-2xl bg-gray-950 p-7 text-white md:flex-row md:items-center md:p-9">
          <div><h2 className="text-2xl font-bold">Looking for a local property professional?</h2><p className="mt-2 text-sm text-gray-300">Browse profiles and the active listings they have published on GoNest.</p></div>
          <Link href="/agents" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-950 hover:bg-gray-100">Browse agents &amp; owners →</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
