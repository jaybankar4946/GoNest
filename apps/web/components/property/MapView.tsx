'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import type { ListingFull } from '@/lib/types';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points as any, { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);
  return null;
}

type Props = { listings: ListingFull[]; onSelect?: (l: ListingFull) => void };

export function MapView({ listings, onSelect }: Props) {
  const pts = listings
    .map(l => {
      const lat = l.latitude ?? (l.locality as any)?.latitude;
      const lng = l.longitude ?? (l.locality as any)?.longitude;
      return lat && lng ? { l, pos: [lat, lng] as [number, number] } : null;
    })
    .filter(Boolean) as { l: ListingFull; pos: [number, number] }[];

  const center: [number, number] = pts[0]?.pos ?? [19.076, 72.8777]; // Mumbai fallback

  if (pts.length === 0) {
    return (
      <div style={{height:'100%',minHeight:480,borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:6,background:'var(--gray-1)'}}>
        <p style={{fontSize:14,fontWeight:600,color:'#111'}}>No mapped listings yet</p>
        <p style={{fontSize:12,color:'var(--gray-4)'}}>These results don't have coordinates saved.</p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '100%', minHeight: 480, border: '1px solid var(--border)' }}>
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pts.length > 1 && <FitBounds points={pts.map(p => p.pos)} />}
        {pts.map(({ l, pos }) => (
          <Marker key={l.id} position={pos} icon={icon} eventHandlers={{ click: () => onSelect?.(l) }}>
            <Popup>
              <div style={{ fontFamily: 'var(--font-body)' }}>
                <strong>{formatPrice(l.price, l.purpose)}</strong><br />
                <Link href={`/property/${l.id}`}>{l.title}</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
