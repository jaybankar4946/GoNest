'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, User, Plus } from 'lucide-react';
import { useAuth } from './AuthProvider';

const LINKS = [{href:'/buy',label:'Buy'},{href:'/rent',label:'Rent'},{href:'/projects',label:'New Projects'}];

export function Nav() {
  const path = usePathname();
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const canPost = ['owner','agent','admin'].includes(profile?.role ?? '');
  const active = (href: string) => path === href || path.startsWith(href + '/');

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '7px 16px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)',
    fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--ink)' : 'var(--ink-soft)',
    background: isActive ? 'var(--surface-3)' : 'transparent',
    transition: 'background var(--dur-fast) var(--ease)',
  });

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-4)',
        display: 'flex', alignItems: 'center', height: 68, gap: 'var(--space-2)',
      }}>
        <Link href="/" style={{
          fontWeight: 700, fontSize: 'var(--text-md)',
          letterSpacing: '-0.02em', marginRight: 'var(--space-5)', flexShrink: 0,
        }}>
          <span style={{ color: 'var(--primary)' }}>Go</span>
          <span style={{ color: 'var(--accent)' }}>Nest</span>
        </Link>

        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} style={linkStyle(active(l.href))}>{l.label}</Link>
          ))}
          {isAdmin && <Link href="/admin" style={linkStyle(active('/admin'))}>Admin</Link>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Link href="/saved" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', color: 'var(--ink-soft)',
          }}>
            <Heart size={15} strokeWidth={1.75} /><span className="hidden sm:inline">Saved</span>
          </Link>
          {user ? (
            <>
              {canPost && (
                <Link href="/dashboard/new" style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
                  borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', fontWeight: 600,
                  color: '#fff', background: 'var(--ink)',
                }}>
                  <Plus size={14} strokeWidth={2} />Post
                </Link>
              )}
              <Link href="/dashboard" style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', fontWeight: 500,
                color: 'var(--ink)', border: '1px solid var(--border-strong)',
              }}>
                <User size={14} strokeWidth={1.75} />
                <span className="hidden sm:inline">{profile?.full_name?.split(' ')[0] ?? 'Account'}</span>
              </Link>
            </>
          ) : (
            <Link href="/auth" style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
              borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', fontWeight: 600,
              color: '#fff', background: 'var(--ink)',
            }}>
              <User size={14} strokeWidth={1.75} />Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
