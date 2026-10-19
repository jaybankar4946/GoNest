import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Builders & Projects | GoNest',
  description: 'Explore builder and project information published by verified GoNest partners.',
};

const MAHARERA = 'https://www.maharera.maharashtra.gov.in/';

export default function BuildersPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-blue-300">GoNest · Builder & project directory</p>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">Compare builders. Explore projects. Verify every detail.</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">A growing directory for Mumbai and Pune homebuyers. Project details and availability are shown only after source review and direct confirmation.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={MAHARERA} target="_blank" rel="noreferrer" className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white hover:bg-blue-400">Verify on official MahaRERA ↗</a>
              <Link href="/search?purpose=sale" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Browse GoNest sale listings →</Link>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-700">⌂</div>
            <p className="mt-5 text-sm font-bold uppercase tracking-widest text-blue-700">Verified directory</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Builder and project listings are being prepared</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">We’ve removed demonstration entries from the public directory. Builder profiles and projects will appear here once a partner is onboarded and the details are reviewed. We won’t present sample inventory as live availability.</p>
            <a href={MAHARERA} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 hover:border-blue-400">Verify registrations on MahaRERA ↗</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
