'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Mode = 'email' | 'code' | 'password';
type Tab = 'signin' | 'signup';
type Msg = { type: 'ok' | 'err'; text: string };

const display = { fontFamily: 'var(--font-manrope), var(--font-display)' } as const;
const field = 'w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50';
const primary = 'w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60';
const safeNext = (value: string | null) => value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';

function messageFor(error: { message?: string; status?: number } | null) {
  const message = error?.message ?? '';
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.';
  if (/email not confirmed/i.test(message)) return 'Please verify your email before signing in.';
  if (/already registered/i.test(message)) return 'An account with this email already exists. Sign in instead.';
  if (error?.status === 429 || /rate limit|too many/i.test(message)) return 'Too many attempts. Please wait a few minutes and try again.';
  if (/expired|invalid.*(token|otp)|token.*invalid/i.test(message)) return 'That code is invalid or has expired. Request a new code.';
  if (/provider.*(disabled|not enabled)|unsupported provider|google/i.test(message)) return 'Google sign-in is not enabled in GoNest yet. Please use email instead.';
  if (/signup.*disabled|signups not allowed/i.test(message)) return 'New account registration is currently disabled. Please contact GoNest support.';
  return 'We could not complete that request. Please try again.';
}

function AuthInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const [mode, setMode] = useState<Mode>('email');
  const [tab, setTab] = useState<Tab>(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) router.replace(next);
    });
    return () => { active = false; };
  }, [router, next]);

  const clearMessage = () => setMsg(null);

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    clearMessage();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          ...(name.trim() ? { data: { full_name: name.trim() } } : {}),
        },
      });
      if (error) setMsg({ type: 'err', text: messageFor(error) });
      else {
        setCode('');
        setMode('code');
        setMsg({ type: 'ok', text: `A verification code has been sent to ${normalizedEmail}. Check your inbox and spam folder.` });
      }
    } catch {
      setMsg({ type: 'err', text: 'We could not send your code. Check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    clearMessage();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
      setMsg(error ? { type: 'err', text: messageFor(error) } : { type: 'ok', text: 'A new verification code has been sent. Check your inbox.' });
    } catch {
      setMsg({ type: 'err', text: 'We could not resend your code. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    clearMessage();
    const token = code.replace(/\D/g, '');
    if (token.length < 6) {
      setMsg({ type: 'err', text: 'Enter the verification code from your email.' });
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: 'email' });
      if (error) setMsg({ type: 'err', text: messageFor(error) });
      else router.replace(next);
    } catch {
      setMsg({ type: 'err', text: 'We could not verify that code. Please request a new one.' });
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    clearMessage();
    if (tab === 'signup') {
      if (name.trim().length < 2) return setMsg({ type: 'err', text: 'Please enter your full name.' });
      if (password.length < 8) return setMsg({ type: 'err', text: 'Use a password with at least 8 characters.' });
    }
    setBusy(true);
    try {
      if (tab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) setMsg({ type: 'err', text: messageFor(error) });
        else router.replace(next);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin + next },
        });
        if (error) setMsg({ type: 'err', text: messageFor(error) });
        else if (data.session) router.replace(next);
        else setMsg({ type: 'ok', text: 'Account created. Check your email to confirm your address, then sign in.' });
      }
    } catch {
      setMsg({ type: 'err', text: 'We could not complete that request. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = async () => {
    clearMessage();
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google' as Provider,
      options: { redirectTo: window.location.origin + next },
    });
    if (error) {
      setBusy(false);
      setMsg({ type: 'err', text: messageFor(error) });
    }
  };

  const forgotPassword = async () => {
    clearMessage();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setMsg({ type: 'err', text: 'Enter your email address first.' });
      return;
    }
    setBusy(true);
    try {
      const redirectTo = new URL('/auth/reset-password', window.location.origin).toString();
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
      setMsg(error
        ? { type: 'err', text: messageFor(error) }
        : { type: 'ok', text: 'If an account exists for that email, a password reset link is on its way.' });
    } catch {
      setMsg({ type: 'err', text: 'We could not send the reset email. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const backToEmail = () => {
    setMode('email');
    setCode('');
    clearMessage();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-10 sm:px-6">
      <section className="w-full max-w-[440px] rounded-[28px] border border-gray-200/80 bg-white px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.09)] sm:px-9 sm:py-10">
        <div className="mb-7 text-center">
          <Link href="/" aria-label="GoNest home" className="inline-flex items-center justify-center">
            <span className="text-[29px] font-extrabold tracking-[-1.5px] text-gray-950" style={display}>Go<span className="text-blue-600">Nest</span></span>
          </Link>
          <h1 className="mt-5 text-[25px] font-bold tracking-[-0.7px] text-gray-950" style={display}>
            {mode === 'code' ? 'Check your email' : mode === 'password' ? (tab === 'signin' ? 'Welcome back' : 'Create your account') : 'Welcome to GoNest'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {mode === 'code' ? `We sent a verification code to ${email.trim()}.` : mode === 'password' ? 'Access your homes, enquiries and listings.' : 'Sign in or create an account to find your place.'}
          </p>
        </div>

        {mode === 'email' && (
          <>
            <form onSubmit={sendCode} className="space-y-3.5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800">Email address</label>
              <input id="email" required type="email" autoComplete="email" inputMode="email" autoFocus aria-label="Email address" placeholder="Enter your email address" value={email} onChange={event => setEmail(event.target.value)} className={field} />
              <button disabled={busy || !email.trim()} className={primary}>{busy ? 'Sending code…' : 'Continue'}</button>
            </form>
            <p className="mt-3 text-center text-xs text-gray-500">We’ll email you a secure one-time verification code.</p>
          </>
        )}

        {mode === 'code' && (
          <form onSubmit={verifyCode} className="space-y-4">
            <label htmlFor="verification-code" className="block text-sm font-semibold text-gray-800">Email verification code</label>
            <input
              id="verification-code"
              required
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              aria-label="Email verification code"
              placeholder="Enter the code from your email"
              value={code}
              onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))}
              className={field + ' text-center text-xl font-semibold tracking-[0.35em]'}
            />
            <button disabled={busy || code.replace(/\D/g, '').length < 6} className={primary}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={backToEmail} className="font-semibold text-gray-600 hover:text-gray-900">Change email</button>
              <button type="button" disabled={busy} onClick={resendCode} className="font-semibold text-blue-600 hover:underline disabled:opacity-50">Resend code</button>
            </div>
          </form>
        )}

        {mode === 'password' && (
          <form onSubmit={submitPassword} className="space-y-3">
            <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1" role="tablist" aria-label="Account action">
              {(['signin', 'signup'] as const).map(value => (
                <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => { setTab(value); clearMessage(); }} className={`rounded-lg py-2.5 text-sm font-semibold transition ${tab === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{value === 'signin' ? 'Sign in' : 'Create account'}</button>
              ))}
            </div>
            {tab === 'signup' && <input required autoComplete="name" aria-label="Full name" placeholder="Full name" value={name} onChange={event => setName(event.target.value)} className={field} />}
            <input required type="email" autoComplete="email" aria-label="Email address" placeholder="Email address" value={email} onChange={event => setEmail(event.target.value)} className={field} />
            <div className="relative">
              <input required minLength={tab === 'signup' ? 8 : undefined} type={showPassword ? 'text' : 'password'} autoComplete={tab === 'signin' ? 'current-password' : 'new-password'} aria-label="Password" placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} className={field + ' pr-12'} />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {tab === 'signin' && <button type="button" onClick={forgotPassword} disabled={busy} className="block w-full text-right text-xs font-semibold text-blue-600 hover:underline">Forgot password?</button>}
            <button disabled={busy} className={primary}>{busy ? 'Please wait…' : tab === 'signin' ? 'Sign in' : 'Create account'}</button>
          </form>
        )}

        {mode !== 'code' && (
          <>
            <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-gray-200" /><span className="text-xs text-gray-500">OR</span><span className="h-px flex-1 bg-gray-200" /></div>
            <button type="button" onClick={googleSignIn} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60">
              <span aria-hidden="true" className="text-lg font-bold leading-none text-[#4285F4]">G</span>
              Continue with Google
            </button>
            {mode === 'email' ? (
              <button type="button" onClick={() => { setMode('password'); clearMessage(); }} className="mt-4 block w-full text-center text-sm font-semibold text-blue-600 hover:underline">Use email and password instead</button>
            ) : (
              <button type="button" onClick={() => { setMode('email'); clearMessage(); }} className="mt-4 block w-full text-center text-sm font-semibold text-blue-600 hover:underline">Use email verification code instead</button>
            )}
          </>
        )}

        <div aria-live="polite" className="min-h-0">
          {msg && <div className={`mt-5 rounded-xl px-4 py-3 text-sm leading-5 ${msg.type === 'ok' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>{msg.text}</div>}
        </div>

        <p className="mt-7 text-center text-[11px] leading-5 text-gray-400">
          By continuing, you agree to GoNest’s <Link href="/terms" className="font-medium text-gray-600 underline underline-offset-2">Terms of Use</Link> and <Link href="/privacy" className="font-medium text-gray-600 underline underline-offset-2">Privacy Policy</Link>.
        </p>
        <Link href="/" className="mt-5 flex items-center justify-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"><ArrowLeft size={13} /> Back to GoNest</Link>
      </section>
    </main>
  );
}

export default function AuthPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#f7f8fa]" />}><AuthInner /></Suspense>;
}
