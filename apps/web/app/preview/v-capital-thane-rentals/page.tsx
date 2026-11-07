import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';

type Rental = {
  id:string; title:string; price:number; bedrooms:number; bathrooms:number|null; sqft:number|null;
  pincode:string|null; neighbourhood:string|null; address_line:string|null; landmark:string|null;
  furnishing:string|null; available_from:string|null; verification_level:string; status:string;
  amenities:string[]|null; latitude:number|null; longitude:number|null; description:string|null;
};

function money(n:number){ return '₹'+n.toLocaleString('en-IN')+'/mo'; }
function label(s:string|null){ return s ? s.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) : 'Not provided'; }

export default async function VCapitalThanePreview(){
  const { data, error } = await supabase
    .from('gonest_preview_vcapital_rentals')
    .select('*')
    .order('price', { ascending:true });

  const listings = (data ?? []) as Rental[];
  const areas = Array.from(new Set(listings.map(x=>x.neighbourhood).filter(Boolean))) as string[];
  const furnishing = Array.from(new Set(listings.map(x=>label(x.furnishing)))).filter(x=>x!=='Not provided');

  return <><Nav />
    <main style={{background:'#F7F8FA',minHeight:'75vh'}}>
      <section style={{background:'#111827',color:'#fff',padding:'56px 24px 48px'}}>
        <div style={{maxWidth:1240,margin:'0 auto'}}>
          <div style={{display:'inline-flex',padding:'6px 10px',borderRadius:999,background:'rgba(255,255,255,.12)',fontSize:12,fontWeight:700,letterSpacing:.3}}>INTERNAL CUSTOMER-READINESS PREVIEW</div>
          <h1 style={{fontSize:'clamp(32px,5vw,56px)',lineHeight:1.02,letterSpacing:-1.8,margin:'18px 0 14px'}}>V. Capital Realty rentals · Thane</h1>
          <p style={{maxWidth:760,fontSize:16,lineHeight:1.65,color:'#D1D5DB',margin:0}}>A customer-facing inventory preview built from the supplied V. Capital rental records. Pricing, BHK, furnishing and reported amenities are shown as supplied; unverified unit facts are never invented.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:24}}>
            <span style={{background:'#fff',color:'#111827',borderRadius:12,padding:'10px 14px',fontWeight:800}}>{listings.length} rental records</span>
            <span style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',borderRadius:12,padding:'10px 14px'}}>Thane region</span>
            <span style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',borderRadius:12,padding:'10px 14px'}}>Pending verification</span>
          </div>
        </div>
      </section>

      <section style={{maxWidth:1240,margin:'0 auto',padding:'28px 24px 64px'}}>
        {error && <div style={{background:'#FEF2F2',border:'1px solid #FECACA',padding:16,borderRadius:16,color:'#991B1B',marginBottom:20}}>Preview data could not be loaded.</div>}
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 340px',gap:24,alignItems:'start'}}>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:16,marginBottom:18,flexWrap:'wrap'}}>
              <div><div style={{fontSize:13,color:'#6B7280'}}>V. Capital supply</div><h2 style={{margin:'4px 0 0',fontSize:26}}>Rental inventory</h2></div>
              <div style={{fontSize:13,color:'#6B7280'}}>Sorted by monthly rent</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(285px,1fr))',gap:16}}>
              {listings.map(l=><article key={l.id} style={{background:'#fff',border:'1px solid #E5E7EB',borderRadius:22,overflow:'hidden',boxShadow:'0 4px 18px rgba(17,24,39,.05)'}}>
                <div style={{aspectRatio:'4/2.6',background:'linear-gradient(135deg,#E5E7EB,#F9FAFB)',display:'grid',placeItems:'center',position:'relative'}}>
                  <div style={{textAlign:'center',color:'#6B7280',padding:20}}>
                    <div style={{fontSize:28,marginBottom:6}}>⌂</div>
                    <div style={{fontSize:12,fontWeight:700}}>Property photos pending</div>
                    <div style={{fontSize:11,marginTop:4}}>No unit photo has been attached to this record</div>
                  </div>
                  <span style={{position:'absolute',top:12,left:12,background:'#fff',borderRadius:999,padding:'6px 9px',fontSize:10,fontWeight:800}}>UNVERIFIED</span>
                </div>
                <div style={{padding:17}}>
                  <div style={{fontSize:13,color:'#6B7280',marginBottom:6}}>{l.neighbourhood ?? 'Thane'}{l.pincode ? ' · '+l.pincode : ''}</div>
                  <h3 style={{fontSize:17,lineHeight:1.3,margin:'0 0 9px'}}>{l.title.replace('V. Capital Realty · ','')}</h3>
                  <div style={{fontSize:21,fontWeight:850,letterSpacing:-.4}}>{money(l.price)}</div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12,fontSize:12}}>
                    <span style={{padding:'6px 8px',background:'#F3F4F6',borderRadius:8}}>{l.bedrooms || '—'} BHK</span>
                    <span style={{padding:'6px 8px',background:'#F3F4F6',borderRadius:8}}>{l.bathrooms ? l.bathrooms+' bath' : 'Baths pending'}</span>
                    <span style={{padding:'6px 8px',background:'#F3F4F6',borderRadius:8}}>{l.sqft ? l.sqft+' sq ft' : 'Area pending'}</span>
                  </div>
                  <div style={{marginTop:12,fontSize:12,color:'#4B5563'}}>{label(l.furnishing)}</div>
                  <div style={{marginTop:12,fontSize:12,color:'#6B7280',lineHeight:1.5}}>{l.amenities?.slice(0,3).join(' · ') || 'No verified amenities yet'}</div>
                  <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid #F0F0F0',fontSize:11,color:'#92400E'}}>Availability, area, bathrooms, floor, facing, parking, deposit, maintenance, exact pin and unit photos require confirmation.</div>
                </div>
              </article>)}
            </div>
          </div>

          <aside style={{position:'sticky',top:86}}>
            <div style={{background:'#fff',border:'1px solid #E5E7EB',borderRadius:22,padding:20,marginBottom:16}}>
              <h3 style={{margin:'0 0 14px',fontSize:16}}>Thane coverage</h3>
              <div style={{fontSize:13,color:'#4B5563',lineHeight:1.65}}>Current records include multiple Thane neighbourhoods and project clusters. Exact unit pins are intentionally not shown until verified.</div>
              <div style={{marginTop:14,display:'flex',gap:7,flexWrap:'wrap'}}>{areas.map(a=><span key={a} style={{fontSize:11,padding:'6px 8px',background:'#F3F4F6',borderRadius:999}}>{a}</span>)}</div>
            </div>
            <div style={{background:'#fff',border:'1px solid #E5E7EB',borderRadius:22,overflow:'hidden'}}>
              <div style={{height:210,background:'linear-gradient(135deg,#E8EEF5,#DDE5EE)',display:'grid',placeItems:'center',textAlign:'center',padding:24}}>
                <div><div style={{fontSize:30}}>⌖</div><strong style={{display:'block',marginTop:8}}>Area-level map ready</strong><span style={{fontSize:12,color:'#4B5563'}}>Exact listing pins will appear after address verification.</span></div>
              </div>
              <div style={{padding:18}}>
                <div style={{fontSize:12,color:'#6B7280'}}>Map status</div>
                <div style={{fontWeight:800,marginTop:3}}>Awaiting verified unit coordinates</div>
                <div style={{fontSize:12,color:'#6B7280',lineHeight:1.55,marginTop:8}}>No coordinate has been fabricated for customer display.</div>
              </div>
            </div>
            <div style={{marginTop:16,padding:18,borderRadius:22,background:'#ECFDF5',border:'1px solid #A7F3D0'}}>
              <div style={{fontSize:12,fontWeight:800,color:'#065F46'}}>Next verification pass</div>
              <ul style={{margin:'9px 0 0',paddingLeft:18,fontSize:12,color:'#065F46',lineHeight:1.7}}>
                <li>Confirm live availability</li><li>Collect unit photos</li><li>Confirm carpet/built-up area</li><li>Confirm baths, floor and parking</li><li>Confirm deposit, maintenance and exact map pin</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
