import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { localityGuides } from '@/lib/locality-guides';

const base = 'https://gonest.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: listings } = await supabase
    .from('listings')
    .select('id,updated_at')
    .eq('status', 'active')
    .eq('is_sample', false)
    .order('updated_at', { ascending: false })
    .limit(1000);

  const fixedPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/buy`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/rent`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/projects`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/builders`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/agents`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/localities`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/home-value`, changeFrequency: 'weekly', priority: 0.8 },
    ...localityGuides.map((guide) => ({
      url: `${base}/localities/${guide.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  return [
    ...fixedPages,
    ...(listings ?? []).map((listing) => ({
      url: `${base}/property/${listing.id}`,
      lastModified: listing.updated_at ? new Date(listing.updated_at) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
