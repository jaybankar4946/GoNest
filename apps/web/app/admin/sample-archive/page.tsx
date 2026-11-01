'use client';

import { useEffect, useMemo, useState } from 'react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { adminGetSampleArchive, imgUrl } from '@/lib/api';
import { formatPrice } from '@/lib/format';

type ArchiveFilter = 'all' | 'sale' | 'rent';

const label = (value: unknown) => value == null || value === '' ? 'Not recorded' : String(value);
const pretty = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function AdminSampleArchivePage() {
  const { profile, loading } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [filter, setFilter] = useState<ArchiveFilter>('all');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading || profile?.role !== 'admin') return;
    let live = true;
    setBusy(true);
    adminGetSampleArchive()
      .then(rows => { if (live) setRecords(rows); })
      .catch(err => { if (live) setError(err?.message ?? 'Could not load archived sample listings.'); })
      .finally(() => { if (live) setBusy(false); });
    return () => { live = false; };
  }, [loading, profile?.role]);

  const cities = useMemo(() => Array.from(new Set(records.map(r => r.city?.name).filter(Boolean))).sort(), [records]);
  const filtered = useMemo(() => records.filter(r => {
    if (filter !== 'all' && r.purpose !== filter) return false;
    if (city !== 'all' && r.city?.name !== city) return false;
    const haystack = [r.title, r.description, r.city?.name, r.locality?.name, r.neighbourhood, r.landmark, r.address_line, r.pincode]
      .filter(Boolean).join(' ').toLowerCase();
    return !search.trim() || haystack.includes(search.trim().toLowerCase());
  }), [records, filter, city, search]);

  const counts = useMemo(() => ({
    all: records.length,
    sale: records.filter(r => r.purpose === 'sale').length,
    rent: records.filter(r => r.purpose === 'rent').length,
  }), [records]);

  if (loading || busy) return <><Nav/><main style={{maxWidth:1180,margin:'0 auto',padding:'48px 24px',color:'#666'}}>Loading administrator archive…</main><Footer/></>;
  if (!profile || profile.role !== 'admin') return <><Nav/><main style={{maxWidth:1180,margin:'0 auto',padding:'48px 24px'}}><h1 style={{fontSize:22,fontWeight:700}}>Administrator access required</h1><p style={{color:'#666',marginTop:8}}>Archived sample listings are private and visible only to GoNest administrators.</p></main><Footer/></>;

  return (
    <>
      <Nav/>
      <main style={{maxWidth:1180,margin:'0 auto',padding:'34px 24px 80px'}}>
        <a href="/admin" style={{fontSize:13,color:'#555',textDecoration:'underline'}}>← Admin Dashboard</a>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap',marginTop:18,marginBottom:22}}>
          <div>
            <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-.03em',color:'#111'}}>Archived sample listings</h1>
            <p style={{fontSize:14,color:'#666',marginTop:6,maxWidth:720,lineHeight:1.6}}>Internal QA gallery for archived demo properties. Full saved listing details and all uploaded photos are retained here. These are illustrative records, not real property offers.</p>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <span style={{padding:'7px 11px',borderRadius:999,background:'#FFF7ED',color:'#9A3412',fontSize:12,fontWeight:700}}>ADMIN ONLY</span>
            <span style={{padding:'7px 11px',borderRadius:999,background:'#F3F4F6',color:'#333',fontSize:12,fontWeight:600}}>{records.length} archived samples</span>
          </div>
        </div>

        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginBottom:18}}>
          {([
            ['all', 'All', counts.all],
            ['sale', 'Buy', counts.sale],
            ['rent', 'Rent', counts.rent],
          ] as [ArchiveFilter,string,number][]).map(([key,name,count]) => (
            <button key={key} onClick={() => setFilter(key)} style={{padding:'9px 15px',borderRadius:999,border:'1px solid '+(filter===key?'#111':'#E5E7EB'),background:filter===key?'#111':'#fff',color:filter===key?'#fff':'#333',fontSize:13,fontWeight:650,cursor:'pointer'}}>{name} <span style={{opacity:.75}}>({count})</span></button>
          ))}
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title, locality, city…" style={{minWidth:220,flex:'1 1 240px',padding:'10px 12px',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13}}/>
          <select value={city} onChange={e=>setCity(e.target.value)} style={{padding:'10px 12px',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,background:'#fff'}}>
            <option value="all">All cities</option>
            {cities.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {error && <div role="alert" style={{padding:14,border:'1px solid #FECACA',background:'#FEF2F2',color:'#991B1B',borderRadius:12,marginBottom:16,fontSize:13}}>{error}</div>}
        {!error && filtered.length===0 && <div style={{padding:28,border:'1px dashed #D1D5DB',borderRadius:14,color:'#666',fontSize:14}}>No archived sample listings match these filters.</div>}

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,430px),1fr))',gap:16}}>
          {filtered.map((l:any) => {
            const photos=[...(l.listing_images??[])].sort((a:any,b:any)=>a.sort_order-b.sort_order);
            const open=!!expanded[l.id];
            const poster=l.poster??{};
            return (
              <article key={l.id} style={{border:'1px solid #E5E7EB',borderRadius:16,overflow:'hidden',background:'#fff'}}>
                <div style={{padding:'12px 14px',display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}>
                  <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                    <span style={{fontSize:11,fontWeight:750,letterSpacing:'.04em',padding:'4px 8px',borderRadius:999,background:'#FFF7ED',color:'#9A3412'}}>SAMPLE · NOT LIVE</span>
                    <span style={{fontSize:11,fontWeight:650,padding:'4px 8px',borderRadius:999,background:'#F3F4F6',color:'#374151'}}>ARCHIVED</span>
                  </div>
                  <span style={{fontSize:11,color:'#777'}}>{l.purpose==='sale'?'BUY':'RENT'}</span>
                </div>

                {photos.length>0 ? (
                  <div style={{display:'grid',gridTemplateColumns:photos.length===1?'1fr':'repeat(2,minmax(0,1fr))',gap:3,background:'#F3F4F6'}}>
                    {photos.map((p:any,i:number)=><a key={p.id} href={imgUrl(p.storage_path)} target="_blank" rel="noreferrer" style={{display:'block',height:photos.length===1?250:165,overflow:'hidden',background:'#E5E7EB',position:'relative'}}>
                      <img src={imgUrl(p.storage_path)} alt={l.title+' photo '+(i+1)} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      {p.is_cover&&<span style={{position:'absolute',left:8,bottom:8,background:'#111C',color:'#fff',fontSize:10,padding:'4px 7px',borderRadius:6}}>Cover</span>}
                    </a>)}
                  </div>
                ) : (
                  <div style={{height:150,display:'flex',alignItems:'center',justifyContent:'center',background:'#F8FAFC',color:'#64748B',fontSize:13}}>No uploaded property photos on this record</div>
                )}

                <div style={{padding:16}}>
                  <h2 style={{fontSize:17,fontWeight:750,color:'#111',lineHeight:1.35}}>{l.title}</h2>
                  <p style={{fontSize:13,color:'#666',marginTop:5}}>{[l.locality?.name,l.city?.name].filter(Boolean).join(', ')||'Location not recorded'}</p>
                  <p style={{fontSize:20,fontWeight:800,color:'#111',marginTop:12}}>{formatPrice(l.price,l.purpose)}</p>
                  <div style={{display:'flex',gap:14,flexWrap:'wrap',fontSize:12,color:'#555',marginTop:10}}>
                    <span>{label(l.bedrooms)} BHK</span><span>{label(l.bathrooms)} bathrooms</span><span>{l.carpet_area??l.sqft??'—'} sq ft</span><span>{pretty(label(l.property_type))}</span>
                  </div>
                  {l.description&&<p style={{fontSize:13,color:'#444',lineHeight:1.6,marginTop:12,whiteSpace:'pre-wrap'}}>{l.description}</p>}
                  <button onClick={()=>setExpanded(p=>({...p,[l.id]:!p[l.id]}))} aria-expanded={open} style={{marginTop:14,padding:'8px 12px',border:'1px solid #E5E7EB',borderRadius:9,background:'#fff',fontSize:12,fontWeight:650,cursor:'pointer',color:'#222'}}>{open?'Hide full listing details':'View full listing details'}</button>

                  {open&&(
                    <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid #E5E7EB',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'12px 18px'}}>
                      {([
                        ['Listing ID',l.id],['Purpose',l.purpose],['Status',l.status],['Data class',l.is_sample?'Sample':'Unknown'],
                        ['Property type',l.property_type],['City',l.city?.name],['Locality',l.locality?.name],['Address',l.address_line],
                        ['Neighbourhood',l.neighbourhood],['Landmark',l.landmark],['PIN code',l.pincode],['Price',formatPrice(l.price,l.purpose)],
                        ['Price negotiable',l.price_negotiable?'Yes':'No'],['Monthly maintenance',l.maintenance_monthly],['Security deposit',l.security_deposit],
                        ['Bedrooms',l.bedrooms],['Bathrooms',l.bathrooms],['Built-up area (sq ft)',l.sqft],['Carpet area (sq ft)',l.carpet_area],
                        ['Floor',l.floor_number],['Total floors',l.total_floors],['Furnishing',l.furnishing],['Property age',l.property_age],
                        ['Facing',l.facing],['Balconies',l.balconies],['Availability',l.availability],['Available from',l.available_from],
                        ['Brokerage',l.brokerage],['Verification',l.verification_level],['Featured',l.featured?'Yes':'No'],
                        ['Poster type',l.poster_type],['Posted by',poster.full_name],['Poster role',poster.role],['Agency',poster.agency_name],
                        ['RERA number',poster.rera_number],['Photo count',photos.length],['Video URL',l.video_url],
                        ['Created',l.created_at?new Date(l.created_at).toLocaleString('en-IN'):'Not recorded'],
                        ['Last updated',l.updated_at?new Date(l.updated_at).toLocaleString('en-IN'):'Not recorded'],
                      ] as [string,unknown][]).map(([k,v])=><div key={k} style={{minWidth:0}}>
                        <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.06em',color:'#888',fontWeight:700}}>{k}</div>
                        <div style={{fontSize:12,color:'#222',marginTop:3,overflowWrap:'anywhere'}}>{label(v)}</div>
                      </div>)}
                      <div style={{gridColumn:'1/-1'}}>
                        <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.06em',color:'#888',fontWeight:700}}>Amenities</div>
                        <div style={{fontSize:12,color:'#222',marginTop:5}}>{Array.isArray(l.amenities)&&l.amenities.length?l.amenities.join(' · '):'Not recorded'}</div>
                      </div>
                      <div style={{gridColumn:'1/-1'}}>
                        <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.06em',color:'#888',fontWeight:700}}>All photo files</div>
                        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:5}}>{photos.length?photos.map((p:any,i:number)=><a key={p.id} href={imgUrl(p.storage_path)} target="_blank" rel="noreferrer" style={{fontSize:12,color:'#1D4ED8',textDecoration:'underline'}}>Photo {i+1} ↗</a>):<span style={{fontSize:12,color:'#666'}}>No photos saved</span>}</div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
      <Footer/>
    </>
  );
}
