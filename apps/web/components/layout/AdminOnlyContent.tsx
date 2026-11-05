'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

// UI-level access gate. Sensitive data/actions must still be protected by RLS
// and server-side authorization; this component is not a security boundary.
export function AdminOnlyContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') router.replace('/dashboard');
  }, [loading, profile, router]);

  if (loading) return <main className="mx-auto max-w-5xl px-5 py-16 text-sm text-slate-500">Checking administrator access…</main>;
  if (profile?.role !== 'admin') {
    return <main className="mx-auto max-w-5xl px-5 py-16"><h1 className="text-xl font-bold text-slate-900">Administrator access required</h1><p className="mt-2 text-sm text-slate-600">This workspace is available to GoNest administrators only.</p></main>;
  }
  return <>{children}</>;
}
