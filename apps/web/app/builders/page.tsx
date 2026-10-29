"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { Building2, ExternalLink, MapPin, Search, ShieldCheck } from "lucide-react";

type Project = {
  id: string;
  official_name: string;
  public_address: string | null;
  rera_number: string | null;
  project_category: string;
  construction_status: string;
  expected_possession_date: string | null;
  configurations: unknown;
  published_price_min_inr: number | null;
  published_price_max_inr: number | null;
  price_observed_at: string | null;
  official_project_url: string | null;
  brochure_url: string | null;
  cover_image_url: string | null;
  gallery_image_urls: string[] | null;
  inventory_status: string;
  inventory_verified_at: string | null;
  verification_status: string;
  is_sample: boolean;
  developer?: { operating_brand?: string | null; website_url?: string | null } | { operating_brand?: string | null; website_url?: string | null }[] | null;
  city?: { name?: string } | { name?: string }[] | null;
  locality?: { name?: string } | { name?: string }[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}
function money(value: number | null | undefined) {
  if (value == null) return "Request current price";
  if (value >= 10000000) return "₹" + (value / 10000000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + " Cr";
  if (value >= 100000) return "₹" + (value / 100000).toFixed(1).replace(/\.0$/, "") + " L";
  return "₹" + value.toLocaleString("en-IN");
}
function configurationLabels(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value.map((item: any) => typeof item === "string" ? item : item?.label || item?.configuration || item?.name || "").filter(Boolean).join(" · ");
}
function statusLabel(status: string) {
  const labels: Record<string, string> = {
    upcoming: "Upcoming",
    under_construction: "Under construction",
    completed: "Completed",
    on_hold: "On hold",
    cancelled: "Cancelled",
    unknown: "Status needs confirmation",
  };
  return labels[status] || "Status needs confirmation";
}
function isFresh(value: string | null | undefined) {
  return !!value && Date.now() - new Date(value).getTime() <= 14 * 86400000;
}

export default function BuildersPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [builder, setBuilder] = useState("All builders");
  const [city, setCity] = useState("All locations");

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      setError("");
      const { data, error: queryError } = await supabase
        .from("real_estate_projects")
        .select("id,official_name,public_address,rera_number,project_category,construction_status,expected_possession_date,configurations,published_price_min_inr,published_price_max_inr,price_observed_at,official_project_url,brochure_url,cover_image_url,gallery_image_urls,inventory_status,inventory_verified_at,verification_status,is_sample,developer:developers(operating_brand,website_url),city:cities(name),locality:localities(name)")
        .eq("is_sample", false)
        .not("official_project_url", "is", null)
        .order("official_name");
      if (!live) return;
      if (queryError) {
        setError("The builder inventory could not be loaded. Please refresh or try again shortly.");
      } else {
        const normalized = ((data ?? []) as unknown as Project[]).map((project) => ({
          ...project,
          developer: one(project.developer),
          city: one(project.city),
          locality: one(project.locality),
        }));
        setProjects(normalized);
      }
      setLoading(false);
    })();
    return () => { live = false; };
  }, []);

  const builders = useMemo(() => ["All builders", ...Array.from(new Set(projects.map((p) => one(p.developer)?.operating_brand).filter(Boolean) as string[])).sort()], [projects]);
  const locations = useMemo(() => ["All locations", ...Array.from(new Set(projects.map((p) => one(p.city)?.name || p.public_address?.split(",").slice(-2).join(",").trim()).filter(Boolean) as string[])).sort()], [projects]);
  const filtered = useMemo(() => projects.filter((p) => {
    const dev = one(p.developer);
    const cityName = one(p.city)?.name || "";
    const localityName = one(p.locality)?.name || "";
    const haystack = [p.official_name, dev?.operating_brand, cityName, localityName, p.public_address, p.rera_number, configurationLabels(p.configurations)].filter(Boolean).join(" ").toLowerCase();
    const locationMatch = city === "All locations" || cityName === city || p.public_address?.includes(city);
    return (builder === "All builders" || dev?.operating_brand === builder) && locationMatch && haystack.includes(query.trim().toLowerCase());
  }), [projects, builder, city, query]);

  const directory = useMemo(() => {
    const map = new Map<string, { name: string; url: string; count: number }>();
    for (const p of projects) {
      const d = one(p.developer);
      if (!d?.operating_brand) continue;
      const existing = map.get(d.operating_brand);
      if (existing) existing.count += 1;
      else if (d.website_url) map.set(d.operating_brand, { name: d.operating_brand, url: d.website_url, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  return <>
    <Nav />
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
          <p className="mb-4 text-sm font-bold uppercase tracking-[.18em] text-blue-300">GoNest · Builder inventory</p>
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">Explore projects. Check the source. Decide with confidence.</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">One live directory across the developer records currently tracked by GoNest. Compare configurations, official sources, registration references and price notes. A project record is not proof of current unit availability.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white hover:bg-blue-400">Check official MahaRERA ↗</a>
            <Link href="/projects" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Browse New Projects →</Link>
            <Link href="/search?purpose=sale" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Browse sale listings →</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-bold uppercase tracking-widest text-blue-700">Database-backed directory</p><h2 className="mt-2 text-3xl font-extrabold text-slate-950">Builder projects across Mumbai, Thane and Pune</h2></div>
          <p className="text-sm text-slate-500">{projects.length} project records · {directory.length} developers</p>
        </div>
        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_230px_230px]">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><Search className="h-5 w-5 text-slate-400"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search project, builder, location, BHK or RERA…" className="w-full bg-transparent text-sm outline-none"/></label>
          <select value={builder} onChange={(e) => setBuilder(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">{builders.map((name) => <option key={name}>{name}</option>)}</select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">{locations.map((name) => <option key={name}>{name}</option>)}</select>
        </div>
        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading current project records…</div>
        : error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">{error}</div>
        : filtered.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300"/><h2 className="font-bold">No projects match these filters</h2><button onClick={() => { setQuery(""); setBuilder("All builders"); setCity("All locations"); }} className="mt-4 font-semibold text-blue-700">Clear filters</button></div>
        : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((p) => {
          const dev = one(p.developer);
          const cityName = one(p.city)?.name || "";
          const locality = one(p.locality)?.name || "";
          const location = [locality, cityName].filter(Boolean).join(", ") || p.public_address || "Location details pending";
          const config = configurationLabels(p.configurations);
          const verifiedInventory = p.verification_status === "verified" && p.inventory_status === "verified_available" && isFresh(p.inventory_verified_at);
          return <article key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">{p.cover_image_url ? <img src={p.cover_image_url} alt={p.official_name + " project image"} loading="lazy" className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center"><Building2 className="h-12 w-12 text-slate-300"/></div>}<span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700">{p.cover_image_url ? "SOURCE-LINKED IMAGE" : "IMAGE PENDING"}</span></div>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{dev?.operating_brand || "Developer details pending"}</p>
              <h3 className="mt-1 text-xl font-extrabold">{p.official_name}</h3>
              <p className="mt-2 flex items-start gap-2 text-sm text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0"/>{location}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Price reference</p><p className="mt-1 text-sm font-bold">{p.published_price_min_inr == null && p.published_price_max_inr == null ? "Request current quote" : money(p.published_price_min_inr) + " – " + money(p.published_price_max_inr)}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Construction</p><p className="mt-1 text-sm font-bold">{statusLabel(p.construction_status)}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Configurations</p><p className="mt-1 text-sm font-bold">{config || "Confirm with developer"}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">MahaRERA reference</p><p className="mt-1 break-words text-sm font-bold">{p.rera_number || "Check exact phase / tower"}</p></div>
              </div>
              <div className="mt-4 flex items-start gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 shrink-0"/><span>{verifiedInventory ? "Recently verified project and unit inventory" : "Project reference only · current units and prices require confirmation"}</span></div>
              {p.price_observed_at && <p className="mt-2 text-xs text-slate-500">Price source last recorded: {new Date(p.price_observed_at).toLocaleDateString("en-IN")}</p>}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Link href={"/projects/" + p.id} className="flex-1 rounded-xl bg-blue-700 px-3 py-3 text-center text-sm font-bold text-white hover:bg-blue-800">View details & enquire →</Link>
                {p.official_project_url && <a href={p.official_project_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Official source <ExternalLink className="ml-1 inline h-4 w-4"/></a>}
                {p.brochure_url && <a href={p.brochure_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">Brochure ↗</a>}
              </div>
            </div>
          </article>;
        })}</div>}
      </section>

      <section className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="text-2xl font-extrabold">Official developer directory</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">These links come from GoNest’s developer records. They do not imply a formal partnership or guarantee current inventory.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{directory.map((d) => <a key={d.name} href={d.url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300"><span className="block font-bold">{d.name}</span><span className="mt-1 block text-xs text-slate-500">{d.count} tracked project record{d.count === 1 ? "" : "s"}</span><span className="mt-3 block text-sm font-semibold text-blue-700">Open official website ↗</span></a>)}</div>
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Inventory transparency:</strong> this page now reads the same project database as New Projects instead of relying on a separate hard-coded list. A source URL, brochure or MahaRERA reference is not proof of current unit availability. Verify the exact phase/tower, approved carpet area, price, taxes, possession and OC directly before booking.</div>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
