'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Mail, Lock, Home, Building2, User } from 'lucide-react';

type Role = 'buyer'|'owner'|'agent';
const ROLES: {value:Role;label:string;desc:string}[] = [
  {value:'buyer', label:'Buyer / Tenant',   desc:"I'm looking for a property"},
  {value:'owner', label:'Property Owner',   desc:'I want to list my own property'},
  {value:'agent', label:'Agent / Broker',   desc:'I list properties professionally'},
];

const inp: React.CSSProperties = {
  width:'100%', padding:'13px 16px', border:'1px solid var(--border)',
  borderRadius:'var(--radius-md)', fontSize:'var(--text-base)', outline:'none',
  background:'var(--surface)', transition:'border-color var(--dur-fast) var(--ease)',
};

export default function AuthPage() {
  const router = useRouter();
  const [mode,    setMode]    = useState<'password'|'magic'>('password');
  const [isSignUp,setIsSignUp]= useState(false);
  const [step,    setStep]    = useState<'role'|'form'>('role');
  const [role,    setRole]    = useState<Role>('buyer');
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [password,setPass]    = useState('');
  const [loading, setLoad]    = useState(false);
  const [msg,     setMsg]     = useState<{type:'ok'|'err';text:string}|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoad(true); setMsg(null);
    try {
      if (mode==='magic') {
        const {error} = await supabase.auth.signInWithOtp({email});
        if (error) throw error;
        setMsg({type:'ok',text:'Magic link sent — check your inbox.'});
      } else if (isSignUp) {
        const {data,error} = await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
        if (error) throw error;
        if (data.user) await supabase.from('profiles').update({role,full_name:name}).eq('id',data.user.id);
        if (data.session) router.push('/dashboard');
        else setMsg({type:'ok',text:'Check your email to confirm, then sign in.'});
      } else {
        const {error} = await supabase.auth.signInWithPassword({email,password});
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch(err){ setMsg({type:'err',text:err instanceof Error?err.message:'Something went wrong.'}); }
    finally { setLoad(false); }
  };

  if (isSignUp && step==='role') return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'var(--space-4)',background:'var(--surface-2)'}}>
      <div style={{width:'100%',maxWidth:420,background:'var(--surface)',borderRadius:'var(--radius-lg)',padding:'var(--space-6)',boxShadow:'var(--shadow-lg)'}}>
        <button onClick={()=>router.push('/')} style={{display:'flex',alignItems:'center',gap:6,fontSize:'var(--text-sm)',color:'var(--ink-faint)',marginBottom:'var(--space-5)'}}>
          <ChevronLeft size={16}/>Back
        </button>
        <h1 style={{fontSize:'var(--text-xl)',fontWeight:700,color:'var(--ink)',letterSpacing:'-0.02em',marginBottom:6}}>How will you use GoNest?</h1>
        <p style={{fontSize:'var(--text-sm)',color:'var(--ink-soft)',marginBottom:'var(--space-5)'}}>You can change this later in settings.</p>
        <div style={{display:'flex',flexDirection:'column',gap:'var(--space-2)'}}>
          {ROLES.map(r=>(
            <button key={r.value} onClick={()=>{setRole(r.value);setStep('form');}}
              style={{display:'flex',alignItems:'center',gap:14,padding:'16px',borderRadius:'var(--radius-md)',border:'1px solid var(--border)',textAlign:'left',background:'var(--surface)'}}>
              <div style={{width:42,height:42,borderRadius:'50%',background:'var(--primary-soft)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'var(--primary)'}}>
                {r.value==='buyer'?<User size={18}/>:r.value==='owner'?<Home size={18}/>:<Building2 size={18}/>}
              </div>
              <div>
                <div style={{fontSize:'var(--text-base)',fontWeight:600,color:'var(--ink)'}}>{r.label}</div>
                <div style={{fontSize:'var(--text-xs)',color:'var(--ink-faint)'}}>{r.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={()=>{setIsSignUp(false);setStep('role');}} style={{width:'100%',marginTop:'var(--space-4)',fontSize:'var(--text-sm)',color:'var(--ink-faint)',textAlign:'center'}}>
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'var(--space-4)',background:'var(--surface-2)'}}>
      <div style={{width:'100%',maxWidth:380,background:'var(--surface)',borderRadius:'var(--radius-lg)',padding:'var(--space-6)',boxShadow:'var(--shadow-lg)'}}>
        <button onClick={()=>isSignUp?setStep('role'):router.push('/')}
          style={{display:'flex',alignItems:'center',gap:6,fontSize:'var(--text-sm)',color:'var(--ink-faint)',marginBottom:'var(--space-5)'}}>
          <ChevronLeft size={16}/>Back
        </button>
        <h1 style={{fontSize:'var(--text-xl)',fontWeight:700,color:'var(--ink)',letterSpacing:'-0.02em',marginBottom:6}}>
          {mode==='magic'?'Sign in with email':isSignUp?'Create your account':'Welcome back'}
        </h1>
        <p style={{fontSize:'var(--text-sm)',color:'var(--ink-soft)',marginBottom:'var(--space-5)'}}>
          {mode==='magic'?"We'll email you a secure link.":'Sign in to save and manage properties.'}
        </p>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'var(--space-3)'}}>
          {isSignUp&&mode==='password'&&(
            <input required placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={inp} />
          )}
          <div style={{position:'relative'}}>
            <Mail size={16} style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',color:'var(--ink-faint)',pointerEvents:'none'}} />
            <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{...inp,paddingLeft:42}} />
          </div>
          {mode==='password'&&(
            <div style={{position:'relative'}}>
              <Lock size={16} style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',color:'var(--ink-faint)',pointerEvents:'none'}} />
              <input required type="password" placeholder="Password" value={password} onChange={e=>setPass(e.target.value)} style={{...inp,paddingLeft:42}} />
            </div>
          )}
          {msg&&(
            <div style={{fontSize:'var(--text-sm)',padding:'12px 14px',borderRadius:'var(--radius-md)',
              background:msg.type==='ok'?'var(--success-soft)':'var(--error-soft)',
              color:msg.type==='ok'?'var(--success)':'var(--error)'}}>
              {msg.text}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{padding:'14px',borderRadius:'var(--radius-full)',fontSize:'var(--text-base)',fontWeight:600,color:'#fff',
              background:'var(--primary)',border:'none',cursor:'pointer',marginTop:4,opacity:loading?0.6:1,
              transition:'transform var(--dur-fast) var(--ease)'}}>
            {loading?'Please wait…':mode==='magic'?'Send magic link':isSignUp?'Create account':'Sign in'}
          </button>
        </form>
        <div style={{display:'flex',alignItems:'center',gap:12,margin:'var(--space-5) 0'}}>
          <div style={{flex:1,height:1,background:'var(--border)'}}/>
          <span style={{fontSize:'var(--text-xs)',color:'var(--ink-faint)'}}>or</span>
          <div style={{flex:1,height:1,background:'var(--border)'}}/>
        </div>
        <button onClick={()=>{setMode(m=>m==='password'?'magic':'password');setMsg(null);}}
          style={{width:'100%',padding:'13px',borderRadius:'var(--radius-full)',fontSize:'var(--text-sm)',fontWeight:600,
            color:'var(--ink)',border:'1px solid var(--border-strong)',background:'var(--surface)',cursor:'pointer'}}>
          {mode==='password'?'Continue with magic link':'Continue with password'}
        </button>
        {mode==='password'&&!isSignUp&&(
          <button onClick={()=>{setIsSignUp(true);setStep('role');}} style={{width:'100%',marginTop:'var(--space-4)',fontSize:'var(--text-sm)',color:'var(--ink-faint)',textAlign:'center'}}>
            Don&apos;t have an account? Sign up
          </button>
        )}
      </div>
    </div>
  );
}
