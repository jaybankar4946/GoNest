"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Award, Building2, Calendar, Check, ChevronDown, ChevronRight, ExternalLink, Layers, MapPin, Search, ShieldCheck, Square, X } from "lucide-react";

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



const architectureImage = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=700&fit=crop&auto=format";

function BuilderBadge({ name, small = false }: { name: string; small?: boolean }) {
  return <div className={`${small ? "h-10 w-10 text-base" : "h-14 w-14 text-xl"} flex shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 font-extrabold text-blue-800`}>{name.charAt(0)}</div>;
}

function BuilderCard({ builder, onClick }: { builder: Builder; onClick: () => void }) {
  const featured = builder.projects[0];
  const reraCount = builder.projects.filter((p) => p.rera).length;
  const cities = [...new Set(builder.projects.map((p) => p.city))];
  return <button onClick={onClick} className="group w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
    <div className="border-b border-gray-50 p-5"><div className="flex items-start gap-4"><BuilderBadge name={builder.name} /><div className="min-w-0 flex-1"><h2 className="font-extrabold leading-tight text-gray-900" style={{fontFamily:"var(--font-manrope), var(--font-display)"}}>{builder.name}</h2><p className="mt-1 text-xs text-gray-500">{builder.city}</p><div className="mt-2 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700"><ShieldCheck className="h-3 w-3"/> Source-linked references</span><span className="text-xs text-gray-400">{builder.projects.length} project references</span></div></div><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-gray-300 group-hover:text-blue-500"/></div></div>
    <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-50">{[{v:builder.projects.length,l:"Projects listed"},{v:reraCount,l:"RERA refs listed"},{v:cities.length,l:"Cities covered"}].map(s=><div key={s.l} className="px-2 py-3 text-center"><p className="text-sm font-extrabold text-gray-900">{s.v}</p><p className="text-xs text-gray-400">{s.l}</p></div>)}</div>
    <div className="p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Featured project reference</p><div className="relative mb-3 h-32 overflow-hidden rounded-xl bg-slate-100"><img src={architectureImage} alt="Illustrative residential architecture, not a project-specific photograph" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"/><span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-700">ILLUSTRATIVE IMAGE</span><div className="absolute bottom-3 left-3 right-3"><p className="text-sm font-bold leading-tight text-white">{featured.name}</p><p className="mt-1 text-xs text-white/80">{featured.area}, {featured.city}</p></div></div><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-sm font-extrabold text-gray-900">{featured.rera ? "Registration reference listed" : "Registration not listed here"}</p><p className="text-xs text-gray-500">{builder.projects.length} references · confirm current details</p></div><span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600">View projects <ArrowRight className="h-3.5 w-3.5"/></span></div></div>
    <div className="px-4 pb-4"><div className="flex flex-wrap gap-1.5">{cities.map(c=><span key={c} className="rounded-full border border-gray-100 bg-gray-50 px-2 py-0.5 text-xs text-gray-500">{c}</span>)}</div></div>
  </button>;
}

function BuilderDetail({builder,onClose}:{builder:Builder;onClose:()=>void}) {
  const [active,setActive]=useState(0);
  const project=builder.projects[active];
  const reraCount=builder.projects.filter(p=>p.rera).length;
  return <div className="fixed inset-0 z-50 flex"><button aria-label="Close project details" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm"/><section role="dialog" aria-modal="true" aria-labelledby="builder-detail-title" className="relative ml-auto h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 md:px-6"><div className="flex min-w-0 items-center gap-3"><BuilderBadge name={builder.name} small/><div><h2 id="builder-detail-title" className="font-extrabold text-gray-900">{builder.name}</h2><p className="text-xs text-gray-500">{builder.city}</p></div></div><button aria-label="Close" onClick={onClose} className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"><X className="h-4 w-4"/></button></header>
    <div className="p-5 md:p-6"><div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[{v:builder.projects.length,l:"Project refs",I:Layers},{v:reraCount,l:"RERA refs listed",I:ShieldCheck},{v:[...new Set(builder.projects.map(p=>p.city))].length,l:"Cities",I:MapPin},{v:"Live check",l:"Availability",I:Calendar}].map(s=><div key={s.l} className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-center"><s.I className="mx-auto mb-1 h-4 w-4 text-gray-400"/><p className="text-sm font-extrabold text-gray-900">{s.v}</p><p className="text-xs text-gray-400">{s.l}</p></div>)}</div>
    <p className="mb-5 text-sm leading-6 text-gray-600">Explore source-linked project references for {builder.name}. Current inventory, pricing, possession timelines and registration status must be confirmed directly.</p>
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{builder.projects.map((p,i)=><button key={p.name} onClick={()=>setActive(i)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${active===i?"bg-blue-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{p.name}</button>)}</div>
    {project&&<article className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm"><div className="relative h-48 bg-slate-100"><img src={architectureImage} alt="Illustrative residential architecture, not a project-specific photograph" className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/><span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700">ILLUSTRATIVE IMAGE</span><div className="absolute bottom-3 left-4 right-4"><h3 className="text-xl font-extrabold text-white">{project.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-white/80"><MapPin className="h-4 w-4"/>{project.area}, {project.city}</p></div></div><div className="p-5"><div className="mb-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-gray-50 p-3"><MapPin className="mb-1 h-4 w-4 text-gray-400"/><p className="text-xs text-gray-500">Location</p><p className="text-sm font-bold text-gray-900">{project.area}</p></div><div className="rounded-xl bg-gray-50 p-3"><ShieldCheck className="mb-1 h-4 w-4 text-gray-400"/><p className="text-xs text-gray-500">Registration reference</p><p className="break-words text-sm font-bold text-gray-900">{project.rera??"Not listed in this record"}</p></div><div className="rounded-xl bg-gray-50 p-3"><Square className="mb-1 h-4 w-4 text-gray-400"/><p className="text-xs text-gray-500">Availability</p><p className="text-sm font-bold text-gray-900">Confirm with developer</p></div></div><div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3"><p className="text-xs font-bold text-blue-800">Source note</p><p className="mt-1 text-sm leading-5 text-blue-700">{project.note}</p></div><div className="flex flex-col gap-2 sm:flex-row"><a href={project.source} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">View source <ExternalLink className="h-4 w-4"/></a><a href={project.developer} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white hover:bg-blue-700">Visit developer <ArrowRight className="h-4 w-4"/></a></div></div></article>}
    </div></section></div>;
}

export default function NewProjectsPage() {
  const [city,setCity]=useState("All Cities");
  const [registration,setRegistration]=useState("All registrations");
  const [query,setQuery]=useState("");
  const [selected,setSelected]=useState<Builder|null>(null);
  const filtered=useMemo(()=>builders.filter(builder=>{
    const matchesCity=city==="All Cities"||builder.projects.some(p=>p.city===city);
    const matchesRegistration=registration==="All registrations"||builder.projects.some(p=>registration==="Registration reference listed"?Boolean(p.rera):!p.rera);
    const haystack=[builder.name,builder.city,...builder.projects.flatMap(p=>[p.name,p.area,p.city])].join(" ").toLowerCase();
    return matchesCity&&matchesRegistration&&haystack.includes(query.toLowerCase().trim());
  }),[city,registration,query]);
  const projectCount=builders.reduce((n,b)=>n+b.projects.length,0);
  const registrationCount=builders.reduce((n,b)=>n+b.projects.filter(p=>p.rera).length,0);
  const clear=()=>{setQuery("");setCity("All Cities");setRegistration("All registrations");};

  return <><main className="min-h-screen bg-slate-50 text-slate-900">
    <section className="bg-gray-950 py-12 text-white md:py-14"><div className="mx-auto max-w-7xl px-4 md:px-6"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-200"><Building2 className="h-3.5 w-3.5"/> New Projects · Mumbai & Pune</div><div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]"><div><h1 className="text-4xl font-extrabold tracking-tight md:text-5xl" style={{fontFamily:"var(--font-manrope), var(--font-display)",letterSpacing:"-0.03em"}}>Top Developers.<br/>Verified Project References.</h1><p className="mt-4 max-w-xl text-base leading-7 text-gray-300">Explore residential project references from established developers across Mumbai and Pune. Review source links and confirm registration, pricing, possession and live inventory before making a decision.</p></div><div className="grid grid-cols-2 gap-3">{[{v:builders.length,l:"Developers listed"},{v:projectCount,l:"Project references"},{v:registrationCount,l:"RERA refs listed"},{v:2,l:"Launch cities"}].map(s=><div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-extrabold">{s.v}</p><p className="mt-1 text-xs text-gray-400">{s.l}</p></div>)}</div></div></div></section>
    <section className="sticky top-[68px] z-20 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-6"><label className="relative min-w-[220px] flex-1 sm:flex-none"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search developer, project or locality…" aria-label="Search projects" className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-64"/></label>{[{value:city,set:setCity,options:cityOptions,label:"City"},{value:registration,set:setRegistration,options:["All registrations","Registration reference listed","No registration reference listed"],label:"Registration"}].map(f=><label key={f.label} className="relative"><span className="sr-only">{f.label}</span><select value={f.value} onChange={e=>f.set(e.target.value)} className="max-w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm font-semibold outline-none focus:border-blue-400">{f.options.map(o=><option key={o}>{o}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"/></label>)}{(query||city!=="All Cities"||registration!=="All registrations")&&<button onClick={clear} className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"><X className="h-3.5 w-3.5"/>Clear</button>}<span className="text-sm font-medium text-gray-500 sm:ml-auto">{filtered.length} developers found</span></div></section>
    <section className="mx-auto max-w-7xl px-4 py-9 md:px-6 md:py-12">{filtered.length===0?<div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center"><Building2 className="mx-auto mb-4 h-14 w-14 text-gray-200"/><p className="mb-2 text-xl font-bold text-gray-500">No developers match</p><p className="mb-4 text-sm text-gray-400">Try a different search or filter.</p><button onClick={clear} className="text-sm font-semibold text-blue-600 hover:underline">Clear filters</button></div>:<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map(builder=><BuilderCard key={builder.name} builder={builder} onClick={()=>setSelected(builder)}/>)}</div>}</section>
    <section className="border-t border-gray-100 bg-white py-12 md:py-14"><div className="mx-auto max-w-7xl px-4 md:px-6"><div className="mx-auto max-w-3xl text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50"><Award className="h-7 w-7 text-emerald-600"/></div><h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">Confirm the details before you decide.</h2><p className="mt-2 text-sm leading-6 text-gray-500">Project references are not proof of current inventory or active registration. Check each phase on the official MahaRERA portal and confirm current pricing, possession timelines and available units directly with the developer.</p><a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100">Verify on MahaRERA <ExternalLink className="h-4 w-4"/></a></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["Source links provided","Developer website linked","Registration shown only when listed","Availability must be confirmed"].map(item=><div key={item} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm font-medium text-gray-700"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100"><Check className="h-3.5 w-3.5 text-emerald-700"/></span>{item}</div>)}</div></div></section>
  </main>{selected&&<BuilderDetail builder={selected} onClose={()=>setSelected(null)}/>}</>;
}
