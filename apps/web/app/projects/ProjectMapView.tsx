'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

export type ProjectMapItem = {
  id: string;
  official_name: string;
  developer?: { operating_brand?: string | null } | null;
  city?: { name?: string } | null;
  locality?: { name?: string } | null;
  latitude: number | string | null;
  longitude: number | string | null;
  published_price_min_inr: number | null;
};

function FitProjects({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [36, 36], maxZoom: 13 });
    else if (points.length === 1) map.setView(points[0], 13);
  }, [points, map]);
  return null;
}

const price = (value: number | null) => {
  if (value == null) return 'Request current quote';
  if (value >= 10000000) return '₹' + (value / 10000000).toFixed(2).replace(/0+$/, '').replace(/\\.$/, '') + ' Cr';
  if (value >= 100000) return '₹' + (value / 100000).toFixed(1).replace(/\\.0$/, '') + ' L';
  return '₹' + value.toLocaleString('en-IN');
};

export default function ProjectMapView({ projects, onOpen }: { projects: ProjectMapItem[]; onOpen: (id: string) => void }) {
  const points = projects.map(project => {
    const lat = Number(project.latitude), lng = Number(project.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0)
      ? { project, point: [lat, lng] as [number, number] } : null;
  }).filter(Boolean) as { project: ProjectMapItem; point: [number, number] }[];

  if (!points.length) return <div className="flex min-h-[440px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center"><p className="font-bold text-slate-900">Project map data is not available yet</p><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">We only place projects on the map when GoNest has project coordinates. We will not guess a building location from a city or locality label.</p></div>;

  return <div className="h-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">Project pins use stored project coordinates. A pin does not imply verified unit availability.</div>
    <MapContainer center={points[0].point} zoom={11} scrollWheelZoom style={{ height: 'calc(100% - 36px)', width: '100%' }}>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitProjects points={points.map(item => item.point)} />
      {points.map(({ project, point }) => <CircleMarker key={project.id} center={point} radius={9} pathOptions={{ color: '#1D4ED8', fillColor: '#2563EB', fillOpacity: .9, weight: 2 }}>
        <Popup><div className="min-w-44"><p className="text-xs font-semibold text-blue-700">{project.developer?.operating_brand || 'Developer not recorded'}</p><p className="mt-1 font-bold">{project.official_name}</p><p className="mt-1 text-sm">{project.locality?.name || project.city?.name || 'Location details pending'}</p><p className="mt-1 text-sm font-semibold">{price(project.published_price_min_inr)}</p><button type="button" onClick={() => onOpen(project.id)} className="mt-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white">Explore project</button></div></Popup>
      </CircleMarker>)}
    </MapContainer>
  </div>;
}
