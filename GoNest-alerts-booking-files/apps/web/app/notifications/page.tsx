'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api';
import { timeAgo } from '@/lib/format';

type N = Awaited<ReturnType<typeof getNotifications>>[number];
export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<N[]>([]);
  const [busy, setBusy] = useState(true);
  useEffect(() => { if (loading) return; if (!user) { setBusy(false); return; } getNotifications().then(setItems).finally(() => setBusy(false)); }, [user, loading]);
  const open = async (n: N) => { if (!n.read_at) { setItems(p => p.map(x => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)); await markNotificationRead(n.id); } if (n.link) router.push(n.link); };
  const unread = items.filter(i => !i.read_at).length;
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px', minHeight: '60vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-manrope), var(--font-display)', fontSize: 28, fontWeight: 800 }}>Notifications</h1>
          {unread > 0 && <button onClick={async () => { await markAllNotificationsRead(); setItems(p => p.map(x => ({ ...x, read_at: x.read_at ?? new Date().toISOString() }))); }} style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>Mark all as read</button>}
        </div>
        {!user && !loading ? <p style={{ color: '#6B7280' }}><Link href="/auth?next=/notifications" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Sign in</Link> to see your notifications.</p>
          : busy ? <p style={{ color: '#6B7280' }}>Loading…</p>
          : items.length === 0 ? <p style={{ color: '#6B7280' }}>Nothing yet. You will see enquiry updates, visit confirmations, listing decisions and saved-search matches here.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(n => (
                <button key={n.id} onClick={() => open(n)} style={{ textAlign: 'left', border: '1px solid #E5E7EB', borderRadius: 16, padding: '14px 16px', background: n.read_at ? '#fff' : '#EFF6FF', display: 'flex', gap: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.read_at ? 'transparent' : 'var(--primary)', marginTop: 6, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}><span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{n.title}</span>{n.body && <span style={{ display: 'block', fontSize: 13, color: '#4B5563', marginTop: 2 }}>{n.body}</span>}<span style={{ display: 'block', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{timeAgo(n.created_at)}</span></span>
                </button>))}
            </div>}
      </main>
      <Footer />
    </>
  );
}
