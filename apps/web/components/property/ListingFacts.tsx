import { formatPrice, capitalize, timeAgo } from '@/lib/format';
import type { ListingFull } from '@/lib/types';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const date = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function Group({ title, rows }: { title: string; rows: [string, string | null | undefined | false][] }) {
  const shown = rows.filter(([, v]) => v) as [string, string][];
  if (shown.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{title}</h3>
      <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(120px,200px) 1fr', gap: '8px 16px', fontSize: 14 }}>
        {shown.map(([k, v]) => (<div key={k} style={{ display: 'contents' }}><dt style={{ color: '#6B7280' }}>{k}</dt><dd style={{ color: '#111827' }}>{v}</dd></div>))}
      </dl>
    </div>
  );
}

export function ListingFacts({ l }: { l: ListingFull }) {
  const poster = l.poster as any;
  const amenities = ((l as any).amenities ?? []) as string[];
  return (
    <section id="facts" style={{ scrollMarginTop: 130, marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 16 }}>Facts &amp; features</h2>
      <Group title="Interior" rows={[
        ['Bedrooms', l.bedrooms > 0 ? String(l.bedrooms) : null], ['Bathrooms', l.bathrooms > 0 ? String(l.bathrooms) : null],
        ['Balconies', l.balconies > 0 ? String(l.balconies) : null], ['Furnishing', l.furnishing ? capitalize(l.furnishing.replace('-', ' ')) : null],
        ['Facing', l.facing ? capitalize(l.facing) : null]]} />
      <Group title="Area and building" rows={[
        ['Property type', capitalize(l.property_type)], ['Area', l.sqft ? `${l.sqft.toLocaleString('en-IN')} sq ft` : null],
        ['Carpet area', l.carpet_area ? `${l.carpet_area.toLocaleString('en-IN')} sq ft` : null],
        ['Price per sq ft', l.purpose === 'sale' && l.sqft ? `${inr(Math.round(l.price / l.sqft))} per sq ft` : null],
        ['Floor', l.floor_number != null ? `${l.floor_number}${l.total_floors ? ` of ${l.total_floors}` : ''}` : null],
        ['Age of property', l.property_age != null ? `${l.property_age} year${l.property_age === 1 ? '' : 's'}` : null]]} />
      <Group title="Price and charges" rows={[
        [l.purpose === 'rent' ? 'Monthly rent' : 'Price', formatPrice(l.price, l.purpose)], ['Negotiable', l.price_negotiable ? 'Yes' : null],
        ['Maintenance', l.maintenance_monthly ? `${inr(l.maintenance_monthly)} per month` : null],
        ['Security deposit', l.security_deposit ? inr(l.security_deposit) : null],
        ['Brokerage', l.brokerage && l.brokerage !== 'none' ? l.brokerage : l.brokerage === 'none' ? 'None' : null],
        ['Available from', l.available_from ? date(l.available_from) : null]]} />
      {amenities.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Amenities</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{amenities.map(a => <span key={a} style={{ fontSize: 13, color: '#065F46', background: '#ECFDF5', padding: '6px 12px', borderRadius: 10 }}>✓ {a}</span>)}</div>
        </div>)}
      <Group title="Listing" rows={[
        ['Property ID', `GN-${l.id.slice(0, 8).toUpperCase()}`],
        ['Listed by', poster?.full_name ? `${poster.full_name} (${poster.role === 'agent' ? 'Agent' : 'Owner'})` : null],
        ['Listed', l.published_at ? `${date(l.published_at)} (${timeAgo(l.published_at)})` : null], ['Last updated', l.updated_at ? timeAgo(l.updated_at) : null]]} />
    </section>
  );
}

export function PriceHistory({ rows, purpose, sqft }: { rows: { id: string; event: string; price: number | null; created_at: string }[]; purpose: 'sale' | 'rent'; sqft: number | null }) {
  const asc = [...rows].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  const label = (e: string, i: number) => e === 'listed' ? `Listed for ${purpose}` : e === 'price_changed'
    ? `Price changed${asc[i - 1]?.price != null && asc[i].price != null ? (asc[i].price! < asc[i - 1].price! ? ' (reduced)' : ' (increased)') : ''}` : e === 'sold' ? 'Sold' : 'Rented';
  const view = asc.map((r, i) => ({ ...r, text: label(r.event, i) })).reverse();
  return (
    <section id="price-history" style={{ scrollMarginTop: 130, marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 16 }}>Price history</h2>
      {view.length === 0 ? <p style={{ fontSize: 14, color: '#6B7280' }}>No price history recorded yet.</p> : (
        <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr style={{ background: '#F9FAFB', textAlign: 'left', color: '#6B7280' }}><th style={{ padding: '10px 14px' }}>Date</th><th style={{ padding: '10px 14px' }}>Event</th><th style={{ padding: '10px 14px' }}>Price</th>{purpose === 'sale' && sqft ? <th style={{ padding: '10px 14px' }}>₹/sq ft</th> : null}</tr></thead>
            <tbody>{view.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{date(r.created_at)}</td><td style={{ padding: '10px 14px' }}>{r.text}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{r.price != null ? formatPrice(r.price, purpose) : '—'}</td>
                {purpose === 'sale' && sqft ? <td style={{ padding: '10px 14px' }}>{r.price != null ? inr(Math.round(r.price / sqft)) : '—'}</td> : null}
              </tr>))}</tbody>
          </table>
        </div>)}
    </section>
  );
}

export function DecisionSummary({ l, emi }: { l: ListingFull; emi: number | null }) {
  const poster = l.poster as any;
  const level = l.verification_level === 'platform_verified' ? 'GoNest verified' : l.verification_level === 'verified' ? 'Reviewed and verified' : 'Not yet verified';
  const amen = ((l as any).amenities ?? []) as string[];
  const na = 'Not provided';
  const total = l.purpose === 'rent' && l.maintenance_monthly ? l.price + l.maintenance_monthly : null;
  const Col = ({ q, rows }: { q: string; rows: [string, string][] }) => (
    <div style={{ flex: '1 1 220px', minWidth: 0 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{q}</p>
      {rows.map(([k, v]) => (<p key={k} style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}><span style={{ color: '#6B7280' }}>{k}: </span><span style={{ fontWeight: 600, color: v === na ? '#9CA3AF' : '#111827' }}>{v}</span></p>))}
    </div>
  );
  return (
    <section aria-label="Before you decide" style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 20, marginBottom: 28, background: '#F9FAFB' }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 14 }}>Before you decide</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <Col q="Can I trust it?" rows={[['Status', level], ['Listed by', poster?.full_name ? `${poster.role === 'agent' ? 'Agent' : 'Owner'}${poster.agent_verified ? ' (verified)' : ''}` : na], ['Last updated', l.updated_at ? timeAgo(l.updated_at) : na]]} />
        <Col q="Can I afford it?" rows={l.purpose === 'rent'
          ? [['Monthly rent', formatPrice(l.price, 'rent')], ['Maintenance', l.maintenance_monthly ? inr(l.maintenance_monthly) + '/mo' : na], ['Rent + maintenance', total ? inr(total) + '/mo' : na], ['Security deposit', l.security_deposit ? inr(l.security_deposit) : na]]
          : [['Price', formatPrice(l.price, 'sale')], ['Per sq ft', l.sqft ? inr(Math.round(l.price / l.sqft)) : na], ['Est. EMI', emi ? inr(emi) + '/mo*' : na], ['Maintenance', l.maintenance_monthly ? inr(l.maintenance_monthly) + '/mo' : na]]} />
        <Col q="Will I like living here?" rows={[['Area', l.sqft ? `${l.sqft.toLocaleString('en-IN')} sq ft` : na], ['Floor', l.floor_number != null ? `${l.floor_number}${l.total_floors ? ` of ${l.total_floors}` : ''}` : na], ['Furnishing', l.furnishing ? capitalize(l.furnishing.replace('-', ' ')) : na], ['Amenities', amen.length ? `${amen.length} listed` : na]]} />
      </div>
      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 12 }}>Only information supplied for this listing is shown. “Not provided” means the owner or agent has not given it. Commute, schools and neighbourhood details are not available yet.</p>
    </section>
  );
}
