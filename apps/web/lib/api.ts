import { supabase } from './supabase';
import { demoOnClient } from './demo';
import type { ListingFull, City, Locality, Profile, Lead, Visit } from './types';

export const imgUrl = (path: string) =>
  /^https?:\/\//.test(path) ? path :
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${path}`;

const CARD = `id,title,price,purpose,property_type,bedrooms,bathrooms,sqft,pincode,neighbourhood,
  verification_level,status,featured,view_count,lead_count,price_negotiable,
  furnishing,created_at,published_at,latitude,longitude,is_sample,
  city:cities(id,name,slug),locality:localities(id,name,slug,latitude,longitude),
  listing_images(id,storage_path,sort_order,is_cover)`;

const FULL = `*,city:cities(id,name,slug,state),locality:localities(id,name,slug,latitude,longitude),
  listing_images(id,storage_path,sort_order,is_cover)`;

const PUBLIC_PROFILE = 'id,full_name,role,agency_name,rera_number,agent_verified,avatar_url,bio,total_listings,rating,review_count,created_at,service_localities,service_pincodes';

export type SearchParams = {
  q?: string; purpose?: string; cityId?: string; localityId?: string; pincode?: string; landmark?: string;
  minBedrooms?: number; minBathrooms?: number; propertyType?: string; minPrice?: number; maxPrice?: number;
  minArea?: number; maxArea?: number; amenities?: string[]; availability?: string; furnishing?: string; sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'; page?: number;
};

export async function searchListings(p: SearchParams = {}) {
  const page = p.page ?? 1;
  let q = supabase.from('listings').select(CARD, { count: 'exact' }).eq('status', 'active');
  if (!demoOnClient()) q = q.eq('is_sample', false);
  if (p.q) {
    // Search every meaningful token across property title, locality, city, landmark, address and PIN.
    // Applying each token as an OR group lets a query such as "Hiranandani Estate Thane 400607"
    // match the relevant fields without requiring the whole phrase in one database column.
    const terms = Array.from(new Set(p.q.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(t => t.length > 1))).slice(0, 8);
    for (const term of terms) {
      const [{ data: locs }, { data: cityRows }] = await Promise.all([
        supabase.from('localities').select('id').ilike('name', `%${term}%`).limit(30),
        supabase.from('cities').select('id').ilike('name', `%${term}%`).eq('is_active', true).limit(20),
      ]);
      const localityIds = (locs ?? []).map((l: any) => l.id);
      const cityIds = (cityRows ?? []).map((city: any) => city.id);
      const ors = [
        `title.ilike.%${term}%`,
        `address_line.ilike.%${term}%`,
        `landmark.ilike.%${term}%`,
        `neighbourhood.ilike.%${term}%`,
        `pincode.ilike.%${term}%`,
        localityIds.length ? `locality_id.in.(${localityIds.join(',')})` : '',
        cityIds.length ? `city_id.in.(${cityIds.join(',')})` : '',
      ].filter(Boolean);
      if (ors.length) q = q.or(ors.join(','));
      else q = q.ilike('title', `%${term}%`);
    }
  }
  if (p.pincode) q = q.ilike('pincode', `%${p.pincode.replace(/[^0-9]/g, '').slice(0, 6)}%`);
  if (p.landmark) {
    const locationTerm = p.landmark.replace(/[%,()]/g, ' ').trim();
    if (locationTerm) q = q.or('landmark.ilike.%' + locationTerm + '%,neighbourhood.ilike.%' + locationTerm + '%');
  }
  if (p.purpose)      q = q.eq('purpose', p.purpose);
  if (p.cityId)       q = q.eq('city_id', p.cityId);
  if (p.localityId)   q = q.eq('locality_id', p.localityId);
  if (p.minBedrooms)  q = q.gte('bedrooms', p.minBedrooms);
  if (p.minBathrooms) q = q.gte('bathrooms', p.minBathrooms);
  if (p.minArea) q = q.gte('sqft', p.minArea);
  if (p.maxArea) q = q.lte('sqft', p.maxArea);
  if (p.amenities?.length) q = q.contains('amenities', p.amenities);
  if (p.availability === 'now') q = q.lte('available_from', new Date().toISOString().slice(0,10));
  if (p.availability === '30') q = q.gte('available_from', new Date().toISOString().slice(0,10)).lte('available_from', new Date(Date.now()+30*86400000).toISOString().slice(0,10));
  if (p.availability === '90') q = q.gte('available_from', new Date().toISOString().slice(0,10)).lte('available_from', new Date(Date.now()+90*86400000).toISOString().slice(0,10));
  if (p.propertyType) q = q.eq('property_type', p.propertyType);
  if (p.minPrice)     q = q.gte('price', p.minPrice);
  if (p.maxPrice)     q = q.lte('price', p.maxPrice);
  if (p.furnishing)   q = q.eq('furnishing', p.furnishing);
  switch (p.sort) {
    case 'price_asc':  q = q.order('price', { ascending: true });       break;
    case 'price_desc': q = q.order('price', { ascending: false });      break;
    case 'popular':    q = q.order('view_count', { ascending: false });  break;
    default:           q = q.order('created_at', { ascending: false });
  }
  q = q.range((page - 1) * 24, page * 24 - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { listings: (data ?? []) as unknown as ListingFull[], total: count ?? 0, page };
}

export async function getDemoHomes(limit = 8): Promise<ListingFull[]> {
  const { data: imgs } = await supabase.from('listing_images').select('listing_id').limit(300);
  const ids = Array.from(new Set((imgs ?? []).map((r: any) => r.listing_id)));
  let q = supabase.from('listings').select(CARD).eq('status', 'active').eq('is_sample', true);
  if (ids.length) q = q.in('id', ids);
  const { data } = await q.order('view_count', { ascending: false }).limit(limit);
  return (data ?? []) as unknown as ListingFull[];
}

export async function getFeatured(limit = 3): Promise<ListingFull[]> {
  const { data } = await supabase.from('listings').select(CARD)
    .eq('status', 'active').eq('is_sample', false).eq('featured', true)
    .order('view_count', { ascending: false }).limit(limit);
  return (data ?? []) as unknown as ListingFull[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getListingById(id: string, demo = false): Promise<ListingFull | null> {
  // Reject malformed route IDs before they reach Postgres UUID columns.
  if (!UUID_RE.test(id)) return null;

  let lq = supabase.from('listings').select(FULL).eq('id', id).eq('status', 'active');
  if (!demo) lq = lq.eq('is_sample', false);
  const { data, error } = await lq.maybeSingle();
  if (error) throw error;
  if (!data) return null;

  // Never join the private profiles table from a public property-detail query.
  // Fetch only the deliberately public, RLS-safe profile fields through the view.
  const { data: poster } = await supabase.from('public_profiles')
    .select(PUBLIC_PROFILE).eq('id', (data as any).posted_by).maybeSingle();

  // View counts are best-effort analytics; they must not block the listing page.
  if (!(data as any).is_sample) void supabase.rpc('increment_listing_views', { listing_id: id }).then(() => {});
  return { ...data, poster: poster ?? null } as unknown as ListingFull;
}

export async function getSimilarListings(l: ListingFull, limit = 3, demo = false): Promise<ListingFull[]> {
  let sq = supabase.from('listings').select(CARD)
    .eq('status', 'active').eq('city_id', l.city_id)
    .eq('purpose', l.purpose).eq('property_type', l.property_type)
    .neq('id', l.id);
  if (!demo) sq = sq.eq('is_sample', false);
  const { data } = await sq.limit(limit);
  return (data ?? []) as unknown as ListingFull[];
}

export async function getCities(): Promise<City[]> {
  const { data } = await supabase.from('cities').select('id,name,state,slug')
    .eq('is_active', true).in('name', ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad']).order('name');
  return (data ?? []) as City[];
}

export async function getAllLocalities(): Promise<Locality[]> {
  const { data } = await supabase.from('localities').select('id,city_id,name,slug,latitude,longitude').order('name').limit(1000);
  return (data ?? []) as Locality[];
}

export async function getLocalities(cityId: string): Promise<Locality[]> {
  const { data } = await supabase.from('localities')
    .select('id,city_id,name,slug,latitude,longitude').eq('city_id', cityId).order('name');
  return (data ?? []) as Locality[];
}

export async function getSavedIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase.from('saved_listings').select('listing_id').eq('user_id', userId);
  return new Set((data ?? []).map((r: any) => r.listing_id));
}
export async function toggleSaved(userId: string, listingId: string, isSaved: boolean) {
  const r = isSaved
    ? await supabase.from('saved_listings').delete().eq('user_id', userId).eq('listing_id', listingId)
    : await supabase.from('saved_listings').insert({ user_id: userId, listing_id: listingId });
  if (r.error) throw r.error;
}
export async function setMyListingStatus(id: string, status: 'archived' | 'pending_review' | 'sold' | 'rented') {
  const { error } = await supabase.from('listings').update({ status }).eq('id', id);
  if (error) throw error;
}
export async function getSavedListings(userId: string): Promise<ListingFull[]> {
  const { data } = await supabase.from('saved_listings')
    .select(`listing:listings(${CARD})`).eq('user_id', userId).order('created_at', { ascending: false });
  return ((data ?? []).map((r: any) => r.listing).filter(Boolean)) as unknown as ListingFull[];
}

export async function submitLead(input: { consent_at?: string; consent_version?: string; listing_id: string; buyer_id: string | null; buyer_name: string; buyer_phone: string; buyer_email?: string; message?: string }) {
  const { error } = await supabase.from('leads').insert(input);
  if (error) throw error;
}
export async function getMyLeads(userId: string) {
  const { data } = await supabase.from('leads')
    .select('*, listing:listings!inner(id,title,posted_by)').eq('listing.posted_by', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  await supabase.from('leads').update({ status, notes: notes ?? null }).eq('id', leadId);
}

export async function submitVisit(input: { consent_at?: string; consent_version?: string; listing_id: string; requested_by: string | null; requester_name: string; requester_phone: string; slot_date: string; slot_time: string; notes?: string }) {
  const { error } = await supabase.from('visits').insert(input);
  if (error) throw error;
}
export async function getMyVisits(userId: string) {
  const { data } = await supabase.from('visits')
    .select('*, listing:listings!inner(id,title,posted_by)').eq('listing.posted_by', userId)
    .order('slot_date', { ascending: true });
  return data ?? [];
}
export async function updateVisitStatus(visitId: string, status: string, confirmedBy?: string) {
  await supabase.from('visits').update({
    status, confirmed_by: confirmedBy ?? null,
    confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
  }).eq('id', visitId);
}

export async function getMyListings(userId: string): Promise<ListingFull[]> {
  const { data } = await supabase.from('listings')
    .select(CARD + ',status,rejection_reason,poster_type,lead_count,view_count,saved_count')
    .eq('posted_by', userId).order('created_at', { ascending: false });
  return (data ?? []) as unknown as ListingFull[];
}
export async function createListing(input: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.from('listings')
    .insert({ ...input, status: 'pending_review' }).select('id').single();
  if (error) throw error;
  return data.id as string;
}
export async function uploadListingImage(userId: string, listingId: string, file: File, order: number): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${listingId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from('listing-images').upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { error: recordError } = await supabase.from('listing_images').insert({ listing_id: listingId, storage_path: path, sort_order: order, is_cover: order === 0 });
  if (recordError) {
    await supabase.storage.from('listing-images').remove([path]);
    throw recordError;
  }
  return path;
}

export async function cleanupIncompleteListing(listingId: string, uploadedPaths: string[]) {
  if (uploadedPaths.length) {
    const { error } = await supabase.storage.from('listing-images').remove(uploadedPaths);
    if (error) throw error;
  }
  const { error } = await supabase.from('listings').delete().eq('id', listingId);
  if (error) throw error;
}

export async function adminGetPendingListings(): Promise<ListingFull[]> {
  const { data } = await supabase.from('listings')
    .select(CARD + ',status,rejection_reason,poster_type,risk_flags,poster:profiles!posted_by(full_name,role,agent_verified,rera_number)')
    .eq('status', 'pending_review').order('created_at', { ascending: true });
  return (data ?? []) as unknown as ListingFull[];
}
export async function adminGetAllListings(): Promise<ListingFull[]> {
  const { data } = await supabase.from('listings')
    .select(CARD + ',status,rejection_reason,poster:profiles!posted_by(full_name,role)')
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as ListingFull[];
}
export async function adminGetBrokers(): Promise<Profile[]> {
  const { data } = await supabase.from('profiles').select(PUBLIC_PROFILE).in('role', ['agent','owner']).order('agent_verified', { ascending: false }).order('total_listings', { ascending: false }).order('created_at', { ascending: false });
  return (data ?? []) as Profile[];
}
export async function adminGetAllLeads() {
  const { data } = await supabase.from('leads').select('*, listing:listings(id,title,city:cities(name))').order('created_at', { ascending: false });
  return data ?? [];
}
export async function adminGetAllVisits() {
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
  return {
    totalListings: listings.count ?? 0, totalLeads: leads.count ?? 0,
    totalVisits: visits.count ?? 0,     totalUsers: profiles.count ?? 0,
    pendingReview: (listings.data ?? []).filter((l: any) => l.status === 'pending_review').length,
  };
}
export async function adminModerate(listingId: string, status: string, verification: string, reason?: string) {
  await supabase.rpc('admin_moderate_listing', { p_listing_id: listingId, p_new_status: status, p_new_verification: verification, p_reason: reason ?? null });
}
export async function adminToggleFeatured(listingId: string, featured: boolean) {
  const { error } = await supabase.from('listings').update({ featured }).eq('id', listingId);
  if (error) throw error;
}
export async function adminVerifyAgent(userId: string, verified: boolean) {
  const { error } = await supabase.from('profiles').update({ agent_verified: verified }).eq('id', userId);
  if (error) throw error;
}
export async function adminSetRole(userId: string, role: string) {
  const allowed = ['buyer', 'owner', 'agent'];
  if (!allowed.includes(role)) throw new Error('Unsupported role change.');
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) throw error;
}

export async function adminGetPendingProjects() {
  const { data, error } = await supabase.from('real_estate_projects')
    .select('id,official_name,public_address,rera_number,construction_status,inventory_status,verification_status,official_project_url,updated_at,developer:developers(operating_brand),city:cities(name),locality:localities(name)')
    .eq('is_sample', false).eq('verification_status', 'pending')
    .order('updated_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
export async function adminGetAllProjects() {
  const { data, error } = await supabase.from('real_estate_projects')
    .select('id,official_name,public_address,rera_number,construction_status,inventory_status,verification_status,official_project_url,updated_at,is_sample,developer:developers(operating_brand),city:cities(name),locality:localities(name)')
    .eq('is_sample', false)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminReviewSubmission(kind: 'project' | 'brokerage', id: string, decision: 'verified' | 'rejected', notes?: string) {
  const { error } = await supabase.rpc('admin_review_submission', {
    p_kind: kind, p_id: id, p_decision: decision, p_notes: notes?.trim() || null,
  });
  if (error) throw error;
}

// --- Backward-compatible aliases (older names used by admin/page.tsx) ---
export const adminGetPending = adminGetPendingListings;
export const adminGetLeads   = adminGetAllLeads;
export const adminGetVisits  = adminGetAllVisits;

// --- Agents directory (used by app/agents and app/agents/[id]) ---
export async function getPublicBrokerages() {
  const { data, error } = await supabase.from('brokerages')
    .select('id,business_name,public_business_phone,public_enquiry_url,public_business_address,source_url,city:cities(name)')
    .eq('is_sample', false).not('source_id', 'is', null)
    .in('verification_status', ['pending', 'verified']).order('business_name');
  if (error) {
    console.error('Could not load public brokerages', error.message);
    return [];
  }
  return data ?? [];
}

export async function getAgents(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select(PUBLIC_PROFILE)
    .in('role', ['agent','owner']).order('created_at', { ascending: false });
  if (error) {
    console.error('Could not load public agent profiles', error.message);
    return [];
  }

  // Keep incomplete/test accounts out of the public directory. A profile needs
  // a full name or substantive professional details; never invent missing data.
  return ((data ?? []) as Profile[]).filter((profile) => {
    if (profile.role !== 'agent') return true;
    const name = (profile.full_name ?? '').trim().replace(/\\s+/g, ' ');
    const hasFullName = name.split(' ').filter(Boolean).length >= 2;
    const hasProfessionalDetails = Boolean(
      profile.avatar_url ||
      profile.agency_name?.trim() ||
      profile.rera_number?.trim() ||
      profile.bio?.trim() ||
      (profile.total_listings ?? 0) > 0 ||
      (profile.review_count ?? 0) > 0 ||
      profile.rating != null ||
      profile.service_localities?.length ||
      profile.service_pincodes?.length
    );
    return hasFullName || hasProfessionalDetails;
  });
}
export async function getAgentById(id: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select(PUBLIC_PROFILE).eq('id', id).maybeSingle();
  return data as Profile | null;
}
export async function getAgentListings(agentId: string, limit = 24): Promise<ListingFull[]> {
  const { data } = await supabase.from('listings')
    .select(CARD).eq('posted_by', agentId).eq('status', 'active').eq('is_sample', false)
    .order('created_at', { ascending: false }).limit(limit);
  return (data ?? []) as unknown as ListingFull[];
}

// --- Reviews & Reports (app/property/[id]/ReviewsAndReport.tsx) ---
export async function getListingReviews(listingId: string) {
  const { data } = await supabase.from('listing_reviews')
    .select('id,reviewer_name,rating,comment,created_at')
    .eq('listing_id', listingId).order('created_at', { ascending: false });
  return data ?? [];
}

export async function getListingRatingSummary(listingId: string): Promise<{ avg: number; count: number }> {
  const { data } = await supabase.from('listing_reviews').select('rating').eq('listing_id', listingId);
  const rows = data ?? [];
  if (rows.length === 0) return { avg: 0, count: 0 };
  const avg = rows.reduce((sum: number, r: any) => sum + r.rating, 0) / rows.length;
  return { avg, count: rows.length };
}

export async function submitReview(input: { listing_id: string; reviewer_id: string; reviewer_name: string; rating: number; comment?: string }) {
  const { error } = await supabase.from('listing_reviews').insert(input);
  if (error) throw error;
}

export async function reportListing(input: { listing_id: string; reporter_id: string | null; reason: string; details?: string }) {
  const { error } = await supabase.from('listing_reports').insert(input);
  if (error) throw error;
}

// --- Edit/delete listing, profile, password reset ---

export async function getListingForEdit(id: string): Promise<ListingFull | null> {
  const { data, error } = await supabase.from('listings').select(FULL).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as unknown as ListingFull | null;
}

export async function updateListing(id: string, input: Record<string, unknown>) {
  const { error } = await supabase.from('listings').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteListing(id: string) {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteListingImage(imageId: string, storagePath: string) {
  await supabase.storage.from('listing-images').remove([storagePath]);
  await supabase.from('listing_images').delete().eq('id', imageId);
}

export async function updateProfile(userId: string, input: Record<string, unknown>) {
  const { error } = await supabase.from('profiles').update(input).eq('id', userId);
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function getHomeStats() {
  const n = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [listings, verified, people, cities] = await Promise.all([
    n(supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('is_sample', false)),
    n(supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('is_sample', false).neq('verification_level', 'unverified')),
    n(supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['agent', 'owner'])),
    n(supabase.from('cities').select('id', { count: 'exact', head: true }).eq('is_active', true)),
  ]);
  return { listings, verified, people, cities };
}

export async function getMyEnquiries(userId: string) {
  const { data } = await supabase.from('leads').select('id,status,message,created_at,listing:listings(id,title,status)').eq('buyer_id', userId).order('created_at', { ascending: false });
  return (data ?? []) as any[];
}
export async function getMyVisitRequests(userId: string) {
  const { data } = await supabase.from('visits').select('id,status,slot_date,slot_time,booking_ref,visitors,created_at,listing:listings(id,title,status)').eq('requested_by', userId).order('created_at', { ascending: false });
  return (data ?? []) as any[];
}
export async function getPopularLocalities(limit = 8): Promise<{ id: string; name: string; cityId: string; city: string; count: number }[]> {
  const { data: rows } = await supabase.from('listings').select('locality_id').eq('status', 'active').eq('is_sample', false).limit(1000);
  const counts = new Map<string, number>();
  (rows ?? []).forEach((r: any) => counts.set(r.locality_id, (counts.get(r.locality_id) ?? 0) + 1));
  const ids = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
  // Never label arbitrary localities as "popular" when there are no genuine active listings.
  if (ids.length === 0) return [];
  const { data } = await supabase.from('localities')
    .select('id,name,city:cities(id,name)').in('id', ids);
  return (data ?? []).map((l: any) => ({ id: l.id, name: l.name, cityId: l.city?.id ?? '', city: l.city?.name ?? '', count: counts.get(l.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

export async function adminGetReports() {
  const { data } = await supabase.from('listing_reports').select('id,reason,details,status,created_at,resolution_note,listing:listings(id,title,status)').order('created_at', { ascending: false }).limit(200);
  return (data ?? []) as any[];
}
export async function adminResolveReport(id: string, action: 'dismiss' | 'resolve' | 'suspend_listing', note?: string) {
  const { error } = await supabase.rpc('admin_resolve_report', { p_report_id: id, p_action: action, p_note: note ?? null });
  if (error) throw error;
}
export async function adminGetAuditLog() {
  const { data } = await supabase.from('admin_audit_log').select('id,action,entity_type,entity_id,details,created_at,actor_id').order('created_at', { ascending: false }).limit(100);
  return (data ?? []) as any[];
}

export async function chooseAccountType(role: 'owner' | 'agent' | 'builder') {
  const { error } = await supabase.rpc('choose_account_type', { p_role: role });
  if (error) throw error;
}

export async function getPriceHistory(listingId: string) {
  const { data } = await supabase.from('listing_price_history').select('id,event,price,created_at').eq('listing_id', listingId).order('created_at', { ascending: true });
  return (data ?? []) as { id: string; event: string; price: number | null; created_at: string }[];
}

export async function adminGetFunnel(days: number) {
  const { data } = await supabase.rpc('admin_funnel', { p_days: days });
  return (data ?? []) as { name: string; events: number; sessions: number }[];
}

export type SupplyFunnel = {
  days: number;
  supply_events: { name: string; events: number; people: number }[];
  demand: { sessions: number; searchers: number; property_viewers: number; enquiries: number };
  submissions: { projects_new: number; agencies_new: number; projects_pending: number; agencies_pending: number; projects_verified: number };
  accounts: { builders: number; agents: number; owners: number };
};
export async function adminGetSupplyFunnel(days: number): Promise<SupplyFunnel | null> {
  const { data, error } = await supabase.rpc('admin_supply_funnel', { p_days: days });
  if (error) return null;
  return data as SupplyFunnel;
}

// ---- Visit booking
export async function getBookedSlots(listingId: string, date: string): Promise<string[]> {
  const { data } = await supabase.rpc('get_booked_slots', { p_listing: listingId, p_date: date });
  return (data ?? []) as string[];
}
export type BookingResult = { booking_ref: string; title: string; slot_date: string; slot_time: string; visitors: number };
export async function bookVisit(i: { listingId: string; name: string; phone: string; email: string; date: string; time: string; visitors: number; method: string; notes: string; consent: boolean }): Promise<BookingResult> {
  const { data, error } = await supabase.rpc('book_visit', { p_listing: i.listingId, p_name: i.name, p_phone: i.phone, p_email: i.email, p_date: i.date, p_time: i.time, p_visitors: i.visitors, p_method: i.method, p_notes: i.notes, p_consent: i.consent });
  if (error) throw error;
  return data as BookingResult;
}
// ---- Notifications
export async function getNotifications() {
  const { data } = await supabase.from('notifications').select('id,type,title,body,link,read_at,created_at').order('created_at', { ascending: false }).limit(50);
  return (data ?? []) as { id: string; type: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string }[];
}
export async function getUnreadCount(): Promise<number> {
  const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null);
  return count ?? 0;
}
export async function markNotificationRead(id: string) { await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id); }
export async function markAllNotificationsRead() { await supabase.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null); }
// ---- Saved searches
export type SavedSearch = { id: string; name: string | null; city_id: string | null; locality_id: string | null; purpose: string | null; property_type: string | null; min_price: number | null; max_price: number | null; min_bedrooms: number | null; notify_enabled: boolean; created_at: string };
export async function getSavedSearches() {
  const { data } = await supabase.from('saved_searches').select('id,name,city_id,locality_id,purpose,property_type,min_price,max_price,min_bedrooms,notify_enabled,created_at').order('created_at', { ascending: false });
  return (data ?? []) as SavedSearch[];
}
export async function saveSearch(userId: string, f: { name: string; cityId?: string; purpose?: string; type?: string; min?: number; max?: number; beds?: number }) {
  const { error } = await supabase.from('saved_searches').insert({ user_id: userId, name: f.name, city_id: f.cityId || null, purpose: f.purpose || null, property_type: f.type || null, min_price: f.min ?? null, max_price: f.max ?? null, min_bedrooms: f.beds ?? null, notify_enabled: true });
  if (error) throw error;
}
export async function setSearchAlerts(id: string, enabled: boolean) { await supabase.from('saved_searches').update({ notify_enabled: enabled }).eq('id', id); }
export async function deleteSavedSearch(id: string) { await supabase.from('saved_searches').delete().eq('id', id); }


export type LaunchInventoryDashboard = {
  targets: { ownerListings: number; mumbaiOwnerListings: number; puneOwnerListings: number; projects: number; agents: number };
  listings: { total: number; sample: number; real: number; activeReal: number; pendingReal: number; ownerReal: number; rentReal: number; saleReal: number };
  projects: { total: number; sample: number; real: number; verifiedReal: number; pendingReal: number };
  developers: { total: number; sample: number; real: number; verifiedReal: number };
  agents: { total: number; sample: number; real: number; verifiedReal: number };
  brokerages: { total: number; sample: number; real: number; verifiedReal: number; pendingReal: number };
  demoWorkspace: { agents: number; builders: number; projects: number; listingSources: number };
  listingRecords: { id: string; title: string; purpose: string; price: number; status: string; poster_type: string; verification_level: string; is_sample: boolean; created_at: string; city: string | null; locality: string | null }[];
  projectRecords: { id: string; official_name: string; developer: string; city: string; rera_number: string | null; construction_status: string; inventory_status: string; verification_status: string; official_project_url: string | null; is_sample: boolean; updated_at: string }[];
  demoProjectRecords: { id: string; project_name: string; builder: string | null; locality_name: string; stage: string; rera_number: string | null; rera_status: string; is_sample: boolean; created_at: string }[];
  cities: { name: string; ownerListings: number; activeRealListings: number; targetOwnerListings: number }[];
};

export async function adminGetLaunchInventoryDashboard(): Promise<LaunchInventoryDashboard | null> {
  const { data, error } = await supabase.rpc('admin_launch_inventory_dashboard');
  if (error) {
    console.error('Could not load launch inventory dashboard', error.message);
    return null;
  }
  return data as LaunchInventoryDashboard;
}

// ---------------- Supply-side submissions (agents, builders) ----------------
export type BrokerageInput = { name: string; website?: string; phone?: string; enquiryUrl?: string; address?: string; cityId: string; rera: string; localities: string[] };
export async function submitBrokerage(i: BrokerageInput): Promise<string> {
  const { data, error } = await supabase.rpc('submit_brokerage', {
    p_name: i.name, p_website: i.website || null, p_phone: i.phone || null, p_enquiry_url: i.enquiryUrl || null,
    p_address: i.address || null, p_city_id: i.cityId, p_rera: i.rera, p_localities: i.localities,
  });
  if (error) throw error;
  return data as string;
}

export async function uploadProjectImage(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('project-images').upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}
export async function removeProjectImages(paths: string[]) {
  if (paths.length) await supabase.storage.from('project-images').remove(paths);
}

export type BuilderProjectInput = {
  registeredName: string; brand: string; websiteUrl: string; developerRera: string; projectName: string;
  cityId: string; localityId: string; address: string; projectRera: string; status: string; category: string;
  officialUrl: string; inventory: Array<Record<string, unknown>>; mediaPaths: string[];
};
export async function submitBuilderProject(i: BuilderProjectInput): Promise<string> {
  const { data, error } = await supabase.rpc('submit_builder_project_with_media', {
    p_registered_name: i.registeredName, p_operating_brand: i.brand || null, p_website_url: i.websiteUrl,
    p_rera_registration: i.developerRera || null, p_project_name: i.projectName, p_city_id: i.cityId,
    p_locality_id: i.localityId || null, p_public_address: i.address || null, p_rera_number: i.projectRera || null,
    p_construction_status: i.status, p_project_category: i.category, p_official_project_url: i.officialUrl,
    p_inventory: i.inventory, p_media_paths: i.mediaPaths,
  });
  if (error) throw error;
  return data as string;
}

export async function getMySubmissions(userId: string) {
  const [p, b] = await Promise.all([
    supabase.from('real_estate_projects').select('id,official_name,verification_status,created_at,city_id').eq('created_by_user_id', userId).order('created_at', { ascending: false }),
    supabase.from('brokerages').select('id,business_name,verification_status,created_at,city_id').eq('created_by_user_id', userId).order('created_at', { ascending: false }),
  ]);
  return { projects: (p.data ?? []) as any[], brokerages: (b.data ?? []) as any[] };
}

export async function adminGetPendingBrokerages() {
  const [b, c] = await Promise.all([
    supabase.from('brokerages')
      .select('id,business_name,rera_registration,website_url,public_business_phone,verification_status,created_at,city_id,localities')
      .eq('is_sample', false).eq('verification_status', 'pending').not('created_by_user_id', 'is', null).order('created_at', { ascending: true }),
    supabase.from('cities').select('id,name'),
  ]);
  if (b.error) throw b.error;
  const cityName = new Map<string, string>((c.data ?? []).map((x: any) => [x.id, x.name]));
  return ((b.data ?? []) as any[]).map((x) => ({ ...x, city_name: cityName.get(x.city_id) ?? '' }));
}


export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Use a JPG, PNG or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Profile photos must be 5 MB or smaller.');
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/profile/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('listing-images').upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('listing-images').getPublicUrl(path);
  return data.publicUrl;
}
