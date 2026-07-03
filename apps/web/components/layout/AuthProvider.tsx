'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
 
type Ctx = { user: User | null; profile: Profile | null; loading: boolean; signOut: () => Promise<void> };
const Ctx = createContext<Ctx>({ user: null, profile: null, loading: true, signOut: async () => {} });
 
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
 
  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile(data as Profile | null);
  }, []);
 
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u); if (u) loadProfile(u.id); setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      const u = s?.user ?? null; setUser(u);
      if (u) loadProfile(u.id); else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);
 
  const signOut = async () => { await supabase.auth.signOut(); setProfile(null); };
  return <Ctx.Provider value={{ user, profile, loading, signOut }}>{children}</Ctx.Provider>;
}
 
export const useAuth = () => useContext(Ctx);
