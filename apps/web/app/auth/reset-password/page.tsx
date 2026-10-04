'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { updatePassword } from '@/lib/api';
import { Lock } from 'lucide-react';

const inp: React.CSSProperties={width:'100%',padding:'11px 14px',border:'1px solid #E5E5E5',borderRadius:12,fontSize:14,outline:'none'};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok'|'err'; text: string } | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.length < 6) { setMsg({ type: 'err', text: 'Password must be at least 6 characters.' }); return; }
    if (pass !== confirm) { setMsg({ type: 'err', text: 'Passwords do not match.' }); return; }
    setLoading(true); setMsg(null);
    try {
      await updatePassword(pass);
      setMsg({ type: 'ok', text: 'Password updated. Redirecting…' });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Could not update password.' });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', marginBottom: 6 }}>Set a new password</h1>
        <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 28 }}>
          {ready ? 'Choose a new password for your account.' : 'Verifying your reset link…'}
        </p>
        {ready && (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9B9B9B', pointerEvents: 'none' }} />
              <input required type="password" placeholder="New password" value={pass} onChange={e=>setPass(e.target.value)} style={{ ...inp, paddingLeft: 38 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9B9B9B', pointerEvents: 'none' }} />
              <input required type="password" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{ ...inp, paddingLeft: 38 }} />
            </div>
            {msg && <div style={{ fontSize: 13, padding: '10px 12px', borderRadius: 10, background: msg.type === 'ok' ? '#F0FDF4' : '#FEF2F2', color: msg.type === 'ok' ? '#16A34A' : '#DC2626' }}>{msg.text}</div>}
            <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: 9999, fontSize: 14, fontWeight: 600, color: '#fff', background: '#111', border: 'none', cursor: 'pointer', marginTop: 4, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
