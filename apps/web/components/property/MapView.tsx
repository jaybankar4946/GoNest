'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import type { ListingFull } from '@/lib/types';

function pricePin(price: number, purpose: ListingFull['purpose']) {
  const label = formatPrice(price, purpose);
  return L.divIcon({
    className: 'gonest-price-pin',
    html: `<span style="display:inline-block;background:#173b72;color:#fff;border:2px solid #fff;border-radius:18px;padding:7px 10px;box-shadow:0 2px 8px rgba(15,23,42,.24);font-size:12px;font-weight:800;white-space:nowrap;line-height:1">${label}</span>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
    popupAnchor: [0, -8],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points as any, { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);
  return null;
}

type Props = { listings: ListingFull[]; onSelect?: (l: ListingFull) => void };

export function MapView({ listings, onSelect }: Props) {
  // Only map listing-level coordinates. Locality centroids are approximate and
  // must not be presented as an individual property's precise location.
  const pts = listings
    .map(l => {
      const lat = l.latitude;
      const lng = l.longitude;
      return lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
        ? { l, pos: [lat, lng] as [number, number] }
        : null;
    })
    .filter(Boolean) as { l: ListingFull; pos: [number, number] }[];

  const center: [number, number] = pts[0]?.pos ?? [19.076, 72.8777]; // Mumbai fallback

  if (pts.length === 0) {
    return (
      <div style={{height:'100%',minHeight:480,borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:6,background:'var(--gray-1)'}}>
        <p style={{fontSize:14,fontWeight:600,color:'#111'}}>No mapped listings yet</p>
        <p style={{fontSize:12,color:'var(--gray-4)',textAlign:'center',maxWidth:320}}>No exact listing coordinates are available for these results. Approximate locality centres are intentionally not shown as exact property pins.</p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '100%', minHeight: 480, border: '1px solid var(--border)' }}>
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pts.length > 1 && <FitBounds points={pts.map(p => p.pos)} />}
        {pts.map(({ l, pos }) => (
          <Marker key={l.id} position={pos} icon={pricePin(l.price, l.purpose)} eventHandlers={{ click: () => onSelect?.(l) }}>
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
