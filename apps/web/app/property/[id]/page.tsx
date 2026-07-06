import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import { getListingById, getSimilarListings, imgUrl } from '@/lib/api';
import { formatPrice, bhkLabel, capitalize } from '@/lib/format';
import { PropertyCard } from '@/components/property/PropertyCard';
import { ContactForms } from './ContactForms';
import { ReviewsAndReport } from './ReviewsAndReport';
import type { Metadata } from 'next';
 
export async function generateMetadata({ params }: { params: Promise<{id:string}> }): Promise<Metadata> {
  const { id } = await params;
  const l = await getListingById(id);
  if (!l) return { title: 'Property not found' };
  const city = (l.city as any)?.name ?? '';
  return {
    title: l.title,
    description: `${bhkLabel(l.bedrooms,l.property_type)} ${capitalize(l.property_type)} for ${l.purpose==='sale'?'sale':'rent'} in ${city}. ${formatPrice(l.price,l.purpose)}.`,
    openGraph: {
      title: l.title,
      description: l.description ?? '',
      images: l.listing_images[0] ? [imgUrl(l.listing_images[0].storage_path)] : [],
    },
  };
}
 
export default async function PropertyPage({ params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const l = await getListingById(id);
  if (!l) notFound();
 
  const similar  = await getSimilarListings(l, 3);
  const imgs     = [...(l.listing_images??[])].sort((a,b)=>a.sort_order-b.sort_order);
  const city     = (l.city     as any)?.name ?? '';
  const locality = (l.locality as any)?.name ?? '';
  const poster   = l.poster as any;
 
  const badge = l.verification_level==='platform_verified' ? 'GoNest Verified'
              : l.verification_level==='verified'           ? 'Verified' : null;
 
  const specs = [
    l.bedrooms  > 0 && `${bhkLabel(l.bedrooms,l.property_type)}`,
    l.bathrooms > 0 && `${l.bathrooms} bath`,
    l.sqft          && `${l.sqft.toLocaleString('en-IN')} ft²`,
    l.furnishing    && l.furnishing.replace('-',' '),
    l.floor_number  && `Floor ${l.floor_number}${l.total_floors ? '/' + l.total_floors : ''}`,
    l.facing        && `${capitalize(l.facing)} facing`,
  ].filter(Boolean) as string[];
 
  const S = {
    main:  { maxWidth:1000,margin:'0 auto',padding:'28px 24px 80px' } as React.CSSProperties,
    img:   { borderRadius:16,overflow:'hidden',aspectRatio:'16/9',background:'#F0F0F0',marginBottom:32 } as React.CSSProperties,
    grid:  { display:'grid',gridTemplateColumns:'1fr 300px',gap:48,alignItems:'start' } as React.CSSProperties,
    badge: { fontSize:11,fontWeight:600,color:'#fff',background:'#111',padding:'3px 10px',borderRadius:9999,display:'inline-block',marginBottom:12 } as React.CSSProperties,
    h1:    { fontSize:26,fontWeight:700,color:'#111',letterSpacing:'-0.02em',marginBottom:6 } as React.CSSProperties,
    loc:   { fontSize:14,color:'#6B6B6B',marginBottom:20 } as React.CSSProperties,
    price: { fontSize:28,fontWeight:700,color:'#111',marginBottom:8 } as React.CSSProperties,
    specs: { display:'flex',flexWrap:'wrap' as const,gap:24,paddingBottom:24,borderBottom:'1px solid #E5E5E5',marginBottom:24 },
    spec:  { fontSize:14,fontWeight:600,color:'#111' } as React.CSSProperties,
    desc:  { fontSize:14,color:'#3D3D3D',lineHeight:1.75,marginBottom:32 } as React.CSSProperties,
    poster:{ padding:16,border:'1px solid #E5E5E5',borderRadius:12,marginBottom:24 } as React.CSSProperties,
  };
 
  return (
    <>
      <Nav />
      <main style={S.main}>
        {imgs[0] && (
          <div style={S.img}>
            <img src={imgUrl(imgs[0].storage_path)} alt={l.title}
              style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
          </div>
        )}
 
        {/* Thumbnail strip */}
        {imgs.length > 1 && (
          <div style={{display:'flex',gap:8,marginBottom:32,overflowX:'auto'}}>
            {imgs.slice(1,6).map(img=>(
              <div key={img.id} style={{width:100,height:70,flexShrink:0,borderRadius:8,overflow:'hidden',background:'#F0F0F0'}}>
                <img src={imgUrl(img.storage_path)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              </div>
            ))}
          </div>
        )}
 
        <div style={S.grid}>
          <div>
            {badge && <span style={S.badge}>{badge}</span>}
            <h1 style={S.h1}>{l.title}</h1>
            <p style={S.loc}>{locality}{locality&&city?', ':''}{city}</p>
 
            <div style={S.price}>
              {formatPrice(l.price,l.purpose)}
              {l.purpose==='rent' && l.security_deposit && (
                <span style={{fontSize:13,fontWeight:400,color:'#6B6B6B',marginLeft:10}}>
                  + ₹{l.security_deposit.toLocaleString('en-IN')} deposit
                </span>
              )}
            </div>
            {l.price_negotiable && <p style={{fontSize:12,color:'#6B6B6B',marginBottom:20}}>Price negotiable</p>}
 
            {specs.length > 0 && (
              <div style={S.specs}>
                {specs.map(s=>(
                  <div key={s}>
                    <div style={S.spec}>{s}</div>
                  </div>
                ))}
              </div>
            )}
 
            {l.description && <p style={S.desc}>{l.description}</p>}
 
            {l.landmark && (
              <p style={{fontSize:13,color:'#6B6B6B',marginBottom:24}}>
                <strong>Landmark:</strong> {l.landmark}
              </p>
            )}
 
            {/* WhatsApp */}
            {poster?.phone && (
              <a href={`https://wa.me/91${poster.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi, I'm interested in: ${l.title}`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'#25D366',marginBottom:24,textDecoration:'none'}}>
                WhatsApp Agent
              </a>
            )}
 
            {poster && (
              <div style={S.poster}>
                <p style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:2}}>
                  {poster.full_name ?? 'Agent'} · {poster.role==='agent' ? 'Agent' : 'Owner'}
                </p>
                {poster.agency_name && <p style={{fontSize:12,color:'#6B6B6B'}}>{poster.agency_name}</p>}
                {poster.agent_verified && <p style={{fontSize:11,color:'#16A34A',marginTop:4}}>✓ GoNest verified agent</p>}
                {poster.rera_number && <p style={{fontSize:11,color:'#6B6B6B'}}>RERA: {poster.rera_number}</p>}
              </div>
            )}
          </div>
 
          {/* Contact + visit panel */}
          <ContactForms listingId={l.id} />
        </div>
 
        {/* Similar properties */}
        {similar.length > 0 && (
          <div style={{marginTop:56,paddingTop:40,borderTop:'1px solid #E5E5E5'}}>
            <h2 style={{fontSize:18,fontWeight:600,color:'#111',marginBottom:24}}>Similar properties</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'28px 20px'}}>
              {similar.map(s=><PropertyCard key={s.id} listing={s} />)}
            </div>
          </div>
        )}

        <ReviewsAndReport listingId={l.id} />
      </main>
      <Footer />
    </>
  );
}
