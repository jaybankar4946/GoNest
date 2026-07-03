'use client';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getSavedListings, toggleSaved, getSavedIds } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthProvider';
import type { ListingFull } from '@/lib/types';
import Link from 'next/link';
 
export default function SavedPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingFull[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading,  setLoading]  = useState(true);
 
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([getSavedListings(user.id), getSavedIds(user.id)])
      .then(([ls, ids]) => { setListings(ls); setSavedIds(ids); })
      .finally(() => setLoading(false));
  }, [user]);
 
  const toggle = async (id: string) => {
    if (!user) return;
    const was = savedIds.has(id);
    setSavedIds(p=>{ const n=new Set(p); was?n.delete(id):n.add(id); return n; });
    await toggleSaved(user.id, id, was);
    if (was) setListings(p=>p.filter(l=>l.id!==id));
  };
 
  return (
    <>
      <Nav />
      <main style={{maxWidth:1200,margin:'0 auto',padding:'40px 24px 80px'}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#111',letterSpacing:'-0.02em',marginBottom:32}}>Saved Homes</h1>
        {!user ? (
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <p style={{fontSize:15,color:'#6B6B6B',marginBottom:20}}>Sign in to see your saved properties.</p>
            <Link href="/auth" style={{padding:'10px 24px',borderRadius:9999,fontSize:14,fontWeight:600,color:'#fff',background:'#111',display:'inline-block'}}>
              Sign in
            </Link>
          </div>
        ) : loading ? (
          <p style={{fontSize:14,color:'#6B6B6B'}}>Loading…</p>
        ) : listings.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <p style={{fontSize:15,color:'#6B6B6B',marginBottom:16}}>No saved properties yet.</p>
            <Link href="/search" style={{padding:'9px 22px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#111',border:'1px solid #111',display:'inline-block'}}>
              Browse properties
            </Link>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'36px 20px'}}>
            {listings.map(l=><PropertyCard key={l.id} listing={l} isSaved={savedIds.has(l.id)} onToggle={toggle} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
