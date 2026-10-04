import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import { getListingById, getSimilarListings, imgUrl } from '@/lib/api';
import { formatPrice, bhkLabel, capitalize } from '@/lib/format';
import { PropertyCard } from '@/components/property/PropertyCard';
import { telHref, waHref } from '@/lib/contact';
import { SaveButton } from '@/components/property/SaveButton';
import { DetailMap } from '@/components/property/DetailMap';
import { ReviewsAndReport } from './ReviewsAndReport';
import Link from 'next/link';
import { ContactForms } from './ContactForms';
import { EMICalculator } from '@/components/transaction/EMICalculator';
import { DocumentChecklist } from '@/components/transaction/DocumentChecklist';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{id:string}> }): Promise<Metadata> {
  const{id}=await params;
  const l=await getListingById(id);
  if(!l)return{title:'Property not found'};
  return{title:l.title,description:`${bhkLabel(l.bedrooms,l.property_type)} ${capitalize(l.property_type)} for ${l.purpose==='sale'?'sale':'rent'}. ${formatPrice(l.price,l.purpose)}.`};
}

export default async function PropertyPage({ params }: { params: Promise<{id:string}> }) {
  const{id}=await params;
  const l=await getListingById(id);
  if(!l)notFound();
  const similar=await getSimilarListings(l,3);
  const imgs=[...(l.listing_images??[])].sort((a:any,b:any)=>a.sort_order-b.sort_order);
  const city=l.city?.name??'';
  const locality=l.locality?.name??'';
  const localitySlug=l.locality?.slug??'';
  const poster=l.poster as any;
  const badge=l.verification_level==='platform_verified'?'GoNest Verified':l.verification_level==='verified'?'Verified':null;
  const specs=[l.bedrooms>0&&`${bhkLabel(l.bedrooms,l.property_type)}`,l.bathrooms>0&&`${l.bathrooms} bath`,l.sqft&&`${l.sqft.toLocaleString('en-IN')} ft²`,l.furnishing&&l.furnishing.replace('-',' '),l.facing&&`${capitalize(l.facing)} facing`,l.floor_number&&`Floor ${l.floor_number}${l.total_floors?'/'+l.total_floors:''}`].filter(Boolean) as string[];
  return(
    <>
      <Nav/>
      <main style={{maxWidth:1120,margin:'0 auto',padding:'32px 24px 80px'}}>
        {/* Images */}
        {imgs[0]&&(
          <div style={{borderRadius:28,overflow:'hidden',aspectRatio:'16/9',background:'#F0F0F0',marginBottom:16}}>
            <img src={imgUrl(imgs[0].storage_path)} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
          </div>
        )}
        {imgs.length>1&&(
          <div style={{display:'flex',gap:8,marginBottom:32,overflowX:'auto'}}>
            {imgs.slice(1,6).map((img:any)=>(
              <div key={img.id} style={{width:100,height:70,flexShrink:0,borderRadius:8,overflow:'hidden',background:'#F0F0F0'}}>
                <img src={imgUrl(img.storage_path)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:48,alignItems:'start'}}>
          {/* Left col */}
          <div>
            {badge&&<span style={{fontSize:11,fontWeight:600,color:'#fff',background:'var(--primary)',padding:'4px 12px',borderRadius:9999,display:'inline-block',marginBottom:12}}>{badge}</span>}
            <h1 style={{fontFamily:'var(--font-manrope), var(--font-display)',fontSize:30,fontWeight:800,color:'#111827',letterSpacing:'-0.025em',marginBottom:6}}>{l.title}</h1>
            <p style={{fontSize:14,color:'#6B6B6B',marginBottom:20}}>{locality}{locality&&city?', ':''}{city}</p>
            <div style={{fontFamily:'var(--font-manrope), var(--font-display)',fontSize:34,fontWeight:800,color:'var(--primary)',marginBottom:8,letterSpacing:'-0.02em'}}>
              {formatPrice(l.price,l.purpose)}
              {l.purpose==='rent'&&l.security_deposit&&<span style={{fontSize:13,fontWeight:400,color:'#6B6B6B',marginLeft:10}}>+ ₹{l.security_deposit.toLocaleString('en-IN')} deposit</span>}
            </div>
            {l.price_negotiable&&<p style={{fontSize:12,color:'#6B6B6B',marginBottom:16}}>Price negotiable</p>}

            {/* Specs */}
            {specs.length>0&&(
              <div style={{display:'flex',flexWrap:'wrap',gap:8,paddingBottom:20,borderBottom:'1px solid #E5E7EB',marginBottom:20}}>
                {specs.map((s:string)=><span key={s} style={{fontWeight:600,fontSize:13,color:'#374151',background:'#F3F4F6',padding:'8px 14px',borderRadius:12}}>{s}</span>)}
              </div>
            )}

            {l.description&&<p style={{fontSize:14,color:'#3D3D3D',lineHeight:1.75,marginBottom:24}}>{l.description}</p>}
            {l.landmark&&<p style={{fontSize:13,color:'#6B6B6B',marginBottom:20}}><strong>Landmark:</strong> {l.landmark}</p>}

            {poster?.phone&&(
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
                <a href={telHref(poster.phone)} style={{padding:'10px 20px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'#111'}}>Call</a>
                <a href={waHref(poster.phone,`Hi, I'm interested in: ${l.title}`)} target="_blank" rel="noopener noreferrer" style={{padding:'10px 20px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'#25D366'}}>WhatsApp</a>
                <SaveButton listingId={l.id}/>
              </div>
            )}
            <DetailMap listing={l}/>
            {(l as any).video_url&&<video src={(l as any).video_url} controls style={{width:'100%',borderRadius:12,marginBottom:24}}/>}

            {/* Poster */}
            {poster&&(
              <div style={{padding:16,border:'1px solid #E5E7EB',borderRadius:20,marginBottom:24,background:'#F9FAFB'}}>
                <p style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:2}}><Link href={`/agents/${l.posted_by}`} style={{textDecoration:'underline'}}>{poster.full_name??'Agent'}</Link> · {poster.role==='agent'?'Agent':'Owner'}</p>
                {poster.agency_name&&<p style={{fontSize:12,color:'#6B6B6B'}}>{poster.agency_name}</p>}
                {poster.agent_verified&&<p style={{fontSize:11,color:'#16A34A',marginTop:4}}>✓ GoNest verified agent</p>}
                {poster.rera_number&&<p style={{fontSize:11,color:'#6B6B6B'}}>RERA: {poster.rera_number}</p>}
              </div>
            )}

            {/* LAYER 3: EMI */}
            {l.purpose==='sale'&&<EMICalculator price={l.price}/>}

            {/* LAYER 3: Checklist */}
            <DocumentChecklist purpose={l.purpose}/>
          </div>

          {/* Right col — contact panel */}
          <ContactForms listingId={l.id}/>
        </div>

        <ReviewsAndReport listingId={l.id}/>

        {/* Similar */}
        {similar.length>0&&(
          <div style={{marginTop:56,paddingTop:40,borderTop:'1px solid #E5E5E5'}}>
            <h2 style={{fontSize:18,fontWeight:600,color:'#111',marginBottom:24}}>Similar properties</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'28px 20px'}}>
              {similar.map((s:any)=><PropertyCard key={s.id} listing={s}/>)}
            </div>
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
