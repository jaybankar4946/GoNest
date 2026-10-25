'use client';
import { useEffect, useState } from 'react';
import { BUY_CHECKLIST, RENT_CHECKLIST } from '@/lib/format';
export function DocumentChecklist({purpose,listingId}:{purpose:'sale'|'rent';listingId?:string}) {
 const steps=purpose==='sale'?BUY_CHECKLIST:RENT_CHECKLIST;
 const storageKey=listingId?'gonest:checklist:'+purpose+':'+listingId:null;
 const [done,setDone]=useState<Set<number>>(new Set());
 const [hydrated,setHydrated]=useState(false);
 useEffect(()=>{
  if(!storageKey){setHydrated(true);return;}
  try {const raw=window.localStorage.getItem(storageKey);const parsed=raw?JSON.parse(raw):[];if(Array.isArray(parsed))setDone(new Set(parsed.filter((id):id is number=>typeof id==='number'&&steps.some(s=>s.id===id))));} catch {/* Ignore malformed or unavailable browser storage. */}
  setHydrated(true);
 },[storageKey,steps]);
 useEffect(()=>{if(!hydrated||!storageKey)return;try{window.localStorage.setItem(storageKey,JSON.stringify([...done]));}catch{/* Checklist remains usable if storage is blocked. */}},[done,hydrated,storageKey]);
 const toggle=(id:number)=>setDone(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
 const pct=Math.round(done.size/steps.length*100);
 return <section aria-label={purpose==='sale'?'Buying checklist':'Renting checklist'} style={{padding:16,borderRadius:12,border:'1px solid #E5E5E5',marginTop:20}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:12}}><div style={{fontSize:11,fontWeight:700,color:'#6B6B6B',letterSpacing:'.06em',textTransform:'uppercase'}}>{purpose==='sale'?'Buying checklist':'Renting checklist'}</div><span aria-live="polite" style={{fontSize:12,fontWeight:700,color:pct===100?'#16A34A':'#D97706'}}>{done.size}/{steps.length} · {pct}% done</span></div>
  <div role="progressbar" aria-label="Checklist progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} style={{height:4,background:'#F0F0F0',borderRadius:2,marginBottom:14,overflow:'hidden'}}><div style={{height:'100%',width:pct+'%',background:pct===100?'#16A34A':'#D97706',borderRadius:2,transition:'width 0.3s'}}/></div>
  <div style={{display:'flex',flexDirection:'column',gap:6}}>{steps.map(s=><button type="button" key={s.id} onClick={()=>toggle(s.id)} aria-pressed={done.has(s.id)} style={{display:'flex',alignItems:'flex-start',textAlign:'left',gap:10,cursor:'pointer',padding:10,borderRadius:8,border:'1px solid transparent',background:done.has(s.id)?'#F0FDF4':'transparent',width:'100%'}}><span aria-hidden="true" style={{width:20,height:20,borderRadius:4,border:'1.5px solid '+(done.has(s.id)?'#16A34A':'#C8C8C8'),background:done.has(s.id)?'#16A34A':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>{done.has(s.id)&&<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}</span><span><span style={{display:'block',fontSize:13,fontWeight:600,color:done.has(s.id)?'#166534':'#111'}}>{s.label}</span><span style={{display:'block',fontSize:11,lineHeight:1.5,color:'#6B6B6B',marginTop:3}}>{s.desc}</span></span></button>)}</div>
  <p style={{fontSize:11,color:'#737373',marginTop:10}}>Progress is saved in this browser on this device. It is not shared with your agent or GoNest account.</p>
 </section>;
}
