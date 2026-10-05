'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, outline: 'none' };
export default function ResetPage() {
  const router = useRouter();
  const [pw, setPw] = useState(''); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) { setMsg({ ok: false, t: 'Use at least 8 characters.' }); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) setMsg({ ok: false, t: 'This reset link has expired. Request a new one from the sign-in page.' });
    else { setMsg({ ok: true, t: 'Password updated. Redirecting…' }); setTimeout(() => router.push('/dashboard'), 1200); }
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#F9FAFB' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 400, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 28, padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Set a new password</h1>
        <input type="password" required placeholder="New password (8+ characters)" value={pw} onChange={e => setPw(e.target.value)} style={inp} />
        {msg && <div style={{ fontSize: 13, padding: '10px 12px', borderRadius: 10, background: msg.ok ? '#F0FDF4' : '#FEF2F2', color: msg.ok ? '#16A34A' : '#DC2626' }}>{msg.t}</div>}
        <button disabled={busy} style={{ padding: 13, borderRadius: 14, fontSize: 14, fontWeight: 700, color: '#fff', background: 'var(--primary)', opacity: busy ? 0.6 : 1 }}>{busy ? 'Saving…' : 'Update password'}</button>
      </form>
    </div>
  );
}
