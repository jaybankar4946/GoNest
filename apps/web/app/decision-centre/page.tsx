import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { DecisionTools } from './DecisionTools';

export const metadata = {
  title: 'Property Decision Workspace',
  description: 'Compare homes and estimate rental, resale and new-project costs with GoNest.',
};

export default function DecisionCentrePage() {
  return <><Nav /><DecisionTools /><Footer /></>;
}
