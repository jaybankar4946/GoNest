'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { supabase } from '@/lib/supabase';

type ContentRow = { id: string; content_key: string; label: string; page_path: string; content_value: string; status: 'draft'|'published'; updated_at: string };
type Campaign = { id: string; title: string; body: string|null; image_url: string|null; target_url: string|null; placement: string; status: 'draft'|'active'|'paused'|'ended'; starts_at: string|null; ends_at: string|null; priority: number };
type Setting = { id: string; setting_key: string; label: string; setting_value: string; updated_at: string };
type Tab = 'content'|'campaigns'|'settings';

const inputStyle: React.CSSProperties = { width:'100%',border:'1px solid #d9dde5',borderRadius:10,padding:'10px 12px',fontSize:14,background:'#fff',color:'#111827' };
const labelStyle: React.CSSProperties = { display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:6 };
const buttonStyle: React.CSSProperties = { border:0,borderRadius:10,padding:'9px 13px',fontSize:13,fontWeight:700,cursor:'pointer' };

export default function ControlCenterPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [tab,setTab] = useState<Tab>('content');
  const [content,setContent] = useState<ContentRow[]>([]);
  const [campaigns,setCampaigns] = useState<Campaign[]>([]);
  const [settings,setSettings] = useState<Setting[]>([]);
  const [contentDrafts,setContentDrafts] = useState<Record<string,Partial<ContentRow>>>({});
  const [settingDrafts,setSettingDrafts] = useState<Record<string,string>>({});
  const [campaignDraft,setCampaignDraft] = useState({title:'',body:'',image_url:'',target_url:'',placement:'homepage_banner',starts_at:'',ends_at:'',priority:'100'});
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');

  useEffect(()=>{ if(!loading && (!profile || profile.role!=='admin')) router.replace('/admin'); },[loading,profile,router]);

  const load = useCallback(async()=>{
    setError('');
    const [c,p,s] = await Promise.all([
      supabase.from('site_content').select('id,content_key,label,page_path,content_value,status,updated_at').order('page_path').order('label'),
      supabase.from('promotion_campaigns').select('id,title,body,image_url,target_url,placement,status,starts_at,ends_at,priority').order('priority'),
      supabase.from('site_settings').select('id,setting_key,label,setting_value,updated_at').order('label')
    ]);
    const issue = c.error ?? p.error ?? s.error;
    if(issue){ setError(issue.message.includes('schema cache') || issue.message.includes('does not exist') ? 'Control-center database migration is not applied yet. Apply the new Supabase migration from this branch, then reload this page.' : issue.message); return; }
    setContent((c.data??[]) as ContentRow[]);
    setCampaigns((p.data??[]) as Campaign[]);
    setSettings((s.data??[]) as Setting[]);
    setContentDrafts(Object.fromEntries((c.data??[]).map((r:any)=>[r.id,{content_value:r.content_value,status:r.status,label:r.label,page_path:r.page_path}])));
    setSettingDrafts(Object.fromEntries((s.data??[]).map((r:any)=>[r.id,r.setting_value])));
  },[]);

  useEffect(()=>{ if(!loading && profile?.role==='admin') void load(); },[loading,profile,load]);

  const run = async(fn:()=>Promise<void>, success:string) => {
    setBusy(true); setMessage(''); setError('');
    try { await fn(); setMessage(success); await load(); }
    catch(e) { setError(e instanceof Error ? e.message : 'Action failed. Please try again.'); }
    finally { setBusy(false); }
  };

  const saveContent = (row:ContentRow) => run(async()=>{
    const d=contentDrafts[row.id]??{};
    const {error:e}=await supabase.from('site_content').update({label:d.label??row.label,page_path:d.page_path??row.page_path,content_value:d.content_value??row.content_value,status:d.status??row.status,updated_by:profile?.id,updated_at:new Date().toISOString()}).eq('id',row.id);
    if(e) throw e;
  },'Content saved. Published changes are available to public pages that use this setting.');

  const addContent = () => run(async()=>{
    const key=prompt('Unique content key (letters, numbers and underscores):','new_section_text');
    if(!key) return;
    const label=prompt('Editor label:','New section text');
    if(!label) return;
    const {error:e}=await supabase.from('site_content').insert({content_key:key.trim().toLowerCase().replace(/[^a-z0-9_]+/g,'_'),label,page_path:'/',content_value:'',status:'draft',updated_by:profile?.id});
    if(e) throw e;
  },'Content field added as a draft.');

  const saveSetting = (row:Setting) => run(async()=>{
    const {error:e}=await supabase.from('site_settings').update({setting_value:settingDrafts[row.id]??row.setting_value,updated_by:profile?.id,updated_at:new Date().toISOString()}).eq('id',row.id);
    if(e) throw e;
  },'Setting saved.');

  const createCampaign = () => run(async()=>{
    if(!campaignDraft.title.trim()) throw new Error('Campaign title is required.');
    const {error:e}=await supabase.from('promotion_campaigns').insert({
      title:campaignDraft.title.trim(),body:campaignDraft.body.trim()||null,image_url:campaignDraft.image_url.trim()||null,
      target_url:campaignDraft.target_url.trim()||null,placement:campaignDraft.placement,status:'draft',
      starts_at:campaignDraft.starts_at?new Date(campaignDraft.starts_at).toISOString():null,
      ends_at:campaignDraft.ends_at?new Date(campaignDraft.ends_at).toISOString():null,priority:Number(campaignDraft.priority)||100,created_by:profile?.id
    });
    if(e) throw e;
    setCampaignDraft({title:'',body:'',image_url:'',target_url:'',placement:'homepage_banner',starts_at:'',ends_at:'',priority:'100'});
  },'Campaign saved as a draft. Activate it after reviewing its content and schedule.');

  const updateCampaign = (id:string,status:Campaign['status']) => run(async()=>{
    const {error:e}=await supabase.from('promotion_campaigns').update({status,updated_at:new Date().toISOString()}).eq('id',id);
    if(e) throw e;
  },'Campaign status updated.');

  if(loading || !profile || profile.role!=='admin') return <><Nav/><main style={{maxWidth:1100,margin:'0 auto',padding:'56px 24px'}}>Checking administrator access…</main><Footer/></>;

  const tabButton=(key:Tab,title:string)=> <button key={key} onClick={()=>setTab(key)} style={{...buttonStyle,background:tab===key?'#111827':'#f3f4f6',color:tab===key?'#fff':'#374151'}}>{title}</button>;

  return <><Nav/><main style={{maxWidth:1180,margin:'0 auto',padding:'32px 20px 72px'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap',marginBottom:24}}>
      <div><Link href="/admin" style={{fontSize:13,color:'#4b5563',textDecoration:'underline'}}>← Back to Admin Panel</Link><p style={{fontSize:11,fontWeight:800,letterSpacing:'.14em',textTransform:'uppercase',color:'#2563eb',marginTop:16}}>GoNest operations</p><h1 style={{fontSize:32,fontWeight:850,letterSpacing:'-.04em',color:'#111827'}}>Marketplace Control Center</h1><p style={{color:'#6b7280',fontSize:14,marginTop:8,maxWidth:680}}>Manage editable site content, promotion campaigns and operational settings without changing application code.</p></div>
      <button disabled={busy} onClick={()=>void load()} style={{...buttonStyle,background:'#fff',border:'1px solid #d1d5db'}}>↻ Refresh data</button>
    </div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>{tabButton('content','Pages & content')}{tabButton('campaigns','Ads & promotions')}{tabButton('settings','Settings')}</div>
    {message&&<p role="status" style={{padding:12,borderRadius:10,background:'#ecfdf5',color:'#047857',fontSize:13,marginBottom:16}}>{message}</p>}
    {error&&<p role="alert" style={{padding:12,borderRadius:10,background:'#fef2f2',color:'#b91c1c',fontSize:13,marginBottom:16}}>{error}</p>}

    {tab==='content'&&<section>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:14,flexWrap:'wrap'}}><div><h2 style={{fontSize:20,fontWeight:800,color:'#111827'}}>Pages & content</h2><p style={{fontSize:13,color:'#6b7280',marginTop:4}}>Drafts stay unpublished. Published values only affect page sections wired to these keys.</p></div><button disabled={busy} onClick={()=>void addContent()} style={{...buttonStyle,background:'#111827',color:'#fff'}}>+ Add content field</button></div>
      {content.length===0&&!error&&<p style={{padding:20,border:'1px solid #e5e7eb',borderRadius:12,color:'#6b7280'}}>No content fields found.</p>}
      <div style={{display:'grid',gap:12}}>{content.map(row=><article key={row.id} style={{border:'1px solid #e5e7eb',borderRadius:14,padding:16,display:'grid',gap:12}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><h3 style={{fontWeight:800,color:'#111827'}}>{row.label}</h3><p style={{fontSize:11,color:'#6b7280',marginTop:3}}><code>{row.content_key}</code> · {row.page_path}</p></div><span style={{fontSize:11,fontWeight:800,color:(contentDrafts[row.id]?.status??row.status)==='published'?'#047857':'#92400e'}}>{(contentDrafts[row.id]?.status??row.status).toUpperCase()}</span></div>
        <label><span style={labelStyle}>Editor label</span><input style={inputStyle} value={contentDrafts[row.id]?.label??row.label} onChange={e=>setContentDrafts(p=>({...p,[row.id]:{...p[row.id],label:e.target.value}}))}/></label>
        <label><span style={labelStyle}>Page path</span><input style={inputStyle} value={contentDrafts[row.id]?.page_path??row.page_path} onChange={e=>setContentDrafts(p=>({...p,[row.id]:{...p[row.id],page_path:e.target.value}}))}/></label>
        <label><span style={labelStyle}>Content value</span><textarea rows={3} style={{...inputStyle,resize:'vertical'}} value={contentDrafts[row.id]?.content_value??row.content_value} onChange={e=>setContentDrafts(p=>({...p,[row.id]:{...p[row.id],content_value:e.target.value}}))}/></label>
        <div style={{display:'flex',gap:8,justifyContent:'space-between',alignItems:'center',flexWrap:'wrap'}}><select style={{...inputStyle,width:'auto'}} value={contentDrafts[row.id]?.status??row.status} onChange={e=>setContentDrafts(p=>({...p,[row.id]:{...p[row.id],status:e.target.value as ContentRow['status']}}))}><option value="draft">Draft</option><option value="published">Published</option></select><button disabled={busy} onClick={()=>void saveContent(row)} style={{...buttonStyle,background:'#2563eb',color:'#fff'}}>Save content</button></div>
      </article>)}</div>
    </section>}

    {tab==='campaigns'&&<section>
      <div style={{marginBottom:16}}><h2 style={{fontSize:20,fontWeight:800,color:'#111827'}}>Ads & promotions</h2><p style={{fontSize:13,color:'#6b7280',marginTop:4}}>New campaigns start as drafts. Only active, in-date campaigns are eligible for public placements.</p></div>
      <form onSubmit={e=>{e.preventDefault();void createCampaign();}} style={{border:'1px solid #e5e7eb',borderRadius:14,padding:16,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginBottom:20}}>
        <label><span style={labelStyle}>Campaign title *</span><input required style={inputStyle} value={campaignDraft.title} onChange={e=>setCampaignDraft(p=>({...p,title:e.target.value}))}/></label>
        <label><span style={labelStyle}>Placement</span><select style={inputStyle} value={campaignDraft.placement} onChange={e=>setCampaignDraft(p=>({...p,placement:e.target.value}))}><option value="homepage_banner">Homepage banner</option><option value="homepage_featured">Homepage featured</option><option value="search_sponsored">Search sponsored</option></select></label>
        <label><span style={labelStyle}>Target URL</span><input style={inputStyle} placeholder="/projects" value={campaignDraft.target_url} onChange={e=>setCampaignDraft(p=>({...p,target_url:e.target.value}))}/></label>
        <label><span style={labelStyle}>Image URL (optional)</span><input style={inputStyle} placeholder="https://…" value={campaignDraft.image_url} onChange={e=>setCampaignDraft(p=>({...p,image_url:e.target.value}))}/></label>
        <label><span style={labelStyle}>Starts at (optional)</span><input type="datetime-local" style={inputStyle} value={campaignDraft.starts_at} onChange={e=>setCampaignDraft(p=>({...p,starts_at:e.target.value}))}/></label>
        <label><span style={labelStyle}>Ends at (optional)</span><input type="datetime-local" style={inputStyle} value={campaignDraft.ends_at} onChange={e=>setCampaignDraft(p=>({...p,ends_at:e.target.value}))}/></label>
        <label><span style={labelStyle}>Priority (lower appears first)</span><input type="number" style={inputStyle} value={campaignDraft.priority} onChange={e=>setCampaignDraft(p=>({...p,priority:e.target.value}))}/></label>
        <label style={{gridColumn:'1/-1'}}><span style={labelStyle}>Campaign message</span><textarea rows={2} style={{...inputStyle,resize:'vertical'}} value={campaignDraft.body} onChange={e=>setCampaignDraft(p=>({...p,body:e.target.value}))}/></label>
        <div style={{gridColumn:'1/-1'}}><button disabled={busy} type="submit" style={{...buttonStyle,background:'#111827',color:'#fff'}}>Save campaign draft</button></div>
      </form>
      <div style={{display:'grid',gap:10}}>{campaigns.map(c=><article key={c.id} style={{border:'1px solid #e5e7eb',borderRadius:12,padding:14,display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,flexWrap:'wrap'}}>
        <div><h3 style={{fontWeight:800,color:'#111827'}}>{c.title}</h3><p style={{fontSize:12,color:'#6b7280',marginTop:4}}>{c.placement.replaceAll('_',' ')} · Priority {c.priority} · {(c.status).toUpperCase()}</p>{c.body&&<p style={{fontSize:13,color:'#4b5563',marginTop:6}}>{c.body}</p>}{c.target_url&&<p style={{fontSize:12,color:'#2563eb',marginTop:4}}>{c.target_url}</p>}</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{c.status!=='active'&&<button disabled={busy} onClick={()=>void updateCampaign(c.id,'active')} style={{...buttonStyle,background:'#047857',color:'#fff'}}>Activate</button>}{c.status==='active'&&<button disabled={busy} onClick={()=>void updateCampaign(c.id,'paused')} style={{...buttonStyle,background:'#b45309',color:'#fff'}}>Pause</button>}{c.status!=='ended'&&<button disabled={busy} onClick={()=>void updateCampaign(c.id,'ended')} style={{...buttonStyle,background:'#f3f4f6',color:'#374151'}}>End campaign</button>}</div>
      </article>)}</div>
    </section>}

    {tab==='settings'&&<section>
      <div style={{marginBottom:16}}><h2 style={{fontSize:20,fontWeight:800,color:'#111827'}}>Operational settings</h2><p style={{fontSize:13,color:'#6b7280',marginTop:4}}>These settings are stored centrally. A setting affects runtime behaviour only after its consumer is wired to read it.</p></div>
      <div style={{display:'grid',gap:12}}>{settings.map(row=><article key={row.id} style={{border:'1px solid #e5e7eb',borderRadius:12,padding:16,display:'grid',gridTemplateColumns:'minmax(180px,1fr) minmax(220px,2fr) auto',alignItems:'end',gap:12}}><label><span style={labelStyle}>{row.label}</span><code style={{fontSize:11,color:'#6b7280'}}>{row.setting_key}</code></label><input style={inputStyle} value={settingDrafts[row.id]??row.setting_value} onChange={e=>setSettingDrafts(p=>({...p,[row.id]:e.target.value}))}/><button disabled={busy} onClick={()=>void saveSetting(row)} style={{...buttonStyle,background:'#2563eb',color:'#fff'}}>Save</button></article>)}</div>
    </section>}
    <p style={{fontSize:12,color:'#6b7280',marginTop:28}}>All changes require an authenticated administrator. Content and campaign edits are stored in Supabase; public display depends on the relevant placement being connected to published data.</p>
  </main><Footer/></>;
}
