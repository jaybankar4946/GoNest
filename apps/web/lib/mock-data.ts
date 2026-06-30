export type Listing = {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number; // INR — sale: total rupees, rent: rupees/month
  priceType: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: 'apartment' | 'villa' | 'house' | 'plot' | 'commercial';
  images: string[];
  featured: boolean;
  description: string;
  whatsapp?: string;
  locality: string;
};

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Luxury Apartment',
    city: 'Mumbai',
    state: 'Maharashtra',
    locality: 'Andheri West',
    price: 12500000,
    priceType: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 980,
    propertyType: 'apartment',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900'],
    featured: true,
    description: 'A sun-filled two-bedroom apartment in the heart of Andheri West, close to schools, metro, and markets. Modern fittings throughout with a private balcony.',
  },
  {
    id: '2',
    title: 'Garden Villa',
    city: 'Bangalore',
    state: 'Karnataka',
    locality: 'Whitefield',
    price: 32000000,
    priceType: 'sale',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3200,
    propertyType: 'villa',
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900'],
    featured: true,
    description: 'Spacious independent villa with private garden and double car parking, set in a quiet gated community near Whitefield tech parks.',
  },
  {
    id: '3',
    title: 'Modern 3BHK',
    city: 'Pune',
    state: 'Maharashtra',
    locality: 'Baner',
    price: 45000,
    priceType: 'rent',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 1450,
    propertyType: 'apartment',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900'],
    featured: true,
    description: 'Well-ventilated 3BHK apartment available for rent in a premium society with clubhouse, gym, and swimming pool access.',
  },
  {
    id: '4',
    title: 'Riverside Plot',
    city: 'Hyderabad',
    state: 'Telangana',
    locality: 'Gachibowli',
    price: 8500000,
    priceType: 'sale',
    bedrooms: 0,
    bathrooms: 0,
    sqft: 2400,
    propertyType: 'plot',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900'],
    featured: false,
    description: 'DTCP-approved residential plot in a fast-developing corridor, ideal for building your dream home close to the IT hub.',
  },
  {
    id: '5',
    title: 'Penthouse Suite',
    city: 'Delhi',
    state: 'Delhi',
    locality: 'Vasant Vihar',
    price: 95000,
    priceType: 'rent',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 2800,
    propertyType: 'apartment',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900'],
    featured: true,
    description: 'Expansive penthouse with private terrace and skyline views, located in one of Delhi\u2019s most sought-after diplomatic enclaves.',
  },
  {
    id: '6',
    title: 'Commercial Office Space',
    city: 'Bangalore',
    state: 'Karnataka',
    locality: 'Indiranagar',
    price: 18000000,
    priceType: 'sale',
    bedrooms: 0,
    bathrooms: 2,
    sqft: 1800,
    propertyType: 'commercial',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=900'],
    featured: false,
    description: 'Ready-to-move commercial office space on the main road, suitable for startups and small businesses, with ample parking.',
  },
  {
    id: '7',
    title: 'Cozy Studio',
    city: 'Pune',
    state: 'Maharashtra',
    locality: 'Koregaon Park',
    price: 22000,
    priceType: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 520,
    propertyType: 'apartment',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900'],
    featured: false,
    description: 'Compact and stylish studio apartment perfect for young professionals, walking distance to cafes and co-working spaces.',
  },
  {
    id: '8',
    title: 'Heritage Bungalow',
    city: 'Hyderabad',
    state: 'Telangana',
    locality: 'Banjara Hills',
    price: 27500000,
    priceType: 'sale',
    bedrooms: 5,
    bathrooms: 5,
    sqft: 4100,
    propertyType: 'house',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900'],
    featured: false,
    description: 'A beautifully maintained independent bungalow with classic architecture and a large lawn, located in a premium hilltop neighbourhood.',
  },
];

export const popularCities = ['Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Delhi'];

export const categories: { type: Listing['propertyType']; label: string }[] = [
  { type: 'apartment', label: 'Apartments' },
  { type: 'villa', label: 'Villas' },
  { type: 'plot', label: 'Plots' },
  { type: 'commercial', label: 'Commercial' },
];
