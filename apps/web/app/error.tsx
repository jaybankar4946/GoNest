'use client';
import { useEffect } from 'react';
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:24,textAlign:'center'}}>
      <h2 style={{fontSize:20,fontWeight:700,color:'#111'}}>Something went wrong</h2>
      <p style={{fontSize:14,color:'#6B6B6B',maxWidth:400}}>We hit an unexpected error loading this page. Please try again.</p>
      <button onClick={reset} style={{padding:'10px 24px',borderRadius:9999,fontSize:14,fontWeight:600,color:'#fff',background:'#111',border:'none',cursor:'pointer'}}>
        Try again
      </button>
    </div>
  );
}
