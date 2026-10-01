export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
  category: 'sightseeing' | 'food' | 'transport' | 'culture' | 'relaxation' | 'stay' | 'nature';
}

export interface DayPlan {
  dayNumber: number;
  title: string;
  theme: string;
  activities: Activity[];
}

export interface PackingItem {
  id: string;
  item: string;
  packed: boolean;
  category: 'clothing' | 'electronics' | 'toiletries' | 'documents' | 'essentials';
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: 'stay' | 'food' | 'activities' | 'transport' | 'other';
  date: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  startDate: string;
  endDate: string;
  coverImage: string;
  notes: string;
  budgetTotal: number;
  currency: string;
  expenses: ExpenseItem[];
  packingList: PackingItem[];
  days: DayPlan[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania';
  coordinates: {
    lat: number;
    lng: number;
  };
  heroImage: string;
  gallery: string[];
  tagline: string;
  description: string;
  bestMonths: string;
  avgDailyCost: number;
  currency: string;
  styles: string[];
  highlights: string[];
  popularSpots: {
    name: string;
    type: 'landmark' | 'dining' | 'nature' | 'stay';
    lat: number;
    lng: number;
    description: string;
  }[];
  rating: number;
  reviewCount: number;
}

export interface TicketBooking {
  id: string;
  userId: string;
  bookingRef: string; // PNR / Ticket code
  type: 'train' | 'flight' | 'attraction' | 'tour';
  title: string;
  destination: string;
  country: string;
  origin?: string;
  date: string;
  time: string;
  passengerName: string;
  passengerEmail: string;
  ticketClass: string; // 'Executive / First' | 'Standard' | 'VIP Fast Track' | 'Economy'
  seatOrQuantity: string;
  priceUSD: number;
  status: 'confirmed' | 'cancelled';
  gateOrPlatform: string;
  qrCodeSeed: string;
  notes?: string;
  createdAt: string;
}

export interface BookableOffer {
  id: string;
  type: 'train' | 'flight' | 'attraction' | 'tour';
  title: string;
  provider: string; // e.g. 'Indian Railways (Vande Bharat)', 'JR Shinkansen', 'Air India', 'Archeological Survey of India', 'Louvre Museum'
  destination: string;
  country: string;
  origin?: string;
  duration?: string;
  departureTime?: string;
  basePriceUSD: number;
  classes: { name: string; priceMultiplier: number }[];
  image: string;
  rating: number;
  tag: string;
  highlights: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  homeCountry: string;
  travelStyle: string;
  bucketList: string[];
}

export interface GeneratedItinerary {
  title: string;
  tagline: string;
  destination: string;
  country: string;
  durationDays: number;
  style: string;
  budgetTier: string;
  estimatedTotalBudget: number;
  currency: string;
  highlights: string[];
  localInsiderTips: string[];
  packingEssentials: {
    item: string;
    category: 'clothing' | 'electronics' | 'toiletries' | 'documents' | 'essentials';
  }[];
  days: DayPlan[];
}

export interface CountryMapPlace {
  id: string;
  name: string;
  city: string;
  country: string;
  type: 'landmark' | 'dining' | 'nature' | 'stay' | 'city';
  lat: number;
  lng: number;
  description: string;
  rating: number;
  heroImage: string;
  avgDailyCost?: number;
  tag?: string;
}

export interface CountryMapResponse {
  country: string;
  flag: string;
  center: { lat: number; lng: number };
  zoom: number;
  gdpRank?: string;
  currency: string;
  overview: string;
  places: CountryMapPlace[];
}
