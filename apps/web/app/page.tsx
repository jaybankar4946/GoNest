import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HomeSearch } from './HomeSearch';
import { getFeatured, getCities } from '@/lib/api';
import type { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'GoNest – Find Your Home in Mumbai',
};
 
export default async function HomePage() {
  const [featured, cities] = await Promise.all([getFeatured(3), getCities()]);
 
  return (
    <>
      <Nav />
      <main>
 
        {/* Hero */}
        <section style={{padding:'80px 24px 56px',textAlign:'center'}}>
          <div style={{maxWidth:560,margin:'0 auto'}}>
            <h1 style={{fontSize:'clamp(28px,5vw,40px)',fontWeight:700,color:'#111',letterSpacing:'-0.03em',lineHeight:1.15,marginBottom:10}}>
              Find your next home.
            </h1>
            <p style={{fontSize:15,color:'#6B6B6B',marginBottom:28}}>
              Search by city, locality or project.
            </p>
            <HomeSearch />
            <div style={{display:'flex',justifyContent:'center',gap:4,marginTop:14,flexWrap:'wrap'}}>
              {[['Buy','/buy'],['Rent','/rent'],['New Projects','/projects']].map(([l,h])=>(
                <Link key={l} href={h} style={{padding:'5px 14px',borderRadius:9999,fontSize:13,color:'#6B6B6B'}}>
                  {l}
                </Link>
              ))}
            </div>
            {cities.length > 0 && (
              <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:8,marginTop:14}}>
                {cities.slice(0,5).map(c=>(
                  <Link key={c.id} href={`/search?city=${c.id}`}
                    style={{padding:'5px 14px',borderRadius:9999,fontSize:12,color:'#6B6B6B',border:'1px solid #E5E5E5'}}>
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
 
        {/* Featured */}
        {featured.length > 0 && (
          <section style={{maxWidth:1200,margin:'0 auto',padding:'0 24px 72px'}}>
            <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:24}}>
              <h2 style={{fontSize:20,fontWeight:600,color:'#111',letterSpacing:'-0.02em'}}>Featured Properties</h2>
              <Link href="/search" style={{fontSize:13,color:'#6B6B6B',textDecoration:'underline'}}>View all</Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'32px 20px'}}>
              {featured.map(l=><PropertyCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}
 
        {/* Categories */}
        <section style={{background:'#F7F7F7',padding:'52px 24px'}}>
          <div style={{maxWidth:1200,margin:'0 auto'}}>
            <h2 style={{fontSize:20,fontWeight:600,color:'#111',letterSpacing:'-0.02em',marginBottom:20}}>Explore by type</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
              {[['Apartments','apartment'],['Villas','villa'],['Houses','house'],['Plots','plot'],['Commercial','commercial']].map(([label,type])=>(
                <Link key={type} href={`/search?type=${type}`}
                  style={{display:'block',background:'#fff',border:'1px solid #E5E5E5',borderRadius:12,padding:'18px 16px',fontSize:14,fontWeight:500,color:'#111'}}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
 
        {/* Why GoNest */}
        <section style={{maxWidth:1200,margin:'0 auto',padding:'56px 24px 80px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:40}}>
            {[
              ['Verified Listings',     'Every property is checked before going live.'],
              ['Transparent Pricing',   'No hidden charges. What you see is what you pay.'],
              ['Trusted Professionals', 'Verified owners and agents only.'],
            ].map(([t,b])=>(
              <div key={t}>
                <h3 style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:6}}>{t}</h3>
                <p  style={{fontSize:13,color:'#6B6B6B',lineHeight:1.65}}>{b}</p>
              </div>
            ))}
          </div>
        </section>
 
      </main>
      <Footer />
    </>
  );
}
