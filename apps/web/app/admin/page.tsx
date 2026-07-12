'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { adminGetPendingListings, adminGetAllListings, adminGetBrokers, adminGetAllLeads, adminGetAllVisits, adminGetStats, adminModerate, adminToggleFeatured, adminVerifyAgent, adminSetRole } from '@/lib/api';
import { imgUrl } from '@/lib/api';
import { formatPrice, timeAgo } from '@/lib/format';
const TABS=['queue','listings','brokers','leads','visits'] as const;
type Tab=typeof TABS[number];
const SC: Record<string,string>={active:'#16A34A',pending_review:'#D97706',rejected:'#DC2626',draft:'#6B6B6B',archived:'#6B6B6B',new:'#2563EB',contacted:'#D97706',closed:'#16A34A',confirmed:'#16A34A',requested:'#D97706',completed:'#6B6B6B'};
const SB=(c:string): React.CSSProperties=>({fontSize:11,fontWeight:500,padding:'3px 10px',borderRadius:9999,background:c+'18',color:c});
const BTN=(c='#111'): React.CSSProperties=>({padding:'6px 14px',borderRadius:9999,fontSize:12,fontWeight:600,color:'#fff',background:c,border:'none',cursor:'pointer'});
const INP: React.CSSProperties={padding:'6px 10px',border:'1px solid #E5E5E5',borderRadius:8,fontSize:12,outline:'none',background:'#fff'};
export default function AdminPage() {
  const router=useRouter();
  const{profile,loading}=useAuth();
  const[tab,setTab]=useState<Tab>('queue');
  const[queue,setQueue]=useState<any[]>([]);
  const[listings,setListings]=useState<any[]>([]);
  const[brokers,setBrokers]=useState<any[]>([]);
  const[leads,setLeads]=useState<any[]>([]);
  const[visits,setVisits]=useState<any[]>([]);
  const[stats,setStats]=useState<any>(null);
  const[reason,setReason]=useState<Record<string,string>>({});
  const[busy,setBusy]=useState(false);
  useEffect(()=>{if(!loading&&profile?.role!=='admin')router.push('/');},[loading,profile,router]);
  useEffect(()=>{
    adminGetPendingListings().then(setQueue);
    adminGetAllListings().then(setListings);
    adminGetBrokers().then(setBrokers);
    adminGetAllLeads().then(setLeads);
    adminGetAllVisits().then(setVisits);
    adminGetStats().then(setStats);
  },[]);
  const moderate=async(id:string,status:string,vl:string,rej?:string)=>{setBusy(true);await adminModerate(id,status,vl,rej);setQueue(p=>p.filter(l=>l.id!==id));setListings(p=>p.map(l=>l.id===id?{...l,status,verification_level:vl}:l));setBusy(false);};
  const TS=(t:string): React.CSSProperties=>({padding:'7px 18px',borderRadius:9999,fontSize:13,fontWeight:tab===t?600:400,color:tab===t?'#111':'#6B6B6B',background:tab===t?'#F7F7F7':'transparent',border:'none',cursor:'pointer'});
  return(
    <>
      <Nav/>
      <main style={{maxWidth:1100,margin:'0 auto',padding:'40px 24px 80px'}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#111',marginBottom:24}}>Admin Panel</h1>
        {stats&&<div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:28}}>
          {[{l:'Total listings',v:stats.totalListings},{l:'Pending review',v:stats.pendingReview,warn:true},{l:'Total leads',v:stats.totalLeads},{l:'Total visits',v:stats.totalVisits},{l:'Total users',v:stats.totalUsers}].map(s=>(
            <div key={s.l} style={{background:s.warn&&s.v>0?'#FEF2F2':'#F7F7F7',borderRadius:12,padding:'14px 16px'}}><div style={{fontSize:22,fontWeight:700,color:s.warn&&s.v>0?'#DC2626':'#111'}}>{s.v}</div><div style={{fontSize:12,color:'#6B6B6B',marginTop:2}}>{s.l}</div></div>
          ))}
        </div>}
        <div style={{display:'flex',gap:4,marginBottom:28,flexWrap:'wrap'}}>
          {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={TS(t)}>{t==='queue'?`Review queue (${queue.length})`:t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
        </div>
        {tab==='queue'&&(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {queue.length===0&&<p style={{fontSize:14,color:'#16A34A'}}>All caught up. No listings pending review.</p>}
            {queue.map((l:any)=>{
              const imgs=[...(l.listing_images??[])].sort((a:any,b:any)=>a.sort_order-b.sort_order);
              const src=imgs[0]?imgUrl(imgs[0].storage_path):null;
              const poster=l.poster as any;
              return(
                <div key={l.id} style={{padding:16,border:'1px solid #E5E5E5',borderRadius:12}}>
                  <div style={{display:'flex',gap:12,marginBottom:12}}>
                    {src&&<img src={src} alt="" style={{width:80,height:60,borderRadius:8,objectFit:'cover',flexShrink:0}}/>}
                    <div style={{flex:1}}>
                      <p style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:2}}>{l.title}</p>
                      <p style={{fontSize:13,color:'#6B6B6B',marginBottom:2}}>{l.city?.name} · {formatPrice(l.price,l.purpose)}</p>
                      <p style={{fontSize:12,color:'#9B9B9B'}}>by {poster?.full_name??'—'} ({poster?.role}) · {timeAgo(l.created_at)}</p>
                      {poster?.rera_number&&<p style={{fontSize:11,color:'#6B6B6B',marginTop:2}}>RERA: {poster.rera_number}</p>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                    <button onClick={()=>moderate(l.id,'active','verified')} disabled={busy} style={BTN('#16A34A')}>✓ Approve</button>
                    <button onClick={()=>moderate(l.id,'active','platform_verified')} disabled={busy} style={BTN('#111')}>★ Platform Verify</button>
                    <input placeholder="Rejection reason (required)" value={reason[l.id]??''} onChange={e=>setReason(p=>({...p,[l.id]:e.target.value}))} style={{...INP,width:240}}/>
                    <button onClick={()=>moderate(l.id,'rejected','unverified',reason[l.id])} disabled={busy||!reason[l.id]} style={{...BTN('#DC2626'),opacity:reason[l.id]?1:0.4}}>✗ Reject</button>
                    <a href={`/property/${l.id}`} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#6B6B6B',textDecoration:'underline'}}>Preview</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab==='listings'&&(
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {listings.map((l:any)=>(
              <div key={l.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',border:'1px solid #E5E5E5',borderRadius:10}}>
                <div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:1}} className="lc1">{l.title}</p><p style={{fontSize:12,color:'#6B6B6B'}}>{l.city?.name} · {formatPrice(l.price,l.purpose)} · {l.view_count} views</p></div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                  <span style={SB(SC[l.status]??'#6B6B6B')}>{l.status.replace('_',' ')}</span>
                  <button onClick={()=>adminToggleFeatured(l.id,!l.featured).then(()=>setListings(p=>p.map(x=>x.id===l.id?{...x,featured:!x.featured}:x)))} style={{...BTN(l.featured?'#6B6B6B':'#2563EB'),fontSize:11}}>{l.featured?'Unfeature':'Feature'}</button>
                  {l.status==='pending_review'&&<button onClick={()=>moderate(l.id,'active','verified')} disabled={busy} style={{...BTN('#16A34A'),fontSize:11}}>Approve</button>}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==='brokers'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {brokers.length===0&&<p style={{fontSize:14,color:'#6B6B6B'}}>No agents or owners yet.</p>}
            {brokers.map((b:any)=>(
              <div key={b.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',border:'1px solid #E5E5E5',borderRadius:12}}>
                <div><p style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:2}}>{b.full_name??'—'}</p><p style={{fontSize:12,color:'#6B6B6B'}}>{b.role} · {b.agent_verified?'✓ Verified':'Unverified'}</p>{b.rera_number&&<p style={{fontSize:11,color:'#9B9B9B'}}>RERA: {b.rera_number}</p>}</div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <button onClick={()=>adminVerifyAgent(b.id,!b.agent_verified).then(()=>adminGetBrokers().then(setBrokers))} style={BTN(b.agent_verified?'#6B6B6B':'#16A34A')}>{b.agent_verified?'Unverify':'Verify'}</button>
                  <select value={b.role} onChange={e=>adminSetRole(b.id,e.target.value).then(()=>adminGetBrokers().then(setBrokers))} style={INP}>{['buyer','owner','agent','admin'].map(r=><option key={r} value={r}>{r}</option>)}</select>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==='leads'&&(
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {leads.length===0&&<p style={{fontSize:14,color:'#6B6B6B'}}>No leads yet.</p>}
            {leads.map((l:any)=>(
              <div key={l.id} style={{padding:'12px 14px',border:'1px solid #E5E5E5',borderRadius:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><p style={{fontSize:13,fontWeight:600,color:'#111'}}>{l.buyer_name} — {l.buyer_phone}</p><div style={{display:'flex',gap:6,alignItems:'center'}}><span style={SB(SC[l.status]??'#6B6B6B')}>{l.status}</span><span style={{fontSize:11,color:'#9B9B9B'}}>{timeAgo(l.created_at)}</span></div></div>
                {l.message&&<p style={{fontSize:12,color:'#3D3D3D'}}>{l.message}</p>}
                <p style={{fontSize:11,color:'#9B9B9B',marginTop:4}}>{l.listing?.title} · {l.listing?.city?.name}</p>
              </div>
            ))}
          </div>
        )}
        {tab==='visits'&&(
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {visits.length===0&&<p style={{fontSize:14,color:'#6B6B6B'}}>No visits yet.</p>}
            {visits.map((v:any)=>(
              <div key={v.id} style={{padding:'12px 14px',border:'1px solid #E5E5E5',borderRadius:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><p style={{fontSize:13,fontWeight:600,color:'#111'}}>{v.requester_name} — {v.requester_phone}</p><span style={SB(SC[v.status]??'#6B6B6B')}>{v.status}</span></div>
                <p style={{fontSize:12,color:'#3D3D3D'}}>{v.slot_date} at {v.slot_time}</p>
                <p style={{fontSize:11,color:'#9B9B9B',marginTop:4}}>{v.listing?.title} · {v.listing?.city?.name}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
