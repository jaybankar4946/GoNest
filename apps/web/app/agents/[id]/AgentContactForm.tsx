'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = { agentName: string; agentSlug: string; agencyName: string | null };

export function AgentContactForm({ agentName, agentSlug, agencyName }: Props) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [requirement, setRequirement] = useState<'buy' | 'rent' | 'sell' | 'consultation' | 'general'>('buy');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setFeedback({ ok: false, text: 'Please consent to GoNest storing your details to handle this enquiry.' });
      return;
    }
    setSending(true);
    setFeedback(null);
    const reference = `AGT-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    try {
      const { error } = await supabase.from('business_enquiries').insert({
        reference,
        agency_slug: agentSlug,
        agency_name: agencyName?.trim() || agentName,
        requester_name: name.trim(),
        requester_phone: mobile.trim(),
        requester_email: email.trim() || null,
        requirement,
        message: message.trim(),
        consent_at: new Date().toISOString(),
      });
      if (error) throw error;
      setFeedback({ ok: true, text: `Your enquiry has been saved with reference ${reference}. The GoNest team can review and route it. It has not been sent directly to the professional.` });
      setName(''); setMobile(''); setEmail(''); setMessage(''); setConsent(false);
    } catch (error) {
      console.error('Agent enquiry submission failed', error);
      setFeedback({ ok: false, text: 'We could not save your enquiry. Please check your details and try again.' });
    } finally {
      setSending(false);
    }
  }

  const input = 'mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-blue-500';
  return (
    <section id="contact-agent" className="mt-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest enquiry</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Contact {agentName}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Share your requirement and contact details. GoNest will securely record the request for team review and routing.</p>
      </div>
      <form onSubmit={submit} className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Your name<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className={input}/></label>
        <label className="text-sm font-semibold text-slate-700">Mobile number<input required type="tel" minLength={10} maxLength={20} autoComplete="tel" value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="+91 98765 43210" className={input}/></label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Email (optional)<input type="email" maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className={input}/></label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">What do you need?
          <select value={requirement} onChange={e=>setRequirement(e.target.value as typeof requirement)} className={input}>
            <option value="buy">Buying a property</option><option value="rent">Renting a property</option><option value="sell">Selling a property</option><option value="consultation">Property consultation</option><option value="general">General enquiry</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Message<textarea required minLength={5} maxLength={2000} rows={4} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Share your preferred location, budget or requirements." className={input}/></label>
        <label className="flex items-start gap-2 text-xs leading-5 text-slate-600 sm:col-span-2"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/>I agree that GoNest may store and use these details to handle this enquiry.</label>
        <button type="submit" disabled={sending} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2">{sending ? 'Submitting…' : 'Submit enquiry'}</button>
      </form>
      {feedback && <div role="status" aria-live="polite" className={`mt-4 rounded-xl border p-3 text-sm leading-6 ${feedback.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-800'}`}>{feedback.text}</div>}
      <p className="mt-3 text-xs leading-5 text-slate-500">Your enquiry is visible to GoNest administrators for review. Direct delivery to the professional is not yet enabled for this contact route.</p>
    </section>
  );
}
