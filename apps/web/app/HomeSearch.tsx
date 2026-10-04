'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { City } from '@/lib/types';

const sel = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white appearance-none focus:outline-none focus:border-blue-400';

export function HomeSearch({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [purpose, setPurpose] = useState<'sale' | 'rent'>('sale');
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [beds, setBeds] = useState('');
  const [max, setMax] = useState('');
  const budgets = purpose === 'rent' ? [15000, 25000, 40000, 60000, 100000] : [5000000, 10000000, 20000000, 50000000];
  const go = () => {
    const p = new URLSearchParams({ purpose });
    if (q.trim()) p.set('q', q.trim());
    if (city) p.set('city', city);
    if (beds) p.set('beds', beds);
    if (max) p.set('max', max);
    router.push(`/search?${p.toString()}`);
  };
  const Chev = () => <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />;
  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden text-left">
      <div className="flex border-b border-gray-100">
        {(['sale', 'rent'] as const).map(v => (
          <button key={v} onClick={() => { setPurpose(v); setMax(''); }}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${purpose === v ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {v === 'sale' ? 'Buy' : 'Rent'}
          </button>
        ))}
      </div>
      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()}
            placeholder="Search locality or project, e.g. Andheri, Powai, Thane"
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <select value={city} onChange={e => setCity(e.target.value)} className={sel + ' pl-10'}>
              <option value="">Any city</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select><Chev />
          </div>
          <div className="relative">
            <select value={beds} onChange={e => setBeds(e.target.value)} className={sel}>
              <option value="">Any BHK</option>
              {['1', '2', '3', '4'].map(n => <option key={n} value={n}>{n}+ BHK</option>)}
            </select><Chev />
          </div>
          <div className="relative">
            <select value={max} onChange={e => setMax(e.target.value)} className={sel}>
              <option value="">Any budget</option>
              {budgets.map(n => <option key={n} value={n}>Up to {formatPrice(n, purpose)}</option>)}
            </select><Chev />
          </div>
        </div>
        <button onClick={go} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
          <Search className="w-4 h-4" /> Search properties
        </button>
      </div>
    </div>
  );
}
