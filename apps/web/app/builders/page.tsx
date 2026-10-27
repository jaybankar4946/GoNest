import NewProjectsPage from '../projects/NewProjectsPage';
import type { Metadata } from 'next';

// Keep the legacy /builders entry point on the same Hiranandani-only directory.
export const metadata: Metadata = {
  title: 'Hiranandani Projects | GoNest',
  description: 'Explore Hiranandani residential project references and request current inventory or a site visit.',
};

export const revalidate = 3600;

export default function BuildersPage() {
  return <NewProjectsPage />;
}
