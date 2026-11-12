import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { getPublicBrokerageBySlug } from '@/lib/api';
import { BusinessEnquiryForm } from './BusinessEnquiryForm';

type Props = { params: Promise<{ slug: string }> };
async function load(slug: string) { return getPublicBrokerageBySlug(slug); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agency = await load(slug);
  return { title: agency ? `${agency.business_name} | GoNest Agent Directory` : 'Agency profile | GoNest', description: agency ? `${agency.business_name}, ${agency.public_business_address ?? ''}. Public business listing on GoNest.` : 'Explore real estate agencies on GoNest.' };
}
export default async function PublicBusinessProfile({ params }: Props) {
  const { slug } = await params;
  const agency = await load(slug);
  if (!agency) notFound();
  const name = agency.business_name;
  const city = agency.city?.name ?? '';
  const address = agency.public_business_address ?? 'Address not provided';
  const areas = (agency.localities ?? []).join(' · ');
  const pin = address.match(/\b\d{6}\b/)?.[0] ?? null;
  const verified = agency.verification_status === 'verified';
  return <><Nav/><main className="mx-auto max-w-4xl px-5 py-10 md:px-8">
    <Link href="/agents" className="text-sm font-semibold text-blue-700 hover:underline">← Agent directory</Link>
    <article className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-28 items-center gap-5 bg-slate-50 px-6 md:px-9">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-600">{name.split(/\s+/).slice(0,2).map((w:string)=>w[0]).join('').toUpperCase()}</div>
        <div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Real estate agency · {city}</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">{name}</h1></div>
      </div>
      <div className="p-6 md:p-9">
        <div className="flex flex-wrap gap-2">
          <span className={"rounded-full px-3 py-1.5 text-xs font-semibold " + (verified ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700")}>{verified ? 'GoNest verified business' : 'Public business profile · not GoNest verified'}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{agency.rera_registration ? 'RERA details submitted' : 'RERA details not provided'}</span>
          {pin && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{pin}</span>}
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">0 active GoNest listings</span>
        </div>
        {areas && <p className="mt-5 text-sm font-semibold text-slate-800">{areas}</p>}
        <p className="mt-3 text-sm leading-7 text-slate-700">{address}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {agency.public_business_phone && <a href={'tel:' + agency.public_business_phone.replace(/[^+\d]/g, '')} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Call agency</a>}
          {agency.website_url && <a href={agency.website_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">Official website</a>}
          <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address)} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800">Directions</a>
        </div>
      </div>
    </article>
    <div id="contact-agency"><BusinessEnquiryForm agency={{ name, slug }} /></div>
  </main><Footer/></>
}
