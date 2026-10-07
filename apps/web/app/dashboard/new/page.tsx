'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import { chooseAccountType, createListing, uploadListingImage, getCities, getLocalities } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { ChevronLeft, ChevronRight, Upload, X, Check } from 'lucide-react';
const STEPS=['Basics','Location','Price','Photos','Amenities','Review'] as const;
const AMENITIES=['Lift','Parking','Security / CCTV','Power backup','Gym','Swimming pool','Clubhouse','Children play area','Garden','Gated community','24x7 water supply','Piped gas','Intercom','Visitor parking'];
const inp: React.CSSProperties={width:'100%',padding:'11px 14px',border:'1px solid #E5E5E5',borderRadius:12,fontSize:14,outline:'none',background:'#fff'};
const lbl: React.CSSProperties={fontSize:13,fontWeight:600,color:'#111',marginBottom:6,display:'block'};
export default function NewListingPage() {
  const router=useRouter();
  const{user,profile,loading:authLoading,refresh}=useAuth();
  const[choosing,setChoosing]=useState(false);
  useEffect(()=>{if(!authLoading&&!user)router.replace('/auth?next=/dashboard/new');},[authLoading,user,router]);
  const[step,setStep]=useState(0);
  const[cities,setCities]=useState<any[]>([]);
  const[localities,setLocalities]=useState<any[]>([]);
  const[images,setImages]=useState<File[]>([]);
  const[saving,setSaving]=useState(false);
  const[err,setErr]=useState<string|null>(null);
  const[f,setF]=useState({purpose:'sale',property_type:'apartment',title:'',description:'',bedrooms:1,bathrooms:1,balconies:0,sqft:'',furnishing:'',facing:'',city_id:'',locality_id:'',address_line:'',landmark:'',price:'',maintenance_monthly:'',security_deposit:'',price_negotiable:false,brokerage:'none',floor_number:'',total_floors:'',property_age:'',amenities:[] as string[]});
  useEffect(()=>{getCities().then(setCities);},[]);
  useEffect(()=>{if(!f.city_id){setLocalities([]);return;}getLocalities(f.city_id).then(setLocalities);},[f.city_id]);
  const upd=useCallback(<K extends keyof typeof f>(k:K,v:(typeof f)[K])=>setF(p=>({...p,[k]:v})),[]);
  const canNext=()=>{if(step===0)return f.title.trim().length>3;if(step===1)return!!f.city_id&&!!f.locality_id;if(step===2)return!!f.price&&Number(f.price)>0;return true;};
  const submit=async()=>{
    if(!user)return;setSaving(true);setErr(null);
    try{
      const id=await createListing({posted_by:user.id,poster_type:profile?.role==='agent'?'agent':'owner',title:f.title,description:f.description||null,property_type:f.property_type,purpose:f.purpose,city_id:f.city_id,locality_id:f.locality_id,address_line:f.address_line||null,landmark:f.landmark||null,price:Number(f.price),maintenance_monthly:f.maintenance_monthly?Number(f.maintenance_monthly):null,security_deposit:f.security_deposit?Number(f.security_deposit):null,price_negotiable:f.price_negotiable,brokerage:f.brokerage,bedrooms:f.bedrooms,bathrooms:f.bathrooms,balconies:f.balconies,sqft:f.sqft?Number(f.sqft):null,furnishing:f.furnishing||null,facing:f.facing||null,floor_number:f.floor_number?Number(f.floor_number):null,total_floors:f.total_floors?Number(f.total_floors):null,property_age:f.property_age?Number(f.property_age):null,amenities:f.amenities});
      for(let i=0;i<images.length;i++)await uploadListingImage(user.id,id,images[i],i);
      router.push('/dashboard');
    }catch(e){setErr(e instanceof Error?e.message:((e as {message?:string})?.message??'Something went wrong.'));}
    finally{setSaving(false);}
  };
  const canPost=['owner','agent','admin'].includes(profile?.role??'');
  if(authLoading||!user||!profile)return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#6B7280'}}>Loading…</div>);
  if(!canPost){
    const pick=async(r:'owner'|'agent')=>{setChoosing(true);try{await chooseAccountType(r);await refresh();}finally{setChoosing(false);}};
    const card:React.CSSProperties={display:'block',width:'100%',textAlign:'left',padding:'18px 20px',border:'1px solid #E5E7EB',borderRadius:16,background:'#fff',cursor:'pointer'};
    return(
      <div style={{minHeight:'100vh',background:'#F9FAFB',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{width:'100%',maxWidth:460,background:'#fff',border:'1px solid #E5E7EB',borderRadius:28,padding:32}}>
          <h1 style={{fontSize:24,fontWeight:800,marginBottom:6}}>List your property</h1>
          <p style={{fontSize:14,color:'#6B7280',marginBottom:20}}>Tell us how you will list. You can enquire and save homes either way.</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <button disabled={choosing} onClick={()=>pick('owner')} style={card}><div style={{fontWeight:700,fontSize:15}}>I am the property owner</div><div style={{fontSize:13,color:'#6B7280',marginTop:2}}>Sell or rent out my own property</div></button>
            <button disabled={choosing} onClick={()=>pick('agent')} style={card}><div style={{fontWeight:700,fontSize:15}}>I am an agent or broker</div><div style={{fontSize:13,color:'#6B7280',marginTop:2}}>List properties for clients</div></button>
          </div>
          <button onClick={()=>router.push('/')} style={{marginTop:18,fontSize:13,color:'#6B7280'}}>Not now</button>
        </div>
      </div>
    );
  }
  return(
    <div style={{minHeight:'100vh',background:'#fff'}}>
      <div style={{maxWidth:560,margin:'0 auto',padding:'40px 24px 80px'}}>
        <button onClick={()=>router.push('/dashboard')} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#6B6B6B',marginBottom:32,cursor:'pointer'}}><ChevronLeft size={16}/>Cancel</button>
        <div style={{display:'flex',gap:8,marginBottom:36}}>
          {STEPS.map((s,i)=>(
            <div key={s} style={{flex:1}}>
              <div style={{height:3,borderRadius:9999,background:i<=step?'var(--primary)':'#E5E5E5'}}/>
              <div style={{marginTop:6,fontSize:11,fontWeight:i===step?600:400,color:i<=step?'#111':'#9B9B9B'}}>{s}</div>
            </div>
          ))}
        </div>
        {step===0&&(
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <h1 style={{fontSize:20,fontWeight:700,color:'#111'}}>Tell us about the property</h1>
            <div><label style={lbl}>I want to</label><div style={{display:'flex',gap:8}}>{(['sale','rent'] as const).map(p=><button key={p} onClick={()=>upd('purpose',p)} style={{flex:1,padding:'10px',borderRadius:9999,fontSize:13,fontWeight:500,border:f.purpose===p?'1.5px solid var(--primary)':'1px solid #E5E5E5',background:f.purpose===p?'#F7F7F7':'#fff',color:'#111',cursor:'pointer'}}>{p==='sale'?'Sell':'Rent out'}</button>)}</div></div>
            <div><label style={lbl}>Property type</label><select value={f.property_type} onChange={e=>upd('property_type',e.target.value)} style={inp}>{['apartment','villa','house','plot','studio','office','shop','warehouse','commercial','pg'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
            <div><label style={lbl}>Title</label><input placeholder="e.g. Spacious 2BHK near metro" value={f.title} onChange={e=>upd('title',e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Description</label><textarea rows={4} placeholder="Describe the property…" value={f.description} onChange={e=>upd('description',e.target.value)} style={{...inp,resize:'vertical'}}/></div>
            {!['plot'].includes(f.property_type)&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}><div><label style={lbl}>Bedrooms</label><input type="number" min={0} value={f.bedrooms} onChange={e=>upd('bedrooms',Number(e.target.value))} style={inp}/></div><div><label style={lbl}>Bathrooms</label><input type="number" min={0} value={f.bathrooms} onChange={e=>upd('bathrooms',Number(e.target.value))} style={inp}/></div><div><label style={lbl}>Balconies</label><input type="number" min={0} value={f.balconies} onChange={e=>upd('balconies',Number(e.target.value))} style={inp}/></div></div>}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={lbl}>Area (sqft)</label><input type="number" min={0} placeholder="980" value={f.sqft} onChange={e=>upd('sqft',e.target.value)} style={inp}/></div>
              <div><label style={lbl}>Furnishing</label><select value={f.furnishing} onChange={e=>upd('furnishing',e.target.value)} style={inp}><option value="">Select</option><option value="unfurnished">Unfurnished</option><option value="semi-furnished">Semi-furnished</option><option value="fully-furnished">Fully-furnished</option></select></div>
            </div>
            <div><label style={lbl}>Facing</label><select value={f.facing} onChange={e=>upd('facing',e.target.value)} style={inp}><option value="">Not specified</option>{['north','south','east','west','north-east','north-west','south-east','south-west'].map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}</select></div>
          </div>
        )}
        {step===1&&(
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <h1 style={{fontSize:20,fontWeight:700,color:'#111'}}>Where is it located?</h1>
            <div><label style={lbl}>City</label><select value={f.city_id} onChange={e=>{upd('city_id',e.target.value);upd('locality_id','');}} style={inp}><option value="">Select a city</option>{cities.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label style={lbl}>Locality</label><select value={f.locality_id} onChange={e=>upd('locality_id',e.target.value)} style={inp} disabled={!f.city_id}><option value="">{f.city_id?'Select a locality':'Select city first'}</option>{localities.map((l:any)=><option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
            <div><label style={lbl}>Landmark <span style={{color:'#9B9B9B',fontWeight:400}}>(optional)</span></label><input placeholder="Near metro, mall, etc." value={f.landmark} onChange={e=>upd('landmark',e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Exact address <span style={{color:'#9B9B9B',fontWeight:400}}>(shown only to interested buyers)</span></label><input placeholder="Building name, street" value={f.address_line} onChange={e=>upd('address_line',e.target.value)} style={inp}/></div>
          </div>
        )}
        {step===2&&(
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <h1 style={{fontSize:20,fontWeight:700,color:'#111'}}>Set your price</h1>
            <div><label style={lbl}>{f.purpose==='rent'?'Monthly rent (₹)':'Sale price (₹)'}</label><input type="number" min={0} placeholder={f.purpose==='rent'?'45000':'12500000'} value={f.price} onChange={e=>upd('price',e.target.value)} style={inp}/></div>
            <div style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" id="neg" checked={f.price_negotiable} onChange={e=>upd('price_negotiable',e.target.checked)}/><label htmlFor="neg" style={{fontSize:13,color:'#111',cursor:'pointer'}}>Price is negotiable</label></div>
            {f.purpose==='rent'?<><div><label style={lbl}>Security deposit (₹) <span style={{color:'#9B9B9B',fontWeight:400}}>optional</span></label><input type="number" min={0} placeholder="90000" value={f.security_deposit} onChange={e=>upd('security_deposit',e.target.value)} style={inp}/></div><div><label style={lbl}>Brokerage</label><select value={f.brokerage} onChange={e=>upd('brokerage',e.target.value)} style={inp}><option value="none">No brokerage</option><option value="0.5 month">0.5 month</option><option value="1 month">1 month</option><option value="2 months">2 months</option></select></div></>
            :<div><label style={lbl}>Monthly maintenance (₹) <span style={{color:'#9B9B9B',fontWeight:400}}>optional</span></label><input type="number" min={0} placeholder="3500" value={f.maintenance_monthly} onChange={e=>upd('maintenance_monthly',e.target.value)} style={inp}/></div>}
          </div>
        )}
        {step===3&&(
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <h1 style={{fontSize:20,fontWeight:700,color:'#111'}}>Add photos</h1>
            <p style={{fontSize:13,color:'#6B6B6B'}}>Listings with photos get 3× more enquiries. Up to 8 photos.</p>
            <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,padding:'40px 24px',border:'1.5px dashed #E5E5E5',borderRadius:12,cursor:'pointer'}}><Upload size={20} color="#9B9B9B"/><span style={{fontSize:13,color:'#6B6B6B'}}>Click to upload photos</span><input type="file" accept="image/*" multiple onChange={e=>setImages(p=>[...p,...Array.from(e.target.files??[])].slice(0,8))} style={{display:'none'}}/></label>
            {images.length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>{images.map((file,i)=><div key={i} style={{position:'relative',borderRadius:8,overflow:'hidden',aspectRatio:'1/1',background:'#F0F0F0'}}><img src={URL.createObjectURL(file)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>{i===0&&<span style={{position:'absolute',bottom:4,left:4,fontSize:10,fontWeight:600,color:'#fff',background:'var(--primary)',padding:'2px 6px',borderRadius:9999}}>Cover</span>}<button onClick={()=>setImages(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:4,right:4,width:20,height:20,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}}><X size={11}/></button></div>)}</div>}
          </div>
        )}
        {step===4&&(
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <h1 style={{fontSize:20,fontWeight:700,color:'#111'}}>Amenities and details</h1>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <div><label style={lbl}>Floor</label><input type="number" min={0} value={f.floor_number} onChange={e=>upd('floor_number',e.target.value)} style={inp}/></div>
              <div><label style={lbl}>Total floors</label><input type="number" min={0} value={f.total_floors} onChange={e=>upd('total_floors',e.target.value)} style={inp}/></div>
              <div><label style={lbl}>Age (years)</label><input type="number" min={0} value={f.property_age} onChange={e=>upd('property_age',e.target.value)} style={inp}/></div>
            </div>
            <div><label style={lbl}>What does the property offer?</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {AMENITIES.map(a=>{const on=f.amenities.includes(a);return(<button key={a} type="button" onClick={()=>upd('amenities',on?f.amenities.filter(x=>x!==a):[...f.amenities,a])} style={{padding:'8px 14px',borderRadius:9999,fontSize:13,fontWeight:500,border:on?'1.5px solid var(--primary)':'1px solid #E5E5E5',background:on?'#EFF6FF':'#fff',color:on?'var(--primary)':'#111',cursor:'pointer'}}>{on?'✓ ':''}{a}</button>);})}
              </div>
            </div>
          </div>
        )}
        {step===5&&(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <h1 style={{fontSize:20,fontWeight:700,color:'#111'}}>Review your listing</h1>
            <p style={{fontSize:13,color:'#6B6B6B'}}>Check the details. After you submit, the GoNest team reviews your listing before it goes live. You can track the status on your dashboard.</p>
            <div style={{border:'1px solid #E5E7EB',borderRadius:16,padding:16,display:'flex',flexDirection:'column',gap:8,fontSize:14}}>
              <div style={{fontWeight:700,fontSize:16}}>{f.title}</div>
              <div style={{color:'#6B6B6B'}}>{f.property_type} · {f.purpose==='rent'?'For rent':'For sale'}{f.bedrooms>0&&f.property_type!=='plot'?` · ${f.bedrooms} BHK`:''}{f.sqft?` · ${f.sqft} sq ft`:''}</div>
              <div style={{color:'#6B6B6B'}}>{localities.find((l:any)=>l.id===f.locality_id)?.name}, {cities.find((c:any)=>c.id===f.city_id)?.name}</div>
              <div style={{fontWeight:700,color:'var(--primary)',fontSize:18}}>{f.price?formatPrice(Number(f.price),f.purpose as 'sale'|'rent'):'—'}</div>
              <div style={{color:'#6B6B6B'}}>{images.length} photo{images.length===1?'':'s'}{f.amenities.length?` · ${f.amenities.length} amenities`:''}</div>
              {images.length===0&&<div style={{fontSize:12,color:'#B45309'}}>Tip: listings with photos get far more attention. You can go back and add some.</div>}
            </div>
          </div>
        )}
        {err&&<p style={{fontSize:13,color:'#DC2626',marginTop:16}}>{err}</p>}
        <div style={{display:'flex',justifyContent:'space-between',marginTop:36}}>
          <button onClick={()=>setStep(i=>Math.max(0,i-1))} disabled={step===0} style={{padding:'10px 20px',borderRadius:9999,fontSize:13,fontWeight:500,border:'1px solid #E5E5E5',color:'#111',cursor:'pointer',opacity:step===0?0:1}}>Back</button>
          {step<STEPS.length-1
            ?<button onClick={()=>canNext()&&setStep(i=>i+1)} disabled={!canNext()} style={{display:'flex',alignItems:'center',gap:6,padding:'10px 22px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'var(--primary)',border:'none',opacity:canNext()?1:0.4,cursor:canNext()?'pointer':'not-allowed'}}>Next <ChevronRight size={15}/></button>
            :<button onClick={submit} disabled={saving} style={{display:'flex',alignItems:'center',gap:6,padding:'10px 22px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'var(--primary)',border:'none',opacity:saving?0.6:1,cursor:'pointer'}}>{saving?'Submitting…':<><Check size={15}/>Submit for review</>}</button>}
        </div>
      </div>
    </div>
  );
}
