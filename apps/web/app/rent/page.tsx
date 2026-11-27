import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';

export const revalidate = 60;
export const metadata = {
  title: 'Homes for Rent in India | Search, Compare & Schedule a Visit',
  description: 'Find homes for rent on GoNest. Compare rent, furnishing, location and amenities, then enquire and coordinate a property visit.',
};

const steps = [
  { number: '01', title: 'Find the right home', description: 'Search by city, locality, budget, BHK and the features that matter.' },
  { number: '02', title: 'Compare the details', description: 'Review rent, deposit, furnishing, amenities and property information before you enquire.' },
  { number: '03', title: 'Arrange a visit', description: 'Send an enquiry and coordinate a viewing with the owner or agent.' },
  { number: '04', title: 'Prepare to move in', description: 'Confirm the final costs, agreement terms, society requirements and verification steps before paying or signing.' },
];

export default async function RentPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">GoNest · Rent a home</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight md:text-5xl">Find a place that feels right. Understand the details before you move.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">Explore rental homes, compare the important details and connect with the owner or agent to arrange a visit. Confirm availability, deposit and all charges directly before making a commitment.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
              <a href="#rental-search" className="rounded-xl bg-blue-500 px-5 py-3 text-white transition hover:bg-blue-400">Explore rental homes</a>
              <a href="/list-property" className="rounded-xl border border-white/25 px-5 py-3 text-white transition hover:bg-white/10">List a rental property</a>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-9 md:px-8">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">A clearer rental journey</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">From discovery to move-in preparation</h2>
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
          <p className="mt-4 text-xs leading-5 text-slate-500">GoNest helps you discover and coordinate. A visit is not confirmed until the property contact agrees, and agreement, police verification, society NOC and payment terms must be confirmed with the relevant parties.</p>
        </section>
        <div id="rental-search" className="scroll-mt-24">
          <SearchResults cities={await getCities()} init={{ purpose: 'rent' }} />
        </div>
      </main>
      <Footer />
    </>
  );
}
