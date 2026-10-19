"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Check, ChevronDown, ChevronRight, ExternalLink, MapPin, Search, ShieldCheck, X } from "lucide-react";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

type Project = { name: string; city: string; area: string; rera?: string; source: string; developer: string; note: string };
type Builder = { name: string; city: string; url: string; projects: Project[] };

const mumbaiSource = "https://www.hsbc.bank.in/home-loans/list-of-projects/mumbai/";
const puneSource = "https://www.hsbc.bank.in/home-loans/list-of-projects/pune/";
const godrej = "https://www.godrejproperties.com/";
const lodha = "https://www.lodhagroup.com/";

const builders: Builder[] = [
  { name: "Godrej Properties", city: "Mumbai & Pune", url: godrej, projects: [
    { name: "Godrej Ascend — Phases 2, 3 & 4", city: "Mumbai", area: "Kolshet Road, Thane", source: mumbaiSource, developer: godrej, note: "Listed in a published lender project directory. Confirm the exact phase, MahaRERA registration, current pricing and availability directly." },
    { name: "Godrej Woodsville", city: "Pune", area: "Hinjewadi Phase 1", rera: "P52100046729", source: godrej, developer: godrej, note: "Developer portfolio reference. Confirm current phase, pricing and available units directly." },
    { name: "Godrej Parkridge", city: "Pune", area: "Kharadi–Manjari Road", rera: "P52100028310", source: godrej, developer: godrej, note: "Developer portfolio reference. Confirm current phase, pricing and available units directly." },
    { name: "Godrej Bayview", city: "Mumbai", area: "Vashi, Navi Mumbai", rera: "P51700031726", source: godrej, developer: godrej, note: "Developer portfolio reference. Confirm current phase and live inventory directly." },
  ]},
  { name: "Lodha Group", city: "Mumbai & Pune", url: lodha, projects: [
    { name: "Lodha Belmondo", city: "Pune", area: "Gahunje, Mumbai–Pune Expressway", rera: "P52100020190 / P52100020172", source: "https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-belmondo", developer: lodha, note: "Official project page reference. Confirm the exact tower, unit, pricing and availability directly." },
    { name: "Lodha One", city: "Pune", area: "Bund Garden Road", rera: "P52100050987", source: "https://www.lodhagroup.com/projects/residential-property-in-pune/lodha-one", developer: lodha, note: "Official project page reference. Confirm current inventory and commercial terms directly." },
    { name: "Lodha Adrina", city: "Mumbai", area: "Worli", rera: "P51900001339 / P51900014937", source: "https://www.lodhagroup.com/projects/residential-property-in-worli/lodha-adrina", developer: lodha, note: "Official project page reference. Confirm current unit availability and pricing directly." },
  ]},
  { name: "Keystone Realtors (Rustomjee)", city: "Mumbai / MMR", url: "https://www.rustomjee.com/", projects: [
    { name: "Balmoral", city: "Mumbai", area: "Chembur", source: mumbaiSource, developer: "https://www.rustomjee.com/", note: "Listed in a published lender project directory. Confirm the exact project phase, registration and availability directly." },
  ]},
  { name: "Kalpataru", city: "Mumbai / MMR", url: "https://www.kalpataru.com/", projects: [
    { name: "Kalpataru One", city: "Mumbai", area: "Worli", source: mumbaiSource, developer: "https://www.kalpataru.com/", note: "Listed in a published lender project directory. Current pricing and available units are not confirmed." },
  ]},
  { name: "Runwal Group", city: "Mumbai / MMR", url: "https://runwal.com/", projects: [
    { name: "Runwal Avenue — Towers J–N", city: "Mumbai", area: "Kanjurmarg East", source: mumbaiSource, developer: "https://runwal.com/", note: "Listed in a published lender project directory. Verify the exact tower/phase and current inventory." },
  ]},
  { name: "DLF", city: "Mumbai", url: "https://www.dlf.in/", projects: [
    { name: "DLF The Westpark — Phase 1", city: "Mumbai", area: "Oshiwara, Andheri", source: mumbaiSource, developer: "https://www.dlf.in/", note: "Listed in a published lender project directory. Current price, phase registration and availability need direct confirmation." },
  ]},
  { name: "Kolte-Patil Developers", city: "Pune & Mumbai", url: "https://www.koltepatil.com/", projects: [
    { name: "24K Altura — Tower C", city: "Pune", area: "Baner", source: puneSource, developer: "https://www.koltepatil.com/", note: "Listed in a published lender project directory. Confirm the exact unit and current availability directly." },
  ]},
  { name: "Gera Developments", city: "Pune", url: "https://www.gera.in/", projects: [
    { name: "Gera Island of Joy — Projects B & C", city: "Pune", area: "Wagholi", source: puneSource, developer: "https://www.gera.in/", note: "Listed in a published lender project directory. Confirm exact phase registration, price and inventory." },
  ]},
  { name: "Mahindra Lifespaces", city: "Mumbai & Pune", url: "https://www.mahindralifespaces.com/", projects: [
    { name: "Mahindra IvyLush — Towers C & D", city: "Pune", area: "Wagholi", source: puneSource, developer: "https://www.mahindralifespaces.com/", note: "Listed in a published lender project directory. Verify the exact tower, registration and availability." },
  ]},
  { name: "Birla Estates", city: "Pune", url: "https://www.birlaestates.com/", projects: [
    { name: "Birla Punya", city: "Pune", area: "Sangamwadi", source: puneSource, developer: "https://www.birlaestates.com/", note: "Listed in a published lender project directory. Confirm current pricing, registration and unit availability." },
  ]},
];

const cityOptions = ["All Cities", "Mumbai", "Pune"];

export default function NewProjectsPage() {
  const [city, setCity] = useState("All Cities");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Builder | null>(null);
  const filtered = useMemo(() => builders.filter((builder) => {
    const matchesCity = city === "All Cities" || builder.projects.some((project) => project.city === city);
    const haystack = [builder.name, builder.city, ...builder.projects.flatMap((project) => [project.name, project.area, project.city])].join(" ").toLowerCase();
    return matchesCity && haystack.includes(query.toLowerCase().trim());
  }), [city, query]);
  const projectCount = builders.reduce((total, builder) => total + builder.projects.length, 0);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-200">
              <Building2 className="h-4 w-4" /> New Projects · Mumbai & Pune
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">Top Developers.<br />Projects Worth Exploring.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Explore residential projects from established developers across Mumbai and Pune. Review available source references and confirm registration, pricing, possession and live inventory before enquiring.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{ value: String(builders.length), label: "Developers listed" }, { value: String(projectCount), label: "Project references" }, { value: "2", label: "Launch cities" }, { value: "Source-linked", label: "Research standard" }].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-extrabold md:text-2xl">{stat.value}</p><p className="mt-1 text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
            <label className="relative min-w-[220px] flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search developer, project or area" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select value={city} onChange={(event) => setCity(event.target.value)} className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm font-semibold outline-none focus:border-blue-400">
                {cityOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </label>
            <span className="text-sm text-slate-500 md:ml-auto">{filtered.length} developers found</span>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-9 md:px-6 md:py-12">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-3 text-lg font-bold">No matching developers</h2>
              <button onClick={() => { setQuery(""); setCity("All Cities"); }} className="mt-3 text-sm font-semibold text-blue-700 hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((builder) => (
                <article key={builder.name} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-extrabold text-blue-800">{builder.name.charAt(0)}</div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-extrabold leading-tight">{builder.name}</h2>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" />{builder.city}</p>
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"><ShieldCheck className="h-3.5 w-3.5" /> Source-linked references</span>
                      </div>
                      <ChevronRight className="mt-1 h-5 w-5 text-slate-300 transition group-hover:text-blue-600" />
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Project references · {builder.projects.length}</p>
                    <div className="space-y-3">
                      {builder.projects.slice(0, 2).map((project) => (
                        <div key={project.name} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                          <p className="text-sm font-bold leading-snug">{project.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{project.area}, {project.city}</p>
                          {project.rera && <p className="mt-2 text-xs text-emerald-700">Registration reference: {project.rera}</p>}
                        </div>
                      ))}
                      {builder.projects.length > 2 && <p className="text-xs text-slate-500">+ {builder.projects.length - 2} more project references</p>}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <a href={builder.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900">Developer website <ExternalLink className="h-3.5 w-3.5" /></a>
                      <button onClick={() => setSelected(builder)} className="inline-flex items-center gap-1 rounded-xl bg-blue-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-800">View projects <ArrowRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-slate-200 bg-white py-10 md:py-12">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-xl font-extrabold md:text-2xl">Check the details before making a decision.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">A project directory or lender listing is not proof of live inventory or current RERA status. Confirm each phase on the official MahaRERA portal and ask the developer to verify current pricing, possession timelines and available units.</p>
              <a href="https://www.maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100">Check MahaRERA <ExternalLink className="h-4 w-4" /></a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["Source references included", "Developer links available", "Registration shown only when listed", "Availability requires confirmation"].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-medium text-slate-700"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100"><Check className="h-3.5 w-3.5 text-emerald-700" /></span>{item}</div>)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button aria-label="Close project details" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <section role="dialog" aria-modal="true" aria-labelledby="projects-panel-title" className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 md:px-6">
              <div><h2 id="projects-panel-title" className="text-lg font-extrabold">{selected.name}</h2><p className="text-xs text-slate-500">{selected.city}</p></div>
              <button aria-label="Close" onClick={() => setSelected(null)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200"><X className="h-4 w-4" /></button>
            </header>
            <div className="space-y-4 p-5 md:p-6">
              {selected.projects.map((project) => (
                <article key={project.name} className="rounded-2xl border border-slate-200 p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold">{project.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4" />{project.area}, {project.city}</p></div><Building2 className="h-5 w-5 shrink-0 text-slate-400" /></div>
                  {project.rera && <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3"><p className="text-xs font-bold text-emerald-900">Registration reference</p><p className="mt-1 text-sm text-emerald-800">{project.rera}</p><p className="mt-1 text-xs text-emerald-700">Please verify the registration and its current status on MahaRERA.</p></div>}
                  <p className="mt-3 text-sm leading-6 text-slate-600">{project.note}</p>
                  <div className="mt-4 flex flex-wrap gap-2"><a href={project.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">View source <ExternalLink className="h-3.5 w-3.5" /></a><a href={project.developer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800">Contact developer <ArrowRight className="h-3.5 w-3.5" /></a></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
