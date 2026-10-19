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
  { city: 'Mumbai / Thane', name: 'Godrej Ascend — Phases 2, 3 & 4', area: 'Kolshet Road, Thane', builder: 'Godrej Properties', configurations: 'Confirm directly with developer', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/mumbai/', sourceLabel: 'HSBC published Mumbai project list', developer: 'https://www.godrejproperties.com/', note: 'Listed in HSBC’s approved-project directory updated 11 February 2026. This does not confirm current unit availability or substitute for a MahaRERA check.' },
  { city: 'Mumbai', name: 'Balmoral', area: 'Chembur', builder: 'Rustomjee / Keystone Realtors', configurations: 'Confirm directly with developer', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/mumbai/', sourceLabel: 'HSBC published Mumbai project list', developer: 'https://www.rustomjee.com/', note: 'Listed in HSBC’s published project directory updated 11 February 2026. Confirm exact phase, registration and availability directly.' },
  { city: 'Mumbai', name: 'Kalpataru One', area: 'Worli', builder: 'Kalpataru', configurations: 'Confirm directly with developer', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/mumbai/', sourceLabel: 'HSBC published Mumbai project list', developer: 'https://www.kalpataru.com/', note: 'Listed in HSBC’s published project directory updated 11 February 2026. Current price and available units are not confirmed.' },
  { city: 'Mumbai', name: 'Runwal Avenue — Towers J–N', area: 'Kanjurmarg East', builder: 'Runwal Group', configurations: 'Confirm exact tower directly', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/mumbai/', sourceLabel: 'HSBC published Mumbai project list', developer: 'https://runwal.com/', note: 'Listed in HSBC’s published project directory updated 11 February 2026. Verify the exact tower/phase and current inventory.' },
  { city: 'Mumbai', name: 'DLF The Westpark — Phase 1', area: 'Oshiwara, Andheri', builder: 'DLF', configurations: 'Confirm directly with developer', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/mumbai/', sourceLabel: 'HSBC published Mumbai project list', developer: 'https://www.dlf.in/', note: 'Listed in HSBC’s published project directory updated 11 February 2026. Current price, phase registration and availability need direct confirmation.' },
  { city: 'Pune', name: 'Lodha Belmondo — Tower 30', area: 'Gahunje, Mawal', builder: 'Lodha Group', configurations: 'Confirm exact unit and configuration', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/pune/', sourceLabel: 'HSBC published Pune project list', developer: 'https://www.lodhagroup.com/', note: 'Listed in HSBC’s published project directory updated 11 February 2026. Confirm exact unit, tower and current availability.' },
  { city: 'Pune', name: 'Gera Island of Joy — Projects B & C', area: 'Wagholi', builder: 'Gera Developments', configurations: 'Confirm exact phase directly', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/pune/', sourceLabel: 'HSBC published Pune project list', developer: 'https://www.gera.in/', note: 'Listed in HSBC’s published project directory updated 11 February 2026. Confirm exact phase registration, price and inventory.' },
  { city: 'Pune', name: '24K Altura — Tower C', area: 'Baner', builder: 'Kolte-Patil Developers', configurations: 'Confirm exact unit directly', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/pune/', sourceLabel: 'HSBC published Pune project list', developer: 'https://www.koltepatil.com/', note: 'Listed in HSBC’s published project directory updated 11 February 2026. Current price and availability are not confirmed.' },
  { city: 'Pune', name: 'Lodha Estillo', area: 'Kharadi', builder: 'Lodha Group', configurations: 'Confirm exact unit directly', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/pune/', sourceLabel: 'HSBC published Pune project list', developer: 'https://www.lodhagroup.com/', note: 'Listed in HSBC’s published project directory updated 11 February 2026. Confirm current inventory and exact registration.' },
  { city: 'Pune', name: 'Birla Punya', area: 'Sangamwadi', builder: 'Birla Estates', configurations: 'Confirm directly with developer', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/pune/', sourceLabel: 'HSBC published Pune project list', developer: 'https://www.birlaestates.com/', note: 'Listed in HSBC’s published project directory updated 11 February 2026. Confirm current pricing, registration and unit availability.' },
  { city: 'Pune', name: 'Mahindra IvyLush — Towers C & D', area: 'Wagholi', builder: 'Mahindra Lifespaces', configurations: 'Confirm exact tower directly', source: 'https://www.hsbc.bank.in/home-loans/list-of-projects/pune/', sourceLabel: 'HSBC published Pune project list', developer: 'https://www.mahindralifespaces.com/', note: 'Listed in HSBC’s published project directory updated 11 February 2026. Verify exact tower, registration and availability.' },
];

const additionalProjects = [
  { city: 'Pune', name: 'Godrej Woodsville', area: 'Hinjewadi Phase 1', builder: 'Godrej Properties', rera: 'P52100046729', source: 'https://www.godrejproperties.com/domestic/landingpage', developer: 'https://www.godrejproperties.com/', note: 'Official developer portfolio lists this Pune project and MahaRERA registration. Verify current phase, price and available units directly.' },
  { city: 'Pune', name: 'Godrej Parkridge', area: 'Kharadi–Manjari Road', builder: 'Godrej Properties', rera: 'P52100028310', source: 'https://www.godrejproperties.com/domestic/landingpage', developer: 'https://www.godrejproperties.com/', note: 'Official developer portfolio lists this Pune project and MahaRERA registration. Verify current phase, price and available units directly.' },
  { city: 'Pune', name: 'Godrej Rejuve', area: 'Keshav Nagar', builder: 'Godrej Properties / Oxford Realty LLP', rera: 'P52100018720', source: 'https://lp.godrejproperties.com/pune/residential/godrej-rejuve/landingpage', developer: 'https://www.godrejproperties.com/', note: 'Developer page identifies the project registration. Confirm current construction status and inventory with the developer.' },
  { city: 'Mumbai / MMR', name: 'The Highlands at Godrej City — Tower 5', area: 'Panvel', builder: 'Caroa Properties LLP / Godrej Properties', rera: 'P52000049669', source: 'https://www.godrejproperties.com/mumbai/residential/the-highlands-at-godrej-city-intl/landingpage', developer: 'https://www.godrejproperties.com/', note: 'Official page identifies Tower 5 and its MahaRERA number. Confirm live availability and pricing directly.' },
  { city: 'Mumbai / MMR', name: 'Godrej Bayview', area: 'Vashi, Navi Mumbai', builder: 'Godrej Properties', rera: 'P51700031726', source: 'https://www.godrejproperties.com/domestic/landingpage', developer: 'https://www.godrejproperties.com/', note: 'Official developer portfolio lists the project registration. Confirm current phase and unit availability directly.' },
  { city: 'Pune', name: 'Lodha One', area: 'Bund Garden Road', builder: 'Lodha Group', rera: 'P52100050987', source: 'https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-one', developer: 'https://www.lodhagroup.com/', note: 'Official Lodha project page provides the MahaRERA registration. Confirm current inventory and commercial terms with the developer.' },
  { city: 'Pune', name: 'Lodha Belmondo', area: 'Gahunje, Mumbai–Pune Expressway', builder: 'Lodha Group', rera: 'P52100020190 / P52100020172', source: 'https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-belmondo', developer: 'https://www.lodhagroup.com/', note: 'Official Lodha project page lists these registrations. Confirm exact tower, unit and availability directly.' },
  { city: 'Mumbai', name: 'Lodha Adrina', area: 'Worli', builder: 'Lodha Group', rera: 'P51900001339 / P51900014937', source: 'https://www.lodhagroup.com/projects/residential-property-in-worli/lodha-adrina', developer: 'https://www.lodhagroup.com/', note: 'Official Lodha page lists registration numbers for the project. Confirm current unit availability and pricing directly.' },
  { city: 'Mumbai', name: 'Lodha Aureus Sewri', area: 'Sewri / Eastern Waterfront', builder: 'Lodha Group', rera: 'PR1170002502863', source: 'https://www.lodhagroup.com/projects/residential-property-in-mumbai/lodha-aureus-sewri', developer: 'https://www.lodhagroup/', note: 'Official Lodha project page displays a registration reference. Verify the exact registration and current status on MahaRERA before relying on it.' },
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
                  <a className="text-xs font-semibold text-slate-600 hover:underline" href={p.developer} target="_blank" rel="noreferrer">Open official developer website ↗</a>
                  <a className="text-xs font-semibold text-slate-600 hover:underline" href={MAHARERA} target="_blank" rel="noreferrer">Search registration on official MahaRERA ↗</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Official developer inventory references</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">More projects from top developer websites</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Project names and registration references below are drawn from official developer pages. This is not a live availability feed. Verify each registration on MahaRERA and confirm price, possession and available units directly.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {additionalProjects.map((p) => (
              <article key={p.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{p.city}</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Review required</span></div>
                <h3 className="mt-4 text-xl font-extrabold text-slate-950">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.builder} · {p.area}</p>
                <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Registration reference</p><p className="mt-1 text-sm font-semibold text-slate-800">{p.rera}</p></div>
                <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{p.note}</p>
                <div className="mt-5 flex flex-col items-start gap-2 border-t border-slate-100 pt-4">
                  <a className="text-sm font-bold text-blue-700 hover:underline" href={p.source} target="_blank" rel="noreferrer">Official project source ↗</a>
                  <a className="text-xs font-semibold text-slate-600 hover:underline" href={p.developer} target="_blank" rel="noreferrer">Developer website ↗</a>
                  <a className="text-xs font-semibold text-slate-600 hover:underline" href={MAHARERA} target="_blank" rel="noreferrer">Verify on MahaRERA ↗</a>
                </div>
              </article>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Developer directory</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Official developer websites</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">These are official developer websites for follow-up checks, not proof of a GoNest partnership or live inventory feed.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {developers.map((d) => <a key={d.name} href={d.url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300"><span className="block font-bold text-slate-900">{d.name}</span><span className="mt-1 block text-xs text-slate-500">{d.city}</span><span className="mt-3 block text-sm font-semibold text-blue-700">Open official website ↗</span></a>)}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-950"><strong>Important:</strong> The project references above come from HSBC’s published approved-project lists, last updated 11 February 2026. HSBC notes that certain towers, wings, floors or units may be excluded and details may have changed. This is not a GoNest partnership, government certification or proof that a unit is available. Confirm exact MahaRERA registration, phase, current price, taxes, possession date and written availability directly before paying or making a decision.</div>
        </section>
      </main>
      <Footer />
    </>
  );
}
