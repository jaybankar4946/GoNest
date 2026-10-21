'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Building2, CheckCircle2, ExternalLink, Plus, RefreshCw } from 'lucide-react';

type City = { id: string; name: string };
type Locality = { id: string; name: string };
type ProjectRow = { id: string; official_name: string; verification_status: string; construction_status: string; inventory_status: string; created_at: string; city: { name: string } | null };

const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'block text-sm font-semibold text-slate-800';

export default function BuilderNewProjectPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cityId, setCityId] = useState('');
  const [localityId, setLocalityId] = useState('');
  const [form, setForm] = useState({
    registeredName: '', brand: '', websiteUrl: '', developerRera: '', developerAddress: '', developerPhone: '',
    projectName: '', projectAddress: '', officialUrl: '', brochureUrl: '', category: 'residential',
    construction: 'under_construction', configurations: '1 BHK, 2 BHK, 3 BHK', totalUnits: '',
    possession: '', minPrice: '', maxPrice: '', unitConfiguration: '', unitReference: '',
    unitArea: '', unitPrice: '', unitSourceUrl: '',
  });
  const update = useCallback((key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value })), []);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth?next=/dashboard/projects/new');
  }, [loading, user, router]);

  useEffect(() => {
    supabase.from('cities').select('id,name').eq('is_active', true).order('name')
      .then(({ data }) => setCities((data ?? []) as City[]));
  }, []);

  useEffect(() => {
    if (!cityId) { setLocalities([]); setLocalityId(''); return; }
    supabase.from('localities').select('id,name').eq('city_id', cityId).order('name')
      .then(({ data }) => setLocalities((data ?? []) as Locality[]));
  }, [cityId]);

  const loadProjects = useCallback(async () => {
    if (!user) { setLoadingProjects(false); return; }
    setLoadingProjects(true);
    const { data, error: queryError } = await supabase.from('real_estate_projects')
      .select('id,official_name,verification_status,construction_status,inventory_status,created_at,city:cities(name)')
      .eq('created_by_user_id', user.id).order('created_at', { ascending: false });
    if (queryError) setError('Could not load your submitted projects. Refresh and try again.');
    else setProjects((data ?? []) as unknown as ProjectRow[]);
    setLoadingProjects(false);
  }, [user]);

  useEffect(() => { void loadProjects(); }, [loadProjects]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || profile?.role !== 'builder') return;
    setError(''); setSuccess('');
    if (!cityId) { setError('Choose the project city.'); return; }
    if (!form.registeredName.trim() || !form.projectName.trim()) { setError('Enter both the developer/company name and project name.'); return; }
    if (!/^https?:\/\//i.test(form.websiteUrl) || !/^https?:\/\//i.test(form.officialUrl)) { setError('Add valid developer website and official project URLs starting with https://.'); return; }
    if (form.unitConfiguration.trim() && !/^https?:\/\//i.test(form.unitSourceUrl)) { setError('Add a source URL for the optional unit reference.'); return; }
    let configurations: string[];
    try { configurations = form.configurations.split(',').map(x => x.trim()).filter(Boolean); }
    catch { configurations = []; }
    setBusy(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('submit_builder_project', {
        p_registered_name: form.registeredName.trim(),
        p_brand: form.brand.trim() || null,
        p_website_url: form.websiteUrl.trim(),
        p_public_address: form.developerAddress.trim() || null,
        p_public_phone: form.developerPhone.trim() || null,
        p_rera_registration: form.developerRera.trim() || null,
        p_city_id: cityId,
        p_locality_id: localityId || null,
        p_project_name: form.projectName.trim(),
        p_project_address: form.projectAddress.trim() || null,
        p_official_url: form.officialUrl.trim(),
        p_brochure_url: form.brochureUrl.trim() || null,
        p_project_category: form.category,
        p_construction_status: form.construction,
        p_configurations: configurations,
        p_total_units: form.totalUnits ? Number(form.totalUnits) : null,
        p_expected_possession: form.possession || null,
        p_price_min: form.minPrice ? Number(form.minPrice) : null,
        p_price_max: form.maxPrice ? Number(form.maxPrice) : null,
        p_unit_configuration: form.unitConfiguration.trim() || null,
        p_unit_reference: form.unitReference.trim() || null,
        p_unit_area: form.unitArea ? Number(form.unitArea) : null,
        p_unit_price: form.unitPrice ? Number(form.unitPrice) : null,
        p_unit_source_url: form.unitSourceUrl.trim() || null,
      });
      if (rpcError) throw rpcError;
      const result = data as { project_id?: string; verification_status?: string };
      let photoNote = '';
      if (result.project_id && photos.length) {
        const uploadedPaths: string[] = [];
        try {
          for (let i = 0; i < photos.length; i++) {
            const file = photos[i];
            const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const path = user.id + '/projects/' + result.project_id + '/' + crypto.randomUUID() + '.' + ext;
            const { error: uploadError } = await supabase.storage.from('project-images').upload(path, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;
            uploadedPaths.push(path);
          }
          const { error: mediaError } = await supabase.from('project_media').insert(uploadedPaths.map((storage_path, sort_order) => ({
            project_id: result.project_id, storage_path, alt_text: form.projectName.trim() + ' project photo', sort_order, created_by_user_id: user.id, is_sample: false,
          })));
          if (mediaError) throw mediaError;
        } catch {
          if (uploadedPaths.length) await supabase.storage.from('project-images').remove(uploadedPaths);
          photoNote = ' Project details were submitted, but the photo upload did not finish. Please retry photos before publishing.';
        }
      }
      setSuccess('Project submitted for review. Reference: ' + (result.project_id ?? 'received') + '.' + photoNote);
      setPhotos([]);
      setForm(prev => ({ ...prev, projectName: '', projectAddress: '', officialUrl: '', brochureUrl: '', totalUnits: '', possession: '', minPrice: '', maxPrice: '', unitConfiguration: '', unitReference: '', unitArea: '', unitPrice: '', unitSourceUrl: '' }));
      await loadProjects();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit this project. Check the details and retry.');
    } finally { setBusy(false); }
  };

  if (loading || !user || !profile) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading account…</div>;

  if (profile.role !== 'builder' && profile.role !== 'admin') return (
    <><Nav/><main className="mx-auto max-w-xl px-5 py-20 text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300"/><h1 className="mt-4 text-2xl font-bold">Builder access required</h1><p className="mt-2 text-sm text-slate-600">Choose the Builder account type when creating an account, or sign in with your builder account to submit new projects.</p><Link href="/dashboard" className="mt-5 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white">Back to account</Link></main><Footer/></>
  );

  return (
    <><Nav/><main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><ArrowLeft className="h-4 w-4"/> Account dashboard</Link>
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="mb-6 flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Building2 className="h-6 w-6"/></div><div><h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Submit a new project</h1><p className="mt-1 text-sm text-slate-600">Add source-backed project details and optional unit references. New submissions remain pending review.</p></div></div>
            {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
            {success && <div role="status" className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 className="h-5 w-5 shrink-0"/>{success}</div>}
            <form onSubmit={submit} className="space-y-7">
              <div><h2 className="font-bold text-slate-900">Developer details</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>Registered company name<input required className={inputClass} value={form.registeredName} onChange={e=>update('registeredName',e.target.value)} placeholder="Legal developer name"/></label>
                <label className={labelClass}>Brand name<input className={inputClass} value={form.brand} onChange={e=>update('brand',e.target.value)} placeholder="Public-facing brand"/></label>
                <label className={labelClass}>Developer website<input required type="url" className={inputClass} value={form.websiteUrl} onChange={e=>update('websiteUrl',e.target.value)} placeholder="https://…"/></label>
                <label className={labelClass}>Official developer / MahaRERA registration<input className={inputClass} value={form.developerRera} onChange={e=>update('developerRera',e.target.value)} placeholder="If applicable"/></label>
                <label className={labelClass}>Public business phone<input type="tel" className={inputClass} value={form.developerPhone} onChange={e=>update('developerPhone',e.target.value)} placeholder="Business contact"/></label>
                <label className={labelClass}>Public business address<input className={inputClass} value={form.developerAddress} onChange={e=>update('developerAddress',e.target.value)} placeholder="Office address"/></label>
              </div></div>
              <div><h2 className="font-bold text-slate-900">Project details</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>Project name<input required className={inputClass} value={form.projectName} onChange={e=>update('projectName',e.target.value)} placeholder="Official project name"/></label>
                <label className={labelClass}>City<select required className={inputClass} value={cityId} onChange={e=>setCityId(e.target.value)}><option value="">Choose city</option>{cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                <label className={labelClass}>Locality<select className={inputClass} value={localityId} onChange={e=>setLocalityId(e.target.value)}><option value="">Choose locality (optional)</option>{localities.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
                <label className={labelClass}>Project category<select className={inputClass} value={form.category} onChange={e=>update('category',e.target.value)}>{[['residential','Residential'],['commercial','Commercial'],['plotted','Plotted development'],['mixed_use','Mixed use'],['industrial','Industrial'],['other','Other']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
                <label className={labelClass}>Construction status<select className={inputClass} value={form.construction} onChange={e=>update('construction',e.target.value)}>{[['upcoming','Upcoming'],['under_construction','Under construction'],['completed','Completed'],['on_hold','On hold'],['cancelled','Cancelled'],['unknown','Unknown']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
                <label className={labelClass}>Total units<input type="number" min="0" className={inputClass} value={form.totalUnits} onChange={e=>update('totalUnits',e.target.value)} placeholder="If published"/></label>
                <label className={labelClass}>Expected possession<input type="date" className={inputClass} value={form.possession} onChange={e=>update('possession',e.target.value)}/></label>
                <label className={labelClass}>Published minimum price (₹)<input type="number" min="1" className={inputClass} value={form.minPrice} onChange={e=>update('minPrice',e.target.value)} placeholder="Optional"/></label>
                <label className={labelClass}>Published maximum price (₹)<input type="number" min="1" className={inputClass} value={form.maxPrice} onChange={e=>update('maxPrice',e.target.value)} placeholder="Optional"/></label>
                <label className={labelClass}>Configurations<input className={inputClass} value={form.configurations} onChange={e=>update('configurations',e.target.value)} placeholder="1 BHK, 2 BHK, 3 BHK"/></label>
                <label className={labelClass}>Project address<input className={inputClass} value={form.projectAddress} onChange={e=>update('projectAddress',e.target.value)} placeholder="Street / landmark"/></label>
                <label className={labelClass}>Official project page<input required type="url" className={inputClass} value={form.officialUrl} onChange={e=>update('officialUrl',e.target.value)} placeholder="https://developer.com/project"/></label>
                <label className={labelClass}>Brochure URL<input type="url" className={inputClass} value={form.brochureUrl} onChange={e=>update('brochureUrl',e.target.value)} placeholder="Optional PDF or brochure link"/></label>
              </div></div>
              <div><h2 className="font-bold text-slate-900">Project photos</h2><p className="mt-1 text-sm text-slate-600">Upload genuine project, amenity or brochure images you are authorized to use. Photos are stored privately and appear publicly only after the project is verified.</p><label className={labelClass+" mt-3 block"}>Photos (up to 8, 5 MB each)<input type="file" accept="image/jpeg,image/png,image/webp" multiple className={inputClass} onChange={e=>{const files=Array.from(e.target.files ?? []);if(files.length>8){setError("Choose no more than 8 project photos.");setPhotos(files.slice(0,8));return;}if(files.some(file=>file.size>5*1024*1024)){setError("Each photo must be 5 MB or smaller.");return;}setError("");setPhotos(files);}}/></label>{photos.length>0&&<p className="mt-2 text-xs text-slate-500">{photos.length} photo{photos.length===1?"":"s"} selected: {photos.map(file=>file.name).join(", ")}</p>}</div>
              <div><h2 className="font-bold text-slate-900">Optional unit reference</h2><p className="mt-1 text-sm text-slate-600">This is stored as unverified inventory. It will not be shown as live availability until independently verified.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>Configuration<input className={inputClass} value={form.unitConfiguration} onChange={e=>update('unitConfiguration',e.target.value)} placeholder="e.g. 2 BHK"/></label>
                <label className={labelClass}>Unit reference<input className={inputClass} value={form.unitReference} onChange={e=>update('unitReference',e.target.value)} placeholder="Tower / unit code if publishable"/></label>
                <label className={labelClass}>Carpet area (sq ft)<input type="number" min="1" className={inputClass} value={form.unitArea} onChange={e=>update('unitArea',e.target.value)} placeholder="Optional"/></label>
                <label className={labelClass}>Quoted unit price (₹)<input type="number" min="1" className={inputClass} value={form.unitPrice} onChange={e=>update('unitPrice',e.target.value)} placeholder="Optional"/></label>
                <label className={labelClass+' sm:col-span-2'}>Unit source URL<input type="url" className={inputClass} value={form.unitSourceUrl} onChange={e=>update('unitSourceUrl',e.target.value)} placeholder="Official page or source showing this unit"/></label>
              </div></div>
              <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"><Plus className="h-4 w-4"/>{busy?'Submitting…':'Submit project for review'}</button>
              <p className="text-xs leading-5 text-slate-500">Submitting does not verify the developer, MahaRERA details, project facts, photos or availability. Keep source documents ready for review.</p>
            </form>
          </section>
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2"><h2 className="font-bold text-slate-900">Your submitted projects</h2><button onClick={()=>void loadProjects()} disabled={loadingProjects} aria-label="Refresh projects" className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-50"><RefreshCw className={'h-4 w-4 '+(loadingProjects?'animate-spin':'')}/></button></div>
            {loadingProjects ? <p className="mt-4 text-sm text-slate-500">Loading projects…</p> : projects.length===0 ? <p className="mt-4 text-sm leading-6 text-slate-500">Your project submissions will appear here with their review status.</p> : <div className="mt-4 space-y-3">{projects.map(p=><div key={p.id} className="rounded-xl border border-slate-100 p-3"><p className="font-semibold text-slate-900">{p.official_name}</p><p className="mt-1 text-xs text-slate-500">{p.city?.name ?? 'City not set'} · {p.construction_status.replaceAll('_',' ')}</p><span className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{p.verification_status}</span>{p.inventory_status==='advertised_unverified'&&<p className="mt-1 text-xs text-slate-500">Inventory awaiting verification</p>}</div>)}</div>}
            <a href="https://maharerait.mahaonline.gov.in/" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">MahaRERA portal <ExternalLink className="h-3.5 w-3.5"/></a>
          </aside>
        </div>
      </div>
    </main><Footer/></>
  );
}
