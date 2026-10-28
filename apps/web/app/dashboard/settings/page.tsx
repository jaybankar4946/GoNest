'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { updateProfile, updatePassword } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const inp: React.CSSProperties={width:'100%',padding:'11px 14px',border:'1px solid #E5E5E5',borderRadius:12,fontSize:14,outline:'none',background:'#fff'};
const lbl: React.CSSProperties={fontSize:13,fontWeight:600,color:'#111',marginBottom:6,display:'block'};
const btn: React.CSSProperties={padding:'11px 22px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'var(--primary)',border:'none',cursor:'pointer'};

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, refresh } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agency, setAgency] = useState('');
  const [rera, setRera] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok'|'err'; text: string } | null>(null);

  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'ok'|'err'; text: string } | null>(null);

  useEffect(() => { if (!loading && !user) router.push('/auth'); }, [loading, user, router]);
  useEffect(() => {
    if (profile) {
      setName(profile.full_name ?? '');
      setPhone(profile.phone ?? '');
      setAgency(profile.agency_name ?? '');
      setRera(profile.rera_number ?? '');
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  const uploadAvatar = async (file?: File) => {
    if (!user || !file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setProfileMsg({ type: 'err', text: 'Choose a JPG, PNG or WebP image.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: 'err', text: 'Profile pictures must be 5 MB or smaller.' });
      return;
    }
    setUploadingAvatar(true); setProfileMsg(null);
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${user.id}/profile-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('agent-avatars').upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('agent-avatars').getPublicUrl(path);
      await updateProfile(user.id, { avatar_url: data.publicUrl });
      setAvatarUrl(data.publicUrl);
      await refresh();
      setProfileMsg({ type: 'ok', text: 'Profile picture updated and visible on your agent profile.' });
    } catch (e) {
      setProfileMsg({ type: 'err', text: e instanceof Error ? e.message : 'Could not upload profile picture.' });
    } finally { setUploadingAvatar(false); }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true); setProfileMsg(null);
    try {
      await updateProfile(user.id, { full_name: name || null, phone: phone || null, agency_name: agency || null, rera_number: rera || null });
      await refresh();
      setProfileMsg({ type: 'ok', text: 'Profile updated.' });
    } catch (e) {
      setProfileMsg({ type: 'err', text: e instanceof Error ? e.message : 'Could not update profile.' });
    } finally { setSavingProfile(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) { setPassMsg({ type: 'err', text: 'Password must be at least 6 characters.' }); return; }
    if (newPass !== confirmPass) { setPassMsg({ type: 'err', text: 'Passwords do not match.' }); return; }
    setSavingPass(true); setPassMsg(null);
    try {
      await updatePassword(newPass);
      setPassMsg({ type: 'ok', text: 'Password changed.' });
      setNewPass(''); setConfirmPass('');
    } catch (e) {
      setPassMsg({ type: 'err', text: e instanceof Error ? e.message : 'Could not change password.' });
    } finally { setSavingPass(false); }
  };

  const canAgencyFields = ['agent', 'owner'].includes(profile?.role ?? '');

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', marginBottom: 32 }}>Account settings</h1>

        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid #E5E5E5' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 4 }}>Profile</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, background: 'linear-gradient(135deg,#eff6ff,#fdf2f8,#fffbeb)' }}>
            <div style={{ width: 76, height: 76, flexShrink: 0, borderRadius: 22, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#2563eb,#8b5cf6,#ec4899)', color: '#fff', fontSize: 28, fontWeight: 800, boxShadow: '0 8px 24px #64748b30' }}>
              {avatarUrl ? <img src={avatarUrl} alt="Your agent profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (name || 'G').trim().charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Your profile picture</p>
              <p style={{ marginTop: 3, fontSize: 12, lineHeight: 1.5, color: '#64748b' }}>Use your real professional photo so customers can recognise you.</p>
              <label style={{ display: 'inline-flex', marginTop: 8, padding: '7px 12px', borderRadius: 9999, background: '#1d4ed8', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {uploadingAvatar ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
                <input aria-label="Upload agent profile photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingAvatar} onChange={e => { const file = e.target.files?.[0]; void uploadAvatar(file); e.currentTarget.value = ''; }} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
          <div><label style={lbl}>Full name</label><input value={name} onChange={e=>setName(e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Contact phone (optional)</label><input type="tel" inputMode="tel" autoComplete="tel" aria-label="Contact phone number" placeholder="e.g. +91 98765 43210" value={phone} onChange={e=>setPhone(e.target.value)} style={inp}/><p style={{fontSize:12,color:'#6B6B6B',marginTop:6,lineHeight:1.5}}>For account and property enquiries only. This number is saved to your profile; GoNest will not send SMS login codes or OTPs.</p></div>
          {canAgencyFields && <>
            <div><label style={lbl}>Agency name</label><input value={agency} onChange={e=>setAgency(e.target.value)} style={inp}/></div>
            <div><label style={lbl}>RERA number</label><input value={rera} onChange={e=>setRera(e.target.value)} style={inp}/></div>
          </>}
          <div><label style={lbl}>Email</label><input value={user?.email ?? ''} disabled style={{ ...inp, color: '#9B9B9B', background: '#F7F7F7' }}/></div>
          {profileMsg && <p style={{ fontSize: 13, color: profileMsg.type === 'ok' ? '#16A34A' : '#DC2626' }}>{profileMsg.text}</p>}
          <div><button type="submit" disabled={savingProfile} style={{ ...btn, opacity: savingProfile ? 0.6 : 1 }}>{savingProfile ? 'Saving…' : 'Save profile'}</button></div>
        </form>

        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 4 }}>Change password</h2>
          <div><label style={lbl}>New password</label><input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Confirm new password</label><input type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} style={inp}/></div>
          {passMsg && <p style={{ fontSize: 13, color: passMsg.type === 'ok' ? '#16A34A' : '#DC2626' }}>{passMsg.text}</p>}
          <div><button type="submit" disabled={savingPass} style={{ ...btn, opacity: savingPass ? 0.6 : 1 }}>{savingPass ? 'Saving…' : 'Change password'}</button></div>
        </form>
      </main>
      <Footer />
    </>
  );
}
