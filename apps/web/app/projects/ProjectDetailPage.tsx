"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Building2, CalendarDays, CheckCircle2, ExternalLink, MapPin, ShieldCheck } from "lucide-react";

type Project = {
  id: string; official_name: string; public_address: string | null; rera_number: string | null;
  project_category: string; construction_status: string; launch_date: string | null; expected_possession_date: string | null;
  total_units: number | null; configurations: unknown; published_price_min_inr: number | null; published_price_max_inr: number | null;
  price_observed_at: string | null; official_project_url: string | null; brochure_url: string | null;
  cover_image_url: string | null; gallery_image_urls: string[]; image_source_url: string | null; rera_source_url: string | null; rera_checked_at: string | null;
  inventory_status: string; inventory_verified_at: string | null; verification_status: string; is_sample: boolean;
  developer?: { operating_brand?: string | null; website_url?: string | null } | { operating_brand?: string | null; website_url?: string | null }[] | null;
  city?: { name?: string } | { name?: string }[] | null; locality?: { name?: string } | { name?: string }[] | null;
};
type Unit = { id: string; unit_reference: string | null; tower_name: string | null; floor_number: number | null; configuration: string | null; carpet_area_sqft: number | null; asking_price_inr: number | null; additional_charges_inr: number | null; availability_status: string; observed_at: string; source_url: string | null; verified_by: string | null };
const MAHARERA = "https://maharera.maharashtra.gov.in/";
const money = (n: number | null | undefined) => n == null ? "Request current price" : n >= 10000000 ? "₹" + (n / 10000000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + " Cr" : n >= 100000 ? "₹" + (n / 100000).toFixed(1).replace(/\.0$/, "") + " L" : "₹" + n.toLocaleString("en-IN");
const dateLabel = (s: string | null | undefined) => s ? new Date(s).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "Not provided";
const fresh = (s: string | null | undefined) => !!s && Date.now() - new Date(s).getTime() <= 14 * 86400000;
function one<T>(v: T | T[] | null | undefined): T | null { return Array.isArray(v) ? v[0] ?? null : v ?? null; }

export default function ProjectDetailPage({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [priceHistory, setPriceHistory] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState("Overview");
  const [requestType, setRequestType] = useState<"enquiry" | "site_visit">("enquiry");
  const [form, setForm] = useState({ name: "", phone: "", email: "", date: "", time: "", message: "", consent: false });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loan, setLoan] = useState(80);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true); setError("");
      const projectSelect = "id,official_name,public_address,rera_number,project_category,construction_status,launch_date,expected_possession_date,total_units,configurations,published_price_min_inr,published_price_max_inr,price_observed_at,official_project_url,brochure_url,cover_image_url,gallery_image_urls,image_source_url,rera_source_url,rera_checked_at,inventory_status,inventory_verified_at,verification_status,is_sample,developer:developers(operating_brand,website_url),city:cities(name),locality:localities(name)";
      const homeSlugNames: Record<string, string> = {
        "villa-carino": "Villa Carino",
        "solitaire": "Solitaire",
        "delanna": "Delanna",
        "aralia": "Aralia",
        "eagleridge-wing-b": "Eagleridge Wing B",
        "villa-rica": "Villa Rica",
        "hill-cranje": "Hill Grange",
        "skylark-enclave": "Skylark Enclave",
        "annora": "Annora",
        "villa-nebula": "Villa Nebula",
      };
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      const projectQuery = supabase.from("real_estate_projects").select(projectSelect).eq("is_sample", false);
      const { data, error: projectError } = isUuid
        ? await projectQuery.eq("id", id).maybeSingle()
        : await projectQuery.ilike("official_name", homeSlugNames[id] || id.replace(/-/g, " ")).maybeSingle();
      if (!live) return;
      if (projectError || !data) { setError("We couldn't load this project. It may have been removed or is not published."); setProject(null); setLoading(false); return; }
      const p = data as unknown as Project; setProject(p);
      const { data: observed, error: unitsError } = await supabase.from("project_inventory_observations")
        .select("id,unit_reference,tower_name,floor_number,configuration,carpet_area_sqft,asking_price_inr,additional_charges_inr,availability_status,observed_at,source_url,verified_by")
        .eq("project_id", p.id).eq("is_sample", false).eq("availability_status", "available")
        .not("source_url", "is", null).gte("observed_at", new Date(Date.now() - 14 * 86400000).toISOString()).order("asking_price_inr");
      const { data: history } = await supabase.from("project_inventory_observations")
        .select("id,unit_reference,tower_name,floor_number,configuration,carpet_area_sqft,asking_price_inr,additional_charges_inr,availability_status,observed_at,source_url,verified_by")
        .eq("project_id", p.id).eq("is_sample", false).not("source_url", "is", null)
        .not("asking_price_inr", "is", null).order("observed_at", { ascending: false }).limit(12);
      if (live) {
        if (!unitsError) setUnits((observed ?? []) as Unit[]);
        setPriceHistory((history ?? []) as Unit[]);
        setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [id]);

  const developer = one(project?.developer)?.operating_brand || "Developer details";
  const city = one(project?.city)?.name || "";
  const locality = one(project?.locality)?.name || "";
  const location = [locality, city].filter(Boolean).join(", ") || project?.public_address || "Location details not provided";
  const images = useMemo(() => { if (!project) return []; const urls = [project.cover_image_url, ...(project.gallery_image_urls ?? [])].filter((url): url is string => typeof url === "string" && url.startsWith("https://")); return Array.from(new Set(urls)); }, [project]);
  const configurations = useMemo(() => {
    const raw = project?.configurations;
    if (!Array.isArray(raw)) return [];
    return raw.map((x: any) => typeof x === "string" ? x : x?.label || x?.configuration || x?.name).filter(Boolean) as string[];
  }, [project]);
  const configurationDetails = useMemo(() => {
    const raw = project?.configurations;
    if (!Array.isArray(raw)) return [];
    return raw.filter((item: any) => item && typeof item === "object").map((item: any) => {
      const areaKey = item.rera_carpet_area_sqft ? "RERA carpet area figures" :
        item.floor_plan_carpet_area_sqft ? "Floor-plan area figures" :
        item.official_overview_carpet_area_sqft ? "Developer overview area figures" :
        item.developer_published_area_sqft ? "Developer-published area figures (area basis to confirm)" :
        item.developer_published_unit_plan_size_sqft ? "Published unit-plan sizes (area basis to confirm)" :
        item.carpet_area_sqft ? "Recorded carpet area" : null;
      const rawAreas = item.rera_carpet_area_sqft ?? item.floor_plan_carpet_area_sqft ??
        item.official_overview_carpet_area_sqft ?? item.developer_published_area_sqft ??
        item.developer_published_unit_plan_size_sqft ?? (item.carpet_area_sqft != null ? [item.carpet_area_sqft] : []);
      return {
        label: item.label || item.configuration || item.name || (item.project_scale ? "Project scale" : item.project_amenities ? "Amenities and facilities" : "Additional details"),
        tower: item.tower || item.tower_name || null,
        areaNote: item.area_note || null,
        areaLabel: areaKey,
        areaFigures: Array.isArray(rawAreas) ? rawAreas : [rawAreas],
        projectScale: item.project_scale || null,
        sourceNote: item.source_note || item.note || item.price_note || null,
        priceFromInr: item.price_from_inr || null,
        amenities: Array.isArray(item.project_amenities) ? item.project_amenities : [],
        rera: item.rera_number || null
      };
    });
  }, [project]);
  const available = units.filter(u => fresh(u.observed_at) && !!u.source_url && !!u.verified_by);
  const verifiedProject = project?.verification_status === "verified";
  const verifiedInventory = verifiedProject && project?.inventory_status === "verified_available" && fresh(project?.inventory_verified_at);
  const price = project?.published_price_min_inr ?? null;
  const principal = price ? price * loan / 100 : 0;
  const monthlyRate = rate / 1200;
  const months = years * 12;
  const emi = principal && monthlyRate ? principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1) : principal / Math.max(1, months);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!project) return; setSending(true); setFeedback("");
    try {
      const { data, error } = await supabase.rpc("submit_project_enquiry", {
        p_project_id: project.id, p_type: requestType, p_name: form.name, p_phone: form.phone,
        p_email: form.email || null, p_date: requestType === "site_visit" ? form.date : null,
        p_time: requestType === "site_visit" ? form.time || null : null, p_message: form.message || null, p_consent: form.consent
      });
      if (error) throw error;
      const result = data as { reference?: string };
      setFeedback("Request received. Reference: " + (result?.reference ?? "GoNest") + ". Our team will follow up. A visit is not confirmed until the project team confirms the slot.");
      setForm({ name: "", phone: "", email: "", date: "", time: "", message: "", consent: false });
    } catch { setFeedback("We couldn't submit your request right now. Please try again or use the official developer link."); }
    finally { setSending(false); }
  }

  const sections = ["Overview", "Photos & floor plans", "Facts & features", "Location", "Price history", "Price & EMI", "Available inventory", "Enquiry & site visit"];
  if (loading) return <><Nav/><main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-16 text-slate-500">Loading project details…</main><Footer/></>;
  if (error || !project) return <><Nav/><main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-16"><h1 className="text-2xl font-extrabold">Project details unavailable</h1><p className="mt-3 text-slate-600">{error || "This project is not available."}</p><Link href="/projects" className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-700"><ArrowLeft size={16}/> Back to New Projects</Link></main><Footer/></>;

  return <>
    <Nav/>
    <main className="min-h-screen bg-slate-50 text-slate-900"><div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
      <nav className="mb-4 text-sm text-slate-500"><Link href="/" className="hover:text-blue-700">Home</Link><span className="mx-2">/</span><Link href="/projects" className="hover:text-blue-700">New Projects</Link><span className="mx-2">/</span><span className="text-slate-800">{project.official_name}</span></nav>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">{project.construction_status || "Project status not recorded"}</span><span className={"rounded-full px-3 py-1.5 text-xs font-bold " + (verifiedProject ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>{verifiedProject ? "GoNest project record verified" : "Project details need confirmation"}</span>{verifiedInventory && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">Recent inventory verified</span>}</div></div>
      <div className="grid gap-2 overflow-hidden rounded-2xl md:grid-cols-[1.65fr_1fr]">
        <div className="relative min-h-[280px] bg-gradient-to-br from-slate-200 via-blue-50 to-slate-300 md:min-h-[440px]">{images.length ? <img src={images[activeImage] || images[0]} alt={project.official_name + " project photo"} className="h-full min-h-[280px] w-full object-cover md:min-h-[440px]"/> : <div className="flex min-h-[280px] h-full flex-col items-center justify-center gap-3 text-slate-500 md:min-h-[440px]"><Building2 className="h-12 w-12 text-slate-400"/><span className="text-sm font-semibold">Project image not yet supplied</span></div>}<span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-slate-700">{images.length ? "Project photo " + (activeImage + 1) + " of " + images.length : "Project reference"}</span></div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-1">{images.length > 1 ? images.map((src, i) => <button key={src} onClick={() => setActiveImage(i)} className={"relative min-h-[135px] overflow-hidden bg-slate-200 text-left " + (activeImage === i ? "ring-2 ring-inset ring-blue-700" : "")}><img src={src} alt={project.official_name + " gallery " + (i + 1)} className="h-full min-h-[135px] w-full object-cover"/><span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold">View photo</span></button>) : <div className="flex min-h-[135px] items-center justify-center bg-white p-5 text-center text-sm text-slate-500">Floor plans and additional photos appear when source files are available.</div>}<div className="flex min-h-[135px] flex-col justify-center bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{developer}</p><p className="mt-1 text-sm font-bold">{project.official_name}</p><p className="mt-1 text-xs text-slate-500">{location}</p></div></div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><div className="min-w-0">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">{sections.map(s => <button key={s} onClick={() => { setTab(s); document.getElementById(s.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-"))?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className={"rounded-full px-3 py-2 text-sm font-semibold " + (tab === s ? "bg-blue-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100")}>{s}</button>)}</div>
        <section id="overview" className="scroll-mt-28 py-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">New residential project</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{project.official_name}</h1><p className="mt-3 flex items-center gap-2 text-slate-600"><MapPin className="h-4 w-4"/>{location}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Published price range</p><p className="mt-1 text-lg font-extrabold">{project.published_price_min_inr == null && project.published_price_max_inr == null ? "Request current quote" : money(project.published_price_min_inr) + " – " + money(project.published_price_max_inr)}</p><p className="mt-1 text-xs text-slate-500">Price observation: {dateLabel(project.price_observed_at)}</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Configurations</p><p className="mt-1 font-bold">{configurations.join(" · ") || "Confirm with developer"}</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Expected possession</p><p className="mt-1 font-bold">{dateLabel(project.expected_possession_date)}</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Total project units</p><p className="mt-1 font-bold">{project.total_units?.toLocaleString("en-IN") ?? "Not recorded"}</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Launch date</p><p className="mt-1 font-bold">{dateLabel(project.launch_date)}</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">MahaRERA reference</p><p className="mt-1 break-words font-bold">{project.rera_number || "Not recorded"}</p></div></div>
          {project.official_name.toLowerCase() === "villa carino" && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-extrabold">Villa Carino — developer-published specifications</h2><p className="mt-2 text-sm leading-6 text-slate-600">An 11-storey premium residential tower at Hiranandani Estate, Thane West, beside The Walk high-street retail. The developer describes the residences as ready to move in with an Occupancy Certificate received.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Configuration</p><p className="mt-1 font-bold">1 BHK</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Carpet area range</p><p className="mt-1 font-bold">438–453 sq ft</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Township amenities</p><p className="mt-1 text-sm">Maintained roads and pavements, retail and stores, open green spaces, ample parking, schools and hospitals in the estate.</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Common estate facilities</p><p className="mt-1 text-sm">Clubhouse, swimming pool, gymnasium, racquet club, badminton court, multipurpose hall, tennis court and kids’ play area.</p></div></div><p className="mt-4 text-xs leading-5 text-slate-500">Amenities listed as common estate facilities may be shared township facilities, not exclusive to this tower. Confirm access, actual unit carpet area, OC copy and current price with the developer.</p></div>}
          <div className="mt-5 flex flex-wrap gap-3">{project.official_project_url && <a href={project.official_project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold hover:bg-slate-100">Official developer page <ExternalLink size={15}/></a>}{project.brochure_url ? <a href={project.brochure_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-blue-700 bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800">Download project brochure <ExternalLink size={15}/></a> : project.official_project_url && <a href={project.official_project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-blue-700 bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800">Request official brochure <ExternalLink size={15}/></a>}<a href={project.rera_source_url || MAHARERA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold hover:bg-slate-100">Check MahaRERA reference <ExternalLink size={15}/></a></div>
        </section>
        <section id="photos-floor-plans" className="scroll-mt-28 border-t border-slate-200 py-7"><h2 className="text-xl font-extrabold">Photos & floor plans</h2><p className="mt-2 text-sm leading-6 text-slate-600">Villa Carino images below are sourced from the developer's official project page. The official page presents the gallery as project imagery; confirm the exact apartment, approved floor plan and carpet area with the developer before booking. The brochure action opens the official page to request the brochure; it is not a direct PDF download unless a brochure file is provided.</p>{images.length ? <div className="mt-4 grid grid-cols-2 gap-3">{images.map((src, i) => <a key={src} href={src} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><img src={src} alt={project.official_name + " photo " + (i + 1)} className="h-48 w-full object-cover"/><p className="p-3 text-xs font-semibold text-slate-600">Project reference photo · open original</p></a>)}</div> : <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No project gallery has been connected to this record yet. No placeholder photo is presented as a real project image.</div>}</section>
        <section id="facts-features" className="scroll-mt-28 border-t border-slate-200 py-7"><h2 className="text-xl font-extrabold">Facts & features</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-white p-4 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Developer</p><p className="mt-1 font-semibold">{developer}</p></div><div className="rounded-xl bg-white p-4 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Project category</p><p className="mt-1 font-semibold">{project.project_category || "Not recorded"}</p></div><div className="rounded-xl bg-white p-4 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Construction status</p><p className="mt-1 font-semibold">{project.construction_status || "Not recorded"}</p></div><div className="rounded-xl bg-white p-4 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Inventory verification</p><p className="mt-1 font-semibold">{verifiedInventory ? "Recent verified inventory record" : "Current unit availability not confirmed"}</p></div></div><div className="mt-4 rounded-xl border border-slate-200 bg-white p-4"><ShieldCheck className="mr-2 inline h-4 w-4 text-blue-700"/><span className="text-sm">{verifiedProject ? "GoNest has verified the project record; this does not independently guarantee title, construction quality or unit availability." : "Project information is recorded from a source, but some details may still need confirmation."}</span></div>
          {configurationDetails.length > 0 && <div className="mt-5 space-y-3"><h3 className="text-lg font-extrabold">Configurations, area notes & tower details</h3>{configurationDetails.map((item, i) => <div key={item.label + i} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold">{item.label}</p>{item.tower && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{item.tower}</span>}</div>{item.areaFigures.length > 0 && item.areaLabel && <p className="mt-2 text-sm text-slate-600"><span className="font-semibold">{item.areaLabel}:</span> {item.areaFigures.join(", ")} sq ft. Confirm the area basis and exact unit against the approved plan.</p>}{item.projectScale && <p className="mt-2 text-sm leading-6 text-slate-700"><span className="font-semibold">Project scale:</span> {item.projectScale}</p>}{item.areaNote && <p className="mt-2 text-sm leading-6 text-amber-800">{item.areaNote}</p>}{item.sourceNote && <p className="mt-2 text-sm leading-6 text-slate-600">{item.sourceNote}</p>}{item.priceFromInr && <p className="mt-2 text-sm"><span className="font-semibold">Recorded indicative quote:</span> {money(item.priceFromInr)} — confirm current written offer and included charges.</p>}{item.rera && <p className="mt-2 text-sm"><span className="font-semibold">Tower/phase registration:</span> {item.rera}</p>}{item.amenities.length > 0 && <div className="mt-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Published features / amenities</p><ul className="mt-2 grid gap-2 sm:grid-cols-2">{item.amenities.map((amenity: string) => <li key={amenity} className="flex gap-2 text-sm text-slate-700"><span className="text-emerald-600">✓</span>{amenity}</li>)}</ul></div>}</div>)}</div>}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm font-bold">Legal and inventory reminder</p><p className="mt-1 text-sm leading-6 text-slate-600">A project reference or MahaRERA number does not confirm that a particular apartment is available. Verify the exact tower/phase registration, current unit price, carpet area, possession commitment and applicable Occupancy Certificate before booking.</p></div>
        </section>
        <section id="location" className="scroll-mt-28 border-t border-slate-200 py-7"><h2 className="text-xl font-extrabold">Location & neighbourhood</h2><p className="mt-2 leading-7 text-slate-600">{location}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"><div><p className="font-bold">Explore the project area</p><p className="mt-1 text-sm text-slate-500">Map opens a location search, not a verified project entrance pin.</p></div><a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([project.official_name, location].filter(Boolean).join(", "))} target="_blank" rel="noreferrer" className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white">Open map ↗</a></div></section>
        <section id="price-history" className="scroll-mt-28 border-t border-slate-200 py-7"><h2 className="text-xl font-extrabold">Price history & observed quotes</h2><p className="mt-2 text-sm leading-6 text-slate-600">Source-linked unit asking-price observations recorded for this project. These are not guaranteed builder prices; quotes can vary by tower, floor, configuration, charges and date.</p>{priceHistory.length === 0 ? <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5"><p className="font-semibold">No historical unit price observations are recorded</p><p className="mt-1 text-sm text-slate-500">Request the latest dated price sheet from the developer.</p></div> : <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"><span>Unit / configuration</span><span>Observed asking price</span></div>{priceHistory.map(u=><div key={u.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 px-4 py-3 last:border-0"><div><p className="font-semibold">{u.configuration || u.unit_reference || "Unit quote"}{u.tower_name ? " · " + u.tower_name : ""}</p><p className="mt-1 text-xs text-slate-500">{new Date(u.observed_at).toLocaleDateString("en-IN")}{u.source_url ? <> · <a href={u.source_url} target="_blank" rel="noreferrer" className="underline">Source</a></> : null}</p></div><p className="text-right font-bold">{money(u.asking_price_inr)}</p></div>)}</div>}</section>
        <section id="price-emi" className="scroll-mt-28 border-t border-slate-200 py-7"><h2 className="text-xl font-extrabold">Price & EMI calculator</h2><p className="mt-2 text-sm leading-6 text-slate-600">Illustrative estimate using the minimum published project price where available. Actual loan eligibility, rate, fees and payment milestones depend on the lender and developer.</p><div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Starting published price</p><p className="mt-1 text-2xl font-extrabold">{money(price)}</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Loan amount <span className="float-right">{loan}%</span><input type="range" min="10" max="90" step="5" value={loan} onChange={e=>setLoan(Number(e.target.value))} className="mt-3 w-full"/></label><label className="text-sm font-semibold">Interest rate <span className="float-right">{rate.toFixed(1)}%</span><input type="range" min="6" max="14" step="0.25" value={rate} onChange={e=>setRate(Number(e.target.value))} className="mt-3 w-full"/></label><label className="text-sm font-semibold">Loan tenure <span className="float-right">{years} years</span><input type="range" min="5" max="30" value={years} onChange={e=>setYears(Number(e.target.value))} className="mt-3 w-full"/></label><div className="rounded-xl bg-blue-50 p-4"><p className="text-xs text-blue-800">Estimated monthly EMI</p><p className="mt-1 text-2xl font-extrabold text-blue-900">{price ? "₹" + Math.round(emi).toLocaleString("en-IN") : "Add price to estimate"}</p><p className="mt-1 text-xs text-blue-800">Excludes taxes, registration, maintenance and other charges.</p></div></div></div></section>
        <section id="available-inventory" className="scroll-mt-28 border-t border-slate-200 py-7"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-extrabold">Available inventory</h2><span className="text-xs text-slate-500">Recent source-linked observations only</span></div>{available.length === 0 ? <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5"><p className="font-semibold">No recent verified unit observations to display</p><p className="mt-1 text-sm leading-6 text-slate-500">Request a current inventory sheet. A project listing is not proof that a specific flat is available.</p></div> : <div className="mt-4 space-y-3">{available.map(u=><article key={u.id} className="rounded-xl border border-emerald-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold">{u.unit_reference || u.configuration || "Unit"}{u.tower_name ? " · " + u.tower_name : ""}</p><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">Source observed · reconfirm</span></div><p className="mt-2 text-sm text-slate-600">{[u.configuration, u.floor_number ? "Floor " + u.floor_number : null, u.carpet_area_sqft ? u.carpet_area_sqft.toLocaleString("en-IN") + " sq ft carpet" : null].filter(Boolean).join(" · ") || "Details not provided"}</p><p className="mt-2 text-lg font-extrabold">{money(u.asking_price_inr)}{u.additional_charges_inr ? <span className="ml-2 text-xs font-medium text-slate-500">+ {money(u.additional_charges_inr)} charges</span> : null}</p><p className="mt-1 text-xs text-slate-500">Observed {new Date(u.observed_at).toLocaleDateString("en-IN")} · <a href={u.source_url || "#"} target="_blank" rel="noreferrer" className="underline">Source</a></p></article>)}</div>}</section>
      </div>
      <aside id="enquiry-site-visit" className="scroll-mt-28"><div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">GoNest · Project enquiries</p><h2 className="mt-2 text-xl font-extrabold">Ask about this project</h2><p className="mt-2 text-sm leading-6 text-slate-500">Request a current price sheet, configuration details or a site visit. A visit is a request until the project team confirms it.</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={()=>setRequestType("enquiry")} className={"rounded-xl px-3 py-3 text-sm font-bold " + (requestType === "enquiry" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700")}>Enquire</button><button type="button" onClick={()=>setRequestType("site_visit")} className={"rounded-xl px-3 py-3 text-sm font-bold " + (requestType === "site_visit" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700")}><CalendarDays className="mr-1 inline h-4 w-4"/>Site visit</button></div><form onSubmit={submit} className="mt-4 space-y-3"><input required minLength={2} maxLength={100} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/><input required type="tel" minLength={10} maxLength={18} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Mobile number" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/><input type="email" maxLength={254} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email (optional)" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/>{requestType === "site_visit" && <div className="space-y-2"><label className="block text-xs font-semibold text-slate-600">Preferred visit date<input required type="date" min={new Date().toISOString().slice(0,10)} value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/></label><label className="block text-xs font-semibold text-slate-600">Preferred time<select value={form.time} onChange={e=>setForm({...form,time:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"><option value="">Flexible</option>{["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map(t=><option key={t} value={t}>{t}</option>)}</select></label></div>}<textarea maxLength={2000} rows={3} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Budget, preferred configuration or questions…" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/><label className="flex items-start gap-2 text-xs leading-5 text-slate-600"><input required type="checkbox" checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})} className="mt-1"/><span>I consent to GoNest using my details to respond to this request. See the <Link href="/privacy" className="underline">Privacy Policy</Link>.</span></label><button disabled={sending} className="w-full rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60">{sending ? "Submitting…" : requestType === "site_visit" ? "Request site visit" : "Send project enquiry"}</button></form>{feedback && <p role="status" className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{feedback}</p>}<div className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500"><CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-600"/>Never pay a booking amount based only on a GoNest enquiry. Confirm terms with the developer and review official documents.</div></div></aside>
      </div>
    </div></main><Footer/>
  </>;
}
