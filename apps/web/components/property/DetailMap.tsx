'use client';
import dynamic from 'next/dynamic';
import type { ListingFull } from '@/lib/types';
const MapView = dynamic(() => import('./MapView').then(m => m.MapView), { ssr: false });
export function DetailMap({ listing }: { listing: ListingFull }) {
  return <div style={{ height: 280, marginBottom: 24 }}><MapView listings={[listing]} /></div>;
}
