'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  adminMyAccess, adminList, adminUpdate, adminDeleteListing, adminSetUserRole, adminSetStaffPermissions, adminListAudit,
  getListingImages, persistListingOrder, addListingImage, replaceListingImage, deleteListingImage, uploadAdminImage,
  removeAdminObjectByUrl, removeStoragePaths, mediaUrl, validateImage, type Access, type ListingImage, type Row, type Page,
} from '@/lib/adminApi';
import { adminModerate, adminReviewProjectUnit } from '@/lib/api';
import { ENTITIES, MODULES, VERIFICATION_QUEUES, type Cfg, type Field, type Action, type Tone } from './entities';

const PAGE = 20;
const TONE: Record<Tone, React.CSSProperties> = {
  ok: { background: '#ECFDF3', color: '#15803D' }, warn: { background: '#FFF7E6', color: '#B45309' },
  err: { background: '#FEF2F2', color: '#B91C1C' }, muted: { background: '#F3F4F6', color: '#4B5563' },
};
const box: React.CSSProperties = { background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12 };
const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #D4D4D4', borderRadius: 8, fontSize: 13, background: '#fff', color: '#111' };
const btn = (kind: 'primary' | 'ghost' | 'danger' = 'ghost', disabled = false): React.CSSProperties => ({
  padding: '7px 13px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
  border: kind === 'primary' ? '1px solid #2563EB' : kind === 'danger' ? '1px solid #FCA5A5' : '1px solid #D4D4D4',
  background: kind === 'primary' ? '#2563EB' : kind === 'danger' ? '#FEF2F2' : '#fff',
  color: kind === 'primary' ? '#fff' : kind === 'danger' ? '#B91C1C' : '#111',
});
const errText = (e: unknown) => (e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as any).message) : 'Something went wrong');

export function can(a: Access | null, module: string, action: 'view' | 'edit' | 'publish' | 'delete'): boolean {
  if (!a?.is_admin) return false;
  if (a.is_super) return true;
  const p = a.permissions;
  if (!p || !p.modules.includes(module)) return false;
  return action === 'view' ? true : action === 'edit' ? p.can_edit : action === 'publish' ? p.can_publish : p.can_delete;
}

function Badge({ t, tone }: { t: string; tone: Tone }) {
  return <span style={{ ...TONE[tone], fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>{String(t).replace(/_/g, ' ')}</span>;
}
function Notice({ m }: { m: { ok: boolean; text: string } | null }) {
  if (!m) return null;
  return <div role="status" style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13, margin: '8px 0', ...(m.ok ? TONE.ok : TONE.err) }}>{m.text}</div>;
}

/* ------------------------------------------------------------ form helpers */
const toLocalInput = (v: string | null) => { if (!v) return ''; const d = new Date(v); if (isNaN(+d)) return ''; return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
function toForm(f: Field, v: any): any {
  switch (f.t) {
    case 'bool': return !!v;
    case 'list': return Array.isArray(v) ? v.join('\n') : '';
    case 'json': return v === null || v === undefined ? '' : JSON.stringify(v, null, 2);
    case 'date': return v ? String(v).slice(0, 10) : '';
    case 'datetime': return toLocalInput(v);
    case 'number': return v === null || v === undefined ? '' : String(v);
    default: return v ?? '';
  }
}
function parseField(f: Field, raw: any): { v: any; err?: string } {
  const s = typeof raw === 'string' ? raw.trim() : raw;
  if (f.req && (s === '' || s === null || s === undefined)) return { v: null, err: `${f.label} is required` };
  switch (f.t) {
    case 'bool': return { v: !!raw };
    case 'number': { if (s === '') return { v: null }; const n = Number(s); return isNaN(n) ? { v: null, err: `${f.label} must be a number` } : { v: n }; }
    case 'list': return { v: String(raw || '').split(/[\n,]/).map(x => x.trim()).filter(Boolean) };
    case 'json': { if (s === '') return { v: null }; try { return { v: JSON.parse(s) }; } catch { return { v: null, err: `${f.label} is not valid JSON` }; } }
    case 'datetime': { if (!s) return { v: null }; const d = new Date(s); return isNaN(+d) ? { v: null, err: `${f.label} is not a valid date` } : { v: d.toISOString() }; }
    case 'date': return { v: s || null };
    case 'select': return { v: s === '' ? null : s };
    default: {
      if (s && /url$/.test(f.k) && !/^https?:\/\//i.test(s)) return { v: s, err: `${f.label} must start with http:// or https://` };
      return { v: s === '' ? null : s };
    }
  }
}

/* ---------------------------------------------------------------- audit */
export function AuditView({ entityId, compact }: { entityId?: string; compact?: boolean }) {
  const [q, setQ] = useState(entityId || ''); const [type, setType] = useState(''); const [page, setPage] = useState(0);
  const [data, setData] = useState<Page>({ total: 0, rows: [] }); const [err, setErr] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  useEffect(() => {
    let live = true; setLoading(true);
    const t = setTimeout(() => adminListAudit({ search: q, entityType: type, limit: compact ? 15 : 40, offset: page * (compact ? 15 : 40) })
      .then(d => { if (live) { setData(d); setErr(null); } }).catch(e => live && setErr(errText(e))).finally(() => live && setLoading(false)), 250);
    return () => { live = false; clearTimeout(t); };
  }, [q, type, page, compact]);
  const per = compact ? 15 : 40;
  return (
    <div>
      {!compact && <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input value={q} onChange={e => { setQ(e.target.value); setPage(0); }} placeholder="Search by admin, action, record id or field…" style={{ ...inp, maxWidth: 360 }} />
        <select value={type} onChange={e => { setType(e.target.value); setPage(0); }} style={{ ...inp, maxWidth: 220 }}>
          <option value="">All record types</option>
          {['profiles', 'listings', 'listing_images', 'developers', 'real_estate_projects', 'project_inventory_observations', 'admin_staff_permissions'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>}
      {err && <Notice m={{ ok: false, text: err }} />}
      {loading && <p style={{ fontSize: 12, color: '#777' }}>Loading…</p>}
      {!loading && !err && data.rows.length === 0 && <p style={{ fontSize: 13, color: '#777' }}>No audit entries.</p>}
      <div style={{ display: 'grid', gap: 8 }}>
        {data.rows.map(r => {
          const ch = r.details?.changes as Record<string, [any, any]> | undefined;
          return (
            <div key={r.id} style={{ ...box, padding: '10px 12px', fontSize: 12.5 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <strong>{r.actor_name}</strong><Badge t={r.action} tone="muted" /><span style={{ color: '#555' }}>{r.entity_type}</span>
                <code style={{ color: '#888' }}>{String(r.entity_id || '').slice(0, 8)}</code>
                <span style={{ marginLeft: 'auto', color: '#888' }}>{new Date(r.created_at).toLocaleString()}</span>
              </div>
              {ch && Object.entries(ch).slice(0, compact ? 4 : 12).map(([k, [o, n]]) => (
                <div key={k} style={{ marginTop: 4, color: '#333', wordBreak: 'break-word' }}>
                  <b>{k}</b>: <span style={{ color: '#B91C1C' }}>{JSON.stringify(o)?.slice(0, 110)}</span> → <span style={{ color: '#15803D' }}>{JSON.stringify(n)?.slice(0, 110)}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <Pager total={data.total} page={page} per={per} setPage={setPage} />
    </div>
  );
}

function Pager({ total, page, per, setPage }: { total: number; page: number; per: number; setPage: (n: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / per));
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, fontSize: 12.5, color: '#555' }}>
      <button style={btn('ghost', page === 0)} disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page + 1} of {pages} · {total} record{total === 1 ? '' : 's'}</span>
      <button style={btn('ghost', page + 1 >= pages)} disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
}

/* ---------------------------------------------------------------- media */
function MediaManager({ cfg, row, onChanged }: { cfg: Cfg; row: Row; onChanged: (r: Row) => void }) {
  const [images, setImages] = useState<ListingImage[]>([]);
  const [cover, setCover] = useState<string | null>(null); const [gallery, setGallery] = useState<string[]>([]);
  const [pending, setPending] = useState<{ file: File; preview: string; err: string | null }[]>([]);
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const replaceRef = useRef<HTMLInputElement>(null); const replaceTarget = useRef<any>(null);
  const m = cfg.media; const listing = !!cfg.listingMedia;

  const syncFromRow = useCallback((r: Row) => { if (m) { setCover(m.cover ? r[m.cover] || null : null); setGallery(Array.isArray(r[m.gallery!]) ? r[m.gallery!] : []); } }, [m]);
  useEffect(() => { if (listing) getListingImages(row.id).then(setImages).catch(e => setMsg({ ok: false, text: errText(e) })); else syncFromRow(row); }, [row.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => pending.forEach(p => URL.revokeObjectURL(p.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(true); setMsg(null);
    try { await fn(); setMsg({ ok: true, text: label }); } catch (e) { setMsg({ ok: false, text: errText(e) }); } finally { setBusy(false); }
  };
  const pick = (files: FileList | null) => {
    if (!files) return;
    setPending(p => [...p, ...Array.from(files).map(file => ({ file, preview: URL.createObjectURL(file), err: validateImage(file) }))]);
  };
  const clearPending = () => { pending.forEach(p => URL.revokeObjectURL(p.preview)); setPending([]); };
  const valid = pending.filter(p => !p.err);

  // ---- listing_images mode
  const reloadListing = async () => { const imgs = await getListingImages(row.id); setImages(imgs); onChanged({ ...row, image_count: imgs.length }); };
  const lUpload = () => run(`${valid.length} photo(s) uploaded`, async () => {
    let order = images.length; for (const p of valid) { await addListingImage(row.id, p.file, order++); }
    clearPending(); await reloadListing();
  });
  const lMove = (i: number, d: number) => run('Order saved', async () => { const a = [...images]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; await persistListingOrder(a); await reloadListing(); });
  const lCover = (i: number) => run('Cover image set', async () => { const a = [...images]; const [x] = a.splice(i, 1); a.unshift(x); await persistListingOrder(a); await reloadListing(); });
  const lDelete = (i: number) => { if (!confirm('Delete this photo permanently?')) return; run('Photo deleted', async () => { await deleteListingImage(images[i]); const rest = images.filter((_, k) => k !== i); await persistListingOrder(rest); await reloadListing(); }); };
  const lReplace = (img: ListingImage, f: File) => run('Photo replaced', async () => { await replaceListingImage(img, f, row.id); await reloadListing(); });

  // ---- url-array mode
  const persist = async (nextCover: string | null, nextGallery: string[]) => {
    const patch: Row = { [m!.gallery!]: nextGallery };
    if (m!.cover) patch[m!.cover] = nextCover;
    const updated = await adminUpdate(cfg.id, row.id, patch);
    syncFromRow(updated); onChanged({ ...row, ...updated });
  };
  const uUpload = () => run(`${valid.length} photo(s) uploaded`, async () => {
    const urls: string[] = []; const done: string[] = [];
    try {
      for (const p of valid) { const r = await uploadAdminImage(`${m!.folder}/${row.id}`, p.file); urls.push(r.url); done.push(r.url); }
      await persist(cover || (m!.cover ? urls[0] : null), [...gallery, ...urls]);
    } catch (e) { for (const u of done) await removeAdminObjectByUrl(u); throw e; }
    clearPending();
  });
  const uMove = (i: number, d: number) => run('Order saved', async () => { const a = [...gallery]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; await persist(cover, a); });
  const uCover = (url: string) => run('Cover image set', async () => {
    if (m!.cover) await persist(url, gallery.includes(url) ? gallery : [url, ...gallery]);
    else await persist(null, [url, ...gallery.filter(g => g !== url)]);
  });
  const uDelete = (url: string) => { if (!confirm('Remove this photo?')) return; run('Photo removed', async () => { const g = gallery.filter(x => x !== url); await persist(cover === url ? g[0] || null : cover, g); await removeAdminObjectByUrl(url); }); };
  const uReplace = (url: string, f: File) => run('Photo replaced', async () => {
    const r = await uploadAdminImage(`${m!.folder}/${row.id}`, f);
    try { await persist(cover === url ? r.url : cover, gallery.map(x => x === url ? r.url : x)); } catch (e) { await removeAdminObjectByUrl(r.url); throw e; }
    await removeAdminObjectByUrl(url);
  });

  const items: { key: string; src: string; isCover: boolean; ref: any; external: boolean }[] = listing
    ? images.map((im, i) => ({ key: im.id, src: mediaUrl(im.storage_path), isCover: i === 0, ref: im, external: false }))
    : [...(cover && !gallery.includes(cover) ? [cover] : []), ...gallery].map(u => ({ key: u, src: u, isCover: m!.cover ? u === cover : u === gallery[0], ref: u, external: !u.includes('/listing-images/admin/') }));
  const idx = (it: typeof items[number]) => (listing ? images.findIndex(x => x.id === it.key) : gallery.indexOf(it.ref));

  return (
    <div>
      <Notice m={msg} />
      <input ref={replaceRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => {
        const f = e.target.files?.[0]; const t = replaceTarget.current; e.target.value = ''; if (!f || !t) return;
        listing ? lReplace(t, f) : uReplace(t, f);
      }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
        {items.map(it => {
          const i = idx(it);
          return (
            <div key={it.key} style={{ ...box, overflow: 'hidden' }}>
              <div style={{ position: 'relative', aspectRatio: '4/3', background: '#F3F4F6' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0.2'; }} />
                {it.isCover && <span style={{ position: 'absolute', top: 6, left: 6 }}><Badge t="cover" tone="ok" /></span>}
                {it.external && <span style={{ position: 'absolute', top: 6, right: 6 }}><Badge t="external" tone="muted" /></span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: 6 }}>
                <button style={btn('ghost', busy || i <= 0)} disabled={busy || i <= 0} onClick={() => listing ? lMove(i, -1) : uMove(i, -1)} title="Move earlier">◀</button>
                <button style={btn('ghost', busy || i < 0 || i >= (listing ? images.length : gallery.length) - 1)} disabled={busy || i < 0 || i >= (listing ? images.length : gallery.length) - 1} onClick={() => listing ? lMove(i, 1) : uMove(i, 1)} title="Move later">▶</button>
                {!it.isCover && <button style={btn('ghost', busy)} disabled={busy} onClick={() => listing ? lCover(i) : uCover(it.ref)}>Cover</button>}
                <button style={btn('ghost', busy)} disabled={busy} onClick={() => { replaceTarget.current = it.ref; replaceRef.current?.click(); }}>Replace</button>
                <button style={btn('danger', busy)} disabled={busy} onClick={() => listing ? lDelete(i) : uDelete(it.ref)}>Delete</button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p style={{ fontSize: 13, color: '#777' }}>No photos yet.</p>}
      </div>
      <div style={{ ...box, padding: 12, marginTop: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Add photos (JPG, PNG or WebP, up to 10 MB each)</label>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e => { pick(e.target.files); e.target.value = ''; }} style={{ display: 'block', marginTop: 6, fontSize: 13 }} />
        {pending.length > 0 && <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {pending.map((p, i) => (
              <div key={i} style={{ width: 96, fontSize: 11 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt="" style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 6, border: p.err ? '2px solid #DC2626' : '1px solid #ddd' }} />
                <div style={{ color: p.err ? '#B91C1C' : '#555', wordBreak: 'break-word' }}>{p.err ? 'Invalid' : 'Preview'}</div>
              </div>
            ))}
          </div>
          {pending.some(p => p.err) && <p style={{ fontSize: 12, color: '#B91C1C', marginTop: 6 }}>{pending.filter(p => p.err).map(p => p.err).join(' · ')} (these will be skipped)</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button style={btn('primary', busy || valid.length === 0)} disabled={busy || valid.length === 0} onClick={listing ? lUpload : uUpload}>{busy ? 'Uploading…' : `Upload ${valid.length} photo${valid.length === 1 ? '' : 's'}`}</button>
            <button style={btn('ghost', busy)} disabled={busy} onClick={clearPending}>Clear</button>
          </div>
        </>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- role / staff */
function RolePanel({ row, access, onChanged }: { row: Row; access: Access; onChanged: () => void }) {
  const [role, setRole] = useState<string>(row.role); const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null); const [busy, setBusy] = useState(false);
  const sp = row.staff || {};
  const [mods, setMods] = useState<string[]>(sp.modules || []); const [pe, setPe] = useState(!!sp.can_edit); const [pp, setPp] = useState(!!sp.can_publish); const [pd, setPd] = useState(!!sp.can_delete);
  const isSuper = !!access.is_super;
  const act = async (label: string, fn: () => Promise<unknown>) => { setBusy(true); setMsg(null); try { await fn(); setMsg({ ok: true, text: label }); onChanged(); } catch (e) { setMsg({ ok: false, text: errText(e) }); } finally { setBusy(false); } };
  const sel = role === 'admin';
  return (
    <div>
      <Notice m={msg} />
      <p style={{ fontSize: 12.5, color: '#555', marginBottom: 8 }}>Current role: <b>{row.role}{row.role === 'admin' ? ` (${row.admin_level})` : ''}</b>. Only a Super Admin can grant or remove administrator access. You cannot change your own role, and the last Super Admin cannot be removed.</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...inp, maxWidth: 220 }} value={role} onChange={e => setRole(e.target.value)}>
          {['buyer', 'owner', 'agent', 'builder', 'admin'].map(r => <option key={r} value={r}>{r === 'admin' ? 'admin (staff)' : r}</option>)}
        </select>
        <button style={btn('primary', busy || role === row.role)} disabled={busy || role === row.role}
          onClick={() => { if (confirm(`Change this user's role to "${role}"?`)) act('Role updated', () => adminSetUserRole(row.id, role, role === 'admin' ? 'staff' : undefined)); }}>Change role</button>
      </div>
      {row.role === 'admin' && row.admin_level === 'staff' && (
        <div style={{ ...box, padding: 12, marginTop: 14 }}>
          <b style={{ fontSize: 13 }}>Admin Staff permissions</b>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 6, margin: '10px 0' }}>
            {MODULES.map(m => <label key={m.id} style={{ fontSize: 13 }}><input type="checkbox" disabled={!isSuper} checked={mods.includes(m.id)} onChange={e => setMods(e.target.checked ? [...mods, m.id] : mods.filter(x => x !== m.id))} /> {m.label}</label>)}
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, flexWrap: 'wrap' }}>
            <label><input type="checkbox" disabled={!isSuper} checked={pe} onChange={e => setPe(e.target.checked)} /> Can edit</label>
            <label><input type="checkbox" disabled={!isSuper} checked={pp} onChange={e => setPp(e.target.checked)} /> Can verify / publish / feature / suspend</label>
            <label><input type="checkbox" disabled={!isSuper} checked={pd} onChange={e => setPd(e.target.checked)} /> Can delete</label>
          </div>
          <button style={{ ...btn('primary', busy || !isSuper), marginTop: 12 }} disabled={busy || !isSuper} onClick={() => act('Permissions saved', () => adminSetStaffPermissions(row.id, mods, pe, pp, pd))}>Save permissions</button>
        </div>
      )}
      {sel && row.role !== 'admin' && <p style={{ fontSize: 12, color: '#777', marginTop: 8 }}>New administrators start as Admin Staff with no module access until you assign permissions.</p>}
    </div>
  );
}

/* --------------------------------------------------------------- drawer */
function Drawer({ cfg, row0, access, startTab, onClose, onChanged }: { cfg: Cfg; row0: Row; access: Access; startTab?: string; onClose: () => void; onChanged: () => void }) {
  const [row, setRow] = useState<Row>(row0);
  const [tab, setTab] = useState(startTab || 'details');
  const initial = useMemo(() => Object.fromEntries(cfg.fields.map(f => [f.k, toForm(f, row[f.k])])), [cfg, row]);
  const [form, setForm] = useState<Row>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null); const [busy, setBusy] = useState(false);
  const [devs, setDevs] = useState<Row[]>([]);
  useEffect(() => setForm(initial), [initial]);
  useEffect(() => { if (cfg.fields.some(f => f.t === 'developer')) adminList('builders', { limit: 100, filters: { is_sample: 'any' } }).then(d => setDevs(d.rows)).catch(() => {}); }, [cfg]);

  const canEdit = can(access, cfg.module, 'edit');
  const { patch, errors } = useMemo(() => {
    const p: Row = {}; const errs: string[] = [];
    for (const f of cfg.fields) {
      const cur = parseField(f, form[f.k]); if (cur.err) errs.push(cur.err);
      const orig = parseField({ ...f, req: false }, initial[f.k]);
      if (JSON.stringify(cur.v) !== JSON.stringify(orig.v)) p[f.k] = cur.v;
    }
    return { patch: p, errors: errs };
  }, [form, initial, cfg]);
  const dirty = Object.keys(patch).length > 0;

  const refresh = async () => { const d = await adminList(cfg.id, { id: row.id, filters: { is_sample: 'any' } }); if (d.rows[0]) setRow(d.rows[0]); onChanged(); };
  const run = async (label: string, fn: () => Promise<void>) => { setBusy(true); setMsg(null); try { await fn(); await refresh(); setMsg({ ok: true, text: label }); } catch (e) { setMsg({ ok: false, text: errText(e) }); } finally { setBusy(false); } };

  const save = () => { if (errors.length) { setMsg({ ok: false, text: errors.join(' · ') }); return; } run('Changes saved', async () => { await adminUpdate(cfg.id, row.id, patch); }); };
  const close = () => { if (dirty && !confirm('You have unsaved changes. Close and discard them?')) return; onClose(); };
  const doAction = (a: Action) => {
    if (dirty) { setMsg({ ok: false, text: 'Save or discard your changes first.' }); return; }
    if (a.confirm && !confirm(a.confirm)) return;
    let reason: string | undefined;
    if (a.moderate?.askReason) { const r = prompt('Reason for rejection (shown to the poster):'); if (r === null) return; reason = r; }
    run(`${a.label}: done`, async () => { if (a.moderate) await adminModerate(row.id, a.moderate.status, a.moderate.verification, reason); else await adminUpdate(cfg.id, row.id, a.patch!); });
  };
  const del = async () => {
    const t = prompt('This permanently deletes the listing and its photos. Type DELETE to confirm:');
    if (t !== 'DELETE') return;
    setBusy(true); setMsg(null);
    try { const r = await adminDeleteListing(row.id); await removeStoragePaths(r.storage_paths || []); onChanged(); onClose(); } catch (e) { setMsg({ ok: false, text: errText(e) }); setBusy(false); }
  };

  const visibleActions = cfg.actions.filter(a => (!a.show || a.show(row)) && can(access, cfg.module, a.perm));
  const hasMedia = !!(cfg.media || cfg.listingMedia);
  const tabs = ['details', ...(hasMedia ? ['photos'] : []), 'history', ...(cfg.id === 'users' ? ['role'] : [])];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 80, display: 'flex', justifyContent: 'flex-end' }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div role="dialog" aria-label={`Edit ${cfg.title(row)}`} style={{ background: '#fff', width: 'min(760px,100%)', height: '100%', overflowY: 'auto', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <div><h3 style={{ fontSize: 17, fontWeight: 700 }}>{cfg.title(row)}</h3><p style={{ fontSize: 12, color: '#777' }}>{cfg.label} · <code>{row.id}</code></p></div>
          <button style={btn('ghost')} onClick={close} aria-label="Close">✕</button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>{cfg.badges(row).map(([t, tone], i) => <Badge key={i} t={t} tone={tone} />)}</div>
        {visibleActions.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          {visibleActions.map(a => <button key={a.label} style={btn(a.danger ? 'danger' : 'ghost', busy)} disabled={busy} onClick={() => doAction(a)}>{a.label}</button>)}
          {cfg.id === 'inventory' && row.review_status === 'pending' && can(access, 'inventory', 'publish') && <>
            <button style={btn('ghost', busy)} disabled={busy} onClick={() => !dirty && run('Unit approved', async () => { await adminReviewProjectUnit(row.id, 'approved'); })}>Approve unit</button>
            <button style={btn('danger', busy)} disabled={busy} onClick={() => !dirty && confirm('Reject this unit?') && run('Unit rejected', async () => { await adminReviewProjectUnit(row.id, 'rejected'); })}>Reject unit</button>
          </>}
        </div>}
        <Notice m={msg} />
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E5E5E5', margin: '8px 0 14px' }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #2563EB' : '2px solid transparent', color: tab === t ? '#2563EB' : '#555', cursor: 'pointer' }}>{t === 'details' ? 'Details' : t === 'photos' ? 'Photos' : t === 'history' ? 'Audit history' : 'Role & access'}</button>)}
        </div>

        {tab === 'details' && <>
          {!canEdit && <Notice m={{ ok: false, text: 'You have view-only access to this module.' }} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
            {cfg.fields.map(f => (
              <div key={f.k} style={{ gridColumn: f.wide || f.t === 'textarea' || f.t === 'list' || f.t === 'json' ? '1 / -1' : undefined }}>
                {f.t === 'bool' ? (
                  <label style={{ fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" disabled={!canEdit} checked={!!form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.checked })} />{f.label}</label>
                ) : (<>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444' }}>{f.label}{f.req && ' *'}</label>
                  {f.t === 'textarea' || f.t === 'list' || f.t === 'json' ? <textarea disabled={!canEdit} rows={f.t === 'json' ? 6 : 3} style={{ ...inp, fontFamily: f.t === 'json' ? 'monospace' : undefined }} value={form[f.k] ?? ''} onChange={e => setForm({ ...form, [f.k]: e.target.value })} />
                  : f.t === 'select' ? <select disabled={!canEdit} style={inp} value={form[f.k] ?? ''} onChange={e => setForm({ ...form, [f.k]: e.target.value })}>{[...new Set([...(f.opts || []), form[f.k] ?? ''])].map(o => <option key={o} value={o}>{o || '—'}</option>)}</select>
                  : f.t === 'developer' ? <select disabled={!canEdit} style={inp} value={form[f.k] ?? ''} onChange={e => setForm({ ...form, [f.k]: e.target.value })}>
                      <option value="">—</option>{!devs.some(d => d.id === form[f.k]) && form[f.k] && <option value={form[f.k]}>{row.developer_name || form[f.k]}</option>}
                      {devs.map(d => <option key={d.id} value={d.id}>{d.operating_brand || d.registered_name}</option>)}</select>
                  : <input disabled={!canEdit} style={inp} type={f.t === 'number' ? 'number' : f.t === 'date' ? 'date' : f.t === 'datetime' ? 'datetime-local' : 'text'} step={f.t === 'number' ? 'any' : undefined} value={form[f.k] ?? ''} onChange={e => setForm({ ...form, [f.k]: e.target.value })} />}
                  {f.hint && <span style={{ fontSize: 11, color: '#888' }}>{f.hint}</span>}
                </>)}
              </div>
            ))}
          </div>
          {errors.length > 0 && dirty && <p style={{ fontSize: 12, color: '#B91C1C', marginTop: 10 }}>{errors.join(' · ')}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 18, position: 'sticky', bottom: 0, background: '#fff', padding: '10px 0', borderTop: '1px solid #eee', flexWrap: 'wrap' }}>
            <button style={btn('primary', busy || !dirty || !canEdit)} disabled={busy || !dirty || !canEdit} onClick={save}>{busy ? 'Saving…' : 'Save Changes'}</button>
            <button style={btn('ghost', busy || !dirty)} disabled={busy || !dirty} onClick={() => { setForm(initial); setMsg(null); }}>Discard Changes</button>
            <button style={btn('ghost')} onClick={close}>Cancel</button>
            {cfg.deletable && can(access, cfg.module, 'delete') && <button style={{ ...btn('danger', busy), marginLeft: 'auto' }} disabled={busy} onClick={del}>Delete…</button>}
          </div>
        </>}
        {tab === 'photos' && hasMedia && <MediaManager cfg={cfg} row={row} onChanged={r => { setRow(r); onChanged(); }} />}
        {tab === 'history' && <AuditView entityId={row.id} compact />}
        {tab === 'role' && <RolePanel row={row} access={access} onChanged={() => { refresh().catch(() => {}); }} />}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- list view */
function EntityManager({ cfg, access, presetFilters, startTab, editLabel }: { cfg: Cfg; access: Access; presetFilters?: Record<string, string>; startTab?: string; editLabel?: string }) {
  const [q, setQ] = useState(''); const [filters, setFilters] = useState<Record<string, string>>({}); const [samples, setSamples] = useState(false);
  const [page, setPage] = useState(0); const [data, setData] = useState<Page>({ total: 0, rows: [] });
  const [loading, setLoading] = useState(true); const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null); const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true; setLoading(true);
    const t = setTimeout(() => adminList(cfg.id, { search: q, filters: { ...presetFilters, ...filters, is_sample: samples ? 'any' : 'false' }, limit: PAGE, offset: page * PAGE })
      .then(d => { if (live) { setData(d); setErr(null); } }).catch(e => live && setErr(errText(e))).finally(() => live && setLoading(false)), 250);
    return () => { live = false; clearTimeout(t); };
  }, [cfg.id, q, filters, samples, page, tick, presetFilters]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <input value={q} onChange={e => { setQ(e.target.value); setPage(0); }} placeholder={`Search ${cfg.label.toLowerCase()}…`} style={{ ...inp, maxWidth: 300 }} aria-label="Search" />
        {cfg.filters.filter(f => !(presetFilters && f.k in presetFilters)).map(f => (
          <select key={f.k} aria-label={f.label} value={filters[f.k] || ''} onChange={e => { setFilters({ ...filters, [f.k]: e.target.value }); setPage(0); }} style={{ ...inp, width: 'auto' }}>
            <option value="">{f.label}: all</option>{f.opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
          </select>
        ))}
        <label style={{ fontSize: 12, color: '#555' }}><input type="checkbox" checked={samples} onChange={e => { setSamples(e.target.checked); setPage(0); }} /> include sample/demo records</label>
      </div>
      {err && <Notice m={{ ok: false, text: err }} />}
      {loading && <p style={{ fontSize: 12, color: '#777' }}>Loading…</p>}
      {!loading && !err && data.rows.length === 0 && <p style={{ fontSize: 13, color: '#777', padding: 12 }}>No records match.</p>}
      <div style={{ display: 'grid', gap: 8 }}>
        {data.rows.map(r => (
          <div key={r.id} style={{ ...box, padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{cfg.title(r)}{r.is_sample && <span style={{ marginLeft: 6 }}><Badge t="sample" tone="warn" /></span>}</div>
              <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cfg.sub(r)}</div>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{cfg.badges(r).map(([t, tone], i) => <Badge key={i} t={t} tone={tone} />)}</div>
            <button style={btn('primary')} onClick={() => setEditing(r)}>{editLabel || 'Edit'}</button>
          </div>
        ))}
      </div>
      <Pager total={data.total} page={page} per={PAGE} setPage={setPage} />
      {editing && <Drawer cfg={cfg} row0={editing} access={access} startTab={startTab} onClose={() => setEditing(null)} onChanged={() => setTick(t => t + 1)} />}
    </div>
  );
}

/* ------------------------------------------------------------- shell */
function Sub({ items, value, onChange }: { items: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>{items.map(i => <button key={i.id} onClick={() => onChange(i.id)} style={{ ...btn(value === i.id ? 'primary' : 'ghost') }}>{i.label}</button>)}</div>;
}

export default function CentralMarketplace({ profile }: { profile: { role?: string; admin_level?: string | null } | null }) {
  // The authenticated profile is already loaded by AuthProvider before /admin renders.
  // Use it as the initial UI gate so a transient RPC/session race cannot hide the panel.
  // All record reads/writes remain protected by the database admin RPCs and their checks.
  const isProfileSuper = profile?.role === 'admin' && profile.admin_level === 'super';
  const profileAccess: Access | null = profile?.role === 'admin'
    ? { is_admin: true, is_super: isProfileSuper }
    : null;
  const [access, setAccess] = useState<Access | null>(profileAccess); const [err, setErr] = useState<string | null>(null);
  const [mod, setMod] = useState('agents'); const [queue, setQueue] = useState('agents'); const [mediaKind, setMediaKind] = useState('buy');
  useEffect(() => {
    let active = true;

    // Apply the authenticated profile immediately, including when admin_level
    // arrives after the component's first render. Do not wait for the RPC to paint
    // the Super Admin controls.
    if (isProfileSuper) {
      setAccess(previous => ({ ...(previous ?? {}), is_admin: true, is_super: true }));
      setErr(null);
    }

    adminMyAccess()
      .then(a => {
        if (!active) return;
        // The RLS-protected profile is authoritative for Super Admin status.
        setAccess(isProfileSuper ? { ...a, is_admin: true, is_super: true } : a);
      })
      .catch(e => {
        if (!active) return;
        // A transient access-RPC failure must not hide controls for a Super Admin
        // whose role and admin_level have already been confirmed by AuthProvider.
        if (isProfileSuper) {
          setAccess(previous => ({ ...(previous ?? {}), is_admin: true, is_super: true }));
          setErr(errText(e));
        } else {
          setErr(errText(e));
        }
      });
    return () => { active = false; };
  }, [isProfileSuper]);
  const allowed = useMemo(() => MODULES.filter(m => can(access, m.id, 'view')), [access]);
  useEffect(() => { if (allowed.length && !allowed.some(m => m.id === mod)) setMod(allowed[0].id); }, [allowed, mod]);

  if (err && !access) return <section style={{ ...box, padding: 16, marginBottom: 28 }}><Notice m={{ ok: false, text: `Central Marketplace Management could not load: ${err}. Make sure the Super Admin database migration has been applied.` }} /></section>;
  if (!access) return <section style={{ ...box, padding: 16, marginBottom: 28, fontSize: 13, color: '#777' }}>Loading Central Marketplace Management…</section>;
  if (!access.is_admin) return null;
  const mediaKinds = ['buy', 'rent', 'projects', 'agents', 'owners', 'builders', 'inventory'].filter(k => can(access, ENTITIES[k].module, 'view'));

  return (
    <section aria-label="Central Marketplace Management" style={{ ...box, padding: 18, marginBottom: 32, borderColor: '#BFDBFE' }}>
      {err && <Notice m={{ ok: false, text: `Admin access details could not refresh: ${err}. Database permissions still apply to every action.` }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '.08em', color: '#1D4ED8' }}>CENTRAL MARKETPLACE MANAGEMENT</h2>
        <Badge t={access.is_super ? 'Super Admin' : 'Admin Staff'} tone={access.is_super ? 'ok' : 'warn'} />
      </div>
      {!access.is_super && allowed.length === 0 && <p style={{ fontSize: 13, color: '#777' }}>No modules have been assigned to your Admin Staff account yet. Ask a Super Admin to grant access.</p>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {allowed.map((m, i) => <button key={m.id} onClick={() => setMod(m.id)} style={btn(mod === m.id ? 'primary' : 'ghost')}>{i + 1}. {m.label}</button>)}
      </div>
      {mod === 'audit' ? <AuditView />
        : mod === 'verification' ? <>
          <Sub items={VERIFICATION_QUEUES.filter(v => can(access, ENTITIES[v.entity].module, 'view')).map(v => ({ id: v.id, label: v.label }))} value={queue} onChange={setQueue} />
          {VERIFICATION_QUEUES.filter(v => v.id === queue).map(v => <EntityManager key={v.id} cfg={ENTITIES[v.entity]} access={access} presetFilters={v.filters} editLabel="Review" />)}
        </>
        : mod === 'media' ? <>
          <Sub items={mediaKinds.map(k => ({ id: k, label: ENTITIES[k].label }))} value={mediaKind} onChange={setMediaKind} />
          {mediaKinds.includes(mediaKind) && <EntityManager key={mediaKind} cfg={ENTITIES[mediaKind]} access={access} startTab="photos" editLabel="Manage photos" />}
        </>
        : ENTITIES[mod] ? <EntityManager key={mod} cfg={ENTITIES[mod]} access={access} /> : null}
    </section>
  );
}
