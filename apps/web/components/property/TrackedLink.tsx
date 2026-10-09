'use client';
import { track, type TrackName } from '@/lib/track';
export function TrackedLink({ href, event, listingId, style, external, children }: { href: string; event: TrackName; listingId: string; style?: React.CSSProperties; external?: boolean; children: React.ReactNode }) {
  return <a href={href} onClick={() => track(event, listingId)} style={style} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>;
}
