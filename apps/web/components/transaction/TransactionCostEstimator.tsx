'use client';
import { useMemo, useState } from 'react';

type Props = {
  purpose: 'sale' | 'rent';
  askingPrice: number;
  securityDeposit?: number | null;
  maintenanceMonthly?: number | null;
  brokerageDisclosure?: string | null;
};
const money = (value: number) => new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number.isFinite(value)?value:0);
function NumberField({label,value,onChange,suffix}:{label:string;value:number;onChange:(value:number)=>void;suffix?:string}) {
 return <label style={{display:'flex',flexDirection:'column',gap:5,fontSize:12,color:'#525252'}}>{label}
  <div style={{display:'flex',alignItems:'center',border:'1px solid #D4D4D4',borderRadius:9,background:'#fff',overflow:'hidden'}}>
   <input type="number" min="0" value={value} onChange={e=>onChange(Math.max(0,Number(e.target.value)||0))} style={{width:'100%',minWidth:0,padding:'10px 11px',border:0,outline:'none',fontSize:14,color:'#171717'}}/>
   {suffix&&<span style={{paddingRight:10,whiteSpace:'nowrap',color:'#737373'}}>{suffix}</span>}
  </div>
 </label>;
}
export function TransactionCostEstimator({purpose,askingPrice,securityDeposit,maintenanceMonthly,brokerageDisclosure}:Props) {
 const [deposit,setDeposit]=useState(Math.max(0,securityDeposit??0));
 const [brokerage,setBrokerage]=useState(0);
 const [agreement,setAgreement]=useState(0);
 const [maintenance,setMaintenance]=useState(Math.max(0,maintenanceMonthly??0));
 const [stampRate,setStampRate]=useState(0);
 const [registrationRate,setRegistrationRate]=useState(0);
 const [legal,setLegal]=useState(0);
 const [other,setOther]=useState(0);
 const [months,setMonths]=useState(1);
 const estimate=useMemo(()=>{
  if(purpose==='rent') return {lines:[['First month rent',askingPrice],['Refundable deposit (confirm refund terms)',deposit],['Brokerage (enter amount if applicable)',brokerage],['Agreement / registration (estimate)',agreement],['Maintenance for selected period',maintenance*months],['Other disclosed charges',other]] as [string,number][],total:askingPrice+deposit+brokerage+agreement+maintenance*months+other,note:'Deposit is shown separately from expenses because it may be refundable. Confirm the written refund terms.'};
  const stamp=askingPrice*stampRate/100, registration=askingPrice*registrationRate/100;
  return {lines:[['Property asking price',askingPrice],['Illustrative stamp duty',stamp],['Illustrative registration charge',registration],['Legal / due-diligence fees',legal],['Other disclosed charges',other]] as [string,number][],total:askingPrice+stamp+registration+legal+other,note:'Duty and registration rates vary by state, property type, buyer eligibility and transaction. Enter rates confirmed for this property; zero means not yet estimated.'};
 },[purpose,askingPrice,deposit,brokerage,agreement,maintenance,months,other,stampRate,registrationRate,legal]);
 return <section aria-labelledby="transaction-cost-heading" style={{border:'1px solid #E5E7EB',borderRadius:16,padding:20,margin:'22px 0',background:'#FAFAFA'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
   <div><p style={{fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#737373',marginBottom:6}}>Plan your budget</p><h2 id="transaction-cost-heading" style={{fontSize:20,fontWeight:750,color:'#111827'}}>{purpose==='rent'?'Estimated move-in costs':'Estimated purchase cost'}</h2><p style={{fontSize:12,color:'#737373',marginTop:5}}>Editable estimates · not a quote or legal/tax advice</p></div>
   <div style={{background:'#fff',border:'1px solid #E5E7EB',borderRadius:12,padding:'10px 14px',minWidth:175}}><p style={{fontSize:11,color:'#737373'}}>{purpose==='rent'?'Estimated initial budget':'Estimated total budget'}</p><p style={{fontSize:22,fontWeight:800,color:'#1D4ED8',marginTop:3}}>{money(estimate.total)}</p></div>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12,marginTop:18}}>
   {purpose==='rent'?<>
    <NumberField label="Refundable deposit" value={deposit} onChange={setDeposit}/><NumberField label="Brokerage (if applicable)" value={brokerage} onChange={setBrokerage}/><NumberField label="Agreement / registration charges" value={agreement} onChange={setAgreement}/><NumberField label="Monthly maintenance" value={maintenance} onChange={setMaintenance}/>
    <label style={{display:'flex',flexDirection:'column',gap:5,fontSize:12,color:'#525252'}}>Maintenance period<select value={months} onChange={e=>setMonths(Number(e.target.value))} style={{padding:10,border:'1px solid #D4D4D4',borderRadius:9,background:'#fff',fontSize:14}}><option value={1}>1 month</option><option value={3}>3 months</option><option value={6}>6 months</option><option value={12}>12 months</option></select></label>
    <NumberField label="Other charges" value={other} onChange={setOther}/>
   </>:<>
    <NumberField label="Stamp duty rate confirmed for this deal" value={stampRate} onChange={setStampRate} suffix="%"/><NumberField label="Registration rate confirmed for this deal" value={registrationRate} onChange={setRegistrationRate} suffix="%"/><NumberField label="Legal / due-diligence fees" value={legal} onChange={setLegal}/><NumberField label="Other disclosed charges" value={other} onChange={setOther}/>
   </>}
  </div>
  {purpose==='rent'&&brokerageDisclosure&&<p style={{fontSize:12,color:'#525252',marginTop:12}}>Listing brokerage disclosure: <strong>{brokerageDisclosure}</strong>. Enter the agreed amount above; the disclosure is not automatically treated as a confirmed charge.</p>}
  <div style={{marginTop:18,borderTop:'1px solid #E5E7EB',paddingTop:12}}>
   {estimate.lines.map(([label,value])=><div key={label} style={{display:'flex',justifyContent:'space-between',gap:16,padding:'5px 0',fontSize:13,color:'#404040'}}><span>{label}</span><strong style={{whiteSpace:'nowrap'}}>{money(value)}</strong></div>)}
   <p style={{fontSize:12,lineHeight:1.6,color:'#737373',marginTop:10}}>{estimate.note}</p>
  </div>
 </section>;
}
