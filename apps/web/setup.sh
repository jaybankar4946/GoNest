#!/bin/bash
# ============================================================
# GoNest — Full Clean Build
# Run from: /Users/jackfink/Projects/GoNest/apps/web
# Copy and paste each block one at a time into your terminal
# ============================================================


# ─────────────────────────────────────────────────────────────
# STEP 0: Create folders
# ─────────────────────────────────────────────────────────────
mkdir -p app/buy app/rent app/projects app/search app/saved \
         app/auth app/dashboard app/admin \
         "app/property/[id]" \
         components/layout components/property components/forms \
         lib


# ─────────────────────────────────────────────────────────────
# STEP 1: lib/supabase.ts
# ─────────────────────────────────────────────────────────────
cat > lib/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
EOF


# ─────────────────────────────────────────────────────────────
# STEP 2: lib/format.ts
# ─────────────────────────────────────────────────────────────
cat > lib/format.ts << 'EOF'
export function formatPrice(price: number, purpose: 'sale' | 'rent'): string {
  const fmt = (n: number, s: string) =>
    `₹${Number.isInteger(n) ? n : parseFloat(n.toFixed(2))} ${s}`;
  if (purpose === 'rent') {
    if (price >= 100000) return fmt(price / 100000, 'L/mo');
    return `₹${price.toLocaleString('en-IN')}/mo`;
  }
  if (price >= 10000000) return fmt(price / 10000000, 'Cr');
  if (price >= 100000)   return fmt(price / 100000,   'L');
  return `₹${price.toLocaleString('en-IN')}`;
}

export function bhkLabel(bedrooms: number, type: string): string {
  if (type === 'plot')       return 'Plot';
  if (type === 'commercial') return 'Commercial';
  if (bedrooms === 0)        return 'Studio';
  return `${bedrooms} BHK`;
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 3: lib/types.ts
# ─────────────────────────────────────────────────────────────
cat > lib/types.ts << 'EOF'
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
EOF


# ─────────────────────────────────────────────────────────────
# STEP 4: lib/api.ts
# ─────────────────────────────────────────────────────────────
cat > lib/api.ts << 'EOF'
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
EOF


# ─────────────────────────────────────────────────────────────
# STEP 5: app/globals.css
# ─────────────────────────────────────────────────────────────
cat > app/globals.css << 'EOF'
@import "tailwindcss";

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root {
  --font:    var(--font-sans,'Inter',system-ui,sans-serif);
  --black:   #111111;
  --gray-1:  #F7F7F7;
  --gray-2:  #EBEBEB;
  --gray-3:  #C8C8C8;
  --gray-4:  #6B6B6B;
  --white:   #FFFFFF;
  --border:  #E5E5E5;
  --ok:      #16A34A;
  --err:     #DC2626;
}

body{font-family:var(--font);color:var(--black);background:var(--white);-webkit-font-smoothing:antialiased;line-height:1.5}
button{cursor:pointer;border:none;background:none;font:inherit;color:inherit}
input,select,textarea{font:inherit;color:inherit}
a{color:inherit;text-decoration:none}
select{appearance:none;-webkit-appearance:none}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--gray-3);border-radius:2px}
.line-clamp-2{overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 6: app/layout.tsx
# ─────────────────────────────────────────────────────────────
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'GoNest – Find Your Home in Mumbai', template: '%s | GoNest' },
  description: 'Search verified properties to buy or rent in Mumbai.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 7: app/not-found.tsx
# ─────────────────────────────────────────────────────────────
cat > app/not-found.tsx << 'EOF'
import Link from 'next/link';
export default function NotFound() {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
      <span style={{fontSize:12,color:'#6B6B6B',letterSpacing:'0.08em',textTransform:'uppercase'}}>404</span>
      <h1 style={{fontSize:20,fontWeight:600}}>Page not found</h1>
      <Link href="/" style={{fontSize:14,color:'#6B6B6B',textDecoration:'underline'}}>← Back home</Link>
    </div>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 8: components/layout/AuthProvider.tsx
# ─────────────────────────────────────────────────────────────
cat > components/layout/AuthProvider.tsx << 'EOF'
'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

type Ctx = { user: User | null; profile: Profile | null; loading: boolean; signOut: () => Promise<void> };
const Ctx = createContext<Ctx>({ user: null, profile: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile(data as Profile | null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u); if (u) loadProfile(u.id); setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      const u = s?.user ?? null; setUser(u);
      if (u) loadProfile(u.id); else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = async () => { await supabase.auth.signOut(); setProfile(null); };
  return <Ctx.Provider value={{ user, profile, loading, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
EOF


# ─────────────────────────────────────────────────────────────
# STEP 9: components/layout/Nav.tsx
# ─────────────────────────────────────────────────────────────
cat > components/layout/Nav.tsx << 'EOF'
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, User, Plus } from 'lucide-react';
import { useAuth } from './AuthProvider';

const LINKS = [
  { href: '/buy',      label: 'Buy' },
  { href: '/rent',     label: 'Rent' },
  { href: '/projects', label: 'New Projects' },
];

export function Nav() {
  const path = usePathname();
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const canPost = ['owner', 'agent', 'admin'].includes(profile?.role ?? '');

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #E5E5E5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64, gap: 8 }}>

        <Link href="/" style={{ fontWeight: 700, fontSize: 17, color: '#111', letterSpacing: '-0.02em', marginRight: 16 }}>
          GoNest
        </Link>

        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '6px 14px', borderRadius: 9999, fontSize: 14,
              fontWeight: path.startsWith(l.href) ? 600 : 400,
              color: path.startsWith(l.href) ? '#111' : '#6B6B6B',
              background: path.startsWith(l.href) ? '#F7F7F7' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" style={{
              padding: '6px 14px', borderRadius: 9999, fontSize: 14,
              fontWeight: path.startsWith('/admin') ? 600 : 400,
              color: path.startsWith('/admin') ? '#111' : '#6B6B6B',
              background: path.startsWith('/admin') ? '#F7F7F7' : 'transparent',
            }}>
              Admin
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link href="/saved" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9999, fontSize: 13, color: '#6B6B6B' }}>
            <Heart size={14} /><span className="hidden sm:inline">Saved</span>
          </Link>

          {user ? (
            <>
              {canPost && (
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, color: '#fff', background: '#111' }}>
                  <Plus size={13} />Post
                </Link>
              )}
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 500, color: '#111', border: '1px solid #111' }}>
                <User size={13} />
                <span className="hidden sm:inline">{profile?.full_name?.split(' ')[0] ?? 'Account'}</span>
              </Link>
            </>
          ) : (
            <Link href="/auth" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 500, color: '#111', border: '1px solid #111' }}>
              <User size={13} />Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 10: components/layout/Footer.tsx
# ─────────────────────────────────────────────────────────────
cat > components/layout/Footer.tsx << 'EOF'
import Link from 'next/link';
export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #E5E5E5', padding: '36px 24px', marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>GoNest</span>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['Buy','Rent','New Projects','Privacy','Terms','Contact'].map(l => (
            <Link key={l} href="#" style={{ fontSize: 13, color: '#6B6B6B' }}>{l}</Link>
          ))}
        </div>
        <span style={{ fontSize: 12, color: '#C8C8C8' }}>© 2026 GoNest</span>
      </div>
    </footer>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 11: components/property/PropertyCard.tsx
# ─────────────────────────────────────────────────────────────
cat > components/property/PropertyCard.tsx << 'EOF'
'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { formatPrice, bhkLabel } from '@/lib/format';
import { imgUrl } from '@/lib/api';
import type { ListingFull } from '@/lib/types';

type Props = { listing: ListingFull; isSaved?: boolean; onToggle?: (id: string) => void };

export function PropertyCard({ listing: l, isSaved, onToggle }: Props) {
  const imgs = [...(l.listing_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const src  = imgs[0] ? imgUrl(imgs[0].storage_path) : null;
  const loc  = l.listing_images as any;
  const city     = (l.city     as any)?.name ?? '';
  const locality = (l.locality as any)?.name ?? '';

  const badge =
    l.verification_level === 'platform_verified' ? 'GoNest Verified' :
    l.verification_level === 'verified'           ? 'Verified'        : null;

  const sub = l.bedrooms > 0
    ? `${bhkLabel(l.bedrooms, l.property_type)} ${l.property_type.charAt(0).toUpperCase() + l.property_type.slice(1)}`
    : l.property_type.charAt(0).toUpperCase() + l.property_type.slice(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Link href={`/property/${l.id}`} style={{ position: 'relative', display: 'block', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', background: '#F0F0F0' }}>
        {src
          ? <img src={src} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseOut={e  => (e.currentTarget.style.transform = 'scale(1)')} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#C8C8C8' }}>No photo</div>
        }
        {badge && (
          <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: '#111', padding: '3px 9px', borderRadius: 9999 }}>
            {badge}
          </span>
        )}
        {onToggle && (
          <button onClick={e => { e.preventDefault(); onToggle(l.id); }}
            style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
            <Heart size={14} fill={isSaved ? '#111' : 'none'} stroke="#111" />
          </button>
        )}
      </Link>
      <Link href={`/property/${l.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>{formatPrice(l.price, l.purpose)}</span>
        <span style={{ fontSize: 14, color: '#111' }}>{sub}</span>
        <span style={{ fontSize: 13, color: '#6B6B6B' }}>{locality}{locality && city ? ', ' : ''}{city}</span>
      </Link>
    </div>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 12: app/page.tsx  (Homepage)
# ─────────────────────────────────────────────────────────────
cat > app/page.tsx << 'EOF'
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getFeatured, getCities } from '@/lib/api';
import { HomeSearch } from './HomeSearch';

export default async function HomePage() {
  const [featured, cities] = await Promise.all([getFeatured(3), getCities()]);
  return (
    <>
      <Nav />
      <main>

        {/* ── Hero ── */}
        <section style={{ padding: '80px 24px 64px', textAlign: 'center' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 700, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 10 }}>
              Find your next home.
            </h1>
            <p style={{ fontSize: 15, color: '#6B6B6B', marginBottom: 28 }}>
              Search by city, locality or project.
            </p>
            <HomeSearch />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 14 }}>
              {[['Buy','/buy'],['Rent','/rent'],['New Projects','/projects']].map(([l,h]) => (
                <Link key={l} href={h} style={{ padding: '5px 14px', borderRadius: 9999, fontSize: 13, color: '#6B6B6B' }}>{l}</Link>
              ))}
            </div>
            {cities.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {cities.slice(0, 5).map(c => (
                  <Link key={c.id} href={`/search?city=${c.id}`}
                    style={{ padding: '5px 14px', borderRadius: 9999, fontSize: 12, color: '#6B6B6B', border: '1px solid #E5E5E5' }}>
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Featured ── */}
        {featured.length > 0 && (
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 72px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', letterSpacing: '-0.02em' }}>Featured Properties</h2>
              <Link href="/search" style={{ fontSize: 13, color: '#6B6B6B', textDecoration: 'underline' }}>View all</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '32px 20px' }}>
              {featured.map(l => <PropertyCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}

        {/* ── Categories ── */}
        <section style={{ background: '#F7F7F7', padding: '52px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', letterSpacing: '-0.02em', marginBottom: 20 }}>Explore by type</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
              {[['Apartments','apartment'],['Villas','villa'],['Houses','house'],['Plots','plot'],['Commercial','commercial']].map(([label,type]) => (
                <Link key={type} href={`/search?type=${type}`}
                  style={{ display: 'block', background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '18px 16px', fontSize: 14, fontWeight: 500, color: '#111' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why GoNest ── */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 40 }}>
            {[
              ['Verified Listings',     'Every property is checked before going live.'],
              ['Transparent Pricing',   'No hidden charges. What you see is what you pay.'],
              ['Trusted Professionals', 'Verified owners and agents only.'],
            ].map(([t,b]) => (
              <div key={t}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>{t}</h3>
                <p  style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.65 }}>{b}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 13: app/HomeSearch.tsx  (client search bar)
# ─────────────────────────────────────────────────────────────
cat > app/HomeSearch.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const go = () => router.push(q.trim() ? `/search?q=${encodeURIComponent(q)}` : '/search');
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E5E5', borderRadius: 9999, padding: '6px 6px 6px 16px', background: '#fff', maxWidth: 520, margin: '0 auto' }}>
      <Search size={15} color="#9B9B9B" style={{ flexShrink: 0 }} />
      <input type="text" placeholder="Search city, locality or project"
        value={q} onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && go()}
        style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, padding: '8px 10px', background: 'transparent', color: '#111' }} />
      <button onClick={go}
        style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 9999, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
        Search
      </button>
    </div>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 14: app/search/page.tsx
# ─────────────────────────────────────────────────────────────
cat > app/search/page.tsx << 'EOF'
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from './SearchResults';
import { getCities } from '@/lib/api';
export const metadata = { title: 'Search Properties' };
export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string,string>> }) {
  const sp = await searchParams;
  const cities = await getCities();
  return (<><Nav /><SearchResults cities={cities} init={sp} /><Footer /></>);
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 15: app/search/SearchResults.tsx
# ─────────────────────────────────────────────────────────────
cat > app/search/SearchResults.tsx << 'EOF'
'use client';
import { useState, useEffect, useCallback } from 'react';
import { PropertyCard } from '@/components/property/PropertyCard';
import { searchListings } from '@/lib/api';
import type { ListingFull, City } from '@/lib/types';

const S: React.CSSProperties = { padding: '8px 14px', borderRadius: 9999, fontSize: 13, color: '#111', border: '1px solid #E5E5E5', background: '#fff', cursor: 'pointer' };

export function SearchResults({ cities, init }: { cities: City[]; init: Record<string,string> }) {
  const [results, setResults] = useState<ListingFull[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({
    q:       init.q       ?? '',
    purpose: init.purpose ?? '',
    cityId:  init.city    ?? '',
    beds:    init.beds    ?? '',
    type:    init.type    ?? '',
    sort:    (init.sort   ?? 'newest') as 'newest'|'price_asc'|'price_desc',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await searchListings({ q: f.q||undefined, purpose: f.purpose||undefined, cityId: f.cityId||undefined, minBedrooms: f.beds ? Number(f.beds):undefined, propertyType: f.type||undefined, sort: f.sort });
      setResults(r.listings); setTotal(r.total);
    } finally { setLoading(false); }
  }, [f]);

  useEffect(() => { load(); }, [load]);
  const upd = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32, alignItems: 'center' }}>
        <select style={S} value={f.purpose} onChange={e => upd('purpose', e.target.value)}>
          <option value="">Buy or Rent</option>
          <option value="sale">Buy</option>
          <option value="rent">Rent</option>
        </select>
        <select style={S} value={f.cityId} onChange={e => upd('cityId', e.target.value)}>
          <option value="">Any city</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={S} value={f.beds} onChange={e => upd('beds', e.target.value)}>
          <option value="">Any BHK</option>
          {['1','2','3','4'].map(n => <option key={n} value={n}>{n}+ BHK</option>)}
        </select>
        <select style={S} value={f.type} onChange={e => upd('type', e.target.value)}>
          <option value="">Any type</option>
          {['apartment','villa','house','plot','commercial'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
        </select>
        <select style={S} value={f.sort} onChange={e => upd('sort', e.target.value as typeof f.sort)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6B6B6B' }}>
          {loading ? '…' : `${total} ${total===1?'property':'properties'}`}
        </span>
      </div>
      {!loading && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>No properties found</p>
          <p style={{ fontSize: 14, color: '#6B6B6B' }}>Try adjusting your filters.</p>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '36px 20px' }}>
        {results.map(l => <PropertyCard key={l.id} listing={l} />)}
      </div>
    </main>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 16: app/buy/page.tsx  app/rent/page.tsx  app/projects/page.tsx
# ─────────────────────────────────────────────────────────────
cat > app/buy/page.tsx << 'EOF'
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';
export const metadata = { title: 'Buy Property in Mumbai' };
export default async function BuyPage() {
  return (<><Nav /><SearchResults cities={await getCities()} init={{ purpose:'sale' }} /><Footer /></>);
}
EOF

cat > app/rent/page.tsx << 'EOF'
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';
export const metadata = { title: 'Rent Property in Mumbai' };
export default async function RentPage() {
  return (<><Nav /><SearchResults cities={await getCities()} init={{ purpose:'rent' }} /><Footer /></>);
}
EOF

cat > app/projects/page.tsx << 'EOF'
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '../search/SearchResults';
import { getCities } from '@/lib/api';
export const metadata = { title: 'New Projects in Mumbai' };
export default async function ProjectsPage() {
  return (<><Nav /><SearchResults cities={await getCities()} init={{ purpose:'sale', type:'apartment' }} /><Footer /></>);
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 17: app/property/[id]/page.tsx
# ─────────────────────────────────────────────────────────────
cat > "app/property/[id]/page.tsx" << 'EOF'
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import { getListingById, imgUrl } from '@/lib/api';
import { formatPrice, bhkLabel } from '@/lib/format';
import { ContactForms } from './ContactForms';

export async function generateMetadata({ params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const l = await getListingById(id);
  return { title: l?.title ?? 'Property' };
}

export default async function PropertyPage({ params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const l = await getListingById(id);
  if (!l) notFound();

  const imgs     = [...(l.listing_images ?? [])].sort((a,b) => a.sort_order - b.sort_order);
  const city     = (l.city     as any)?.name ?? '';
  const locality = (l.locality as any)?.name ?? '';
  const poster   = l.poster as any;
  const badge    = l.verification_level === 'platform_verified' ? 'GoNest Verified'
                 : l.verification_level === 'verified'           ? 'Verified' : null;
  const specs = [
    l.bedrooms  > 0  && `${bhkLabel(l.bedrooms, l.property_type)}`,
    l.bathrooms > 0  && `${l.bathrooms} bath`,
    l.sqft           && `${l.sqft.toLocaleString('en-IN')} ft²`,
    l.furnishing     && l.furnishing.replace('-',' '),
  ].filter(Boolean) as string[];

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Image */}
        {imgs[0] && (
          <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9', background: '#F0F0F0', marginBottom: 32 }}>
            <img src={imgUrl(imgs[0].storage_path)} alt={l.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
          <div>
            {badge && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: '#111', padding: '3px 10px', borderRadius: 9999, display: 'inline-block', marginBottom: 12 }}>
                {badge}
              </span>
            )}
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', marginBottom: 6 }}>{l.title}</h1>
            <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 20 }}>{locality}{locality&&city?', ':''}{city}</p>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111', marginBottom: 24 }}>
              {formatPrice(l.price, l.purpose)}
              {l.purpose==='rent' && l.security_deposit && (
                <span style={{ fontSize: 13, fontWeight: 400, color: '#6B6B6B', marginLeft: 10 }}>
                  + ₹{l.security_deposit.toLocaleString('en-IN')} deposit
                </span>
              )}
            </div>
            {specs.length > 0 && (
              <div style={{ display: 'flex', gap: 24, paddingBottom: 24, borderBottom: '1px solid #E5E5E5', marginBottom: 24 }}>
                {specs.map(s => (
                  <div key={s}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>{s}</div>
                  </div>
                ))}
              </div>
            )}
            {l.description && (
              <p style={{ fontSize: 14, color: '#3D3D3D', lineHeight: 1.75, marginBottom: 32 }}>{l.description}</p>
            )}
            {poster && (
              <div style={{ padding: 16, border: '1px solid #E5E5E5', borderRadius: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>
                  {poster.full_name ?? 'Agent'} · {poster.role === 'agent' ? 'Agent' : 'Owner'}
                </p>
                {poster.agency_name && <p style={{ fontSize: 12, color: '#6B6B6B' }}>{poster.agency_name}</p>}
              </div>
            )}
          </div>
          <ContactForms listingId={l.id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 18: app/property/[id]/ContactForms.tsx
# ─────────────────────────────────────────────────────────────
cat > "app/property/[id]/ContactForms.tsx" << 'EOF'
'use client';
import { useState } from 'react';
import { useAuth } from '@/components/layout/AuthProvider';
import { submitLead, submitVisit } from '@/lib/api';

const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', border:'1px solid #E5E5E5', borderRadius:10, fontSize:13, outline:'none' };
const btn: React.CSSProperties = { width:'100%', padding:'11px', borderRadius:9999, fontSize:14, fontWeight:600, cursor:'pointer', border:'none', background:'#111', color:'#fff' };

export function ContactForms({ listingId }: { listingId: string }) {
  const { user, profile } = useAuth();
  const [tab,     setTab]     = useState<'lead'|'visit'>('lead');
  const [name,    setName]    = useState(profile?.full_name ?? '');
  const [phone,   setPhone]   = useState(profile?.phone    ?? '');
  const [email,   setEmail]   = useState(user?.email       ?? '');
  const [message, setMessage] = useState('');
  const [date,    setDate]    = useState('');
  const [time,    setTime]    = useState('');
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState<string|null>(null);
  const [err,     setErr]     = useState<string|null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr(null);
    try {
      if (tab === 'lead') {
        await submitLead({ listing_id:listingId, buyer_id:user?.id??null, buyer_name:name, buyer_phone:phone, buyer_email:email||undefined, message:message||undefined });
        setDone('Enquiry sent. The owner will contact you shortly.');
      } else {
        await submitVisit({ listing_id:listingId, requested_by:user?.id??null, requester_name:name, requester_phone:phone, slot_date:date, slot_time:time, notes:notes||undefined });
        setDone('Visit requested. The owner will confirm your slot.');
      }
    } catch { setErr('Could not send. Please try again.'); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ border:'1px solid #E5E5E5', borderRadius:14, padding:20 }}>
      <p style={{ fontSize:14, color:'#16A34A', lineHeight:1.6 }}>{done}</p>
    </div>
  );

  return (
    <div style={{ border:'1px solid #E5E5E5', borderRadius:14, overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #E5E5E5' }}>
        {(['lead','visit'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'12px', fontSize:13, fontWeight:tab===t?600:400, color:tab===t?'#111':'#6B6B6B', background:tab===t?'#F7F7F7':'#fff', borderBottom:tab===t?'2px solid #111':'2px solid transparent' }}>
            {t === 'lead' ? 'Contact' : 'Book Visit'}
          </button>
        ))}
      </div>
      <form onSubmit={send} style={{ padding:16, display:'flex', flexDirection:'column', gap:10 }}>
        <input required placeholder="Your name"   value={name}  onChange={e=>setName(e.target.value)}  style={inp} />
        <input required placeholder="Phone"       value={phone} onChange={e=>setPhone(e.target.value)} style={inp} />
        {tab === 'lead' ? (
          <>
            <input placeholder="Email (optional)" value={email}   onChange={e=>setEmail(e.target.value)}   style={inp} />
            <textarea placeholder="Message (optional)" rows={3} value={message} onChange={e=>setMessage(e.target.value)} style={{ ...inp, resize:'none' }} />
          </>
        ) : (
          <>
            <input required type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp} min={new Date().toISOString().split('T')[0]} />
            <input required type="time" value={time} onChange={e=>setTime(e.target.value)} style={inp} />
            <textarea placeholder="Notes (optional)" rows={2} value={notes} onChange={e=>setNotes(e.target.value)} style={{ ...inp, resize:'none' }} />
          </>
        )}
        {err && <p style={{ fontSize:12, color:'#DC2626' }}>{err}</p>}
        <button type="submit" disabled={loading} style={{ ...btn, opacity:loading?0.6:1 }}>
          {loading ? 'Sending…' : tab==='lead' ? 'Send enquiry' : 'Request visit'}
        </button>
      </form>
    </div>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 19: app/saved/page.tsx
# ─────────────────────────────────────────────────────────────
cat > app/saved/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getSavedListings, toggleSaved, getSavedIds } from '@/lib/api';
import { useAuth } from '@/components/layout/AuthProvider';
import type { ListingFull } from '@/lib/types';
import Link from 'next/link';

export default function SavedPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingFull[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    getSavedListings(user.id).then(setListings);
    getSavedIds(user.id).then(setSavedIds);
  }, [user]);

  const toggle = async (id: string) => {
    if (!user) return;
    const isSaved = savedIds.has(id);
    setSavedIds(prev => { const n = new Set(prev); isSaved ? n.delete(id) : n.add(id); return n; });
    await toggleSaved(user.id, id, isSaved);
    if (isSaved) setListings(prev => prev.filter(l => l.id !== id));
  };

  return (
    <>
      <Nav />
      <main style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px 80px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#111', letterSpacing:'-0.02em', marginBottom:32 }}>Saved Homes</h1>
        {!user ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <p style={{ fontSize:15, color:'#6B6B6B', marginBottom:20 }}>Sign in to see your saved properties.</p>
            <Link href="/auth" style={{ padding:'10px 24px', borderRadius:9999, fontSize:14, fontWeight:600, color:'#fff', background:'#111', display:'inline-block' }}>Sign in</Link>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <p style={{ fontSize:15, color:'#6B6B6B' }}>No saved properties yet.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'36px 20px' }}>
            {listings.map(l => <PropertyCard key={l.id} listing={l} isSaved={savedIds.has(l.id)} onToggle={toggle} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 20: app/auth/page.tsx
# ─────────────────────────────────────────────────────────────
cat > app/auth/page.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ChevronLeft, Home, Building2, User } from 'lucide-react';

type Role = 'buyer'|'owner'|'agent';
const ROLES: { value: Role; label: string; desc: string }[] = [
  { value:'buyer', label:'Buyer / Tenant',   desc:"I'm looking for a property" },
  { value:'owner', label:'Property Owner',   desc:'I want to list my own property' },
  { value:'agent', label:'Agent / Broker',   desc:'I list properties professionally' },
];
const inp: React.CSSProperties = { width:'100%', padding:'11px 14px', border:'1px solid #E5E5E5', borderRadius:12, fontSize:14, outline:'none' };

export default function AuthPage() {
  const router = useRouter();
  const [mode,    setMode]    = useState<'password'|'magic'>('password');
  const [isSignUp,setIsSignUp]= useState(false);
  const [step,    setStep]    = useState<'role'|'form'>('role');
  const [role,    setRole]    = useState<Role>('buyer');
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState<{type:'ok'|'err'; text:string}|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        setMsg({ type:'ok', text:'Magic link sent — check your inbox.' });
      } else if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password, options:{ data:{ full_name:name } } });
        if (error) throw error;
        if (data.user) await supabase.from('profiles').update({ role, full_name:name }).eq('id', data.user.id);
        if (data.session) router.push('/dashboard');
        else setMsg({ type:'ok', text:'Check your email to confirm, then sign in.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err) {
      setMsg({ type:'err', text: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally { setLoading(false); }
  };

  /* Role picker */
  if (isSignUp && step === 'role') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <button onClick={() => router.push('/')} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#6B6B6B', marginBottom:32 }}>
          <ChevronLeft size={16} />Back
        </button>
        <h1 style={{ fontSize:24, fontWeight:700, color:'#111', letterSpacing:'-0.02em', marginBottom:6 }}>How will you use GoNest?</h1>
        <p style={{ fontSize:14, color:'#6B6B6B', marginBottom:28 }}>You can change this later.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {ROLES.map(r => (
            <button key={r.value} onClick={() => { setRole(r.value); setStep('form'); }}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:12, border:'1px solid #E5E5E5', textAlign:'left', background:'#fff' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'#F7F7F7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {r.value==='buyer' ? <User size={18}/> : r.value==='owner' ? <Home size={18}/> : <Building2 size={18}/>}
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'#111' }}>{r.label}</div>
                <div style={{ fontSize:12, color:'#6B6B6B' }}>{r.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => { setIsSignUp(false); setStep('role'); }}
          style={{ width:'100%', marginTop:20, fontSize:13, color:'#6B6B6B', textAlign:'center' }}>
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:360 }}>
        <button onClick={() => isSignUp ? setStep('role') : router.push('/')}
          style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#6B6B6B', marginBottom:32 }}>
          <ChevronLeft size={16} />Back
        </button>
        <h1 style={{ fontSize:24, fontWeight:700, color:'#111', letterSpacing:'-0.02em', marginBottom:6 }}>
          {mode==='magic' ? 'Sign in with email' : isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p style={{ fontSize:14, color:'#6B6B6B', marginBottom:28 }}>
          {mode==='magic' ? "We'll email you a secure link." : 'Sign in to save properties and manage listings.'}
        </p>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {isSignUp && mode==='password' && (
            <input required placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={inp} />
          )}
          <div style={{ position:'relative' }}>
            <Mail size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9B9B9B' }} />
            <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{ ...inp, paddingLeft:38 }} />
          </div>
          {mode==='password' && (
            <div style={{ position:'relative' }}>
              <Lock size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9B9B9B' }} />
              <input required type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{ ...inp, paddingLeft:38 }} />
            </div>
          )}
          {msg && (
            <div style={{ fontSize:13, padding:'10px 12px', borderRadius:10, background:msg.type==='ok'?'#F0FDF4':'#FEF2F2', color:msg.type==='ok'?'#16A34A':'#DC2626' }}>
              {msg.text}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{ padding:'12px', borderRadius:9999, fontSize:14, fontWeight:600, color:'#fff', background:'#111', border:'none', cursor:'pointer', marginTop:4, opacity:loading?0.6:1 }}>
            {loading ? 'Please wait…' : mode==='magic' ? 'Send magic link' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
          <div style={{ flex:1, height:1, background:'#E5E5E5' }} />
          <span style={{ fontSize:12, color:'#9B9B9B' }}>or</span>
          <div style={{ flex:1, height:1, background:'#E5E5E5' }} />
        </div>
        <button onClick={() => { setMode(m => m==='password'?'magic':'password'); setMsg(null); }}
          style={{ width:'100%', padding:'11px', borderRadius:9999, fontSize:13, fontWeight:500, color:'#111', border:'1px solid #111', background:'#fff' }}>
          {mode==='password' ? 'Continue with magic link' : 'Continue with password'}
        </button>
        {mode==='password' && !isSignUp && (
          <button onClick={() => { setIsSignUp(true); setStep('role'); }}
            style={{ width:'100%', marginTop:14, fontSize:13, color:'#6B6B6B', textAlign:'center' }}>
            Don't have an account? Sign up
          </button>
        )}
      </div>
    </div>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 21: app/dashboard/page.tsx
# ─────────────────────────────────────────────────────────────
cat > app/dashboard/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { getMyListings, getMyLeads, getMyVisits } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';

const STATUS_COLOR: Record<string,string> = { active:'#16A34A', pending_review:'#D97706', rejected:'#DC2626', draft:'#6B6B6B', archived:'#6B6B6B' };

export default function DashboardPage() {
  const router  = useRouter();
  const { user, profile, signOut, loading } = useAuth();
  const [tab,      setTab]     = useState<'listings'|'leads'|'visits'>('listings');
  const [listings, setListings] = useState<any[]>([]);
  const [leads,    setLeads]    = useState<any[]>([]);
  const [visits,   setVisits]   = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) router.push('/auth'); }, [loading, user, router]);
  useEffect(() => {
    if (!user) return;
    getMyListings(user.id).then(setListings);
    getMyLeads(user.id).then(setLeads);
    getMyVisits(user.id).then(setVisits);
  }, [user]);

  const canPost = ['owner','agent','admin'].includes(profile?.role ?? '');
  const tabStyle = (t: string): React.CSSProperties => ({
    padding:'8px 18px', borderRadius:9999, fontSize:13,
    fontWeight: tab===t ? 600 : 400,
    color: tab===t ? '#111' : '#6B6B6B',
    background: tab===t ? '#F7F7F7' : 'transparent',
    border: 'none', cursor: 'pointer',
  });

  return (
    <>
      <Nav />
      <main style={{ maxWidth:1000, margin:'0 auto', padding:'40px 24px 80px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:36 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#111', letterSpacing:'-0.02em', marginBottom:4 }}>Account</h1>
            <p style={{ fontSize:13, color:'#6B6B6B' }}>{user?.email} · {profile?.role ?? 'buyer'}</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {canPost && (
              <Link href="/dashboard/new"
                style={{ padding:'8px 18px', borderRadius:9999, fontSize:13, fontWeight:600, color:'#fff', background:'#111', display:'inline-flex', alignItems:'center', gap:6 }}>
                + New listing
              </Link>
            )}
            <button onClick={async () => { await signOut(); router.push('/'); }}
              style={{ padding:'8px 18px', borderRadius:9999, fontSize:13, color:'#111', border:'1px solid #111', background:'#fff' }}>
              Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:28 }}>
          {(['listings','leads','visits'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t==='leads'  && leads.length  > 0 && <span style={{ marginLeft:6, fontSize:11, background:'#111', color:'#fff', borderRadius:9999, padding:'1px 6px' }}>{leads.length}</span>}
              {t==='visits' && visits.length > 0 && <span style={{ marginLeft:6, fontSize:11, background:'#111', color:'#fff', borderRadius:9999, padding:'1px 6px' }}>{visits.length}</span>}
            </button>
          ))}
        </div>

        {/* Listings */}
        {tab === 'listings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {listings.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No listings yet.</p>}
            {listings.map((l: any) => (
              <div key={l.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', border:'1px solid #E5E5E5', borderRadius:12 }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111', marginBottom:2 }}>{l.title}</p>
                  <p style={{ fontSize:12, color:'#6B6B6B' }}>{formatPrice(l.price, l.purpose)}</p>
                </div>
                <span style={{ fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:9999, background: STATUS_COLOR[l.status]+'18', color: STATUS_COLOR[l.status] ?? '#6B6B6B' }}>
                  {l.status.replace('_',' ')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Leads */}
        {tab === 'leads' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {leads.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No leads yet.</p>}
            {leads.map((l: any) => (
              <div key={l.id} style={{ padding:'14px 16px', border:'1px solid #E5E5E5', borderRadius:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111' }}>{l.buyer_name}</p>
                  <span style={{ fontSize:11, color:'#6B6B6B' }}>{new Date(l.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                <p style={{ fontSize:13, color:'#6B6B6B' }}>{l.buyer_phone}</p>
                {l.message && <p style={{ fontSize:13, color:'#3D3D3D', marginTop:6 }}>{l.message}</p>}
                <p style={{ fontSize:12, color:'#9B9B9B', marginTop:4 }}>{l.listing?.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* Visits */}
        {tab === 'visits' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {visits.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No visit requests yet.</p>}
            {visits.map((v: any) => (
              <div key={v.id} style={{ padding:'14px 16px', border:'1px solid #E5E5E5', borderRadius:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111' }}>{v.requester_name}</p>
                  <span style={{ fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:9999, background: v.status==='confirmed'?'#F0FDF4':'#F7F7F7', color: v.status==='confirmed'?'#16A34A':'#6B6B6B' }}>
                    {v.status}
                  </span>
                </div>
                <p style={{ fontSize:13, color:'#6B6B6B' }}>{v.requester_phone}</p>
                <p style={{ fontSize:13, color:'#3D3D3D', marginTop:4 }}>
                  {v.slot_date} at {v.slot_time}
                </p>
                <p style={{ fontSize:12, color:'#9B9B9B', marginTop:4 }}>{v.listing?.title}</p>
              </div>
            ))}
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 22: app/dashboard/new/page.tsx  (Listing wizard)
# ─────────────────────────────────────────────────────────────
cat > app/dashboard/new/page.tsx << 'EOF'
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import { createListing, uploadImage, getCities, getLocalities } from '@/lib/api';
import { ChevronLeft, ChevronRight, Upload, X, Check } from 'lucide-react';

type City     = { id: string; name: string };
type Locality = { id: string; name: string };

const STEPS = ['Basics', 'Location', 'Price', 'Photos'] as const;
const inp: React.CSSProperties = { width:'100%', padding:'11px 14px', border:'1px solid #E5E5E5', borderRadius:12, fontSize:14, outline:'none', background:'#fff' };
const lbl: React.CSSProperties = { fontSize:13, fontWeight:600, color:'#111', marginBottom:6, display:'block' };

export default function NewListingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [step,  setStep]  = useState(0);
  const [cities,     setCities]     = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string|null>(null);

  const [f, setF] = useState({
    purpose:'sale', property_type:'apartment', title:'', description:'',
    bedrooms:1, bathrooms:1, sqft:'', furnishing:'',
    city_id:'', locality_id:'', address_line:'',
    price:'', maintenance_monthly:'', security_deposit:'',
  });

  useEffect(() => { getCities().then(c => setCities(c as City[])); }, []);
  useEffect(() => {
    if (!f.city_id) { setLocalities([]); return; }
    getLocalities(f.city_id).then(l => setLocalities(l as Locality[]));
  }, [f.city_id]);

  const upd = useCallback(<K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF(p => ({ ...p, [k]: v })), []);

  const canNext = () => {
    if (step === 0) return f.title.trim().length > 3;
    if (step === 1) return !!f.city_id && !!f.locality_id;
    if (step === 2) return !!f.price && Number(f.price) > 0;
    return true;
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImages(prev => [...prev, ...Array.from(e.target.files ?? [])].slice(0, 8));
  };

  const submit = async () => {
    if (!user) return;
    setSaving(true); setErr(null);
    try {
      const id = await createListing({
        posted_by: user.id,
        poster_type: profile?.role === 'agent' ? 'agent' : 'owner',
        title: f.title, description: f.description,
        property_type: f.property_type, purpose: f.purpose,
        city_id: f.city_id, locality_id: f.locality_id,
        address_line: f.address_line || null,
        price: Number(f.price),
        maintenance_monthly: f.maintenance_monthly ? Number(f.maintenance_monthly) : null,
        security_deposit: f.security_deposit ? Number(f.security_deposit) : null,
        bedrooms: f.bedrooms, bathrooms: f.bathrooms,
        sqft: f.sqft ? Number(f.sqft) : null,
        furnishing: f.furnishing || null,
      });
      for (let i = 0; i < images.length; i++) await uploadImage(user.id, id, images[i], i);
      router.push('/dashboard');
    } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#fff' }}>
      <div style={{ maxWidth:560, margin:'0 auto', padding:'40px 24px 80px' }}>

        <button onClick={() => router.push('/dashboard')}
          style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#6B6B6B', marginBottom:32 }}>
          <ChevronLeft size={16} />Cancel
        </button>

        {/* Progress */}
        <div style={{ display:'flex', gap:8, marginBottom:36 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex:1 }}>
              <div style={{ height:3, borderRadius:9999, background: i <= step ? '#111' : '#E5E5E5' }} />
              <div style={{ marginTop:6, fontSize:11, fontWeight: i===step ? 600 : 400, color: i<=step ? '#111' : '#9B9B9B' }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Step 0: Basics */}
        {step === 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <h1 style={{ fontSize:20, fontWeight:700, color:'#111' }}>Tell us about the property</h1>
            <div>
              <label style={lbl}>I want to</label>
              <div style={{ display:'flex', gap:8 }}>
                {(['sale','rent'] as const).map(p => (
                  <button key={p} onClick={() => upd('purpose', p)}
                    style={{ flex:1, padding:'10px', borderRadius:9999, fontSize:13, fontWeight:500, border: f.purpose===p ? '1.5px solid #111' : '1px solid #E5E5E5', background: f.purpose===p ? '#F7F7F7' : '#fff', color:'#111' }}>
                    {p === 'sale' ? 'Sell' : 'Rent out'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Property type</label>
              <select value={f.property_type} onChange={e => upd('property_type', e.target.value)} style={inp}>
                {['apartment','villa','house','plot','commercial'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Title</label>
              <input placeholder="e.g. Spacious 2BHK near metro" value={f.title} onChange={e => upd('title', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Description</label>
              <textarea rows={4} placeholder="Describe the property…" value={f.description} onChange={e => upd('description', e.target.value)} style={{ ...inp, resize:'vertical' }} />
            </div>
            {f.property_type !== 'plot' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={lbl}>Bedrooms</label><input type="number" min={0} value={f.bedrooms} onChange={e => upd('bedrooms', Number(e.target.value))} style={inp} /></div>
                <div><label style={lbl}>Bathrooms</label><input type="number" min={0} value={f.bathrooms} onChange={e => upd('bathrooms', Number(e.target.value))} style={inp} /></div>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lbl}>Area (sqft)</label><input type="number" min={0} placeholder="980" value={f.sqft} onChange={e => upd('sqft', e.target.value)} style={inp} /></div>
              <div>
                <label style={lbl}>Furnishing</label>
                <select value={f.furnishing} onChange={e => upd('furnishing', e.target.value)} style={inp}>
                  <option value="">Select</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-furnished</option>
                  <option value="fully-furnished">Fully-furnished</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <h1 style={{ fontSize:20, fontWeight:700, color:'#111' }}>Where is it located?</h1>
            <div>
              <label style={lbl}>City</label>
              <select value={f.city_id} onChange={e => { upd('city_id', e.target.value); upd('locality_id', ''); }} style={inp}>
                <option value="">Select a city</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Locality</label>
              <select value={f.locality_id} onChange={e => upd('locality_id', e.target.value)} style={inp} disabled={!f.city_id}>
                <option value="">{f.city_id ? 'Select a locality' : 'Select city first'}</option>
                {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Address <span style={{ color:'#9B9B9B', fontWeight:400 }}>(optional, only shown to interested leads)</span></label>
              <input placeholder="Building name, street" value={f.address_line} onChange={e => upd('address_line', e.target.value)} style={inp} />
            </div>
          </div>
        )}

        {/* Step 2: Price */}
        {step === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <h1 style={{ fontSize:20, fontWeight:700, color:'#111' }}>Set your price</h1>
            <div>
              <label style={lbl}>{f.purpose === 'rent' ? 'Monthly rent (₹)' : 'Sale price (₹)'}</label>
              <input type="number" min={0} placeholder={f.purpose==='rent'?'45000':'12500000'} value={f.price} onChange={e => upd('price', e.target.value)} style={inp} />
            </div>
            {f.purpose === 'rent' ? (
              <div>
                <label style={lbl}>Security deposit (₹) <span style={{ color:'#9B9B9B', fontWeight:400 }}>optional</span></label>
                <input type="number" min={0} placeholder="90000" value={f.security_deposit} onChange={e => upd('security_deposit', e.target.value)} style={inp} />
              </div>
            ) : (
              <div>
                <label style={lbl}>Monthly maintenance (₹) <span style={{ color:'#9B9B9B', fontWeight:400 }}>optional</span></label>
                <input type="number" min={0} placeholder="3500" value={f.maintenance_monthly} onChange={e => upd('maintenance_monthly', e.target.value)} style={inp} />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <h1 style={{ fontSize:20, fontWeight:700, color:'#111' }}>Add photos</h1>
            <p style={{ fontSize:13, color:'#6B6B6B' }}>Listings with photos get far more interest. Up to 8 photos.</p>
            <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, padding:'40px 24px', border:'1.5px dashed #E5E5E5', borderRadius:12, cursor:'pointer' }}>
              <Upload size={20} color="#9B9B9B" />
              <span style={{ fontSize:13, color:'#6B6B6B' }}>Click to upload</span>
              <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display:'none' }} />
            </label>
            {images.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {images.map((file, i) => (
                  <div key={i} style={{ position:'relative', borderRadius:8, overflow:'hidden', aspectRatio:'1/1', background:'#F0F0F0' }}>
                    <img src={URL.createObjectURL(file)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <button onClick={() => setImages(p => p.filter((_,j) => j!==i))}
                      style={{ position:'absolute', top:4, right:4, width:20, height:20, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', border:'none' }}>
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {err && <p style={{ fontSize:13, color:'#DC2626', marginTop:16 }}>{err}</p>}

        {/* Nav */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:36 }}>
          <button onClick={() => setStep(i => Math.max(0, i-1))} disabled={step===0}
            style={{ padding:'10px 20px', borderRadius:9999, fontSize:13, fontWeight:500, border:'1px solid #E5E5E5', color:'#111', opacity:step===0?0:1 }}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => canNext() && setStep(i => i+1)} disabled={!canNext()}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 22px', borderRadius:9999, fontSize:13, fontWeight:600, color:'#fff', background:'#111', border:'none', opacity:canNext()?1:0.4, cursor:canNext()?'pointer':'not-allowed' }}>
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={submit} disabled={saving}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 22px', borderRadius:9999, fontSize:13, fontWeight:600, color:'#fff', background:'#111', border:'none', opacity:saving?0.6:1 }}>
              {saving ? 'Submitting…' : <><Check size={15} />Submit for review</>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 23: app/admin/page.tsx
# ─────────────────────────────────────────────────────────────
cat > app/admin/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { adminGetPending, adminGetBrokers, adminGetLeads, adminModerate, adminVerifyAgent, adminSetRole } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { imgUrl } from '@/lib/api';

const TAB = ['listings','brokers','leads'] as const;
const btn = (color='#111'): React.CSSProperties => ({
  padding:'6px 14px', borderRadius:9999, fontSize:12, fontWeight:600, color:'#fff', background:color, border:'none', cursor:'pointer',
});

export default function AdminPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [tab,      setTab]      = useState<typeof TAB[number]>('listings');
  const [listings, setListings] = useState<any[]>([]);
  const [brokers,  setBrokers]  = useState<any[]>([]);
  const [leads,    setLeads]    = useState<any[]>([]);
  const [reason,   setReason]   = useState<Record<string,string>>({});

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') router.push('/');
  }, [loading, profile, router]);

  useEffect(() => {
    adminGetPending().then(setListings);
    adminGetBrokers().then(setBrokers);
    adminGetLeads().then(setLeads);
  }, []);

  const moderate = async (id: string, status: string, vLevel: string, rej?: string) => {
    await adminModerate(id, status, vLevel, rej);
    setListings(p => p.filter(l => l.id !== id));
  };

  const tabS = (t: string): React.CSSProperties => ({
    padding:'7px 18px', borderRadius:9999, fontSize:13,
    fontWeight: tab===t ? 600 : 400, color: tab===t ? '#111' : '#6B6B6B',
    background: tab===t ? '#F7F7F7' : 'transparent', border:'none', cursor:'pointer',
  });

  return (
    <>
      <Nav />
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'40px 24px 80px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#111', marginBottom:32 }}>Admin Panel</h1>

        <div style={{ display:'flex', gap:4, marginBottom:28 }}>
          {TAB.map(t => <button key={t} onClick={() => setTab(t)} style={tabS(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
        </div>

        {/* Pending Listings */}
        {tab === 'listings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {listings.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No listings pending review.</p>}
            {listings.map((l: any) => {
              const imgs = [...(l.listing_images??[])].sort((a:any,b:any) => a.sort_order - b.sort_order);
              const src  = imgs[0] ? imgUrl(imgs[0].storage_path) : null;
              const city = l.city?.name ?? '';
              const loc  = l.locality?.name ?? '';
              return (
                <div key={l.id} style={{ display:'flex', gap:14, padding:16, border:'1px solid #E5E5E5', borderRadius:12, alignItems:'flex-start' }}>
                  {src && <img src={src} alt="" style={{ width:80, height:60, borderRadius:8, objectFit:'cover', flexShrink:0 }} />}
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:'#111', marginBottom:2 }}>{l.title}</p>
                    <p style={{ fontSize:13, color:'#6B6B6B', marginBottom:2 }}>{loc}{loc&&city?', ':''}{city} · {formatPrice(l.price, l.purpose)}</p>
                    <p style={{ fontSize:12, color:'#9B9B9B' }}>by {l.poster?.full_name ?? '—'} ({l.poster?.role})</p>
                    <div style={{ marginTop:10, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                      <button onClick={() => moderate(l.id,'active','verified')} style={btn('#16A34A')}>✓ Approve (Verified)</button>
                      <button onClick={() => moderate(l.id,'active','platform_verified')} style={btn('#111')}>★ Platform Verified</button>
                      <div style={{ display:'flex', gap:6 }}>
                        <input placeholder="Rejection reason" value={reason[l.id]??''} onChange={e => setReason(p=>({...p,[l.id]:e.target.value}))}
                          style={{ padding:'5px 10px', border:'1px solid #E5E5E5', borderRadius:8, fontSize:12, outline:'none', width:200 }} />
                        <button onClick={() => moderate(l.id,'rejected','unverified',reason[l.id])} style={btn('#DC2626')}>✗ Reject</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Brokers */}
        {tab === 'brokers' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {brokers.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No agents or owners yet.</p>}
            {brokers.map((b: any) => (
              <div key={b.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', border:'1px solid #E5E5E5', borderRadius:12 }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111', marginBottom:2 }}>{b.full_name ?? '—'}</p>
                  <p style={{ fontSize:12, color:'#6B6B6B' }}>{b.role} · {b.agent_verified ? '✓ Verified' : 'Unverified'}</p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => adminVerifyAgent(b.id, !b.agent_verified).then(() => adminGetBrokers().then(setBrokers))}
                    style={btn(b.agent_verified ? '#6B6B6B' : '#16A34A')}>
                    {b.agent_verified ? 'Unverify' : 'Verify'}
                  </button>
                  <select defaultValue={b.role} onChange={e => adminSetRole(b.id, e.target.value).then(() => adminGetBrokers().then(setBrokers))}
                    style={{ padding:'5px 10px', border:'1px solid #E5E5E5', borderRadius:8, fontSize:12 }}>
                    {['buyer','owner','agent','admin'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leads */}
        {tab === 'leads' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {leads.length === 0 && <p style={{ fontSize:14, color:'#6B6B6B' }}>No leads yet.</p>}
            {leads.map((l: any) => (
              <div key={l.id} style={{ padding:'14px 16px', border:'1px solid #E5E5E5', borderRadius:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111' }}>{l.buyer_name} — {l.buyer_phone}</p>
                  <span style={{ fontSize:11, color:'#9B9B9B' }}>{new Date(l.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                {l.message && <p style={{ fontSize:13, color:'#3D3D3D', marginBottom:4 }}>{l.message}</p>}
                <p style={{ fontSize:12, color:'#9B9B9B' }}>{l.listing?.title}</p>
              </div>
            ))}
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
EOF


# ─────────────────────────────────────────────────────────────
# STEP 24: .npmrc + .env.local reminder
# ─────────────────────────────────────────────────────────────
echo "legacy-peer-deps=true" > .npmrc

echo ""
echo "============================================"
echo "All files written. Now run:"
echo ""
echo "  npm install"
echo "  npm run build"
echo ""
echo "Make sure .env.local has:"
echo "  NEXT_PUBLIC_SUPABASE_URL=..."
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
echo "============================================"
