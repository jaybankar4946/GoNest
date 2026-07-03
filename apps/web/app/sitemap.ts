import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://gonest.in';
 
  const { data: listings } = await supabase
    .from('listings')
    .select('id,updated_at')
    .eq('status','active')
    .order('updated_at',{ascending:false})
    .limit(1000);
 
  const staticPages: MetadataRoute.Sitemap = [
    { url: base,             lastModified: new Date(), changeFrequency: 'daily',   priority: 1 },
    { url: `${base}/buy`,    lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${base}/rent`,   lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${base}/projects`,lastModified: new Date(), changeFrequency: 'daily',  priority: 0.8 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.8 },
  ];
 
  const listingPages: MetadataRoute.Sitemap = (listings??[]).map(l=>({
    url: `${base}/property/${l.id}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
 
  return [...staticPages, ...listingPages];
}
