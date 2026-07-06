import Link from 'next/link';
export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-5) var(--space-4)', marginTop: 'var(--space-8)' }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--ink)', letterSpacing: '-0.01em' }}>GoNest</span>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          {['Buy','Rent','New Projects','Privacy','Terms','Contact'].map(l => (
            <Link key={l} href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-soft)' }}>{l}</Link>
          ))}
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)' }}>© 2026 GoNest · Mumbai</span>
      </div>
    </footer>
  );
}
