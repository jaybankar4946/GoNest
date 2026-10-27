import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Building2, KeyRound, Users, ClipboardCheck, ArrowRight, ShieldCheck } from 'lucide-react';

const roles = [
  {
    role: 'owner',
    title: 'I own a property',
    detail: 'Create a rental or resale listing, add photos and update availability from your account.',
    action: 'List my property',
    icon: KeyRound,
  },
  {
    role: 'agent',
    title: 'I am an agent or broker',
    detail: 'Build your professional profile and manage rental and resale inventory in one dashboard.',
    action: 'Register as an agent',
    icon: Users,
  },
  {
    role: 'builder',
    title: 'I represent a developer',
    detail: 'Submit projects, project photos and available configurations for review.',
    action: 'Register as a builder',
    icon: Building2,
  },
];

export default function ListWithGoNestPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '56px 24px 80px' }}>
        <section style={{ maxWidth: 760, margin: '0 auto 36px', textAlign: 'center' }}>
          <p style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>GoNest supply onboarding</p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.08, letterSpacing: '-.04em', fontWeight: 800, color: '#111827', margin: '0 0 16px' }}>Bring your property inventory to GoNest</h1>
          <p style={{ color: '#5B6472', fontSize: 17, lineHeight: 1.7, margin: '0 auto', maxWidth: 650 }}>Create one account, choose your role and manage submissions from your dashboard. Start with Mumbai and Pune; every new submission is reviewed before it can be shown as approved inventory.</p>
        </section>

        <section aria-label="Choose supplier account type" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {roles.map(({ role, title, detail, action, icon: Icon }) => (
            <article key={role} style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 24, background: '#fff', display: 'flex', flexDirection: 'column', minHeight: 260, boxShadow: '0 8px 28px rgba(15,23,42,.04)' }}>
              <div style={{ width: 46, height: 46, display: 'grid', placeItems: 'center', borderRadius: 14, background: '#EEF2FF', color: 'var(--primary)', marginBottom: 20 }}><Icon size={22} /></div>
              <h2 style={{ fontSize: 20, fontWeight: 750, color: '#111827', margin: '0 0 10px' }}>{title}</h2>
              <p style={{ color: '#5B6472', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px', flex: 1 }}>{detail}</p>
              <Link href={`/auth?mode=signup&next=${encodeURIComponent('/dashboard/supply?role=' + role)}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderRadius: 12, padding: '12px 14px', background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                {action}<ArrowRight size={17} />
              </Link>
            </article>
          ))}
        </section>

        <section style={{ marginTop: 28, border: '1px solid #E5E7EB', borderRadius: 18, padding: 22, background: '#F9FAFB', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <ShieldCheck size={22} color="#047857" />
            <div><h3 style={{ margin: '0 0 5px', color: '#111827', fontSize: 15, fontWeight: 750 }}>Review before publishing</h3><p style={{ margin: 0, color: '#5B6472', fontSize: 13, lineHeight: 1.6 }}>Submissions stay pending until reviewed. A demo submission is never represented as verified or live.</p></div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <ClipboardCheck size={22} color="#1D4ED8" />
            <div><h3 style={{ margin: '0 0 5px', color: '#111827', fontSize: 15, fontWeight: 750 }}>Manage from one dashboard</h3><p style={{ margin: 0, color: '#5B6472', fontSize: 13, lineHeight: 1.6 }}>Return to edit submissions, update availability and review enquiries after signing in.</p></div>
          </div>
        </section>

        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, marginTop: 28 }}>Already registered? <Link href="/auth" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>Sign in to your account</Link></p>
      </main>
      <Footer />
    </>
  );
}
