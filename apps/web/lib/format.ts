export function formatPrice(price: number, purpose: 'sale' | 'rent'): string {
  const f = (n: number, s: string) =>
    `₹${Number.isInteger(n) ? n : parseFloat(n.toFixed(2))} ${s}`;
  if (purpose === 'rent') {
    if (price >= 100000) return f(price / 100000, 'L/mo');
    return `₹${price.toLocaleString('en-IN')}/mo`;
  }
  if (price >= 10000000) return f(price / 10000000, 'Cr');
  if (price >= 100000)   return f(price / 100000, 'L');
  return `₹${price.toLocaleString('en-IN')}`;
}
export function bhkLabel(bedrooms: number, type: string): string {
  if (type === 'plot') return 'Plot';
  if (['commercial','office'].includes(type)) return 'Commercial';
  if (bedrooms === 0) return 'Studio';
  return `${bedrooms} BHK`;
}
export function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
export function timeAgo(date: string): string {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}
export function calcEMI(principal: number, ratePercent: number, tenureYears: number): number {
  const r = ratePercent / 12 / 100;
  const n = tenureYears * 12;
  if (r === 0) return Math.round(principal / n);
  return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
}
const LOCALITY_AVG: Record<string, number> = {
  'andheri-west': 18000, 'bandra-west': 28000, 'powai': 16000,
  'worli': 35000, 'lower-parel': 30000, 'juhu': 25000,
  'baner': 9500, 'koregaon-park': 12000, 'hinjewadi': 8000,
  'whitefield': 8500, 'indiranagar': 14000, 'koramangala': 13000,
  'gachibowli': 7500, 'banjara-hills': 11000, 'madhapur': 8000,
};
export function fairValue(price: number, sqft: number | null, localitySlug?: string): { estimate: number; label: string; diff: number; color: string } | null {
  if (!sqft || sqft === 0) return null;
  const avg = LOCALITY_AVG[localitySlug ?? ''] ?? 14000;
  const estimate = avg * sqft;
  const diff = Math.round(((price - estimate) / estimate) * 100);
  const label = diff > 15 ? 'Above market' : diff < -15 ? 'Below market' : 'Fair value';
  const color = diff > 15 ? '#DC2626' : diff < -15 ? '#16A34A' : '#D97706';
  return { estimate, label, diff, color };
}
export function rentalYield(salePrice: number, monthlyRent: number): string {
  if (!salePrice || !monthlyRent) return '—';
  return `${(((monthlyRent * 12) / salePrice) * 100).toFixed(1)}%`;
}
export const BUY_CHECKLIST = [
  { id: 1, label: 'Token amount paid',        desc: '1–2% of property value. Confirms intent.' },
  { id: 2, label: 'Legal title verification', desc: 'Lawyer checks ownership history (15–30 years).' },
  { id: 3, label: 'Home loan sanction',        desc: 'Bank approves loan based on income & property.' },
  { id: 4, label: 'Sale agreement signed',     desc: 'Terms locked. Stamp duty on agreement value.' },
  { id: 5, label: 'Property inspection',       desc: 'Physical check of condition, fittings, utilities.' },
  { id: 6, label: 'Registration',              desc: 'Sub-registrar office. Stamp duty + charges.' },
  { id: 7, label: 'Possession & handover',     desc: 'Keys, NOC, society transfer complete.' },
];
export const RENT_CHECKLIST = [
  { id: 1, label: 'Terms agreed',        desc: 'Rent, deposit, tenure, notice period confirmed.' },
  { id: 2, label: 'Owner ID verified',   desc: 'Aadhar + ownership documents checked.' },
  { id: 3, label: 'Agreement signed',    desc: 'Notarised or registered (11 months typically).' },
  { id: 4, label: 'Deposit paid',        desc: 'Typically 2–3 months rent. Get receipt.' },
  { id: 5, label: 'Move-in inspection',  desc: 'Document existing damage before moving in.' },
  { id: 6, label: 'Utilities set up',    desc: 'Electricity, gas, water, broadband setup.' },
];
