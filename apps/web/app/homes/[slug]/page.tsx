import type { Metadata } from "next";
import ProjectDetailPage from "../../projects/ProjectDetailPage";

const titles: Record<string, string> = {
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = titles[slug] || slug.replace(/-/g, " ");
  return {
    title: name + " | GoNest",
    description: "Explore project photos, configurations, pricing, location, inventory and request a site visit on GoNest.",
    alternates: { canonical: "https://gonest.in/homes/" + slug },
  };
}

export default async function HomeProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProjectDetailPage id={slug} />;
}
