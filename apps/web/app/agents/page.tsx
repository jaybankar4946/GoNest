import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { getAgents } from '@/lib/api';
import { AgentDirectory } from './AgentDirectory';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Find a Real Estate Agent | GoNest',
  description: 'Find real estate agents and property owners on GoNest. Search profiles, brokerage details, RERA information and active listings.',
};

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <>
      <Nav />
      <main>
        <AgentDirectory agents={agents} />
      </main>
      <Footer />
    </>
  );
}
