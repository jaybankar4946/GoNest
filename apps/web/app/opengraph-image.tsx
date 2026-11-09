import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GoNest — Discover, buy, rent and list residential properties';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', padding: '0 90px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <img src="https://www.gonest.in/gonest-icon.png" width="440" height="440" style={{ objectFit: 'contain' }} />
        <div style={{ marginLeft: 80, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#151B2B', fontSize: 78, fontWeight: 800, lineHeight: 1.1 }}>GoNest</div>
          <div style={{ width: 88, height: 8, borderRadius: 5, backgroundColor: '#1015E8', marginTop: 24, marginBottom: 34 }} />
          <div style={{ color: '#505968', fontSize: 28, lineHeight: 1.5 }}>Discover, buy, rent and list</div>
          <div style={{ color: '#505968', fontSize: 28, lineHeight: 1.5 }}>residential properties with GoNest.</div>
          <div style={{ color: '#1015E8', fontSize: 25, fontWeight: 700, marginTop: 42 }}>WWW.GONEST.IN</div>
          <div style={{ color: '#505968', fontSize: 22, marginTop: 16 }}>info@gonest.in</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
