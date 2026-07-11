'use client';
type Step={label:string;sub:string;status:'done'|'active'|'pending'};
const BUY_STEPS: Step[]=[
  {label:'Listing found',        sub:'Property identified on GoNest',       status:'done'},
  {label:'Visit scheduled',      sub:'Physical inspection done',             status:'done'},
  {label:'Lead submitted',       sub:'Owner contacted through platform',     status:'active'},
  {label:'Negotiation',          sub:'Price & terms agreed',                 status:'pending'},
  {label:'Token paid',           sub:'Intent confirmed',                     status:'pending'},
  {label:'Legal verification',   sub:'Title check by lawyer',                status:'pending'},
  {label:'Loan & agreement',     sub:'Financing + sale deed',                status:'pending'},
  {label:'Registration',         sub:'Sub-registrar office',                 status:'pending'},
  {label:'Possession',           sub:'Keys handed over',                     status:'pending'},
];
export function TransactionTimeline() {
  return (
    <div style={{padding:'16px',borderRadius:12,border:'1px solid #E5E5E5'}}>
      <div style={{fontSize:11,fontWeight:600,color:'#6B6B6B',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:14}}>Your journey</div>
      <div style={{display:'flex',flexDirection:'column',gap:0}}>
        {BUY_STEPS.map((s,i)=>(
          <div key={i} style={{display:'flex',gap:12,paddingBottom:i<BUY_STEPS.length-1?14:0}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
              <div style={{width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:s.status==='done'?'#16A34A':s.status==='active'?'#111':'#E5E5E5',flexShrink:0}}>
                {s.status==='done'&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                {s.status==='active'&&<div style={{width:8,height:8,borderRadius:'50%',background:'#fff'}}/>}
              </div>
              {i<BUY_STEPS.length-1&&<div style={{width:1,flex:1,background:s.status==='done'?'#16A34A':'#E5E5E5',marginTop:3}}/>}
            </div>
            <div style={{paddingBottom:i<BUY_STEPS.length-1?0:0}}>
              <div style={{fontSize:13,fontWeight:s.status==='active'?600:500,color:s.status==='pending'?'#9B9B9B':'#111'}}>{s.label}</div>
              <div style={{fontSize:11,color:'#9B9B9B',marginTop:1}}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
