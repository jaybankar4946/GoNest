import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GoNest';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0645C5',
          color: '#F4F4F4',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 184,
          fontWeight: 800,
          letterSpacing: '-7px',
        }}
      >
        GoNest
      </div>
    ),
    { ...size }
  );
}
