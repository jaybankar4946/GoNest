import { supabase } from './supabase';

export const imgUrl = (p: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${p}`;

const CARD = `id,title,price,purpose,property_type,bedrooms,bathrooms,sqft,
  verification_level,status,featured,view_count,lead_count,price_negotiable,
  furnishing,facing,floor_number,total_floors,created_at,published_at,
  city:cities(id,name,slug,state),
  locality:localities(id,name,slug,latitude,longitude),
  listing_images(id,storage_path,sort_order,is_cover)`;

const FULL = `*,city:cities(id,name,slug,state),
  locality:localities(id,name,slug,latitude,longitude),
  listing_images(id,storage_path,sort_order,is_cover),
  poster:profiles!posted_by(full_name,phone,role,agency_name,agent_verified,avatar_url,rera_number)`;

export type SP = {
  q?: string; purpose?: string; cityId?: string; localityId?: string;
  minBedrooms?: number; propertyType?: string; minPrice?: number; maxPrice?: number;
  furnishing?: string; sort?: 'newest'|'price_asc'|'price_desc'|'popular'; page?: number;
};

export async function searchListings(p: SP = {}) {
  const page = p.page ?? 1;
  let q = supabase.from('listings').select(CARD, { count: 'exact' }).eq('status', 'active');
  if (p.q)            q = q.ilike('title', `%${p.q}%`);
  if (p.purpose)      q = q.eq('purpose', p.purpose);
  if (p.cityId)       q = q.eq('city_id', p.cityId);
  if (p.localityId)   q = q.eq('locality_id', p.localityId);
  if (p.minBedrooms)  q = q.gte('bedrooms', p.minBedrooms);
  if (p.propertyType) q = q.eq('property_type', p.propertyType);
  if (p.minPrice)     q = q.gte('price', p.minPrice);
  if (p.maxPrice)     q = q.lte('price', p.maxPrice);
  if (p.furnishing)   q = q.eq('furnishing', p.furnishing);
  switch (p.sort) {
    case 'price_asc':  q = q.order('price', { ascending: true }); break;
    case 'price_desc': q = q.order('price', { ascending: false }); break;
    case 'popular':    q = q.order('view_count', { ascending: false }); break;
    default:           q = q.order('created_at', { ascending: false });
  }
  q = q.range((page - 1) * 24, page * 24 - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { listings: (data ?? []) as any[], total: count ?? 0, page };
}

export async function getFeatured(limit = 3) {
  const { data } = await supabase.from('listings').select(CARD)
    .eq('status', 'active').eq('featured', true)
    .order('view_count', { ascending: false }).limit(limit);
  return (data ?? []) as any[];
}

export async function getListingById(id: string) {
  const { data, error } = await supabase.from('listings').select(FULL).eq('id', id).maybeSingle();
  if (error) throw error;
  if (data) supabase.rpc('increment_listing_views', { listing_id: id }).then(() => {});
  return data as any;
}

export async function getSimilarListings(l: any, limit = 3) {
  const { data } = await supabase.from('listings').select(CARD)
    .eq('status', 'active').eq('city_id', l.city_id)
    .eq('purpose', l.purpose).eq('property_type', l.property_type)
    .neq('id', l.id).limit(limit);
  return (data ?? []) as any[];
}

export async function getCities() {
  const { data } = await supabase.from('cities').select('id,name,state,slug,listing_count').eq('is_active', true).order('name');
  return data ?? [];
}
export async function getLocalities(cityId: string) {
  const { data } = await supabase.from('localities').select('id,city_id,name,slug,latitude,longitude').eq('city_id', cityId).order('name');
  return data ?? [];
}

export async function getSavedIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase.from('saved_listings').select('listing_id').eq('user_id', userId);
  return new Set((data ?? []).map((r: any) => r.listing_id));
}
export async function toggleSaved(userId: string, listingId: string, isSaved: boolean) {
  if (isSaved) await supabase.from('saved_listings').delete().eq('user_id', userId).eq('listing_id', listingId);
  else         await supabase.from('saved_listings').insert({ user_id: userId, listing_id: listingId });
}
export async function getSavedListings(userId: string) {
  const { data } = await supabase.from('saved_listings')
    .select(`listing:listings(${CARD})`).eq('user_id', userId).order('created_at', { ascending: false });
  return ((data ?? []).map((r: any) => r.listing).filter(Boolean)) as any[];
}

export async function submitLead(input: { listing_id: string; buyer_id: string|null; buyer_name: string; buyer_phone: string; buyer_email?: string; message?: string }) {
  const { error } = await supabase.from('leads').insert(input);
  if (error) throw error;
}
export async function submitVisit(input: { listing_id: string; requested_by: string|null; requester_name: string; requester_phone: string; slot_date: string; slot_time: string; notes?: string }) {
  const { error } = await supabase.from('visits').insert(input);
  if (error) throw error;
}
export async function getMyListings(userId: string) {
  const { data } = await supabase.from('listings').select(CARD + ',status,rejection_reason,poster_type,lead_count,view_count').eq('posted_by', userId).order('created_at', { ascending: false });
  return (data ?? []) as any[];
}
export async function getMyLeads(userId: string) {
  const { data } = await supabase.from('leads').select('*, listing:listings!inner(id,title,posted_by)').eq('listing.posted_by', userId).order('created_at', { ascending: false });
  return data ?? [];
}
export async function getMyVisits(userId: string) {
  const { data } = await supabase.from('visits').select('*, listing:listings!inner(id,title,posted_by)').eq('listing.posted_by', userId).order('slot_date', { ascending: true });
  return data ?? [];
}
export async function updateLeadStatus(id: string, status: string, notes?: string) {
  await supabase.from('leads').update({ status, notes: notes ?? null }).eq('id', id);
}
export async function updateVisitStatus(visitId: string, status: string, confirmedBy?: string) {
  await supabase.from('visits').update({ status, confirmed_by: confirmedBy ?? null, confirmed_at: status === 'confirmed' ? new Date().toISOString() : null, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', visitId);
}
export async function createListing(input: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.from('listings').insert({ ...input, status: 'pending_review' }).select('id').single();
  if (error) throw error;
  return data.id as string;
}
export async function uploadListingImage(userId: string, listingId: string, file: File, order: number) {
  const path = `${userId}/${listingId}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
  const { error } = await supabase.storage.from('listing-images').upload(path, file);
  if (error) throw error;
  await supabase.from('listing_images').insert({ listing_id: listingId, storage_path: path, sort_order: order, is_cover: order === 0 });
}
export async function adminGetPending() {
  const { data } = await supabase.from('listings').select(CARD + ',status,rejection_reason,poster_type,poster:profiles!posted_by(full_name,role,agent_verified,rera_number)').eq('status', 'pending_review').order('created_at', { ascending: true });
  return (data ?? []) as any[];
}
export async function adminGetAllListings() {
  const { data } = await supabase.from('listings').select(CARD + ',status,rejection_reason,poster:profiles!posted_by(full_name,role)').order('created_at', { ascending: false });
  return (data ?? []) as any[];
}
export async function adminGetBrokers() {
  const { data } = await supabase.from('profiles').select('*').in('role', ['agent','owner']).order('created_at', { ascending: false });
  return data ?? [];
}
export async function adminGetLeads() {
  const { data } = await supabase.from('leads').select('*, listing:listings(id,title,city:cities(name))').order('created_at', { ascending: false });
  return data ?? [];
}
export async function adminGetVisits() {
  const { data } = await supabase.from('visits').select('*, listing:listings(id,title,city:cities(name))').order('slot_date', { ascending: true });
  return data ?? [];
}
export async function adminGetStats() {
  const [listings, leads, visits, profiles] = await Promise.all([
    supabase.from('listings').select('id,status', { count: 'exact' }),
    supabase.from('leads').select('id', { count: 'exact' }),
    supabase.from('visits').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
  ]);
  return { totalListings: listings.count ?? 0, totalLeads: leads.count ?? 0, totalVisits: visits.count ?? 0, totalUsers: profiles.count ?? 0, pendingReview: (listings.data ?? []).filter((l: any) => l.status === 'pending_review').length };
}
export async function adminModerate(listingId: string, status: string, verification: string, reason?: string) {
  await supabase.rpc('admin_moderate_listing', { p_listing_id: listingId, p_new_status: status, p_new_verification: verification, p_reason: reason ?? null });
}
export async function adminToggleFeatured(listingId: string, featured: boolean) {
  await supabase.from('listings').update({ featured }).eq('id', listingId);
}
export async function adminVerifyAgent(userId: string, verified: boolean) {
  await supabase.from('profiles').update({ agent_verified: verified }).eq('id', userId);
}
export async function adminSetRole(userId: string, role: string) {
  await supabase.from('profiles').update({ role }).eq('id', userId);
}

export async function getAgents(cityId?: string) {
  const { data: agents, error } = await supabase
    .from('profiles')
    .select('id,full_name,phone,phone_verified,role,agency_name,agent_verified,avatar_url,rera_number')
    .in('role', ['agent', 'owner'])
    .eq('agent_verified', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!agents || agents.length === 0) return [];

  const ids = agents.map((a: any) => a.id);
  const { data: activeListings } = await supabase
    .from('listings')
    .select('posted_by')
    .eq('status', 'active')
    .in('posted_by', ids);

  const countMap: Record<string, number> = {};
  (activeListings ?? []).forEach((l: any) => {
    countMap[l.posted_by] = (countMap[l.posted_by] ?? 0) + 1;
  });

  return agents.map((a: any) => ({ ...a, total_listings: countMap[a.id] ?? 0 }));
}

export async function getAgentById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,full_name,phone,phone_verified,role,agency_name,agent_verified,avatar_url,rera_number')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAgentListings(agentId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(CARD)
    .eq('posted_by', agentId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function getListingReviews(listingId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getListingRatingSummary(listingId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('listing_id', listingId);
  if (error) throw error;
  const ratings = (data ?? []).map((r: any) => r.rating);
  const count = ratings.length;
  const avg = count > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / count : 0;
  return { avg, count };
}

export async function submitReview(input: { listing_id: string; reviewer_id: string; reviewer_name: string; rating: number; comment?: string }) {
  const { error } = await supabase.from('reviews').insert(input);
  if (error) throw error;
}

export async function reportListing(input: { listing_id: string; reporter_id: string | null; reason: string; details?: string }) {
  const { error } = await supabase.from('listing_reports').insert(input);
  if (error) throw error;
}
