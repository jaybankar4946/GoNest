"use client";

import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Building2, CalendarDays, CheckCircle2, ExternalLink, Filter, MapPin, Search, ShieldCheck, X } from "lucide-react";

type Project = {
  id: string; official_name: string; public_address: string | null; rera_number: string | null;
  project_category: string; construction_status: string; launch_date: string | null; expected_possession_date: string | null;
  total_units: number | null; configurations: unknown; published_price_min_inr: number | null; published_price_max_inr: number | null;
  price_observed_at: string | null; official_project_url: string | null; brochure_url: string | null;
  inventory_status: string; inventory_verified_at: string | null; verification_status: string; is_sample: boolean;
  developer?: { operating_brand?: string | null; website_url?: string | null } | null;
  city?: { name?: string } | null; locality?: { name?: string } | null;
};

const ESTATE_PROJECTS = [
 { name:"Villa Carino", aliases:["villa carino"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fvilla-carino-desk.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fvilla-carino-desk.jpg&w=3840","https://www.houseofhiranandani.com/villa-carnio-1-big.jpg","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fgallery-in-aralia-2.jpg&w=1920"], url:"https://www.houseofhiranandani.com/residential-projects/thane/estate/villa-carino", configurations:"1 BHK", area:"438–453 sq ft carpet", facts:"11-storey tower; ready to move; OC received" },
 { name:"Solitaire", aliases:["solitaire"], image:"https://www.houseofhiranandani.com/solitiar_desk_bnr.jpg", gallery:["https://www.houseofhiranandani.com/solitiar_desk_bnr.jpg","https://www.houseofhiranandani.com/solitaire_exterior_big_3.jpg","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920"], url:"https://www.houseofhiranandani.com/residential-projects/thane/estate/solitaire", configurations:"1 BHK", area:"366–409 sq ft carpet", facts:"36-storey tower; ready to move; OC received" },
 { name:"Delanna", aliases:["delanna"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fdelenna-new-desk-bnrx1up.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fdelenna-new-desk-bnrx1up.jpg&w=3840","https://www.houseofhiranandani.com/delanna_interior_big1.jpg","https://www.houseofhiranandani.com/delanna_interior_big2.jpg","https://www.houseofhiranandani.com/delanna_interior_big3.jpg","https://www.houseofhiranandani.com/delanna_interior_big4.jpg","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920"], url:"https://www.houseofhiranandani.com/residential-projects/thane/estate/delanna", configurations:"2 BHK", area:"628.29, 633.56 and 634.59 sq ft floor plans; developer overview also lists 698–703 sq ft — verify exact unit plan", facts:"35-storey tower; ready to move; OC received" },
 { name:"Aralia", aliases:["aralia"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fbanner-desk-aralia.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fbanner-desk-aralia.jpg&w=3840","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fgallery-in-aralia-2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920"], url:"https://www.houseofhiranandani.com/residential-projects/thane/estate/aralia", configurations:"3 BHK", area:"1,084.26 and 1,112.24 sq ft floor plans; developer overview also lists 1,199–1,204 sq ft — verify exact unit plan", facts:"35-storey tower; ready to move; OC received" },
 { name:"Falcon", aliases:["falcon"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fbanner-desk-falcon.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fbanner-desk-falcon.jpg&w=3840","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fwestgate-overview-desg.png&w=640","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920"], url:"https://www.houseofhiranandani.com/residential-projects/thane/estate/falcon", configurations:"2 BHK", area:"643.47 sq ft carpet on floor plan; page header also says 671.03 sq ft — verify exact unit plan", facts:"49-storey tower; under construction; MahaRERA P51700051114" },
 { name:"Eagleridge Wing B", aliases:["eagleridge"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities7.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities8.jpg&w=1920"], url:"https://housing.com/in/buy/projects/page/116537-hiranandani-eagleridge-wing-b-by-hiranandani-developers-pvt-ltd-in-hiranandani-estate", configurations:"2, 2.5 & 3 BHK (portal reference)", area:"Verify area basis against specific floor plan", facts:"Legacy project; confirm wing, configuration and unit documents" },
 { name:"Villa Rica", aliases:["villa rica"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities7.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities8.jpg&w=1920"], url:"https://housing.com/in/buy/thane/hiranandani-rodas-enclave-hiranandani-estate-gid/projects/", configurations:"Confirm configuration from unit source", area:"Exact unit area to confirm", facts:"Township plan reference; confirm exact building and flat" },
 { name:"Hill Grange", aliases:["hill grange","hill cranje"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities7.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities8.jpg&w=1920"], url:"https://www.houseofhiranandani.com/data-content/project/ebrochure/ebrochure-delanna.pdf", configurations:"Confirm configuration from unit source", area:"Exact unit area to confirm", facts:"Name corrected to Hill Grange per Hiranandani Estate master-plan brochure" },
 { name:"Skylark Enclave", aliases:["skylark enclave"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities7.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities8.jpg&w=1920"], url:"https://www.magicbricks.com/residential-projects-hiranandani-estate-in-thane-nprid", configurations:"2, 2.5 & 3 BHK (third-party reference; confirm)", area:"Exact unit area to confirm", facts:"Legacy project; confirm exact building and flat" },
 { name:"Cardinal", aliases:["cardinal"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities7.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities8.jpg&w=1920"], url:"https://www.houseofhiranandani.com/data-content/project/ebrochure/ebrochure-delanna.pdf", configurations:"2.5 & 3 BHK (third-party reference; confirm)", area:"Exact unit area to confirm", facts:"Named on Hiranandani Estate master-plan brochure" },
 { name:"Lake Enclave", aliases:["lake enclave"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities7.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities8.jpg&w=1920"], url:"https://www.magicbricks.com/residential-projects-hiranandani-estate-in-thane-nprid", configurations:"3 & 4 BHK (third-party reference; confirm)", area:"Exact unit area to confirm", facts:"Legacy project; confirm exact building and flat" },
 { name:"Rodas Enclave – Annora", aliases:["annora","rodas enclave"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities7.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities8.jpg&w=1920"], url:"https://housing.com/in/buy/thane/hiranandani-rodas-enclave-hiranandani-estate-gid/projects/", configurations:"Confirm configuration from unit source", area:"Exact unit area to confirm", facts:"Legacy project; confirm exact building and flat" },
 { name:"Villa Nebula", aliases:["villa nebula"], image:"https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840", gallery:["https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fabout-us-bnr-desk.jpg&w=3840","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities2.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities3.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities4.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities7.jpg&w=1920","https://www.houseofhiranandani.com/_next/image?q=75&url=%2Fsolitaire_amenities8.jpg&w=1920"], url:"https://www.magicbricks.com/residential-projects-hiranandani-estate-in-thane-nprid", configurations:"Confirm configuration from unit source", area:"Exact unit area to confirm", facts:"Legacy project; confirm exact building and flat" },
];
const estatePhoto = (p:Project) => {
 const x=ESTATE_PROJECTS.find(e=>e.aliases.some(a=>p.official_name.toLowerCase().includes(a)));
 return x ?? null;
};

const MAHARERA = "https://maharera.maharashtra.gov.in/";
const money = (n: number | null | undefined) => n == null ? "Ask for current pricing" : n >= 10000000 ? `₹${(n / 10000000).toFixed(2).replace(/0+$/,"").replace(/\.$/,"")} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(1).replace(/\.0$/,"")} L` : `₹${n.toLocaleString("en-IN")}`;
const dateLabel = (s: string | null | undefined) => s ? new Date(s).toLocaleDateString("en-IN",{month:"short",year:"numeric"}) : "Not provided";

export default function NewProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All Cities");
  const [registration, setRegistration] = useState("All projects");
  const [selected, setSelected] = useState<Project | null>(null);
  const [requestType, setRequestType] = useState<"enquiry" | "site_visit">("enquiry");
  const [form, setForm] = useState({ name:"", phone:"", email:"", date:"", time:"", message:"", consent:false });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true); setLoadError("");
      const { data, error } = await supabase.from("real_estate_projects")
        .select("id,official_name,public_address,rera_number,project_category,construction_status,launch_date,expected_possession_date,total_units,configurations,published_price_min_inr,published_price_max_inr,price_observed_at,official_project_url,brochure_url,inventory_status,inventory_verified_at,verification_status,is_sample,developer:developers(operating_brand,website_url),city:cities(name),locality:localities(name)")
        .eq("is_sample", false).in("verification_status", ["pending","verified"]).not("official_project_url","is",null)
        .order("official_name");
      if (!live) return;
      if (error) setLoadError("Project data could not be loaded right now. Please try again shortly.");
      else setProjects((data ?? []) as unknown as Project[]);
      setLoading(false);
    })();
    return () => { live = false; };
  }, []);

  const cities = useMemo(() => ["All Cities", ...Array.from(new Set(projects.map(p => p.city?.name).filter(Boolean) as string[])).sort()], [projects]);
  const filtered = useMemo(() => projects.filter(p => {
    const haystack = [p.official_name,p.developer?.operating_brand,p.city?.name,p.locality?.name,p.public_address,p.rera_number].filter(Boolean).join(" ").toLowerCase();
    const matchCity = city === "All Cities" || p.city?.name === city || (city === "Mumbai" && /thane|navi mumbai|mumbai/i.test(haystack));
    const matchRegistration = registration === "All projects" || (registration === "Registration listed" ? !!p.rera_number : !p.rera_number);
    return matchCity && matchRegistration && haystack.includes(query.trim().toLowerCase());
  }), [projects, city, registration, query]);

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


  return <>
    <Nav />
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-blue-700"><Building2 className="h-4 w-4"/> New homes · Mumbai & Pune</div>
          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight md:text-5xl">Explore Hiranandani Estate homes.</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">Explore detailed Hiranandani Estate project listings with photos, layouts, location, configurations and a simple enquiry or site-visit request. Published project details are distinguished from individual flat availability.</p>
          <div className="mt-7 grid gap-3 md:grid-cols-[1fr_190px_210px]">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><Search className="h-5 w-5 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search project, developer, RERA or locality…" className="w-full bg-transparent text-sm outline-none"/></label>
            <select value={city} onChange={e=>setCity(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">{cities.map(c=><option key={c}>{c}</option>)}</select>
            <select value={registration} onChange={e=>setRegistration(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"><option>All projects</option><option>Registration listed</option><option>Registration not listed</option></select>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">{projects.length} source-linked project records</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">{projects.filter(p=>p.verification_status==="verified").length} project records verified</span>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-800">Photos, project facts and visit requests</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading live project data…</div>
        : loadError ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">{loadError}</div>
        : filtered.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300"/><h2 className="font-bold">No projects match these filters</h2><p className="mt-1 text-sm text-slate-500">Try a broader search or choose all cities.</p><button onClick={()=>{setCity("All Cities");setRegistration("All projects");setQuery("");}} className="mt-4 font-semibold text-blue-700">Clear filters</button></div>
        : <><div className="mb-4 flex items-center justify-between"><p className="text-sm text-slate-600"><strong>{filtered.length}</strong> projects found</p><p className="text-xs text-slate-500">Project records are not a guarantee of current inventory</p></div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map(p=>{
            const estate = estatePhoto(p);
            const developer = p.developer?.operating_brand || "Developer details pending";
            const location = [p.locality?.name,p.city?.name].filter(Boolean).join(", ") || p.public_address || "Location details pending";
            const configurations = Array.isArray(p.configurations) ? p.configurations.map((x:any)=>typeof x==="string"?x:x?.label||x?.configuration).filter(Boolean).join(" · ") : "";
            return <article key={p.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
              <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
                {estate?.image ? <img src={estate.image} alt={`${p.official_name} project reference`} className="absolute inset-0 h-full w-full object-cover" loading="lazy"/> : <Building2 className="h-14 w-14 text-slate-300"/>}
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 shadow-sm">New project</span>
                <span className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm ${p.verification_status === "verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{p.verification_status === "verified" ? "Project verified" : "Project details"}</span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent px-5 pb-4 pt-12">
                  <p className="text-xs font-semibold text-white/80">{developer}</p>
                  <h2 className="mt-1 text-xl font-extrabold leading-tight text-white">{p.official_name}</h2>
                </div>
              </div>
              <div className="p-5">
                <p className="flex items-start gap-2 text-sm text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0"/>{location}</p>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <div><p className="text-xs text-slate-500">Advertised price range</p><p className="mt-1 text-xl font-extrabold text-slate-950">{p.published_price_min_inr == null && p.published_price_max_inr == null ? "Price on request" : `${money(p.published_price_min_inr)} – ${money(p.published_price_max_inr)}`}</p></div>
                  <span className="shrink-0 rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700">{dateLabel(p.expected_possession_date)}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-4">
                  <div><p className="text-xs text-slate-500">Configurations</p><p className="mt-1 text-sm font-bold text-slate-900">{configurations || "Ask developer"}</p></div>
                  <div><p className="text-xs text-slate-500">MahaRERA reference</p><p className="mt-1 break-words text-sm font-bold text-slate-900">{p.rera_number || "Not recorded"}</p></div>
                  <div><p className="text-xs text-slate-500">Construction</p><p className="mt-1 text-sm font-bold text-slate-900">{p.construction_status.replaceAll("_"," ")}</p></div>
                  <div><p className="text-xs text-slate-500">Published specifications</p><p className="mt-1 text-sm font-bold text-slate-900">{estate ? estate.area : "Review project details"}</p></div>
                </div>
                <div className="flex items-center gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="h-4 w-4 shrink-0"/>{p.verification_status==="verified" ? "Project record reviewed by GoNest" : "Source-linked project · details require confirmation"}</div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button onClick={()=>{setSelected(p);setRequestType("enquiry");setFeedback("");}} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-800 hover:border-blue-300 hover:bg-slate-50">View details</button>
                  <button onClick={()=>{setSelected(p);setRequestType("site_visit");setFeedback("");}} className="rounded-xl bg-blue-700 px-3 py-3 text-sm font-bold text-white hover:bg-blue-800"><CalendarDays className="mr-1 inline h-4 w-4"/> Schedule visit</button>
                </div>
                <p className="mt-3 text-[11px] leading-4 text-slate-500">Visit requests are not confirmed bookings until the project team confirms the date and time. Prices and availability can change.</p>
              </div>
            </article>;
          })}</div></>}
      </section>
      <section className="border-t border-slate-200 bg-white py-10"><div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 md:px-6">
        {[["Official source links","Open developer pages to review their current project information."],["MahaRERA check","Verify the exact project and phase on the official state portal."],["Project details","Review photos, configurations and published project information before enquiring."]].map(([title,desc])=><div key={title} className="rounded-xl border border-slate-200 p-4"><CheckCircle2 className="mb-2 h-5 w-5 text-emerald-600"/><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p></div>)}
        <a href={MAHARERA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 sm:col-span-3">Verify on MahaRERA <ExternalLink className="h-4 w-4"/></a>
      </div></section>
    </main>
    <Footer />
    {selected && <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close project details" onClick={()=>setSelected(null)} className="absolute inset-0 bg-slate-950/50"/>
      <section role="dialog" aria-modal="true" aria-labelledby="project-detail-title" className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5"><div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">{selected.developer?.operating_brand || "Project details"}</p><h2 id="project-detail-title" className="mt-1 text-xl font-extrabold">{selected.official_name}</h2></div><button onClick={()=>setSelected(null)} className="rounded-full bg-slate-100 p-2" aria-label="Close"><X className="h-5 w-5"/></button></header>
        <div className="space-y-5 p-5 md:p-6">
          <div className="rounded-2xl bg-slate-50 p-4">{estatePhoto(selected) && <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{estatePhoto(selected)!.gallery.filter(src=>!src.toLowerCase().endsWith(".pdf")).map((src,i)=><a key={src} href={src} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl bg-slate-200"><img src={src} alt={`${selected.official_name} / Hiranandani Estate reference image ${i+1}`} className="h-32 w-full object-cover" loading="lazy"/></a>)}</div>}<p className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4"/>{[selected.locality?.name,selected.city?.name].filter(Boolean).join(", ") || selected.public_address || "Location to be confirmed"}</p><p className="mt-2 text-sm text-slate-600">{estatePhoto(selected)?.facts || "Project data shown here is limited to recorded source information. Some gallery photos show shared Hiranandani Estate amenities or township views, not the exact legacy building or individual flat."} Review published configurations and photos on the official source. Individual unit terms must be confirmed during enquiry.</p>
            <div className="mt-3 flex flex-wrap gap-2">{selected.official_project_url&&<a className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold" href={selected.official_project_url} target="_blank" rel="noreferrer">Official project page <ExternalLink className="ml-1 inline h-3.5 w-3.5"/></a>}<a className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold" href={MAHARERA} target="_blank" rel="noreferrer">MahaRERA search <ExternalLink className="ml-1 inline h-3.5 w-3.5"/></a>{selected.brochure_url&&<a className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold" href={selected.brochure_url} target="_blank" rel="noreferrer">Brochure <ExternalLink className="ml-1 inline h-3.5 w-3.5"/></a>}</div>
          </div>
          
          <section><h3 className="text-lg font-extrabold">Enquire or schedule a site visit</h3><p className="mt-1 text-sm text-slate-500">Send your enquiry or preferred visit time. The team will coordinate the next steps.</p>
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
