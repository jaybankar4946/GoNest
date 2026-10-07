'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Tab = 'signin' | 'signup';
type Method = 'password' | 'link' | 'phone';
type Msg = { type: 'ok' | 'err'; text: string };

// Social / phone methods are switched on with env vars once configured in Supabase (see .env.local.example)
const PROVIDERS = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? '').split(',').map(s => s.trim()).filter(Boolean) as Provider[];
const PHONE_ENABLED = process.env.NEXT_PUBLIC_AUTH_PHONE === 'true';
const LABEL: Record<string, string> = { google: 'Google', apple: 'Apple', facebook: 'Facebook' };

const field = 'w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const primary = 'w-full py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors';
const display = { fontFamily: 'var(--font-manrope), var(--font-display)' } as const;

const safeNext = (n: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/dashboard');

function explain(err: { message?: string; status?: number } | null): string {
  const m = err?.message ?? '';
  if (/invalid login credentials/i.test(m)) return 'Incorrect email or password.';
  if (/email not confirmed/i.test(m)) return 'Please confirm your email first. Check your inbox, or resend the link below.';
  if (/already registered/i.test(m)) return 'An account with this email already exists. Try signing in.';
  if (err?.status === 429 || /rate limit|too many/i.test(m)) return 'Too many attempts. Please wait a few minutes and try again.';
  if (/expired|invalid.*(token|otp)|token.*invalid/i.test(m)) return 'That code is invalid or has expired. Request a new one.';
  if (/password/i.test(m) && /(short|weak|least|characters)/i.test(m)) return 'Choose a stronger password (at least 8 characters).';
  if (/sms|phone|provider/i.test(m)) return 'Phone sign-in is not available right now. Please use email instead.';
  return 'Something went wrong. Please try again.';
}

function AuthInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const [tab, setTab] = useState<Tab>(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [method, setMethod] = useState<Method>('password');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (data.session) router.replace(next); }); }, [router, next]);
  useEffect(() => { if (cooldown <= 0) return; const t = setTimeout(() => setCooldown(c => c - 1), 1000); return () => clearTimeout(t); }, [cooldown]);

  const origin = () => window.location.origin;
  const reset = () => { setMsg(null); setNeedsConfirm(false); };
  const fail = (err: { message?: string; status?: number } | null) => setMsg({ type: 'err', text: explain(err) });
  const digits = phone.replace(/\D/g, '').slice(-10);
  const fullPhone = `+91${digits}`;

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault(); reset();
    if (tab === 'signup') {
      if (name.trim().length < 2) return setMsg({ type: 'err', text: 'Please enter your full name.' });
      if (pass.length < 8) return setMsg({ type: 'err', text: 'Choose a password with at least 8 characters.' });
    }
    setBusy(true);
    try {
      if (tab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
        if (error) { if (/not confirmed/i.test(error.message)) setNeedsConfirm(true); fail(error); } else router.replace(next);
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: pass, options: { data: { full_name: name.trim() }, emailRedirectTo: origin() + next } });
        if (error) fail(error);
        else if (data.session) router.replace(next);
        else if (data.user && (data.user.identities?.length ?? 0) === 0) setMsg({ type: 'err', text: 'An account with this email already exists. Try signing in, or reset your password.' });
        else { setNeedsConfirm(true); setMsg({ type: 'ok', text: `We sent a confirmation link to ${email.trim()}. Open it to finish creating your account.` }); }
      }
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: origin() + next } });
    setBusy(false);
    setMsg(error ? { type: 'err', text: explain(error) } : { type: 'ok', text: 'Confirmation email sent again. Check your inbox and spam folder.' });
  };

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault(); reset(); setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: origin() + next, shouldCreateUser: true, data: name.trim() ? { full_name: name.trim() } : undefined } });
    setBusy(false);
    if (error) fail(error); else setMsg({ type: 'ok', text: `We emailed a sign-in link to ${email.trim()}. It works on this device or any other.` });
  };

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault(); reset();
    if (!/^[6-9]\d{9}$/.test(digits)) return setMsg({ type: 'err', text: 'Enter a valid 10-digit mobile number.' });
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return fail(error);
    setOtpSent(true); setCooldown(30); setMsg({ type: 'ok', text: `We sent a 6-digit code to +91 ${digits}.` });
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); reset(); setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp.trim(), type: 'sms' });
    setBusy(false);
    if (error) fail(error); else router.replace(next);
  };

  const oauth = async (provider: Provider) => {
    reset(); setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: origin() + next } });
    if (error) { setBusy(false); fail(error); }
  };

  const forgot = async () => {
    reset();
    if (!email.trim()) return setMsg({ type: 'err', text: 'Enter your email above first.' });
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin()}/auth/reset-password` });
    setMsg(error ? { type: 'err', text: explain(error) } : { type: 'ok', text: 'If that email has an account, a reset link is on its way.' });
  };

  const methods: { id: Method; label: string }[] = [{ id: 'password', label: 'Password' }, { id: 'link', label: 'Email link' }, ...(PHONE_ENABLED ? [{ id: 'phone' as Method, label: 'Phone' }] : [])];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] bg-white border border-gray-200 rounded-3xl shadow-xl p-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"><ChevronLeft size={16} />Back to GoNest</Link>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1" style={{ ...display, letterSpacing: '-0.02em' }}>{tab === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="text-sm text-gray-500 mb-6">{tab === 'signin' ? 'Sign in to save homes and manage enquiries.' : 'Save homes, contact owners and list your property.'}</p>

        <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-6" role="tablist">
          {(['signin', 'signup'] as const).map(t => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); reset(); }} className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{t === 'signin' ? 'Sign in' : 'Create account'}</button>
          ))}
        </div>

        {PROVIDERS.length > 0 && (
          <>
            <div className="space-y-2.5 mb-5">
              {PROVIDERS.map(p => (
                <button key={p} disabled={busy} onClick={() => oauth(p)} className="w-full py-3.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-semibold text-gray-900 disabled:opacity-60 transition-colors">Continue with {LABEL[p] ?? p}</button>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200" /></div>
          </>
        )}

        <div className="flex gap-2 mb-4">
          {methods.map(m => (
            <button key={m.id} onClick={() => { setMethod(m.id); reset(); setOtpSent(false); }} className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${method === m.id ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{m.label}</button>
          ))}
        </div>

        {method === 'password' && (
          <form onSubmit={submitPassword} className="flex flex-col gap-3">
            {tab === 'signup' && <input required autoComplete="name" aria-label="Full name" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className={field} />}
            <input required type="email" autoComplete="email" aria-label="Email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={field} />
            <div className="relative">
              <input required type={show ? 'text' : 'password'} autoComplete={tab === 'signin' ? 'current-password' : 'new-password'} aria-label="Password" placeholder={tab === 'signup' ? 'Password (8+ characters)' : 'Password'} value={pass} onChange={e => setPass(e.target.value)} className={field + ' pr-12'} />
              <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {tab === 'signin' && <button type="button" onClick={forgot} className="self-end text-xs font-semibold text-blue-600 hover:underline">Forgot password?</button>}
            <button disabled={busy} className={primary}>{busy ? 'Please wait…' : tab === 'signin' ? 'Sign in' : 'Create account'}</button>
          </form>
        )}

        {method === 'link' && (
          <form onSubmit={sendLink} className="flex flex-col gap-3">
            {tab === 'signup' && <input autoComplete="name" aria-label="Full name" placeholder="Full name (optional)" value={name} onChange={e => setName(e.target.value)} className={field} />}
            <input required type="email" autoComplete="email" aria-label="Email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={field} />
            <button disabled={busy} className={primary}>{busy ? 'Sending…' : 'Email me a sign-in link'}</button>
            <p className="text-xs text-gray-500">No password needed. We email you a secure one-time link.</p>
          </form>
        )}

        {method === 'phone' && (
          <form onSubmit={otpSent ? verifyOtp : sendOtp} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <span className="px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-gray-50">+91</span>
              <input required inputMode="tel" autoComplete="tel-national" aria-label="Mobile number" placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} disabled={otpSent} className={field} />
            </div>
            {otpSent && <input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-label="6-digit code" placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} className={field + ' tracking-[0.4em] text-center'} />}
            <button disabled={busy} className={primary}>{busy ? 'Please wait…' : otpSent ? 'Verify and continue' : 'Send code'}</button>
            {otpSent && <button type="button" disabled={cooldown > 0 || busy} onClick={() => sendOtp()} className="text-xs font-semibold text-blue-600 disabled:text-gray-400">{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}</button>}
          </form>
        )}

        <div aria-live="polite">
          {msg && <div className={`mt-4 text-sm px-4 py-3 rounded-xl ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.text}</div>}
          {needsConfirm && email && <button onClick={resend} disabled={busy} className="mt-3 text-xs font-semibold text-blue-600 hover:underline disabled:opacity-60">Resend confirmation email</button>}
        </div>

        <p className="text-xs text-gray-400 mt-6 leading-relaxed">By continuing you agree to GoNest&apos;s <Link href="/terms" className="underline">Terms of Use</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
      </div>
    </div>
  );
}

export default function AuthPage() { return (<Suspense fallback={null}><AuthInner /></Suspense>); }
