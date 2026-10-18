'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowRight, Building2, CheckCircle2, ClipboardList, Home, Search, ShieldAlert, UserRound, Users } from 'lucide-react';

type Role = 'customer' | 'owner' | 'agent' | 'builder';

const roles: { id: Role; label: string; description: string; icon: typeof Home }[] = [
  { id: 'customer', label: 'Customer', description: 'Find a home and send an enquiry', icon: Search },
  { id: 'owner', label: 'Owner', description: 'Prepare a property listing', icon: Home },
  { id: 'agent', label: 'Agent', description: 'Review a lead and schedule a visit', icon: Users },
  { id: 'builder', label: 'Builder', description: 'Submit a project and inventory', icon: Building2 },
];

const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

export default function DemoModePage() {
  const [role, setRole] = useState<Role>('customer');
  const [submitted, setSubmitted] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  function changeRole(next: Role) {
    setRole(next);
    setSubmitted(false);
  }

  function simulate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const selected = roles.find((item) => item.id === role)!;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-xl font-black tracking-tight">GoNest<span className="text-blue-600">.</span></Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 sm:inline-flex">PREVIEW ONLY</span>
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-950">Back to website</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800"><ClipboardList size={14} /> WORKFLOW TEST CENTRE</div>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">Test GoNest without logging in.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">Switch between Customer, Owner, Agent and Builder to try the main forms and review each journey from one place.</p>
        </div>

        <div role="alert" className="mb-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <ShieldAlert className="mt-0.5 shrink-0" size={21} />
          <div>
            <p className="font-bold">Safe demo mode — no sign-in, no real submission.</p>
            <p className="mt-1 text-sm leading-6">Forms on this page only simulate success in your browser. They do not create listings, contact customers, send notifications, or save data to GoNest. Real authenticated workflows must still be tested separately in a staging environment.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="Choose a role">
          {roles.map((item) => {
            const Icon = item.icon;
            const active = item.id === role;
            return (
              <button key={item.id} type="button" role="tab" aria-selected={active} onClick={() => changeRole(item.id)} className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${active ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <span className={`mb-3 inline-flex rounded-xl p-2.5 ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}><Icon size={20} /></span>
                <span className="block font-bold">{item.label}</span>
                <span className="mt-1 block text-sm leading-5 text-slate-600">{item.description}</span>
              </button>
            );
          })}
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{selected.label} journey</p>
              <h2 className="mt-1 text-2xl font-extrabold">{role === 'customer' ? 'Find a home & enquire' : role === 'owner' ? 'Prepare a property listing' : role === 'agent' ? 'Capture a buyer lead' : 'Submit a project inventory'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Complete the sample form to check field layout, required inputs and the confirmation state.</p>
            </div>

            {role === 'customer' && <form onSubmit={simulate} className="space-y-4">
              <div><label className={labelClass} htmlFor="c-location">Preferred locality</label><input id="c-location" required placeholder="e.g. Andheri West, Mumbai" className={fieldClass} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass} htmlFor="c-budget">Budget (₹)</label><input id="c-budget" required type="number" min="1" placeholder="e.g. 15000000" className={fieldClass} /></div><div><label className={labelClass} htmlFor="c-purpose">Looking to</label><select id="c-purpose" className={fieldClass}><option>Buy</option><option>Rent</option></select></div></div>
              <div><label className={labelClass} htmlFor="c-contact">Test contact email</label><input id="c-contact" required type="email" placeholder="you@example.com" className={fieldClass} /></div>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700">Simulate property enquiry <ArrowRight size={16} /></button>
            </form>}

            {role === 'owner' && <form onSubmit={simulate} className="space-y-4">
              <div><label className={labelClass} htmlFor="o-title">Property title</label><input id="o-title" required placeholder="e.g. 2 BHK apartment in Powai" className={fieldClass} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass} htmlFor="o-type">Property type</label><select id="o-type" className={fieldClass}><option>Apartment</option><option>Villa / house</option><option>Plot</option><option>Commercial</option></select></div><div><label className={labelClass} htmlFor="o-price">Expected price (₹)</label><input id="o-price" required type="number" min="1" placeholder="e.g. 12000000" className={fieldClass} /></div></div>
              <div><label className={labelClass} htmlFor="o-location">Locality and city</label><input id="o-location" required placeholder="e.g. Powai, Mumbai" className={fieldClass} /></div>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700">Simulate listing submission <ArrowRight size={16} /></button>
            </form>}

            {role === 'agent' && <form onSubmit={simulate} className="space-y-4">
              <div><label className={labelClass} htmlFor="a-name">Lead name</label><input id="a-name" required placeholder="Sample customer name" className={fieldClass} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass} htmlFor="a-stage">Lead stage</label><select id="a-stage" className={fieldClass}><option>New enquiry</option><option>Contacted</option><option>Visit scheduled</option><option>Negotiation</option></select></div><div><label className={labelClass} htmlFor="a-date">Proposed visit date</label><input id="a-date" required type="date" className={fieldClass} /></div></div>
              <div><label className={labelClass} htmlFor="a-notes">Follow-up notes</label><textarea id="a-notes" rows={3} placeholder="Add a sample follow-up note" className={fieldClass} /></div>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700">Simulate lead update <ArrowRight size={16} /></button>
            </form>}

            {role === 'builder' && <form onSubmit={simulate} className="space-y-4">
              <div><label className={labelClass} htmlFor="b-project">Project name</label><input id="b-project" required placeholder="e.g. Sample Heights" className={fieldClass} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass} htmlFor="b-units">Available units</label><input id="b-units" required type="number" min="1" placeholder="e.g. 24" className={fieldClass} /></div><div><label className={labelClass} htmlFor="b-price">Starting price (₹)</label><input id="b-price" required type="number" min="1" placeholder="e.g. 8500000" className={fieldClass} /></div></div>
              <div><label className={labelClass} htmlFor="b-location">Project locality</label><input id="b-location" required placeholder="e.g. Thane West, Maharashtra" className={fieldClass} /></div>
              <div><label className={labelClass} htmlFor="b-rera">RERA number (if applicable)</label><input id="b-rera" placeholder="Enter a sample RERA ID" className={fieldClass} /></div>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700">Simulate project submission <ArrowRight size={16} /></button>
            </form>}

            {submitted && <div role="status" className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"><CheckCircle2 className="mt-0.5 shrink-0" size={20} /><div><p className="font-bold">Demo journey completed</p><p className="mt-1 text-sm">The form and confirmation state worked. Nothing was saved or sent. Switch roles above to test another journey.</p></div></div>}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <h3 className="text-lg font-extrabold">Workflow checklist</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">Mark each visual check as you go. Your checklist stays in this page session only.</p>
            <div className="mt-5 space-y-3">
              {['Page loads and layout looks correct', 'Required fields show validation', 'Form accepts sample data', 'Confirmation message is clear', 'Mobile layout is usable'].map((item) => <label key={item} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-3 text-sm leading-5 text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={!!checks[`${role}:${item}`]} onChange={(e) => setChecks((old) => ({ ...old, [`${role}:${item}`]: e.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span>{item}</span></label>)}
            </div>
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">Want to test the live browsing experience?</p>
              <p className="mt-1 text-sm leading-5 text-slate-600">Open the public search and property pages separately. Actions that save or manage private data may still ask you to sign in.</p>
              <Link href="/search" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900">Browse property search <ArrowRight size={15} /></Link>
            </div>
          </aside>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-5 text-xs text-slate-500">
          <span>GoNest Workflow Test Centre · Preview only</span>
          <span>No account data, customer messages or production records are changed.</span>
        </footer>
      </div>
    </main>
  );
}
