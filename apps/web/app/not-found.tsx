import Link from 'next/link';
export default function NotFound() {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
      <span style={{fontSize:12,color:'#6B6B6B',letterSpacing:'0.08em',textTransform:'uppercase'}}>404</span>
      <h1 style={{fontSize:20,fontWeight:600}}>Page not found</h1>
      <Link href="/" style={{fontSize:14,color:'#6B6B6B',textDecoration:'underline'}}>← Back home</Link>
    </div>
  );
}
