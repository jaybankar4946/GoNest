import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Top Mumbai & MMR Builders and Projects | GoNest',
  description: 'Compare featured residential projects across Mumbai and MMR. Review locations, configurations where published, MahaRERA references, price guidance and current availability checks.',
};

type Project = {
  builder: string; project: string; location: string; area: string;
  configurations: string; price: string; rera: string[]; website: string; details: string;
};

const PROJECTS: Project[] = [
  { builder: 'Lodha Group', project: 'Lodha NCP Tower 2', location: 'Wadala, Mumbai', area: 'Central Mumbai', configurations: 'Confirm with developer', price: 'Request current quote', rera: [], website: 'https://www.lodhagroup.com', details: 'Listed in HSBC India’s Mumbai approved-project directory, last updated 11 February 2026.' },
  { builder: 'Godrej Properties', project: 'Godrej Ascend · Phases 2, 3 & 4', location: 'Kolshet Road, Thane', area: 'Thane', configurations: 'Confirm by phase and wing', price: 'Request current quote', rera: [], website: 'https://www.godrejproperties.com', details: 'Confirm the exact phase, wing and registration before comparing a unit.' },
  { builder: 'Kalpataru Group', project: 'Kalpataru One', location: 'Worli, Mumbai', area: 'South/Central Mumbai', configurations: 'Confirm with developer', price: 'Request current quote', rera: [], website: 'https://www.kalpataru.com', details: 'Listed in HSBC India’s Mumbai approved-project directory, last updated 11 February 2026.' },
  { builder: 'Runwal Group', project: 'Runwal Avenue · Wings I–N', location: 'Kanjurmarg East, Mumbai', area: 'Eastern suburbs', configurations: 'Confirm by wing and unit', price: 'Request current quote', rera: ['P51800048234', 'P51800026860', 'P51800028811', 'P51800031895', 'P51800033514', 'P51800047714'], website: 'https://runwalavenue.co.in/', details: 'Project website publishes separate MahaRERA numbers for Wings I, J, K, L, M and N. Verify the relevant wing’s current status.' },
  { builder: 'Rustomjee', project: 'Rustomjee Balmoral Golf Links', location: 'Chembur, Mumbai', area: 'Eastern suburbs', configurations: '4 BHK and 5 BHK (developer-published)', price: 'Developer-published starting price: ₹9.60 Cr; reconfirm current offer', rera: ['P51800080027', 'P51800080624', 'PR1180002502115'], website: 'https://www.rustomjee.com/projects/residential/rustomjee-balmoral-golflinks/', details: 'Developer project page describes a newly launched gated residential development. Price and availability can change; confirm the exact wing and registration.' },
  { builder: 'DLF', project: 'DLF The Westpark · Phase 1', location: 'Oshiwara, Andheri, Mumbai', area: 'Western suburbs', configurations: 'Confirm with developer', price: 'Request current quote', rera: [], website: 'https://www.dlf.in/', details: 'Listed in HSBC India’s Mumbai approved-project directory, last updated 11 February 2026.' },
  { builder: 'Arkade Group', project: 'Eden', location: 'Malad West, Mumbai', area: 'Western suburbs', configurations: 'Confirm with developer', price: 'Request current quote', rera: [], website: 'https://arkade.in/', details: 'Listed in HSBC India’s Mumbai approved-project directory, last updated 11 February 2026.' },
  { builder: 'Kabra Group', project: 'Kabra Garnet', location: 'Malad West, Mumbai', area: 'Western suburbs', configurations: 'Confirm with developer', price: 'Request current quote', rera: [], website: 'https://www.kabragroup.com/', details: 'Listed in HSBC India’s Mumbai approved-project directory, last updated 11 February 2026.' },
  { builder: 'Prestige Group', project: 'Nautilus · Wings D, E & F', location: 'Worli, Mumbai', area: 'South/Central Mumbai', configurations: 'Confirm by wing and unit', price: 'Request current quote', rera: [], website: 'https://www.prestigeconstructions.com/', details: 'Listed in HSBC India’s Mumbai approved-project directory, last updated 11 February 2026.' },
  { builder: 'Mahindra Lifespaces', project: 'Marina 64 · Phase 1', location: 'Malad, Mumbai', area: 'Western suburbs', configurations: 'Confirm with developer', price: 'Request current quote', rera: [], website: 'https://www.mahindralifespaces.com/', details: 'Listed in HSBC India’s Mumbai approved-project directory, last updated 11 February 2026.' },
];

const MAHARERA = 'https://www.maharera.maharashtra.gov.in/';
const HSBC_SOURCE = 'https://www.hsbc.bank.in/home-loans/list-of-projects/mumbai/';

export default function BuildersPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-blue-300">GoNest · Builder & project directory</p>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">Compare builders. Explore projects. Verify every detail.</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">A curated starting point for Mumbai and MMR homebuyers, with project locations, known configurations, published RERA references and direct routes to request current prices and availability.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={MAHARERA} target="_blank" rel="noreferrer" className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white hover:bg-blue-400">Verify on official MahaRERA ↗</a>
              <a href={HSBC_SOURCE} target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">View source project directory ↗</a>
              <Link href="/search?purpose=sale" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Browse GoNest sale listings →</Link>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div><p className="text-sm font-bold uppercase tracking-wider text-blue-700">Featured shortlist</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">10 builders and their projects</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Project names and locations are drawn from developer publications and/or HSBC India’s project directory (updated 11 February 2026). This is a discovery shortlist, not a ranking or endorsement.</p></div>
            <span className="w-fit rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">Live unit counts not independently confirmed</span>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {PROJECTS.map((p, index) => (
              <article key={p.project} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md md:p-7">
                <div className="flex items-start justify-between gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-extrabold text-blue-700">{String(index + 1).padStart(2, '0')}</div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{p.area}</span></div>
                <p className="mt-5 text-sm font-semibold text-blue-700">{p.builder}</p><h3 className="mt-1 text-xl font-extrabold leading-snug text-slate-950">{p.project}</h3><p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><span aria-hidden="true">⌖</span>{p.location}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Configuration</p><p className="mt-1 text-sm font-semibold text-slate-900">{p.configurations}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Price guidance</p><p className="mt-1 text-sm font-semibold text-slate-900">{p.price}</p></div></div>
                <div className="mt-4 rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Current availability</p><p className="mt-1 text-sm font-bold text-amber-800">Contact developer to confirm live units</p><p className="mt-1 text-xs leading-5 text-slate-500">GoNest does not yet have a verified live inventory feed for this project.</p></div>
                <div className="mt-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">MahaRERA registration</p>{p.rera.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{p.rera.map((id) => <a key={id} href={MAHARERA} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:underline">{id} ↗</a>)}</div> : <p className="mt-1 text-sm text-slate-600">Not independently matched to a specific phase/wing in this directory. Search the exact project on MahaRERA before booking.</p>}</div>
                <p className="mt-4 text-xs leading-5 text-slate-500">{p.details}</p>
                <div className="mt-auto flex flex-wrap gap-3 border-t border-slate-100 pt-5 mt-5"><a href={p.website} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700">Contact builder / request visit ↗</a><Link href={`/search?purpose=sale&q=${encodeURIComponent(p.project)}`} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-400">Find GoNest listings</Link></div>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8"><h2 className="text-lg font-extrabold text-amber-950">Before you book or pay</h2><ul className="mt-3 grid gap-2 text-sm leading-6 text-amber-950 md:grid-cols-2"><li>• Match the registration to the exact phase, tower and wing.</li><li>• Check current project status and declared completion date on MahaRERA.</li><li>• Request written unit availability, carpet area, floor, total price and charges.</li><li>• Confirm possession timeline, amenities and parking in the latest agreement/offer.</li><li>• Ask for the latest sold/unsold inventory statement; registered total units are not available units.</li><li>• Save the date on which prices and availability were confirmed.</li></ul><p className="mt-4 text-xs leading-5 text-amber-900">HSBC’s list is an indicative approved-project directory and explicitly says project/tower/unit approvals may differ and details may change. GoNest does not treat inclusion there as a guarantee of quality, legal compliance or availability.</p></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
