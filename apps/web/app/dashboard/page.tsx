'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { getMyListings, getMyLeads, getMyVisits, updateLeadStatus, updateVisitStatus } from '@/lib/api';
import { formatPrice, timeAgo } from '@/lib/format';
import Link from 'next/link';
 
const SC: Record<string,string> = { active:'#16A34A', pending_review:'#D97706', rejected:'#DC2626', draft:'#6B6B6B', archived:'#6B6B6B' };
const SB = (c:string) => ({ fontSize:11,fontWeight:500,padding:'3px 10px',borderRadius:9999,background:c+'18',color:c });
 
export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, signOut, loading } = useAuth();
  const [tab,      setTab]      = useState<'listings'|'leads'|'visits'>('listings');
  const [listings, setListings] = useState<any[]>([]);
  const [leads,    setLeads]    = useState<any[]>([]);
  const [visits,   setVisits]   = useState<any[]>([]);
  const [busy,     setBusy]     = useState(false);
 
  useEffect(() => { if (!loading && !user) router.push('/auth'); }, [loading,user,router]);
  useEffect(() => {
    if (!user) return;
    getMyListings(user.id).then(setListings);
    getMyLeads(user.id).then(setLeads);
    getMyVisits(user.id).then(setVisits);
  }, [user]);
 
  const canPost = ['owner','agent','admin'].includes(profile?.role ?? '');
  const tabBtn = (t: string): React.CSSProperties => ({
    padding:'8px 18px',borderRadius:9999,fontSize:13,
    fontWeight:tab===t?600:400,color:tab===t?'#111':'#6B6B6B',
    background:tab===t?'#F7F7F7':'transparent',border:'none',cursor:'pointer',
  });
 
  const changeLeadStatus = async (id: string, status: string) => {
    setBusy(true);
    await updateLeadStatus(id, status);
    setLeads(p => p.map(l => l.id===id ? {...l, status} : l));
    setBusy(false);
  };
 
  const changeVisitStatus = async (id: string, status: string) => {
    setBusy(true);
    await updateVisitStatus(id, status, user?.id);
    setVisits(p => p.map(v => v.id===id ? {...v, status} : v));
    setBusy(false);
  };
 
  const row: React.CSSProperties = {display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',border:'1px solid #E5E5E5',borderRadius:12};
  const sel: React.CSSProperties = {padding:'5px 10px',borderRadius:8,fontSize:12,border:'1px solid #E5E5E5',background:'#fff',cursor:'pointer'};
 
  return (
    <>
      <Nav />
      <main style={{maxWidth:1000,margin:'0 auto',padding:'40px 24px 80px'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:36}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:700,color:'#111',letterSpacing:'-0.02em',marginBottom:4}}>Account</h1>
            <p style={{fontSize:13,color:'#6B6B6B'}}>{user?.email} · {profile?.role ?? 'buyer'}</p>
          </div>
          <div style={{display:'flex',gap:8}}>
            {canPost && (
              <Link href="/dashboard/new"
                style={{padding:'8px 18px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'#111',display:'inline-flex',alignItems:'center',gap:6}}>
                + New listing
              </Link>
            )}
            <button onClick={async()=>{await signOut();router.push('/');}}
              style={{padding:'8px 18px',borderRadius:9999,fontSize:13,color:'#111',border:'1px solid #111',background:'#fff',cursor:'pointer'}}>
              Sign out
            </button>
          </div>
        </div>
 
        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:32}}>
          {[
            {label:'Listings',  value:listings.length},
            {label:'Leads',     value:leads.length},
            {label:'Visits',    value:visits.length},
          ].map(s=>(
            <div key={s.label} style={{background:'#F7F7F7',borderRadius:12,padding:'16px 20px'}}>
              <div style={{fontSize:24,fontWeight:700,color:'#111'}}>{s.value}</div>
              <div style={{fontSize:13,color:'#6B6B6B',marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
 
        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:24}}>
          {(['listings','leads','visits'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={tabBtn(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {(t==='leads'&&leads.filter(l=>l.status==='new').length>0)||(t==='visits'&&visits.filter(v=>v.status==='requested').length>0) ? (
                <span style={{marginLeft:6,fontSize:11,background:'#111',color:'#fff',borderRadius:9999,padding:'1px 6px'}}>
                  {t==='leads'?leads.filter(l=>l.status==='new').length:visits.filter(v=>v.status==='requested').length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
 
        {/* Listings */}
        {tab==='listings' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {listings.length===0 && <p style={{fontSize:14,color:'#6B6B6B'}}>No listings yet. <Link href="/dashboard/new" style={{color:'#111',textDecoration:'underline'}}>Create your first listing</Link></p>}
            {listings.map((l:any)=>(
              <div key={l.id} style={row}>
                <div>
                  <p style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:2}}>{l.title}</p>
                  <p style={{fontSize:12,color:'#6B6B6B'}}>{formatPrice(l.price,l.purpose)} · {l.view_count} views · {l.lead_count} leads</p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={SB(SC[l.status]??'#6B6B6B')}>{l.status.replace('_',' ')}</span>
                  <Link href={`/property/${l.id}`} style={{fontSize:12,color:'#6B6B6B',textDecoration:'underline'}}>View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
 
        {/* Leads */}
        {tab==='leads' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {leads.length===0 && <p style={{fontSize:14,color:'#6B6B6B'}}>No leads yet.</p>}
            {leads.map((l:any)=>(
              <div key={l.id} style={{...row,alignItems:'flex-start',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                  <div>
                    <p style={{fontSize:14,fontWeight:600,color:'#111'}}>{l.buyer_name} — {l.buyer_phone}</p>
                    <p style={{fontSize:12,color:'#6B6B6B',marginTop:2}}>{l.listing?.title} · {timeAgo(l.created_at)}</p>
                    {l.message && <p style={{fontSize:13,color:'#3D3D3D',marginTop:6}}>{l.message}</p>}
                  </div>
                  <span style={SB(SC[l.status]??'#6B6B6B')}>{l.status}</span>
                </div>
                <div style={{display:'flex',gap:8}}>
                  {l.buyer_phone && (
                    <a href={`https://wa.me/91${l.buyer_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                      style={{padding:'5px 12px',borderRadius:9999,fontSize:12,fontWeight:500,color:'#fff',background:'#25D366',textDecoration:'none'}}>
                      WhatsApp
                    </a>
                  )}
                  <select style={sel} value={l.status} onChange={e=>changeLeadStatus(l.id,e.target.value)} disabled={busy}>
                    {['new','contacted','qualified','closed','spam'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
 
        {/* Visits */}
        {tab==='visits' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {visits.length===0 && <p style={{fontSize:14,color:'#6B6B6B'}}>No visit requests yet.</p>}
            {visits.map((v:any)=>(
              <div key={v.id} style={{...row,alignItems:'flex-start',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                  <div>
                    <p style={{fontSize:14,fontWeight:600,color:'#111'}}>{v.requester_name} — {v.requester_phone}</p>
                    <p style={{fontSize:13,color:'#3D3D3D',marginTop:2}}>{v.slot_date} at {v.slot_time}</p>
                    <p style={{fontSize:12,color:'#6B6B6B',marginTop:2}}>{v.listing?.title}</p>
                    {v.notes && <p style={{fontSize:12,color:'#6B6B6B'}}>{v.notes}</p>}
                  </div>
                  <span style={SB(SC[v.status]??'#6B6B6B')}>{v.status}</span>
                </div>
                <select style={sel} value={v.status} onChange={e=>changeVisitStatus(v.id,e.target.value)} disabled={busy}>
                  {['requested','confirmed','completed','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
