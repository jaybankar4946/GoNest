'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { adminGetPending, adminGetBrokers, adminGetLeads, adminModerate, adminVerifyAgent, adminSetRole } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { imgUrl } from '@/lib/api';
 
const TAB = ['listings','brokers','leads'] as const;
const btn = (color='#111'): React.CSSProperties => ({
  padding:'6px 14px', borderRadius:9999, fontSize:12, fontWeight:600, color:'#fff', background:color, border:'none', cursor:'pointer',
});
 
export default function AdminPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [tab,      setTab]      = useState<typeof TAB[number]>('listings');
  const [listings, setListings] = useState<any[]>([]);
  const [brokers,  setBrokers]  = useState<any[]>([]);
  const [leads,    setLeads]    = useState<any[]>([]);
  const [reason,   setReason]   = useState<Record<string,string>>({});
 
  useEffect(() => {
    if (!loading && profile?.role !== 'admin') router.push('/');
  }, [loading, profile, router]);
 
  useEffect(() => {
    adminGetPending().then(setListings);
    adminGetBrokers().then(setBrokers);
    adminGetLeads().then(setLeads);
  }, []);
 
  const moderate = async (id: string, status: string, vLevel: string, rej?: string) => {
    await adminModerate(id, status, vLevel, rej);
    setListings(p => p.filter(l => l.id !== id));
  };
 
  const tabS = (t: string): React.CSSProperties => ({
    padding:'7px 18px', borderRadius:9999, fontSize:13,
    fontWeight: tab===t ? 600 : 400, color: tab===t ? '#111' : '#6B6B6B',
    background: tab===t ? '#F7F7F7' : 'transparent', border:'none', cursor:'pointer',
  });
 
  return (
    <>
      <Nav />
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'40px 24px 80px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#111', marginBottom:32 }}>Admin Panel</h1>
 
        <div style={{ display:'flex', gap:4, marginBottom:28 }}>
          {TAB.map(t => <button key={t} onClick={() => setTab(t)} style={tabS(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
        </div>
 
        {/* Pending Listings */}
        {tab === 'listings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {listings.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No listings pending review.</p>}
            {listings.map((l: any) => {
              const imgs = [...(l.listing_images??[])].sort((a:any,b:any) => a.sort_order - b.sort_order);
              const src  = imgs[0] ? imgUrl(imgs[0].storage_path) : null;
              const city = l.city?.name ?? '';
              const loc  = l.locality?.name ?? '';
              return (
                <div key={l.id} style={{ display:'flex', gap:14, padding:16, border:'1px solid #E5E5E5', borderRadius:12, alignItems:'flex-start' }}>
                  {src && <img src={src} alt="" style={{ width:80, height:60, borderRadius:8, objectFit:'cover', flexShrink:0 }} />}
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:'#111', marginBottom:2 }}>{l.title}</p>
                    <p style={{ fontSize:13, color:'#6B6B6B', marginBottom:2 }}>{loc}{loc&&city?', ':''}{city} · {formatPrice(l.price, l.purpose)}</p>
                    <p style={{ fontSize:12, color:'#9B9B9B' }}>by {l.poster?.full_name ?? '—'} ({l.poster?.role})</p>
                    <div style={{ marginTop:10, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                      <button onClick={() => moderate(l.id,'active','verified')} style={btn('#16A34A')}>✓ Approve (Verified)</button>
                      <button onClick={() => moderate(l.id,'active','platform_verified')} style={btn('#111')}>★ Platform Verified</button>
                      <div style={{ display:'flex', gap:6 }}>
                        <input placeholder="Rejection reason" value={reason[l.id]??''} onChange={e => setReason(p=>({...p,[l.id]:e.target.value}))}
                          style={{ padding:'5px 10px', border:'1px solid #E5E5E5', borderRadius:8, fontSize:12, outline:'none', width:200 }} />
                        <button onClick={() => moderate(l.id,'rejected','unverified',reason[l.id])} style={btn('#DC2626')}>✗ Reject</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
 
        {/* Brokers */}
        {tab === 'brokers' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {brokers.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No agents or owners yet.</p>}
            {brokers.map((b: any) => (
              <div key={b.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', border:'1px solid #E5E5E5', borderRadius:12 }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111', marginBottom:2 }}>{b.full_name ?? '—'}</p>
                  <p style={{ fontSize:12, color:'#6B6B6B' }}>{b.role} · {b.agent_verified ? '✓ Verified' : 'Unverified'}</p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => adminVerifyAgent(b.id, !b.agent_verified).then(() => adminGetBrokers().then(setBrokers))}
                    style={btn(b.agent_verified ? '#6B6B6B' : '#16A34A')}>
                    {b.agent_verified ? 'Unverify' : 'Verify'}
                  </button>
                  <select defaultValue={b.role} onChange={e => adminSetRole(b.id, e.target.value).then(() => adminGetBrokers().then(setBrokers))}
                    style={{ padding:'5px 10px', border:'1px solid #E5E5E5', borderRadius:8, fontSize:12 }}>
                    {['buyer','owner','agent','admin'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
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
                  <p style={{ fontSize:14, fontWeight:600, color:'#111' }}>{l.buyer_name} — {l.buyer_phone}</p>
                  <span style={{ fontSize:11, color:'#9B9B9B' }}>{new Date(l.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                {l.message && <p style={{ fontSize:13, color:'#3D3D3D', marginBottom:4 }}>{l.message}</p>}
                <p style={{ fontSize:12, color:'#9B9B9B' }}>{l.listing?.title}</p>
              </div>
            ))}
          </div>
        )}
 
      </main>
      <Footer />
    </>
  );
}
