import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, ClipboardList, FileCheck2, ImageUp, Layers3 } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Developer Onboarding | GoNest',
  description: 'Learn how residential developers can prepare project and inventory details for GoNest.',
};

const steps = [
  { icon: Building2, title: 'Developer profile', body: 'Prepare your registered business name, official contact details and website.' },
  { icon: Layers3, title: 'Project and unit details', body: 'Organise project name, locality, configurations, carpet area, price range and possession timeline.' },
  { icon: ImageUp, title: 'Media and documents', body: 'Prepare authorised project photos, floor plans, brochure and applicable RERA details.' },
  { icon: FileCheck2, title: 'Review and confirmation', body: 'GoNest should confirm submitted information and communicate any checks still pending before publication.' },
];

export default function DevelopersPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white">
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-200"><Building2 className="h-4 w-4" /> FOR RESIDENTIAL DEVELOPERS</p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">Bring your residential inventory to GoNest.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">Present your projects with useful details, transparent availability and a clearer path from discovery to buyer enquiry.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500">Start with a property listing <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/projects" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">View home listings</Link>
            </div>
            <p className="mt-4 max-w-2xl text-xs leading-5 text-slate-400">The existing listing flow is for individual properties. Bulk project/unit submission and developer-account approval should be confirmed with GoNest before relying on this route for an entire development.</p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">A prepared submission</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">What to have ready</h2><p className="mt-3 text-sm leading-6 text-slate-600">A complete, consistent inventory record makes review easier and helps buyers compare options. Do not publish claims or availability that cannot be substantiated.</p></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {steps.map(({icon:Icon,title,body},i)=><article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></div><p className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-400">STEP 0{i+1}</p><h3 className="mt-2 text-lg font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></article>)}
          </div>
          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 md:p-8">
            <div className="flex items-start gap-3"><ClipboardList className="mt-1 h-5 w-5 shrink-0 text-blue-700" /><div><h3 className="font-bold text-slate-950">Before your project goes live</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700"><li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-700" /> Record the source and last-confirmed date for price and availability.</li><li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-700" /> Keep document-received, review-completed and pending-check statuses distinct.</li><li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-700" /> Display RERA details only when provided and checked against an appropriate source.</li><li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-700" /> Never promise a publication SLA unless the review process supports it.</li></ul></div></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
