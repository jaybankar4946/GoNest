'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';

export function AdminOnlyFeatureGate({ children }: { children: React.ReactNode }) {
  const { profile, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth?next=' + encodeURIComponent(pathname));
      return;
    }
    if (profile?.role !== 'admin') router.replace('/');
  }, [loading, user, profile, pathname, router]);

  if (loading || !user || profile?.role !== 'admin') {
    return (
      <main className="flex min-h-[55vh] items-center justify-center bg-slate-50 px-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Checking administrator access…</p>
          <p className="mt-2 text-xs text-slate-500">This GoNest workspace is restricted to administrators.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
