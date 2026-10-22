'use client';

import { useState } from 'react';
import { submitLead } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthProvider';

type ListingOption = { id: string; title: string };

export function AgentEnquiryForm({ listings, agentName }: { listings: ListingOption[]; agentName: string }) {
  const { user, profile } = useAuth();
  const [listingId, setListingId] = useState(listings[0]?.id ?? '');
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!listingId) { setError('Choose a property to enquire about.'); return; }
    setBusy(true); setError(''); setFeedback('');
    try {
      await submitLead({
        consent_at: new Date().toISOString(),
        consent_version: '2026-10-v1',
        listing_id: listingId,
        buyer_id: user?.id ?? null,
        buyer_name: name.trim(),
        buyer_phone: phone.trim(),
        buyer_email: email.trim() || undefined,
        message: message.trim() || `Enquiry sent from the GoNest profile of ${agentName}.`,
      });
      setFeedback('Enquiry sent successfully. The listing owner or agent will follow up with you.');
      setMessage('');
      setConsent(false);
    } catch (e) {
      const m = (e as { message?: string })?.message ?? '';
      setError(m.includes('duplicate_enquiry') ? 'You have already enquired about this property. The agent will follow up.' : 'We could not send your enquiry. Please check your details and try again.');
    } finally { setBusy(false); }
  }

  if (!listings.length) return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><h3 className="font-bold text-slate-900">Enquire with {agentName}</h3><p className="mt-2 text-sm leading-6 text-slate-600">This profile has no active property listings to attach your enquiry to yet. Check back when inventory is published.</p></div>;

  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest · Enquiries</p>
    <h3 className="mt-2 text-xl font-extrabold text-slate-950">Enquire about a property</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">Choose a listing and tell us what you need. The agent will follow up; any visit is pending until confirmed.</p>
    {feedback ? <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{feedback}</p> : <form onSubmit={send} className="mt-4 space-y-3">
      <label className="block text-xs font-semibold text-slate-600">Property<select required value={listingId} onChange={e=>setListingId(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">{listings.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
      <input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/>
      <input required type="tel" minLength={10} maxLength={18} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/>
      <input type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional)" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/>
      <textarea rows={3} maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Preferred configuration, budget or questions…" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/>
      <label className="flex items-start gap-2 text-xs leading-5 text-slate-600"><input required type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/><span>I consent to GoNest using my details to respond and coordinate this request.</span></label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Sending…' : 'Send enquiry'}</button>
    </form>}
  </section>;
}
