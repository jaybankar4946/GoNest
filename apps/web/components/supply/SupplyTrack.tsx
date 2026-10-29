'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { track } from '@/lib/track';

// Anonymous funnel events only: never names, emails, phones or free text.
export function SupplyLandingView() {
  useEffect(() => { track('supply_landing_view'); }, []);
  return null;
}

export function SupplyRoleLink({ role, href, style, children }: { role: string; href: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return <Link href={href} style={style} onClick={() => track('supply_role_click', undefined, { role })}>{children}</Link>;
}
