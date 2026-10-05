// Deterministic search-box parser: "2 BHK apartment in Thane under 1 crore" -> filters + location text.
export type Parsed = { q: string; beds?: string; minPrice?: number; maxPrice?: number; purpose?: 'sale' | 'rent'; type?: string };

const TYPES: Record<string, string> = {
  apartment: 'apartment', apartments: 'apartment', flat: 'apartment', flats: 'apartment', villa: 'villa', villas: 'villa',
  house: 'house', houses: 'house', bungalow: 'house', plot: 'plot', plots: 'plot', land: 'plot',
  office: 'office', shop: 'commercial', commercial: 'commercial', pg: 'pg',
};
const STOP = new Set(['in', 'near', 'at', 'for', 'a', 'an', 'the', 'with', 'to', 'of', 'and', 'me', 'find', 'show', 'want', 'looking', 'i', 'need', 'properties', 'property', 'homes', 'home', 'under', 'below', 'above', 'over', 'around', 'budget', 'price']);
const UNIT = '(cr|crore|crores|l|lac|lacs|lakh|lakhs|k|thousand)?';

function money(n: number, unit?: string) {
  const u = (unit ?? '').toLowerCase();
  if (u.startsWith('cr')) return Math.round(n * 1e7);
  if (u === 'l' || u.startsWith('lac') || u.startsWith('lakh')) return Math.round(n * 1e5);
  if (u === 'k' || u === 'thousand') return Math.round(n * 1e3);
  return Math.round(n);
}

export function parseQuery(input: string): Parsed {
  const out: Parsed = { q: '' };
  let s = ' ' + input.toLowerCase().replace(/₹|\brs\.?|\binr\b/g, ' ').replace(/(\d),(?=\d)/g, '$1') + ' ';
  s = s.replace(/\b(\d)\s*\+?\s*(?:bhk|bedrooms?|beds?|bd)\b/g, (_, n) => { out.beds = n; return ' '; });
  s = s.replace(new RegExp(`\\b(?:under|below|upto|up to|within|max|maximum|less than|budget)\\s*(\\d+(?:\\.\\d+)?)\\s*${UNIT}\\b`), (_, n, u) => { out.maxPrice = money(+n, u); return ' '; });
  s = s.replace(new RegExp(`\\b(?:above|over|min|minimum|more than|starting)\\s*(\\d+(?:\\.\\d+)?)\\s*${UNIT}\\b`), (_, n, u) => { out.minPrice = money(+n, u); return ' '; });
  s = s.replace(/\b(?:for rent|rent|rental|to let|lease)\b/, () => { out.purpose = 'rent'; return ' '; });
  s = s.replace(/\b(?:for sale|buy|sale|purchase|resale)\b/, () => { out.purpose = 'sale'; return ' '; });
  const words: string[] = [];
  for (const w of s.split(/[^a-z0-9]+/).filter(Boolean)) {
    if (TYPES[w]) { out.type ??= TYPES[w]; continue; }
    if (STOP.has(w) || /^\d+$/.test(w)) continue;
    words.push(w);
  }
  out.q = words.join(' ');
  return out;
}
