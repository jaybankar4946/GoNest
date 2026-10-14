'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, CheckCircle2, LoaderCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { searchListings } from '@/lib/api';
import type { ListingFull } from '@/lib/types';

type Criteria = { q?: string; purpose?: 'sale' | 'rent'; minBedrooms?: number; minPrice?: number; maxPrice?: number; propertyType?: string; preferences?: string[] };
const examples = [
  '2 BHK ready-to-move home in Panvel under ₹80 lakh, near railway station',
  'I need a rental apartment for my family in Mumbai',
  'Show me a villa to buy between ₹1 crore and ₹2 crore',
];

export default function AssistantPage() {
  const [message, setMessage] = useState('');
  const [criteria, setCriteria] = useState<Criteria | null>(null);
  const [listings, setListings] = useState<ListingFull[]>([]);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<'ai' | 'basic' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e?: FormEvent, suggested?: string) {
    e?.preventDefault();
    const prompt = (suggested ?? message).trim();
    if (!prompt || busy) return;
    setMessage(prompt); setBusy(true); setError(''); setCriteria(null); setListings([]); setTotal(0);
    try {
      const response = await fetch('/api/assistant/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Please try again.');
      const c = payload.criteria as Criteria;
      setCriteria(c); setMode(payload.mode);
      const result = await searchListings({
        q: c.q,
        purpose: c.purpose,
        minBedrooms: c.minBedrooms,
        minPrice: c.minPrice,
        maxPrice: c.maxPrice,
        propertyType: c.propertyType,
        page: 1,
      });
      setListings(result.listings);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  }

  return (
    <>
      <Nav />
      <main style={{ minHeight: '70vh', background: '#F8FAFC' }}>
        <section style={{ background: '#101827', color: '#fff', padding: '64px 20px 56px' }}>
          <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #344256', borderRadius: 999, padding: '7px 12px', color: '#D6E4FF', fontSize: 12, fontWeight: 700, letterSpacing: '.04em' }}>
              <Sparkles size={15} /> A MORE HUMAN WAY TO FIND A HOME
            </div>
            <h1 style={{ fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.08, letterSpacing: '-.04em', fontWeight: 800, margin: '24px 0 16px' }}>Tell us what home means to you.</h1>
            <p style={{ maxWidth: 650, margin: '0 auto', color: '#C4CEDB', fontSize: 17, lineHeight: 1.7 }}>Describe your budget, commute, family needs or the feeling you want from a neighbourhood. GoNest turns it into a property search you can act on.</p>
            <form onSubmit={submit} style={{ margin: '30px auto 0', maxWidth: 760, padding: 8, borderRadius: 20, background: '#fff', display: 'flex', gap: 8, boxShadow: '0 20px 55px rgba(0,0,0,.22)' }}>
              <Search size={21} color="#64748B" style={{ alignSelf: 'center', marginLeft: 12, flexShrink: 0 }} />
              <input value={message} onChange={e => setMessage(e.target.value)} aria-label="Describe your ideal property" placeholder="e.g. A quiet 2 BHK near the metro under ₹80 lakh..." style={{ flex: 1, minWidth: 0, border: 0, outline: 0, color: '#0F172A', padding: '12px 4px', fontSize: 15, background: 'transparent' }} />
              <button type="submit" disabled={busy || !message.trim()} style={{ border: 0, borderRadius: 14, padding: '0 18px', background: busy ? '#94A3B8' : '#1E40AF', color: '#fff', fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center', cursor: busy ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                {busy ? <LoaderCircle size={17} /> : <ArrowRight size={17} />} <span>{busy ? 'Searching' : 'Find homes'}</span>
              </button>
            </form>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
              {examples.map(example => <button key={example} type="button" onClick={() => { setMessage(example); void submit(undefined, example); }} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid #344256', color: '#E2E8F0', borderRadius: 999, padding: '9px 13px', fontSize: 12, cursor: 'pointer' }}>{example}</button>)}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '34px 20px 64px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 34 }}>
            {[
              { icon: Bot, title: 'Talk naturally', desc: 'No need to learn filters or real-estate jargon.' },
              { icon: ShieldCheck, title: 'Grounded in GoNest', desc: 'Property cards come from current platform inventory, not AI imagination.' },
              { icon: CheckCircle2, title: 'You stay in control', desc: 'Review the matches, change your search, then contact the provider yourself.' },
            ].map(item => <div key={item.title} style={{ padding: 20, borderRadius: 18, background: '#fff', border: '1px solid #E5E7EB' }}><item.icon size={21} color="#1D4ED8" /><h2 style={{ margin: '12px 0 6px', fontSize: 15, fontWeight: 750, color: '#111827' }}>{item.title}</h2><p style={{ margin: 0, color: '#64748B', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p></div>)}
          </div>

          {error && <div role="alert" style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 12, padding: 14, marginBottom: 20 }}>{error}</div>}
          {criteria && <div aria-live="polite">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
              <div><p style={{ margin: '0 0 6px', color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Your search, understood</p><h2 style={{ margin: 0, color: '#111827', fontSize: 25, fontWeight: 800 }}>{total} matching {total === 1 ? 'property' : 'properties'}</h2></div>
              <span style={{ fontSize: 12, color: '#64748B' }}>{mode === 'ai' ? 'AI-assisted search' : 'Smart search'}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
              {criteria.purpose && <span style={chip}>{criteria.purpose === 'rent' ? 'For rent' : 'For sale'}</span>}
              {criteria.minBedrooms !== undefined && <span style={chip}>{criteria.minBedrooms} BHK+</span>}
              {criteria.minPrice !== undefined && <span style={chip}>From ₹{criteria.minPrice.toLocaleString('en-IN')}</span>}
              {criteria.maxPrice !== undefined && <span style={chip}>Up to ₹{criteria.maxPrice.toLocaleString('en-IN')}</span>}
              {criteria.propertyType && <span style={chip}>{criteria.propertyType}</span>}
              {(criteria.preferences ?? []).map(p => <span key={p} style={chip}>{p}</span>)}
              <Link href={'/search?q=' + encodeURIComponent(criteria.q || '')} style={{ ...chip, textDecoration: 'none', color: '#1D4ED8' }}>Refine in advanced search ↗</Link>
            </div>
            {listings.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap: 22 }}>{listings.map(l => <PropertyCard key={l.id} listing={l} />)}</div> : <div style={{ textAlign: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, padding: '44px 20px' }}><h3 style={{ color: '#111827', fontWeight: 750, fontSize: 18, margin: '0 0 8px' }}>No exact matches yet</h3><p style={{ color: '#64748B', margin: '0 auto 18px', maxWidth: 500, fontSize: 14, lineHeight: 1.7 }}>Try a wider budget or fewer requirements. GoNest only shows listings available in its inventory; it will not make up homes or prices.</p><Link href="/search" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: '#1D4ED8', fontWeight: 700 }}>Open all filters <ArrowRight size={16} /></Link></div>}
          </div>}
          {!criteria && !error && <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13 }}>Start with what matters most to you. You can refine the results at any time.</div>}
        </section>
      </main>
      <Footer />
    </>
  );
}

const chip: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', border: '1px solid #E2E8F0', background: '#fff', color: '#334155', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 650 };
