'use client';
import { useState } from 'react';
import { useAuth } from '@/components/layout/AuthProvider';
import { submitLead, submitVisit } from '@/lib/api';
 
const inp: React.CSSProperties = {width:'100%',padding:'10px 12px',border:'1px solid #E5E5E5',borderRadius:10,fontSize:13,outline:'none'};
const btn: React.CSSProperties = {width:'100%',padding:'11px',borderRadius:9999,fontSize:14,fontWeight:600,cursor:'pointer',border:'none',background:'#111',color:'#fff'};
 
export function ContactForms({ listingId }: { listingId: string }) {
  const { user, profile } = useAuth();
  const [tab,     setTab]    = useState<'lead'|'visit'>('lead');
  const [name,    setName]   = useState(profile?.full_name ?? '');
  const [phone,   setPhone]  = useState(profile?.phone    ?? '');
  const [email,   setEmail]  = useState(user?.email       ?? '');
  const [message, setMsg]    = useState('');
  const [date,    setDate]   = useState('');
  const [time,    setTime]   = useState('10:00');
  const [notes,   setNotes]  = useState('');
  const [loading, setLoad]   = useState(false);
  const [done,    setDone]   = useState<string|null>(null);
  const [err,     setErr]    = useState<string|null>(null);
 
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setLoad(true); setErr(null);
    try {
      if (tab === 'lead') {
        await submitLead({ listing_id:listingId, buyer_id:user?.id??null, buyer_name:name, buyer_phone:phone, buyer_email:email||undefined, message:message||undefined });
        setDone('Enquiry sent. The owner will contact you shortly.');
      } else {
        await submitVisit({ listing_id:listingId, requested_by:user?.id??null, requester_name:name, requester_phone:phone, slot_date:date, slot_time:time, notes:notes||undefined });
        setDone('Visit requested. The owner will confirm your slot.');
      }
    } catch { setErr('Could not send. Please try again.'); }
    finally { setLoad(false); }
  };
 
  if (done) return (
    <div style={{border:'1px solid #E5E5E5',borderRadius:14,padding:20}}>
      <p style={{fontSize:14,color:'#16A34A',lineHeight:1.6}}>{done}</p>
    </div>
  );
 
  return (
    <div style={{border:'1px solid #E5E5E5',borderRadius:14,overflow:'hidden',position:'sticky',top:80}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid #E5E5E5'}}>
        {(['lead','visit'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:'12px',fontSize:13,fontWeight:tab===t?600:400,color:tab===t?'#111':'#6B6B6B',background:tab===t?'#F7F7F7':'#fff',borderBottom:tab===t?'2px solid #111':'2px solid transparent'}}>
            {t==='lead' ? 'Contact' : 'Book Visit'}
          </button>
        ))}
      </div>
      <form onSubmit={send} style={{padding:16,display:'flex',flexDirection:'column',gap:10}}>
        <input required placeholder="Your name"  value={name}  onChange={e=>setName(e.target.value)}  style={inp} />
        <input required placeholder="Phone"      value={phone} onChange={e=>setPhone(e.target.value)} style={inp} />
        {tab==='lead' ? (
          <>
            <input type="email" placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} style={inp} />
            <textarea placeholder="Message (optional)" rows={3} value={message} onChange={e=>setMsg(e.target.value)} style={{...inp,resize:'none'}} />
          </>
        ) : (
          <>
            <input required type="date" value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={inp} />
            <select value={time} onChange={e=>setTime(e.target.value)} style={inp}>
              {['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'].map(t=>(
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <textarea placeholder="Notes (optional)" rows={2} value={notes} onChange={e=>setNotes(e.target.value)} style={{...inp,resize:'none'}} />
          </>
        )}
        {err && <p style={{fontSize:12,color:'#DC2626'}}>{err}</p>}
        <button type="submit" disabled={loading} style={{...btn,opacity:loading?0.6:1}}>
          {loading ? 'Sending…' : tab==='lead' ? 'Send enquiry' : 'Request visit'}
        </button>
      </form>
    </div>
  );
}
