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
