import Link from 'next/link';
import { BadgeCheck, ClipboardCheck, Flag, Users, Layers, Search, Heart, MessageCircle, ShieldCheck, Check } from 'lucide-react';
import type { Metadata } from 'next';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'About GoNest | How trust works',
  description: 'Learn how GoNest reviews listings, displays verification, supports agent profiles and helps people report listing issues.',
};

const trustSections = [
  { icon: ClipboardCheck, title: 'Reviewed listings', items: ['Checked by the GoNest team before going live', 'Duplicate and unusual-price warnings help reviewers investigate listings', 'Rejected listings should not appear in search'] },
  { icon: BadgeCheck, title: 'Verified badge', items: ['Shown only after the applicable GoNest review step', 'Platform-verified indicates a deeper check where available', 'A badge is not a guarantee of property title or legal ownership'] },
  { icon: Users, title: 'Agent profiles', items: ['RERA number displayed when provided by the agent', 'Verification badge displayed for agents whose verification is confirmed', 'Browse an agent’s active listings from their profile'] },
  { icon: Flag, title: 'Report anything', items: ['Use listing reporting to flag concerns', 'Report reasons can include suspected fake listings, incorrect prices or properties already sold', 'Owners can update a listing’s status when a property is sold or rented'] },
];

const reasons = [
  { icon: ClipboardCheck, title: 'Reviewed before it goes live', desc: 'Listings are submitted for review before being published on GoNest.' },
  { icon: ShieldCheck, title: 'Verified owners and agents', desc: 'Check profile details, verification badges and RERA information where provided. A badge does not replace your own checks.' },
  { icon: Layers, title: 'Everything on one page', desc: 'Review available price, area, BHK, photos, location and contact details together.' },
  { icon: Search, title: 'Search that matches how you look', desc: 'Narrow results by locality, budget, BHK and property type, and use available list or map views.' },
  { icon: Heart, title: 'Save and come back', desc: 'Save homes to your account to revisit and compare them later.' },
  { icon: MessageCircle, title: 'Talk to the owner directly', desc: 'Where available, contact through call, WhatsApp, enquiry or viewing-request options.' },
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="bg-white text-slate-900">
        <section className="border-b border-slate-100 bg-slate-50 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="mb-3 text-sm font-semibold text-blue-700">About GoNest</p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">Property portals show listings. GoNest helps you decide.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">Explore the information behind a listing, understand what a verification badge means, and know how to raise a concern before making your next move.</p>
          </div>
        </section>
        <section className="px-5 py-14 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><ShieldCheck className="h-4 w-4" /> How trust works on GoNest</div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">What “Verified” actually means.</h2>
              <p className="mt-4 leading-7 text-slate-600">A badge only appears after a real review step, and we explain what that review does—and does not—cover. Always confirm important property, price and legal details independently before proceeding.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {trustSections.map((section) => { const Icon = section.icon; return (
                <article key={section.title} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></div>
                  <h3 className="font-bold">{section.title}</h3>
                  <ul className="mt-4 space-y-3">{section.items.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul>
                </article>
              ); })}
            </div>
          </div>
        </section>
        <section className="border-y border-slate-100 bg-slate-50 px-5 py-14 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-3xl">
              <p className="mb-2 text-sm font-semibold text-blue-700">Why GoNest</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">More context for a better decision.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reasons.map((reason) => { const Icon = reason.icon; return (
                <article key={reason.title} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></div>
                  <h3 className="font-bold">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{reason.desc}</p>
                </article>
              ); })}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/buy" className="inline-flex items-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Explore homes</Link>
              <Link href="/rent" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">Find rentals</Link>
              <Link href="/agents" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">Browse agents</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
