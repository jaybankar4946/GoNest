'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, CalendarDays, MessageSquare, Phone, RefreshCw } from 'lucide-react';

type Enquiry = { id:string; project_id:string; project_name:string; enquiry_type:'enquiry'|'site_visit'; full_name:string; phone:string; email:string|null; preferred_date:string|null; preferred_time:string|null; message:string|null; status:string; created_at:string };

export default function BuilderProjectEnquiriesPage() {
  const { user, profile, loading } = useAuth();
  const [items,setItems] = useState<Enquiry[]>([]);
  const [busy,setBusy] = useState(true);
  const [error,setError] = useState('');
  async function load() {
    if (!user) { setBusy(false); return; }
    setBusy(true); setError('');
    const {data,error:err} = await supabase.rpc('get_my_project_enquiries');
    if (err) setError('Could not load project enquiries. Confirm that your account owns a submitted project and try again.');
    else setItems((data ?? []) as Enquiry[]);
    setBusy(false);
  }
  useEffect(()=>{ if(!loading) void load(); },[user,loading]);
  return <>
    <Nav/>
    <main className="min-h-[65vh] bg-slate-50 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><ArrowLeft className="h-4 w-4"/> Account dashboard</Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-extrabold">Project enquiries & visit requests</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Requests for projects owned by your builder account. A site visit is a request until your team confirms the appointment.</p></div><button onClick={()=>void load()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"><RefreshCw className="h-4 w-4"/> Refresh</button></div>
        {!user && !loading ? <div className="mt-6 rounded-2xl border bg-white p-8 text-center"><p className="text-slate-600">Sign in to view project enquiries.</p><Link href="/auth" className="mt-4 inline-block rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">Sign in</Link></div>
        : profile?.role!=='builder' && profile?.role!=='admin' && !loading ? <div className="mt-6 rounded-2xl border bg-white p-8 text-center"><p className="font-bold">Builder access required</p><p className="mt-2 text-sm text-slate-600">Use a builder account that submitted the project to see its enquiries.</p></div>
        : busy ? <div className="mt-6 rounded-2xl border bg-white p-8 text-slate-500">Loading project requests…</div>
        : error ? <div role="alert" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{error}</div>
        : items.length===0 ? <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center"><MessageSquare className="mx-auto h-10 w-10 text-slate-300"/><h2 className="mt-3 font-bold">No project enquiries yet</h2><p className="mt-2 text-sm text-slate-500">Requests for your submitted projects will appear here.</p></div>
        : <div className="mt-6 space-y-4">{items.map(item=><article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">{item.enquiry_type==='site_visit'?'Site visit request':'Project enquiry'}</p><h2 className="mt-1 text-lg font-extrabold">{item.project_name}</h2><p className="mt-1 text-sm text-slate-500">{new Date(item.created_at).toLocaleString('en-IN')}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-900">{item.status}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-3"><p className="font-bold">{item.full_name}</p><a className="mt-1 inline-flex items-center gap-2 text-sm text-blue-700" href={'tel:'+item.phone}><Phone className="h-4 w-4"/>{item.phone}</a>{item.email&&<p className="mt-1 text-sm text-slate-600">{item.email}</p>}</div>{item.enquiry_type==='site_visit'&&<div className="rounded-xl bg-slate-50 p-3"><p className="inline-flex items-center gap-2 text-sm font-bold"><CalendarDays className="h-4 w-4"/> Preferred visit</p><p className="mt-1 text-sm text-slate-600">{item.preferred_date||'Date not specified'} {item.preferred_time? '· '+item.preferred_time:''}</p><p className="mt-1 text-xs text-amber-800">Confirm with the customer before treating as booked.</p></div>}</div>{item.message&&<p className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-100 p-3 text-sm leading-6 text-slate-700">{item.message}</p>}</article>)}</div>}
      </div>
    </main>
    <Footer/>
  </>;
}
