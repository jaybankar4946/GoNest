import type { Metadata } from 'next';
import { ArrowUpRight, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Contact Us | GoNest',
  description: 'Get in touch with GoNest for property enquiries, listing support, partnerships and general questions.',
};

const topics = [
  { title: 'Property enquiries', description: 'Questions about a home, rental, resale or new project listed on GoNest.' },
  { title: 'Listing support', description: 'Help with submitting, updating or reporting a property listing.' },
  { title: 'Agents and partners', description: 'Connect with GoNest about professional profiles, builder partnerships and collaboration.' },
];

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white text-slate-900">
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700">
              <MessageCircle size={16} /> We’re here to help
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">Contact GoNest</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Have a question about a property, need help with a listing, or want to work with us? Send our team an email and we’ll be glad to hear from you.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.2fr_.8fr] md:py-16">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">How can we help?</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">Choose the topic that best describes your message so we can direct your enquiry to the right place.</p>
            <div className="mt-7 grid gap-4">
              {topics.map(topic => (
                <article key={topic.title} className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-bold">{topic.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{topic.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Mail size={23} /></div>
            <h2 className="text-xl font-bold">Email our team</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">For all general questions and support enquiries, reach us at:</p>
            <a href="mailto:info@gonest.in" className="mt-4 inline-flex items-center gap-2 break-all text-lg font-bold text-blue-700 hover:text-blue-800">
              info@gonest.in <ArrowUpRight size={18} />
            </a>
            <a href="mailto:info@gonest.in" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800">
              <Mail size={17} /> Send us an email
            </a>
            <div className="mt-6 flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={19} />
              <p>For your safety, do not email passwords, OTPs, payment-card details or other sensitive account credentials.</p>
            </div>
          </aside>
        </section>

        <section className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-bold">Looking for your next home?</h2><p className="mt-1 text-sm text-slate-600">Explore homes and projects across India on GoNest.</p></div>
            <Link href="/search" className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">Explore properties</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
