"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight, ArrowRight, BadgeCheck, Bell, Bookmark, Calculator,
  CalendarDays, Check, ChevronDown, Compass, FileCheck2, Heart, Home,
  IndianRupee, MapPin, Menu, MessageCircle, Plus, Search, ShieldCheck,
  SlidersHorizontal, Sparkles, Wallet, X,
} from "lucide-react";

type Journey = "Buy" | "Rent" | "New projects";
type Listing = {
  id: number; title: string; locality: string; city: string; kind: string;
  beds: number; area: number; price: number; monthly?: number; image: string;
  tag: string; status: string; verified: boolean; maintenance: number;
};
const homes: Listing[] = [
  { id: 1, title: "Sunlit 2 BHK in a gated community", locality: "Baner", city: "Pune", kind: "Apartment", beds: 2, area: 782, price: 8900000, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=85", tag: "Good budget fit", status: "Resale · Ready to move", verified: true, maintenance: 4200 },
  { id: 2, title: "Contemporary home near the metro", locality: "Wakad", city: "Pune", kind: "Apartment", beds: 2, area: 805, price: 8250000, image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1000&q=85", tag: "More carpet area", status: "Resale · Ready to move", verified: false, maintenance: 3600 },
  { id: 3, title: "Quiet residence with a large balcony", locality: "Kharadi", city: "Pune", kind: "Apartment", beds: 2, area: 748, price: 9600000, image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&q=85", tag: "Newer building", status: "New construction", verified: true, maintenance: 3900 },
];
const rentals: Listing[] = [
  { id: 4, title: "Bright 2 BHK with balcony", locality: "Baner", city: "Pune", kind: "Apartment", beds: 2, area: 782, price: 0, monthly: 32000, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=85", tag: "Available to enquire", status: "Semi-furnished", verified: true, maintenance: 2500 },
  { id: 5, title: "Modern apartment close to IT parks", locality: "Wakad", city: "Pune", kind: "Apartment", beds: 2, area: 805, price: 0, monthly: 28000, image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1000&q=85", tag: "Lower monthly outlay", status: "Unfurnished", verified: false, maintenance: 1800 },
  { id: 6, title: "Calm community with clubhouse", locality: "Kharadi", city: "Pune", kind: "Apartment", beds: 2, area: 748, price: 0, monthly: 35000, image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&q=85", tag: "Premium amenities", status: "Fully furnished", verified: true, maintenance: 2200 },
];
const projects: Listing[] = [
  { id: 7, title: "A thoughtfully planned 2 BHK", locality: "Hinjawadi", city: "Pune", kind: "New project", beds: 2, area: 760, price: 7800000, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=85", tag: "Request cost sheet", status: "Under construction", verified: false, maintenance: 0 },
  { id: 8, title: "Homes with open green spaces", locality: "Baner", city: "Pune", kind: "New project", beds: 2, area: 810, price: 9200000, image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1000&q=85", tag: "Compare floor plans", status: "New launch", verified: false, maintenance: 0 },
];
const money = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const compact = (n: number) => n >= 10000000 ? "₹" + (n / 10000000).toFixed(2) + " Cr" : "₹" + (n / 100000).toFixed(0) + " L";

export default function DecisionPlatformPreview() {
  const [journey, setJourney] = useState<Journey>("Buy");
  const [query, setQuery] = useState("Pune");
  const [budget, setBudget] = useState(10000000);
  const [beds, setBeds] = useState("2 BHK");
  const [saved, setSaved] = useState<number[]>([1]);
  const [compared, setCompared] = useState<number[]>([1, 2]);
  const [active, setActive] = useState<Listing | null>(homes[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [down, setDown] = useState(20);
  const [deposit, setDeposit] = useState(96000);
  const [brokerage, setBrokerage] = useState(32000);
  const [step, setStep] = useState(1);
  const data = journey === "Rent" ? rentals : journey === "New projects" ? projects : homes;
  const filtered = useMemo(() => data.filter(h => (h.locality.toLowerCase().includes(query.toLowerCase()) || h.city.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase() === "pune") && (journey === "Rent" || h.price <= budget)), [data, query, budget, journey]);
  const selected = active ?? filtered[0] ?? data[0];
  const price = selected?.price ?? 8900000;
  const loan = price * (1 - down / 100);
  const monthlyRate = rate / 1200;
  const months = tenure * 12;
  const emi = loan > 0 ? loan * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1) : 0;
  const totalAcquisition = price + price * 0.07 + 65000 + 25000;
  const upfront = journey === "Rent" ? (selected.monthly ?? 32000) + deposit + brokerage + 12000 : price * down / 100 + price * 0.07 + 90000;
  const recurring = journey === "Rent" ? (selected.monthly ?? 32000) + selected.maintenance : emi + selected.maintenance;
  const compareHomes = data.filter(h => compared.includes(h.id));
  const toggleId = (list: number[], id: number, setter: (v: number[]) => void) => setter(list.includes(id) ? list.filter(x => x !== id) : [...list, id].slice(-3));

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <div className="bg-[#101b31] text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 text-xs sm:px-8">
          <span className="flex items-center gap-2 text-white/75"><ShieldCheck size={14} className="text-emerald-300" /> A clearer way to make your next property decision</span>
          <span className="hidden sm:block text-white/55">Product preview · Illustrative property data</span>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8">
          <a href="/" className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-700 text-white"><Home size={19}/></span><span className="text-xl font-black tracking-tight">GoNest<span className="text-blue-700">.</span></span></a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex"><a href="#discover" className="text-blue-700">Discover</a><a href="#costs">Cost planner</a><a href="#compare">Compare</a><a href="#journey">My journey</a></nav>
          <div className="flex items-center gap-2"><button aria-label="Notifications" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><Bell size={19}/></button><button className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold sm:block">Sign in</button><button className="rounded-full bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800">My workspace</button></div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#101b31]">
        <div className="absolute inset-0 opacity-25" style={{backgroundImage:"radial-gradient(circle at 80% 15%, #60a5fa 0, transparent 28%), radial-gradient(circle at 12% 90%, #2563eb 0, transparent 30%)"}}/>
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100"><Sparkles size={14}/> Your property decision, in one place</div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl">Find a home.<br/><span className="text-blue-300">Know the full picture.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Explore homes, understand every cost, compare your options and keep the next steps moving — all in one workspace.</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200"><span className="flex items-center gap-2"><Check size={15} className="text-emerald-300"/> Transparent cost estimates</span><span className="flex items-center gap-2"><Check size={15} className="text-emerald-300"/> Evidence-led trust signals</span></div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex gap-1 rounded-2xl bg-slate-100 p-1">
              {(["Rent","Buy","New projects"] as Journey[]).map(j=><button key={j} onClick={()=>{setJourney(j);setActive(null)}} className={"flex-1 rounded-xl px-2 py-3 text-xs font-bold transition sm:text-sm "+(journey===j?"bg-white text-blue-700 shadow-sm":"text-slate-500 hover:text-slate-900")}>{j}</button>)}
            </div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Where would you like to be?</label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4"><MapPin className="shrink-0 text-blue-700" size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" placeholder="City, locality, society or landmark"/></div>
            <div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-slate-200 p-3"><label className="text-[11px] font-bold uppercase text-slate-400">Configuration</label><select value={beds} onChange={e=>setBeds(e.target.value)} className="mt-1 w-full bg-transparent text-sm font-bold outline-none"><option>1 BHK</option><option>2 BHK</option><option>3 BHK</option><option>4+ BHK</option></select></div><div className="rounded-2xl border border-slate-200 p-3"><label className="text-[11px] font-bold uppercase text-slate-400">Budget ceiling</label><select value={budget} onChange={e=>setBudget(Number(e.target.value))} className="mt-1 w-full bg-transparent text-sm font-bold outline-none"><option value={8000000}>₹80 lakh</option><option value={10000000}>₹1 crore</option><option value={15000000}>₹1.5 crore</option><option value={25000000}>₹2.5 crore</option></select></div></div>
            <div className="mt-4 flex gap-2"><button onClick={()=>document.getElementById("discover")?.scrollIntoView({behavior:"smooth"})} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-4 text-sm font-bold text-white hover:bg-blue-800"><Search size={17}/> Explore matching homes</button><button onClick={()=>setShowFilters(!showFilters)} className="rounded-2xl border border-slate-200 px-4 text-slate-700 hover:bg-slate-50"><SlidersHorizontal size={18}/></button></div>
            {showFilters&&<div className="mt-3 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-900">Advanced filters preview: carpet area, furnishing, possession, parking, amenities, RERA status and commute. These controls are part of the next connected search implementation.</div>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["Your shortlist",String(saved.length),"Saved homes"],["Compare options",String(compared.length),"Side-by-side"],["Decision progress",step+"/6","Milestones tracked"],["Cost clarity","100%","Visible estimates"]].map(([a,b,c])=><div key={a} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold text-slate-500">{a}</p><div className="mt-1 flex items-end justify-between"><span className="text-3xl font-black tracking-tight">{b}</span><span className="text-xs text-slate-400">{c}</span></div></div>)}
        </div>
      </div>

      <section id="discover" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-8 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Discover · {journey}</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Homes worth a closer look</h2><p className="mt-2 text-sm text-slate-500">Illustrative preview inventory. Live listing availability and prices must come from verified GoNest records.</p></div><button onClick={()=>setShowFilters(!showFilters)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"><SlidersHorizontal size={16}/> Filters <ChevronDown size={15}/></button></div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            {showFilters&&<div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold"><span className="rounded-full bg-blue-50 px-3 py-2 text-blue-800">2 BHK</span><span className="rounded-full bg-slate-100 px-3 py-2">Carpet area 700+ sq ft</span><span className="rounded-full bg-slate-100 px-3 py-2">Verified status</span><span className="rounded-full bg-slate-100 px-3 py-2">Parking</span><span className="rounded-full bg-slate-100 px-3 py-2">Ready to move</span></div>}
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map(h=><article key={h.id} onClick={()=>setActive(h)} className={"group cursor-pointer overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-lg "+(selected.id===h.id?"border-blue-500 ring-2 ring-blue-100":"border-slate-200")}>
                <div className="relative h-48 overflow-hidden bg-slate-200"><img src={h.image} alt="Illustrative residential interior" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-800">{h.tag}</span><button onClick={e=>{e.stopPropagation();toggleId(saved,h.id,setSaved)}} aria-label="Save property" className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-slate-700">{saved.includes(h.id)?<Heart size={17} className="fill-rose-500 text-rose-500"/>:<Heart size={17}/>}</button></div>
                <div className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-extrabold leading-5">{h.title}</h3><p className="mt-1 text-xs text-slate-500">{h.locality}, {h.city}</p></div>{h.verified&&<span title="A verification marker is shown only when evidence is connected" className="flex items-center gap-1 text-[10px] font-bold text-emerald-700"><BadgeCheck size={14}/> Reviewed</span>}</div>
                  <p className="mt-4 text-xl font-black">{journey==="Rent"?money(h.monthly??0)+"/mo":compact(h.price)}</p><div className="mt-2 flex gap-3 text-xs text-slate-500"><span>{h.beds} BHK</span><span>{h.area} sq ft carpet</span><span>{h.kind}</span></div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><button onClick={e=>{e.stopPropagation();toggleId(compared,h.id,setCompared)}} className="text-xs font-bold text-blue-700">{compared.includes(h.id)?"✓ Added to compare":"+ Compare"}</button><button onClick={e=>{e.stopPropagation();setActive(h);document.getElementById("costs")?.scrollIntoView({behavior:"smooth"})}} className="text-xs font-bold text-slate-700">View cost breakdown →</button></div>
                </div></article>)}
            </div>
            {filtered.length===0&&<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No preview homes match these filters. Try a wider budget or locality.</div>}
          </div>
          <aside className="min-h-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-[#e7edf2]">
            <div className="flex items-center justify-between bg-white px-4 py-3"><div><p className="text-sm font-extrabold">Map discovery</p><p className="text-xs text-slate-500">Pune · preview map canvas</p></div><button className="rounded-lg border border-slate-200 p-2"><Compass size={16}/></button></div>
            <div className="relative h-[390px] overflow-hidden" style={{backgroundColor:"#e8eee8",backgroundImage:"linear-gradient(35deg,transparent 47%,#fff 48%,#fff 51%,transparent 52%),linear-gradient(125deg,transparent 44%,#fff 45%,#fff 48%,transparent 49%),linear-gradient(90deg,transparent 48%,#d4e0d6 49%,#d4e0d6 52%,transparent 53%)",backgroundSize:"180px 150px,220px 190px,100% 100%"}}>
              <div className="absolute left-[10%] top-[15%] rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-900">Pashan Lake</div><div className="absolute right-[10%] top-[30%] rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-900">University Road</div><div className="absolute bottom-[18%] left-[18%] rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-600">Baner Road</div>
              {[[27,43,"₹89 L"],[66,58,"₹82.5 L"],[73,24,"₹96 L"],[43,73,"₹32k"]].map(([x,y,label],i)=><button key={i} onClick={()=>setActive(data[i%data.length])} style={{left:x+"%",top:y+"%"}} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#172f56] px-3 py-2 text-xs font-black text-white shadow-lg hover:scale-110">{label}</button>)}
              <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-3 py-2 text-[10px] font-semibold text-slate-600 shadow">Concept map preview · connect live geospatial search for real results</div>
            </div>
          </aside>
        </div>
      </section>

      <section id="costs" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-12 sm:px-8">
        <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Financial clarity</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Know the real cost before you decide</h2><p className="mt-2 text-sm text-slate-500">Selected: {selected.title}. Estimates below are examples, not a legal or lender quote.</p></div>
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-3 text-blue-700"><Calculator size={21}/></span><div><h3 className="font-extrabold">Personalise your estimate</h3><p className="text-xs text-slate-500">Adjust assumptions to understand the range</p></div></div>
            {journey==="Rent"?<div className="space-y-5"><label className="block"><span className="flex justify-between text-sm font-semibold"><span>Refundable security deposit</span><b>{money(deposit)}</b></span><input type="range" min="30000" max="300000" step="5000" value={deposit} onChange={e=>setDeposit(Number(e.target.value))} className="mt-3 w-full accent-blue-700"/></label><label className="block"><span className="flex justify-between text-sm font-semibold"><span>Brokerage (assumption)</span><b>{money(brokerage)}</b></span><input type="range" min="0" max="100000" step="1000" value={brokerage} onChange={e=>setBrokerage(Number(e.target.value))} className="mt-3 w-full accent-blue-700"/></label><div className="rounded-2xl bg-blue-50 p-4 text-xs leading-5 text-blue-900">Agreement, stamp duty, registration, society and utility charges vary by state, term and transaction. Add confirmed quotes before relying on this estimate.</div></div>:<div className="space-y-5"><label className="block"><span className="flex justify-between text-sm font-semibold"><span>Down payment</span><b>{down}%</b></span><input type="range" min="10" max="80" step="5" value={down} onChange={e=>setDown(Number(e.target.value))} className="mt-3 w-full accent-blue-700"/></label><label className="block"><span className="flex justify-between text-sm font-semibold"><span>Illustrative interest rate</span><b>{rate.toFixed(1)}%</b></span><input type="range" min="6" max="14" step=".1" value={rate} onChange={e=>setRate(Number(e.target.value))} className="mt-3 w-full accent-blue-700"/></label><label className="block"><span className="flex justify-between text-sm font-semibold"><span>Loan tenure</span><b>{tenure} years</b></span><input type="range" min="5" max="30" step="1" value={tenure} onChange={e=>setTenure(Number(e.target.value))} className="mt-3 w-full accent-blue-700"/></label></div>}
          </div>
          <div className="rounded-3xl bg-[#12213a] p-5 text-white sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-200">Your estimated commitment</p><h3 className="mt-2 text-3xl font-black">{money(upfront)}</h3><p className="mt-1 text-xs text-slate-300">Estimated initial cash requirement</p></div><span className="rounded-2xl bg-white/10 p-3 text-blue-200"><Wallet size={24}/></span></div>
            <div className="my-6 h-px bg-white/15"/>
            <div className="space-y-3 text-sm"><div className="flex justify-between text-slate-300"><span>{journey==="Rent"?"First month + deposit + brokerage":"Down payment"}</span><b className="text-white">{money(journey==="Rent"?(selected.monthly??32000)+deposit+brokerage:price*down/100)}</b></div><div className="flex justify-between text-slate-300"><span>{journey==="Rent"?"Agreement & move-in estimate":"Taxes & transaction estimate"}</span><b className="text-white">{money(journey==="Rent"?12000:price*.07+90000)}</b></div><div className="flex justify-between border-t border-white/15 pt-3 text-slate-300"><span>Recurring monthly</span><b className="text-white">{money(recurring)}</b></div>{journey!=="Rent"&&<div className="flex justify-between text-slate-300"><span>Estimated loan amount</span><b className="text-white">{money(loan)}</b></div>}</div>
            <div className="mt-6 rounded-2xl bg-white/10 p-4"><div className="flex items-center justify-between"><span className="text-xs text-slate-300">{journey==="Rent"?"12-month estimated outlay":"Total acquisition estimate"}</span><span className="text-lg font-black">{money(journey==="Rent"?recurring*12+upfront:totalAcquisition)}</span></div><p className="mt-2 text-[10px] leading-4 text-slate-300">Illustrative only. Statutory charges, lender terms, brokerage and society charges must be confirmed for the exact property and location.</p></div>
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#12213a] hover:bg-blue-50">Save this estimate <ArrowRight size={16}/></button>
          </div>
        </div>
      </section>

      <section id="compare" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Make a confident choice</p><h2 className="mt-2 text-3xl font-black tracking-tight">Compare your shortlist</h2><p className="mt-2 text-sm text-slate-500">Compare up to three options side by side.</p></div><button onClick={()=>setShowCompare(!showCompare)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold">{showCompare?"Hide comparison":"Open comparison"}</button></div>
        {showCompare&&<div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4 text-xs uppercase text-slate-500">Details</th>{compareHomes.map(h=><th key={h.id} className="p-4 font-extrabold">{h.locality}</th>)}</tr></thead><tbody>{[["Price",h=>journey==="Rent"?money(h.monthly??0)+"/mo":compact(h.price)],["Carpet area",h=>h.area+" sq ft"],["Configuration",h=>h.beds+" BHK"],["Maintenance",h=>money(h.maintenance)+"/mo"],["Status",h=>h.status],["Trust signal",h=>h.verified?"Reviewed":"Review pending"]].map(([label,fn])=><tr key={String(label)} className="border-t border-slate-100"><td className="p-4 font-semibold text-slate-500">{String(label)}</td>{compareHomes.map(h=><td key={h.id} className="p-4 font-semibold">{(fn as (h:Listing)=>string)(h)}</td>)}</tr>)}</tbody></table></div>}
      </section>

      <section id="journey" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-12 sm:px-8">
        <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">My property decision journey</p><h2 className="mt-2 text-3xl font-black tracking-tight">Every next step, clearly organised</h2><p className="mt-2 text-sm text-slate-500">A guided workspace from first shortlist to handover.</p></div>
        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><h3 className="font-extrabold">Your progress</h3><span className="text-xs font-bold text-blue-700">{Math.round(step/6*100)}% complete</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-700 transition-all" style={{width:(step/6*100)+"%"}}/></div><div className="mt-6 space-y-4">{["Define your requirements","Explore matching homes","Shortlist and compare","Schedule property visits","Review documents and costs","Move forward with confidence"].map((s,i)=><button key={s} onClick={()=>setStep(i+1)} className="flex w-full items-center gap-3 text-left"><span className={"grid h-7 w-7 place-items-center rounded-full text-xs font-bold "+(i+1<=step?"bg-blue-700 text-white":"bg-slate-100 text-slate-500")}>{i+1<=step?<Check size={14}/>:i+1}</span><span className={"flex-1 text-sm "+(i+1===step?"font-extrabold":"font-medium text-slate-500")}>{s}</span>{i+1===step&&<span className="text-[10px] font-bold text-blue-700">CURRENT</span>}</button>)}</div></div>
          <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center gap-3"><span className="rounded-xl bg-violet-50 p-3 text-violet-700"><Sparkles size={21}/></span><div><h3 className="font-extrabold">GoNest decision assistant</h3><p className="text-xs text-slate-500">Explainable guidance · evidence before conclusions</p></div></div><div className="mt-5 rounded-2xl bg-slate-50 p-5"><p className="text-sm font-bold">Your current decision snapshot</p><p className="mt-2 text-sm leading-6 text-slate-600">You are exploring a {beds} home in {query || "Pune"}. {journey==="Rent"?"Compare the refundable deposit, recurring rent and move-in charges before arranging a visit.":"Compare the total acquisition estimate, loan assumptions and verified property details — not just the advertised price."}</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase text-slate-400">Information to confirm</p><p className="mt-1 text-xs font-semibold">Ownership / RERA evidence, exact unit, current price and availability</p></div><div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase text-slate-400">Suggested next action</p><p className="mt-1 text-xs font-semibold">Request documents and schedule a property visit</p></div></div></div><div className="mt-4 flex flex-wrap gap-2"><button className="rounded-xl bg-blue-700 px-4 py-3 text-xs font-bold text-white">Build my decision report</button><button className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold">View document checklist</button></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8"><div className="rounded-3xl bg-blue-700 p-7 text-white sm:p-10"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-200">One platform · Every property decision</p><h2 className="mt-2 text-3xl font-black tracking-tight">Your next move starts with clarity.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">From discovery and comparison to visits, verification and transaction tracking.</p></div><button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700">Start exploring <ArrowDownRight size={16}/></button></div></div></section>
      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-3 px-5 py-7 text-xs text-slate-500 sm:px-8"><span>© GoNest · Property decisions, made clearer.</span><span>Preview environment · Demo content is illustrative, not live inventory.</span></div></footer>
    </main>
  );
}
