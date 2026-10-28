'use client';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { demoOnClient, setDemoCookie } from '@/lib/demo';

// Admin-only switch + a visible banner whenever demo data is showing.
export function DemoMode() {
  const { profile } = useAuth();
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(demoOnClient()); }, []);
  const toggle = () => { setDemoCookie(!on); window.location.reload(); };
  const isAdmin = profile?.role === 'admin';
  return (
    <>
      {on && (
        <div role="status" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: '#92400E', color: '#fff', fontSize: 12, fontWeight: 600, textAlign: 'center', padding: '5px 12px' }}>
          Demo mode: showing sample data for team preview. These are not real listings and are not visible to the public.
        </div>
      )}
      {isAdmin && (
        <button onClick={toggle} aria-pressed={on} style={{ position: 'fixed', left: 16, bottom: 76, zIndex: 100, background: on ? '#92400E' : '#111827', color: '#fff', border: 'none', borderRadius: 9999, padding: '9px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,.25)' }}>
          Demo data: {on ? 'ON' : 'OFF'}
        </button>
      )}
    </>
  );
}
