import Link from 'next/link';
export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #E5E5E5', padding: '36px 24px', marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>GoNest</span>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['Buy','Rent','New Projects','Privacy','Terms','Contact'].map(l => (
            <Link key={l} href="#" style={{ fontSize: 13, color: '#6B6B6B' }}>{l}</Link>
          ))}
        </div>
        <span style={{ fontSize: 12, color: '#C8C8C8' }}>© 2026 GoNest</span>
      </div>
    </footer>
  );
}
