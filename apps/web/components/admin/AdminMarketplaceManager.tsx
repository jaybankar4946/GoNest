'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Kind = 'agents' | 'builders' | 'projects' | 'listings';
type Row = Record<string, any> & { id: string };
type Field = { key: string; label: string; kind?: 'text' | 'number' | 'boolean' | 'date' | 'array' | 'json'; wide?: boolean };

const FIELD_MAP: Record<Kind, Field[]> = {
  agents: [
    { key: 'full_name', label: 'Full name' }, { key: 'role', label: 'Account role' },
    { key: 'agency_name', label: 'Agency / company' }, { key: 'rera_number', label: 'RERA number' },
    { key: 'avatar_url', label: 'Profile photo URL', wide: true }, { key: 'bio', label: 'Professional bio', wide: true },
    { key: 'service_localities', label: 'Service localities (comma separated)', kind: 'array', wide: true },
    { key: 'service_pincodes', label: 'Service PIN codes (comma separated)', kind: 'array', wide: true },
    { key: 'agent_verified', label: 'Agent verified', kind: 'boolean' }, { key: 'builder_verified', label: 'Builder verified', kind: 'boolean' },
  ],
  builders: [
    { key: 'registered_name', label: 'Registered company name' }, { key: 'operating_brand', label: 'Builder / brand name' },
    { key: 'website_url', label: 'Website URL', wide: true }, { key: 'public_phone', label: 'Public phone' },
    { key: 'public_business_address', label: 'Business address', wide: true }, { key: 'public_enquiry_url', label: 'Enquiry URL', wide: true },
    { key: 'rera_registration', label: 'RERA registration' }, { key: 'operating_cities', label: 'Operating cities (comma separated)', kind: 'array', wide: true },
    { key: 'verification_status', label: 'Verification status' }, { key: 'source_url', label: 'Source URL', wide: true },
  ],
  projects: [
    { key: 'official_name', label: 'Project name' }, { key: 'developer_id', label: 'Developer ID' },
    { key: 'public_address', label: 'Address', wide: true }, { key: 'city_id', label: 'City ID' }, { key: 'locality_id', label: 'Locality ID' },
    { key: 'pincode', label: 'PIN code' }, { key: 'landmark', label: 'Landmark' }, { key: 'neighbourhood', label: 'Neighbourhood' },
    { key: 'rera_number', label: 'RERA number' }, { key: 'project_category', label: 'Project category' },
    { key: 'construction_status', label: 'Construction status' }, { key: 'launch_date', label: 'Launch date', kind: 'date' },
    { key: 'expected_possession_date', label: 'Expected possession', kind: 'date' }, { key: 'total_units', label: 'Total units', kind: 'number' },
    { key: 'published_price_min_inr', label: 'Minimum price (INR)', kind: 'number' }, { key: 'published_price_max_inr', label: 'Maximum price (INR)', kind: 'number' },
    { key: 'inventory_status', label: 'Inventory status' }, { key: 'verification_status', label: 'Verification status' },
    { key: 'official_project_url', label: 'Official project URL', wide: true }, { key: 'brochure_url', label: 'Brochure URL', wide: true },
    { key: 'cover_image_url', label: 'Cover photo URL', wide: true }, { key: 'gallery_image_urls', label: 'Gallery photo URLs (comma separated)', kind: 'array', wide: true },
    { key: 'configurations', label: 'Configurations (JSON)', kind: 'json', wide: true },
  ],
  listings: [
    { key: 'title', label: 'Listing title', wide: true }, { key: 'purpose', label: 'Buy / Rent' },
    { key: 'property_type', label: 'Property type' }, { key: 'price', label: 'Price (INR)', kind: 'number' },
    { key: 'maintenance_monthly', label: 'Monthly maintenance', kind: 'number' }, { key: 'security_deposit', label: 'Security deposit', kind: 'number' },
    { key: 'bedrooms', label: 'Bedrooms', kind: 'number' }, { key: 'bathrooms', label: 'Bathrooms', kind: 'number' },
    { key: 'sqft', label: 'Area (sq ft)', kind: 'number' }, { key: 'carpet_area', label: 'Carpet area', kind: 'number' },
    { key: 'floor_number', label: 'Floor', kind: 'number' }, { key: 'total_floors', label: 'Total floors', kind: 'number' },
    { key: 'furnishing', label: 'Furnishing' }, { key: 'property_age', label: 'Property age', kind: 'number' },
    { key: 'address_line', label: 'Address', wide: true }, { key: 'neighbourhood', label: 'Neighbourhood' },
    { key: 'landmark', label: 'Landmark' }, { key: 'pincode', label: 'PIN code' },
    { key: 'brokerage', label: 'Brokerage' }, { key: 'facing', label: 'Facing' },
    { key: 'available_from', label: 'Available from', kind: 'date' }, { key: 'availability', label: 'Availability' },
    { key: 'description', label: 'Description', wide: true }, { key: 'amenities', label: 'Amenities (comma separated)', kind: 'array', wide: true },
    { key: 'video_url', label: 'Video URL', wide: true }, { key: 'status', label: 'Listing status' },
    { key: 'verification_level', label: 'Verification level' }, { key: 'featured', label: 'Featured', kind: 'boolean' },
  ],
};

const TABLES: Record<Kind, string> = { agents: 'profiles', builders: 'developers', projects: 'real_estate_projects', listings: 'listings' };
const LABELS: Record<Kind, string> = { agents: 'Agent profiles', builders: 'Builder companies', projects: 'Projects', listings: 'Buy & Rent listings' };
const SELECTS: Record<Kind, string> = {
  agents: 'id,full_name,role,agency_name,rera_number,agent_verified,builder_verified,avatar_url,bio,service_localities,service_pincodes,is_sample',
  builders: 'id,registered_name,operating_brand,website_url,public_phone,public_business_address,public_enquiry_url,rera_registration,operating_cities,verification_status,source_url,is_sample',
  projects: 'id,official_name,developer_id,public_address,city_id,locality_id,pincode,landmark,neighbourhood,rera_number,project_category,construction_status,launch_date,expected_possession_date,total_units,published_price_min_inr,published_price_max_inr,inventory_status,verification_status,official_project_url,brochure_url,cover_image_url,gallery_image_urls,configurations,is_sample',
  listings: 'id,title,purpose,property_type,price,maintenance_monthly,security_deposit,bedrooms,bathrooms,sqft,carpet_area,floor_number,total_floors,furnishing,property_age,address_line,neighbourhood,landmark,pincode,brokerage,facing,available_from,availability,description,amenities,video_url,status,verification_level,featured,city_id,locality_id,is_sample',
};

function displayName(kind: Kind, row: Row) {
  if (kind === 'agents') return row.full_name || 'Unnamed profile';
  if (kind === 'builders') return row.operating_brand || row.registered_name || 'Unnamed builder';
  if (kind === 'projects') return row.official_name || 'Unnamed project';
  return row.title || 'Untitled listing';
}
function toDraft(row: Row, fields: Field[]) {
  const result: Record<string, any> = {};
  fields.forEach(field => {
    const value = row[field.key];
    result[field.key] = field.kind === 'array' ? (Array.isArray(value) ? value.join(', ') : '')
      : field.kind === 'json' ? JSON.stringify(value ?? {}, null, 2)
      : value == null ? '' : value;
  });
  return result;
}

export function AdminMarketplaceManager() {
  const [kind, setKind] = useState<Kind>('agents');
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const fields = FIELD_MAP[kind];

  const load = useCallback(async () => {
    setLoading(true); setNotice('');
    try {
      let query = supabase.from(TABLES[kind]).select(SELECTS[kind]).order('created_at', { ascending: false }).limit(500);
      if (kind === 'agents') query = query.in('role', ['agent', 'owner', 'builder']);
      const { data, error } = await query;
      if (error) throw error;
      setRows((data ?? []) as Row[]);
      setSelected(null); setDraft({});
    } catch (error: any) {
      setNotice(error?.message || 'Could not load records. Check Admin permissions and database policies.');
      setRows([]);
    } finally { setLoading(false); }
  }, [kind]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(row => fields.some(field => String(row[field.key] ?? '').toLowerCase().includes(term)) || row.id.toLowerCase().includes(term));
  }, [rows, search, fields]);

  const choose = (row: Row) => { setSelected(row); setDraft(toDraft(row, fields)); setNotice(''); };
  const updateField = (key: string, value: any) => setDraft(old => ({ ...old, [key]: value }));

  const save = async () => {
    if (!selected) return;
    setSaving(true); setNotice('');
    try {
      const payload: Record<string, any> = {};
      fields.forEach(field => {
        const raw = draft[field.key];
        if (field.kind === 'boolean') payload[field.key] = Boolean(raw);
        else if (field.kind === 'number') payload[field.key] = raw === '' ? null : Number(raw);
        else if (field.kind === 'array') payload[field.key] = String(raw ?? '').split(',').map((v: string) => v.trim()).filter(Boolean);
        else if (field.kind === 'json') payload[field.key] = raw === '' ? {} : JSON.parse(String(raw));
        else payload[field.key] = raw === '' ? null : raw;
      });
      const { data, error } = await supabase.from(TABLES[kind]).update(payload).eq('id', selected.id).select('id').maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('No record was updated. Confirm this account has Super Admin database permissions.');
      setNotice('Changes saved successfully.');
      await load();
    } catch (error: any) {
      setNotice(error?.message || 'Could not save changes.');
    } finally { setSaving(false); }
  };

  const removeFromDirectory = async (row: Row) => {
    if (!confirm('Remove this profile from the public directory? This changes its role to buyer and keeps its account and records.')) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ role: 'buyer' }).eq('id', row.id);
      if (error) throw error;
      setNotice('Profile removed from the public directory; account and records retained.');
      await load();
    } catch (error: any) { setNotice(error?.message || 'Could not update profile.'); }
    finally { setSaving(false); }
  };

  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 0.85fr) minmax(0, 1.5fr)', gap: 18, alignItems: 'start' }}>
      <div style={{ minWidth: 0, border: '1px solid #E5E7EB', borderRadius: 14, padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 750, marginBottom: 6 }}>Marketplace editor</h2>
        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>Central editing access for all supplier profiles and marketplace inventory. Sample records are clearly marked and remain separate from verified supply.</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {(Object.keys(LABELS) as Kind[]).map(item => <button key={item} onClick={() => { setKind(item); setSearch(''); }} style={{ border: '1px solid #E5E7EB', borderRadius: 999, padding: '7px 10px', fontSize: 11, background: kind === item ? '#111827' : '#fff', color: kind === item ? '#fff' : '#374151' }}>{LABELS[item]}</button>)}
        </div>
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search records…" style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 9, fontSize: 13, marginBottom: 10 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>{filtered.length} records</span>
          <button onClick={() => void load()} disabled={loading} style={{ border: 0, background: 'transparent', textDecoration: 'underline', fontSize: 12, cursor: 'pointer' }}>Refresh</button>
        </div>
        <div style={{ maxHeight: 620, overflowY: 'auto', display: 'grid', gap: 7 }}>
          {loading && <p style={{ fontSize: 13, color: '#6B7280' }}>Loading records…</p>}
          {!loading && filtered.length === 0 && <p style={{ fontSize: 13, color: '#6B7280' }}>No matching records found.</p>}
          {filtered.map(row => <button key={row.id} onClick={() => choose(row)} style={{ textAlign: 'left', border: selected?.id === row.id ? '2px solid #111827' : '1px solid #E5E7EB', borderRadius: 10, background: selected?.id === row.id ? '#F9FAFB' : '#fff', padding: 10, cursor: 'pointer' }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 650, color: '#111827' }}>{displayName(kind, row)}</span>
            <span style={{ display: 'block', fontSize: 11, color: '#6B7280', marginTop: 3 }}>{row.is_sample ? 'SAMPLE DATA' : 'LIVE RECORD'} · {String(row.id).slice(0, 8)}</span>
          </button>)}
        </div>
      </div>
      <div style={{ minWidth: 0, border: '1px solid #E5E7EB', borderRadius: 14, padding: 18 }}>
        {!selected ? <div style={{ padding: '30px 8px', textAlign: 'center', color: '#6B7280' }}><p style={{ fontSize: 15, fontWeight: 650, color: '#111827' }}>Select a record to edit</p><p style={{ fontSize: 12, marginTop: 6 }}>Choose an Agent, Builder, Project or Buy/Rent listing from the left.</p></div> : <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start', marginBottom: 16 }}>
            <div><h3 style={{ fontSize: 17, fontWeight: 750 }}>{displayName(kind, selected)}</h3><p style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>Record ID: {selected.id}</p></div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '5px 8px', borderRadius: 999, background: selected.is_sample ? '#FEF3C7' : '#DCFCE7', color: selected.is_sample ? '#92400E' : '#166534' }}>{selected.is_sample ? 'SAMPLE' : 'LIVE'}</span>
          </div>
          {kind === 'listings' && <p style={{ fontSize: 11, color: '#92400E', background: '#FFFBEB', padding: 9, borderRadius: 8, marginBottom: 12 }}>Editing listing details does not change its poster/owner. For photos, manage the listing's existing image records in the listing photo section once enabled.</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 11 }}>
            {fields.map(field => <label key={field.key} style={{ display: 'grid', gap: 5, gridColumn: field.wide ? '1 / -1' : undefined, fontSize: 11, fontWeight: 650, color: '#374151' }}>
              {field.label}
              {field.kind === 'boolean' ? <select value={String(Boolean(draft[field.key]))} onChange={event => updateField(field.key, event.target.value === 'true')} style={{ padding: 9, border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff' }}><option value="true">Yes</option><option value="false">No</option></select>
                : field.kind === 'json' || field.wide && ['bio', 'description'].includes(field.key) ? <textarea rows={field.kind === 'json' ? 6 : 4} value={draft[field.key] ?? ''} onChange={event => updateField(field.key, event.target.value)} style={{ width: '100%', padding: 9, border: '1px solid #D1D5DB', borderRadius: 8, resize: 'vertical', fontSize: 12, fontFamily: field.kind === 'json' ? 'monospace' : 'inherit' }} />
                : <input type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'} value={draft[field.key] ?? ''} onChange={event => updateField(field.key, event.target.value)} style={{ width: '100%', padding: 9, border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 12 }} />}
            </label>)}
          </div>
          {notice && <p role="status" style={{ marginTop: 14, fontSize: 12, color: notice.includes('successfully') || notice.includes('retained') ? '#15803D' : '#B91C1C' }}>{notice}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
            {kind === 'agents' && <button onClick={() => void removeFromDirectory(selected)} disabled={saving} style={{ marginRight: 'auto', border: '1px solid #FCA5A5', color: '#B91C1C', background: '#fff', borderRadius: 999, padding: '9px 13px', fontSize: 12 }}>Remove from directory</button>}
            <button onClick={() => choose(selected)} disabled={saving} style={{ border: '1px solid #D1D5DB', background: '#fff', borderRadius: 999, padding: '9px 14px', fontSize: 12 }}>Discard</button>
            <button onClick={() => void save()} disabled={saving} style={{ border: 0, background: '#111827', color: '#fff', borderRadius: 999, padding: '9px 18px', fontSize: 12, fontWeight: 700 }}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </>}
        {notice && !selected && <p role="status" style={{ fontSize: 12, color: '#B91C1C', marginTop: 12 }}>{notice}</p>}
      </div>
    </section>
  );
}
