import { supabase } from './supabase';

export type TrackName = 'session_start' | 'search' | 'property_view' | 'save' | 'call_click' | 'whatsapp_click' | 'lead_submitted' | 'visit_requested';

// Anonymous, fire-and-forget funnel event. Never sends names, phones, emails or free text.
function sessionId(): string {
  try {
    let s = localStorage.getItem('gonest_sid');
    if (!s) { s = crypto.randomUUID(); localStorage.setItem('gonest_sid', s); }
    return s;
  } catch { return 'no-storage-session'; }
}

export function track(name: TrackName, listingId?: string, meta?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;
  supabase.rpc('track_event', { p_name: name, p_session: sessionId(), p_listing: listingId ?? null, p_meta: meta ?? {} }).then(() => {}, () => {});
}
