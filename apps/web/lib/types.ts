export type Role              = 'buyer' | 'owner' | 'agent' | 'admin';
export type Purpose           = 'sale' | 'rent';
export type PropertyType      = 'apartment' | 'villa' | 'house' | 'plot' | 'commercial' | 'office' | 'pg';
export type ListingStatus     = 'draft' | 'pending_review' | 'active' | 'rejected' | 'archived';
export type VerificationLevel = 'unverified' | 'verified' | 'platform_verified';
export type LeadStatus        = 'new' | 'contacted' | 'qualified' | 'closed' | 'spam';
export type VisitStatus       = 'requested' | 'confirmed' | 'completed' | 'cancelled';

export type Profile = {
  id: string; full_name: string | null; phone: string | null;
  phone_verified: boolean; role: Role; agency_name: string | null;
  rera_number: string | null; agent_verified: boolean;
  avatar_url: string | null; email: string | null; bio: string | null;
  total_listings: number; rating: number | null; review_count: number; created_at: string;
};
export type City     = { id: string; name: string; state: string; slug: string; listing_count?: number };
export type Locality = { id: string; city_id: string; name: string; slug: string; latitude: number | null; longitude: number | null };
export type ListingImage = { id: string; listing_id: string; storage_path: string; sort_order: number; is_cover: boolean };

export type Listing = {
  id: string; posted_by: string; poster_type: 'owner' | 'agent';
  title: string; description: string | null; property_type: PropertyType; purpose: Purpose;
  city_id: string; locality_id: string; address_line: string | null; landmark: string | null;
  latitude: number | null; longitude: number | null;
  price: number; price_negotiable: boolean; maintenance_monthly: number | null;
  security_deposit: number | null; brokerage: string | null;
  bedrooms: number; bathrooms: number; balconies: number; sqft: number | null;
  carpet_area: number | null; floor_number: number | null; total_floors: number | null;
  furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished' | null;
  property_age: number | null; facing: string | null; available_from: string | null;
  status: ListingStatus; verification_level: VerificationLevel; featured: boolean;
  rejection_reason: string | null; view_count: number; lead_count: number;
  saved_count: number; slug: string | null; created_at: string; updated_at: string; published_at: string | null;
};
export type ListingFull = Listing & {
  city: Pick<City, 'id' | 'name' | 'slug'>;
  locality: Pick<Locality, 'id' | 'name' | 'slug'>;
  listing_images: ListingImage[];
  poster?: Pick<Profile, 'full_name' | 'phone' | 'role' | 'agency_name' | 'agent_verified'>;
};
export type Lead = {
  id: string; listing_id: string; buyer_id: string | null;
  buyer_name: string; buyer_phone: string; buyer_email: string | null;
  message: string | null; budget: number | null; status: LeadStatus;
  notes: string | null; source: string; created_at: string;
};
export type Visit = {
  id: string; listing_id: string; requested_by: string | null;
  requester_name: string; requester_phone: string; requester_email: string | null;
  slot_date: string; slot_time: string; notes: string | null; status: VisitStatus;
  confirmed_by: string | null; confirmed_at: string | null; created_at: string;
};
