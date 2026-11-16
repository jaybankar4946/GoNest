import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { getAgents, getPublicBrokerages } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { LocalBrokerageDirectory } from './LocalBrokerageDirectory';
import { AgentDirectory } from './AgentDirectory';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Find a Real Estate Agent | GoNest',
  description: 'Find real estate agents and property owners on GoNest. Search profiles, brokerage details, RERA information and active listings.',
};

export default async function AgentsPage() {
  const [agents, brokerages, directoryResult] = await Promise.all([getAgents(), getPublicBrokerages(), supabase.from('directory_agents').select('*').eq('directory_visible', true).order('sort_order').order('name')]);
  const directoryAgents = directoryResult.data ?? [];

  return (
    <>
      <Nav />
      <main>
        <AgentDirectory agents={agents} directoryAgents={directoryAgents} />
        <LocalBrokerageDirectory brokerages={brokerages} />
      </main>
      <Footer />
    </>
  );
}
