'use client';
import { useState } from 'react';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const num = (v: string) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : 0; };
// "none" -> 0, "1 month" -> 1x rent, anything else -> unknown (customer can enter their own figure)
function brokerageFrom(raw: string | null | undefined, rent: number): { amount: number | null; label: string } {
  const b = (raw ?? '').trim().toLowerCase();
  if (!b) return { amount: null, label: 'Not provided' };
  if (b === 'none' || b === 'no' || b === '0') return { amount: 0, label: 'None' };
  const m = b.match(/([\d.]+)\s*month/);
  if (m) return { amount: Number(m[1]) * rent, label: raw as string };
  return { amount: null, label: raw as string };
}

export function RentalCostCalculator({ rent, deposit, maintenance, brokerage }: { rent: number; deposit: number | null; maintenance: number | null; brokerage: string | null }) {
  const [months, setMonths] = useState<11 | 12>(11);
  const [broker, setBroker] = useState('');
  const [agreement, setAgreement] = useState('');
  const [society, setSociety] = useState('');
  const [moving, setMoving] = useState('');
  const [other, setOther] = useState('');
  const b = brokerageFrom(brokerage, rent);
  const brokerAmt = b.amount ?? num(broker);
  const dep = deposit ?? 0;
  const maint = maintenance ?? 0;
  const monthly = rent + maint;
  const oneTime = brokerAmt + num(agreement) + num(society) + num(moving) + num(other);
  const upfront = monthly + dep + oneTime;                // first month + deposit + one-time charges
  const cashOverTerm = upfront + monthly * (months - 1);
  const trueCost = monthly * months + oneTime;            // after deposit comes back (before any deductions)
  const row = (label: string, value: string, tag: 'Confirmed' | 'Your estimate' | 'Not provided', strong = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13 }}>
      <span style={{ color: '#374151' }}>{label} <span style={{ fontSize: 11, color: tag === 'Confirmed' ? '#047857' : tag === 'Your estimate' ? '#B45309' : '#9CA3AF' }}>· {tag}</span></span>
      <span style={{ fontWeight: strong ? 800 : 600, color: '#111827' }}>{value}</span>
    </div>
  );
  const field = (label: string, v: string, set: (s: string) => void) => (
    <label style={{ display: 'block', fontSize: 12, color: '#6B7280' }}>{label}
      <input inputMode="numeric" value={v} onChange={(e) => set(e.target.value.replace(/[^\d]/g, '').slice(0, 7))} placeholder="₹ 0" style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
    </label>
  );
  return (
    <section aria-label="Total move-in cost" style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 20, marginBottom: 24, background: '#fff' }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Total cost to move in</h2>
      <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>Rent is only part of it. Amounts marked “Confirmed” come from the owner or agent; “Your estimate” fields are yours to fill in.</p>
      <div>
        {row('Monthly rent', inr(rent), 'Confirmed')}
        {row('Monthly maintenance', maintenance != null ? inr(maint) : 'Not provided', maintenance != null ? 'Confirmed' : 'Not provided')}
        {row('Security deposit (refundable)', deposit != null ? inr(dep) : 'Not provided', deposit != null ? 'Confirmed' : 'Not provided')}
        {row('Brokerage', b.amount != null ? inr(b.amount) : b.label, b.amount != null ? 'Confirmed' : 'Not provided')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, margin: '14px 0' }}>
        {b.amount == null && field('Brokerage', broker, setBroker)}
        {field('Agreement & registration', agreement, setAgreement)}
        {field('Society move-in / NOC', society, setSociety)}
        {field('Moving', moving, setMoving)}
        {field('Other one-time', other, setOther)}
      </div>
      <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '6px 14px' }}>
        {row('Pay before you move in', inr(upfront), 'Your estimate', true)}
        {row('Of which refundable deposit', inr(dep), 'Confirmed')}
        {row('Of which one-time charges you will not get back', inr(oneTime), 'Your estimate')}
        {row('Every month after', inr(monthly), 'Confirmed')}
      </div>
      <div style={{ display: 'flex', gap: 8, margin: '14px 0 6px' }} role="group" aria-label="Lease length">
        {([11, 12] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMonths(m)} aria-pressed={months === m} style={{ padding: '6px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 600, border: '1px solid ' + (months === m ? '#2563EB' : '#E5E7EB'), background: months === m ? '#EFF6FF' : '#fff', color: months === m ? '#1D4ED8' : '#374151', cursor: 'pointer' }}>{m} months</button>
        ))}
      </div>
      <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '6px 14px' }}>
        {row(`Cash you will pay over ${months} months`, inr(cashOverTerm), 'Your estimate', true)}
        {row('True cost if the full deposit is returned', inr(trueCost), 'Your estimate')}
      </div>
      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 10, lineHeight: 1.6 }}>Indicative only. Whether the deposit is returned, and any deductions, depend on the agreement. Stamp duty and registration vary by state, so confirm them before you sign. Electricity, water and other utilities are not included.</p>
    </section>
  );
}
