'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type City = { id: string; name: string };
type Locality = { id: string; name: string };

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

export default function BuilderDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [cityId, setCityId] = useState('');
  const [localityId, setLocalityId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    registeredName: '', brand: '', website: '', developerRera: '',
    projectName: '', projectRera: '', address: '', officialUrl: '',
    category: 'residential', construction: 'unknown',
    unitReference: '', configuration: '', area: '', price: '', availability: 'unknown',
  });
  const set = (key: keyof typeof form, value: string) => setForm(old => ({ ...old, [key]: value }));

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { router.replace('/auth?mode=signup&next=/builders/dashboard'); return; }
      const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', sessionData.session.user.id).maybeSingle();
      if (profileError || !profile || profile.role !== 'builder') {
        if (active) { setError('This workspace is for Builder / Developer accounts. Sign up or switch to the Builder account type to continue.'); setLoading(false); }
        return;
      }
      const { data: cityRows, error: cityError } = await supabase.from('cities').select('id,name').eq('is_active', true).in('name', ['Mumbai','Pune']).order('name');
      if (!active) return;
      if (cityError) setError('Could not load launch cities. Please refresh and try again.');
      setCities((cityRows ?? []) as City[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    let active = true;
    if (!cityId) { setLocalities([]); setLocalityId(''); return; }
    supabase.from('localities').select('id,name').eq('city_id', cityId).order('name').then(({ data }) => {
      if (active) setLocalities((data ?? []) as Locality[]);
    });
    return () => { active = false; };
  }, [cityId]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setSuccess('');
    if (!cityId) { setError('Choose the project city.'); return; }
    setSaving(true);
    const inventory = (form.unitReference || form.configuration || form.area || form.price) ? [{
      unit_reference: form.unitReference || null,
      configuration: form.configuration || null,
      carpet_area_sqft: form.area || null,
      asking_price_inr: form.price || null,
      availability_status: form.availability,
      market_type: 'primary',
      evidence_notes: 'Submitted by builder; pending GoNest verification',
    }] : [];
    const { data, error: submitError } = await supabase.rpc('submit_builder_project', {
      p_registered_name: form.registeredName,
      p_operating_brand: form.brand || null,
      p_website_url: form.website || null,
      p_rera_registration: form.developerRera || null,
      p_project_name: form.projectName,
      p_city_id: cityId,
      p_locality_id: localityId || null,
      p_public_address: form.address || null,
      p_rera_number: form.projectRera || null,
      p_construction_status: form.construction,
      p_project_category: form.category,
      p_official_project_url: form.officialUrl || null,
      p_inventory: inventory,
    });
    setSaving(false);
    if (submitError) { setError(submitError.message.includes('builder_account_required') ? 'Your account is not marked as a Builder / Developer yet. Sign in with the correct account type.' : 'We could not submit this project. Check the required fields and try again.'); return; }
    setSuccess('Project submitted. It remains pending review until GoNest checks the developer details, RERA information and inventory.');
    setForm({ registeredName:'', brand:'', website:'', developerRera:'', projectName:'', projectRera:'', address:'', officialUrl:'', category:'residential', construction:'unknown', unitReference:'', configuration:'', area:'', price:'', availability:'unknown' });
    setLocalityId('');
    void data;
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600"><LoaderCircle className="mr-2 animate-spin" size={18}/>Loading builder workspace…</main>;

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">GoNest</Link>
        <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"><ShieldCheck size={15}/> Supply partner workspace</span>
      </div>
    </header>
    <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-blue-700">Builders & developers</p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Submit your project inventory.</h1>
        <p className="mt-3 text-slate-600">Register your business and add a residential or commercial project for review. GoNest will not label your project or units verified until checks are complete.</p>
      </div>
      {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      {success && <div role="status" className="mb-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 size={18} className="shrink-0"/>{success}</div>}
      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2 text-blue-700"><Building2 size={20}/></span><div><h2 className="text-lg font-bold">Developer details</h2><p className="text-sm text-slate-500">Use your registered business details.</p></div></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className={labelClass}>Registered business name *</label><input required className={inputClass} value={form.registeredName} onChange={e=>set('registeredName',e.target.value)} /></div>
            <div><label className={labelClass}>Operating brand</label><input className={inputClass} value={form.brand} onChange={e=>set('brand',e.target.value)} /></div>
            <div><label className={labelClass}>Business website</label><input type="url" placeholder="https://" className={inputClass} value={form.website} onChange={e=>set('website',e.target.value)} /></div>
            <div><label className={labelClass}>Developer RERA registration</label><input className={inputClass} value={form.developerRera} onChange={e=>set('developerRera',e.target.value)} /></div>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-5 text-lg font-bold">Project details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className={labelClass}>Project name *</label><input required className={inputClass} value={form.projectName} onChange={e=>set('projectName',e.target.value)} /></div>
            <div><label className={labelClass}>Launch city *</label><select required className={inputClass} value={cityId} onChange={e=>{setCityId(e.target.value);setLocalityId('')}}><option value="">Select Mumbai or Pune</option>{cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className={labelClass}>Locality</label><select className={inputClass} value={localityId} onChange={e=>setLocalityId(e.target.value)}><option value="">Select locality (optional)</option>{localities.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
            <div><label className={labelClass}>Project RERA number</label><input className={inputClass} value={form.projectRera} onChange={e=>set('projectRera',e.target.value)} /></div>
            <div><label className={labelClass}>Project type</label><select className={inputClass} value={form.category} onChange={e=>set('category',e.target.value)}><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="plotted">Plots</option><option value="mixed_use">Mixed use</option><option value="industrial">Industrial</option><option value="other">Other</option></select></div>
            <div><label className={labelClass}>Construction stage</label><select className={inputClass} value={form.construction} onChange={e=>set('construction',e.target.value)}><option value="unknown">To be confirmed</option><option value="upcoming">Upcoming</option><option value="under_construction">Under construction</option><option value="completed">Completed</option><option value="on_hold">On hold</option></select></div>
            <div className="md:col-span-2"><label className={labelClass}>Project address</label><input className={inputClass} value={form.address} onChange={e=>set('address',e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Official project URL / evidence link</label><input type="url" placeholder="https://" className={inputClass} value={form.officialUrl} onChange={e=>set('officialUrl',e.target.value)} /><p className="mt-1.5 text-xs text-slate-500">Recommended for verification. An official link does not itself mean RERA or inventory is verified.</p></div>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="text-lg font-bold">Initial unit / inventory (optional)</h2><p className="mb-5 mt-1 text-sm text-slate-500">You can add one unit here. More inventory management can follow after the project is approved.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className={labelClass}>Unit reference</label><input className={inputClass} value={form.unitReference} onChange={e=>set('unitReference',e.target.value)} /></div>
            <div><label className={labelClass}>Configuration</label><input placeholder="e.g. 2 BHK" className={inputClass} value={form.configuration} onChange={e=>set('configuration',e.target.value)} /></div>
            <div><label className={labelClass}>Carpet area (sq ft)</label><input type="number" min="0" className={inputClass} value={form.area} onChange={e=>set('area',e.target.value)} /></div>
            <div><label className={labelClass}>Asking price (INR)</label><input type="number" min="0" className={inputClass} value={form.price} onChange={e=>set('price',e.target.value)} /></div>
            <div><label className={labelClass}>Availability (submitted, unverified)</label><select className={inputClass} value={form.availability} onChange={e=>set('availability',e.target.value)}><option value="unknown">To be confirmed</option><option value="available">Available</option><option value="on_hold">On hold</option><option value="booked">Booked</option></select></div>
          </div>
        </section>
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 md:flex-row md:items-center"><ShieldCheck size={20} className="shrink-0"/><p>Submission is not publication. GoNest review is required before verification or public listing.</p></div>
        <button disabled={saving || cities.length===0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto">{saving && <LoaderCircle size={17} className="animate-spin" />}{saving ? 'Submitting project…' : 'Submit project for review'}</button>
      </form>
    </div>
  </main>;
}
