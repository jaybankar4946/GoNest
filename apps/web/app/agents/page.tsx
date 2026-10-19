import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { getAgents, getPublicBrokerages } from '@/lib/api';
import { LocalBrokerageDirectory } from './LocalBrokerageDirectory';
import { AgentDirectory } from './AgentDirectory';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Find a Real Estate Agent | GoNest',
  description: 'Find real estate agents and property owners on GoNest. Search profiles, brokerage details, RERA information and active listings.',
};

export default async function AgentsPage() {
  const [agents, brokerages] = await Promise.all([getAgents(), getPublicBrokerages()]);

  return (
    <>
      <Nav />
      <main>
        <AgentDirectory agents={agents} />
        <LocalBrokerageDirectory brokerages={brokerages} />
      </main>
      <Footer />
    </>
  );
}
