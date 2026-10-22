'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { chooseAccountType, getCities, getLocalities } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { City, Locality } from '@/lib/types';

const field = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const label = 'block text-sm font-medium text-slate-700';

export default function NewBuilderProjectPage() {
  const router = useRouter();
  const { user, profile, loading, refresh } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [cityId, setCityId] = useState('');
  const [localityId, setLocalityId] = useState('');
  const [registeredName, setRegisteredName] = useState('');
  const [brand, setBrand] = useState('');
  const [website, setWebsite] = useState('');
  const [developerRera, setDeveloperRera] = useState('');
  const [projectName, setProjectName] = useState('');
  const [address, setAddress] = useState('');
  const [projectRera, setProjectRera] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [category, setCategory] = useState('residential');
  const [construction, setConstruction] = useState('unknown');
  const [configuration, setConfiguration] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/auth?mode=signup&next=%2Fdashboard%2Fprojects%2Fnew');
  }, [loading, user, router]);

  useEffect(() => { getCities().then(setCities).catch(() => setError('Could not load launch cities. Refresh and try again.')); }, []);
  useEffect(() => {
    setLocalityId('');
    if (!cityId) { setLocalities([]); return; }
    getLocalities(cityId).then(setLocalities).catch(() => setError('Could not load localities for this city.'));
  }, [cityId]);

  async function becomeBuilder() {
    if (!user) { router.push('/auth?mode=signup&next=%2Fdashboard%2Fprojects%2Fnew'); return; }
    setBusy(true); setError('');
    try { await chooseAccountType('builder'); await refresh(); }
    catch (e) { setError((e as {message?: string})?.message ?? 'Could not enable builder access. Please try again.'); }
    finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); setSuccess('');
    if (configuration.trim() && !sourceUrl.trim()) {
      setBusy(false); setError('Add an official source URL for the unit or configuration reference.'); return;
    }
    if (photos.length < 1 || photos.length > 8) {
      setBusy(false); setError('Upload between 1 and 8 genuine project photos.'); return;
    }
    if (photos.some(file => !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024)) {
      setBusy(false); setError('Project photos must be JPG, PNG or WebP and no larger than 8 MB each.'); return;
    }
    const uploadedPaths: string[] = [];
    const validUrl = (value: string) => /^https?:\/\//i.test(value.trim());
    if (!validUrl(website) || !validUrl(officialUrl) || (sourceUrl.trim() && !validUrl(sourceUrl))) {
      setBusy(false); setError('Use complete URLs beginning with https:// for the developer website, project source and any unit source.'); return;
    }
    try {
      const inventory = configuration.trim() ? [{
        configuration: configuration.trim(),
        carpet_area_sqft: area ? Number(area) : null,
        asking_price_inr: price ? Number(price) : null,
        availability_status: 'unknown',
        market_type: 'primary',
        source_url: sourceUrl.trim(),
        evidence_notes: 'Builder-submitted reference; availability is not independently verified.',
      }] : [];
      for (const photo of photos) {
        const extension = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg';
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from('project-images').upload(path, photo, { contentType: photo.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
      }
      const { data, error: rpcError } = await supabase.rpc('submit_builder_project_with_media', {
        p_registered_name: registeredName.trim(),
        p_operating_brand: brand.trim() || null,
        p_website_url: website.trim(),
        p_rera_registration: developerRera.trim() || null,
        p_project_name: projectName.trim(),
        p_city_id: cityId,
        p_locality_id: localityId || null,
        p_public_address: address.trim() || null,
        p_rera_number: projectRera.trim() || null,
        p_construction_status: construction,
        p_project_category: category,
        p_official_project_url: officialUrl.trim(),
        p_inventory: inventory,
        p_media_paths: uploadedPaths,
      });
      if (rpcError) throw rpcError;
      const projectId = typeof data === 'string' ? data : (data as {project_id?: string})?.project_id;
      setSuccess(`Project submitted for review. It will not be shown as verified or available until GoNest checks the details.${projectId ? ` Reference: ${projectId}` : ''}`);
      setRegisteredName(''); setBrand(''); setWebsite(''); setDeveloperRera('');
      setProjectName(''); setAddress(''); setProjectRera(''); setOfficialUrl('');
      setConfiguration(''); setArea(''); setPrice(''); setSourceUrl(''); setPhotos([]);
    } catch (e) {
      if (uploadedPaths.length) {
        await supabase.storage.from('project-images').remove(uploadedPaths).catch(() => undefined);
      }
      const message = (e as {message?: string})?.message ?? '';
      setError(message.includes('builder_account_required') || message.includes('Builder account required')
        ? 'Your account needs builder access before you can submit a project.'
        : message || 'Project submission failed. Check the details and try again.');
    } finally { setBusy(false); }
  }

  if (loading || !user) return <><Nav /><main className="mx-auto max-w-3xl px-5 py-20"><p className="text-sm text-slate-500">Preparing your builder workspace…</p></main><Footer /></>;
  if (profile?.role !== 'builder') return <><Nav /><main className="mx-auto max-w-3xl px-5 py-16"><Link href="/dashboard" className="text-sm font-semibold text-blue-700">← Dashboard</Link><section className="mt-5 rounded-2xl border border-slate-200 bg-white p-7"><h1 className="text-2xl font-extrabold text-slate-950">Submit a new project</h1><p className="mt-3 text-sm leading-6 text-slate-600">Builder accounts can submit developer and project details. New submissions remain pending until GoNest reviews their source and registration details.</p><button disabled={busy} onClick={becomeBuilder} className="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Setting up…' : 'Continue as a builder'}</button>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</section></main><Footer /></>;

  return <><Nav /><main className="mx-auto max-w-4xl px-5 py-8 md:py-12">
    <Link href="/dashboard" className="text-sm font-semibold text-blue-700 hover:underline">← Builder workspace</Link>
    <div className="mt-5 max-w-3xl"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">GoNest · Builder supply</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Submit a new project</h1><p className="mt-3 text-sm leading-6 text-slate-600">Provide the official source and project details once. GoNest reviews every submission before it can be described as verified or available.</p></div>
    {success && <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{success}<div className="mt-3"><Link href="/dashboard/project-enquiries" className="font-bold underline">Open project enquiries</Link></div></div>}
    {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    <form onSubmit={submit} className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <section><h2 className="text-lg font-bold text-slate-950">Developer details</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={label}>Registered company name *<input required minLength={2} maxLength={180} value={registeredName} onChange={e=>setRegisteredName(e.target.value)} className={field} placeholder="Legal developer name"/></label>
        <label className={label}>Operating brand<input maxLength={120} value={brand} onChange={e=>setBrand(e.target.value)} className={field} placeholder="Brand name (if different)"/></label>
        <label className={label}>Official developer website *<input required type="url" value={website} onChange={e=>setWebsite(e.target.value)} className={field} placeholder="https://developer.example"/></label>
        <label className={label}>Developer MahaRERA registration<input maxLength={100} value={developerRera} onChange={e=>setDeveloperRera(e.target.value)} className={field} placeholder="Registration number, if applicable"/></label>
      </div></section>
      <section><h2 className="text-lg font-bold text-slate-950">Project details</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={label}>Project name *<input required minLength={3} maxLength={180} value={projectName} onChange={e=>setProjectName(e.target.value)} className={field} placeholder="Official project name"/></label>
        <label className={label}>Launch city *<select required value={cityId} onChange={e=>setCityId(e.target.value)} className={field}><option value="">Choose Mumbai or Pune</option>{cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className={label}>Locality<select value={localityId} onChange={e=>setLocalityId(e.target.value)} className={field}><option value="">Choose locality (optional)</option>{localities.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
        <label className={label}>Project category<select value={category} onChange={e=>setCategory(e.target.value)} className={field}><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="plotted">Plotted development</option><option value="mixed_use">Mixed use</option><option value="industrial">Industrial</option><option value="other">Other</option></select></label>
        <label className={label}>Construction status<select value={construction} onChange={e=>setConstruction(e.target.value)} className={field}><option value="unknown">Not confirmed</option><option value="upcoming">Upcoming</option><option value="under_construction">Under construction</option><option value="completed">Completed</option><option value="on_hold">On hold</option><option value="cancelled">Cancelled</option></select></label>
        <label className={label}>Project MahaRERA number<input maxLength={100} value={projectRera} onChange={e=>setProjectRera(e.target.value)} className={field} placeholder="Project registration, if applicable"/></label>
        <label className={label+" sm:col-span-2"}>Public address<input maxLength={300} value={address} onChange={e=>setAddress(e.target.value)} className={field} placeholder="Street, locality or project address"/></label>
        <label className={label+" sm:col-span-2"}>Official project source URL *<input required type="url" value={officialUrl} onChange={e=>setOfficialUrl(e.target.value)} className={field} placeholder="https://developer.example/project"/></label>
      </div></section>
      <section><h2 className="text-lg font-bold text-slate-950">Project photos *</h2><p className="mt-1 text-sm leading-6 text-slate-600">Upload 1–8 genuine project images you have permission to share. Photos remain private until the project passes GoNest review.</p><label className={label+" mt-4"}>Project photos (JPG, PNG or WebP; up to 8 MB each)<input required type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>setPhotos(Array.from(e.target.files ?? []).slice(0,8))} className={field+" file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2"}/></label>{photos.length>0&&<ul className="mt-3 space-y-1 text-xs text-slate-600">{photos.map((photo,i)=><li key={photo.name+i}>{photo.name} · {(photo.size/1024/1024).toFixed(1)} MB</li>)}</ul>}</section>
      <section><h2 className="text-lg font-bold text-slate-950">Optional inventory reference</h2><p className="mt-1 text-sm leading-6 text-slate-600">Add a published configuration or unit reference if available. Availability will remain unconfirmed until independently checked.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={label}>Configuration<input maxLength={80} value={configuration} onChange={e=>setConfiguration(e.target.value)} className={field} placeholder="e.g. 2 BHK"/></label>
        <label className={label}>Carpet area (sq ft)<input type="number" min="1" max="100000" value={area} onChange={e=>setArea(e.target.value)} className={field} placeholder="Published area"/></label>
        <label className={label}>Published asking price (INR)<input type="number" min="1" max="10000000000" value={price} onChange={e=>setPrice(e.target.value)} className={field} placeholder="Published price"/></label>
        <label className={label}>Official unit/configuration source<input type="url" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} className={field} placeholder="https://developer.example/price-list"/></label>
      </div></section>
      <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Submitting does not mean a project is verified, available, or approved for advertising. GoNest will review the official source and evidence first.</div>
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Submitting project…' : 'Submit project for review'}</button>
    </form>
  </main><Footer /></>;
}
