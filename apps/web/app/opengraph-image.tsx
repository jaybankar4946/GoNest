import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GoNest — Discover, buy, rent and list residential properties';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', padding: '0 105px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <img src="https://gonest.in/gonest-icon.png" width="330" height="330" style={{ objectFit: 'contain' }} />
        <div style={{ marginLeft: 75, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#171C2B', fontSize: 76, fontWeight: 800, lineHeight: 1.1 }}>GoNest</div>
          <div style={{ width: 78, height: 8, borderRadius: 5, backgroundColor: '#1015E8', marginTop: 24, marginBottom: 32 }} />
          <div style={{ color: '#4B5563', fontSize: 28, lineHeight: 1.5 }}>Discover, buy, rent and list</div>
          <div style={{ color: '#4B5563', fontSize: 28, lineHeight: 1.5 }}>residential properties with GoNest.</div>
          <div style={{ color: '#1015E8', fontSize: 24, fontWeight: 700, marginTop: 42 }}>WWW.GONEST.IN</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
