import { supabase } from './supabase';
import type { ListingFull, City, Locality, Profile, Lead, Visit } from './types';

export const imgUrl = (path: string) =>
  /^https?:\/\//.test(path) ? path :
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${path}`;

const CARD = `id,title,price,purpose,property_type,bedrooms,bathrooms,sqft,
  verification_level,status,featured,view_count,lead_count,price_negotiable,
  furnishing,created_at,published_at,latitude,longitude,is_sample,
  city:cities(id,name,slug),locality:localities(id,name,slug,latitude,longitude),
  listing_images(id,storage_path,sort_order,is_cover)`;

const FULL = `*,city:cities(id,name,slug,state),locality:localities(id,name,slug,latitude,longitude),
  listing_images(id,storage_path,sort_order,is_cover),
  poster:profiles!posted_by(full_name,phone,role,agency_name,agent_verified,avatar_url,rera_number)`;

const PUBLIC_PROFILE = 'id,full_name,phone,role,agency_name,rera_number,agent_verified,avatar_url,bio,total_listings,rating,review_count,created_at';

export type SearchParams = {
  q?: string; purpose?: string; cityId?: string; localityId?: string;
  minBedrooms?: number; propertyType?: string; minPrice?: number; maxPrice?: number;
  furnishing?: string; sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'; page?: number;
};

export async function searchListings(p: SearchParams = {}) {
  const page = p.page ?? 1;
  let q = supabase.from('listings').select(CARD, { count: 'exact' }).eq('status', 'active').eq('is_sample', false);
  if (p.q) {
    const term = p.q.replace(/[%,()]/g, ' ').trim();
    if (term) {
      const { data: locs } = await supabase.from('localities').select('id').ilike('name', `%${term}%`).limit(20);
      const ids = (locs ?? []).map((l: any) => l.id);
      q = q.or([`title.ilike.%${term}%`, ids.length ? `locality_id.in.(${ids.join(',')})` : ''].filter(Boolean).join(','));
    }
  }
  if (p.purpose)      q = q.eq('purpose', p.purpose);
  if (p.cityId)       q = q.eq('city_id', p.cityId);
  if (p.localityId)   q = q.eq('locality_id', p.localityId);
  if (p.minBedrooms)  q = q.gte('bedrooms', p.minBedrooms);
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

export async function getFeatured(limit = 3): Promise<ListingFull[]> {
  const { data } = await supabase.from('listings').select(CARD)
    .eq('status', 'active').eq('is_sample', false).eq('featured', true)
    .order('view_count', { ascending: false }).limit(limit);
  return (data ?? []) as unknown as ListingFull[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getListingById(id: string): Promise<ListingFull | null> {
  // Reject malformed route IDs before they reach Postgres UUID columns. Treat them
  // as missing listings so callers can render a normal not-found page (HTTP 404).
  if (!UUID_RE.test(id)) return null;

  const { data, error } = await supabase.from('listings').select(FULL).eq('id', id).eq('status', 'active').eq('is_sample', false).maybeSingle();
  if (error) throw error;
  if (data) supabase.rpc('increment_listing_views', { listing_id: id }).then(() => {});
  return data as unknown as ListingFull | null;
}

export async function getSimilarListings(l: ListingFull, limit = 3): Promise<ListingFull[]> {
  const { data } = await supabase.from('listings').select(CARD)
    .eq('status', 'active').eq('is_sample', false).eq('city_id', l.city_id)
    .eq('purpose', l.purpose).eq('property_type', l.property_type)
    .neq('id', l.id).limit(limit);
  return (data ?? []) as unknown as ListingFull[];
}

export async function getCities(): Promise<City[]> {
  const { data } = await supabase.from('cities').select('id,name,state,slug,listing_count')
    .eq('is_active', true).in('name', ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad']).order('name');
  return (data ?? []) as City[];
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
export async function uploadListingImage(userId: string, listingId: string, file: File, order: number) {
  const path = `${userId}/${listingId}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
  const { error } = await supabase.storage.from('listing-images').upload(path, file);
  if (error) throw error;
  await supabase.from('listing_images').insert({ listing_id: listingId, storage_path: path, sort_order: order, is_cover: order === 0 });
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
  await supabase.from('listings').update({ featured }).eq('id', listingId);
}
export async function adminVerifyAgent(userId: string, verified: boolean) {
  await supabase.from('profiles').update({ agent_verified: verified }).eq('id', userId);
}
export async function adminSetRole(userId: string, role: string) {
  await supabase.from('profiles').update({ role }).eq('id', userId);
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
  const { data } = await supabase.from('profiles').select(PUBLIC_PROFILE)
    .in('role', ['agent','owner']).eq('is_sample', false).order('created_at', { ascending: false });
  return (data ?? []) as Profile[];
}
export async function getAgentById(id: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select(PUBLIC_PROFILE).eq('id', id).eq('is_sample', false).maybeSingle();
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
    n(supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['agent', 'owner']).eq('is_sample', false)),
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

export async function chooseAccountType(role: 'owner' | 'agent') {
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
