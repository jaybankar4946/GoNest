import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600;

const base = 'https://gonest.in';
type Entry = MetadataRoute.Sitemap[number];
const when = (v: unknown) => { const d = v ? new Date(String(v)) : new Date(); return Number.isNaN(d.getTime()) ? new Date() : d; };

// Each data source is isolated: if one query fails, the sitemap still serves everything else.
async function safe<T>(fn: () => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try { const r = await fn(); return r.error ? [] : (r.data ?? []); } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, projects, agents] = await Promise.all([
    safe<{ id: string; updated_at: string }>(() => supabase.from('listings').select('id,updated_at').eq('status', 'active').eq('is_sample', false).order('updated_at', { ascending: false }).limit(1000)),
    safe<{ id: string; updated_at: string }>(() => supabase.from('real_estate_projects').select('id,updated_at').eq('verification_status', 'verified').eq('is_sample', false).order('updated_at', { ascending: false }).limit(2000)),
    safe<{ id: string; updated_at: string }>(() => supabase.from('profiles').select('id,updated_at').eq('role', 'agent').eq('agent_verified', true).not('rera_number', 'is', null).limit(2000)),
  ]);
  const pages: [string, Entry['changeFrequency'], number][] = [
    ['', 'daily', 1], ['/buy', 'hourly', 0.9], ['/rent', 'hourly', 0.9], ['/projects', 'daily', 0.8], ['/agents', 'daily', 0.8],
    ['/builders', 'weekly', 0.7], ['/list-with-gonest', 'weekly', 0.8], ['/about', 'monthly', 0.5], ['/emi', 'monthly', 0.5],
    ['/privacy', 'yearly', 0.2], ['/terms', 'yearly', 0.2],
  ];
  return [
    ...pages.map(([path, changeFrequency, priority]) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency, priority })),
    ...listings.map((l) => ({ url: `${base}/property/${l.id}`, lastModified: when(l.updated_at), changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.id}`, lastModified: when(p.updated_at), changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...agents.map((a) => ({ url: `${base}/agents/${a.id}`, lastModified: when(a.updated_at), changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
