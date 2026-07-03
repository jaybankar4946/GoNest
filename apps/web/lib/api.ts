import { supabase } from './supabase';
import type { ListingFull, City, Locality } from './types';
 
export const imgUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${path}`;
 
const CARD = `
  id,title,price,purpose,property_type,bedrooms,sqft,
  verification_level,status,view_count,created_at,
  city:cities(id,name,slug),locality:localities(id,name,slug),
  listing_images(id,storage_path,sort_order)
`;
const FULL = `
  *,city:cities(id,name,slug),locality:localities(id,name,slug),
  listing_images(id,storage_path,sort_order),
  poster:profiles!posted_by(full_name,phone,role,agency_name,agent_verified)
`;
 
export type SearchParams = {
  q?: string; purpose?: string; cityId?: string; localityId?: string;
  minBedrooms?: number; propertyType?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc'; page?: number;
};
 
export async function searchListings(p: SearchParams = {}) {
  const page = p.page ?? 1;
  let q = supabase.from('listings').select(CARD, { count: 'exact' }).eq('status', 'active');
  if (p.q)            q = q.ilike('title', `%${p.q}%`);
  if (p.purpose)      q = q.eq('purpose', p.purpose);
  if (p.cityId)       q = q.eq('city_id', p.cityId);
  if (p.localityId)   q = q.eq('locality_id', p.localityId);
  if (p.minBedrooms)  q = q.gte('bedrooms', p.minBedrooms);
  if (p.propertyType) q = q.eq('property_type', p.propertyType);
  if (p.sort === 'price_asc')  q = q.order('price', { ascending: true });
  else if (p.sort === 'price_desc') q = q.order('price', { ascending: false });
  else q = q.order('created_at', { ascending: false });
  q = q.range((page - 1) * 24, page * 24 - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { listings: (data ?? []) as unknown as ListingFull[], total: count ?? 0 };
}
 
export async function getFeatured(limit = 3): Promise<ListingFull[]> {
  const { data } = await supabase.from('listings').select(CARD)
    .eq('status', 'active').eq('verification_level', 'platform_verified')
    .order('view_count', { ascending: false }).limit(limit);
  return (data ?? []) as unknown as ListingFull[];
}
 
export async function getListingById(id: string): Promise<ListingFull | null> {
  const { data, error } = await supabase.from('listings').select(FULL).eq('id', id).maybeSingle();
  if (error) throw error;
  if (data) supabase.rpc('increment_listing_views', { listing_id: id });
  return data as unknown as ListingFull | null;
}
 
export async function getCities(): Promise<City[]> {
  const { data } = await supabase.from('cities').select('id,name,state,slug').eq('is_active', true).order('name');
  return (data ?? []) as City[];
}
 
export async function getLocalities(cityId: string): Promise<Locality[]> {
  const { data } = await supabase.from('localities').select('id,city_id,name,slug').eq('city_id', cityId).order('name');
  return (data ?? []) as Locality[];
}
 
export async function getSavedIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase.from('saved_listings').select('listing_id').eq('user_id', userId);
  return new Set((data ?? []).map((r: any) => r.listing_id));
}
 
export async function toggleSaved(userId: string, listingId: string, saved: boolean) {
  if (saved) await supabase.from('saved_listings').delete().eq('user_id', userId).eq('listing_id', listingId);
  else       await supabase.from('saved_listings').insert({ user_id: userId, listing_id: listingId });
}
 
export async function getSavedListings(userId: string): Promise<ListingFull[]> {
  const { data } = await supabase.from('saved_listings')
    .select(`listing:listings(${CARD})`).eq('user_id', userId);
  return ((data ?? []).map((r: any) => r.listing).filter(Boolean)) as unknown as ListingFull[];
}
 
export async function submitLead(input: {
  listing_id: string; buyer_id: string | null; buyer_name: string;
  buyer_phone: string; buyer_email?: string; message?: string;
}) {
  const { error } = await supabase.from('leads').insert(input);
  if (error) throw error;
}
 
export async function submitVisit(input: {
  listing_id: string; requested_by: string | null; requester_name: string;
  requester_phone: string; slot_date: string; slot_time: string; notes?: string;
}) {
  const { error } = await supabase.from('visits').insert(input);
  if (error) throw error;
}
 
export async function getMyListings(userId: string): Promise<ListingFull[]> {
  const { data } = await supabase.from('listings').select(CARD + ',status,rejection_reason,poster_type')
    .eq('posted_by', userId).order('created_at', { ascending: false });
  return (data ?? []) as unknown as ListingFull[];
}
 
export async function getMyLeads(userId: string) {
  const { data } = await supabase.from('leads')
    .select('*,listing:listings!inner(id,title,posted_by)')
    .eq('listing.posted_by', userId).order('created_at', { ascending: false });
  return data ?? [];
}
 
export async function getMyVisits(userId: string) {
  const { data } = await supabase.from('visits')
    .select('*,listing:listings!inner(id,title,posted_by)')
    .eq('listing.posted_by', userId).order('slot_date', { ascending: true });
  return data ?? [];
}
 
export async function createListing(input: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.from('listings')
    .insert({ ...input, status: 'pending_review' }).select('id').single();
  if (error) throw error;
  return data.id as string;
}
 
export async function uploadImage(userId: string, listingId: string, file: File, order: number) {
  const path = `${userId}/${listingId}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
  const { error } = await supabase.storage.from('listing-images').upload(path, file);
  if (error) throw error;
  await supabase.from('listing_images').insert({ listing_id: listingId, storage_path: path, sort_order: order });
}
 
// Admin
export async function adminGetPending(): Promise<ListingFull[]> {
  const { data } = await supabase.from('listings')
    .select(CARD + ',status,rejection_reason,poster:profiles!posted_by(full_name,role,agent_verified)')
    .eq('status', 'pending_review').order('created_at', { ascending: true });
  return (data ?? []) as unknown as ListingFull[];
}
 
export async function adminGetBrokers() {
  const { data } = await supabase.from('profiles').select('*')
    .in('role', ['agent','owner']).order('created_at', { ascending: false });
  return data ?? [];
}
 
export async function adminGetLeads() {
  const { data } = await supabase.from('leads')
    .select('*,listing:listings(id,title)').order('created_at', { ascending: false });
  return data ?? [];
}
 
export async function adminModerate(listingId: string, status: string, verification: string, reason?: string) {
  await supabase.rpc('admin_moderate_listing', {
    p_listing_id: listingId, p_new_status: status,
    p_new_verification: verification, p_reason: reason ?? null,
  });
}
 
export async function adminVerifyAgent(userId: string, verified: boolean) {
  await supabase.from('profiles').update({ agent_verified: verified }).eq('id', userId);
}
 
export async function adminSetRole(userId: string, role: string) {
  await supabase.from('profiles').update({ role }).eq('id', userId);
}
