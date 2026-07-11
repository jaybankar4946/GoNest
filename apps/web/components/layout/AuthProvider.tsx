'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
type Profile = { id: string; full_name: string|null; phone: string|null; role: string; agency_name: string|null; agent_verified: boolean; rera_number: string|null; avatar_url: string|null };
type Ctx = { user: User|null; profile: Profile|null; loading: boolean; signOut: ()=>Promise<void>; refresh: ()=>Promise<void> };
const Ctx = createContext<Ctx>({ user:null, profile:null, loading:true, signOut:async()=>{}, refresh:async()=>{} });
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,setUser]=useState<User|null>(null);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [loading,setLoading]=useState(true);
  const loadProfile=useCallback(async(uid:string)=>{
    const{data}=await supabase.from('profiles').select('*').eq('id',uid).maybeSingle();
    setProfile(data as Profile|null);
  },[]);
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      const u=data.session?.user??null; setUser(u); if(u)loadProfile(u.id); setLoading(false);
    });
    const{data:sub}=supabase.auth.onAuthStateChange((_,s)=>{
      const u=s?.user??null; setUser(u); if(u)loadProfile(u.id); else setProfile(null);
    });
    return()=>sub.subscription.unsubscribe();
  },[loadProfile]);
  const signOut=async()=>{await supabase.auth.signOut();setProfile(null);};
  const refresh=useCallback(async()=>{if(user)await loadProfile(user.id);},[user,loadProfile]);
  return <Ctx.Provider value={{user,profile,loading,signOut,refresh}}>{children}</Ctx.Provider>;
}
export const useAuth=()=>useContext(Ctx);
