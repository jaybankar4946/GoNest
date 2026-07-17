'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { requestPasswordReset } from '@/lib/api';
import { ChevronLeft, Mail, Lock, Home, Building2, User } from 'lucide-react';
type Role='buyer'|'owner'|'agent';
const ROLES=[{value:'buyer' as Role,label:'Buyer / Tenant',desc:"I'm looking for a property"},{value:'owner' as Role,label:'Property Owner',desc:'I want to list my own property'},{value:'agent' as Role,label:'Agent / Broker',desc:'I list properties professionally'}];
const inp: React.CSSProperties={width:'100%',padding:'11px 14px',border:'1px solid #E5E5E5',borderRadius:12,fontSize:14,outline:'none'};
export default function AuthPage() {
  const router=useRouter();
  const[mode,setMode]=useState<'password'|'magic'>('password');
  const[isSignUp,setIsSignUp]=useState(false);
  const[step,setStep]=useState<'role'|'form'>('role');
  const[role,setRole]=useState<Role>('buyer');
  const[name,setName]=useState('');
  const[email,setEmail]=useState('');
  const[pass,setPass]=useState('');
  const[loading,setLoad]=useState(false);
  const[msg,setMsg]=useState<{type:'ok'|'err';text:string}|null>(null);
  const[showForgot,setShowForgot]=useState(false);
  const[resetSent,setResetSent]=useState(false);
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();setLoad(true);setMsg(null);
    try{
      if(mode==='magic'){
        const{error}=await supabase.auth.signInWithOtp({email});
        if(error)throw error;
        setMsg({type:'ok',text:'Magic link sent — check your inbox.'});
      }else if(isSignUp){
        const{data,error}=await supabase.auth.signUp({email,password:pass,options:{data:{full_name:name}}});
        if(error)throw error;
        if(data.user)await supabase.from('profiles').update({role,full_name:name}).eq('id',data.user.id);
        if(data.session)router.push('/dashboard');
        else setMsg({type:'ok',text:'Check your email to confirm, then sign in.'});
      }else{
        const{error}=await supabase.auth.signInWithPassword({email,password:pass});
        if(error)throw error;
        router.push('/dashboard');
      }
    }catch(err){setMsg({type:'err',text:err instanceof Error?err.message:'Something went wrong.'});}
    finally{setLoad(false);}
  };
  const sendReset=async()=>{
    if(!email){setMsg({type:'err',text:'Enter your email above first.'});return;}
    setLoad(true);setMsg(null);
    try{ await requestPasswordReset(email); setResetSent(true); }
    catch(e){ setMsg({type:'err',text:e instanceof Error?e.message:'Could not send reset email.'}); }
    finally{ setLoad(false); }
  };
  if(isSignUp&&step==='role')return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:400}}>
        <button onClick={()=>router.push('/')} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#6B6B6B',marginBottom:32,cursor:'pointer'}}><ChevronLeft size={16}/>Back</button>
        <h1 style={{fontSize:24,fontWeight:700,color:'#111',letterSpacing:'-0.02em',marginBottom:6}}>How will you use GoNest?</h1>
        <p style={{fontSize:14,color:'#6B6B6B',marginBottom:28}}>You can change this later in settings.</p>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {ROLES.map(r=>(
            <button key={r.value} onClick={()=>{setRole(r.value);setStep('form');}} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:'1px solid #E5E5E5',textAlign:'left',background:'#fff',cursor:'pointer'}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'#F7F7F7',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {r.value==='buyer'?<User size={18}/>:r.value==='owner'?<Home size={18}/>:<Building2 size={18}/>}
              </div>
              <div><div style={{fontSize:14,fontWeight:600,color:'#111'}}>{r.label}</div><div style={{fontSize:12,color:'#6B6B6B'}}>{r.desc}</div></div>
            </button>
          ))}
        </div>
        <button onClick={()=>{setIsSignUp(false);setStep('role');}} style={{width:'100%',marginTop:20,fontSize:13,color:'#6B6B6B',textAlign:'center'}}>Already have an account? Sign in</button>
      </div>
    </div>
  );
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:360}}>
        <button onClick={()=>isSignUp?setStep('role'):router.push('/')} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#6B6B6B',marginBottom:32,cursor:'pointer'}}><ChevronLeft size={16}/>Back</button>
        <h1 style={{fontSize:24,fontWeight:700,color:'#111',letterSpacing:'-0.02em',marginBottom:6}}>{mode==='magic'?'Sign in with email':isSignUp?'Create your account':'Welcome back'}</h1>
        <p style={{fontSize:14,color:'#6B6B6B',marginBottom:28}}>{mode==='magic'?"We'll email you a secure link.":'Sign in to save and manage properties.'}</p>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:10}}>
          {isSignUp&&mode==='password'&&<input required placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={inp}/>}
          <div style={{position:'relative'}}><Mail size={15} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#9B9B9B',pointerEvents:'none'}}/><input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{...inp,paddingLeft:38}}/></div>
          {mode==='password'&&<div style={{position:'relative'}}><Lock size={15} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#9B9B9B',pointerEvents:'none'}}/><input required type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} style={{...inp,paddingLeft:38}}/></div>}
          {mode==='password'&&!isSignUp&&(
            <div style={{textAlign:'right'}}>
              <button type="button" onClick={()=>{setShowForgot(s=>!s);setResetSent(false);}} style={{fontSize:12,color:'#6B6B6B',textDecoration:'underline',background:'none',border:'none',cursor:'pointer'}}>Forgot password?</button>
            </div>
          )}
          {msg&&<div style={{fontSize:13,padding:'10px 12px',borderRadius:10,background:msg.type==='ok'?'#F0FDF4':'#FEF2F2',color:msg.type==='ok'?'#16A34A':'#DC2626'}}>{msg.text}</div>}
          <button type="submit" disabled={loading} style={{padding:'12px',borderRadius:9999,fontSize:14,fontWeight:600,color:'#fff',background:'#111',border:'none',cursor:'pointer',marginTop:4,opacity:loading?0.6:1}}>{loading?'Please wait…':mode==='magic'?'Send magic link':isSignUp?'Create account':'Sign in'}</button>
        </form>
        {showForgot&&mode==='password'&&!isSignUp&&(
          resetSent?(
            <p style={{fontSize:13,color:'#16A34A',padding:'10px 12px',background:'#F0FDF4',borderRadius:10,marginTop:10}}>Reset link sent — check your inbox.</p>
          ):(
            <button onClick={sendReset} disabled={loading} style={{width:'100%',marginTop:10,padding:'10px',borderRadius:9999,fontSize:13,fontWeight:500,color:'#111',border:'1px solid #111',background:'#fff',cursor:'pointer'}}>Send password reset link</button>
          )
        )}
        <div style={{display:'flex',alignItems:'center',gap:12,margin:'20px 0'}}><div style={{flex:1,height:1,background:'#E5E5E5'}}/><span style={{fontSize:12,color:'#9B9B9B'}}>or</span><div style={{flex:1,height:1,background:'#E5E5E5'}}/></div>
        <button onClick={()=>{setMode(m=>m==='password'?'magic':'password');setMsg(null);setShowForgot(false);}} style={{width:'100%',padding:'11px',borderRadius:9999,fontSize:13,fontWeight:500,color:'#111',border:'1px solid #111',background:'#fff',cursor:'pointer'}}>{mode==='password'?'Continue with magic link':'Continue with password'}</button>
        {mode==='password'&&!isSignUp&&<button onClick={()=>{setIsSignUp(true);setStep('role');}} style={{width:'100%',marginTop:14,fontSize:13,color:'#6B6B6B',textAlign:'center'}}>Don&apos;t have an account? Sign up</button>}
      </div>
    </div>
  );
}
