'use client';
import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function ImageWithFallback({ src, alt, className }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={className}
        style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #c7d7f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
