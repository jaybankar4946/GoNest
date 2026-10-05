'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { getMyEnquiries, getMyVisitRequests } from '@/lib/api';
import { timeAgo } from '@/lib/format';

const COLORS: Record<string, string> = { new: '#2563EB', contacted: '#D97706', qualified: '#16A34A', closed: '#6B7280', spam: '#DC2626', requested: '#D97706', confirmed: '#16A34A', completed: '#6B7280', cancelled: '#DC2626' };
const Chip = ({ s }: { s: string }) => <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: (COLORS[s] ?? '#6B7280') + '1A', color: COLORS[s] ?? '#6B7280' }}>{s}</span>;

export default function EnquiriesPage() {
  const { user, loading } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    if (loading) return;
    if (!user) { setBusy(false); return; }
    Promise.all([getMyEnquiries(user.id), getMyVisitRequests(user.id)]).then(([l, v]) => { setLeads(l); setVisits(v); }).finally(() => setBusy(false));
  }, [user, loading]);
  const title = (x: any) => x.listing?.title ?? 'Listing no longer available';
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px', minHeight: '60vh' }}>
        <h1 style={{ fontFamily: 'var(--font-manrope), var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 24 }}>My enquiries</h1>
        {!user && !loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><p style={{ color: '#6B7280', marginBottom: 16 }}>Sign in to see the enquiries and visit requests you have sent.</p><Link href="/auth" style={{ background: 'var(--primary)', color: '#fff', padding: '10px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14 }}>Sign in</Link></div>
        ) : busy ? <p style={{ color: '#6B7280' }}>Loading…</p> : leads.length + visits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><p style={{ color: '#6B7280', marginBottom: 16 }}>You haven't contacted any property yet while signed in.</p><Link href="/search" style={{ border: '1px solid var(--primary)', color: 'var(--primary)', padding: '10px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14 }}>Browse properties</Link></div>
        ) : (
          <>
            {leads.length > 0 && <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Enquiries</h2>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {leads.map(l => (
                <div key={l.id} style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div><p style={{ fontWeight: 600, fontSize: 14 }}>{l.listing?.status === 'active' ? <Link href={`/property/${l.listing.id}`} style={{ textDecoration: 'underline' }}>{title(l)}</Link> : title(l)}</p>
                    {l.message && <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>“{l.message}”</p>}
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Sent {timeAgo(l.created_at)}</p></div>
                  <Chip s={l.status} />
                </div>))}
            </div>
            {visits.length > 0 && <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Visit requests</h2>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visits.map(v => (
                <div key={v.id} style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div><p style={{ fontWeight: 600, fontSize: 14 }}>{title(v)}</p><p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{v.slot_date} at {v.slot_time}</p></div>
                  <Chip s={v.status} />
                </div>))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
