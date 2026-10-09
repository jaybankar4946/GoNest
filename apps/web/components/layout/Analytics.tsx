'use client';
import { useEffect } from 'react';
import { track } from '@/lib/track';
export function Analytics() {
  useEffect(() => {
    try { if (!sessionStorage.getItem('gonest_started')) { sessionStorage.setItem('gonest_started', '1'); track('session_start'); } } catch { /* ignore */ }
  }, []);
  return null;
}
