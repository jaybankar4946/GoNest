export type ThaneBroker = {
  name: string;
  area: string;
  address: string;
  rating: number;
  reviews: number;
  services: string[];
  note: string;
  mapQuery: string;
  ratingSource: string;
};

export const THANE_TOP_AGENTS: ThaneBroker[] = [
  { name: 'R.B Estate Agency', area: 'Kasarvadavali · Ghodbunder Road', address: 'Shop No 4, Mayuresh Apartment, Ghodbunder Road, opposite Hyper City, Kasarvadavali, Thane West 400615', rating: 4.9, reviews: 1649, services: ['Buy', 'Sell', 'Rent'], note: 'Residential and commercial brokerage', mapQuery: 'R.B Estate Agency Kasarvadavali Thane', ratingSource: 'Google Maps' },
  { name: 'Shivam Properties', area: 'Manpada · Dhokali', address: 'Shop No 14, Runwal Estate, behind R Mall, Dhokali, Thane West 400607', rating: 4.9, reviews: 229, services: ['Buy', 'Sell', 'Rent'], note: 'Property brokerage and consultancy', mapQuery: 'Shivam Properties Runwal Estate Thane', ratingSource: 'Google Maps' },
  { name: 'Kanhaiya Properties', area: 'Hiranandani Estate · Ghodbunder Road', address: 'Arcadia Building, 512-A, Ghodbunder Road, Hiranandani Estate, Thane West 400607', rating: 5.0, reviews: 273, services: ['Buy', 'Sell', 'Rent'], note: 'Local property brokerage and consultancy', mapQuery: 'Kanhaiya Properties Hiranandani Estate Thane', ratingSource: 'Google Maps' },
  { name: 'Avenue Properties', area: 'Uthalsar · Castle Mill area', address: 'Shop No 48, Nirmaladevi C Dighe Sankul, Meenatai Thakrey Chowk, Uthalsar, Thane West 400601', rating: 5.0, reviews: 111, services: ['Buy', 'Sell', 'Rent'], note: 'Residential and commercial property services', mapQuery: 'Avenue Properties Uthalsar Thane', ratingSource: 'Google Maps' },
  { name: 'Krishna Housing', area: 'Panch Pakhdi · Bhakti Mandir', address: 'Shop No 5, Gagangiri Cooperative Housing Society, opposite Malvan Restaurant, Bhakti Mandir, Panch Pakhdi, Thane West 400602', rating: 4.9, reviews: 244, services: ['Buy', 'Sell', 'Rent'], note: 'Residential and commercial property services', mapQuery: 'Krishna Housing Panch Pakhdi Thane', ratingSource: 'Google Maps' },
  { name: 'Om Sai Properties', area: 'Thane West', address: 'Thane West, Maharashtra', rating: 4.8, reviews: 317, services: ['Buy', 'Sell', 'Rent'], note: 'Local property brokerage', mapQuery: 'Om Sai Properties Thane West', ratingSource: 'Public directory snapshot' },
  { name: 'Royalti', area: 'Kolshet Road · Lodha Supremus', address: 'Office 1110, 11th Floor, Gate 2, Lodha Supremus, Kolshet Road, Thane West 400607', rating: 4.8, reviews: 191, services: ['Buy', 'Sell', 'Rent'], note: 'Real estate consulting and brokerage', mapQuery: 'Royalti real estate Kolshet Road Thane', ratingSource: 'Google Maps' },
  { name: 'Swagat Properties', area: 'Kolshet Road · Dhokali', address: 'Kolshet Road, Dhokali, Thane West 400607', rating: 4.9, reviews: 1648, services: ['Buy', 'Sell', 'Rent'], note: 'Property consultant and brokerage', mapQuery: 'Swagat Properties Thane West', ratingSource: 'Google Maps' },
  { name: 'John Real Estate', area: 'Lodha Splendora · Ghodbunder Road', address: 'Boulevard Premium Shopping, Lodha Splendora, Bhayandarpada, Ghodbunder Road, Thane West 400615', rating: 4.7, reviews: 128, services: ['Buy', 'Sell', 'Rent'], note: 'Residential and commercial property brokerage', mapQuery: 'John Real Estate Lodha Splendora Thane', ratingSource: 'Public directory snapshot' },
  { name: 'Monish Estate Consultants LLP', area: 'Thane West', address: 'Thane West, Maharashtra', rating: 4.5, reviews: 138, services: ['Buy', 'Sell', 'Rent'], note: 'Real estate consultancy', mapQuery: 'Monish Estate Consultants LLP Thane', ratingSource: 'Public directory snapshot' },
];

export function businessMapsUrl(broker: Pick<ThaneBroker, 'mapQuery'>) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(broker.mapQuery);
}
