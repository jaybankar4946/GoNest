'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BellRing, CalendarDays, CheckCircle2, Heart, House, MapPin, MessageSquare, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getSavedListings, getSavedIds, getMyEnquiries, getMyVisitRequests, getSavedSearches, type SavedSearch } from '@/lib/api';

type Activity = { id: string; status: string; created_at?: string; slot_date?: string; slot_time?: string; listing?: { id?: string; title?: string; locality?: { name?: string } | null } | null };
const card: React.CSSProperties = { border: '1px solid #E5E7EB', borderRadius: 18, background: '#fff' };
const linkCard: React.CSSProperties = { ...card, padding: 18, display: 'flex', alignItems: 'flex-start', gap: 12, color: '#111827' };
const muted: React.CSSProperties = { color: '#6B7280', fontSize: 13, lineHeight: 1.55 };

export function CustomerDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [enquiries, setEnquiries] = useState<Activity[]>([]);
  const [visits, setVisits] = useState<Activity[]>([]);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [busy, setBusy] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth?next=/dashboard'); return; }
    let cancelled = false;
    setBusy(true);
    Promise.allSettled([
      getSavedListings(user.id),
      getSavedIds(user.id),
      getMyEnquiries(user.id),
      getMyVisitRequests(user.id),
      getSavedSearches(),
    ]).then(results => {
      if (cancelled) return;
      const [homes, ids, messages, bookings, savedSearches] = results;
      if (homes.status === 'fulfilled') setSaved(homes.value); else setLoadError(true);
      if (ids.status === 'fulfilled') setSavedIds(ids.value);
      if (messages.status === 'fulfilled') setEnquiries(messages.value as Activity[]); else setLoadError(true);
      if (bookings.status === 'fulfilled') setVisits(bookings.value as Activity[]); else setLoadError(true);
      if (savedSearches.status === 'fulfilled') setSearches(savedSearches.value); else setLoadError(true);
      setBusy(false);
    });
    return () => { cancelled = true; };
  }, [user, loading, router]);

  const upcoming = visits.filter(v => ['requested', 'confirmed'].includes(v.status) && (!v.slot_date || v.slot_date >= new Date().toISOString().slice(0, 10))).length;
  const firstName = profile?.full_name?.trim().split(/\\s+/)[0] || 'there';
  const toggleSaved = async (_id: string) => { router.push('/saved'); };

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 20px 96px', minHeight: '65vh' }}>
        <section style={{ ...card, padding: 'clamp(20px,4vw,34px)', background: 'linear-gradient(135deg,#F7F8F5 0%,#F0F5F1 100%)', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 620 }}>
              <p style={{ color: '#52735E', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10 }}>YOUR GONEST</p>
              <h1 style={{ fontSize: 'clamp(27px,4vw,38px)', fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.12, color: '#15251B', marginBottom: 10 }}>A better way to find your next home{profile?.full_name ? ', ' + firstName : ''}.</h1>
              <p style={{ ...muted, maxWidth: 540, fontSize: 14 }}>Keep your shortlist, saved searches, enquiries and property visits together—so your next step is always clear.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
                <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 12, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 700 }}><Search size={16} /> Explore homes</Link>
                <Link href="/saved" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 15px', borderRadius: 12, border: '1px solid #D1D9D2', background: '#fff', color: '#15251B', fontSize: 13, fontWeight: 700 }}><Heart size={16} /> Saved homes</Link>
              </div>
            </div>
            <div aria-hidden="true" style={{ width: 74, height: 74, flexShrink: 0, borderRadius: 24, display: 'grid', placeItems: 'center', background: '#E1EBE2', color: '#28563B' }}><House size={34} strokeWidth={1.7} /></div>
          </div>
        </section>

        <section aria-label="Your home search summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(145px,1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Saved homes', value: saved.length, icon: Heart, href: '/saved' },
            { label: 'Saved searches', value: searches.length, icon: SlidersHorizontal, href: '/saved-searches' },
            { label: 'My enquiries', value: enquiries.length, icon: MessageSquare, href: '/enquiries' },
            { label: 'Upcoming visits', value: upcoming, icon: CalendarDays, href: '/enquiries' },
          ].map(item => {
            const Icon = item.icon;
            return <Link key={item.label} href={item.href} style={{ ...card, padding: '16px 18px', color: '#111827', transition: 'border-color .15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>{item.label}</span><Icon size={17} color="var(--primary)" /></div>
              <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 800, letterSpacing: '-.03em' }}>{busy ? '—' : item.value}</div>
            </Link>;
          })}
        </section>

        <section style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 12, marginBottom: 13 }}>
            <div><h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em', color: '#111827' }}>Your home-search shortcuts</h2><p style={{ ...muted, marginTop: 4 }}>Pick up right where you left off.</p></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(225px,1fr))', gap: 12 }}>
            <Link href="/saved" style={linkCard}><span style={{ background: '#FCE7F3', color: '#9D174D', borderRadius: 12, padding: 10 }}><Heart size={20} /></span><span style={{ flex: 1 }}><strong style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Saved homes</strong><span style={muted}>Compare the properties you’re considering.</span><span style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, fontSize: 12, fontWeight: 700 }}>Open shortlist <ArrowRight size={14} /></span></span></Link>
            <Link href="/saved-searches" style={linkCard}><span style={{ background: '#DBEAFE', color: '#1D4ED8', borderRadius: 12, padding: 10 }}><SlidersHorizontal size={20} /></span><span style={{ flex: 1 }}><strong style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Saved searches & alerts</strong><span style={muted}>Keep preferred budgets and localities handy.</span><span style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, fontSize: 12, fontWeight: 700 }}>Manage searches <ArrowRight size={14} /></span></span></Link>
            <Link href="/enquiries" style={linkCard}><span style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 12, padding: 10 }}><CalendarDays size={20} /></span><span style={{ flex: 1 }}><strong style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Visits & enquiries</strong><span style={muted}>Review requests, visit times and responses.</span><span style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, fontSize: 12, fontWeight: 700 }}>View activity <ArrowRight size={14} /></span></span></Link>
            <Link href="/notifications" style={linkCard}><span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 12, padding: 10 }}><BellRing size={20} /></span><span style={{ flex: 1 }}><strong style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Notifications</strong><span style={muted}>See updates on your property journey.</span><span style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, fontSize: 12, fontWeight: 700 }}>View updates <ArrowRight size={14} /></span></span></Link>
          </div>
        </section>

        <section style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            <div><h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em', color: '#111827' }}>Your saved homes</h2><p style={{ ...muted, marginTop: 4 }}>Your shortlist, ready when you are.</p></div>
            <Link href="/saved" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>See all <ArrowRight size={15} /></Link>
          </div>
          {busy ? <div style={{ ...card, padding: 24, ...muted }}>Loading your saved homes…</div>
            : saved.length === 0 ? <div style={{ ...card, padding: 24, textAlign: 'center' }}><div style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', margin: '0 auto 12px', borderRadius: 16, background: '#FCE7F3', color: '#9D174D' }}><Heart size={23} /></div><h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>Your shortlist starts here</h3><p style={{ ...muted, marginBottom: 15 }}>Save a few homes you like and compare them here whenever you’re ready.</p><Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 15px', borderRadius: 11, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 700 }}><Search size={15} /> Find homes</Link></div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap: 18 }}>{saved.slice(0, 3).map((listing: any) => <PropertyCard key={listing.id} listing={listing} isSaved={savedIds.has(listing.id)} onToggle={toggleSaved} />)}</div>}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 14 }}>
          <div style={{ ...card, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Next steps</h2>
            {busy ? <p style={muted}>Checking your activity…</p> : visits.length + enquiries.length === 0 ? <><p style={{ ...muted, marginBottom: 14 }}>Once you contact a property or request a visit, we’ll keep the details easy to find here.</p><Link href="/search" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>Explore available homes →</Link></> :
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {visits.slice(0, 2).map(v => <div key={v.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><CalendarDays size={17} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} /><div><strong style={{ display: 'block', fontSize: 13 }}>{v.listing?.title || 'Property visit'}</strong><span style={muted}>{v.slot_date ? v.slot_date + (v.slot_time ? ' · ' + String(v.slot_time).slice(0,5) : '') : 'Visit request'} · {v.status}</span></div></div>)}
                {enquiries.slice(0, 2).map(e => <div key={e.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><MessageSquare size={17} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} /><div><strong style={{ display: 'block', fontSize: 13 }}>{e.listing?.title || 'Property enquiry'}</strong><span style={muted}>Enquiry · {e.status}</span></div></div>)}
                <Link href="/enquiries" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--primary)', fontSize: 13, fontWeight: 700, marginTop: 4 }}>View all activity <ArrowRight size={14} /></Link>
              </div>}
          </div>
          <div style={{ ...card, padding: 20, background: '#F9FAFB' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}><Sparkles size={18} color="var(--primary)" /><h2 style={{ fontSize: 16, fontWeight: 800 }}>Make your search more useful</h2></div>
            <p style={{ ...muted, marginBottom: 14 }}>Save a search for your budget and preferred locality, and turn alerts on when you want updates about matching homes.</p>
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 11, border: '1px solid #D1D5DB', background: '#fff', color: '#111827', fontSize: 13, fontWeight: 700 }}><MapPin size={15} /> Search by locality</Link>
          </div>
        </section>
        {loadError && <p role="status" style={{ ...muted, marginTop: 18 }}>Some account information couldn’t be loaded. Please refresh or revisit the relevant section.</p>}
        <p style={{ ...muted, marginTop: 24, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={15} /> Your account activity is private to your signed-in account.</p>
      </main>
      <Footer />
    </>
  );
}
