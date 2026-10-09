'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';
import { getSavedIds, toggleSaved } from '@/lib/api';
import { track } from '@/lib/track';

const s: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 9999, fontSize: 13, fontWeight: 600, border: '1px solid #111', background: '#fff', color: '#111' };

export function SaveButton({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (user) getSavedIds(user.id).then(ids => setSaved(ids.has(listingId))); }, [user, listingId]);
  if (!user) return <Link href="/auth" style={s}><Heart size={14} />Save</Link>;
  const click = async () => {
    const was = saved; setSaved(!was);
    try { await toggleSaved(user.id, listingId, was); if (!was) track('save', listingId); } catch { setSaved(was); }
  };
  return (
    <button onClick={click} style={s}>
      <Heart size={14} fill={saved ? 'var(--accent)' : 'none'} stroke={saved ? 'var(--accent)' : '#111'} />{saved ? 'Saved' : 'Save'}
    </button>
  );
}
