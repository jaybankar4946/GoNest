export function formatPrice(price: number, purpose: 'sale' | 'rent'): string {
  const fmt = (n: number, s: string) =>
    `₹${Number.isInteger(n) ? n : parseFloat(n.toFixed(2))} ${s}`;
  if (purpose === 'rent') {
    if (price >= 100000) return fmt(price / 100000, 'L/mo');
    return `₹${price.toLocaleString('en-IN')}/mo`;
  }
  if (price >= 10000000) return fmt(price / 10000000, 'Cr');
  if (price >= 100000)   return fmt(price / 100000, 'L');
  return `₹${price.toLocaleString('en-IN')}`;
}
export function bhkLabel(bedrooms: number, type: string): string {
  if (type === 'plot') return 'Plot';
  if (type === 'commercial' || type === 'office') return 'Commercial';
  if (bedrooms === 0) return 'Studio';
  return `${bedrooms} BHK`;
}
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
export function timeAgo(date: string): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
