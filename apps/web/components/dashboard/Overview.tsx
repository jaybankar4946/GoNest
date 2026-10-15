'use client';
import { formatPrice, timeAgo } from '@/lib/format';

export type Tab = 'overview' | 'listings' | 'leads' | 'visits';
type Prof = { full_name?: string | null; phone?: string | null; agency_name?: string | null; rera_number?: string | null; agent_verified?: boolean } | null;
type Props = { role: string; profile: Prof; listings: any[]; leads: any[]; visits: any[]; busy: boolean; onGo: (t: Tab) => void; onLeadStatus: (id: string, s: string) => void; onVisitStatus: (id: string, s: string) => void };

const COLS: { key: string; label: string; color: string }[] = [{ key: 'new', label: 'New', color: '#2563EB' }, { key: 'contacted', label: 'Contacted', color: '#D97706' }, { key: 'qualified', label: 'Qualified', color: '#7C3AED' }, { key: 'closed', label: 'Closed', color: '#16A34A' }];
const card: React.CSSProperties = { border: '1px solid #E5E7EB', borderRadius: 18, background: '#fff' };
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 12 };
const btn = (c: string): React.CSSProperties => ({ padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, color: '#fff', background: c, border: 'none', cursor: 'pointer' });
const d10 = (p: string) => (p ?? '').replace(/\D/g, '').slice(-10);
const today = () => new Date().toISOString().slice(0, 10);
const hhmm = (t: string) => String(t ?? '').slice(0, 5);

export function Overview({ role, profile, listings, leads, visits, busy, onGo, onLeadStatus, onVisitStatus }: Props) {
  const isAgent = role === 'agent';
  const active = listings.filter(l => l.status === 'active');
  const pending = listings.filter(l => l.status === 'pending_review');
  const rejected = listings.filter(l => l.status === 'rejected');
  const views = listings.reduce((n, l) => n + (l.view_count ?? 0), 0);
  const saves = listings.reduce((n, l) => n + (l.saved_count ?? 0), 0);
  const newLeads = leads.filter(l => l.status === 'new');
  const upcoming = visits.filter(v => ['requested', 'confirmed'].includes(v.status) && String(v.slot_date) >= today())
    .sort((a, b) => (String(a.slot_date) + hhmm(a.slot_time)).localeCompare(String(b.slot_date) + hhmm(b.slot_time)));
  const toConfirm = upcoming.filter(v => v.status === 'requested');
  const completed = visits.filter(v => v.status === 'completed').length;
  const closed = leads.filter(l => l.status === 'closed').length;

  const kpis: [string, number, string][] = [['Active listings', active.length, '#16A34A'], ['Pending review', pending.length, '#D97706'], ['Total views', views, '#2563EB'], ['Saves', saves, '#DB2777'], ['New leads', newLeads.length, '#7C3AED'], ['Upcoming visits', upcoming.length, '#0891B2']];
  const attention: { text: string; go: Tab }[] = [];
  if (newLeads.length) attention.push({ text: `${newLeads.length} new lead${newLeads.length > 1 ? 's' : ''} waiting for a reply`, go: 'leads' });
  if (toConfirm.length) attention.push({ text: `${toConfirm.length} visit request${toConfirm.length > 1 ? 's' : ''} to confirm`, go: 'visits' });
  rejected.forEach(l => attention.push({ text: `“${l.title}” was rejected${l.rejection_reason ? `: ${l.rejection_reason}` : ''}. Fix and resubmit.`, go: 'listings' }));
  if (pending.length) attention.push({ text: `${pending.length} listing${pending.length > 1 ? 's' : ''} waiting for GoNest review`, go: 'listings' });

  const funnel: [string, number][] = [['Views', views], ['Saves', saves], ['Leads', leads.length], ['Visit requests', visits.length], ['Visits completed', completed], ['Leads closed', closed]];
  const top = Math.max(1, ...funnel.map(f => f[1]));

  const clients = Object.values(leads.reduce((m: Record<string, any>, l) => {
    const k = d10(l.buyer_phone) || l.id; const c = m[k] ?? (m[k] = { name: l.buyer_name, phone: l.buyer_phone, n: 0, listings: new Set<string>(), last: l.created_at });
    c.n += 1; c.listings.add(l.listing?.title ?? l.listing_id); if (l.created_at > c.last) c.last = l.created_at; return m;
  }, {})) as any[];
  clients.sort((a, b) => (b.last > a.last ? 1 : -1));

  const checks: [string, boolean][] = [['Add your full name', !!profile?.full_name], ['Add your phone number', !!profile?.phone], ['Add your agency name', !!profile?.agency_name], ['Add your RERA number', !!profile?.rera_number], ['GoNest verification', !!profile?.agent_verified]];
  const done = checks.filter(c => c[1]).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        {kpis.map(([k, v, c]) => (<div key={k} style={{ ...card, padding: '16px 18px' }}><div style={{ fontSize: 26, fontWeight: 800, color: c }}>{v.toLocaleString('en-IN')}</div><div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{k}</div></div>))}
      </div>

      {attention.length > 0 && (
        <section style={{ ...card, padding: 18, background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <h2 style={h2}>Needs your attention</h2>
          {attention.map((a, i) => (<button key={i} onClick={() => onGo(a.go)} style={{ display: 'block', textAlign: 'left', width: '100%', padding: '8px 0', fontSize: 14, color: '#92400E', borderTop: i ? '1px solid #FDE68A' : 'none' }}>{a.text} →</button>))}
        </section>)}

      <section style={{ ...card, padding: 18 }}>
        <h2 style={h2}>Performance funnel</h2>
        {funnel.map(([k, n]) => (<div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 130, fontSize: 13, fontWeight: 600 }}>{k}</div>
          <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 6, height: 10, overflow: 'hidden' }}><div style={{ width: `${Math.max(2, Math.round((n / top) * 100))}%`, height: '100%', background: 'var(--primary)' }} /></div>
          <div style={{ width: 48, textAlign: 'right', fontSize: 13, fontWeight: 700 }}>{n}</div></div>))}
        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>{views > 0 ? `Lead rate: ${((leads.length / views) * 100).toFixed(1)}% of views turned into an enquiry.` : 'Numbers appear once your listings get views.'}</p>
      </section>

      <section>
        <h2 style={h2}>Lead pipeline</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 12 }}>
          {COLS.map(c => { const items = leads.filter(l => l.status === c.key); return (
            <div key={c.key} style={{ ...card, padding: 12, background: '#F9FAFB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><b style={{ fontSize: 13, color: c.color }}>{c.label}</b><span style={{ fontSize: 12, color: '#6B7280' }}>{items.length}</span></div>
              {items.length === 0 && <p style={{ fontSize: 12, color: '#9CA3AF' }}>No leads</p>}
              {items.map(l => (<div key={l.id} style={{ ...card, padding: 12, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{l.buyer_name}</div>
                <div style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 6px' }}>{l.listing?.title ?? 'Listing'} · {timeAgo(l.created_at)}</div>
                {l.message && <div style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>“{String(l.message).slice(0, 90)}”</div>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  <a href={`tel:+91${d10(l.buyer_phone)}`} style={btn('#111827')}>Call</a>
                  <a href={`https://wa.me/91${d10(l.buyer_phone)}`} target="_blank" rel="noopener noreferrer" style={btn('#25D366')}>WhatsApp</a></div>
                <select aria-label="Move lead" disabled={busy} value={l.status} onChange={e => onLeadStatus(l.id, e.target.value)} style={{ width: '100%', padding: '5px 8px', fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}>
                  {[...COLS.map(x => x.key), 'spam'].map(s => <option key={s} value={s}>{s}</option>)}</select>
              </div>))}
            </div>); })}
        </div>
      </section>

      <section style={{ ...card, padding: 18 }}>
        <h2 style={h2}>Upcoming visits</h2>
        {upcoming.length === 0 ? <p style={{ fontSize: 14, color: '#6B7280' }}>No upcoming visits.</p> : upcoming.map(v => (
          <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 0', borderTop: '1px solid #F3F4F6' }}>
            <div><div style={{ fontWeight: 700, fontSize: 14 }}>{v.slot_date} at {hhmm(v.slot_time)}{v.booking_ref ? ` · ${v.booking_ref}` : ''}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{v.requester_name} · {v.requester_phone}{v.visitors > 1 ? ` · ${v.visitors} visitors` : ''}{v.contact_method ? ` · prefers ${v.contact_method}` : ''}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{v.listing?.title}{v.notes ? ` · “${v.notes}”` : ''}</div></div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: v.status === 'confirmed' ? '#ECFDF5' : '#FFFBEB', color: v.status === 'confirmed' ? '#065F46' : '#92400E' }}>{v.status}</span>
              {v.status === 'requested' && <button disabled={busy} onClick={() => onVisitStatus(v.id, 'confirmed')} style={btn('#16A34A')}>Confirm</button>}
              {v.status === 'confirmed' && <button disabled={busy} onClick={() => onVisitStatus(v.id, 'completed')} style={btn('#2563EB')}>Mark completed</button>}
              <button disabled={busy} onClick={() => onVisitStatus(v.id, 'cancelled')} style={btn('#DC2626')}>Cancel</button></div>
          </div>))}
      </section>

      <section style={{ ...card, padding: 18 }}>
        <h2 style={h2}>Listing performance</h2>
        {listings.length === 0 ? <p style={{ fontSize: 14, color: '#6B7280' }}>No listings yet. <a href="/dashboard/new" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Add your first property</a>.</p> : (
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ textAlign: 'left', color: '#6B7280' }}>{['Listing', 'Status', 'Price', 'Views', 'Saves', 'Leads', 'Lead rate', ''].map(h => <th key={h} style={{ padding: '8px 10px', fontWeight: 600 }}>{h}</th>)}</tr></thead>
            <tbody>{listings.map(l => { const v = l.view_count ?? 0, ld = l.lead_count ?? 0; return (
              <tr key={l.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                <td style={{ padding: '10px', fontWeight: 600, maxWidth: 260 }}>{l.title}</td><td style={{ padding: '10px' }}>{String(l.status).replace('_', ' ')}</td>
                <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{formatPrice(l.price, l.purpose)}</td><td style={{ padding: '10px' }}>{v}</td><td style={{ padding: '10px' }}>{l.saved_count ?? 0}</td><td style={{ padding: '10px' }}>{ld}</td>
                <td style={{ padding: '10px' }}>{v > 0 ? `${((ld / v) * 100).toFixed(1)}%` : '—'}</td>
                <td style={{ padding: '10px', whiteSpace: 'nowrap' }}><a href={`/dashboard/edit/${l.id}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Edit</a></td></tr>); })}</tbody></table></div>)}
      </section>

      {isAgent && (<>
        <section style={{ ...card, padding: 18 }}>
          <h2 style={h2}>Clients</h2>
          {clients.length === 0 ? <p style={{ fontSize: 14, color: '#6B7280' }}>Buyers who enquire will appear here, grouped by phone number.</p> : clients.map((c: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: i ? '1px solid #F3F4F6' : 'none', flexWrap: 'wrap' }}>
              <div><div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div><div style={{ fontSize: 12, color: '#6B7280' }}>{c.phone} · {c.n} enquir{c.n > 1 ? 'ies' : 'y'} · {c.listings.size} propert{c.listings.size > 1 ? 'ies' : 'y'}</div></div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Last: {timeAgo(c.last)}</div></div>))}
        </section>
        <section style={{ ...card, padding: 18 }}>
          <h2 style={h2}>Your agent profile · {done}/{checks.length}</h2>
          <div style={{ background: '#F3F4F6', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 12 }}><div style={{ width: `${(done / checks.length) * 100}%`, height: '100%', background: '#16A34A' }} /></div>
          {checks.map(([t, ok]) => (<div key={t} style={{ fontSize: 13, color: ok ? '#065F46' : '#6B7280', padding: '3px 0' }}>{ok ? '✓' : '○'} {t}</div>))}
          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>A complete profile with a RERA number builds buyer trust.</p>
        </section></>)}
    </div>
  );
}
