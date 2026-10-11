'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { bookVisit, getBookedSlots, type BookingResult } from '@/lib/api';
import { track } from '@/lib/track';

const SLOTS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const label = (t: string) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const nice = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const field: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 13, outline: 'none', background: '#F9FAFB' };
const primary: React.CSSProperties = { width: '100%', padding: 13, borderRadius: 14, fontSize: 14, fontWeight: 700, border: 'none', color: '#fff', background: 'var(--primary)', cursor: 'pointer' };
const ghost: React.CSSProperties = { padding: '11px 16px', borderRadius: 14, fontSize: 13, fontWeight: 600, border: '1px solid #E5E7EB', background: '#fff', color: '#111', cursor: 'pointer' };

function explain(m: string) {
  if (m.includes('slot_unavailable')) return 'That time was just taken. Please choose another slot.';
  if (m.includes('invalid_time')) return 'That time is no longer available. Please choose another.';
  if (m.includes('invalid_date')) return 'Please choose a date within the next 60 days.';
  if (m.includes('listing_unavailable')) return 'This property is no longer available for visits.';
  if (m.includes('consent_required')) return 'Please tick the consent box to continue.';
  if (m.includes('duplicate_enquiry')) return 'You have already requested visits for this property. The owner will get back to you.';
  if (m.includes('rate_limited')) return 'Too many requests from this number. Please try again in an hour.';
  if (m.includes('_valid_chk')) return 'Please check your name and enter a valid 10-digit mobile number.';
  return 'Could not book the visit. Please try again.';
}

function ics(r: BookingResult) {
  const d = r.slot_date.replace(/-/g, ''), [h, m] = r.slot_time.split(':'), end = String(Number(h) + 1).padStart(2, '0');
  const text = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GoNest//Visit//EN', 'BEGIN:VEVENT', `UID:${r.booking_ref}@gonest.in`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;TZID=Asia/Kolkata:${d}T${h}${m}00`, `DTEND;TZID=Asia/Kolkata:${d}T${end}${m}00`, `SUMMARY:Property visit: ${r.title.replace(/[,;\n]/g, ' ')}`, `DESCRIPTION:Booking ${r.booking_ref}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar' }));
  const a = document.createElement('a'); a.href = url; a.download = `${r.booking_ref}.ics`; a.click(); URL.revokeObjectURL(url);
}

export function ScheduleVisit({ listingId, prefill }: { listingId: string; prefill: { name: string; phone: string; email: string } }) {
  const [step, setStep] = useState(1);
  const [month, setMonth] = useState(() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), 1); });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [booked, setBooked] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState(prefill.name); const [phone, setPhone] = useState(prefill.phone); const [email, setEmail] = useState(prefill.email);
  const [visitors, setVisitors] = useState(1); const [method, setMethod] = useState('phone'); const [notes, setNotes] = useState(''); const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null); const [done, setDone] = useState<BookingResult | null>(null);

  const today = useMemo(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }, []);
  const last = useMemo(() => { const t = new Date(today); t.setDate(t.getDate() + 60); return t; }, [today]);
  const loadSlots = (d: string) => { setLoadingSlots(true); getBookedSlots(listingId, d).then(setBooked).finally(() => setLoadingSlots(false)); };
  useEffect(() => { if (date) loadSlots(date); /* eslint-disable-next-line */ }, [date]);

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1), n = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(first.getDay()).fill(null), ...Array.from({ length: n }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))] as (Date | null)[];
  }, [month]);
  const isToday = date === iso(new Date());
  const nowH = new Date().getHours();
  const slotState = (t: string) => booked.includes(t) ? 'taken' : isToday && Number(t.split(':')[0]) <= nowH ? 'past' : 'free';
  const digits = phone.replace(/\D/g, '').slice(-10);
  const detailsError = name.trim().length < 2 ? 'Enter your full name.' : !/^[6-9]\d{9}$/.test(digits) ? 'Enter a valid 10-digit mobile number.' : email && !/^\S+@\S+\.\S+$/.test(email) ? 'Enter a valid email or leave it empty.' : null;

  const confirm = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await bookVisit({ listingId, name: name.trim(), phone: digits, email: email.trim(), date, time, visitors, method, notes: notes.trim(), consent });
      track('visit_requested', listingId); setDone(r);
    } catch (e) {
      const m = (e as { message?: string })?.message ?? '';
      setErr(explain(m));
      if (m.includes('slot_unavailable') || m.includes('invalid_time')) { setTime(''); loadSlots(date); setStep(2); }
    } finally { setBusy(false); }
  };

  if (done) return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}><div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ECFDF5', color: '#16A34A', fontSize: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
        <h3 style={{ fontSize: 17, fontWeight: 800, marginTop: 8 }}>Visit requested</h3><p style={{ fontSize: 12, color: '#6B7280' }}>The owner will confirm your slot. We will notify you here.</p></div>
      <dl style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px 10px', fontSize: 13, background: '#F9FAFB', borderRadius: 14, padding: 14 }}>
        <dt style={{ color: '#6B7280' }}>Booking ID</dt><dd style={{ fontWeight: 700 }}>{done.booking_ref}</dd>
        <dt style={{ color: '#6B7280' }}>Property</dt><dd>{done.title}</dd><dt style={{ color: '#6B7280' }}>Date</dt><dd>{nice(done.slot_date)}</dd>
        <dt style={{ color: '#6B7280' }}>Time</dt><dd>{label(done.slot_time)}</dd><dt style={{ color: '#6B7280' }}>Visitor</dt><dd>{name} ({done.visitors})</dd>
      </dl>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <button style={{ ...ghost, flex: 1 }} onClick={() => ics(done)}>Add to calendar</button>
        <Link href="/enquiries" style={{ ...ghost, flex: 1, textAlign: 'center' }}>My enquiries</Link>
      </div>
    </div>);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }} aria-label={`Step ${step} of 4`}>{[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 9999, background: i <= step ? 'var(--primary)' : '#E5E7EB' }} />)}</div>
      {err && <p role="alert" style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '8px 10px', borderRadius: 10, marginBottom: 10 }}>{err}</p>}

      {step === 1 && (<div>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Choose a date</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <button aria-label="Previous month" disabled={month <= new Date(today.getFullYear(), today.getMonth(), 1)} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={{ ...ghost, padding: '4px 10px', opacity: month <= new Date(today.getFullYear(), today.getMonth(), 1) ? 0.4 : 1 }}>‹</button>
          <b style={{ fontSize: 14 }}>{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</b>
          <button aria-label="Next month" disabled={new Date(month.getFullYear(), month.getMonth() + 1, 1) > last} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={{ ...ghost, padding: '4px 10px', opacity: new Date(month.getFullYear(), month.getMonth() + 1, 1) > last ? 0.4 : 1 }}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {cells.map((d, i) => { if (!d) return <span key={i} />; const off = d < today || d > last, sel = iso(d) === date; return (
            <button key={i} disabled={off} onClick={() => { setDate(iso(d)); setTime(''); setErr(null); }} aria-label={nice(iso(d))} style={{ padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: sel ? 700 : 500, border: sel ? '1.5px solid var(--primary)' : '1px solid transparent', background: sel ? '#EFF6FF' : 'transparent', color: off ? '#D1D5DB' : sel ? 'var(--primary)' : '#111', cursor: off ? 'not-allowed' : 'pointer' }}>{d.getDate()}</button>); })}
        </div>
        <button disabled={!date} onClick={() => setStep(2)} style={{ ...primary, marginTop: 14, opacity: date ? 1 : 0.4 }}>Continue</button>
      </div>)}

      {step === 2 && (<div>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>Choose a time</h3><p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>{nice(date)}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {SLOTS.map(t => { const st = slotState(t), sel = time === t; return (
            <button key={t} disabled={st !== 'free' || loadingSlots} onClick={() => { setTime(t); setErr(null); }} style={{ padding: '11px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600, border: sel ? '1.5px solid var(--primary)' : '1px solid #E5E7EB', background: sel ? '#EFF6FF' : st === 'free' ? '#fff' : '#F3F4F6', color: st === 'free' ? (sel ? 'var(--primary)' : '#111') : '#9CA3AF', cursor: st === 'free' ? 'pointer' : 'not-allowed' }}>
              {label(t)}{st === 'taken' && <div style={{ fontSize: 10, fontWeight: 500 }}>Slot unavailable</div>}{st === 'past' && <div style={{ fontSize: 10, fontWeight: 500 }}>Passed</div>}</button>); })}
        </div>
        {loadingSlots && <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>Checking availability…</p>}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}><button style={ghost} onClick={() => setStep(1)}>Back</button><button disabled={!time} onClick={() => setStep(3)} style={{ ...primary, flex: 1, opacity: time ? 1 : 0.4 }}>Continue</button></div>
      </div>)}

      {step === 3 && (<div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800 }}>Your details</h3>
        <input aria-label="Full name" placeholder="Full name *" autoComplete="name" value={name} onChange={e => setName(e.target.value)} style={field} />
        <input aria-label="Mobile number" placeholder="Mobile number (10 digits) *" inputMode="tel" autoComplete="tel" maxLength={15} value={phone} onChange={e => setPhone(e.target.value)} style={field} />
        <input aria-label="Email" placeholder="Email (optional)" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={field} />
        <div style={{ display: 'flex', gap: 8 }}>
          <select aria-label="Number of visitors" value={visitors} onChange={e => setVisitors(Number(e.target.value))} style={field}>{[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} visitor{n > 1 ? 's' : ''}</option>)}</select>
          <select aria-label="Preferred contact method" value={method} onChange={e => setMethod(e.target.value)} style={field}><option value="phone">Contact by phone</option><option value="whatsapp">Contact by WhatsApp</option><option value="email">Contact by email</option></select>
        </div>
        <textarea aria-label="Special requirements" placeholder="Special requirements (optional)" rows={2} maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} style={{ ...field, resize: 'none' }} />
        {detailsError && <p style={{ fontSize: 12, color: '#B45309' }}>{detailsError}</p>}
        <div style={{ display: 'flex', gap: 8 }}><button style={ghost} onClick={() => setStep(2)}>Back</button><button disabled={!!detailsError} onClick={() => setStep(4)} style={{ ...primary, flex: 1, opacity: detailsError ? 0.4 : 1 }}>Review</button></div>
      </div>)}

      {step === 4 && (<div>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Review and confirm</h3>
        <dl style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px 10px', fontSize: 13, background: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <dt style={{ color: '#6B7280' }}>Date</dt><dd>{nice(date)}</dd><dt style={{ color: '#6B7280' }}>Time</dt><dd>{label(time)}</dd><dt style={{ color: '#6B7280' }}>Name</dt><dd>{name}</dd>
          <dt style={{ color: '#6B7280' }}>Phone</dt><dd>+91 {digits}</dd>{email && (<><dt style={{ color: '#6B7280' }}>Email</dt><dd>{email}</dd></>)}<dt style={{ color: '#6B7280' }}>Visitors</dt><dd>{visitors}</dd><dt style={{ color: '#6B7280' }}>Contact by</dt><dd>{method}</dd>
        </dl>
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#4B5563', lineHeight: 1.5, marginBottom: 10 }}><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 2 }} /><span>I agree that GoNest may share my name and contact details with the owner or agent of this listing so they can arrange this visit. See the <a href="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</a>.</span></label>
        <div style={{ display: 'flex', gap: 8 }}><button style={ghost} onClick={() => setStep(3)}>Back</button><button disabled={!consent || busy} onClick={confirm} style={{ ...primary, flex: 1, opacity: !consent || busy ? 0.5 : 1 }}>{busy ? 'Booking…' : 'Confirm visit'}</button></div>
      </div>)}
    </div>
  );
}
