'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
 
export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const go = () => router.push(q.trim() ? `/search?q=${encodeURIComponent(q)}` : '/search');
  return (
    <div style={{display:'flex',alignItems:'center',border:'1px solid #E5E5E5',borderRadius:9999,padding:'6px 6px 6px 16px',background:'#fff',maxWidth:520,margin:'0 auto'}}>
      <Search size={15} color="#9B9B9B" style={{flexShrink:0}} />
      <input type="text" placeholder="Search city, locality or project"
        value={q} onChange={e=>setQ(e.target.value)}
        onKeyDown={e=>e.key==='Enter'&&go()}
        style={{flex:1,border:'none',outline:'none',fontSize:14,padding:'8px 10px',background:'transparent',color:'#111'}} />
      <button onClick={go}
        style={{background:'#111',color:'#fff',borderRadius:9999,padding:'10px 22px',fontSize:14,fontWeight:600,flexShrink:0}}>
        Search
      </button>
    </div>
  );
}
