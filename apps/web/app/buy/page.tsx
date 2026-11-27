import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';

export const revalidate = 60;
export const metadata = {
  title: 'Homes for Sale in India | Search, Compare & Explore',
  description: 'Explore homes for sale on GoNest. Compare property details, shortlist options and connect with owners, agents or developers.',
};

const steps = [
  { number: '01', title: 'Explore locations', description: 'Search homes by city, locality, budget, configuration and property type.' },
  { number: '02', title: 'Compare properties', description: 'Review pricing, area, amenities, listing details and available documents.' },
  { number: '03', title: 'Speak and visit', description: 'Enquire with the owner, agent or developer and coordinate a site visit.' },
  { number: '04', title: 'Check before you commit', description: 'Verify title and approvals with qualified professionals; confirm taxes, stamp duty, registration and loan terms.' },
];

export default async function BuyPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">GoNest · Buy a home</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight md:text-5xl">Make a more informed move towards your next home.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">Discover resale homes and new projects, compare the details that matter and connect with the people who can help you take the next step. Property information and availability should always be independently confirmed.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
              <a href="#buy-search" className="rounded-xl bg-blue-500 px-5 py-3 text-white transition hover:bg-blue-400">Explore homes for sale</a>
              <a href="/projects" className="rounded-xl border border-white/25 px-5 py-3 text-white transition hover:bg-white/10">Explore new projects</a>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-9 md:px-8">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">A more considered buying journey</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Discover, evaluate and plan your next steps</h2>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.number} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="text-xs font-extrabold tracking-widest text-blue-700">{step.number}</span>
                <h3 className="mt-3 font-bold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-5 text-slate-500">A GoNest listing or enquiry is not a legal verification or a guarantee of availability. Complete independent legal, technical and financial checks before paying a token or signing an agreement.</p>
        </section>
        <div id="buy-search" className="scroll-mt-24">
          <SearchResults cities={await getCities()} init={{ purpose: 'sale' }} />
        </div>
      </main>
      <Footer />
    </>
  );
}
