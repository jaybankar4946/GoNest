import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import { getListingById, getSimilarListings, imgUrl } from '@/lib/api';
import { formatPrice, bhkLabel, capitalize } from '@/lib/format';
import { PropertyCard } from '@/components/property/PropertyCard';
import { ImageCarousel } from '@/components/property/ImageCarousel';
import { ContactForms } from './ContactForms';
import { ReviewsAndReport } from './ReviewsAndReport';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{id:string}> }): Promise<Metadata> {
  const { id } = await params;
  const l = await getListingById(id);
  if (!l) return { title: 'Property not found' };
  const city = (l.city as any)?.name ?? '';
  return {
    title: l.title,
    description: `${bhkLabel(l.bedrooms,l.property_type)} ${capitalize(l.property_type)} for ${l.purpose==='sale'?'sale':'rent'} in ${city}. ${formatPrice(l.price,l.purpose)}.`,
    openGraph: {
      title: l.title,
      description: l.description ?? '',
      images: l.listing_images[0] ? [imgUrl(l.listing_images[0].storage_path)] : [],
    },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const l = await getListingById(id);
  if (!l) notFound();

  const similar  = await getSimilarListings(l, 3);
  const imgs     = [...(l.listing_images??[])].sort((a,b)=>a.sort_order-b.sort_order);
  const city     = (l.city     as any)?.name ?? '';
  const locality = (l.locality as any)?.name ?? '';
  const poster   = l.poster as any;

  const badge = l.verification_level==='platform_verified' ? { label: 'GoNest Verified', bg: 'var(--primary)' }
              : l.verification_level==='verified'           ? { label: 'Verified', bg: 'var(--ink-soft)' } : null;

  const specs = [
    l.bedrooms  > 0 && `${bhkLabel(l.bedrooms,l.property_type)}`,
    l.bathrooms > 0 && `${l.bathrooms} bath`,
    l.sqft          && `${l.sqft.toLocaleString('en-IN')} ft²`,
    l.furnishing    && l.furnishing.replace('-',' '),
    l.floor_number  && `Floor ${l.floor_number}${l.total_floors ? '/' + l.total_floors : ''}`,
    l.facing        && `${capitalize(l.facing)} facing`,
  ].filter(Boolean) as string[];

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--space-5) var(--space-4) var(--space-8)' }}>
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <ImageCarousel images={imgs} urlFor={imgUrl} alt={l.title} />
        </div>

        {imgs.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
            {imgs.slice(0,6).map(img => (
              <div key={img.id} style={{ width: 104, height: 72, flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface-3)' }}>
                <img src={imgUrl(img.storage_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-7)', alignItems: 'start' }}>
          <div>
            {badge && (
              <span style={{
                fontSize: 'var(--text-xs)', fontWeight: 600, color: '#fff', background: badge.bg,
                padding: '4px 12px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginBottom: 'var(--space-3)',
              }}>
                {badge.label}
              </span>
            )}
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 6 }}>
              {l.title}
            </h1>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-soft)', marginBottom: 'var(--space-4)' }}>
              {locality}{locality&&city?', ':''}{city}
            </p>

            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 6 }}>
              {formatPrice(l.price,l.purpose)}
              {l.purpose==='rent' && l.security_deposit && (
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--ink-faint)', marginLeft: 10 }}>
                  + ₹{l.security_deposit.toLocaleString('en-IN')} deposit
                </span>
              )}
            </div>
            {l.price_negotiable && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)', marginBottom: 'var(--space-5)' }}>Price negotiable</p>}

            {specs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', marginBottom: 'var(--space-4)' }}>
                {specs.map(s => (
                  <div key={s} style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink)' }}>{s}</div>
                ))}
              </div>
            )}

            {l.description && <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-soft)', lineHeight: 1.75, marginBottom: 'var(--space-5)' }}>{l.description}</p>}

            {l.landmark && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-soft)', marginBottom: 'var(--space-4)' }}>
                <strong style={{ color: 'var(--ink)' }}>Landmark:</strong> {l.landmark}
              </p>
            )}

            {poster?.phone && (
              <a href={`https://wa.me/91${poster.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi, I'm interested in: ${l.title}`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-sm)', fontWeight: 600, color: '#fff', background: '#25D366', marginBottom: 'var(--space-4)',
                }}>
                WhatsApp Owner
              </a>
            )}

            {poster && (
              <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
                  {poster.full_name ?? 'Agent'} · {poster.role==='agent' ? 'Agent' : 'Owner'}
                </p>
                {poster.agency_name && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-soft)' }}>{poster.agency_name}</p>}
                {poster.agent_verified && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', marginTop: 4 }}>✓ GoNest verified agent</p>}
                {poster.rera_number && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-soft)' }}>RERA: {poster.rera_number}</p>}
              </div>
            )}
          </div>

          <ContactForms listingId={l.id} />
        </div>

        <ReviewsAndReport listingId={l.id} />

        {similar.length > 0 && (
          <div style={{ marginTop: 'var(--space-7)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--ink)', marginBottom: 'var(--space-5)', letterSpacing: '-0.01em' }}>
              Similar properties
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 'var(--space-5) var(--space-4)' }}>
              {similar.map(s=><PropertyCard key={s.id} listing={s} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
