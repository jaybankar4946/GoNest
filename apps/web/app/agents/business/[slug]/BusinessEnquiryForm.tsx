'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

type Props = { agency: { name: string; slug: string } };

const inputClass = 'mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

export function BusinessEnquiryForm({ agency }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [requirement, setRequirement] = useState('buy');
  const [message, setMessage] = useState(`I would like to enquire about ${agency.name}.`);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setFeedback({ ok: false, text: 'Please consent to GoNest storing these details to handle your enquiry.' });
      return;
    }
    setSending(true);
    setFeedback(null);
    const reference = `BIZ-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    try {
      const { error } = await supabase.from('business_enquiries').insert({
        reference,
        agency_slug: agency.slug,
        agency_name: agency.name,
        requester_name: name.trim(),
        requester_phone: phone.trim(),
        requester_email: email.trim() || null,
        requirement,
        message: message.trim(),
        consent_at: new Date().toISOString(),
      });
      if (error) throw error;
      setFeedback({ ok: true, text: `Your enquiry has been received by GoNest. Reference: ${reference}. Our team will review it and follow up. This public agency has not yet claimed its GoNest profile, so your details have not been sent directly to the agency.` });
      setName(''); setPhone(''); setEmail(''); setMessage('');
      setConsent(false);
    } catch (error) {
      setFeedback({ ok: false, text: error instanceof Error ? error.message : 'We could not save your enquiry. Please try again.' });
    } finally {
      setSending(false);
    }
  }

  return <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6">
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest enquiry</p>
      <h2 className="mt-1 text-xl font-bold text-slate-950">Contact {agency.name}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Tell us what you need. Your request is saved securely in GoNest and reviewed by our team.</p>
    </div>
    <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700">Your name<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} className={inputClass} placeholder="Full name"/></label>
      <label className="text-sm font-semibold text-slate-700">Mobile number<input required minLength={10} maxLength={20} inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} className={inputClass} placeholder="+91 98765 43210"/></label>
      <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Email (optional)<input type="email" maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className={inputClass} placeholder="you@example.com"/></label>
      <label className="text-sm font-semibold text-slate-700 sm:col-span-2">What do you need?
        <select value={requirement} onChange={e=>setRequirement(e.target.value)} className={inputClass}>
          <option value="buy">Buying a property</option><option value="rent">Renting a property</option><option value="sell">Selling a property</option><option value="consultation">Property consultation</option><option value="general">General enquiry</option>
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Message<textarea required minLength={2} maxLength={2000} rows={4} value={message} onChange={e=>setMessage(e.target.value)} className={inputClass} placeholder="Share your location, budget or requirements."/></label>
      <label className="flex items-start gap-2 text-xs leading-5 text-slate-600 sm:col-span-2"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/>I agree that GoNest may store and use these details to respond to this enquiry.</label>
      <button disabled={sending} type="submit" className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">{sending ? 'Submitting…' : 'Submit enquiry'}</button>
    </form>
    {feedback && <div role="status" aria-live="polite" className={`mt-4 rounded-xl border p-3 text-sm leading-6 ${feedback.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-800'}`}>{feedback.text}</div>}
    <p className="mt-3 text-xs leading-5 text-slate-500">This public business profile is not yet claimed or verified on GoNest. Enquiries are visible to GoNest administrators only until the agency is onboarded and verified.</p>
  </section>;
}
