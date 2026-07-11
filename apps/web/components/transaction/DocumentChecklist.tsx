'use client';
import { useState } from 'react';
import { BUY_CHECKLIST, RENT_CHECKLIST } from '@/lib/format';
export function DocumentChecklist({purpose}:{purpose:'sale'|'rent'}) {
  const steps=purpose==='sale'?BUY_CHECKLIST:RENT_CHECKLIST;
  const [done,setDone]=useState<Set<number>>(new Set());
  const toggle=(id:number)=>setDone(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const pct=Math.round((done.size/steps.length)*100);
  return (
    <div style={{padding:'16px',borderRadius:12,border:'1px solid #E5E5E5'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:600,color:'#6B6B6B',letterSpacing:'0.06em',textTransform:'uppercase'}}>
          {purpose==='sale'?'Buying checklist':'Renting checklist'}
        </div>
        <span style={{fontSize:12,fontWeight:600,color:pct===100?'#16A34A':'#D97706'}}>{pct}% done</span>
      </div>
      <div style={{height:4,background:'#F0F0F0',borderRadius:2,marginBottom:14,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:pct===100?'#16A34A':'#D97706',borderRadius:2,transition:'width 0.3s'}}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {steps.map(s=>(
          <div key={s.id} onClick={()=>toggle(s.id)} style={{display:'flex',gap:10,cursor:'pointer',padding:'8px 10px',borderRadius:8,background:done.has(s.id)?'#F0FDF4':'transparent',transition:'background 0.15s'}}>
            <div style={{width:20,height:20,borderRadius:4,border:`1.5px solid ${done.has(s.id)?'#16A34A':'#C8C8C8'}`,background:done.has(s.id)?'#16A34A':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
              {done.has(s.id)&&<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:500,color:done.has(s.id)?'#16A34A':'#111'}}>{s.label}</div>
              <div style={{fontSize:11,color:'#6B6B6B',marginTop:2}}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
