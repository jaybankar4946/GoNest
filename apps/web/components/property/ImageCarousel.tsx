'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Img = { id: string; storage_path: string };

export function ImageCarousel({ images, urlFor, alt }: { images: Img[]; urlFor: (path: string) => string; alt: string }) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);

  if (images.length === 0) {
    return (
      <div style={{
        aspectRatio: '16/9', borderRadius: 'var(--radius-lg)', background: 'var(--surface-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)', fontSize: 'var(--text-sm)',
      }}>
        No photos
      </div>
    );
  }

  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIndex(p => (p + 1) % images.length); };
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIndex(p => (p - 1 + images.length) % images.length); };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', aspectRatio: '16/9', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', background: 'var(--surface-3)', boxShadow: 'var(--shadow-md)',
      }}
    >
      <img
        src={urlFor(images[index].storage_path)}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity var(--dur-base) var(--ease)' }}
      />

      {images.length > 1 && hover && (
        <>
          <button onClick={prev} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)',
          }}>
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <button onClick={next} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)',
          }}>
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6,
        }}>
          {images.map((_, i) => (
            <span key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
              transition: 'background var(--dur-fast) var(--ease)',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
