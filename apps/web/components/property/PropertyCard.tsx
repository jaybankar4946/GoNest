'use client';
import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';
import { formatPrice, bhkLabel, capitalize } from '@/lib/format';
import { imgUrl } from '@/lib/api';
import type { ListingFull } from '@/lib/types';
type Props={listing:ListingFull;isSaved?:boolean;onToggle?:(id:string)=>void;onQuickView?:(id:string)=>void};
const BADGE: Record<string,{label:string;bg:string}>={platform_verified:{label:'GoNest Verified',bg:'var(--primary)'},verified:{label:'Verified',bg:'#3D3D3D'}};
export function PropertyCard({listing:l,isSaved,onToggle,onQuickView}:Props) {
  const imgs=[...(l.listing_images??[])].sort((a,b)=>a.sort_order-b.sort_order);
  const src=imgs[0]?imgUrl(imgs[0].storage_path):null;
  const city=(l.city as any)?.name??'';
  const loc=(l.locality as any)?.name??'';
  const badge=BADGE[l.verification_level];
  const sub=l.bedrooms>0?`${bhkLabel(l.bedrooms,l.property_type)} ${capitalize(l.property_type)}`:capitalize(l.property_type);
  return (
    <div className="group" style={{display:'flex',flexDirection:'column',gap:10}}>
      <Link href={`/property/${l.id}`} style={{position:'relative',display:'block',borderRadius:'var(--radius-lg)',overflow:'hidden',aspectRatio:'4/3',background:'var(--gray-1)',boxShadow:'var(--shadow-sm)',transition:'box-shadow .25s'}}
        onMouseOver={e=>(e.currentTarget.style.boxShadow='var(--shadow-lg)')}
        onMouseOut={e=>(e.currentTarget.style.boxShadow='var(--shadow-sm)')}>
        {src?<img src={src} alt={l.title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'transform 0.4s'}} onMouseOver={e=>(e.currentTarget.style.transform='scale(1.04)')} onMouseOut={e=>(e.currentTarget.style.transform='scale(1)')}/>
          :<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'var(--gray-3)'}}>No photo</div>}
        {badge&&<span style={{position:'absolute',top:10,left:10,fontSize:11,fontWeight:600,color:'#fff',background:badge.bg,padding:'3px 9px',borderRadius:9999}}>{badge.label}</span>}
        {l.featured&&!badge&&<span style={{position:'absolute',top:10,left:10,fontSize:11,fontWeight:600,color:'#fff',background:'var(--accent)',padding:'3px 9px',borderRadius:9999}}>Featured</span>}
        <div style={{position:'absolute',top:10,right:10,display:'flex',flexDirection:'column',gap:6}}>
          {onToggle&&<button onClick={e=>{e.preventDefault();onToggle(l.id);}} style={{width:32,height:32,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--shadow-md)'}}>
            <Heart size={14} fill={isSaved?'var(--accent)':'none'} stroke={isSaved?'var(--accent)':'#111'}/>
          </button>}
          {onQuickView&&<button onClick={e=>{e.preventDefault();onQuickView(l.id);}}
            className="opacity-0 group-hover:opacity-100"
            style={{width:32,height:32,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--shadow-md)',transition:'opacity .2s'}}>
            <Eye size={14} stroke="#111"/>
          </button>}
        </div>
      </Link>
      <Link href={`/property/${l.id}`} style={{display:'flex',flexDirection:'column',gap:3}}>
        <span style={{fontWeight:700,fontSize:16,color:'var(--foreground)',fontFamily:'var(--font-display)'}}>{formatPrice(l.price,l.purpose)}</span>
        <span style={{fontSize:14,color:'#111'}}>{sub}</span>
        <span style={{fontSize:13,color:'var(--gray-4)'}}>{loc}{loc&&city?', ':''}{city}</span>
      </Link>
    </div>
  );
}
