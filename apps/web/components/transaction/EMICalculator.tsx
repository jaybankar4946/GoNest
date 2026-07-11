'use client';
import { useState } from 'react';
import { calcEMI, formatPrice } from '@/lib/format';
export function EMICalculator({price}:{price:number}) {
  const [down,setDown]=useState(20);
  const [rate,setRate]=useState(8.5);
  const [years,setYears]=useState(20);
  const loanAmt=price*(1-down/100);
  const emi=calcEMI(loanAmt,rate,years);
  const total=emi*years*12;
  const interest=total-loanAmt;
  const inp: React.CSSProperties={width:'100%',padding:'8px 10px',border:'1px solid #E5E5E5',borderRadius:8,fontSize:13,outline:'none'};
  return (
    <div style={{padding:'16px',borderRadius:12,border:'1px solid #E5E5E5',marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:600,color:'#6B6B6B',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:12}}>EMI Calculator</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:14}}>
        <div>
          <label style={{fontSize:11,color:'#6B6B6B',display:'block',marginBottom:4}}>Down payment %</label>
          <input type="number" min={10} max={90} value={down} onChange={e=>setDown(Number(e.target.value))} style={inp}/>
        </div>
        <div>
          <label style={{fontSize:11,color:'#6B6B6B',display:'block',marginBottom:4}}>Interest rate %</label>
          <input type="number" min={6} max={15} step={0.1} value={rate} onChange={e=>setRate(Number(e.target.value))} style={inp}/>
        </div>
        <div>
          <label style={{fontSize:11,color:'#6B6B6B',display:'block',marginBottom:4}}>Tenure (years)</label>
          <input type="number" min={5} max={30} value={years} onChange={e=>setYears(Number(e.target.value))} style={inp}/>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,background:'#F7F7F7',borderRadius:10,padding:'12px'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111'}}>{formatPrice(emi,'rent').replace('/mo','')}<span style={{fontSize:11,color:'#6B6B6B'}}>/mo</span></div>
          <div style={{fontSize:11,color:'#6B6B6B',marginTop:2}}>Monthly EMI</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:15,fontWeight:600,color:'#111'}}>{formatPrice(loanAmt,'sale')}</div>
          <div style={{fontSize:11,color:'#6B6B6B',marginTop:2}}>Loan amount</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:15,fontWeight:600,color:'#D97706'}}>{formatPrice(interest,'sale')}</div>
          <div style={{fontSize:11,color:'#6B6B6B',marginTop:2}}>Total interest</div>
        </div>
      </div>
      <div style={{fontSize:11,color:'#9B9B9B',marginTop:8}}>Indicative only. Actual EMI depends on your lender's terms.</div>
    </div>
  );
}
