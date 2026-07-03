'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, User, Plus } from 'lucide-react';
import { useAuth } from './AuthProvider';
 
const LINKS = [
  { href: '/buy',      label: 'Buy' },
  { href: '/rent',     label: 'Rent' },
  { href: '/projects', label: 'New Projects' },
];
 
export function Nav() {
  const path = usePathname();
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const canPost = ['owner', 'agent', 'admin'].includes(profile?.role ?? '');
 
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #E5E5E5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64, gap: 8 }}>
 
        <Link href="/" style={{ fontWeight: 700, fontSize: 17, color: '#111', letterSpacing: '-0.02em', marginRight: 16 }}>
          GoNest
        </Link>
 
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '6px 14px', borderRadius: 9999, fontSize: 14,
              fontWeight: path.startsWith(l.href) ? 600 : 400,
              color: path.startsWith(l.href) ? '#111' : '#6B6B6B',
              background: path.startsWith(l.href) ? '#F7F7F7' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" style={{
              padding: '6px 14px', borderRadius: 9999, fontSize: 14,
              fontWeight: path.startsWith('/admin') ? 600 : 400,
              color: path.startsWith('/admin') ? '#111' : '#6B6B6B',
              background: path.startsWith('/admin') ? '#F7F7F7' : 'transparent',
            }}>
              Admin
            </Link>
          )}
        </div>
 
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link href="/saved" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9999, fontSize: 13, color: '#6B6B6B' }}>
            <Heart size={14} /><span className="hidden sm:inline">Saved</span>
          </Link>
 
          {user ? (
            <>
              {canPost && (
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, color: '#fff', background: '#111' }}>
                  <Plus size={13} />Post
                </Link>
              )}
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 500, color: '#111', border: '1px solid #111' }}>
                <User size={13} />
                <span className="hidden sm:inline">{profile?.full_name?.split(' ')[0] ?? 'Account'}</span>
              </Link>
            </>
          ) : (
            <Link href="/auth" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 500, color: '#111', border: '1px solid #111' }}>
              <User size={13} />Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
