import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GoNest — Begin Your Next Chapter with US';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0645C5', color: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: '-7px', lineHeight: 1 }}>GoNest</div>
        <div style={{ marginTop: 24, fontSize: 42, fontWeight: 600, letterSpacing: '-1px' }}>Begin Your Next Chapter with US</div>
        <div style={{ position: 'absolute', bottom: 34, fontSize: 22, fontWeight: 600, opacity: 0.9 }}>gonest.in</div>
      </div>
    ),
    { ...size }
  );
}
