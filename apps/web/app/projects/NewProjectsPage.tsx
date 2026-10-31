"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { ProjectUnitInventoryCard } from "./ProjectUnitInventoryCard";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Building2, CalendarDays, CheckCircle2, ExternalLink, Filter, MapPin, Search, ShieldCheck, X } from "lucide-react";

type Project = {
  id: string; official_name: string; public_address: string | null; landmark: string | null; neighbourhood: string | null; pincode: string | null; rera_number: string | null;
  project_category: string; construction_status: string; launch_date: string | null; expected_possession_date: string | null;
  total_units: number | null; configurations: unknown; published_price_min_inr: number | null; published_price_max_inr: number | null;
  price_observed_at: string | null; official_project_url: string | null; brochure_url: string | null;
  cover_image_url: string | null; gallery_image_urls: string[]; image_source_url: string | null;
  inventory_status: string; inventory_verified_at: string | null; verification_status: string; is_sample: boolean;
  developer?: { operating_brand?: string | null; website_url?: string | null } | null;
  city?: { name?: string } | null; locality?: { name?: string } | null;
};
type Unit = { id: string; unit_reference: string | null; tower_name: string | null; floor_number: number | null; configuration: string | null; carpet_area_sqft: number | null; asking_price_inr: number | null; additional_charges_inr: number | null; availability_status: string; observed_at: string; source_url: string | null; verified_by: string | null };

const MAHARERA = "https://maharera.maharashtra.gov.in/";
const money = (n: number | null | undefined) => n == null ? "Ask for current pricing" : n >= 10000000 ? `₹${(n / 10000000).toFixed(2).replace(/0+$/,"").replace(/\.$/,"")} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(1).replace(/\.0$/,"")} L` : `₹${n.toLocaleString("en-IN")}`;
const dateLabel = (s: string | null | undefined) => s ? new Date(s).toLocaleDateString("en-IN",{month:"short",year:"numeric"}) : "Not provided";
const isFresh = (s: string | null | undefined) => !!s && Date.now() - new Date(s).getTime() <= 14 * 86400000;

export default function NewProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All Cities");
  const [registration, setRegistration] = useState("All projects");
  const [builder, setBuilder] = useState("All builders");
  const [selected, setSelected] = useState<Project | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [requestType, setRequestType] = useState<"enquiry" | "site_visit">("enquiry");
  const [form, setForm] = useState({ name:"", phone:"", email:"", date:"", time:"", message:"", consent:false });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true); setLoadError("");
      const { data, error } = await supabase.from("real_estate_projects")
        .select("id,official_name,public_address,landmark,neighbourhood,pincode,rera_number,project_category,construction_status,launch_date,expected_possession_date,total_units,configurations,published_price_min_inr,published_price_max_inr,price_observed_at,official_project_url,brochure_url,cover_image_url,gallery_image_urls,image_source_url,inventory_status,inventory_verified_at,verification_status,is_sample,developer:developers(operating_brand,website_url),city:cities(name),locality:localities(name)")
        .eq("is_sample", false).in("verification_status", ["pending","verified"]).not("official_project_url","is",null)
        .order("official_name");
      if (!live) return;
      if (error) setLoadError("Project data could not be loaded right now. Please try again shortly.");
      else {
        const records = ((data ?? []) as unknown as Project[]).map((project) => ({
          ...project,
          developer: Array.isArray(project.developer) ? project.developer[0] ?? null : project.developer,
          city: Array.isArray(project.city) ? project.city[0] ?? null : project.city,
          locality: Array.isArray(project.locality) ? project.locality[0] ?? null : project.locality,
        }));
        setProjects(records);
      }
      setLoading(false);
    })();
    return () => { live = false; };
  }, []);

  useEffect(() => {
    let live = true;
    if (!selected) { setUnits([]); return; }
    setUnitsLoading(true); setFeedback("");
    (async () => {
      const { data, error } = await supabase.from("project_inventory_observations")
        .select("id,unit_reference,tower_name,floor_number,configuration,carpet_area_sqft,asking_price_inr,additional_charges_inr,availability_status,observed_at,source_url,verified_by")
        .eq("project_id", selected.id).eq("is_sample", false).eq("availability_status","available")
        .not("source_url","is",null).gte("observed_at",new Date(Date.now()-14*86400000).toISOString()).order("asking_price_inr");
      if (!live) return;
      if (!error) setUnits((data ?? []) as Unit[]);
      else setUnits([]);
      setUnitsLoading(false);
    })();
    return () => { live = false; };
  }, [selected]);

  const cities = useMemo(() => ["All Cities", ...Array.from(new Set(projects.map(p => p.city?.name).filter(Boolean) as string[])).sort()], [projects]);
  const builders = useMemo(() => ["All builders", ...Array.from(new Set(projects.map(p => p.developer?.operating_brand).filter(Boolean) as string[])).sort()], [projects]);
  const filtered = useMemo(() => projects.filter(p => {
    const haystack = [p.official_name,p.developer?.operating_brand,p.city?.name,p.locality?.name,p.public_address,p.landmark,p.neighbourhood,p.pincode,p.rera_number].filter(Boolean).join(" ").toLowerCase();
    const matchCity = city === "All Cities" || p.city?.name === city || (city === "Mumbai" && /thane|navi mumbai|mumbai/i.test(haystack));
    const matchRegistration = registration === "All projects" || (registration === "Registration listed" ? !!p.rera_number : !p.rera_number);
    const matchBuilder = builder === "All builders" || p.developer?.operating_brand === builder;
    return matchCity && matchRegistration && matchBuilder && haystack.includes(query.trim().toLowerCase());
  }), [projects, city, registration, builder, query]);

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSending(true); setFeedback("");
    try {
      const { data, error } = await supabase.rpc("submit_project_enquiry", {
        p_project_id:selected.id, p_type:requestType, p_name:form.name, p_phone:form.phone,
        p_email:form.email || null, p_date:requestType === "site_visit" ? form.date : null,
        p_time:requestType === "site_visit" ? form.time || null : null,
        p_message:form.message || null, p_consent:form.consent
      });
      if (error) throw error;
      const result = data as { reference?: string; status?: string };
      setFeedback(`Request received. Reference: ${result.reference ?? "GoNest"} . Our team will follow up to confirm project details and, for visits, the slot.`);
      setForm({name:"",phone:"",email:"",date:"",time:"",message:"",consent:false});
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "We couldn't submit this request. Please try again.");
    } finally { setSending(false); }
  }

  const availableUnits = units.filter(u => u.availability_status === "available" && isFresh(u.observed_at) && !!u.source_url && !!u.verified_by && !!selected && selected.verification_status === "verified" && selected.inventory_status === "verified_available" && isFresh(selected.inventory_verified_at));
  const verifiedInventory = !!selected && selected.verification_status === "verified" && selected.inventory_status === "verified_available" && isFresh(selected.inventory_verified_at);
  const publishedConfigurations = Array.isArray(selected?.configurations) ? selected.configurations.filter((item: any) => {
    const label = typeof item === "string" ? item : item?.label || item?.configuration || item?.name || "";
    return typeof label === "string" && /\\b(BHK|bed|duplex|villa|penthouse|studio|plot)\\b/i.test(label);
  }).map((item: any) => typeof item === "string" ? { label: item } : item) : [];


  return <>
    <Nav />
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-blue-700"><Building2 className="h-4 w-4"/> Multi-builder project directory · India</div>
          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight md:text-5xl">Explore New Projects</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">Explore projects across listed developers. Review sourced project details and request current inventory or a site visit. Availability is confirmed only when recent, source-linked inventory evidence is present.</p>
          <div className="mt-7 grid gap-3 md:grid-cols-[1fr_190px_210px_220px]">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><Search className="h-5 w-5 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search project, developer, locality, neighbourhood, landmark, PIN or RERA…" className="w-full bg-transparent text-sm outline-none"/></label>
            <select value={city} onChange={e=>setCity(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">{cities.map(c=><option key={c}>{c}</option>)}</select>
            <select value={registration} onChange={e=>setRegistration(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"><option>All projects</option><option>Registration listed</option><option>Registration not listed</option></select>
            <select value={builder} onChange={e=>setBuilder(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">{builders.map(b=><option key={b}>{b}</option>)}</select>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">{projects.length} listed project records</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">{builders.length - 1} developers</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">{projects.filter(p=>p.verification_status==="verified").length} project records verified</span>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-800">Unit availability requires recent evidence</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading live project data…</div>
        : loadError ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">{loadError}</div>
        : filtered.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300"/><h2 className="font-bold">No projects match these filters</h2><p className="mt-1 text-sm text-slate-500">Try a broader search or choose all cities.</p><button onClick={()=>{setCity("All Cities");setRegistration("All projects");setBuilder("All builders");setQuery("");}} className="mt-4 font-semibold text-blue-700">Clear filters</button></div>
        : <><div className="mb-4 flex items-center justify-between"><p className="text-sm text-slate-600"><strong>{filtered.length}</strong> projects found</p><p className="text-xs text-slate-500">Project records are not a guarantee of current inventory</p></div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map(p=>{
            const verified = p.verification_status==="verified" && p.inventory_status==="verified_available" && isFresh(p.inventory_verified_at);
            const developer = p.developer?.operating_brand || "Developer details pending";
            const location = [p.locality?.name,p.city?.name].filter(Boolean).join(", ") || p.public_address || "Location details pending";
            const configurations = Array.isArray(p.configurations) ? p.configurations.map((x:any)=>typeof x==="string"?x:x?.label||x?.configuration).filter((label:any)=>typeof label==="string" && /\\b(BHK|bed|duplex|villa|plot|studio)\\b/i.test(label)).join(" · ") : "";
            return <article key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
                {p.cover_image_url ? <img src={p.cover_image_url} alt={p.official_name + " official project image"} loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"/> : <div className="flex h-full items-center justify-center"><Building2 className="h-12 w-12 text-slate-300"/></div>}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700">{p.cover_image_url ? "PROJECT GALLERY" : "IMAGE PENDING"}</span>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{developer}</p>
                <h2 className="mt-1 text-lg font-extrabold leading-snug">{p.official_name}</h2>
                <p className="mt-2 flex items-start gap-2 text-sm text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0"/>{location}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Price range</p><p className="mt-1 text-sm font-bold">{p.published_price_min_inr == null && p.published_price_max_inr == null ? "Request current quote" : p.published_price_min_inr != null && p.published_price_max_inr == null ? `From ${money(p.published_price_min_inr)}` : p.published_price_min_inr == null && p.published_price_max_inr != null ? `Up to ${money(p.published_price_max_inr)}` : `${money(p.published_price_min_inr)} – ${money(p.published_price_max_inr)}`}</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Possession</p><p className="mt-1 text-sm font-bold">{dateLabel(p.expected_possession_date)}</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Configurations</p><p className="mt-1 text-sm font-bold">{configurations || "Confirm with developer"}</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">MahaRERA reference</p><p className="mt-1 break-words text-sm font-bold">{p.rera_number || "Tower-specific check required"}</p></div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4"/>{p.verification_status==="verified"?"GoNest project record verified":"Source-linked record · details need confirmation"}</div>
                <div className="mt-5 flex gap-2">
                  <button onClick={()=>router.push(`/projects/${p.id}`)} className="flex-1 rounded-xl bg-blue-700 px-3 py-3 text-sm font-bold text-white hover:bg-blue-800">View details & enquire <ArrowRight className="ml-1 inline h-4 w-4"/></button>
                  {p.official_project_url && <a href={p.official_project_url} target="_blank" rel="noreferrer" aria-label="Open official developer project page" className="flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-700 hover:bg-slate-50"><ExternalLink className="h-4 w-4"/></a>}
                </div>
              </div>
            </article>;
          })}</div></>}
      </section>
      <section className="border-t border-slate-200 bg-white py-10"><div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 md:px-6">
        {[["Official source links","Open developer pages to review their current project information."],["MahaRERA check","Verify the exact project and phase on the official state portal."],["Availability transparency","Only recent, sourced, verified unit records qualify as available on GoNest."]].map(([title,desc])=><div key={title} className="rounded-xl border border-slate-200 p-4"><CheckCircle2 className="mb-2 h-5 w-5 text-emerald-600"/><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p></div>)}
        <a href={MAHARERA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 sm:col-span-3">Verify on MahaRERA <ExternalLink className="h-4 w-4"/></a>
      </div></section>
    </main>
    <Footer />
    {selected && <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close project details" onClick={()=>setSelected(null)} className="absolute inset-0 bg-slate-950/50"/>
      <section role="dialog" aria-modal="true" aria-labelledby="project-detail-title" className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5"><div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">{selected.developer?.operating_brand || "Project details"}</p><h2 id="project-detail-title" className="mt-1 text-xl font-extrabold">{selected.official_name}</h2></div><button onClick={()=>setSelected(null)} className="rounded-full bg-slate-100 p-2" aria-label="Close"><X className="h-5 w-5"/></button></header>
        <div className="space-y-5 p-5 md:p-6">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4"/>{[selected.locality?.name,selected.city?.name].filter(Boolean).join(", ") || selected.public_address || "Location to be confirmed"}</p><p className="mt-2 text-sm text-slate-600">Project data shown here is limited to recorded source information. Ask the developer to confirm the exact phase, live unit inventory, full price sheet and possession terms.</p>
            <div className="mt-3 flex flex-wrap gap-2">{selected.official_project_url&&<a className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold" href={selected.official_project_url} target="_blank" rel="noreferrer">Official project page <ExternalLink className="ml-1 inline h-3.5 w-3.5"/></a>}<a className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold" href={MAHARERA} target="_blank" rel="noreferrer">MahaRERA search <ExternalLink className="ml-1 inline h-3.5 w-3.5"/></a>{selected.brochure_url&&<a className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold" href={selected.brochure_url} target="_blank" rel="noreferrer">Brochure <ExternalLink className="ml-1 inline h-3.5 w-3.5"/></a>}</div>
          </div>
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-extrabold">Published home configurations</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">Not live availability</span></div>
            <p className="mt-1 text-sm text-slate-500">These are configurations and plan details recorded from project sources. A configuration is not an available apartment; confirm the selected tower, approved carpet area and current quote with the builder.</p>
            {publishedConfigurations.length ? <div className="mt-3 grid gap-3">{publishedConfigurations.map((item:any,index:number)=>{
              const label = item.label || item.configuration || item.name || "Published configuration";
              const tower = item.tower || item.tower_name || null;
              const rera = item.rera_number || null;
              const areas = item.rera_carpet_area_sqft ?? item.floor_plan_carpet_area_sqft ?? item.carpet_area_sqft ?? item.developer_published_area_sqft ?? item.developer_published_unit_plan_size_sqft ?? null;
              const areaLabel = item.rera_carpet_area_sqft != null ? "RERA carpet area" : item.floor_plan_carpet_area_sqft != null ? "Floor-plan area (basis per source)" : item.carpet_area_sqft != null ? "Recorded carpet area" : areas != null ? "Developer-published area (basis to confirm)" : null;
              const areaValues = Array.isArray(areas) ? areas : areas == null ? [] : [areas];
              const source = item.floor_plan_source || item.source_url || item.source || null;
              const note = item.area_note || item.source_note || item.price_note || item.note || null;
              const priceFrom = item.price_from_inr || null;
              return <article key={label+"-"+index} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-slate-900">{label}</p>{tower && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{tower}</span>}</div>
                {areaValues.length>0 && areaLabel && <p className="mt-2 text-sm text-slate-700"><span className="font-semibold">{areaLabel}:</span> {areaValues.join(" – ")} sq ft</p>}
                {item.unit_types && Array.isArray(item.unit_types) && <p className="mt-2 text-sm text-slate-600">Types: {item.unit_types.join(", ")}</p>}
                {rera && <p className="mt-2 text-xs text-slate-500">MahaRERA / phase: {rera}</p>}
                {priceFrom && <p className="mt-2 text-sm font-semibold">Recorded indicative price: {money(priceFrom)} <span className="font-normal text-slate-500">· confirm current written offer</span></p>}
                {note && <p className="mt-2 text-sm leading-6 text-amber-800">{note}</p>}
                {item.image_url && typeof item.image_url === "string" && item.image_url.startsWith("https://") && <a href={item.image_url} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-lg border border-slate-200 bg-slate-50"><img src={item.image_url} alt={item.image_alt || label+" floor plan"} loading="lazy" className="max-h-64 w-full object-contain"/><span className="block border-t border-slate-200 px-3 py-2 text-xs font-semibold text-blue-700">Open plan / image ↗</span></a>}
                {source && typeof source === "string" && source.startsWith("https://") && <a href={source} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 underline">View source / floor plan <ExternalLink className="h-3 w-3"/></a>}
              </article>;
            })}</div> : <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Configuration and unit-plan details have not yet been sourced for this project.</div>}
          </section>
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-extrabold">Current individual units</h3><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">Confirmation pending</span></div>
            {unitsLoading ? <p className="mt-2 text-sm text-slate-500">Checking latest unit observations…</p> : availableUnits.length===0 ? <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4"><p className="text-sm font-semibold text-slate-800">No builder-confirmed current units are recorded in GoNest for this project.</p><p className="mt-1 text-sm leading-6 text-slate-600">We will only publish a unit after its tower, unit reference, RERA carpet area, price, evidence source, verification and observation date are recorded. Project-level configurations above do not imply current availability.</p><button type="button" onClick={()=>{setRequestType("enquiry");setForm(v=>({...v,message:"Please share the latest builder-issued tower-wise unit inventory, approved floor plans, RERA carpet areas, unit-wise complete cost sheet and current availability for "+selected.official_name+"."}));}} className="mt-3 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white">Request latest builder inventory</button></div> : <div className="mt-3 space-y-3">{availableUnits.map(u=><ProjectUnitInventoryCard key={u.id} unit={u} projectName={selected.official_name} projectImage={selected.cover_image_url} onEnquire={(unit)=>{setRequestType("enquiry");setForm(v=>({...v,message:"Please confirm current availability and share the complete cost sheet for "+(unit.configuration || "this unit")+(unit.tower_name ? ", "+unit.tower_name : "")+" in "+selected.official_name+"."}));}} />)}</div>}
          </section>
          <section><h3 className="text-lg font-extrabold">Enquire or request a site visit</h3><p className="mt-1 text-sm text-slate-500">Your request is recorded in GoNest and is pending confirmation; a visit is not booked until the project team confirms the slot.</p>
            <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={()=>setRequestType("enquiry")} className={`rounded-xl px-3 py-2.5 text-sm font-bold ${requestType==="enquiry"?"bg-blue-700 text-white":"bg-slate-100 text-slate-700"}`}>Project enquiry</button><button onClick={()=>setRequestType("site_visit")} className={`rounded-xl px-3 py-2.5 text-sm font-bold ${requestType==="site_visit"?"bg-blue-700 text-white":"bg-slate-100 text-slate-700"}`}><CalendarDays className="mr-1 inline h-4 w-4"/>Request a visit</button></div>
            <form onSubmit={submitRequest} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2"><input required minLength={2} maxLength={100} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" className="rounded-xl border border-slate-200 px-3 py-3 text-sm"/><input required type="tel" minLength={10} maxLength={18} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone number" className="rounded-xl border border-slate-200 px-3 py-3 text-sm"/></div>
              <input type="email" maxLength={254} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email (optional)" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/>
              {requestType==="site_visit"&&<div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Preferred visit date<input required type="date" min={new Date().toISOString().slice(0,10)} max={new Date(Date.now()+90*86400000).toISOString().slice(0,10)} value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/></label><label className="text-xs font-semibold text-slate-600">Preferred time<select value={form.time} onChange={e=>setForm({...form,time:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"><option value="">Flexible</option>{["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map(t=><option key={t} value={t}>{t}</option>)}</select></label></div>}
              <textarea maxLength={2000} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Preferred configuration, budget, questions…" rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/>
              <label className="flex items-start gap-2 text-xs leading-5 text-slate-600"><input type="checkbox" required checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})} className="mt-1"/><span>I consent to GoNest using my contact details to respond to this project request and coordinate with the relevant project team.</span></label>
              <button disabled={sending} className="w-full rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60">{sending?"Submitting…":requestType==="site_visit"?"Submit visit request":"Send project enquiry"}</button>
              {feedback&&<p role="status" className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{feedback}</p>}
            </form>
          </section>
        </div>
      </section>
    </div>}
  </>;
}
