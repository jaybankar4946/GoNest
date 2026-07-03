export type Role             = 'buyer' | 'owner' | 'agent' | 'admin';
export type Purpose          = 'sale'  | 'rent';
export type PropertyType     = 'apartment' | 'villa' | 'house' | 'plot' | 'commercial';
export type ListingStatus    = 'draft' | 'pending_review' | 'active' | 'rejected' | 'archived';
export type VerificationLevel = 'unverified' | 'verified' | 'platform_verified';
export type LeadStatus       = 'new' | 'contacted' | 'closed' | 'spam';
export type VisitStatus      = 'requested' | 'confirmed' | 'completed' | 'cancelled';
 
export type Profile = {
  id: string; full_name: string | null; phone: string | null;
  phone_verified: boolean; role: Role; agency_name: string | null;
  rera_number: string | null; agent_verified: boolean;
};
export type City     = { id: string; name: string; state: string; slug: string };
export type Locality = { id: string; city_id: string; name: string; slug: string };
export type ListingImage = { id: string; listing_id: string; storage_path: string; sort_order: number };
 
export type Listing = {
  id: string; posted_by: string; poster_type: 'owner' | 'agent';
  title: string; description: string | null;
  property_type: PropertyType; purpose: Purpose;
  city_id: string; locality_id: string;
  price: number; maintenance_monthly: number | null; security_deposit: number | null;
  bedrooms: number; bathrooms: number; sqft: number | null;
  furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished' | null;
  status: ListingStatus; verification_level: VerificationLevel;
  view_count: number; created_at: string;
};
 
export type ListingFull = Listing & {
  city: Pick<City, 'id' | 'name' | 'slug'>;
  locality: Pick<Locality, 'id' | 'name' | 'slug'>;
  listing_images: ListingImage[];
  poster?: Pick<Profile, 'full_name' | 'phone' | 'role' | 'agency_name'>;
};
