import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { HomeSearch } from './HomeSearch';
import { getFeatured, getCities } from '@/lib/api';

export default async function HomePage() {
  const [featured, cities] = await Promise.all([getFeatured(3), getCities()]);
  return (
    <>
      <Nav />
      <main>

        {/* ── Hero ── */}
        <section style={{padding:'80px 24px 56px',textAlign:'center'}}>
          <div style={{maxWidth:600,margin:'0 auto'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:9999,padding:'4px 12px',fontSize:12,fontWeight:500,color:'#15803D',marginBottom:20}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#16A34A'}}/>
              Verified listings only · Mumbai
            </div>
            <h1 style={{fontSize:'clamp(28px,5vw,42px)',fontWeight:700,color:'#111',letterSpacing:'-0.03em',lineHeight:1.15,marginBottom:10}}>
              Find your next home.<br/>
              <span style={{color:'#6B6B6B',fontWeight:400,fontSize:'clamp(20px,3vw,28px)'}}>Guided. Verified. Stress-free.</span>
            </h1>
            <p style={{fontSize:15,color:'#6B6B6B',marginBottom:28,lineHeight:1.6}}>
              We don&apos;t just show listings — we guide your entire property journey.
            </p>
            <HomeSearch />
            <div style={{display:'flex',justifyContent:'center',gap:4,marginTop:14,flexWrap:'wrap'}}>
              {[['Buy','/buy'],['Rent','/rent'],['New Projects','/projects']].map(([l,h])=>(
                <Link key={l} href={h} style={{padding:'5px 14px',borderRadius:9999,fontSize:13,color:'#6B6B6B',border:'1px solid transparent'}}>{l}</Link>
              ))}
            </div>
            {cities.length > 0 && (
              <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:8,marginTop:14}}>
                {cities.slice(0,5).map((c:any)=>(
                  <Link key={c.id} href={`/search?city=${c.id}`} style={{padding:'5px 14px',borderRadius:9999,fontSize:12,color:'#6B6B6B',border:'1px solid #E5E5E5'}}>{c.name}</Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Trust strip ── */}
        <section style={{borderTop:'1px solid #E5E5E5',borderBottom:'1px solid #E5E5E5',padding:'20px 24px'}}>
          <div style={{maxWidth:1200,margin:'0 auto',display:'flex',flexWrap:'wrap',gap:24,justifyContent:'center'}}>
            {[
              ['✓ Verified listings','Every property checked before going live'],
              ['◎ Price analysis','Fair value vs market avg on every listing'],
              ['◈ Area scores','Connectivity, schools, safety rated per locality'],
              ['☑ Buying guide','Step-by-step checklist for every transaction'],
            ].map(([t,b])=>(
              <div key={t} style={{textAlign:'center'}}>
                <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:2}}>{t}</div>
                <div style={{fontSize:12,color:'#6B6B6B'}}>{b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured ── */}
        {featured.length > 0 && (
          <section style={{maxWidth:1200,margin:'0 auto',padding:'56px 24px 72px'}}>
            <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:24}}>
              <h2 style={{fontSize:20,fontWeight:600,color:'#111',letterSpacing:'-0.02em'}}>Featured Properties</h2>
              <Link href="/search" style={{fontSize:13,color:'#6B6B6B',textDecoration:'underline'}}>View all</Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'32px 20px'}}>
              {featured.map((l:any)=><PropertyCard key={l.id} listing={l}/>)}
            </div>
          </section>
        )}

        {/* ── Categories ── */}
        <section style={{background:'#F7F7F7',padding:'52px 24px'}}>
          <div style={{maxWidth:1200,margin:'0 auto'}}>
            <h2 style={{fontSize:20,fontWeight:600,color:'#111',letterSpacing:'-0.02em',marginBottom:20}}>Explore by type</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
              {[['Apartments','apartment'],['Villas','villa'],['Houses','house'],['Plots','plot'],['Commercial','commercial']].map(([label,type])=>(
                <Link key={type} href={`/search?type=${type}`} style={{display:'block',background:'#fff',border:'1px solid #E5E5E5',borderRadius:12,padding:'18px 16px',fontSize:14,fontWeight:500,color:'#111'}}>{label}</Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{maxWidth:1200,margin:'0 auto',padding:'56px 24px 80px'}}>
          <h2 style={{fontSize:20,fontWeight:600,color:'#111',letterSpacing:'-0.02em',marginBottom:8}}>How GoNest works</h2>
          <p style={{fontSize:14,color:'#6B6B6B',marginBottom:32}}>We guarantee what we control. We facilitate everything else.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:32}}>
            {[
              ['1. Discover','Search verified listings with price insights and area scores.'],
              ['2. Schedule','Book a visit in one click. No repeated calls to 10 agents.'],
              ['3. Analyse','See fair value estimates, EMI breakdown, and checklist.'],
              ['4. Transact','Follow the guided journey from token to registration.'],
            ].map(([t,b])=>(
              <div key={t}>
                <h3 style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:6}}>{t}</h3>
                <p style={{fontSize:13,color:'#6B6B6B',lineHeight:1.65}}>{b}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
