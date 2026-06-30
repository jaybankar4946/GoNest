export default function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: '#0057FF' }}>404</h1>
      <p style={{ color: '#6b7280', marginTop: 8 }}>Page not found</p>
      <a href="/" style={{ display: 'inline-block', marginTop: 24, color: '#0057FF', fontWeight: 600 }}>
        ← Back to GoNest
      </a>
    </div>
  );
}
