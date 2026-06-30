export type ViewMode = 'home' | 'search' | 'saved' | 'dashboard' | 'admin' | 'property';
export type ListingTab = 'buy' | 'rent' | 'resale' | 'new-projects';

export type FilterState = {
  price: string;
  bedrooms: string;
  propertyType: string;
  sortBy: string;
};

// Indian-style number formatting: lakh / crore
export function formatPrice(price: number, type: 'sale' | 'rent'): string {
  if (type === 'rent') {
    if (price >= 100000) return '\u20b9' + (price / 100000).toFixed(1) + ' L/mo';
    return '\u20b9' + price.toLocaleString('en-IN') + '/mo';
  }
  if (price >= 10000000) return '\u20b9' + (price / 10000000).toFixed(price % 10000000 === 0 ? 0 : 2) + ' Cr';
  if (price >= 100000) return '\u20b9' + (price / 100000).toFixed(price % 100000 === 0 ? 0 : 1) + ' L';
  return '\u20b9' + price.toLocaleString('en-IN');
}

export function bhkLabel(bedrooms: number, propertyType: string): string {
  if (propertyType === 'plot') return 'Plot';
  if (propertyType === 'commercial') return 'Commercial';
  if (bedrooms === 0) return 'Studio';
  return `${bedrooms} BHK`;
}
