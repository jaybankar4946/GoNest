'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, User, Plus, Menu, X, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthProvider';

const LINKS = [
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/projects', label: 'New Projects' },
  { href: '/agents', label: 'Agents' },
];

export function Nav() {
  const path = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const canPost = ['owner', 'agent', 'admin'].includes(profile?.role ?? '');
  const active = (href: string) => path === href || path.startsWith(href + '/');

  const doSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    router.push('/');
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 68, gap: 8 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, letterSpacing: '-0.03em', flexShrink: 0 }}>
          <span style={{ color: 'var(--primary)' }}>Go</span><span style={{ color: '#111' }}>Nest</span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 2, marginLeft: 28 }} className="hidden md:flex">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href}
              style={{
                padding: '8px 14px', borderRadius: 9999, fontSize: 14,
                fontWeight: active(l.href) ? 600 : 400,
                color: active(l.href) ? 'var(--primary)' : '#3a3a3a',
                background: active(l.href) ? 'var(--gray-1)' : 'transparent',
                transition: 'background .15s,color .15s',
              }}>
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" style={{ padding: '8px 14px', borderRadius: 9999, fontSize: 14, fontWeight: active('/admin') ? 600 : 400, color: active('/admin') ? 'var(--primary)' : '#3a3a3a', background: active('/admin') ? 'var(--gray-1)' : 'transparent', display: 'flex', alignItems: 'center', gap: 5 }}>
              <ShieldCheck size={14} /> Admin
            </Link>
          )}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Desktop right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hidden md:flex">
          <Link href="/saved" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--gray-1)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
            <Heart size={18} color="#3a3a3a" />
          </Link>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px 6px 6px', borderRadius: 9999, border: '1px solid var(--border)', background: '#fff' }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gray-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                  {(profile?.full_name ?? user.email ?? '?').charAt(0).toUpperCase()}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#111', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name?.split(' ')[0] ?? 'Account'}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', right: 0, top: 44, width: 200, background: '#fff', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', padding: 6, zIndex: 50 }}>
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 8, fontSize: 13, color: '#111' }}>
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    {canPost && (
                      <Link href="/dashboard/new" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 8, fontSize: 13, color: '#111' }}>
                        <Plus size={14} /> Post a listing
                      </Link>
                    )}
                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                    <button onClick={doSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 8, fontSize: 13, color: 'var(--err)', width: '100%', textAlign: 'left' }}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/auth" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 9999, fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--primary)' }}>
              <User size={14} /> Sign in
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMobileOpen(o => !o)} style={{ padding: 8, marginLeft: 'auto' }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden" style={{ borderTop: '1px solid var(--border)', padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{ padding: '11px 4px', fontSize: 14, fontWeight: active(l.href) ? 600 : 400, color: active(l.href) ? 'var(--primary)' : '#111' }}>
              {l.label}
            </Link>
          ))}
          {isAdmin && <Link href="/admin" onClick={() => setMobileOpen(false)} style={{ padding: '11px 4px', fontSize: 14, color: '#111' }}>Admin</Link>}
          <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
          <Link href="/saved" onClick={() => setMobileOpen(false)} style={{ padding: '11px 4px', fontSize: 14, color: '#111' }}>Saved homes</Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ padding: '11px 4px', fontSize: 14, color: '#111' }}>Dashboard</Link>
              {canPost && <Link href="/dashboard/new" onClick={() => setMobileOpen(false)} style={{ padding: '11px 4px', fontSize: 14, color: '#111' }}>Post a listing</Link>}
              <button onClick={doSignOut} style={{ padding: '11px 4px', fontSize: 14, color: 'var(--err)', textAlign: 'left' }}>Sign out</button>
            </>
          ) : (
            <Link href="/auth" onClick={() => setMobileOpen(false)} style={{ marginTop: 6, padding: '11px 4px', borderRadius: 9999, fontSize: 14, fontWeight: 600, color: '#fff', background: 'var(--primary)', textAlign: 'center' }}>Sign in</Link>
          )}
        </div>
      )}
    </header>
  );
}
