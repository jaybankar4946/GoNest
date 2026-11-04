import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { THANE_TOP_AGENTS } from '@/lib/thane-agents';
import { BusinessEnquiryForm } from './BusinessEnquiryForm';

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return THANE_TOP_AGENTS.map((agency) => ({ slug: slugify(agency.name) }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agency = THANE_TOP_AGENTS.find(item => slugify(item.name) === slug);
  return { title: agency ? `${agency.name} | GoNest Agent Directory` : 'Agency profile | GoNest', description: agency ? `${agency.name}, ${agency.area}, ${agency.city}. Public business listing on GoNest.` : 'Explore real estate agencies on GoNest.' };
}
export default async function PublicBusinessProfile({ params }: Props) {
  const { slug } = await params;
  const agency = THANE_TOP_AGENTS.find(item => slugify(item.name) === slug);
  if (!agency) notFound();
  return <><Nav/><main className="mx-auto max-w-4xl px-5 py-10 md:px-8">
    <Link href="/agents" className="text-sm font-semibold text-blue-700 hover:underline">← Agent directory</Link>
    <article className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-9">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-extrabold text-slate-600">{agency.name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}</div>
      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-blue-700">Public business listing · {agency.city}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">{agency.name}</h1>
      <p className="mt-2 text-sm font-semibold text-slate-600">{agency.area}, {agency.city}</p>
      <p className="mt-5 text-sm leading-7 text-slate-700">{agency.address}</p>
      <BusinessEnquiryForm agency={{ name: agency.name, slug }} />
    </article>
  </main><Footer/></>;
}
