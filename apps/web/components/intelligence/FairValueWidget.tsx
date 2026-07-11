'use client';
import { fairValue, formatPrice } from '@/lib/format';
type Props={price:number;sqft:number|null;localitySlug?:string;purpose:'sale'|'rent'};
export function FairValueWidget({price,sqft,localitySlug,purpose}:Props) {
  if(purpose==='rent')return null;
  const fv=fairValue(price,sqft,localitySlug);
  if(!fv)return null;
  return (
    <div style={{padding:'14px 16px',borderRadius:12,border:'1px solid #E5E5E5',marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:600,color:'#6B6B6B',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:8}}>Price Analysis</div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:13,color:'#6B6B6B',marginBottom:2}}>Market estimate</div>
          <div style={{fontSize:16,fontWeight:700,color:'#111'}}>{formatPrice(fv.estimate,'sale')}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <span style={{fontSize:12,fontWeight:600,padding:'4px 10px',borderRadius:9999,background:fv.color+'18',color:fv.color}}>
            {fv.label}
          </span>
          <div style={{fontSize:12,color:'#6B6B6B',marginTop:4}}>
            {fv.diff > 0 ? `+${fv.diff}%` : `${fv.diff}%`} vs locality avg
          </div>
        </div>
      </div>
      <div style={{fontSize:11,color:'#9B9B9B',marginTop:8}}>Based on average ₹/sqft for this locality. Not a formal valuation.</div>
    </div>
  );
}
