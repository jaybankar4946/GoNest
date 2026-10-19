import Link from 'next/link';

type PublicBrokerage = {
  id: string;
  business_name: string;
  public_business_phone: string | null;
  public_enquiry_url: string | null;
  public_business_address: string | null;
  city: { name: string } | { name: string }[] | null;
  source_url: string | null;
};

export function LocalBrokerageDirectory({ brokerages }: { brokerages: PublicBrokerage[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Local professionals · Mumbai & Pune</p>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Publicly listed real-estate businesses</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Contact details are sourced from public business listings for discovery. GoNest has not independently verified these businesses, their RERA status, availability or reviews. Confirm identity and registration before transacting.</p>
      </div>
      {brokerages.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">Local business directory is being refreshed.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brokerages.map((b) => (
            <article key={b.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-extrabold text-slate-950">{b.business_name}</h3>
                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">Not GoNest-verified</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600">{(Array.isArray(b.city) ? b.city[0]?.name : b.city?.name) ?? 'Mumbai / Pune'}</p>
              {b.public_business_address && <p className="mt-3 text-sm leading-5 text-slate-600">{b.public_business_address}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {b.public_business_phone && <a href={'tel:' + b.public_business_phone.replace(/[^\d+]/g, '')} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700">Call business</a>}
                {b.public_enquiry_url && <a href={b.public_enquiry_url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 hover:border-blue-400">View source ↗</a>}
              </div>
              {b.source_url && <p className="mt-3 text-xs text-slate-500">Source: <a className="underline" href={b.source_url} target="_blank" rel="noreferrer">public business listing</a></p>}
            </article>
          ))}
        </div>
      )}
      <p className="mt-5 text-xs leading-5 text-slate-500">Are you a property professional? <Link href="/dashboard" className="font-bold text-blue-700 underline">Create your GoNest profile</Link> to submit genuine listings for review. GoNest verification is separate from this external directory.</p>
    </section>
  );
}
