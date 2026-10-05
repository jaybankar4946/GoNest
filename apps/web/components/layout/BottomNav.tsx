'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User } from 'lucide-react';
import { useAuth } from './AuthProvider';
export function BottomNav() {
  const path = usePathname();
  const { user } = useAuth();
  if (path.startsWith('/auth')) return null;
  const items = [{ href: '/', label: 'Home', Icon: Home }, { href: '/search', label: 'Search', Icon: Search }, { href: '/saved', label: 'Saved', Icon: Heart }, { href: user ? '/dashboard' : '/auth', label: user ? 'Account' : 'Sign in', Icon: User }];
  const on = (h: string) => (h === '/' ? path === '/' : path.startsWith(h));
  return (
    <nav className="md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60, background: '#fff', borderTop: '1px solid #E5E7EB', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div style={{ display: 'flex' }}>
        {items.map(({ href, label, Icon }) => (
          <Link key={label} href={href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 0', fontSize: 11, fontWeight: on(href) ? 700 : 500, color: on(href) ? 'var(--primary)' : '#6B7280' }}>
            <Icon size={20} />{label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
