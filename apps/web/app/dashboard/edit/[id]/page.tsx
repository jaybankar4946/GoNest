'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import { getListingForEdit, updateListing, uploadListingImage, deleteListingImage, getCities, getLocalities } from '@/lib/api';
import { ChevronLeft, Upload, X, Check } from 'lucide-react';
import type { ListingFull } from '@/lib/types';

const inp: React.CSSProperties={width:'100%',padding:'11px 14px',border:'1px solid #E5E5E5',borderRadius:12,fontSize:14,outline:'none',background:'#fff'};
const lbl: React.CSSProperties={fontSize:13,fontWeight:600,color:'#111',marginBottom:6,display:'block'};

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [listing, setListing] = useState<ListingFull | null>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [localities, setLocalities] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [loadingListing, setLoadingListing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState<any>(null);

  useEffect(() => {
    getListingForEdit(params.id).then(l => {
      if (!l) { setLoadingListing(false); return; }
      setListing(l);
      setF({
        purpose: l.purpose, property_type: l.property_type, title: l.title, description: l.description ?? '',
        bedrooms: l.bedrooms, bathrooms: l.bathrooms, balconies: l.balconies, sqft: l.sqft?.toString() ?? '',
        furnishing: l.furnishing ?? '', facing: l.facing ?? '', city_id: l.city_id, locality_id: l.locality_id,
        address_line: l.address_line ?? '', landmark: l.landmark ?? '', price: l.price.toString(),
        maintenance_monthly: l.maintenance_monthly?.toString() ?? '', security_deposit: l.security_deposit?.toString() ?? '',
        price_negotiable: l.price_negotiable, brokerage: l.brokerage ?? 'none',
      });
      setLoadingListing(false);
    });
    getCities().then(setCities);
  }, [params.id]);

  useEffect(() => { if (!f?.city_id) { setLocalities([]); return; } getLocalities(f.city_id).then(setLocalities); }, [f?.city_id]);

  useEffect(() => {
    if (!authLoading && listing && user && listing.posted_by !== user.id) router.push('/dashboard');
  }, [authLoading, listing, user, router]);

  const upd = useCallback((k: string, v: any) => setF((p: any) => ({ ...p, [k]: v })), []);
  const removeExistingImage = (id: string) => setRemovedImageIds(p => [...p, id]);

  const submit = async () => {
    if (!user || !listing) return;
    setSaving(true); setErr(null);
    try {
      await updateListing(listing.id, {
        title: f.title, description: f.description || null, property_type: f.property_type, purpose: f.purpose,
        city_id: f.city_id, locality_id: f.locality_id, address_line: f.address_line || null, landmark: f.landmark || null,
        price: Number(f.price), maintenance_monthly: f.maintenance_monthly ? Number(f.maintenance_monthly) : null,
        security_deposit: f.security_deposit ? Number(f.security_deposit) : null, price_negotiable: f.price_negotiable,
        brokerage: f.brokerage, bedrooms: f.bedrooms, bathrooms: f.bathrooms, balconies: f.balconies,
        sqft: f.sqft ? Number(f.sqft) : null, furnishing: f.furnishing || null, facing: f.facing || null,
      });
      for (const img of listing.listing_images ?? []) {
        if (removedImageIds.includes(img.id)) await deleteListingImage(img.id, img.storage_path);
      }
      const startOrder = (listing.listing_images?.length ?? 0) - removedImageIds.length;
      for (let i = 0; i < newImages.length; i++) await uploadListingImage(user.id, listing.id, newImages[i], startOrder + i);
      router.push('/dashboard');
    } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.'); }
    finally { setSaving(false); }
  };

  if (loadingListing) return <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p style={{fontSize:14,color:'#6B6B6B'}}>Loading…</p></div>;
  if (!listing || !f) return <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p style={{fontSize:14,color:'#6B6B6B'}}>Listing not found.</p></div>;

  const remainingImages = (listing.listing_images ?? []).filter(img => !removedImageIds.includes(img.id)).sort((a,b) => a.sort_order - b.sort_order);

  return (
    <div style={{minHeight:'100vh',background:'#fff'}}>
      <div style={{maxWidth:560,margin:'0 auto',padding:'40px 24px 80px'}}>
        <button onClick={()=>router.push('/dashboard')} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#6B6B6B',marginBottom:32,cursor:'pointer'}}><ChevronLeft size={16}/>Cancel</button>
        <h1 style={{fontSize:20,fontWeight:700,color:'#111',marginBottom:24}}>Edit listing</h1>

        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <div><label style={lbl}>I want to</label><div style={{display:'flex',gap:8}}>{(['sale','rent'] as const).map(p=><button key={p} onClick={()=>upd('purpose',p)} style={{flex:1,padding:'10px',borderRadius:9999,fontSize:13,fontWeight:500,border:f.purpose===p?'1.5px solid #111':'1px solid #E5E5E5',background:f.purpose===p?'#F7F7F7':'#fff',color:'#111',cursor:'pointer'}}>{p==='sale'?'Sell':'Rent out'}</button>)}</div></div>
          <div><label style={lbl}>Property type</label><select value={f.property_type} onChange={e=>upd('property_type',e.target.value)} style={inp}>{['apartment','villa','house','plot','commercial','office','pg'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
          <div><label style={lbl}>Title</label><input value={f.title} onChange={e=>upd('title',e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Description</label><textarea rows={4} value={f.description} onChange={e=>upd('description',e.target.value)} style={{...inp,resize:'vertical'}}/></div>
          {!['plot'].includes(f.property_type)&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}><div><label style={lbl}>Bedrooms</label><input type="number" min={0} value={f.bedrooms} onChange={e=>upd('bedrooms',Number(e.target.value))} style={inp}/></div><div><label style={lbl}>Bathrooms</label><input type="number" min={0} value={f.bathrooms} onChange={e=>upd('bathrooms',Number(e.target.value))} style={inp}/></div><div><label style={lbl}>Balconies</label><input type="number" min={0} value={f.balconies} onChange={e=>upd('balconies',Number(e.target.value))} style={inp}/></div></div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={lbl}>Area (sqft)</label><input type="number" min={0} value={f.sqft} onChange={e=>upd('sqft',e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Furnishing</label><select value={f.furnishing} onChange={e=>upd('furnishing',e.target.value)} style={inp}><option value="">Select</option><option value="unfurnished">Unfurnished</option><option value="semi-furnished">Semi-furnished</option><option value="fully-furnished">Fully-furnished</option></select></div>
          </div>
          <div><label style={lbl}>Facing</label><select value={f.facing} onChange={e=>upd('facing',e.target.value)} style={inp}><option value="">Not specified</option>{['north','south','east','west','north-east','north-west','south-east','south-west'].map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}</select></div>

          <div><label style={lbl}>City</label><select value={f.city_id} onChange={e=>{upd('city_id',e.target.value);upd('locality_id','');}} style={inp}><option value="">Select a city</option>{cities.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label style={lbl}>Locality</label><select value={f.locality_id} onChange={e=>upd('locality_id',e.target.value)} style={inp} disabled={!f.city_id}><option value="">{f.city_id?'Select a locality':'Select city first'}</option>{localities.map((l:any)=><option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
          <div><label style={lbl}>Landmark</label><input value={f.landmark} onChange={e=>upd('landmark',e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Exact address</label><input value={f.address_line} onChange={e=>upd('address_line',e.target.value)} style={inp}/></div>

          <div><label style={lbl}>{f.purpose==='rent'?'Monthly rent (₹)':'Sale price (₹)'}</label><input type="number" min={0} value={f.price} onChange={e=>upd('price',e.target.value)} style={inp}/></div>
          <div style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" id="neg" checked={f.price_negotiable} onChange={e=>upd('price_negotiable',e.target.checked)}/><label htmlFor="neg" style={{fontSize:13,color:'#111',cursor:'pointer'}}>Price is negotiable</label></div>
          {f.purpose==='rent'?<><div><label style={lbl}>Security deposit (₹)</label><input type="number" min={0} value={f.security_deposit} onChange={e=>upd('security_deposit',e.target.value)} style={inp}/></div><div><label style={lbl}>Brokerage</label><select value={f.brokerage} onChange={e=>upd('brokerage',e.target.value)} style={inp}><option value="none">No brokerage</option><option value="0.5 month">0.5 month</option><option value="1 month">1 month</option><option value="2 months">2 months</option></select></div></>
          :<div><label style={lbl}>Monthly maintenance (₹)</label><input type="number" min={0} value={f.maintenance_monthly} onChange={e=>upd('maintenance_monthly',e.target.value)} style={inp}/></div>}

          <div>
            <label style={lbl}>Photos</label>
            {remainingImages.length>0&&(
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:10}}>
                {remainingImages.map((img,i)=>(
                  <div key={img.id} style={{position:'relative',borderRadius:8,overflow:'hidden',aspectRatio:'1/1',background:'#F0F0F0'}}>
                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${img.storage_path}`} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    {i===0&&<span style={{position:'absolute',bottom:4,left:4,fontSize:10,fontWeight:600,color:'#fff',background:'#111',padding:'2px 6px',borderRadius:9999}}>Cover</span>}
                    <button onClick={()=>removeExistingImage(img.id)} style={{position:'absolute',top:4,right:4,width:20,height:20,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}}><X size={11}/></button>
                  </div>
                ))}
              </div>
            )}
            <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,padding:'28px 24px',border:'1.5px dashed #E5E5E5',borderRadius:12,cursor:'pointer'}}>
              <Upload size={18} color="#9B9B9B"/><span style={{fontSize:13,color:'#6B6B6B'}}>Add more photos</span>
              <input type="file" accept="image/*" multiple onChange={e=>setNewImages(p=>[...p,...Array.from(e.target.files??[])])} style={{display:'none'}}/>
            </label>
            {newImages.length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginTop:10}}>{newImages.map((file,i)=><div key={i} style={{position:'relative',borderRadius:8,overflow:'hidden',aspectRatio:'1/1',background:'#F0F0F0'}}><img src={URL.createObjectURL(file)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/><button onClick={()=>setNewImages(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:4,right:4,width:20,height:20,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}}><X size={11}/></button></div>)}</div>}
          </div>
        </div>

        {err&&<p style={{fontSize:13,color:'#DC2626',marginTop:16}}>{err}</p>}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:36}}>
          <button onClick={submit} disabled={saving} style={{display:'flex',alignItems:'center',gap:6,padding:'10px 22px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'#111',border:'none',opacity:saving?0.6:1,cursor:'pointer'}}>{saving?'Saving…':<><Check size={15}/>Save changes</>}</button>
        </div>
      </div>
    </div>
  );
}
