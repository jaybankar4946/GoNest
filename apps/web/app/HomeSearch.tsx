'use client';

import { PropertySearchBar } from '@/components/search/PropertySearchBar';
import type { City } from '@/lib/types';

export function HomeSearch({ cities }: { cities: City[] }) {
  return <div className="w-full max-w-3xl text-left"><PropertySearchBar cities={cities} mode="home" /></div>;
}
