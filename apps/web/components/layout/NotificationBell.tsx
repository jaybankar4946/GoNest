'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { getUnreadCount } from '@/lib/api';
export function NotificationBell() {
  const { user } = useAuth();
  const path = usePathname();
  const [n, setN] = useState(0);
  useEffect(() => { if (!user) { setN(0); return; } getUnreadCount().then(setN); const t = setInterval(() => getUnreadCount().then(setN), 60000); return () => clearInterval(t); }, [user, path]);
  if (!user) return null;
  return (
    <Link href="/notifications" aria-label={n ? `${n} unread notifications` : 'Notifications'} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', color: '#6B6B6B' }}>
      <Bell size={16} />
      {n > 0 && <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 9999, background: '#DC2626', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n > 9 ? '9+' : n}</span>}
    </Link>
  );
}
