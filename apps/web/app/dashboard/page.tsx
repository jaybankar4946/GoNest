'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { getMyListings, getMyLeads, getMyVisits } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
 
const STATUS_COLOR: Record<string,string> = { active:'#16A34A', pending_review:'#D97706', rejected:'#DC2626', draft:'#6B6B6B', archived:'#6B6B6B' };
 
export default function DashboardPage() {
  const router  = useRouter();
  const { user, profile, signOut, loading } = useAuth();
  const [tab,      setTab]     = useState<'listings'|'leads'|'visits'>('listings');
  const [listings, setListings] = useState<any[]>([]);
  const [leads,    setLeads]    = useState<any[]>([]);
  const [visits,   setVisits]   = useState<any[]>([]);
 
  useEffect(() => { if (!loading && !user) router.push('/auth'); }, [loading, user, router]);
  useEffect(() => {
    if (!user) return;
    getMyListings(user.id).then(setListings);
    getMyLeads(user.id).then(setLeads);
    getMyVisits(user.id).then(setVisits);
  }, [user]);
 
  const canPost = ['owner','agent','admin'].includes(profile?.role ?? '');
  const tabStyle = (t: string): React.CSSProperties => ({
    padding:'8px 18px', borderRadius:9999, fontSize:13,
    fontWeight: tab===t ? 600 : 400,
    color: tab===t ? '#111' : '#6B6B6B',
    background: tab===t ? '#F7F7F7' : 'transparent',
    border: 'none', cursor: 'pointer',
  });
 
  return (
    <>
      <Nav />
      <main style={{ maxWidth:1000, margin:'0 auto', padding:'40px 24px 80px' }}>
 
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:36 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#111', letterSpacing:'-0.02em', marginBottom:4 }}>Account</h1>
            <p style={{ fontSize:13, color:'#6B6B6B' }}>{user?.email} · {profile?.role ?? 'buyer'}</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {canPost && (
              <Link href="/dashboard/new"
                style={{ padding:'8px 18px', borderRadius:9999, fontSize:13, fontWeight:600, color:'#fff', background:'#111', display:'inline-flex', alignItems:'center', gap:6 }}>
                + New listing
              </Link>
            )}
            <button onClick={async () => { await signOut(); router.push('/'); }}
              style={{ padding:'8px 18px', borderRadius:9999, fontSize:13, color:'#111', border:'1px solid #111', background:'#fff' }}>
              Sign out
            </button>
          </div>
        </div>
 
        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:28 }}>
          {(['listings','leads','visits'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t==='leads'  && leads.length  > 0 && <span style={{ marginLeft:6, fontSize:11, background:'#111', color:'#fff', borderRadius:9999, padding:'1px 6px' }}>{leads.length}</span>}
              {t==='visits' && visits.length > 0 && <span style={{ marginLeft:6, fontSize:11, background:'#111', color:'#fff', borderRadius:9999, padding:'1px 6px' }}>{visits.length}</span>}
            </button>
          ))}
        </div>
 
        {/* Listings */}
        {tab === 'listings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {listings.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No listings yet.</p>}
            {listings.map((l: any) => (
              <div key={l.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', border:'1px solid #E5E5E5', borderRadius:12 }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111', marginBottom:2 }}>{l.title}</p>
                  <p style={{ fontSize:12, color:'#6B6B6B' }}>{formatPrice(l.price, l.purpose)}</p>
                </div>
                <span style={{ fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:9999, background: STATUS_COLOR[l.status]+'18', color: STATUS_COLOR[l.status] ?? '#6B6B6B' }}>
                  {l.status.replace('_',' ')}
                </span>
              </div>
            ))}
          </div>
        )}
 
        {/* Leads */}
        {tab === 'leads' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {leads.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No leads yet.</p>}
            {leads.map((l: any) => (
              <div key={l.id} style={{ padding:'14px 16px', border:'1px solid #E5E5E5', borderRadius:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111' }}>{l.buyer_name}</p>
                  <span style={{ fontSize:11, color:'#6B6B6B' }}>{new Date(l.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                <p style={{ fontSize:13, color:'#6B6B6B' }}>{l.buyer_phone}</p>
                {l.message && <p style={{ fontSize:13, color:'#3D3D3D', marginTop:6 }}>{l.message}</p>}
                <p style={{ fontSize:12, color:'#9B9B9B', marginTop:4 }}>{l.listing?.title}</p>
              </div>
            ))}
          </div>
        )}
 
        {/* Visits */}
        {tab === 'visits' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {visits.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No visit requests yet.</p>}
            {visits.map((v: any) => (
              <div key={v.id} style={{ padding:'14px 16px', border:'1px solid #E5E5E5', borderRadius:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111' }}>{v.requester_name}</p>
                  <span style={{ fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:9999, background: v.status==='confirmed'?'#F0FDF4':'#F7F7F7', color: v.status==='confirmed'?'#16A34A':'#6B6B6B' }}>
                    {v.status}
                  </span>
                </div>
                <p style={{ fontSize:13, color:'#6B6B6B' }}>{v.requester_phone}</p>
                <p style={{ fontSize:13, color:'#3D3D3D', marginTop:4 }}>
                  {v.slot_date} at {v.slot_time}
                </p>
                <p style={{ fontSize:12, color:'#9B9B9B', marginTop:4 }}>{v.listing?.title}</p>
              </div>
            ))}
          </div>
        )}
 
      </main>
      <Footer />
    </>
  );
}
