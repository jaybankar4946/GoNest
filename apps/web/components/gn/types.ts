export type ViewMode = 'home' | 'search' | 'saved' | 'dashboard' | 'admin';
export type ListingTab = 'buy' | 'rent' | 'resale' | 'premium';

export type FilterState = {
  price: string;
  bedrooms: string;
  propertyType: string;
  sortBy: string;
};

export function formatPrice(price: number, type: 'sale' | 'rent'): string {
  if (type === 'rent') {
    return '$' + price.toLocaleString() + '/mo';
  }
  if (price >= 1000000) {
    return '$' + (price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1) + 'M';
  }
  return '$' + (price / 1000).toFixed(0) + 'K';
}
