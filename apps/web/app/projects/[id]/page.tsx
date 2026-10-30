import type { Metadata } from "next";
import ProjectDetailPage from "../ProjectDetailPage";
import { supabase } from "@/lib/supabase";

// Per-project title for search results; unverified or unknown projects are kept out of search engines.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const canonical = `https://gonest.in/projects/${id}`;
  const generic: Metadata = { title: "Project details | GoNest", description: "Explore project photos, configurations, pricing, location, available inventory and request a site visit on GoNest.", alternates: { canonical }, robots: { index: false, follow: true } };
  try {
    const { data: p } = await supabase.from("real_estate_projects").select("official_name,project_category,city_id,developer_id").eq("id", id).eq("verification_status", "verified").eq("is_sample", false).maybeSingle();
    if (!p) return generic;
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from("cities").select("name").eq("id", p.city_id).maybeSingle(),
      supabase.from("developers").select("registered_name").eq("id", p.developer_id).maybeSingle(),
    ]);
    const city = c?.name ? ` in ${c.name}` : "";
    const dev = d?.registered_name ? ` by ${d.registered_name}` : "";
    return {
      title: `${p.official_name}${dev}${city}`,
      description: `${p.official_name}${dev}${city}. See photos, configurations, pricing, RERA details and available inventory, and request a site visit on GoNest.`,
      alternates: { canonical },
    };
  } catch { return generic; }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetailPage id={id} />;
}
