import type { Metadata } from 'next';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { AdminOnlyFeatureGate } from '@/components/layout/AdminOnlyFeatureGate';
import { DecisionTools } from './DecisionTools';

export const metadata: Metadata = {
  title: 'Admin Decision Tools',
  description: 'Restricted GoNest administrator decision workspace.',
  robots: { index: false, follow: false, noarchive: true },
};

export default function DecisionCentrePage() {
  return <><Nav /><AdminOnlyFeatureGate><DecisionTools /></AdminOnlyFeatureGate><Footer /></>;
}
