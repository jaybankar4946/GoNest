import type { Metadata } from "next";
import ProjectDetailPage from "../ProjectDetailPage";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: "Project details | GoNest", description: "Explore project photos, configurations, pricing, location, available inventory and request a site visit on GoNest.", alternates: { canonical: "https://gonest.in/projects/" + id } };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetailPage id={id} />;
}
