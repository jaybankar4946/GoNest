'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Tab = 'signin' | 'signup';
type Method = 'password' | 'link' | 'google';
type Msg = { type: 'ok' | 'err'; text: string };

// Social / phone methods are switched on with env vars once configured in Supabase (see .env.local.example)
const PROVIDERS = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? '').split(',').map(s => s.trim()).filter(Boolean) as Provider[];
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
  if (/provider.*(disabled|not enabled)|unsupported provider|google/i.test(m)) return 'Google sign-in is not enabled yet. Please use email for now, or enable Google in Supabase Auth settings.';
  
  return 'Something went wrong. Please try again.';
}

function AuthInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const [tab, setTab] = useState<Tab>(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [method, setMethod] = useState<Method>('password');
  const [name, setName] = useState('');
  const [signupRole, setSignupRole] = useState<'buyer' | 'owner' | 'agent' | 'builder'>('buyer');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (data.session) router.replace(next); }); }, [router, next]);

  const origin = () => window.location.origin;
  const reset = () => { setMsg(null); setNeedsConfirm(false); };
  const fail = (err: { message?: string; status?: number } | null) => setMsg({ type: 'err', text: explain(err) });

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
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: pass, options: { data: { full_name: name.trim(), role: signupRole }, emailRedirectTo: origin() + next } });
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
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: origin() + next, shouldCreateUser: true, data: { ...(name.trim() ? { full_name: name.trim() } : {}), role: signupRole } } });
    setBusy(false);
    if (error) fail(error); else setMsg({ type: 'ok', text: `We emailed a sign-in link to ${email.trim()}. It works on this device or any other.` });
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

  const methods: { id: Method; label: string }[] = [{ id: 'password', label: 'Email + password' }, { id: 'link', label: 'Email link' }, { id: 'google', label: 'Google' }];

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

        <div className="flex flex-wrap gap-2 mb-4">
          {methods.map(m => (
            <button key={m.id} disabled={busy} onClick={() => { if(m.id==='google'){ void oauth('google'); return; } setMethod(m.id); reset(); }} className={`flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-60 ${method === m.id ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`} aria-pressed={method===m.id}>{m.id==='google'?'Continue with Google':m.label}</button>
          ))}
        </div>

        {method === 'password' && (
          <form onSubmit={submitPassword} className="flex flex-col gap-3">
            {tab === 'signup' && <>
              <input required autoComplete="name" aria-label="Full name" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className={field} />
              <label className="block text-xs font-semibold text-gray-600">Account type
                <select aria-label="Account type" value={signupRole} onChange={e => setSignupRole(e.target.value as typeof signupRole)} className={field + ' mt-1'}>
                  <option value="buyer">Buyer / renter</option><option value="owner">Property owner</option><option value="agent">Real estate agent</option><option value="builder">Builder / developer</option>
                </select>
              </label>
            </>}
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
            {tab === 'signup' && <>
              <input autoComplete="name" aria-label="Full name" placeholder="Full name (optional)" value={name} onChange={e => setName(e.target.value)} className={field} />
              <label className="block text-xs font-semibold text-gray-600">Account type
                <select aria-label="Account type" value={signupRole} onChange={e => setSignupRole(e.target.value as typeof signupRole)} className={field + ' mt-1'}>
                  <option value="buyer">Buyer / renter</option><option value="owner">Property owner</option><option value="agent">Real estate agent</option><option value="builder">Builder / developer</option>
                </select>
              </label>
            </>}
            <input required type="email" autoComplete="email" aria-label="Email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={field} />
            <button disabled={busy} className={primary}>{busy ? 'Sending…' : 'Email me a sign-in link'}</button>
            <p className="text-xs text-gray-500">No password needed. We email you a secure one-time link. You can use it to sign in or create an account.</p>
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
