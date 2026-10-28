'use client';
import { useEffect, useState } from 'react';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getDemoHomes } from '@/lib/api';
import { demoOnClient } from '@/lib/demo';
import type { ListingFull } from '@/lib/types';

// Renders only when an admin has turned demo mode on in this browser.
export function DemoHomes() {
  const [homes, setHomes] = useState<ListingFull[]>([]);
  const [on, setOn] = useState(false);
  useEffect(() => { const d = demoOnClient(); setOn(d); if (d) getDemoHomes(8).then(setHomes).catch(() => {}); }, []);
  if (!on || homes.length === 0) return null;
  return (
    <section style={{ background: '#FFFBEB', borderTop: '1px solid #FDE68A', borderBottom: '1px solid #FDE68A', padding: '48px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Sample homes (demo mode)</h2>
        <p style={{ fontSize: 13, color: '#92400E', marginBottom: 20 }}>Team preview only. Every card is labelled “Sample”.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '28px 20px' }}>
          {homes.map((l) => <PropertyCard key={l.id} listing={l} />)}
        </div>
      </div>
    </section>
  );
}
