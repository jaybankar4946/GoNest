'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Profile = { id: string; full_name: string|null; phone?: string|null; role: string; agency_name: string|null; agent_verified: boolean; rera_number: string|null; avatar_url: string|null };
type Ctx = { user: User|null; profile: Profile|null; loading: boolean; signOut: ()=>Promise<void>; refresh: ()=>Promise<void> };
const Ctx = createContext<Ctx>({ user:null, profile:null, loading:true, signOut:async()=>{}, refresh:async()=>{} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,setUser]=useState<User|null>(null);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [loading,setLoading]=useState(true);
  const requestId=useRef(0);
  const authEventSeen=useRef(false);

  const loadProfile=useCallback(async(uid:string):Promise<Profile|null>=>{
    const { data, error } = await supabase
      .from('profiles')
      .select('id,full_name,role,agency_name,agent_verified,rera_number,avatar_url')
      .eq('id',uid)
      .maybeSingle();
    if (error) throw error;
    return data as Profile|null;
  },[]);

  const syncUser=useCallback(async(nextUser:User|null)=>{
    const currentRequest=++requestId.current;
    setUser(nextUser);
    setLoading(true);
    if (!nextUser) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const nextProfile=await loadProfile(nextUser.id);
      if (currentRequest===requestId.current) setProfile(nextProfile);
    } catch (error) {
      console.error('[GoNest auth] Could not load profile:', error);
      if (currentRequest===requestId.current) setProfile(null);
    } finally {
      if (currentRequest===requestId.current) setLoading(false);
    }
  },[loadProfile]);

  useEffect(()=>{
    let mounted=true;
    const { data:sub }=supabase.auth.onAuthStateChange((_event,session)=>{
      authEventSeen.current=true;
      if (mounted) void syncUser(session?.user??null);
    });
    supabase.auth.getSession().then(({data,error})=>{
      if (error) console.error('[GoNest auth] Could not read session:',error);
      // An auth event is newer/more authoritative if it arrived while getSession was pending.
      if (mounted && !authEventSeen.current) void syncUser(data.session?.user??null);
    }).catch(error=>{
      console.error('[GoNest auth] Session initialization failed:',error);
      if (mounted && !authEventSeen.current) { setUser(null); setProfile(null); setLoading(false); }
    });
    return()=>{ mounted=false; requestId.current++; sub.subscription.unsubscribe(); };
  },[syncUser]);

  const signOut=async()=>{
    const {error}=await supabase.auth.signOut();
    if (error) throw error;
    requestId.current++;
    setUser(null);
    setProfile(null);
    setLoading(false);
  };
  const refresh=useCallback(async()=>{
    if (!user) { setProfile(null); return; }
    const currentRequest=requestId.current;
    setLoading(true);
    try {
      const nextProfile=await loadProfile(user.id);
      if (currentRequest===requestId.current) setProfile(nextProfile);
    } catch(error) {
      console.error('[GoNest auth] Profile refresh failed:',error);
      if (currentRequest===requestId.current) setProfile(null);
    } finally {
      if (currentRequest===requestId.current) setLoading(false);
    }
  },[user,loadProfile]);

  return <Ctx.Provider value={{user,profile,loading,signOut,refresh}}>{children}</Ctx.Provider>;
}
export const useAuth=()=>useContext(Ctx);
