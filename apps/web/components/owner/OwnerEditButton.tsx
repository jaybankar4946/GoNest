'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';

export function OwnerEditButton({ kind, id, ownerId }: { kind: 'listing' | 'profile'; id: string; ownerId: string }) {
  const { user, loading } = useAuth();
  if (loading || !user || user.id !== ownerId) return null;

  const href = kind === 'listing' ? `/dashboard/edit/${id}` : '/dashboard/settings';
  return (
    <Link
      href={href}
      aria-label={kind === 'listing' ? 'Edit listing' : 'Edit profile'}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50"
    >
      <Pencil size={14} />
      {kind === 'listing' ? 'Edit listing' : 'Edit profile'}
    </Link>
  );
}
