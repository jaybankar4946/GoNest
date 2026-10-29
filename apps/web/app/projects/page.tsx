import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Projects | GoNest",
  description: "Explore source-linked residential projects, configurations, official brochures, registration references and current inventory enquiries across GoNest builders.",
};

export { default } from "./NewProjectsPage";
export const revalidate = 3600;
