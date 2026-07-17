'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { getMyListings, getMyLeads, getMyVisits, updateLeadStatus, updateVisitStatus, deleteListing } from '@/lib/api';
import { formatPrice, timeAgo } from '@/lib/format';
import Link from 'next/link';
const SC: Record<string,string>={active:'#16A34A',pending_review:'#D97706',rejected:'#DC2626',draft:'#6B6B6B',archived:'#6B6B6B',new:'#2563EB',contacted:'#D97706',qualified:'#111',closed:'#16A34A',spam:'#DC2626',requested:'#D97706',confirmed:'#16A34A',completed:'#6B6B6B',cancelled:'#DC2626'};
const SB=(c:string): React.CSSProperties=>({fontSize:11,fontWeight:500,padding:'3px 10px',borderRadius:9999,background:c+'18',color:c});
const sel: React.CSSProperties={padding:'5px 10px',borderRadius:8,fontSize:12,border:'1px solid #E5E5E5',background:'#fff',cursor:'pointer'};
export default function DashboardPage() {
  const router=useRouter();
  const{user,profile,signOut,loading}=useAuth();
  const[tab,setTab]=useState<'listings'|'leads'|'visits'>('listings');
  const[listings,setListings]=useState<any[]>([]);
  const[leads,setLeads]=useState<any[]>([]);
  const[visits,setVisits]=useState<any[]>([]);
  const[busy,setBusy]=useState(false);
  const[deletingId,setDeletingId]=useState<string|null>(null);
  useEffect(()=>{if(!loading&&!user)router.push('/auth');},[loading,user,router]);
  useEffect(()=>{
    if(!user)return;
    getMyListings(user.id).then(setListings);
    getMyLeads(user.id).then(setLeads);
    getMyVisits(user.id).then(setVisits);
  },[user]);
  const canPost=['owner','agent','admin'].includes(profile?.role??'');
  const removeListing=async(id:string)=>{
    if(!confirm('Delete this listing? This cannot be undone.'))return;
    setDeletingId(id);
    try{await deleteListing(id);setListings(p=>p.filter(l=>l.id!==id));}
    finally{setDeletingId(null);}
  };
  const TB=(t:string): React.CSSProperties=>({padding:'8px 18px',borderRadius:9999,fontSize:13,fontWeight:tab===t?600:400,color:tab===t?'#111':'#6B6B6B',background:tab===t?'#F7F7F7':'transparent',border:'none',cursor:'pointer'});
  const ROW: React.CSSProperties={display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'14px 16px',border:'1px solid #E5E5E5',borderRadius:12,flexDirection:'column',gap:10};
  return(
    <>
      <Nav/>
      <main style={{maxWidth:1000,margin:'0 auto',padding:'40px 24px 80px'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:32}}>
          <div><h1 style={{fontSize:22,fontWeight:700,color:'#111',letterSpacing:'-0.02em',marginBottom:4}}>Account</h1><p style={{fontSize:13,color:'#6B6B6B'}}>{user?.email} · {profile?.role??'buyer'}</p></div>
          <div style={{display:'flex',gap:8}}>
            {canPost&&<Link href="/dashboard/new" style={{padding:'8px 18px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'#111',display:'inline-flex',alignItems:'center',gap:6}}>+ New listing</Link>}
            <Link href="/dashboard/settings" style={{padding:'8px 18px',borderRadius:9999,fontSize:13,color:'#111',border:'1px solid #E5E5E5',background:'#fff',display:'inline-flex',alignItems:'center'}}>Settings</Link>
            <button onClick={async()=>{await signOut();router.push('/');}} style={{padding:'8px 18px',borderRadius:9999,fontSize:13,color:'#111',border:'1px solid #111',background:'#fff',cursor:'pointer'}}>Sign out</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:28}}>
          {[{l:'Listings',v:listings.length},{l:'Leads',v:leads.length},{l:'Visits',v:visits.length}].map(s=>(
            <div key={s.l} style={{background:'#F7F7F7',borderRadius:12,padding:'16px 20px'}}><div style={{fontSize:24,fontWeight:700,color:'#111'}}>{s.v}</div><div style={{fontSize:13,color:'#6B6B6B',marginTop:2}}>{s.l}</div></div>
          ))}
        </div>
        <div style={{display:'flex',gap:4,marginBottom:24}}>
          {(['listings','leads','visits'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={TB(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t==='leads'&&leads.filter(l=>l.status==='new').length>0&&<span style={{marginLeft:6,fontSize:11,background:'#111',color:'#fff',borderRadius:9999,padding:'1px 6px'}}>{leads.filter(l=>l.status==='new').length}</span>}
              {t==='visits'&&visits.filter(v=>v.status==='requested').length>0&&<span style={{marginLeft:6,fontSize:11,background:'#111',color:'#fff',borderRadius:9999,padding:'1px 6px'}}>{visits.filter(v=>v.status==='requested').length}</span>}
            </button>
          ))}
        </div>
        {tab==='listings'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {listings.length===0&&<p style={{fontSize:14,color:'#6B6B6B'}}>No listings yet. <Link href="/dashboard/new" style={{color:'#111',textDecoration:'underline'}}>Create your first</Link></p>}
            {listings.map((l:any)=>(
              <div key={l.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',border:'1px solid #E5E5E5',borderRadius:12}}>
                <div><p style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:2}}>{l.title}</p><p style={{fontSize:12,color:'#6B6B6B'}}>{formatPrice(l.price,l.purpose)} · {l.view_count} views · {l.lead_count} leads</p></div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={SB(SC[l.status]??'#6B6B6B')}>{l.status.replace('_',' ')}</span>
                  <Link href={`/property/${l.id}`} style={{fontSize:12,color:'#6B6B6B',textDecoration:'underline'}}>View</Link>
                  <Link href={`/dashboard/edit/${l.id}`} style={{fontSize:12,color:'#2563EB',textDecoration:'underline'}}>Edit</Link>
                  <button onClick={()=>removeListing(l.id)} disabled={deletingId===l.id} style={{fontSize:12,color:'#DC2626',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',opacity:deletingId===l.id?0.5:1}}>
                    {deletingId===l.id?'Deleting…':'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==='leads'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {leads.length===0&&<p style={{fontSize:14,color:'#6B6B6B'}}>No leads yet.</p>}
            {leads.map((l:any)=>(
              <div key={l.id} style={ROW}>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                  <div><p style={{fontSize:14,fontWeight:600,color:'#111'}}>{l.buyer_name} — {l.buyer_phone}</p><p style={{fontSize:12,color:'#6B6B6B',marginTop:2}}>{l.listing?.title} · {timeAgo(l.created_at)}</p>{l.message&&<p style={{fontSize:13,color:'#3D3D3D',marginTop:6}}>{l.message}</p>}</div>
                  <span style={SB(SC[l.status]??'#6B6B6B')}>{l.status}</span>
                </div>
                <div style={{display:'flex',gap:8}}>
                  {l.buyer_phone&&<a href={`https://wa.me/91${l.buyer_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{padding:'5px 12px',borderRadius:9999,fontSize:12,fontWeight:500,color:'#fff',background:'#25D366'}}>WhatsApp</a>}
                  <select style={sel} value={l.status} onChange={async e=>{setBusy(true);await updateLeadStatus(l.id,e.target.value);setLeads(p=>p.map(x=>x.id===l.id?{...x,status:e.target.value}:x));setBusy(false);}} disabled={busy}>
                    {['new','contacted','qualified','closed','spam'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==='visits'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {visits.length===0&&<p style={{fontSize:14,color:'#6B6B6B'}}>No visit requests yet.</p>}
            {visits.map((v:any)=>(
              <div key={v.id} style={ROW}>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                  <div><p style={{fontSize:14,fontWeight:600,color:'#111'}}>{v.requester_name} — {v.requester_phone}</p><p style={{fontSize:13,color:'#3D3D3D',marginTop:2}}>{v.slot_date} at {v.slot_time}</p><p style={{fontSize:12,color:'#6B6B6B',marginTop:2}}>{v.listing?.title}</p></div>
                  <span style={SB(SC[v.status]??'#6B6B6B')}>{v.status}</span>
                </div>
                <select style={sel} value={v.status} onChange={async e=>{setBusy(true);await updateVisitStatus(v.id,e.target.value,user?.id);setVisits(p=>p.map(x=>x.id===v.id?{...x,status:e.target.value}:x));setBusy(false);}} disabled={busy}>
                  {['requested','confirmed','completed','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
