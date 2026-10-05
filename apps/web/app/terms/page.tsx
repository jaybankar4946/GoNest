import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
export const metadata = { title: 'Terms of Use' };
export default function Page() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-manrope), var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Terms of Use</h1>
        <p style={{ fontSize: 12, color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '8px 12px', marginBottom: 24 }}>Draft for launch. Have this reviewed by a lawyer familiar with Indian law before relying on it.</p>
        <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }} className="legal"><>
<h2>Our role</h2><p>GoNest is a platform that lets owners and agents list properties and lets people search and enquire. GoNest is not a party to any sale or rental agreement between users.</p>
<h2>Listings and accuracy</h2><p>Listings are submitted by users. We review listings before they appear, but we do not guarantee that every detail (price, area, availability, documents) is accurate. Always verify the property, ownership and paperwork yourself before paying any money.</p>
<h2>Verification badges</h2><p>A "Verified" badge means the listing passed GoNest's review at the time shown. It is not a legal guarantee of title or ownership.</p>
<h2>Your responsibilities</h2><p>Post only properties you are authorised to list, with truthful information and your own photos. Do not post duplicates, misleading prices, or offensive content. Do not misuse enquiry details or contact people for unrelated purposes.</p>
<h2>Removal and suspension</h2><p>We may reject, remove or suspend listings and accounts that break these terms or appear fraudulent.</p>
<h2>Liability</h2><p>To the extent permitted by law, GoNest is not liable for losses arising from dealings between users or from reliance on listing information.</p>
<h2>Changes</h2><p>We may update these terms and will post the new version on this page.</p>
</></div>
      </main>
      <Footer />
    </>
  );
}
