'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { updateProfile, updatePassword, uploadProfileImage } from '@/lib/api';

const inp: React.CSSProperties={width:'100%',padding:'11px 14px',border:'1px solid #E5E5E5',borderRadius:12,fontSize:14,outline:'none',background:'#fff'};
const lbl: React.CSSProperties={fontSize:13,fontWeight:600,color:'#111',marginBottom:6,display:'block'};
const btn: React.CSSProperties={padding:'11px 22px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'var(--primary)',border:'none',cursor:'pointer'};

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, refresh } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name,setName]=useState(''); const [phone,setPhone]=useState('');
  const [agency,setAgency]=useState(''); const [rera,setRera]=useState('');
  const [bio,setBio]=useState(''); const [avatar,setAvatar]=useState('');
  const [serviceLocalities,setServiceLocalities]=useState(''); const [servicePincodes,setServicePincodes]=useState('');
  const [savingProfile,setSavingProfile]=useState(false);
  const [photoBusy,setPhotoBusy]=useState(false);
  const [profileMsg,setProfileMsg]=useState<{type:'ok'|'err';text:string}|null>(null);
  const [newPass,setNewPass]=useState(''); const [confirmPass,setConfirmPass]=useState('');
  const [savingPass,setSavingPass]=useState(false);
  const [passMsg,setPassMsg]=useState<{type:'ok'|'err';text:string}|null>(null);

  useEffect(()=>{if(!loading&&!user)router.push('/auth');},[loading,user,router]);
  useEffect(()=>{if(profile){setName(profile.full_name??'');setPhone(profile.phone??'');setAgency(profile.agency_name??'');setRera(profile.rera_number??'');setBio(profile.bio??'');setAvatar(profile.avatar_url??'');setServiceLocalities((profile.service_localities??[]).join(', '));setServicePincodes((profile.service_pincodes??[]).join(', '));}},[profile]);

  const saveProfile=async(e:React.FormEvent)=>{
    e.preventDefault();if(!user)return;
    setSavingProfile(true);setProfileMsg(null);
    try{
      await updateProfile(user.id,{full_name:name.trim()||null,phone:phone.trim()||null,agency_name:agency.trim()||null,rera_number:rera.trim()||null,bio:bio.trim()||null,avatar_url:avatar||null,service_localities:serviceLocalities.split(',').map(v=>v.trim()).filter(Boolean).slice(0,40),service_pincodes:servicePincodes.split(',').map(v=>v.trim().replace(/\D/g,'')).filter(v=>/^\d{6}$/.test(v)).slice(0,40)});
      await refresh();setProfileMsg({type:'ok',text:'Profile saved. Your public profile will show the details you have provided.'});
    }catch(e){setProfileMsg({type:'err',text:e instanceof Error?e.message:'Could not update profile.'});}
    finally{setSavingProfile(false);}
  };
  const uploadPhoto=async(file?:File)=>{
    if(!user||!file)return;
    setProfileMsg(null);setPhotoBusy(true);
    try{const url=await uploadProfileImage(user.id,file);setAvatar(url);await updateProfile(user.id,{avatar_url:url});await refresh();setProfileMsg({type:'ok',text:'Profile photo uploaded and saved.'});}
    catch(e){setProfileMsg({type:'err',text:e instanceof Error?e.message:'Could not upload photo.'});}
    finally{setPhotoBusy(false);if(fileRef.current)fileRef.current.value='';}
  };
  const changePassword=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(newPass.length<6){setPassMsg({type:'err',text:'Password must be at least 6 characters.'});return;}
    if(newPass!==confirmPass){setPassMsg({type:'err',text:'Passwords do not match.'});return;}
    setSavingPass(true);setPassMsg(null);
    try{await updatePassword(newPass);setPassMsg({type:'ok',text:'Password changed.'});setNewPass('');setConfirmPass('');}
    catch(e){setPassMsg({type:'err',text:e instanceof Error?e.message:'Could not change password.'});}
    finally{setSavingPass(false);}
  };
  const isSupply=['owner','agent','builder'].includes(profile?.role??'');
  const msg=(m:{type:'ok'|'err';text:string}|null)=>(m?<p role={m.type==='err'?'alert':'status'} style={{fontSize:13,color:m.type==='ok'?'#047857':'#B91C1C',lineHeight:1.5}}>{m.text}</p>:null);

  return <><Nav/><main style={{maxWidth:760,margin:'0 auto',padding:'36px 20px 80px'}}>
    <div style={{marginBottom:24}}><h1 style={{fontSize:28,fontWeight:800,color:'#111',letterSpacing:'-0.03em',marginBottom:6}}>Your professional profile</h1><p style={{fontSize:14,color:'#6B7280',lineHeight:1.6}}>Manage the information buyers, renters and property owners see on GoNest. Only publish contact details you want prospective customers to use.</p></div>
    {loading?<p>Loading your profile…</p>:!user?null:<>
      <form onSubmit={saveProfile} style={{border:'1px solid #E5E7EB',borderRadius:20,padding:24,marginBottom:24,display:'flex',flexDirection:'column',gap:18,background:'#fff'}}>
        <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{width:100,height:100,borderRadius:'50%',overflow:'hidden',border:'1px solid #E5E7EB',background:'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,fontWeight:800,color:'#6B7280',flexShrink:0}}>
            {avatar?<img src={avatar} alt="Your profile" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:(name||'G').trim().charAt(0).toUpperCase()}
          </div>
          <div style={{flex:1,minWidth:200}}><h2 style={{fontSize:16,fontWeight:800,marginBottom:4}}>Profile photo</h2><p style={{fontSize:12,color:'#6B7280',lineHeight:1.5,marginBottom:10}}>Use a clear, professional JPG, PNG or WebP photo (maximum 5 MB). Photos appear publicly where your profile is shown.</p><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>uploadPhoto(e.target.files?.[0])} style={{display:'none'}}/><button type="button" disabled={photoBusy} onClick={()=>fileRef.current?.click()} style={{...btn,opacity:photoBusy?0.6:1}}>{photoBusy?'Uploading…':avatar?'Change photo':'Upload photo'}</button></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14}}>
          <div><label style={lbl}>Full name *</label><input required maxLength={120} value={name} onChange={e=>setName(e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Contact phone</label><input type="tel" autoComplete="tel" maxLength={25} placeholder="+91 98765 43210" value={phone} onChange={e=>setPhone(e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Email</label><input value={user.email??''} disabled style={{...inp,background:'#F7F7F7',color:'#9CA3AF'}}/></div>
          {isSupply&&<div><label style={lbl}>{profile?.role==='builder'?'Developer / company name':'Agency / business name'}</label><input maxLength={160} value={agency} onChange={e=>setAgency(e.target.value)} style={inp}/></div>}
          {profile?.role==='agent'&&<div><label style={lbl}>RERA registration number</label><input maxLength={80} value={rera} onChange={e=>setRera(e.target.value)} style={inp}/><p style={{fontSize:11,color:'#6B7280',marginTop:4}}>A number entered here is not automatically verified by GoNest.</p></div>}
        </div>
        {profile?.role==='agent'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14}}>
          <div><label style={lbl}>Service localities / neighbourhoods</label><input maxLength={1000} placeholder="Hiranandani Estate, Majiwada, Pokhran Road" value={serviceLocalities} onChange={e=>setServiceLocalities(e.target.value)} style={inp}/><p style={{fontSize:11,color:'#6B7280',marginTop:4}}>Separate areas with commas. Only add areas you actually serve.</p></div>
          <div><label style={lbl}>Service PIN codes</label><input maxLength={500} inputMode="numeric" placeholder="400607, 400610, 400601" value={servicePincodes} onChange={e=>setServicePincodes(e.target.value)} style={inp}/><p style={{fontSize:11,color:'#6B7280',marginTop:4}}>Comma-separated six-digit PIN codes.</p></div>
        </div>}
                <div><label style={lbl}>{profile?.role==='agent'?'Professional bio and experience':profile?.role==='builder'?'Developer / company overview':profile?.role==='owner'?'About you (optional)':'About you'}</label><textarea rows={5} maxLength={1500} placeholder={profile?.role==='agent'?'Describe your experience, areas served, property specialities and languages.':'Add a short description.'} value={bio} onChange={e=>setBio(e.target.value)} style={{...inp,resize:'vertical'}}/><p style={{fontSize:11,color:'#6B7280',marginTop:4}}>{bio.length}/1500 characters</p></div>
        {msg(profileMsg)}
        <div><button type="submit" disabled={savingProfile} style={{...btn,opacity:savingProfile?0.6:1}}>{savingProfile?'Saving…':'Save profile'}</button></div>
      </form>
      <section style={{border:'1px solid #E5E7EB',borderRadius:20,padding:24,marginBottom:24}}>
        <h2 style={{fontSize:17,fontWeight:800,marginBottom:6}}>Your GoNest workspace</h2><p style={{fontSize:13,color:'#6B7280',marginBottom:16}}>Continue managing the things that belong to your account.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button type="button" onClick={()=>router.push('/dashboard')} style={btn}>Manage listings & enquiries</button>{isSupply&&<button type="button" onClick={()=>router.push('/dashboard/supply')} style={{...btn,background:'#fff',color:'#111',border:'1px solid #D1D5DB'}}>Manage supply profile</button>}</div>
      </section>
      <form onSubmit={changePassword} style={{borderTop:'1px solid #E5E7EB',paddingTop:24,display:'flex',flexDirection:'column',gap:14}}>
        <h2 style={{fontSize:17,fontWeight:800}}>Change password</h2><div><label style={lbl}>New password</label><input type="password" autoComplete="new-password" value={newPass} onChange={e=>setNewPass(e.target.value)} style={inp}/></div><div><label style={lbl}>Confirm new password</label><input type="password" autoComplete="new-password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} style={inp}/></div>{msg(passMsg)}<div><button type="submit" disabled={savingPass} style={{...btn,opacity:savingPass?0.6:1}}>{savingPass?'Saving…':'Change password'}</button></div>
      </form>
    </>}
  </main><Footer/></>;
}
