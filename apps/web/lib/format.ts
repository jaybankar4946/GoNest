export function formatPrice(price: number, purpose: 'sale' | 'rent'): string {
  const fmt = (n: number, s: string) =>
    `₹${Number.isInteger(n) ? n : parseFloat(n.toFixed(2))} ${s}`;
  if (purpose === 'rent') {
    if (price >= 100000) return fmt(price / 100000, 'L/mo');
    return `₹${price.toLocaleString('en-IN')}/mo`;
  }
  if (price >= 10000000) return fmt(price / 10000000, 'Cr');
  if (price >= 100000)   return fmt(price / 100000,   'L');
  return `₹${price.toLocaleString('en-IN')}`;
}
 
export function bhkLabel(bedrooms: number, type: string): string {
  if (type === 'plot')       return 'Plot';
  if (type === 'commercial') return 'Commercial';
  if (bedrooms === 0)        return 'Studio';
  return `${bedrooms} BHK`;
}
