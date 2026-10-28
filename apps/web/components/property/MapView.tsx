'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import type { ListingFull } from '@/lib/types';

function priceIcon(price: number, purpose: string, active = false) {
  const label = formatPrice(price, purpose as any);
  return L.divIcon({
    className: 'gonest-price-marker',
    html: '<span style="display:inline-flex;align-items:center;white-space:nowrap;padding:7px 10px;border:1px solid #1D4ED8;border-radius:999px;background:#fff;color:#111827;font:700 12px/1.1 Arial,sans-serif;box-shadow:0 2px 8px rgba(15,23,42,.18)">' + label + '</span>',
    iconSize: [1, 1], iconAnchor: [0, 0], popupAnchor: [0, -8],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points as any, { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);
  return null;
}

type Props = { listings: ListingFull[]; onSelect?: (l: ListingFull) => void; activeListingId?: string | null };

function FocusActive({ point }: { point?: [number, number] }) {\n  const map = useMap();\n  useEffect(() => { if (point) map.flyTo(point, Math.max(map.getZoom(), 13), { duration: 0.35 }); }, [point, map]);\n  return null;\n}\n\nexport function MapView({ listings, onSelect, activeListingId }: Props) {
  const pts = listings
    .map(l => {
      // Listing coordinates are preferred. Locality coordinates are area-centre fallbacks,
      // so those markers must never be represented as the exact building address.
      const rawLat = l.latitude ?? (l.locality as any)?.latitude;
      const rawLng = l.longitude ?? (l.locality as any)?.longitude;
      const lat = rawLat == null ? NaN : Number(rawLat);
      const lng = rawLng == null ? NaN : Number(rawLng);
      const valid = Number.isFinite(lat) && Number.isFinite(lng)
        && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
        && !(lat === 0 && lng === 0);
      return valid ? { l, pos: [lat, lng] as [number, number] } : null;
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
      <div role="note" style={{ padding: '9px 12px', fontSize: 12, lineHeight: 1.45, color: '#475569', background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
        Map pins use exact listing coordinates when available; otherwise they show the approximate locality area, not the exact building.
      </div>
      <div style={{ height: 'calc(100% - 40px)', minHeight: 440 }}>
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pts.length > 1 && <FitBounds points={pts.map(p => p.pos)} />}\n        <FocusActive point={pts.find(p => p.l.id === activeListingId)?.pos} />
        {pts.map(({ l, pos }) => (
          <Marker key={l.id} position={pos} icon={priceIcon(l.price, l.purpose, l.id === activeListingId)} eventHandlers={{ click: () => onSelect?.(l) }}>
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
    </div>
  );
}
