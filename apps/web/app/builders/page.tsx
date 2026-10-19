import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Builders & Projects | GoNest',
  description: 'Explore source-linked residential projects across Mumbai and Pune. Verify registration, pricing and availability before enquiring.',
};

const MAHARERA = 'https://www.maharera.maharashtra.gov.in/';
const HSBC_MUMBAI_SOURCE = 'https://www.hsbc.bank.in/home-loans/list-of-projects/mumbai/';
const projects = [
  { city: 'Pune', name: 'The Reserve', area: 'Sinhgad Road', builder: 'Kolte-Patil Developers', configurations: '2 & 3 BHK advertised by developer', source: 'https://www.koltepatil.com/pune/residential-properties', sourceLabel: 'Developer project directory', note: 'Price on request on the developer website. Ask the developer to confirm the exact phase, registration and current inventory.' },
  { city: 'Pune', name: 'Springshire', area: 'Wagholi', builder: 'Kolte-Patil Developers', configurations: 'Confirm with developer', source: 'https://www.koltepatil.com/pune/residential-properties', sourceLabel: 'Developer project directory', note: 'Project name and location are listed by the developer. Current pricing, phase and availability not independently confirmed.' },
  { city: 'Pune', name: 'Little Earth', area: 'Kiwale–Mamurdi Road', builder: 'Kolte-Patil Developers', configurations: 'Confirm with developer', source: 'https://www.koltepatil.com/pune/residential-properties', sourceLabel: 'Developer project directory', note: 'Project name and location are listed by the developer. Current pricing, phase and availability not independently confirmed.' },
  { city: 'Pune', name: 'Life Republic', area: 'Hinjawadi / Marunji area', builder: 'Kolte-Patil Developers', configurations: 'Multiple phases; confirm directly', source: 'https://www.koltepatil.com/pune/residential-properties/ongoing', sourceLabel: 'Developer ongoing-project directory', note: 'Multi-phase development. Verify the exact building/phase registration and unit availability before acting.' },
  { city: 'Pune', name: 'The Winds', area: 'Pune', builder: 'Kolte-Patil Developers', configurations: 'Confirm with developer', source: 'https://www.koltepatil.com/pune/residential-properties/ongoing', sourceLabel: 'Developer ongoing-project directory', note: 'Listed in the developer’s ongoing project directory; current inventory and price not confirmed.' },
  { city: 'Mumbai', name: 'Godrej Ascend — Phases 2, 3 & 4', area: 'Kolshet Road, Thane', builder: 'Godrej Properties', configurations: 'Confirm with developer', source: 'https://www.godrejproperties.com/', sourceLabel: 'Developer website', secondary: HSBC_MUMBAI_SOURCE, secondaryLabel: 'Additional source: HSBC project list (Feb 2026)', note: 'Appears in a published HSBC Mumbai approved-project list dated February 2026. This is not proof of current inventory or current RERA status.' },
  { city: 'Mumbai', name: 'Balmoral', area: 'Chembur', builder: 'Rustomjee / Keystone Realtors', configurations: 'Confirm with developer', source: 'https://www.rustomjee.com/', sourceLabel: 'Developer website', secondary: HSBC_MUMBAI_SOURCE, secondaryLabel: 'Additional source: HSBC project list (Feb 2026)', note: 'Project name and area appear in the published HSBC list. Confirm exact phase and registration directly.' },
  { city: 'Mumbai', name: 'Kalpataru One', area: 'Worli', builder: 'Kalpataru', configurations: 'Confirm with developer', source: 'https://www.kalpataru.com/', sourceLabel: 'Developer website', secondary: HSBC_MUMBAI_SOURCE, secondaryLabel: 'Additional source: HSBC project list (Feb 2026)', note: 'Project name and area appear in the published HSBC list. Current sale inventory is not confirmed.' },
  { city: 'Mumbai', name: 'Runwal Avenue — Towers J, K, L, M & N', area: 'Kanjurmarg East', builder: 'Runwal Group', configurations: 'Confirm with developer', source: 'https://runwal.com/', sourceLabel: 'Developer website', secondary: HSBC_MUMBAI_SOURCE, secondaryLabel: 'Additional source: HSBC project list (Feb 2026)', note: 'Project name and towers appear in the published HSBC list. Confirm current phase and registration directly.' },
  { city: 'Mumbai', name: 'DLF The Westpark — Phase 1', area: 'Oshiwara, Andheri', builder: 'DLF', configurations: 'Confirm with developer', source: 'https://www.dlf.in/', sourceLabel: 'Developer website', secondary: HSBC_MUMBAI_SOURCE, secondaryLabel: 'Additional source: HSBC project list (Feb 2026)', note: 'Project name and phase appear in the published HSBC list. Current pricing and availability are not confirmed.' },
];

const developers = [
  { name: 'Kolte-Patil Developers', city: 'Pune & Mumbai', url: 'https://www.koltepatil.com/' },
  { name: 'Godrej Properties', city: 'Mumbai / MMR', url: 'https://www.godrejproperties.com/' },
  { name: 'Keystone Realtors (Rustomjee)', city: 'Mumbai / MMR', url: 'https://www.rustomjee.com/' },
  { name: 'Kalpataru', city: 'Mumbai / MMR', url: 'https://www.kalpataru.com/' },
  { name: 'Runwal Group', city: 'Mumbai / MMR', url: 'https://runwal.com/' },
  { name: 'DLF', city: 'Mumbai', url: 'https://www.dlf.in/' },
  { name: 'Nyati Group', city: 'Pune', url: 'https://www.nyatigroup.com/' },
  { name: 'Paranjape Schemes', city: 'Pune', url: 'https://www.pscl.in/' },
];

export default function BuildersPage() {
  return (
    <>
      <Nav />
      <main className="bg-slate-50">
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-blue-300">GoNest · Mumbai & Pune launch</p>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">Explore projects. Check the source. Decide with confidence.</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">A starter directory built from developer websites and a published bank project list. These are source-linked project references—not GoNest-certified inventory. Registration, prices, possession dates and available units must be confirmed for the exact phase.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={MAHARERA} target="_blank" rel="noreferrer" className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white hover:bg-blue-400">Check official MahaRERA ↗</a>
              <Link href="/search?purpose=sale" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Browse verified GoNest sale listings →</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-bold uppercase tracking-widest text-blue-700">Initial project directory</p><h2 className="mt-2 text-3xl font-extrabold text-slate-950">Projects across Mumbai & Pune</h2></div>
            <p className="text-sm text-slate-500">{projects.length} source-linked references · no live unit claims</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <article key={p.city + p.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{p.city}</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Source-linked · confirm details</span></div>
                <h3 className="mt-4 text-xl font-extrabold text-slate-950">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.builder} · {p.area}</p>
                <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Configurations</p><p className="mt-1 text-sm font-semibold text-slate-800">{p.configurations}</p></div>
                <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{p.note}</p>
                <div className="mt-5 flex flex-col items-start gap-2 border-t border-slate-100 pt-4">
                  <a className="text-sm font-bold text-blue-700 hover:underline" href={p.source} target="_blank" rel="noreferrer">{p.sourceLabel} ↗</a>
                  {'secondary' in p && p.secondary && <a className="text-xs font-semibold text-slate-600 hover:underline" href={p.secondary} target="_blank" rel="noreferrer">{p.secondaryLabel} ↗</a>}
                  <a className="text-xs font-semibold text-slate-600 hover:underline" href={MAHARERA} target="_blank" rel="noreferrer">Search registration on official MahaRERA ↗</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Developer directory</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Official developer websites</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">These links establish the company’s own website as a starting point. They do not mean GoNest has a partnership with, endorsement from, or a verified inventory feed from that developer.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {developers.map((d) => <a key={d.name} href={d.url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300"><span className="block font-bold text-slate-900">{d.name}</span><span className="mt-1 block text-xs text-slate-500">{d.city}</span><span className="mt-3 block text-sm font-semibold text-blue-700">Open official website ↗</span></a>)}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-950"><strong>Important:</strong> A project being listed here does not mean a unit is available. GoNest does not yet have a verified live inventory feed from these developers. Confirm exact MahaRERA registration, phase, current price, taxes, possession date and written availability directly before paying or making a decision.</div>
        </section>
      </main>
      <Footer />
    </>
  );
}
