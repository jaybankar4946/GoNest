"use client";

import { CalendarDays, CheckCircle2, ExternalLink } from "lucide-react";
import { ProjectImage } from "./ProjectImage";

export type ProjectUnitInventory = {
  id: string;
  tower_name: string | null;
  floor_number: number | null;
  configuration: string | null;
  carpet_area_sqft: number | null;
  asking_price_inr: number | null;
  additional_charges_inr: number | null;
  availability_status: string;
  observed_at: string;
  source_url: string | null;
};

const money = (value: number | null | undefined) => {
  if (value == null) return "Request current price";
  if (value >= 10000000) return "₹" + (value / 10000000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + " Cr";
  if (value >= 100000) return "₹" + (value / 100000).toFixed(1).replace(/\.0$/, "") + " L";
  return "₹" + value.toLocaleString("en-IN");
};

export function ProjectUnitInventoryCard({
  unit,
  projectName,
  projectImage,
  onEnquire,
}: {
  unit: ProjectUnitInventory;
  projectName: string;
  projectImage?: string | null;
  onEnquire?: (unit: ProjectUnitInventory) => void;
}) {
  const observed = new Date(unit.observed_at);
  const observedLabel = Number.isNaN(observed.getTime()) ? "Date unavailable" : observed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const disclosedTotal = unit.asking_price_inr != null ? unit.asking_price_inr + (unit.additional_charges_inr ?? 0) : null;
  const pricePerSqft = unit.asking_price_inr != null && unit.carpet_area_sqft ? Math.round(unit.asking_price_inr / unit.carpet_area_sqft) : null;
  const facts = [
    unit.carpet_area_sqft != null ? { label: "RERA carpet area", value: unit.carpet_area_sqft.toLocaleString("en-IN") + " sq ft" } : null,
    unit.floor_number != null ? { label: "Floor", value: String(unit.floor_number) } : null,
    unit.tower_name ? { label: "Tower / wing", value: unit.tower_name } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative min-h-[210px] md:min-h-[260px]">
          <ProjectImage sources={[projectImage]} alt={projectName + " project photograph, not a unit-specific image"} className="h-full min-h-[210px] w-full md:min-h-[260px]" imageClassName="h-full min-h-[210px] w-full object-cover md:min-h-[260px]" fallbackLabel="Unit photograph not supplied" />
          {projectImage && <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700">Project photograph · not unit-specific</span>}
        </div>
        <div className="flex min-w-0 flex-col p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" />Recent source-linked observation</span>
            <span className="text-[11px] text-slate-500">Source updated {observedLabel}</span>
          </div>
          <h3 className="mt-3 text-xl font-extrabold text-slate-950">{unit.configuration || "Configuration not supplied"}</h3>
          <p className="mt-1 text-sm text-slate-600">{unit.tower_name || "Tower not provided"}{unit.floor_number != null ? " · Floor " + unit.floor_number : ""}</p>
          <div className="mt-4 rounded-xl bg-slate-950 p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-300">Asking price</p><p className="mt-1 text-2xl font-extrabold tracking-tight">{money(unit.asking_price_inr)}</p>{unit.additional_charges_inr != null && unit.additional_charges_inr > 0 && <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3 text-xs"><span className="text-slate-300">Price + disclosed charges</span><strong className="text-sm">{money(disclosedTotal)}</strong></div>}<p className="mt-2 text-[10px] leading-4 text-slate-300">Disclosed subtotal only; taxes, stamp duty, registration, parking and other charges may be extra.</p></div>
          {pricePerSqft != null && <p className="mt-2 text-xs font-semibold text-slate-600">Approx. {money(pricePerSqft)} / sq ft of recorded carpet area</p>}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {facts.map((fact) => <div key={fact.label} className="rounded-xl bg-slate-50 p-2.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{fact.label}</p><p className="mt-1 text-sm font-bold text-slate-800">{fact.value}</p></div>)}
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
            <a href={unit.source_url || "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 underline underline-offset-2">Evidence source <ExternalLink className="h-3 w-3" /></a>
            {onEnquire && <button type="button" onClick={() => onEnquire(unit)} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800"><CalendarDays className="h-4 w-4" /> Enquire about this unit</button>}
          </div>
          <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] leading-4 text-slate-500">Availability is a dated observation, not a reservation. Confirm the unit, complete cost sheet and booking terms directly with the developer. The observation is source-linked and time-stamped. Confirm current availability and final terms with the developer.</p>
        </div>
      </div>
    </article>
  );
}
