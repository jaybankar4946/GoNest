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
  { name: 'R.B Estate Agency', area: 'Kasarvadavali · Ghodbunder Road', address: 'Shop No 4, Mayuresh Apartment, Ghodbunder Road, opposite Hyper City, Kasarvadavali, Thane West 400615', rating: 4.9, reviews: 1635, services: ['Buy', 'Sell', 'Rent'], note: 'Residential and commercial brokerage', mapQuery: 'R.B Estate Agency Kasarvadavali Thane', ratingSource: 'Public business-directory snapshot', websiteUrl: 'https://www.helloindia.co/Mumbai/R-B-ESTATE-AGENCY/Thane-East', profileImageUrl: 'https://www.google.com/s2/favicons?domain=helloindia.co&sz=256', imageSourceLabel: 'Public business listing identity' },
  { name: 'Kanhaiya Properties', area: 'Hiranandani Estate · Ghodbunder Road', address: 'Arcadia Building, 512-A, Ghodbunder Road, Hiranandani Estate, Thane West 400607', rating: 5.0, reviews: 270, services: ['Buy', 'Sell', 'Rent'], note: 'Local property brokerage and consultancy', mapQuery: 'Kanhaiya Properties Hiranandani Estate Thane', ratingSource: 'Public business-directory snapshot' },
  { name: 'Krishna Housing', area: 'Panch Pakhdi · Bhakti Mandir', address: 'Shop No 5, Gagangiri Cooperative Housing Society, opposite Malvan Restaurant, Bhakti Mandir, Panch Pakhdi, Thane West 400602', rating: 4.9, reviews: 244, services: ['Buy', 'Sell', 'Rent'], note: 'Residential and commercial property services', mapQuery: 'Krishna Housing Panch Pakhdi Thane', ratingSource: 'Public business-directory snapshot' },
  { name: 'Shivam Properties', area: 'Manpada · Dhokali', address: 'Shop No 14, Runwal Estate, behind R Mall, Dhokali, Thane West 400607', rating: 4.9, reviews: 219, services: ['Buy', 'Sell', 'Rent'], note: 'Property brokerage and consultancy', mapQuery: 'Shivam Properties Runwal Estate Thane', ratingSource: 'Public business-directory snapshot' },
  { name: 'Royalti', area: 'Kolshet Road · Lodha Supremus', address: 'Office 1110, 11th Floor, Gate 2, Lodha Supremus, Kolshet Road, Thane West 400607', rating: 4.8, reviews: 191, services: ['Buy', 'Sell', 'Rent'], note: 'Real estate consulting and brokerage', mapQuery: 'Royalti real estate Kolshet Road Thane', ratingSource: 'Public business-directory snapshot' },
  { name: 'Homesfy Realty Ltd', area: 'Cadbury Junction · Eastern Express Highway', address: 'Dev Corpora, Office 1602, Eastern Express Highway, near Cadbury Junction, Thane West 400601', rating: 4.6, reviews: 889, services: ['Buy', 'Sell', 'Rent'], note: 'Real estate brokerage and advisory', mapQuery: 'Homesfy Realty Ltd Cadbury Junction Thane', ratingSource: 'Public business-directory snapshot', websiteUrl: 'https://www.homesfy.in/', profileImageUrl: 'https://www.google.com/s2/favicons?domain=homesfy.in&sz=256', imageSourceLabel: 'Homesfy website identity' },
  { name: 'Ganesha Properties', area: 'Hiranandani Estate', address: 'Office 14, Silverlink CHS, Hiranandani Estate, Thane West 400607', rating: 5.0, reviews: 139, services: ['Buy', 'Sell', 'Rent'], note: 'Local property agency', mapQuery: 'Ganesha Properties Hiranandani Estate Thane', ratingSource: 'Public business-directory snapshot', websiteUrl: 'https://ganeshaproperties.in/', profileImageUrl: 'https://www.google.com/s2/favicons?domain=ganeshaproperties.in&sz=256', imageSourceLabel: 'Ganesha Properties website identity' },
  { name: 'Quick Deals Realty', area: 'Majiwada Junction', address: 'Swati Sagar Industrial Estate, near Shreya Chemist, Majiwada Junction, Thane West 400601', rating: 4.9, reviews: 81, services: ['Buy', 'Sell', 'Rent'], note: 'Local property brokerage', mapQuery: 'Quick Deals Realty Majiwada Thane', ratingSource: 'Public business-directory snapshot' },
  { name: 'John Real Estate', area: 'Lodha Splendora · Ghodbunder Road', address: 'Shop 18, Boulevard Premium Shopping, Lodha Splendora, Bhayandarpada, Ghodbunder Road, Thane West 400615', rating: 4.7, reviews: 128, services: ['Buy', 'Sell', 'Rent'], note: 'Residential and commercial property brokerage', mapQuery: 'John Real Estate Lodha Splendora Thane', ratingSource: 'Public business-directory snapshot' },
  { name: 'Swagat Properties', area: 'Kolshet Road · Dhokali', address: 'Shop 7, Kavyadhara Complex, Kolshet Road, Dhokali, Thane West 400607', rating: 4.9, reviews: 6, services: ['Buy', 'Sell', 'Rent'], note: 'Property consultant and brokerage', mapQuery: 'Swagat Properties Thane West', ratingSource: 'Public business-directory snapshot' },
];

export function businessMapsUrl(broker: Pick<ThaneBroker, 'mapQuery'>) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(broker.mapQuery);
}
