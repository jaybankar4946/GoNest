import Link from 'next/link';
import type { Profile } from '@/lib/types';

const SERVICES = ['Buy', 'Rent', 'Sell'];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'G';
}

function AgentCard({ agent }: { agent: Profile }) {
  const title = agent.full_name || agent.agency_name || 'GoNest agent';
  const brokerage = agent.agency_name && agent.agency_name !== title ? agent.agency_name : null;
  const verified = agent.agent_verified && Boolean(agent.rera_number);
  const places = [...(agent.service_localities ?? [])].slice(0, 2).join(' · ');
  const href = '/agents/' + agent.id;
  return (
    <article className="flex h-full w-[88vw] max-w-[380px] shrink-0 snap-start gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:w-auto sm:max-w-none sm:p-5">
      <Link href={href} aria-label={'View ' + title} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-28 sm:w-28">
        {agent.avatar_url
          ? <img src={agent.avatar_url} alt={title} loading="lazy" className="h-full w-full object-cover" />
          : <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-3xl font-semibold text-slate-500">{initials(title)}</span>}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={href}><h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-950 hover:underline">{title}</h3></Link>
        {brokerage && <p className="truncate text-sm text-gray-600">{brokerage}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {agent.rating != null && <p className="text-sm font-bold text-gray-900">{Number(agent.rating).toFixed(1)} <span className="text-amber-500">★</span> <span className="font-normal text-gray-500">({agent.review_count > 0 ? agent.review_count.toLocaleString('en-IN') : 'rating'})</span></p>}
          {verified && <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">✓ GoNest verified</span>}
        </div>
        <div className="mt-2 space-y-0.5 text-sm text-gray-700">
          <p>{SERVICES.join(' · ')}</p>
          {places && <p className="line-clamp-1 text-gray-600">{places}</p>}
        </div>
        <Link href={href} className="mt-auto pt-3 text-sm font-bold text-blue-700 hover:text-blue-900">Explore agent →</Link>
      </div>
    </article>
  );
}

/** Homepage "Agents For You": same public, admin-managed profiles as /agents (directory_visible agents only, enforced by the database). */
export function AgentShowcase({ agents }: { agents: Profile[] }) {
  const list = agents
    .filter(a => a.role === 'agent')
    .sort((a, b) => Number(Boolean(b.agent_verified && b.rera_number)) - Number(Boolean(a.agent_verified && a.rera_number)) || Number(Boolean(b.avatar_url)) - Number(Boolean(a.avatar_url)))
    .slice(0, 6);
  if (list.length === 0) return null;
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Local professionals</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl" style={{ fontFamily: 'var(--font-manrope), var(--font-display)', letterSpacing: '-0.03em' }}>Agents For You</h2>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">Explore local real estate agents and brokerages on GoNest.</p>
          </div>
          <Link href="/agents" className="shrink-0 text-sm font-bold text-blue-700 hover:text-blue-900">Explore agents →</Link>
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {list.map(a => <AgentCard key={a.id} agent={a} />)}
        </div>
        <p className="mt-3 text-xs leading-5 text-gray-500">Profiles are managed by GoNest. A verified badge means GoNest has reviewed the agent’s details; it is not an endorsement or a guarantee of any transaction.</p>
      </div>
    </section>
  );
}
