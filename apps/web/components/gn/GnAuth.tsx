'use client';
import { useState } from 'react';
import { Mail, Lock, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = { onBack: () => void; onSuccess: () => void };

export function GnAuth({ onBack, onSuccess }: Props) {
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    width: '100%',
    border: '1px solid #E5E5E5',
    borderRadius: 12,
    padding: '12px 14px 12px 40px',
    outline: 'none',
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check your email to confirm your account.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Magic link sent. Check your inbox.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#FFFFFF' }}>
      <div className="w-full" style={{ maxWidth: 360 }}>
        <button onClick={onBack} className="flex items-center gap-1.5 mb-8 text-sm" style={{ color: '#6B6B6B', fontFamily: 'var(--font-body)' }}>
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#111111', letterSpacing: '-0.02em', marginBottom: 8 }}>
          {mode === 'password' ? (isSignUp ? 'Create account' : 'Welcome back') : 'Sign in with email'}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B6B6B', marginBottom: 32 }}>
          {mode === 'password' ? 'Sign in to save properties and manage your listings.' : "We'll email you a secure link to sign in."}
        </p>

        <form onSubmit={mode === 'password' ? handlePasswordAuth : handleMagicLink} className="flex flex-col gap-3">
          <div className="relative">
            <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9B9B9B' }} />
            <input type="email" required placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </div>

          {mode === 'password' && (
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9B9B9B' }} />
              <input type="password" required placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            </div>
          )}

          {message && (
            <div className="text-sm px-3 py-2 rounded-xl" style={{
              fontFamily: 'var(--font-body)',
              background: message.type === 'error' ? '#FEF2F2' : '#F0FDF4',
              color: message.type === 'error' ? '#DC2626' : '#16A34A',
            }}>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-full text-sm font-semibold mt-1 disabled:opacity-50"
            style={{ background: '#111111', color: 'white', fontFamily: 'var(--font-body)' }}>
            {loading ? 'Please wait…' : mode === 'password' ? (isSignUp ? 'Create account' : 'Sign in') : 'Send magic link'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1" style={{ background: '#E5E5E5' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9B9B9B' }}>or</span>
          <div className="h-px flex-1" style={{ background: '#E5E5E5' }} />
        </div>

        <button
          onClick={() => { setMode(mode === 'password' ? 'magic' : 'password'); setMessage(null); }}
          className="w-full py-3 rounded-full text-sm font-medium"
          style={{ border: '1px solid #111111', color: '#111111', fontFamily: 'var(--font-body)' }}
        >
          {mode === 'password' ? 'Continue with magic link' : 'Continue with password'}
        </button>

        {mode === 'password' && (
          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-4 text-sm text-center"
            style={{ color: '#6B6B6B', fontFamily: 'var(--font-body)' }}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        )}
      </div>
    </div>
  );
}
