'use client';

import { useRef } from 'react';

export function SlideRail({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (direction: number) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(280, Math.round(el.clientWidth * 0.82));
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute right-0 top-0 z-10 hidden gap-2 sm:flex">
        <button type="button" onClick={() => move(-1)} aria-label="Previous" className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xl font-semibold text-gray-800 shadow-sm hover:border-gray-300 hover:bg-gray-50">‹</button>
        <button type="button" onClick={() => move(1)} aria-label="Next" className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xl font-semibold text-gray-800 shadow-sm hover:border-gray-300 hover:bg-gray-50">›</button>
      </div>
      <div ref={ref} className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}
