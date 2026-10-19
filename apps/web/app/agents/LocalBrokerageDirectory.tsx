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
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700">Additional directory</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">Local real-estate businesses</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Public business listings can help with discovery, but are not endorsements. GoNest has not independently verified these businesses, their RERA status, availability or reviews.</p>
          </div>
          <a href="https://maharera.maharashtra.gov.in/" target="_blank" rel="noreferrer" className="shrink-0 text-sm font-bold text-blue-700 hover:underline">Check MahaRERA ↗</a>
        </div>
        {brokerages.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No additional public business listings are available at the moment. Browse GoNest professional profiles above or create a profile to join the directory.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {brokerages.map((b) => (
              <article key={b.id} className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm">
                <h3 className="break-words text-lg font-bold text-slate-950">{b.business_name}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">{(Array.isArray(b.city) ? b.city[0]?.name : b.city?.name) ?? 'Mumbai / Pune'}</p>
                {b.public_business_address && <p className="mt-3 text-sm leading-6 text-slate-600">{b.public_business_address}</p>}
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  {b.public_business_phone && <a href={'tel:' + b.public_business_phone.replace(/[^\d+]/g, '')} className="inline-flex min-h-10 items-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800">Call business</a>}
                  {b.public_enquiry_url && <a href={b.public_enquiry_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-blue-400">View source ↗</a>}
                </div>
                {b.source_url && <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Source: <a className="font-semibold underline underline-offset-2 hover:text-blue-700" href={b.source_url} target="_blank" rel="noreferrer">public business listing</a></p>}
              </article>
            ))}
          </div>
        )}
        <p className="mt-5 text-xs leading-5 text-slate-500">Verify identity and registration independently before transacting. GoNest profile verification is separate from external business listings. Are you a property professional? <Link href="/dashboard" className="font-bold text-blue-700 underline underline-offset-2">Create your GoNest profile</Link>.</p>
      </div>
    </section>
  );
}
