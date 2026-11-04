'use client';

import { useState } from 'react';
import { submitBusinessEnquiry } from '@/lib/api';

type Props = {
  agencyName: string;
  agencySlug: string;
  onClose?: () => void;
};

export function BusinessEnquiryForm({ agencyName, agencySlug, onClose }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [requirement, setRequirement] = useState<'buy' | 'rent' | 'sell' | 'general'>('general');
  const [message, setMessage] = useState('I would like to enquire about your real estate services.');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const digits = phone.replace(/\\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      setError('Enter a valid phone number with 10 to 15 digits.');
      return;
    }
    if (!consent) {
      setError('Please provide consent before submitting your enquiry.');
      return;
    }
    setBusy(true);
    try {
      await submitBusinessEnquiry({
        agency_slug: agencySlug,
        agency_name: agencyName,
        requester_name: name.trim(),
        requester_phone: phone.trim(),
        requester_email: email.trim() || undefined,
        requirement,
        message: message.trim(),
        consent_at: new Date().toISOString(),
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not submit your enquiry. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Contact this business</p>
      <h2 className="mt-2 text-xl font-extrabold text-slate-950">Send an enquiry to {agencyName}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Your request is submitted to GoNest for follow-up. It does not message the business directly.</p>
      {sent ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4" role="status">
          <p className="font-bold text-emerald-900">Enquiry received</p>
          <p className="mt-1 text-sm leading-6 text-emerald-800">GoNest has recorded your enquiry for {agencyName}. Keep your phone available for follow-up.</p>
          {onClose && <button type="button" onClick={onClose} className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-800">Close</button>}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Your name
            <input required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="Full name" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Phone number
            <input required type="tel" maxLength={20} value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="Mobile number" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Requirement
            <select value={requirement} onChange={e => setRequirement(e.target.value as typeof requirement)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal">
              <option value="general">General enquiry</option>
              <option value="buy">Buy a property</option>
              <option value="rent">Rent a property</option>
              <option value="sell">Sell a property</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">Email (optional)
            <input type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="you@example.com" />
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Your message
            <textarea required minLength={2} maxLength={2000} rows={4} value={message} onChange={e => setMessage(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
          </label>
          <label className="flex items-start gap-2 text-xs leading-5 text-slate-600 sm:col-span-2">
            <input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1" />
            <span>I agree that GoNest may use these details to respond to this enquiry.</span>
          </label>
          {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            {onClose && <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700">Cancel</button>}
            <button type="submit" disabled={busy} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? 'Submitting…' : 'Submit enquiry'}</button>
          </div>
        </form>
      )}
    </div>
  );
}
