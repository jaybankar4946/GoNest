'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Search, MapPin, Home as HomeIcon } from 'lucide-react';

const TABS: { id: 'sale' | 'rent'; label: string }[] = [
  { id: 'sale', label: 'Buy' },
  { id: 'rent', label: 'Rent' },
];

const TYPES = ['apartment', 'villa', 'house', 'plot', 'commercial'];

const selWrap: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', minWidth: 150 };
const selEl: React.CSSProperties = { border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#111', width: '100%', appearance: 'none' };

export function HomeSearch() {
  const router = useRouter();
  const [purpose, setPurpose] = useState<'sale' | 'rent'>('sale');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');

  const go = () => {
    const params = new URLSearchParams();
    params.set('purpose', purpose);
    if (q.trim()) params.set('q', q.trim());
    if (type) params.set('type', type);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Buy / Rent tabs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 22 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setPurpose(t.id)}
            style={{
              fontSize: 16, paddingBottom: 6, position: 'relative',
              fontWeight: purpose === t.id ? 600 : 400,
              color: purpose === t.id ? 'var(--primary)' : '#6b7280',
              borderBottom: purpose === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'color .15s,border-color .15s',
            }}>
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Pill search bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
        style={{
          display: 'flex', alignItems: 'stretch', background: '#fff', borderRadius: 9999,
          boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', padding: 6, gap: 0,
        }}
        className="flex-col sm:flex-row">
        <div style={{ ...selWrap, flex: 1 }}>
          <MapPin size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
          <input placeholder="Search city, locality or project" value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && go()} style={{ ...selEl, padding: '12px 0' }} />
        </div>

        <div style={{ width: 1, background: 'var(--border)', margin: '8px 0' }} className="hidden sm:block" />

        <div style={selWrap}>
          <HomeIcon size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
          <select value={type} onChange={e => setType(e.target.value)} style={selEl}>
            <option value="">Property type</option>
            {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        <button onClick={go}
          style={{
            background: 'var(--primary)', color: '#fff', borderRadius: 9999, padding: '0 26px',
            fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, margin: 2,
          }}>
          <Search size={16} /> Search
        </button>
      </motion.div>
    </div>
  );
}
