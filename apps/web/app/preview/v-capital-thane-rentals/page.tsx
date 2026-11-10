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

const PROJECTS = [
  { match:/lodha amara/i, location:'Kolshet, Thane', image:'https://www.lodhagroup.com/sites/default/files/gallery/grid/1000x480_Amara_clubhouse_0.jpg', gallery:'https://www.lodhagroup.com/projects/residential-property-in-thane/lodha-amara/gallery', source:'Lodha Group official gallery', note:'Project clubhouse image only; not the rented flat.' },
  { match:/lodha splendora/i, location:'Ghodbunder Road, Thane', gallery:'https://www.lodhagroup.com/projects/residential-property-in-thane/lodha-splendora/gallery', source:'Lodha Group official gallery', note:'Official project gallery linked; no unit photograph supplied.' },
  { match:/godrej emrald|godrej emerald/i, location:'Ghodbunder Road, Thane', gallery:'https://www.godrejproperties.com/mumbai/residential/godrej-emerald/gallery', source:'Godrej Properties official gallery', note:'Official project gallery linked; sample-flat imagery is not this rented unit.' },
  { match:/dosti west county/i, location:'Balkum, Thane', gallery:'https://dostiwestcounty.com/gallery', source:'Dosti Realty official gallery', note:'Project gallery linked; images are project references, not this rented unit.' },
  { match:/hiranandani estate|h:e (avilia|canosa|ohp|rodas)/i, location:'Hiranandani Estate, Thane', gallery:'https://www.houseofhiranandani.com/residential-projects/thane/estate', source:'House of Hiranandani', note:'Project-level source; exact building/unit image not verified.' }
];

function projectFor(title:string){ return PROJECTS.find(p=>p.match.test(title)) ?? null; }
function rupees(n:number){ return '₹'+Number(n||0).toLocaleString('en-IN')+'/month'; }
function nice(s:string|null){ return s ? s.replace(/-/g,' ').replace(/\\b\\w/g,c=>c.toUpperCase()) : 'Not provided'; }
function config(title:string, bedrooms:number){ const m=title.match(/(\\d+(?:\\.\\d+)?)\\s*BHK/i); if(m)return m[1]+' BHK'; const rk=title.match(/(\\d+)\\s*RK/i); return rk?rk[1]+' RK':(bedrooms?bedrooms+' BHK':'Not provided'); }

export default async function VCapitalThanePreview(){
  const {data,error}=await supabase.from('gonest_preview_vcapital_rentals').select('*').neq('status','archived').order('price',{ascending:true});
  const listings=(data??[]) as Rental[];
  const pending=listings.filter(x=>x.status==='pending_review').length;
  const active=listings.filter(x=>x.status==='active').length;
  const areas=Array.from(new Set(listings.map(x=>x.neighbourhood).filter(Boolean))) as string[];
  return <><Nav/><main style={{background:'#F7F8FA',minHeight:'75vh'}}>
    <header style={{background:'#111827',color:'#fff',padding:'46px 24px'}}>
      <div style={{maxWidth:1240,margin:'0 auto'}}>
        <span style={{fontSize:11,fontWeight:800,letterSpacing:1,background:'#293548',padding:'7px 10px',borderRadius:30}}>V. CAPITAL REALTY · THANE</span>
        <h1 style={{fontSize:'clamp(32px,5vw,52px)',letterSpacing:-1.5,lineHeight:1.05,margin:'18px 0 12px'}}>Rental homes across Thane</h1>
        <p style={{maxWidth:760,color:'#D1D5DB',lineHeight:1.65,margin:0}}>Inventory details are based on the V. Capital source records. Building photographs and official project galleries are clearly distinguished from actual flat photographs. Unconfirmed unit facts are not invented.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:22}}>{[listings.length+' non-archived records',active+' active',pending+' pending review'].map(x=><span key={x} style={{padding:'10px 13px',borderRadius:10,background:'#293548',fontSize:13,fontWeight:700}}>{x}</span>)}</div>
      </div>
    </header>
    <section style={{maxWidth:1240,margin:'0 auto',padding:'28px 24px 64px'}}>
      {error&&<p style={{color:'#991B1B'}}>Could not load V. Capital preview records.</p>}
      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 280px',gap:22,alignItems:'start'}}>
        <div>
          <h2 style={{fontSize:25,margin:'0 0 18px'}}>V. Capital rental inventory</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
            {listings.map(l=>{const p=projectFor(l.title);const title=l.title.replace('V. Capital Realty · ','');return <article key={l.id} style={{background:'#fff',border:'1px solid #E5E7EB',borderRadius:18,overflow:'hidden',boxShadow:'0 4px 18px rgba(17,24,39,.04)'}}>
              <div style={{height:180,background:'#E9EDF2',position:'relative'}}>
                {p?.image?<img src={p.image} alt="Lodha Amara official project clubhouse photograph; representative project image" style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>:<div style={{height:'100%',display:'grid',placeItems:'center',color:'#64748B',textAlign:'center',padding:16}}><div><div style={{fontSize:30}}>⌂</div><b style={{fontSize:12}}>Exact project photo not yet verified</b><div style={{fontSize:11,marginTop:4}}>No unrelated or generic property image used</div></div></div>}
                <span style={{position:'absolute',top:10,left:10,background:'#fff',padding:'6px 9px',borderRadius:30,fontSize:10,fontWeight:800}}>UNIT PHOTO NOT PROVIDED</span>
                {p?.image&&<span style={{position:'absolute',bottom:9,left:9,background:'#111827dd',color:'#fff',padding:'5px 8px',borderRadius:6,fontSize:10,fontWeight:800}}>REPRESENTATIVE PROJECT PHOTO</span>}
              </div>
              <div style={{padding:16}}>
                <div style={{fontSize:12,color:'#6B7280'}}>{p?.location??l.neighbourhood??'Thane'}{l.pincode?' · '+l.pincode:''}</div>
                <h3 style={{fontSize:17,margin:'6px 0 8px',lineHeight:1.3}}>{title}</h3>
                <div style={{fontSize:21,fontWeight:850}}>{rupees(l.price)}</div>
                <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:12,fontSize:12}}>
                  <span style={{background:'#F3F4F6',padding:'6px 8px',borderRadius:7}}>{config(title,l.bedrooms)}</span>
                  <span style={{background:'#F3F4F6',padding:'6px 8px',borderRadius:7}}>{l.bathrooms?l.bathrooms+' baths':'Baths not provided'}</span>
                  <span style={{background:'#F3F4F6',padding:'6px 8px',borderRadius:7}}>{l.sqft?l.sqft+' sq ft':'Area not provided'}</span>
                </div>
                <div style={{fontSize:12,color:'#4B5563',marginTop:11}}>{nice(l.furnishing)}</div>
                {l.amenities?.length?<div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>{l.amenities.slice(0,5).map(a=><span key={a} style={{fontSize:10,background:'#F3F4F6',padding:'5px 7px',borderRadius:6}}>{a}</span>)}</div>:null}
                {p&&<div style={{borderTop:'1px solid #EEE',marginTop:12,paddingTop:10}}><p style={{fontSize:11,color:'#6B7280',lineHeight:1.5,margin:'0 0 6px'}}>{p.note}</p><Link href={p.gallery} target="_blank" rel="noreferrer" style={{fontSize:12,color:'#1D4ED8',fontWeight:700}}>Open {p.source} ↗</Link></div>}
                <div style={{marginTop:12,borderTop:'1px solid #EEE',paddingTop:10,fontSize:11,color:'#92400E',lineHeight:1.5}}>{l.status==='active'?'Active source record · verification pending':'Source supplied · pending review'}. Confirm current availability, actual unit photos, exact area, bathrooms, floor, deposit, maintenance and exact address with V. Capital.</div>
              </div>
            </article>})}
          </div>
        </div>
        <aside style={{display:'grid',gap:12}}>
          <div style={{background:'#fff',border:'1px solid #E5E7EB',borderRadius:16,padding:16}}><b>Thane localities</b><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>{areas.map(a=><span key={a} style={{fontSize:11,padding:'6px 8px',borderRadius:20,background:'#F3F4F6'}}>{a}</span>)}</div></div>
          <div style={{background:'#FFF7ED',border:'1px solid #FED7AA',borderRadius:16,padding:16,fontSize:12,color:'#9A3412',lineHeight:1.65}}><b>Unit-level confirmation required</b><ul style={{paddingLeft:18,marginBottom:0}}><li>Actual flat photographs</li><li>Carpet/built-up area</li><li>Deposit and maintenance</li><li>Bathrooms and floor</li><li>Exact unit address/map pin</li><li>Current rent and availability</li></ul></div>
        </aside>
      </div>
    </section>
  </main><Footer/></>;
}
