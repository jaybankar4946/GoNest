export type ThaneBroker = {
  name: string;
  city: 'Thane' | 'Mumbai' | 'Pune';
  area: string;
  address: string;
  mapQuery: string;
  websiteUrl?: string;
  rating?: number;
  publicReviewCount?: number;
  services?: string[];
  businessType?: string;
};

export const THANE_TOP_AGENTS: ThaneBroker[] = [
  { name: '958 Real Private Limited', city: 'Pune', area: 'Hinjewadi Phase 1', address: 'B 321, Suratwala Mark Plazzo, Hinjewadi Phase 1, Pune 411057', mapQuery: '958 Real Private Limited Hinjewadi Pune', websiteUrl: 'https://www.958real.com/contact-us.html' },
  { name: 'A and Z Realtors', city: 'Mumbai', area: 'Malad West', address: 'Evershine Mall, Link Road, Malad West, Mumbai, Maharashtra 400064', mapQuery: 'A and Z Realtors Malad West Mumbai' },
  { name: 'Asset Aspire', city: 'Mumbai', area: 'Chembur', address: 'Shop 7 & 8, Jai Shree Ganesh CHS, CG Road, Chembur, Mumbai 400074', mapQuery: 'Asset Aspire Chembur Mumbai' },
  { name: 'Chembur Properties (Roopam Estate Agency)', city: 'Mumbai', area: 'Chembur', address: '70 Central Avenue Road, Chembur, Mumbai, Maharashtra 400071', mapQuery: 'Chembur Properties Roopam Estate Agency Mumbai' },
  { name: 'KWICK PROPERTY CONSULTANTS', city: 'Mumbai', area: 'Andheri West', address: 'Office 11, 1st Floor, Building 22, Amar Jyoti Building, Manish Nagar, Andheri West, Mumbai 400053', mapQuery: 'Kwick Property Consultants Andheri West Mumbai' },
  { name: 'Namo Property Consultant', city: 'Mumbai', area: 'Kandivali East', address: 'Shop 66, Whispering Palms Shopping Center, Kandivali East, Mumbai 400101', mapQuery: 'Namo Property Consultant Kandivali East Mumbai' },
  { name: 'Oriental Properties Real Estate Consultant', city: 'Mumbai', area: 'Andheri West', address: 'B Wing, Dhanashree Heights, 205-206 Veera Desai Road, Andheri West, Mumbai, Maharashtra 400053', mapQuery: 'Oriental Properties Andheri West Mumbai' },
  { name: 'PROPRISE Property Consulting Pvt Ltd', city: 'Pune', area: 'Baner', address: '301, Sai Empire, above HDFC Bank, Baner, Pune, Maharashtra 411045', mapQuery: 'Proprise Property Consulting Baner Pune', websiteUrl: 'https://proprise.co.in/contact/' },
  { name: 'Richa Realtors', city: 'Pune', area: 'Paud Road', address: 'Office 4, Landmark Commercial Complex, Paud Road, Pune 411038', mapQuery: 'Richa Realtors Paud Road Pune', websiteUrl: 'https://richaindia.com/real-estate-builders-in-mumbai-and-pune/contact-us.html' },
  { name: 'Riya Estate Consultants', city: 'Mumbai', area: 'Vile Parle East', address: 'Shop 1, Tejmanjul Building, Tejpal Road and Hanuman Road junction, Vile Parle East, Mumbai 400057', mapQuery: 'Riya Estate Consultants Vile Parle East Mumbai' },
  { name: 'Stanley Estate Consultants', city: 'Mumbai', area: 'Marol · Andheri East', address: 'Twin Arcade Premises, Military Road, Marol, Andheri East, Mumbai, Maharashtra 400059', mapQuery: 'Stanley Estate Consultants Andheri East Mumbai' },
  { name: 'R.B Estate Agency', city: 'Thane', area: 'Kasarvadavali · Ghodbunder Road', address: 'Shop No 4, Mayuresh Apartment, Ghodbunder Road, opposite Hyper City, Kasarvadavali, Thane West 400615', mapQuery: 'R.B Estate Agency Kasarvadavali Thane', rating: 4.9, publicReviewCount: 1635, services: ['Buy', 'Sell', 'Rent'], businessType: 'Residential and commercial brokerage' },
  { name: 'Kanhaiya Properties', city: 'Thane', area: 'Hiranandani Estate · Ghodbunder Road', address: 'Arcadia Building, 512-A, Ghodbunder Road, Hiranandani Estate, Thane West 400607', mapQuery: 'Kanhaiya Properties Hiranandani Estate Thane' },
  { name: 'Krishna Housing', city: 'Thane', area: 'Panch Pakhdi · Bhakti Mandir', address: 'Shop No 5, Gagangiri Cooperative Housing Society, opposite Malvan Restaurant, Bhakti Mandir, Panch Pakhdi, Thane West 400602', mapQuery: 'Krishna Housing Panch Pakhdi Thane' },
  { name: 'Shivam Properties', city: 'Thane', area: 'Manpada · Dhokali', address: 'Shop No 14, Runwal Estate, behind R Mall, Dhokali, Thane West 400607', mapQuery: 'Shivam Properties Runwal Estate Thane' },
  { name: 'Royalti', city: 'Thane', area: 'Kolshet Road · Lodha Supremus', address: 'Office 1110, 11th Floor, Gate 2, Lodha Supremus, Kolshet Road, Thane West 400607', mapQuery: 'Royalti real estate Kolshet Road Thane' },
  { name: 'Homesfy Realty Ltd', city: 'Thane', area: 'Cadbury Junction · Eastern Express Highway', address: 'Dev Corpora, Office 1602, Eastern Express Highway, near Cadbury Junction, Thane West 400601', mapQuery: 'Homesfy Realty Ltd Cadbury Junction Thane', websiteUrl: 'https://www.homesfy.in/' },
  { name: 'Ganesha Properties', city: 'Thane', area: 'Hiranandani Estate', address: 'Office 14, Silverlink CHS, Hiranandani Estate, Thane West 400607', mapQuery: 'Ganesha Properties Hiranandani Estate Thane', websiteUrl: 'https://ganeshaproperties.in/' },
  { name: 'Quick Deals Realty', city: 'Thane', area: 'Majiwada Junction', address: 'Swati Sagar Industrial Estate, near Shreya Chemist, Majiwada Junction, Thane West 400601', mapQuery: 'Quick Deals Realty Majiwada Thane' },
  { name: 'John Real Estate', city: 'Thane', area: 'Lodha Splendora · Ghodbunder Road', address: 'Shop 18, Boulevard Premium Shopping, Lodha Splendora, Bhayandarpada, Ghodbunder Road, Thane West 400615', mapQuery: 'John Real Estate Lodha Splendora Thane' },
  { name: 'Swagat Properties', city: 'Thane', area: 'Kolshet Road · Dhokali', address: 'Shop 7, Kavyadhara Complex, Kolshet Road, Dhokali, Thane West 400607', mapQuery: 'Swagat Properties Thane West' },
];

export function businessMapsUrl(broker: Pick<ThaneBroker, 'mapQuery'>) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(broker.mapQuery);
}
