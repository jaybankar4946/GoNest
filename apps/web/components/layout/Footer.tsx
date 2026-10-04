import Link from 'next/link';
import { Home } from 'lucide-react';
const COLS = [
  { t: 'Platform', l: [['Buy property', '/buy'], ['Rent property', '/rent'], ['New projects', '/projects'], ['Post property', '/dashboard/new'], ['Find agents', '/agents']] },
  { t: 'Account', l: [['Sign in', '/auth'], ['Saved homes', '/saved'], ['Dashboard', '/dashboard']] },
];
export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8" style={{ marginTop: 0 }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><Home className="text-white" style={{ width: 18, height: 18 }} /></div>
              <span className="text-xl font-extrabold text-white" style={{ fontFamily: 'var(--font-manrope), var(--font-display)' }}>GoNest</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">Find homes to buy or rent in Mumbai from reviewed owners and agents.</p>
          </div>
          {COLS.map(c => (
            <div key={c.t}>
              <p className="text-sm font-bold text-white mb-4">{c.t}</p>
              <ul className="space-y-3">{c.l.map(([n, h]) => <li key={n}><Link href={h} className="text-sm hover:text-white transition-colors">{n}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-6 text-sm">© 2026 GoNest · Mumbai</div>
      </div>
    </footer>
  );
}
