import Link from 'next/link';
export default function NotFound() {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:24}}>
      <span style={{fontSize:12,color:'#6B6B6B',letterSpacing:'0.08em',textTransform:'uppercase'}}>404</span>
      <h1 style={{fontSize:20,fontWeight:600,color:'#111'}}>Page not found</h1>
      <Link href="/" style={{marginTop:8,padding:'9px 22px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'#111',display:'inline-block'}}>Back home</Link>
    </div>
  );
}
