import { MapPin, BedDouble, Bath, Ruler } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type Rental = {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number | null;
  sqft: number | null;
  neighbourhood: string | null;
  pincode: string | null;
  furnishing: string | null;
  status: string;
};

const money = (value: number) => '₹' + Number(value).toLocaleString('en-IN');
const furnishingLabel = (value: string | null) => value ? value.replace(/-/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase()) : null;

function RentalCard({ listing }: { listing: Rental }) {
  const projectName = listing.title.replace(/^V\\. Capital Realty · /, '');
  return (
    <article style={{ display: 'block', borderRadius: 24, overflow: 'hidden', background: '#fff', border: '1px solid #F3F4F6', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--gray-1)', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--gray-3)' }}>No photo</div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 40%, transparent 65%, rgba(0,0,0,0.28) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.96)', padding: '5px 12px', borderRadius: 10, boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#111' }}>{money(listing.price)}<span style={{fontSize:11,fontWeight:500}}> /mo</span></span>
        </div>
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E', background: '#FEF3C7', padding: '4px 10px', borderRadius: 9999 }}>Preview · Pending review</span>
        </div>
      </div>
      <div style={{ padding: '14px 14px 16px' }}>
        <h3 className="line-clamp-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: '#111', marginBottom: 4 }}>{projectName}</h3>
        <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{listing.bedrooms > 0 ? listing.bedrooms + ' BHK' : 'Configuration not provided'}{furnishingLabel(listing.furnishing) ? ' · ' + furnishingLabel(listing.furnishing) : ''}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <MapPin size={12} color="var(--gray-3)" />
          <span style={{ fontSize: 13, color: 'var(--gray-4)' }} className="line-clamp-1">{listing.neighbourhood ?? 'Thane'}{listing.pincode ? ', ' + listing.pincode : ''}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {listing.bedrooms > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151' }}><BedDouble size={13} color="var(--gray-3)" /> {listing.bedrooms}</span>}
          {listing.bathrooms != null && listing.bathrooms > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151' }}><Bath size={13} color="var(--gray-3)" /> {listing.bathrooms}</span>}
          {listing.sqft != null && listing.sqft > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151' }}><Ruler size={13} color="var(--gray-3)" /> {listing.sqft.toLocaleString('en-IN')} ft²</span>}
        </div>
      </div>
    </article>
  );
}

export default async function VCapitalThaneRentalsPreview() {
  const { data, error } = await supabase
    .from('gonest_preview_vcapital_rentals')
    .select('id,title,price,bedrooms,bathrooms,sqft,neighbourhood,pincode,furnishing,status')
    .eq('status', 'pending_review')
    .order('price', { ascending: true });

  const listings = (data ?? []) as Rental[];

  return (
    <>
      <Nav />
      <main style={{ background: '#F9FAFB', minHeight: '70vh', maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#111', margin: 0 }}>V. Capital Realty · Thane rentals</h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '7px 0 0' }}>Same GoNest rental card format · preview only · listings remain pending review</p>
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>{listings.length} properties</div>
        </div>
        {error ? <p style={{ color: '#991B1B', fontSize: 13 }}>Could not load the preview listings.</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {listings.map(listing => <RentalCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
