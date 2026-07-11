'use client';
const SCORES: Record<string,{connectivity:number;schools:number;safety:number;lifestyle:number}> = {
  'andheri-west':   {connectivity:9,schools:8,safety:7,lifestyle:8},
  'bandra-west':    {connectivity:9,schools:9,safety:8,lifestyle:10},
  'powai':          {connectivity:7,schools:9,safety:9,lifestyle:7},
  'worli':          {connectivity:8,schools:7,safety:8,lifestyle:9},
  'lower-parel':    {connectivity:9,schools:7,safety:8,lifestyle:9},
  'juhu':           {connectivity:7,schools:8,safety:8,lifestyle:9},
  'baner':          {connectivity:7,schools:8,safety:9,lifestyle:7},
  'koregaon-park':  {connectivity:7,schools:8,safety:8,lifestyle:9},
  'whitefield':     {connectivity:6,schools:8,safety:8,lifestyle:7},
  'indiranagar':    {connectivity:8,schools:8,safety:8,lifestyle:9},
  'koramangala':    {connectivity:7,schools:8,safety:8,lifestyle:9},
  'gachibowli':     {connectivity:7,schools:8,safety:9,lifestyle:7},
};
const DOT=(score:number)=>{
  const color=score>=8?'#16A34A':score>=6?'#D97706':'#DC2626';
  return <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:8,height:8,borderRadius:'50%',background:color,flexShrink:0}}/><div style={{height:4,flex:1,borderRadius:2,background:'#F0F0F0',overflow:'hidden'}}><div style={{height:'100%',width:`${score*10}%`,background:color,borderRadius:2}}/></div><span style={{fontSize:12,fontWeight:600,color:'#111',width:16,flexShrink:0}}>{score}</span></div>;
};
export function NeighbourhoodCard({localitySlug,localityName}:{localitySlug:string;localityName:string}) {
  const s=SCORES[localitySlug];
  if(!s)return null;
  const avg=Math.round((s.connectivity+s.schools+s.safety+s.lifestyle)/4*10)/10;
  return (
    <div style={{padding:'14px 16px',borderRadius:12,border:'1px solid #E5E5E5',marginBottom:16}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:600,color:'#6B6B6B',letterSpacing:'0.06em',textTransform:'uppercase'}}>Neighbourhood Score</div>
        <span style={{fontSize:13,fontWeight:700,color:'#111'}}>{avg}/10 · {localityName}</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {[['Connectivity',s.connectivity],['Schools & edu',s.schools],['Safety',s.safety],['Lifestyle',s.lifestyle]].map(([label,score])=>(
          <div key={label as string} style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:12,color:'#6B6B6B',width:100,flexShrink:0}}>{label}</span>
            {DOT(score as number)}
          </div>
        ))}
      </div>
      <div style={{fontSize:11,color:'#9B9B9B',marginTop:10}}>Scores based on local infrastructure data. Updated quarterly.</div>
    </div>
  );
}
