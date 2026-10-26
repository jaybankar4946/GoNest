import { BadgeCheck, ClipboardCheck, FileCheck2, Flag, ShieldCheck, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'About GoNest | How Trust Works',
  description: 'Learn how GoNest reviews listings, explains verification, and helps people make more informed property decisions.',
};

const sections = [
  {
    icon: ClipboardCheck,
    title: 'Reviewed listings',
    intro: 'A listing is reviewed before it is published on GoNest.',
    points: [
      'The GoNest team checks submitted listing information before it goes live.',
      'Duplicate and unusual-price warnings help reviewers identify listings that need another look.',
      'Rejected listings are not shown in public search.',
    ],
  },
  {
    icon: BadgeCheck,
    title: 'What a Verified badge means',
    intro: 'A badge describes a specific review step. It is not a blanket guarantee.',
    points: [
      'A badge appears only when the relevant GoNest review requirement has been completed.',
      'Identity, listing details, project records and documents are separate checks and may have different statuses.',
      'A badge does not, by itself, guarantee legal title, approvals, future availability or a risk-free transaction.',
    ],
  },
  {
    icon: Users,
    title: 'Agent profiles',
    intro: 'Customers should be able to understand who published a property and what has been checked.',
    points: [
      'Agent RERA details are shown when provided and should be independently checked where applicable.',
      'See available RERA details and each professional’s active listings where provided.',
      'Only profiles returned by the live GoNest directory should be presented as active professionals.',
    ],
  },
  {
    icon: Flag,
    title: 'Report anything',
    intro: 'Help us investigate inaccurate, duplicated or suspicious property information.',
    points: [
      'Report listings that appear fake, duplicated, unavailable or materially different from the advertised details.',
      'Reports are reviewed through the platform’s moderation process.',
      'Submitting a report does not mean an investigation has already been completed.',
    ],
  },
  {
    icon: FileCheck2,
    title: 'Clear costs and documents',
    intro: 'The advertised price is only one part of a property decision.',
    points: [
      'Review disclosed rent, deposit, brokerage, maintenance and other applicable charges before committing.',
      'For purchases, ask for a complete cost sheet and the relevant property and project documents.',
      'Estimated or unconfirmed amounts must be distinguished from confirmed charges.',
    ],
  },
  {
    icon: Flag,
    title: 'Report a problem',
    intro: 'Help us investigate inaccurate, duplicated or suspicious property information.',
    points: [
      'Report listings that appear fake, duplicated, unavailable or materially different from the advertised details.',
      'Reports are reviewed through the platform’s moderation process.',
      'Submitting a report does not mean an investigation has already been completed.',
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white text-slate-900">
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700">
              <ShieldCheck size={16} /> Trust and transparency
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">How trust works on GoNest</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              A clearer way to understand property information, review status and next steps—without treating a badge as a promise that every risk has been eliminated.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-12 md:py-16">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What “Verified” actually means.</h2>
            <p className="mt-3 leading-7 text-slate-600">
              A badge should only appear after the relevant review step. We aim to state plainly what was checked, what was not checked, and when information still needs confirmation.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {sections.map(({ icon: Icon, title, intro, points }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon size={21} />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{intro}</p>
                <ul className="mt-4 space-y-3">
                  {points.map(point => (
                    <li key={point} className="flex gap-3 text-sm leading-6 text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 md:p-6">
            <h2 className="font-bold text-amber-950">Important to know</h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              GoNest listing review is not a substitute for independent legal, title, tax or financial advice. Before paying a token, deposit or purchase amount, confirm the recipient, written terms, refund conditions, documents and applicable charges directly with the relevant parties and qualified professionals.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search" className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Explore properties</Link>
            <Link href="/dashboard/new" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">List with GoNest</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
