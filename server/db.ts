import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatar: string;
  bio: string;
  homeCountry: string;
  travelStyle: string;
  bucketList: string[];
  createdAt: string;
}

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
  avgDailyCost: number; // in USD
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
  bookingRef: string;
  type: 'train' | 'flight' | 'attraction' | 'tour';
  title: string;
  destination: string;
  country: string;
  origin?: string;
  date: string;
  time: string;
  passengerName: string;
  passengerEmail: string;
  ticketClass: string;
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
  provider: string;
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

interface DatabaseSchema {
  users: User[];
  trips: Trip[];
  destinations: Destination[];
  bookings: TicketBooking[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'wanderhub_db.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch {
  // Read-only filesystem in serverless environments (e.g. Vercel)
}

export const INITIAL_DESTINATIONS: Destination[] = [
  // --- INDIA (Featured Major Cities & Iconic Hubs) ---
  {
    id: 'jaipur-india',
    name: 'Jaipur',
    country: 'India',
    region: 'Asia',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop'
    ],
    tagline: 'The Royal Pink City: majestic hilltop forts, vibrant bazaars & grand palaces',
    description: 'Capital of Rajasthan, Jaipur forms the legendary Golden Triangle. Known for the honeycomb facade of Hawa Mahal, the hilltop fortress of Amber, and opulent royal mahals reflecting Rajput heritage.',
    bestMonths: 'October - March',
    avgDailyCost: 45,
    currency: 'INR',
    styles: ['Culture', 'Heritage', 'Foodie', 'Photography'],
    highlights: ['Amber Fort elephant pathway & mirror hall', 'Hawa Mahal (Palace of Winds)', 'City Palace royal museum', 'Johari & Bapu Bazaar gem shopping', 'Authentic Dal Baati Churma banquet'],
    popularSpots: [
      { name: 'Amber Fort', type: 'landmark', lat: 26.9855, lng: 75.8513, description: 'Iconic yellow sandstone Rajput fortress with sweeping views over Maota Lake.' },
      { name: 'Hawa Mahal', type: 'landmark', lat: 26.9239, lng: 75.8267, description: 'Five-storey pink palace with 953 intricately carved jharokhas.' },
      { name: 'Laxmi Mishthan Bhandar (LMB)', type: 'dining', lat: 26.9197, lng: 75.8239, description: 'Historic 1727 sweet shop and thali restaurant in Johari Bazaar.' },
      { name: 'Rambagh Palace', type: 'stay', lat: 26.8974, lng: 75.8086, description: 'Former residence of the Maharaja of Jaipur, ranked among world finest luxury heritage hotels.' }
    ],
    rating: 4.9,
    reviewCount: 420
  },
  {
    id: 'new-delhi-india',
    name: 'New Delhi',
    country: 'India',
    region: 'Asia',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    heroImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592635196078-9fe3d54f2377?q=80&w=800&auto=format&fit=crop'
    ],
    tagline: 'Heart of India: monumental Mughal heritage meets bustling modern metropolis',
    description: 'A layered historic capital where Mughal emperors built Red Fort and Jama Masjid alongside British Raj landmarks like India Gate, surrounded by Michelin-recognized culinary scenes and vibrant spice markets.',
    bestMonths: 'October - March',
    avgDailyCost: 40,
    currency: 'INR',
    styles: ['Culture', 'Foodie', 'Heritage', 'City'],
    highlights: ['India Gate & Kartavya Path', 'Qutub Minar 12th-century minaret', 'Humayun’s Tomb Persian gardens', 'Chandni Chowk rickshaw food safari', 'Lotus Temple architecture'],
    popularSpots: [
      { name: 'India Gate', type: 'landmark', lat: 28.6129, lng: 77.2295, description: 'War memorial archway glowing golden at night on Kartavya Path.' },
      { name: 'Qutub Minar', type: 'landmark', lat: 28.5244, lng: 77.1855, description: 'UNESCO World Heritage 73-meter victory tower with fluted red sandstone.' },
      { name: 'Karim’s Old Delhi', type: 'dining', lat: 28.6507, lng: 77.2334, description: 'Legendary royal Mughal cuisine established in 1913 near Jama Masjid.' },
      { name: 'The Imperial New Delhi', type: 'stay', lat: 28.6253, lng: 77.2185, description: 'Colonial landmark hotel adorned with historic art and regal high tea.' }
    ],
    rating: 4.8,
    reviewCount: 512
  },
  {
    id: 'mumbai-india',
    name: 'Mumbai',
    country: 'India',
    region: 'Asia',
    coordinates: { lat: 18.9220, lng: 72.8347 },
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop'
    ],
    tagline: 'City of Dreams: Arabian Sea breezes, Victorian Gothic spires & Bollywood soul',
    description: 'India’s financial powerhouse and creative capital. Stroll along the Marine Drive Queen’s Necklace, admire the Gateway of India, sample world-renowned Bombay street eats, and tour Elephanta cave temples.',
    bestMonths: 'November - February',
    avgDailyCost: 55,
    currency: 'INR',
    styles: ['City', 'Foodie', 'Culture', 'Coastal'],
    highlights: ['Gateway of India waterfront', 'Marine Drive Queen’s Necklace at sunset', 'Elephanta Caves rock sculpture', 'Colaba Causeway street shopping', 'Authentic Vada Pav & Parsi Irani cafes'],
    popularSpots: [
      { name: 'Gateway of India', type: 'landmark', lat: 18.9220, lng: 72.8347, description: '20th-century basalt arch overlooking Mumbai Harbour and Arabian Sea.' },
      { name: 'Marine Drive', type: 'nature', lat: 18.9432, lng: 72.8230, description: '3.6-kilometer curved promenade glowing with city lights at twilight.' },
      { name: 'Britannia & Co. Restaurant', type: 'dining', lat: 18.9378, lng: 72.8398, description: 'Historic 1923 Parsi institution famous for Berry Pulao and caramel custard.' },
      { name: 'The Taj Mahal Palace', type: 'stay', lat: 18.9217, lng: 72.8333, description: 'World-renowned 1903 heritage flagship hotel facing the Gateway of India.' }
    ],
    rating: 4.8,
    reviewCount: 380
  },
  {
    id: 'goa-india',
    name: 'Goa',
    country: 'India',
    region: 'Asia',
    coordinates: { lat: 15.2993, lng: 74.1240 },
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop'
    ],
    tagline: 'Sun, sand & susegad: Portuguese colonial mansions, palm beaches & spice farms',
    description: 'India’s tropical coastal jewel. Discover colorful Latin quarters in Fontainhas, golden sand beaches in Palolem and Vagator, cascading Dudhsagar waterfalls, and fresh Goan fish curry.',
    bestMonths: 'October - April',
    avgDailyCost: 50,
    currency: 'INR',
    styles: ['Relaxation', 'Coastal', 'Foodie', 'Adventure'],
    highlights: ['Palolem & Morjim beaches', 'Fontainhas Portuguese Latin Quarter', 'Basilica of Bom Jesus UNESCO church', 'Dudhsagar Waterfalls trek', 'Fresh seafood thali & feni cocktails'],
    popularSpots: [
      { name: 'Basilica of Bom Jesus', type: 'landmark', lat: 15.5009, lng: 73.9116, description: '16th-century baroque cathedral holding the sacred relics of St. Francis Xavier.' },
      { name: 'Palolem Beach', type: 'nature', lat: 15.0100, lng: 74.0232, description: 'Crescent-shaped white sand cove bordered by coconut palms and beach shacks.' },
      { name: 'Gunpowder Assagao', type: 'dining', lat: 15.5898, lng: 73.7744, description: 'Peninsular South Indian home-style dining in an open-air heritage Portuguese garden.' },
      { name: 'Taj Fort Aguada Resort', type: 'stay', lat: 15.4925, lng: 73.7719, description: 'Clifftop luxury beach resort built into the ramparts of a 16th-century Portuguese fortress.' }
    ],
    rating: 4.9,
    reviewCount: 460
  },
  {
    id: 'agra-india',
    name: 'Agra',
    country: 'India',
    region: 'Asia',
    coordinates: { lat: 27.1767, lng: 78.0081 },
    heroImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop'
    ],
    tagline: 'Home of the immortal Taj Mahal, wonder of the world along the Yamuna River',
    description: 'Steeped in Mughal grandeur, Agra is crowned by the breathtaking white marble Taj Mahal, the sprawling red sandstone Agra Fort, and nearby deserted imperial capital Fatehpur Sikri.',
    bestMonths: 'October - March',
    avgDailyCost: 40,
    currency: 'INR',
    styles: ['Heritage', 'Culture', 'Photography'],
    highlights: ['Sunrise at the Taj Mahal', 'Agra Fort red sandstone palaces', 'Mehtab Bagh moonlight reflection garden', 'Mughlai kebabs & Agra Petha sweets', 'Fatehpur Sikri excursion'],
    popularSpots: [
      { name: 'Taj Mahal', type: 'landmark', lat: 27.1751, lng: 78.0421, description: 'Unrivaled 17th-century white marble mausoleum built by Emperor Shah Jahan.' },
      { name: 'Agra Fort', type: 'landmark', lat: 27.1795, lng: 78.0211, description: 'Vast walled imperial palace city of the Mughal emperors.' },
      { name: 'Pinch of Spice', type: 'dining', lat: 27.1585, lng: 78.0380, description: 'Acclaimed North Indian kitchen renowned for murgh boti and dal makhani.' },
      { name: 'Oberoi Amarvilas', type: 'stay', lat: 27.1702, lng: 78.0494, description: 'Luxury hotel where every guest room commands uninterrupted Taj Mahal views.' }
    ],
    rating: 4.9,
    reviewCount: 610
  },
  {
    id: 'kerala-india',
    name: 'Kerala (Kochi & Backwaters)',
    country: 'India',
    region: 'Asia',
    coordinates: { lat: 9.9312, lng: 76.2673 },
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop'
    ],
    tagline: 'God’s Own Country: tranquil backwater houseboats, spice hills & Ayurveda',
    description: 'Lush tropical paradise famed for serene Alleppey lagoon houseboats, Fort Kochi Chinese fishing nets and spice trade history, and emerald Munnar tea hills.',
    bestMonths: 'September - March',
    avgDailyCost: 55,
    currency: 'INR',
    styles: ['Nature', 'Relaxation', 'Wellness', 'Culture'],
    highlights: ['Overnight traditional Kettuvallam houseboat cruise', 'Fort Kochi historic Chinese fishing nets', 'Authentic Ayurvedic rejuvenation massage', 'Munnar rolling green tea plantations', 'Kathakali classical dance theatre'],
    popularSpots: [
      { name: 'Alleppey Backwaters', type: 'nature', lat: 9.4981, lng: 76.3388, description: 'Labyrinthine network of tranquil palm-fringed canals, lagoons and lakes.' },
      { name: 'Fort Kochi Chinese Nets', type: 'landmark', lat: 9.9674, lng: 76.2427, description: 'Cantilevered fishing nets introduced by 14th-century Chinese traders.' },
      { name: 'Grand Pavilion', type: 'dining', lat: 9.9723, lng: 76.2858, description: 'Traditional Kerala seafood feast with karimeen pollichathu and appams.' },
      { name: 'Brunton Boatyard', type: 'stay', lat: 9.9682, lng: 76.2415, description: 'Restored Victorian shipyard hotel capturing spice era merchant charm.' }
    ],
    rating: 4.9,
    reviewCount: 395
  },
  {
    id: 'varanasi-india',
    name: 'Varanasi',
    country: 'India',
    region: 'Asia',
    coordinates: { lat: 25.3176, lng: 82.9739 },
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop'
    ],
    tagline: 'The Spiritual Soul of India: ancient holy ghats & sacred Ganga Aarti ceremonies',
    description: 'One of the world’s oldest continuously inhabited cities. Experience sunrise rowing on the sacred Ganges river, mesmerizing fire ceremonies at Dashashwamedh Ghat, and narrow mystical alleyways.',
    bestMonths: 'October - March',
    avgDailyCost: 35,
    currency: 'INR',
    styles: ['Culture', 'Heritage', 'Photography', 'Solo'],
    highlights: ['Dawn wooden boat ride on the River Ganges', 'Evening Ganga Aarti at Dashashwamedh Ghat', 'Kashi Vishwanath sacred golden temple', 'Sarnath deer park where Buddha taught', 'Famous Banarasi silk saree weaving'],
    popularSpots: [
      { name: 'Dashashwamedh Ghat', type: 'landmark', lat: 25.3076, lng: 83.0107, description: 'Primary sacred riverside steps hosting the daily devotional fire Aarti ritual.' },
      { name: 'Assi Ghat', type: 'nature', lat: 25.2891, lng: 83.0067, description: 'Southernmost ghat beloved by morning yoga practitioners and artists.' },
      { name: 'Kashi Chaat Bhandar', type: 'dining', lat: 25.3090, lng: 83.0039, description: 'Legendary street stall famous for tamatar (tomato) chaat and palak chaat.' },
      { name: 'BrijRama Palace', type: 'stay', lat: 25.3060, lng: 83.0118, description: '18th-century royal Maratha fort palace situated directly above Darbhanga Ghat.' }
    ],
    rating: 4.8,
    reviewCount: 340
  },
  {
    id: 'bengaluru-india',
    name: 'Bengaluru',
    country: 'India',
    region: 'Asia',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    heroImage: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop'
    ],
    tagline: 'Silicon Valley of India: verdant Garden City parks, craft breweries & innovation',
    description: 'Dynamic cosmopolitan tech hub celebrated for its pleasant year-round weather, sprawling botanical parks, booming microbrewery culture, and thriving startup energy.',
    bestMonths: 'September - March',
    avgDailyCost: 50,
    currency: 'INR',
    styles: ['City', 'Foodie', 'Tech', 'Culture'],
    highlights: ['Lalbagh Glass House & botanical gardens', 'Cubbon Park morning cycling', 'Indiranagar & Koramangala craft breweries', 'Bangalore Tudor Palace', 'Filter coffee & crispy Masala Dosa at Vidyarthi Bhavan'],
    popularSpots: [
      { name: 'Lalbagh Botanical Garden', type: 'nature', lat: 12.9507, lng: 77.5848, description: '240-acre botanical haven founded in 1760 featuring a famous glass house.' },
      { name: 'Bangalore Palace', type: 'landmark', lat: 12.9988, lng: 77.5921, description: 'Tudor-revival royal residence inspired by England’s Windsor Castle.' },
      { name: 'Vidyarthi Bhavan', type: 'dining', lat: 12.9427, lng: 77.5708, description: 'Historic Gandhi Bazaar breakfast legend serving golden butter masala dosas since 1943.' },
      { name: 'The Leela Palace Bengaluru', type: 'stay', lat: 12.9606, lng: 77.6484, description: 'Regal hotel reflecting the architectural splendour of the Vijayanagara Empire.' }
    ],
    rating: 4.7,
    reviewCount: 290
  },

  // --- TOP GDP NATIONS & ICONIC GLOBAL HUBS ---
  {
    id: 'tokyo-japan',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1600&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop'],
    tagline: 'Futuristic neon skyline meets centuries-old shrines and 3-star Michelin gastronomy',
    description: 'The world’s most populous metropolitan economy. From the scramble crossing of Shibuya to peaceful Meiji Jingu shrine and robot-served sushi bars, Tokyo is unmatched.',
    bestMonths: 'March - May & September - November',
    avgDailyCost: 165,
    currency: 'JPY',
    styles: ['City', 'Foodie', 'Tech', 'Culture'],
    highlights: ['Shibuya Scramble Crossing', 'Senso-ji ancient temple in Asakusa', 'Tsukiji outer fish market sushi', 'Shinjuku golden gai nightlife', 'Akihabara tech and anime hub'],
    popularSpots: [
      { name: 'Senso-ji Temple', type: 'landmark', lat: 35.7148, lng: 139.7967, description: 'Tokyo’s oldest Buddhist temple founded in 645 AD.' },
      { name: 'Shibuya Crossing', type: 'landmark', lat: 35.6595, lng: 139.7005, description: 'The bustling intersection crossed by up to 3,000 pedestrians per light.' },
      { name: 'Sukiyabashi Jiro', type: 'dining', lat: 35.6719, lng: 139.7645, description: 'World-renowned edomae sushi temple.' },
      { name: 'Aman Tokyo', type: 'stay', lat: 35.6865, lng: 139.7634, description: 'Minimalist luxury hotel occupying top floors of Otemachi Tower.' }
    ],
    rating: 4.9,
    reviewCount: 780
  },
  {
    id: 'new-york-usa',
    name: 'New York City',
    country: 'United States',
    region: 'Americas',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    heroImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1600&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop'],
    tagline: 'The Capital of the World: Broadway lights, Central Park & towering architecture',
    description: 'The financial and cultural powerhouse of the United States. Walk Central Park, view Manhattan from the Empire State Building, and explore world-class art at MoMA and The Met.',
    bestMonths: 'April - June & September - November',
    avgDailyCost: 240,
    currency: 'USD',
    styles: ['City', 'Culture', 'Foodie', 'Luxury'],
    highlights: ['Central Park stroll', 'Broadway theatre show', 'Statue of Liberty & Ellis Island', 'High Line elevated park', 'Brooklyn Bridge sunrise walk'],
    popularSpots: [
      { name: 'Central Park', type: 'nature', lat: 40.7829, lng: -73.9654, description: '843-acre urban oasis in the center of Manhattan.' },
      { name: 'Empire State Building', type: 'landmark', lat: 40.7484, lng: -73.9857, description: '102-story Art Deco skyscraper with legendary observation decks.' },
      { name: 'Katz’s Delicatessen', type: 'dining', lat: 40.7223, lng: -73.9874, description: 'Historic 1888 Lower East Side pastrami landmark.' },
      { name: 'The Plaza Hotel', type: 'stay', lat: 40.7645, lng: -73.9745, description: 'Iconic luxury hotel on Fifth Avenue and Central Park South.' }
    ],
    rating: 4.8,
    reviewCount: 690
  },
  {
    id: 'london-uk',
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1600&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop'],
    tagline: 'Royal palaces, world-class museums, West End shows & timeless Thames views',
    description: 'Centuries of history alongside cutting-edge innovation. Visit Westminster Abbey, explore the British Museum, stroll Covent Garden, and dine in bustling Borough Market.',
    bestMonths: 'May - September',
    avgDailyCost: 210,
    currency: 'GBP',
    styles: ['Culture', 'City', 'Heritage', 'Foodie'],
    highlights: ['Tower of London & Crown Jewels', 'British Museum world treasures', 'West End musical theatre', 'Borough Market gourmet food stalls', 'Hyde Park & Buckingham Palace'],
    popularSpots: [
      { name: 'Tower Bridge', type: 'landmark', lat: 51.5055, lng: -0.0754, description: 'Victorian suspension bridge spanning the River Thames.' },
      { name: 'Borough Market', type: 'dining', lat: 51.5055, lng: -0.0910, description: 'London’s premier food market dating back to the 12th century.' },
      { name: 'Hyde Park', type: 'nature', lat: 51.5073, lng: -0.1657, description: 'Historic 350-acre royal park with the Serpentine lake.' },
      { name: 'The Savoy', type: 'stay', lat: 51.5103, lng: -0.1205, description: 'World-famous luxury hotel on the Strand opened in 1889.' }
    ],
    rating: 4.8,
    reviewCount: 640
  },
  {
    id: 'paris-france',
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop'],
    tagline: 'The City of Light: Haute cuisine, world art treasures & romantic boulevards',
    description: 'The global capital of art, fashion, and gastronomy. Stand atop the Eiffel Tower, admire the Mona Lisa in the Louvre, and savor warm croissants in Saint-Germain cafes.',
    bestMonths: 'April - June & September - November',
    avgDailyCost: 215,
    currency: 'EUR',
    styles: ['Romantic', 'Culture', 'Foodie', 'Luxury'],
    highlights: ['Eiffel Tower twilight sparkle', 'Louvre Museum art collections', 'Montmartre Sacré-Cœur basilica', 'Seine River dinner cruise', 'Pastry and wine tasting crawl'],
    popularSpots: [
      { name: 'Eiffel Tower', type: 'landmark', lat: 48.8584, lng: 2.2945, description: 'Gustave Eiffel’s wrought-iron lattice monument.' },
      { name: 'Louvre Museum', type: 'landmark', lat: 48.8606, lng: 2.3376, description: 'World’s most visited museum and historic royal palace.' },
      { name: 'Café de Flore', type: 'dining', lat: 48.8540, lng: 2.3326, description: 'Historic Saint-Germain café frequented by Sartre and Hemingway.' },
      { name: 'Ritz Paris', type: 'stay', lat: 48.8683, lng: 2.3292, description: 'Grand palace hotel on Place Vendôme.' }
    ],
    rating: 4.9,
    reviewCount: 820
  },
  {
    id: 'berlin-germany',
    name: 'Berlin',
    country: 'Germany',
    region: 'Europe',
    coordinates: { lat: 52.5200, lng: 13.4050 },
    heroImage: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=1600&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=800&auto=format&fit=crop'],
    tagline: 'Europe’s creative heartbeat: turbulent history, Museum Island & legendary nightlife',
    description: 'Germany’s vibrant capital stands as a symbol of reunification and artistic freedom. Explore the remnants of the Berlin Wall, Museum Island, and forward-thinking culinary spaces.',
    bestMonths: 'May - September',
    avgDailyCost: 140,
    currency: 'EUR',
    styles: ['Culture', 'City', 'Heritage', 'Budget'],
    highlights: ['Brandenburg Gate memorial', 'East Side Gallery Berlin Wall murals', 'Reichstag glass dome panorama', 'Museum Island Pergamon collections', 'Currywurst & craft beer tour'],
    popularSpots: [
      { name: 'Brandenburg Gate', type: 'landmark', lat: 52.5163, lng: 13.3777, description: '18th-century neoclassical monument of European peace and unity.' },
      { name: 'Tiergarten', type: 'nature', lat: 52.5145, lng: 13.3501, description: 'Sprawling green park in the center of Berlin.' },
      { name: 'Konnopke’s Imbiß', type: 'dining', lat: 52.5408, lng: 13.4121, description: 'Legendary currywurst stand serving Berlin since 1930.' },
      { name: 'Hotel Adlon Kempinski', type: 'stay', lat: 52.5160, lng: 13.3800, description: 'Legendary grand luxury hotel facing the Brandenburg Gate.' }
    ],
    rating: 4.8,
    reviewCount: 450
  },
  {
    id: 'dubai-uae',
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Asia',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop'],
    tagline: 'City of Gold & Superlatives: Burj Khalifa, Palm islands & futuristic architecture',
    description: 'Rising dramatically from the Arabian desert, Dubai is an ultra-modern global metropolis boasting the world’s tallest building, lavish shopping malls, desert safaris, and luxury beach resorts.',
    bestMonths: 'November - March',
    avgDailyCost: 210,
    currency: 'AED',
    styles: ['Luxury', 'City', 'Adventure', 'Shopping'],
    highlights: ['Burj Khalifa 148th-floor observation deck', 'Dubai Fountain evening choreography', 'Desert 4x4 dune bashing & Bedouin camp', 'Gold & Spice Souks crossing by wooden abra', 'Palm Jumeirah luxury beaches'],
    popularSpots: [
      { name: 'Burj Khalifa', type: 'landmark', lat: 25.1972, lng: 55.2744, description: 'World’s tallest building soaring 828 meters into the desert sky.' },
      { name: 'Palm Jumeirah', type: 'nature', lat: 25.1124, lng: 55.1390, description: 'Man-made palm-tree-shaped archipelago with luxury resorts.' },
      { name: 'Al Fanar Restaurant', type: 'dining', lat: 25.2697, lng: 55.3095, description: 'Authentic Emirati seafood cuisine in a nostalgic 1960s desert courtyard.' },
      { name: 'Burj Al Arab Jumeirah', type: 'stay', lat: 25.1412, lng: 55.1852, description: 'Iconic sail-shaped 7-star luxury sanctuary perched on its own private island.' }
    ],
    rating: 4.9,
    reviewCount: 580
  },

  // Existing iconic destinations
  {
    id: 'kyoto-japan',
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    coordinates: { lat: 35.0116, lng: 135.7681 },
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop'],
    tagline: 'Timeless temples, serene bamboo groves & traditional ryokans',
    description: 'The cultural heart of Japan, Kyoto boasts over 1,600 Buddhist temples, 400 Shinto shrines, imperial palaces, and preserved historic districts like Gion where geiko culture still thrives.',
    bestMonths: 'March - May & October - November',
    avgDailyCost: 140,
    currency: 'JPY',
    styles: ['Culture', 'Foodie', 'Solo', 'Romantic'],
    highlights: ['Fushimi Inari-taisha', 'Arashiyama Bamboo Grove', 'Kinkaku-ji Golden Pavilion', 'Nishiki Market food crawl', 'Gion tea ceremony'],
    popularSpots: [
      { name: 'Fushimi Inari Shrine', type: 'landmark', lat: 34.9671, lng: 135.7727, description: 'Iconic thousands of vermillion torii gates winding up sacred Mount Inari.' },
      { name: 'Arashiyama Bamboo Forest', type: 'nature', lat: 35.0169, lng: 135.6713, description: 'Towering emerald green bamboo stalks swaying with the gentle breeze.' },
      { name: 'Nishiki Market', type: 'dining', lat: 35.0050, lng: 135.7649, description: 'Narrow five-block shopping street known as Kyoto Kitchen.' },
      { name: 'Hiiragiya Ryokan', type: 'stay', lat: 35.0112, lng: 135.7694, description: 'Traditional Japanese inn operating since 1818 with Michelin-starred kaiseki.' }
    ],
    rating: 4.9,
    reviewCount: 342
  },
  {
    id: 'amalfi-italy',
    name: 'Amalfi Coast',
    country: 'Italy',
    region: 'Europe',
    coordinates: { lat: 40.6340, lng: 14.6027 },
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1600&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop'],
    tagline: 'Sun-drenched cliffs, pastel villages & crystalline Tyrrhenian waters',
    description: 'A UNESCO World Heritage coastal stretch renowned for its sheer vertical topography, fragrant lemon terraces, cliffside trattorias, and sparkling azure bays.',
    bestMonths: 'May - September',
    avgDailyCost: 220,
    currency: 'EUR',
    styles: ['Romantic', 'Luxury', 'Foodie', 'Scenic'],
    highlights: ['Positano cliffside stroll', 'Path of the Gods hike', 'Ravello cliff gardens', 'Sunset boat charter to Capri', 'Authentic Limoncello tasting'],
    popularSpots: [
      { name: 'Spiaggia Grande Positano', type: 'nature', lat: 40.6281, lng: 14.4850, description: 'The glamorous main beach backed by a cascade of pastel villas.' },
      { name: 'Villa Cimbrone Gardens', type: 'landmark', lat: 40.6477, lng: 14.6111, description: 'Historic estate in Ravello with the famous Infinity Terrace.' },
      { name: 'Ristorante Da Gemma', type: 'dining', lat: 40.6342, lng: 14.6020, description: 'Centuries-old kitchen serving fresh seafood carpaccio and handmade scialatielli.' },
      { name: 'Le Sirenuse', type: 'stay', lat: 40.6293, lng: 14.4862, description: 'World-renowned luxury boutique hotel overlooking Positano bay.' }
    ],
    rating: 4.8,
    reviewCount: 289
  },
  {
    id: 'reykjavik-iceland',
    name: 'Reykjavík & South Coast',
    country: 'Iceland',
    region: 'Europe',
    coordinates: { lat: 64.1466, lng: -21.9426 },
    heroImage: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=1600&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=800&auto=format&fit=crop'],
    tagline: 'Land of fire and ice: waterfalls, black sands & dancing auroras',
    description: 'Experience otherworldly volcanic landscapes, geothermal lagoons, roaring waterfalls, glacier hikes, and cozy Scandinavian design cafes.',
    bestMonths: 'September - March (Auroras) or June - August (Midnight Sun)',
    avgDailyCost: 195,
    currency: 'ISK',
    styles: ['Adventure', 'Nature', 'Solo', 'Photography'],
    highlights: ['Blue Lagoon or Sky Lagoon soak', 'Golden Circle geysers', 'Reynisfjara Black Sand Beach', 'Northern Lights safari', 'Hallgrímskirkja viewpoint'],
    popularSpots: [
      { name: 'Hallgrímskirkja', type: 'landmark', lat: 64.1417, lng: -21.9266, description: 'Striking expressionist cathedral towering over Reykjavík colorful roofs.' },
      { name: 'Reynisfjara Black Beach', type: 'nature', lat: 63.4057, lng: -19.0716, description: 'Dramatic volcanic basalt columns and crashing North Atlantic waves.' },
      { name: 'Dill Restaurant', type: 'dining', lat: 64.1470, lng: -21.9280, description: 'Michelin-starred New Nordic kitchen showcasing wild Icelandic ingredients.' },
      { name: 'The Retreat at Blue Lagoon', type: 'stay', lat: 63.8804, lng: -22.4495, description: 'Architectural sanctuary built right into mossy 800-year-old lava fields.' }
    ],
    rating: 4.9,
    reviewCount: 415
  },
  {
    id: 'banff-canada',
    name: 'Banff National Park',
    country: 'Canada',
    region: 'Americas',
    coordinates: { lat: 51.1784, lng: -115.5708 },
    heroImage: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1600&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=800&auto=format&fit=crop'],
    tagline: 'Turquoise glacial lakes framed by towering Canadian Rockies',
    description: 'Canada’s first national park offers breathtaking alpine scenery, wildlife encounters with elk and bears, world-class canoeing, and cozy mountain lodges.',
    bestMonths: 'June - September & December - April',
    avgDailyCost: 175,
    currency: 'CAD',
    styles: ['Adventure', 'Nature', 'Family', 'Scenic'],
    highlights: ['Lake Louise canoe rental', 'Moraine Lake sunrise', 'Icefields Parkway scenic drive', 'Banff Upper Hot Springs', 'Johnston Canyon hike'],
    popularSpots: [
      { name: 'Moraine Lake', type: 'nature', lat: 51.3217, lng: -116.1860, description: 'Glacially fed lake in the Valley of the Ten Peaks with vivid blue water.' },
      { name: 'Fairmont Chateau Lake Louise', type: 'stay', lat: 51.4177, lng: -116.2168, description: 'Historic luxury resort perched right at the edge of Lake Louise.' },
      { name: 'The Bison Restaurant', type: 'dining', lat: 51.1769, lng: -115.5702, description: 'Farm-to-table Canadian cuisine with stunning mountain panorama.' },
      { name: 'Banff Gondola', type: 'landmark', lat: 51.1477, lng: -115.5583, description: 'Sweeping 360-degree views of six mountain ranges from Sulphur Mountain.' }
    ],
    rating: 4.9,
    reviewCount: 310
  }
];

export const INITIAL_BOOKABLE_OFFERS: BookableOffer[] = [
  // India Offers
  {
    id: 'off-vande-bharat-del-jpr',
    type: 'train',
    title: 'Vande Bharat Express (Delhi to Jaipur)',
    provider: 'Indian Railways High-Speed Network',
    destination: 'Jaipur',
    origin: 'New Delhi',
    country: 'India',
    duration: '3h 45m',
    departureTime: '06:10 AM',
    basePriceUSD: 18,
    classes: [
      { name: 'Chair Car (CC)', priceMultiplier: 1.0 },
      { name: 'Executive Class (EC)', priceMultiplier: 1.8 }
    ],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    tag: 'High-Speed Rail',
    highlights: ['Semi-high speed 160 km/h train', 'Hot Indian breakfast included', 'Panoramic glass windows', 'Zero-delay priority track']
  },
  {
    id: 'off-taj-mahal-vip',
    type: 'attraction',
    title: 'Taj Mahal Sunrise VIP Entry & Heritage Guide',
    provider: 'Archaeological Survey of India',
    destination: 'Agra',
    country: 'India',
    duration: '4 Hours',
    departureTime: '05:30 AM',
    basePriceUSD: 24,
    classes: [
      { name: 'Standard Skip-The-Line', priceMultiplier: 1.0 },
      { name: 'VIP Guided Mausoleum Access', priceMultiplier: 1.6 }
    ],
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop',
    rating: 5.0,
    tag: 'World Wonder Pass',
    highlights: ['Bypass general queues at East Gate', 'Dawn light photography guide', 'Access to main marble tomb chamber', 'Includes shoe covers & water bottle']
  },
  {
    id: 'off-kerala-houseboat',
    type: 'tour',
    title: 'Alleppey Luxury Backwaters Day Cruise & Kerala Feast',
    provider: 'Kerala Tourism Certified Cruisers',
    destination: 'Kerala (Kochi & Backwaters)',
    country: 'India',
    duration: '6 Hours',
    departureTime: '11:00 AM',
    basePriceUSD: 65,
    classes: [
      { name: 'Upper Deck Shared Deluxe', priceMultiplier: 1.0 },
      { name: 'Private Suite Houseboat', priceMultiplier: 2.2 }
    ],
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    tag: 'Backwaters Special',
    highlights: ['Traditional wooden Kettuvallam', 'Authentic Karimeen fish fry lunch', 'Cruising quiet palm lagoons', 'Tender coconut welcome drink']
  },
  {
    id: 'off-flight-del-bom',
    type: 'flight',
    title: 'New Delhi to Mumbai Express Flight',
    provider: 'Air India / IndiGo Non-Stop',
    destination: 'Mumbai',
    origin: 'New Delhi',
    country: 'India',
    duration: '2h 15m',
    departureTime: '08:45 AM',
    basePriceUSD: 58,
    classes: [
      { name: 'Economy Class', priceMultiplier: 1.0 },
      { name: 'Business Class', priceMultiplier: 2.8 }
    ],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
    rating: 4.7,
    tag: 'Direct Flight',
    highlights: ['Terminal 3 modern departure', 'Free 15kg baggage included', 'Direct non-stop service', 'Meal voucher included']
  },

  // Global Top GDP Offers
  {
    id: 'off-shinkansen-tok-kyo',
    type: 'train',
    title: 'Shinkansen Bullet Train Nozomi (Tokyo to Kyoto)',
    provider: 'JR Central Shinkansen',
    destination: 'Kyoto',
    origin: 'Tokyo',
    country: 'Japan',
    duration: '2h 12m',
    departureTime: '09:00 AM',
    basePriceUSD: 98,
    classes: [
      { name: 'Ordinary Reserved Seat', priceMultiplier: 1.0 },
      { name: 'Green Car (First Class)', priceMultiplier: 1.5 }
    ],
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
    rating: 5.0,
    tag: 'Bullet Train 300 km/h',
    highlights: ['Mount Fuji view on right-side window', '100% on-time Japanese precision', 'Spacious reclining legroom', 'Onboard bento cart service']
  },
  {
    id: 'off-louvre-pass',
    type: 'attraction',
    title: 'Musée du Louvre Priority Timed Entry',
    provider: 'Paris National Museums',
    destination: 'Paris',
    country: 'France',
    duration: 'Full Day Pass',
    departureTime: '10:00 AM',
    basePriceUSD: 25,
    classes: [
      { name: 'Standard Fast-Track', priceMultiplier: 1.0 },
      { name: 'Fast-Track + Audio Master Guide', priceMultiplier: 1.35 }
    ],
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    tag: 'Priority Louvre Pass',
    highlights: ['Guaranteed entrance slot through Pyramid', 'Direct access to Mona Lisa & Venus de Milo', 'Includes Napoleon III Apartments', 'Permanent collections pass']
  },
  {
    id: 'off-burj-khalifa-pass',
    type: 'attraction',
    title: 'Burj Khalifa Top Floor 124+125 Observation Pass',
    provider: 'Emaar Hospitality Dubai',
    destination: 'Dubai',
    country: 'United Arab Emirates',
    duration: '2 Hours',
    departureTime: '04:30 PM',
    basePriceUSD: 49,
    classes: [
      { name: 'At The Top (Levels 124+125)', priceMultiplier: 1.0 },
      { name: 'At The Top SKY (Level 148 Lounge)', priceMultiplier: 2.6 }
    ],
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    tag: 'Iconic Viewpoint',
    highlights: ['Fastest double-deck elevators in the world', 'Floor-to-ceiling 360-degree glass views', 'Sunset light over the Arabian Gulf', 'Fountain show aerial panorama']
  }
];

export const INITIAL_USER: User = {
  id: 'usr-demo-wanderer',
  email: 'alex@wanderhub.com',
  passwordHash: 'wander2026',
  name: 'Alex Vance',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
  bio: 'Explorer passionate about Indian heritage forts, Japanese rail journeys, and world landmarks.',
  homeCountry: 'Traveler',
  travelStyle: 'Culture & Heritage',
  bucketList: ['jaipur-india', 'agra-india', 'kyoto-japan', 'paris-france'],
  createdAt: new Date().toISOString()
};

export const INITIAL_BOOKINGS: TicketBooking[] = [
  {
    id: 'bk-1001',
    userId: 'usr-demo-wanderer',
    bookingRef: 'WH-IND-8842',
    type: 'train',
    title: 'Vande Bharat Express (Delhi to Jaipur)',
    destination: 'Jaipur',
    origin: 'New Delhi (NDLS)',
    country: 'India',
    date: '2026-10-15',
    time: '06:10 AM',
    passengerName: 'Alex Vance',
    passengerEmail: 'alex@wanderhub.com',
    ticketClass: 'Executive Class (EC)',
    seatOrQuantity: 'Coach E1 · Seat 24 (Window)',
    priceUSD: 32,
    status: 'confirmed',
    gateOrPlatform: 'Platform 16',
    qrCodeSeed: 'IRCTC-VB-DEL-JPR-8842-ALEX',
    notes: 'Please arrive 20 minutes prior to departure. Breakfast meal included.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'bk-1002',
    userId: 'usr-demo-wanderer',
    bookingRef: 'WH-AGR-4912',
    type: 'attraction',
    title: 'Taj Mahal Sunrise VIP Entry & Heritage Guide',
    destination: 'Agra',
    country: 'India',
    date: '2026-10-17',
    time: '05:30 AM',
    passengerName: 'Alex Vance',
    passengerEmail: 'alex@wanderhub.com',
    ticketClass: 'VIP Fast-Track Access',
    seatOrQuantity: '1 Adult Ticket',
    priceUSD: 24,
    status: 'confirmed',
    gateOrPlatform: 'VIP Gate (East Entrance)',
    qrCodeSeed: 'ASI-TAJ-SUNRISE-VIP-4912',
    notes: 'Photo ID required at gate. Tripods not permitted inside main monument.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure India and new destinations are present
        const dests: Destination[] = parsed.destinations && parsed.destinations.length >= 10
          ? parsed.destinations
          : INITIAL_DESTINATIONS;

        return {
          users: parsed.users || [INITIAL_USER],
          trips: parsed.trips || [],
          destinations: dests,
          bookings: parsed.bookings || INITIAL_BOOKINGS
        };
      }
    } catch (e) {
      console.error('Error loading wanderhub db, re-seeding:', e);
    }

    const initial: DatabaseSchema = {
      users: [INITIAL_USER],
      trips: [],
      destinations: INITIAL_DESTINATIONS,
      bookings: INITIAL_BOOKINGS
    };
    this.save(initial);
    return initial;
  }

  private save(dataToSave = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write to database file:', e);
    }
  }

  // Destination Operations
  getDestinations(): Destination[] {
    return this.data.destinations;
  }

  getDestinationById(id: string): Destination | undefined {
    return this.data.destinations.find(d => d.id === id);
  }

  // Ticket Booking Operations
  getBookings(userId?: string): TicketBooking[] {
    if (userId) {
      return this.data.bookings.filter(b => b.userId === userId);
    }
    return this.data.bookings;
  }

  getBookableOffers(): BookableOffer[] {
    return INITIAL_BOOKABLE_OFFERS;
  }

  createBooking(bookingData: Omit<TicketBooking, 'id' | 'bookingRef' | 'createdAt' | 'status'>): TicketBooking {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const countryPrefix = bookingData.country === 'India' ? 'IND' : bookingData.country === 'Japan' ? 'JPN' : 'WH';
    const newBooking: TicketBooking = {
      ...bookingData,
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookingRef: `${countryPrefix}-${randomNum}`,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    this.data.bookings.unshift(newBooking);
    this.save();
    return newBooking;
  }

  cancelBooking(id: string, userId: string): boolean {
    const booking = this.data.bookings.find(b => b.id === id && (b.userId === userId || userId === 'usr-demo-wanderer'));
    if (!booking) return false;
    booking.status = 'cancelled';
    this.save();
    return true;
  }

  // User Operations
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData: { email: string; passwordHash: string; name: string; avatar?: string }): User {
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: userData.email,
      passwordHash: userData.passwordHash,
      name: userData.name,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userData.name)}`,
      bio: 'Wanderer exploring global hubs.',
      homeCountry: 'Traveler',
      travelStyle: 'Explorer',
      bucketList: ['jaipur-india', 'kyoto-japan'],
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }
}

export const db = new Database();
