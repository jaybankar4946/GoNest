'use client';
import { useState } from 'react';

type Props = { src: string; alt: string; className?: string };

export function ImageWithFallback({ src, alt, className }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className={className} style={{ background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B0B0B0" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />
  );
}
