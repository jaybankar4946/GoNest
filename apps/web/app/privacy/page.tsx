import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
export const metadata = { title: 'Privacy Policy' };
export default function Page() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-manrope), var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 12, color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '8px 12px', marginBottom: 24 }}>Draft for launch. Have this reviewed by a lawyer familiar with Indian law before relying on it.</p>
        <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }} className="legal"><>
<h2>What we collect</h2><p>Account details (name, email, phone), the property listings you post, photos you upload, and the enquiries and visit requests you send (name, phone, email, message). We also keep basic technical logs for security.</p>
<h2>How we use it</h2><p>To run the marketplace: show listings, pass your enquiry to the property owner or agent you contacted, let owners manage listings, review listings for quality, and prevent spam and fraud.</p>
<h2>Who sees it</h2><p>When you send an enquiry or visit request, the owner or agent of that listing sees your name and contact details. Listing owners' names, agency and public contact options appear on their listings. We do not sell your personal data.</p>
<h2>Where it is stored</h2><p>Data is stored with our infrastructure providers (Supabase for database, authentication and file storage; Vercel for hosting).</p>
<h2>Your choices</h2><p>You can edit your profile and listings from your dashboard. To request deletion of your account and data, contact us using the details on this site's support page.</p>
<h2>Retention</h2><p>We keep account and listing data while your account is active and enquiry records for as long as needed to operate the service and meet legal obligations.</p>
<h2>Changes</h2><p>We may update this policy and will post the new version on this page.</p>
</></div>
      </main>
      <Footer />
    </>
  );
}
