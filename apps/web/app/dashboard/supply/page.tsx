'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import {
  chooseAccountType, getCities, getLocalities, getMySubmissions, submitBrokerage, submitBuilderProject,
  uploadProjectImage, removeProjectImages,
} from '@/lib/api';
import { track } from '@/lib/track';
import type { City, Locality } from '@/lib/types';

type Want = 'owner' | 'agent' | 'builder';
type Subs = { projects: any[]; brokerages: any[] };

const ERR: Record<string, string> = {
  not_authenticated: 'Please sign in again.',
  agent_account_required: 'Only agent accounts can submit an agency profile.',
  builder_account_required: 'Only builder accounts can submit projects.',
  name_and_city_required: 'Name and city are required.',
  rera_registration_required: 'A RERA registration number is required.',
  invalid_website: 'Enter a valid website starting with http:// or https://.',
  too_many_pending_submissions: 'You already have 3 submissions waiting for review. Please wait for the review before adding more.',
  builder_name_project_name_and_city_required: 'Developer name, project name and city are required.',
  valid_developer_and_project_source_urls_required: 'Enter valid developer website and official project page links (http:// or https://).',
  invalid_project_category: 'Choose a valid project category.',
  invalid_construction_status: 'Choose a valid construction status.',
  inventory_source_url_required: 'Each unit needs a source link (for example the official project page).',
  upload_between_1_and_8_project_photos: 'Upload between 1 and 8 project photos.',
  invalid_project_photo_path: 'A photo upload failed. Please re-select your photos and try again.',
  account_type_change_not_allowed: 'This account type can’t be changed here. Please contact support.',
  invalid_role: 'Choose a valid account type.',
};
const msgOf = (e: unknown) => {
  const m = (e as { message?: string } | null)?.message ?? '';
  return ERR[m] ?? (m ? `Could not save: ${m}` : 'Something went wrong. Please try again.');
};
const errCode = (e: unknown) => { const m = (e as { message?: string } | null)?.message ?? ''; return ERR[m] ? m : 'other'; };
const isUrl = (v: string) => /^https?:\/\/[^\s]+$/i.test(v.trim());

const card: React.CSSProperties = { border: '1px solid #E5E7EB', borderRadius: 20, padding: 24, background: '#fff', marginBottom: 20 };
const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 14, background: '#fff', color: '#111827' };
const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 6 };
const btn: React.CSSProperties = { padding: '12px 22px', borderRadius: 9999, fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563EB', border: 'none', cursor: 'pointer' };
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 };

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={lbl}>{label}</span>
      {children}
      {hint && <span style={{ display: 'block', fontSize: 12, color: '#6B7280', marginTop: 4 }}>{hint}</span>}
    </label>
  );
}

const STATUS: Record<string, { text: string; color: string }> = {
  pending: { text: 'Waiting for review', color: '#B45309' },
  unverified: { text: 'Waiting for review', color: '#B45309' },
  verified: { text: 'Verified', color: '#047857' },
  rejected: { text: 'Rejected', color: '#B91C1C' },
  stale: { text: 'Needs re-verification', color: '#B45309' },
};

function Submissions({ subs, cities }: { subs: Subs; cities: City[] }) {
  const cityName = (id: string) => cities.find((c) => c.id === id)?.name ?? '';
  const rows = [
    ...subs.projects.map((x) => ({ id: x.id, kind: 'Project', title: x.official_name, status: x.verification_status, city: cityName(x.city_id) })),
    ...subs.brokerages.map((x) => ({ id: x.id, kind: 'Agency', title: x.business_name, status: x.verification_status, city: cityName(x.city_id) })),
  ];
  return (
    <section style={card} aria-label="Your submissions">
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Your submissions</h2>
      {rows.length === 0 ? <p style={{ fontSize: 14, color: '#6B7280' }}>Nothing submitted yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((r) => {
            const st = STATUS[r.status] ?? { text: r.status, color: '#6B7280' };
            return (
              <div key={r.kind + r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 14px', border: '1px solid #F3F4F6', borderRadius: 12, flexWrap: 'wrap' }}>
                <div><p style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</p><p style={{ fontSize: 12, color: '#6B7280' }}>{r.kind}{r.city ? ` · ${r.city}` : ''}</p></div>
                <span style={{ fontSize: 12, fontWeight: 700, color: st.color }}>{st.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AgencyForm({ cities, onDone }: { cities: City[]; onDone: () => void }) {
  const [f, setF] = useState({ name: '', cityId: '', rera: '', website: '', phone: '', enquiryUrl: '', address: '', localities: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setOk(false);
    if (!f.name.trim() || !f.cityId) return setErr(ERR.name_and_city_required);
    if (!f.rera.trim()) return setErr(ERR.rera_registration_required);
    if (f.website.trim() && !isUrl(f.website)) return setErr(ERR.invalid_website);
    setBusy(true);
    try {
      await submitBrokerage({ name: f.name, website: f.website, phone: f.phone, enquiryUrl: f.enquiryUrl, address: f.address, cityId: f.cityId, rera: f.rera, localities: f.localities.split(',').map((x) => x.trim()).filter(Boolean) });
      track('supply_agency_submitted');
      setOk(true); setF({ name: '', cityId: '', rera: '', website: '', phone: '', enquiryUrl: '', address: '', localities: '' }); onDone();
    } catch (x) { track('supply_submit_failed', undefined, { kind: 'agency', code: errCode(x) }); setErr(msgOf(x)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} style={card}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Submit your agency or brokerage</h2>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 18 }}>We review every submission and check the RERA number on the relevant state RERA website before it is shown publicly.</p>
      <div style={grid2}>
        <Field label="Agency / brokerage name *"><input style={inp} value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={120} required /></Field>
        <Field label="City *"><select style={inp} value={f.cityId} onChange={(e) => set('cityId', e.target.value)} required><option value="">Select a city</option>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="RERA registration number *" hint="As issued by your state’s RERA authority."><input style={inp} value={f.rera} onChange={(e) => set('rera', e.target.value)} maxLength={60} required /></Field>
        <Field label="Public phone"><input style={inp} inputMode="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} maxLength={20} /></Field>
        <Field label="Website"><input style={inp} placeholder="https://" value={f.website} onChange={(e) => set('website', e.target.value)} /></Field>
        <Field label="Enquiry page link"><input style={inp} placeholder="https://" value={f.enquiryUrl} onChange={(e) => set('enquiryUrl', e.target.value)} /></Field>
        <Field label="Office address"><input style={inp} value={f.address} onChange={(e) => set('address', e.target.value)} maxLength={200} /></Field>
        <Field label="Localities you cover" hint="Separate with commas."><input style={inp} value={f.localities} onChange={(e) => set('localities', e.target.value)} maxLength={200} /></Field>
      </div>
      {err && <p role="alert" style={{ color: '#B91C1C', fontSize: 13, marginTop: 14 }}>{err}</p>}
      {ok && <p role="status" style={{ color: '#047857', fontSize: 13, marginTop: 14 }}>Submitted. It will show as “Waiting for review” below.</p>}
      <button type="submit" disabled={busy} style={{ ...btn, marginTop: 18, opacity: busy ? 0.6 : 1 }}>{busy ? 'Submitting…' : 'Submit for review'}</button>
    </form>
  );
}

type Unit = { configuration: string; unit_reference: string; carpet: string; price: string; source: string; availability: string };
const emptyUnit = (): Unit => ({ configuration: '', unit_reference: '', carpet: '', price: '', source: '', availability: 'unknown' });

function ProjectForm({ cities, userId, onDone }: { cities: City[]; userId: string; onDone: () => void }) {
  const [f, setF] = useState({ registeredName: '', brand: '', websiteUrl: '', developerRera: '', projectName: '', cityId: '', localityId: '', address: '', projectRera: '', status: 'under_construction', category: 'residential', officialUrl: '' });
  const [units, setUnits] = useState<Unit[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  useEffect(() => { if (!f.cityId) { setLocalities([]); return; } getLocalities(f.cityId).then(setLocalities).catch(() => setLocalities([])); }, [f.cityId]);
  const addFiles = (list: FileList | null) => {
    const picked = Array.from(list ?? []);
    const bad = picked.find((x) => !['image/jpeg', 'image/png', 'image/webp'].includes(x.type) || x.size > 8 * 1024 * 1024);
    if (bad) { setErr('Photos must be JPG, PNG or WebP and under 8 MB each.'); return; }
    setErr(null); setFiles((p) => [...p, ...picked].slice(0, 8));
  };
  const setUnit = (i: number, k: keyof Unit, v: string) => setUnits((p) => p.map((u, j) => (j === i ? { ...u, [k]: v } : u)));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setOk(false);
    if (!f.registeredName.trim() || !f.projectName.trim() || !f.cityId) return setErr(ERR.builder_name_project_name_and_city_required);
    if (!isUrl(f.websiteUrl) || !isUrl(f.officialUrl)) return setErr(ERR.valid_developer_and_project_source_urls_required);
    if (files.length < 1 || files.length > 8) return setErr(ERR.upload_between_1_and_8_project_photos);
    const filled = units.filter((u) => u.configuration.trim());
    if (filled.some((u) => !isUrl(u.source))) return setErr(ERR.inventory_source_url_required);
    setBusy(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) uploaded.push(await uploadProjectImage(userId, file));
      await submitBuilderProject({
        ...f, inventory: filled.map((u) => ({
          configuration: u.configuration.trim(), unit_reference: u.unit_reference.trim() || null,
          carpet_area_sqft: u.carpet ? Number(u.carpet) : null, asking_price_inr: u.price ? Number(u.price) : null,
          source_url: u.source.trim(), availability_status: u.availability, market_type: 'primary',
        })), mediaPaths: uploaded,
      });
      track('supply_project_submitted', undefined, { photos: files.length, units: filled.length });
      setOk(true); setFiles([]); setUnits([]); setF((p) => ({ ...p, projectName: '', address: '', projectRera: '', officialUrl: '', localityId: '' })); onDone();
    } catch (x) { await removeProjectImages(uploaded).catch(() => {}); track('supply_submit_failed', undefined, { kind: 'project', code: errCode(x) }); setErr(msgOf(x)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} style={card}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Submit a project</h2>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 18 }}>Add the developer, the project and its photos. Details stay private until we verify the developer’s and project’s official sources and RERA registration.</p>
      <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 10px' }}>Developer</h3>
      <div style={grid2}>
        <Field label="Registered developer name *"><input style={inp} value={f.registeredName} onChange={(e) => set('registeredName', e.target.value)} maxLength={160} required /></Field>
        <Field label="Brand name (if different)"><input style={inp} value={f.brand} onChange={(e) => set('brand', e.target.value)} maxLength={120} /></Field>
        <Field label="Developer website *"><input style={inp} placeholder="https://" value={f.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} required /></Field>
        <Field label="Developer RERA registration" hint="If the developer is registered as a promoter."><input style={inp} value={f.developerRera} onChange={(e) => set('developerRera', e.target.value)} maxLength={60} /></Field>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 800, margin: '22px 0 10px' }}>Project</h3>
      <div style={grid2}>
        <Field label="Project name *"><input style={inp} value={f.projectName} onChange={(e) => set('projectName', e.target.value)} maxLength={160} required /></Field>
        <Field label="Project RERA number" hint="Check it on your state’s RERA website first."><input style={inp} value={f.projectRera} onChange={(e) => set('projectRera', e.target.value)} maxLength={60} /></Field>
        <Field label="City *"><select style={inp} value={f.cityId} onChange={(e) => { set('cityId', e.target.value); set('localityId', ''); }} required><option value="">Select a city</option>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Locality"><select style={inp} value={f.localityId} onChange={(e) => set('localityId', e.target.value)} disabled={!f.cityId}><option value="">{f.cityId ? 'Select a locality' : 'Select city first'}</option>{localities.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></Field>
        <Field label="Category *"><select style={inp} value={f.category} onChange={(e) => set('category', e.target.value)}>{['residential', 'commercial', 'plotted', 'mixed_use', 'industrial', 'other'].map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}</select></Field>
        <Field label="Construction status *"><select style={inp} value={f.status} onChange={(e) => set('status', e.target.value)}>{['upcoming', 'under_construction', 'completed', 'on_hold', 'cancelled', 'unknown'].map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}</select></Field>
        <Field label="Official project page *" hint="The developer’s or RERA project page for this project."><input style={inp} placeholder="https://" value={f.officialUrl} onChange={(e) => set('officialUrl', e.target.value)} required /></Field>
        <Field label="Project address"><input style={inp} value={f.address} onChange={(e) => set('address', e.target.value)} maxLength={200} /></Field>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 800, margin: '22px 0 4px' }}>Available units <span style={{ fontWeight: 400, color: '#6B7280' }}>(optional, up to 5)</span></h3>
      <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>Availability is shown publicly only after we verify the project, and only while the information is recent.</p>
      {units.map((u, i) => (
        <div key={i} style={{ ...grid2, padding: 14, border: '1px solid #F3F4F6', borderRadius: 14, marginBottom: 10 }}>
          <Field label="Configuration"><input style={inp} placeholder="e.g. 2 BHK" value={u.configuration} onChange={(e) => setUnit(i, 'configuration', e.target.value)} maxLength={40} /></Field>
          <Field label="Unit / tower reference"><input style={inp} value={u.unit_reference} onChange={(e) => setUnit(i, 'unit_reference', e.target.value)} maxLength={60} /></Field>
          <Field label="Carpet area (sq ft)"><input style={inp} type="number" min={0} value={u.carpet} onChange={(e) => setUnit(i, 'carpet', e.target.value)} /></Field>
          <Field label="Asking price (₹)"><input style={inp} type="number" min={0} value={u.price} onChange={(e) => setUnit(i, 'price', e.target.value)} /></Field>
          <Field label="Availability"><select style={inp} value={u.availability} onChange={(e) => setUnit(i, 'availability', e.target.value)}>{['available', 'on_hold', 'booked', 'sold', 'unknown'].map((a) => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}</select></Field>
          <Field label="Source link *"><input style={inp} placeholder="https://" value={u.source} onChange={(e) => setUnit(i, 'source', e.target.value)} /></Field>
          <button type="button" onClick={() => setUnits((p) => p.filter((_, j) => j !== i))} style={{ alignSelf: 'end', fontSize: 13, color: '#B91C1C', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Remove unit</button>
        </div>
      ))}
      {units.length < 5 && <button type="button" onClick={() => setUnits((p) => [...p, emptyUnit()])} style={{ fontSize: 13, fontWeight: 600, color: '#2563EB', background: 'none', border: '1px solid #BFDBFE', borderRadius: 9999, padding: '8px 16px', cursor: 'pointer' }}>+ Add a unit</button>}
      <h3 style={{ fontSize: 14, fontWeight: 800, margin: '22px 0 4px' }}>Project photos *</h3>
      <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>1 to 8 photos. JPG, PNG or WebP, up to 8 MB each. Only upload images you own or have the right to use.</p>
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} aria-label="Project photos" />
      {files.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {files.map((file, i) => (
            <li key={i} style={{ fontSize: 12, background: '#F3F4F6', borderRadius: 9999, padding: '4px 10px' }}>{file.name} <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#B91C1C' }}>×</button></li>
          ))}
        </ul>
      )}
      {err && <p role="alert" style={{ color: '#B91C1C', fontSize: 13, marginTop: 14 }}>{err}</p>}
      {ok && <p role="status" style={{ color: '#047857', fontSize: 13, marginTop: 14 }}>Submitted. It will show as “Waiting for review” below.</p>}
      <button type="submit" disabled={busy} style={{ ...btn, marginTop: 18, opacity: busy ? 0.6 : 1 }}>{busy ? 'Uploading and submitting…' : 'Submit for review'}</button>
    </form>
  );
}

function SupplyInner() {
  const params = useSearchParams();
  const asked = params.get('role');
  const want: Want | null = asked === 'owner' || asked === 'agent' || asked === 'builder' ? asked : null;
  const { user, profile, loading, refresh } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [subs, setSubs] = useState<Subs>({ projects: [], brokerages: [] });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const loadSubs = (uid: string) => getMySubmissions(uid).then(setSubs).catch(() => {});
  useEffect(() => { getCities().then(setCities).catch(() => {}); }, []);
  useEffect(() => { if (user) loadSubs(user.id); }, [user]);

  const wrap = (children: React.ReactNode) => (
    <>
      <Nav />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>Supply onboarding</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Share your inventory with GoNest. Everything you submit is reviewed before it is shown to the public.</p>
        {children}
      </main>
      <Footer />
    </>
  );

  if (loading) return wrap(<p style={{ color: '#6B7280' }}>Loading…</p>);
  if (!user) {
    const next = encodeURIComponent('/dashboard/supply' + (want ? `?role=${want}` : ''));
    return wrap(
      <section style={card}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Sign in to continue</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>Create a free account or sign in to submit your listings, agency or projects.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={`/auth?mode=signup&next=${next}`} style={{ ...btn, display: 'inline-block' }}>Create account</Link>
          <Link href={`/auth?next=${next}`} style={{ ...btn, display: 'inline-block', background: '#fff', color: '#111827', border: '1px solid #D1D5DB' }}>Sign in</Link>
        </div>
      </section>,
    );
  }
  if (!profile) return wrap(<section style={card}><p style={{ fontSize: 14, marginBottom: 12 }}>We couldn’t load your account profile.</p><button style={btn} onClick={() => refresh()}>Retry</button></section>);

  const role = profile.role;
  const choose = async (r: Want) => {
    setBusy(true); setErr(null);
    try { await chooseAccountType(r); track('supply_account_type_chosen', undefined, { role: r }); await refresh(); } catch (x) { setErr(msgOf(x)); } finally { setBusy(false); }
  };

  if (role === 'buyer') {
    const options: { r: Want; t: string; d: string }[] = [
      { r: 'owner', t: 'Property owner', d: 'List your own rental or resale property.' },
      { r: 'agent', t: 'Agent or broker', d: 'Submit your agency and manage listings.' },
      { r: 'builder', t: 'Developer / builder', d: 'Submit projects, photos and available units.' },
    ];
    return wrap(
      <section style={card}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{want ? `Continue as ${options.find((o) => o.r === want)?.t.toLowerCase()}` : 'How will you use GoNest?'}</h2>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>This sets up your supply account. It can’t be changed later without contacting support, so choose carefully.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.filter((o) => !want || o.r === want).map((o) => (
            <button key={o.r} disabled={busy} onClick={() => choose(o.r)} style={{ textAlign: 'left', padding: '16px 18px', border: '1px solid #D1D5DB', borderRadius: 14, background: '#fff', cursor: 'pointer' }}>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{o.t}</span>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{o.d}</span>
            </button>
          ))}
          {want && <Link href="/dashboard/supply" style={{ fontSize: 13, color: '#2563EB' }}>Choose a different account type</Link>}
        </div>
        {err && <p role="alert" style={{ color: '#B91C1C', fontSize: 13, marginTop: 14 }}>{err}</p>}
      </section>,
    );
  }
  if (role === 'admin') return wrap(<section style={card}><p style={{ fontSize: 14 }}>Admins review submissions in the <Link href="/admin" style={{ color: '#2563EB', textDecoration: 'underline' }}>Admin panel</Link> under “Supply review”.</p></section>);

  return wrap(
    <>
      {want && want !== role && <p role="status" style={{ fontSize: 13, color: '#B45309', marginBottom: 16 }}>Your account is registered as {role}, so you’re seeing the {role} tools. To change your account type, please contact support.</p>}
      {role === 'owner' && (
        <section style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>List your property</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>Add complete property details, location, pricing, availability, amenities and photos. Your listing goes live after review.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link href="/dashboard/new" style={{ ...btn, display: 'inline-block' }}>Create a listing</Link><Link href="/dashboard/settings" style={{ ...btn, display: 'inline-block', background: '#fff', color: '#111827', border: '1px solid #D1D5DB' }}>Edit my profile & photo</Link></div>
        </section>
      )}
      {role === 'agent' && (
        <>
          <section style={card}><h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Your public agent profile</h2><p style={{ fontSize: 14, color: '#6B7280', marginBottom: 14 }}>Add your professional photo, experience, contact details and agency information so customers can understand who they are contacting.</p><Link href="/dashboard/settings" style={{ ...btn, display: 'inline-block' }}>Edit profile & upload photo</Link></section>
          <AgencyForm cities={cities} onDone={() => loadSubs(user.id)} />
          <section style={card}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Your listings</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>Create and manage rental and resale listings, photos, pricing, availability and enquiries from your dashboard.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link href="/dashboard/new" style={{ ...btn, display: 'inline-block' }}>Create a listing</Link><Link href="/dashboard" style={{ ...btn, display: 'inline-block', background: '#fff', color: '#111827', border: '1px solid #D1D5DB' }}>Manage inventory</Link></div>
          </section>
        </>
      )}
      {role === 'builder' && <><section style={card}><h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Developer profile</h2><p style={{ fontSize: 14, color: '#6B7280', marginBottom: 14 }}>Keep your company name, public photo/avatar and overview up to date. Project submissions are managed below.</p><Link href="/dashboard/settings" style={{ ...btn, display: 'inline-block' }}>Edit company profile</Link></section><ProjectForm cities={cities} userId={user.id} onDone={() => loadSubs(user.id)} /></>}
      {(role === 'agent' || role === 'builder') && <Submissions subs={subs} cities={cities} />}
    </>,
  );
}

export default function SupplyPage() {
  return <Suspense fallback={null}><SupplyInner /></Suspense>;
}
