'use client';

import { useState } from 'react';

export function AgentContactForm({ agentName, phone }: { agentName: string; phone: string | null }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phone) {
      setError('This agent has not published a WhatsApp contact number yet.');
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (!digits) {
      setError('The agent contact number is unavailable.');
      return;
    }
    const body = [
      `Hello ${agentName}, I found your profile on GoNest.`,
      '',
      `My name: ${name}`,
      `My phone: ${mobile}`,
      email ? `My email: ${email}` : '',
      '',
      message,
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <section id="contact-agent" className="mt-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Contact this professional</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Send an enquiry to {agentName}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Share your details and message. GoNest will prepare the enquiry in WhatsApp so you can review and send it directly to the agent.</p>
      </div>
      <form onSubmit={submit} className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Your name
          <input required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-blue-500" />
        </label>
        <label className="text-sm font-semibold text-slate-700">Mobile number
          <input required type="tel" minLength={10} maxLength={15} value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10-digit mobile number" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-blue-500" />
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Email (optional)
          <input type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-blue-500" />
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Your message
          <textarea required minLength={5} maxLength={1500} rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell the agent what you need help with…" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-blue-500" />
        </label>
        {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <button type="submit" disabled={!phone} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Continue to WhatsApp</button>
          <p className="mt-2 text-xs leading-5 text-slate-500">Your message is not sent automatically. WhatsApp opens with the details filled in, and you choose whether to send it.</p>
        </div>
      </form>
    </section>
  );
}
