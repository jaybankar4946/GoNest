'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
});
type Pt = [number, number];
const round = (n: number) => Number(n.toFixed(5));

function Clicker({ onPick }: { onPick: (p: Pt) => void }) {
  useMapEvents({ click(e) { onPick([round(e.latlng.lat), round(e.latlng.lng)]); } });
  return null;
}
function Recenter({ center }: { center: Pt }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 15); }, [center, map]);
  return null;
}

// Supplier clicks (or drags the marker) to place the listing pin.
export default function PinPicker({ center, pin, onPick }: { center: Pt; pin: Pt | null; onPick: (p: Pt) => void }) {
  return (
    <MapContainer center={pin ?? center} zoom={15} style={{ height: 260, width: '100%', borderRadius: 12 }} scrollWheelZoom>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {!pin && <Recenter center={center} />}
      <Clicker onPick={onPick} />
      {pin && <Marker position={pin} icon={icon} draggable eventHandlers={{ dragend: (e) => { const ll = (e.target as L.Marker).getLatLng(); onPick([round(ll.lat), round(ll.lng)]); } }} />}
    </MapContainer>
  );
}
