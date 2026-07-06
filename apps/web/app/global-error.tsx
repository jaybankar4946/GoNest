'use client';
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
        <div style={{textAlign:'center',padding:24}}>
          <h2 style={{fontSize:20,fontWeight:700}}>Something went wrong</h2>
          <button onClick={reset} style={{marginTop:16,padding:'10px 24px',borderRadius:9999,color:'#fff',background:'#111',border:'none',cursor:'pointer'}}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
