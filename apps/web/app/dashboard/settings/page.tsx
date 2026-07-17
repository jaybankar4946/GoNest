'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/components/layout/AuthProvider';
import { updateProfile, updatePassword } from '@/lib/api';

const inp: React.CSSProperties={width:'100%',padding:'11px 14px',border:'1px solid #E5E5E5',borderRadius:12,fontSize:14,outline:'none',background:'#fff'};
const lbl: React.CSSProperties={fontSize:13,fontWeight:600,color:'#111',marginBottom:6,display:'block'};
const btn: React.CSSProperties={padding:'11px 22px',borderRadius:9999,fontSize:13,fontWeight:600,color:'#fff',background:'#111',border:'none',cursor:'pointer'};

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, refresh } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agency, setAgency] = useState('');
  const [rera, setRera] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
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
    }
  }, [profile]);

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
          <div><label style={lbl}>Full name</label><input value={name} onChange={e=>setName(e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} style={inp}/></div>
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
