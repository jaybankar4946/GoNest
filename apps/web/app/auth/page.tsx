'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Mail, Phone, Chrome, ArrowLeft } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Tab = 'signin' | 'signup';
type Method = 'email' | 'phone' | 'google';
type Msg = { type: 'ok' | 'err'; text: string };

const field = 'w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const primary = 'w-full py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors';
const display = { fontFamily: 'var(--font-manrope), var(--font-display)' } as const;

const safeNext = (n: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/dashboard');

function explain(err: { message?: string; status?: number } | null): string {
  const m = err?.message ?? '';
  if (/rate limit|too many|429/i.test(m)) return 'Too many attempts. Please wait a few minutes and try again.';
  if (/expired|invalid.*(token|otp)|token.*invalid/i.test(m)) return 'That code or link is invalid or has expired. Request a new one.';
  if (/phone.*(not.*enabled|disabled)|sms.*(not.*enabled|disabled)/i.test(m)) return 'Mobile sign-in is not enabled yet. Enable Phone provider and an SMS service in Supabase Auth.';
  if (/provider.*(disabled|not enabled)|unsupported provider|google/i.test(m)) return 'Google sign-in is not enabled yet. Enable Google in Supabase Auth.';
  if (/invalid.*phone|phone.*format/i.test(m)) return 'Enter a valid mobile number, including the country code.';
  if (/email/i.test(m) && /invalid/i.test(m)) return 'Enter a valid email address.';
  return 'Something went wrong. Please try again.';
}

function AuthInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const [tab, setTab] = useState<Tab>(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [method, setMethod] = useState<Method>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) router.replace(next); });
  }, [router, next]);

  const origin = () => window.location.origin;
  const reset = () => { setMsg(null); setOtp(''); setOtpSent(false); };
  const fail = (err: { message?: string; status?: number } | null) => setMsg({ type: 'err', text: explain(err) });

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: origin() + next,
          data: name.trim() ? { full_name: name.trim() } : undefined,
        },
      });
      if (error) fail(error);
      else {
        setOtpSent(true);
        setMsg({ type: 'ok', text: `We sent a secure sign-in email to ${normalized}. Use the link in the email to continue.` });
      }
    } finally { setBusy(false); }
  };

  const sendPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const normalized = phone.trim().replace(/\s+/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setMsg({ type: 'err', text: 'Enter your mobile number with country code, e.g. +91 98765 43210.' });
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalized,
        options: { shouldCreateUser: true, data: name.trim() ? { full_name: name.trim() } : undefined },
      });
      if (error) fail(error);
      else {
        setPhone(normalized);
        setOtpSent(true);
        setMsg({ type: 'ok', text: `We sent a verification code to ${normalized}.` });
      }
    } finally { setBusy(false); }
  };

  const verifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!/^\d{6}$/.test(otp.trim())) {
      setMsg({ type: 'err', text: 'Enter the 6-digit verification code.' });
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: phone.trim(), token: otp.trim(), type: 'sms' });
      if (error) fail(error); else router.replace(next);
    } finally { setBusy(false); }
  };

  const oauth = async () => {
    setMsg(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google' as Provider,
      options: { redirectTo: origin() + next },
    });
    if (error) { setBusy(false); fail(error); }
  };

  const switchMethod = (m: Method) => {
    if (busy) return;
    setMethod(m);
    setMsg(null);
    setOtp('');
    setOtpSent(false);
  };

  const title = tab === 'signin' ? 'Welcome back' : 'Create your GoNest account';
  const subtitle = tab === 'signin'
    ? 'Sign in to save homes, contact professionals and manage enquiries.'
    : 'Create an account to save homes, contact owners and list your property.';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[460px] bg-white border border-gray-200 rounded-3xl shadow-xl p-6 sm:p-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ChevronLeft size={16} />Back to GoNest
        </Link>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-1" style={{ ...display, letterSpacing: '-0.02em' }}>{title}</h1>
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

        <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-5" role="tablist">
          {(['signin', 'signup'] as const).map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => { setTab(t); reset(); }}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              {t === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <div className="space-y-2 mb-5">
          <button
            type="button"
            disabled={busy}
            onClick={() => void oauth()}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            <Chrome size={18} /> Continue with Google
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => switchMethod('email')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${method === 'email' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Mail size={17} /> Email
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => switchMethod('phone')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${method === 'phone' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Phone size={17} /> Mobile
            </button>
          </div>
        </div>

        {method === 'email' && (
          <form onSubmit={sendEmail} className="flex flex-col gap-3">
            {tab === 'signup' && (
              <input
                required
                autoComplete="name"
                aria-label="Full name"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className={field}
              />
            )}
            <input
              required
              type="email"
              autoComplete="email"
              aria-label="Email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={field}
            />
            <button disabled={busy} className={primary}>
              {busy ? 'Sending…' : tab === 'signin' ? 'Continue with Email' : 'Create account with Email'}
            </button>
            {otpSent && (
              <button
                type="button"
                onClick={() => { setOtpSent(false); setMsg(null); }}
                className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                <ArrowLeft size={13} /> Use a different email
              </button>
            )}
            <p className="text-xs text-gray-500 text-center">No password to remember. GoNest will create your account automatically if this email is new.</p>
          </form>
        )}

        {method === 'phone' && !otpSent && (
          <form onSubmit={sendPhone} className="flex flex-col gap-3">
            {tab === 'signup' && (
              <input
                autoComplete="name"
                aria-label="Full name"
                placeholder="Full name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                className={field}
              />
            )}
            <input
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-label="Mobile number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className={field}
            />
            <button disabled={busy} className={primary}>
              {busy ? 'Sending…' : tab === 'signin' ? 'Continue with Mobile' : 'Create account with Mobile'}
            </button>
            <p className="text-xs text-gray-500 text-center">We’ll send a secure SMS verification code. Include your country code.</p>
          </form>
        )}

        {method === 'phone' && otpSent && (
          <form onSubmit={verifyPhone} className="flex flex-col gap-3">
            <label htmlFor="phone-otp" className="text-sm font-semibold text-gray-800">Enter your 6-digit code</label>
            <input
              id="phone-otp"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="\d{6}"
              aria-label="SMS verification code"
              placeholder="123456"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={field + ' text-center tracking-[0.35em] text-lg font-bold'}
            />
            <button disabled={busy} className={primary}>{busy ? 'Verifying…' : 'Verify & continue'}</button>
            <button type="button" disabled={busy} onClick={() => { setOtpSent(false); setOtp(''); setMsg(null); }} className="text-xs font-semibold text-blue-600 hover:underline">
              Use a different number
            </button>
          </form>
        )}

        <div aria-live="polite">
          {msg && <div className={`mt-4 text-sm px-4 py-3 rounded-xl ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.text}</div>}
        </div>

        <p className="text-xs text-gray-400 mt-6 leading-relaxed text-center">
          By continuing, you agree to GoNest&apos;s <Link href="/terms" className="underline">Terms of Use</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return <Suspense fallback={null}><AuthInner /></Suspense>;
}
