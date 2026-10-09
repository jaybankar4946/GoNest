'use client';
import { useEffect } from 'react';
import { track } from '@/lib/track';
export function TrackView({ listingId }: { listingId: string }) {
  useEffect(() => { track('property_view', listingId); }, [listingId]);
  return null;
}
