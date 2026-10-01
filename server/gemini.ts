import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK with telemetry header according to specifications
function getApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ''
  ).trim();
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: getApiKey(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Helper to call Gemini with model fallback if a model is unavailable or under heavy demand
async function callGeminiWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const ai = getGeminiClient();
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return res;
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} encountered an issue (${err?.status || err?.message || 'unknown'}), falling back to next model...`);
    }
  }

  throw lastError;
}

// Helper to strip markdown JSON fences
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export interface ItineraryRequest {
  destination: string;
  country?: string;
  durationDays: number;
  style: string; // 'Culture' | 'Foodie' | 'Adventure' | 'Relaxation' | 'Luxury' | 'Budget'
  budgetTier: string; // 'Backpacker' | 'Moderate' | 'Luxury'
  companions: string; // 'Solo' | 'Couple' | 'Family' | 'Friends'
  interests?: string[];
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
  days: {
    dayNumber: number;
    title: string;
    theme: string;
    activities: {
      time: string;
      title: string;
      description: string;
      location: string;
      cost: number;
      category: 'sightseeing' | 'food' | 'transport' | 'culture' | 'relaxation' | 'stay';
    }[];
  }[];
}

export async function getCountryMapPlacesWithAI(query: string): Promise<CountryMapResponse> {
  const normalized = query.trim().toLowerCase();

  // Instant high-precision data for India
  if (normalized.includes('india') || normalized.includes('delhi') || normalized.includes('mumbai') || normalized.includes('jaipur') || normalized.includes('goa') || normalized.includes('kerala')) {
    return {
      country: 'India',
      flag: '🇮🇳',
      center: { lat: 21.7679, lng: 78.8718 },
      zoom: 5,
      gdpRank: '5th Largest World Economy ($4.1T+)',
      currency: 'INR',
      overview: 'Vibrant subcontinent of ancient heritage, Himalayan peaks, sacred rivers, regal fortresses, and bustling tech hubs.',
      places: [
        {
          id: 'in-delhi',
          name: 'India Gate & Kartavya Path',
          city: 'New Delhi',
          country: 'India',
          type: 'landmark',
          lat: 28.6129,
          lng: 77.2295,
          description: 'Iconic 42-meter triumphal war memorial archway illuminated majestically at dusk.',
          rating: 4.8,
          heroImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 40,
          tag: 'Capital Heritage'
        },
        {
          id: 'in-mumbai',
          name: 'Gateway of India & Marine Drive',
          city: 'Mumbai',
          country: 'India',
          type: 'landmark',
          lat: 18.9220,
          lng: 72.8347,
          description: 'Monumental 20th-century basalt arch facing the Arabian Sea and historic Queen’s Necklace promenade.',
          rating: 4.8,
          heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 55,
          tag: 'Financial Powerhouse'
        },
        {
          id: 'in-jaipur',
          name: 'Amber Fort & Hawa Mahal',
          city: 'Jaipur',
          country: 'India',
          type: 'landmark',
          lat: 26.9855,
          lng: 75.8513,
          description: 'Sprawling hilltop Rajput citadel overlooking Maota Lake alongside the 953-window Palace of Winds.',
          rating: 4.9,
          heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 45,
          tag: 'Pink City Wonder'
        },
        {
          id: 'in-agra',
          name: 'Taj Mahal',
          city: 'Agra',
          country: 'India',
          type: 'landmark',
          lat: 27.1751,
          lng: 78.0421,
          description: 'World Wonder of pure white Makrana marble built by Mughal Emperor Shah Jahan along the Yamuna River.',
          rating: 5.0,
          heroImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 40,
          tag: 'World Wonder'
        },
        {
          id: 'in-varanasi',
          name: 'Dashashwamedh Ghat & River Ganga',
          city: 'Varanasi',
          country: 'India',
          type: 'nature',
          lat: 25.3076,
          lng: 83.0107,
          description: 'Oldest living city in the world hosting mesmerizing nightly devotional fire Aarti ceremonies.',
          rating: 4.9,
          heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 35,
          tag: 'Spiritual Center'
        },
        {
          id: 'in-goa',
          name: 'Palolem Beach & Fort Aguada',
          city: 'Goa',
          country: 'India',
          type: 'nature',
          lat: 15.0100,
          lng: 74.0232,
          description: 'Golden sand tropical crescent bordered by coconut palms, 16th-century Portuguese ramparts, and seaside cafes.',
          rating: 4.8,
          heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 50,
          tag: 'Coastal Paradise'
        },
        {
          id: 'in-bengaluru',
          name: 'Lalbagh Glass House & Tech Parks',
          city: 'Bengaluru',
          country: 'India',
          type: 'nature',
          lat: 12.9507,
          lng: 77.5848,
          description: 'Botanical gardens, craft microbreweries, and high-tech innovation campus in the Garden City.',
          rating: 4.7,
          heroImage: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 50,
          tag: 'Silicon Valley of India'
        },
        {
          id: 'in-kerala',
          name: 'Alleppey Backwaters Houseboat',
          city: 'Kerala',
          country: 'India',
          type: 'nature',
          lat: 9.4981,
          lng: 76.3388,
          description: 'Tranquil palm-fringed network of tropical canals, lagoons, and traditional wooden houseboat cruises.',
          rating: 4.9,
          heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 55,
          tag: 'God’s Own Country'
        },
        {
          id: 'in-udaipur',
          name: 'City Palace & Lake Pichola',
          city: 'Udaipur',
          country: 'India',
          type: 'landmark',
          lat: 24.5764,
          lng: 73.6835,
          description: 'Venice of the East: floating island palaces and majestic Rajput royal towers surrounded by Aravalli hills.',
          rating: 4.9,
          heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 48,
          tag: 'City of Lakes'
        },
        {
          id: 'in-amritsar',
          name: 'Golden Temple (Harmandir Sahib)',
          city: 'Amritsar',
          country: 'India',
          type: 'landmark',
          lat: 31.6200,
          lng: 74.8765,
          description: 'Gleaming gold-plated sanctuary surrounded by sacred Amrit Sarovar pool and massive communal langar.',
          rating: 5.0,
          heroImage: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 35,
          tag: 'Sacred Sanctuary'
        },
        {
          id: 'in-ladakh',
          name: 'Pangong Tso & Leh High Passes',
          city: 'Ladakh',
          country: 'India',
          type: 'nature',
          lat: 33.7595,
          lng: 78.6674,
          description: 'High-altitude deep blue saline lake reflecting dramatic snow-dusted Trans-Himalayan summits.',
          rating: 4.9,
          heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 60,
          tag: 'Himalayan Frontier'
        }
      ]
    };
  }

  // Japan
  if (normalized.includes('japan') || normalized.includes('tokyo') || normalized.includes('kyoto') || normalized.includes('osaka')) {
    return {
      country: 'Japan',
      flag: '🇯🇵',
      center: { lat: 36.2048, lng: 138.2529 },
      zoom: 5.5,
      gdpRank: '4th Largest World Economy ($4.2T+)',
      currency: 'JPY',
      overview: 'Harmony of ancient traditions, Shinkansen bullet trains, Michelin dining, and futuristic neon skylines.',
      places: [
        {
          id: 'jp-tokyo',
          name: 'Senso-ji & Shibuya Scramble',
          city: 'Tokyo',
          country: 'Japan',
          type: 'city',
          lat: 35.6762,
          lng: 139.6503,
          description: 'Electric metropolis with 645 AD Asakusa shrine, bustling pedestrian crossing, and world-class ramen.',
          rating: 4.9,
          heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 165,
          tag: 'Metropolis'
        },
        {
          id: 'jp-kyoto',
          name: 'Fushimi Inari & Arashiyama Bamboo',
          city: 'Kyoto',
          country: 'Japan',
          type: 'landmark',
          lat: 35.0116,
          lng: 135.7681,
          description: 'Thousands of vermilion torii gates winding up sacred mountain trails and preserved geisha tea houses.',
          rating: 4.9,
          heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 140,
          tag: 'Cultural Heart'
        },
        {
          id: 'jp-osaka',
          name: 'Dotonbori & Osaka Castle',
          city: 'Osaka',
          country: 'Japan',
          type: 'dining',
          lat: 34.6937,
          lng: 135.5023,
          description: 'Culinary capital of Japan famous for sizzling takoyaki, okonomiyaki, and neon riverfront canal.',
          rating: 4.8,
          heroImage: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 130,
          tag: 'Food Capital'
        },
        {
          id: 'jp-fuji',
          name: 'Mount Fuji & Lake Kawaguchiko',
          city: 'Yamanashi',
          country: 'Japan',
          type: 'nature',
          lat: 35.3606,
          lng: 138.7274,
          description: 'Sacred symmetrical stratovolcano rising 3,776 meters surrounded by tranquil five lakes.',
          rating: 5.0,
          heroImage: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 120,
          tag: 'Sacred Peak'
        }
      ]
    };
  }

  // United States
  if (normalized.includes('united states') || normalized.includes('usa') || normalized.includes('america') || normalized.includes('new york') || normalized.includes('san francisco')) {
    return {
      country: 'United States',
      flag: '🇺🇸',
      center: { lat: 39.8283, lng: -98.5795 },
      zoom: 4,
      gdpRank: '1st Largest World Economy ($28T+)',
      currency: 'USD',
      overview: 'Vast nation spanning iconic coastlines, high-energy metropolitan hubs, and expansive national park wonders.',
      places: [
        {
          id: 'us-nyc',
          name: 'Central Park & Empire State Building',
          city: 'New York City',
          country: 'United States',
          type: 'city',
          lat: 40.7128,
          lng: -74.0060,
          description: 'The global capital of culture, finance, Broadway theater, and iconic Manhattan skyscraper views.',
          rating: 4.8,
          heroImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 240,
          tag: 'Global Hub'
        },
        {
          id: 'us-sf',
          name: 'Golden Gate Bridge & Fisherman’s Wharf',
          city: 'San Francisco',
          country: 'United States',
          type: 'landmark',
          lat: 37.7749,
          lng: -122.4194,
          description: 'Dramatic suspension bridge over Pacific fog, historic cable cars, and world-leading Silicon Valley hub.',
          rating: 4.7,
          heroImage: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 220,
          tag: 'Pacific Coast'
        },
        {
          id: 'us-gc',
          name: 'Grand Canyon South Rim',
          city: 'Arizona',
          country: 'United States',
          type: 'nature',
          lat: 36.0544,
          lng: -112.1401,
          description: 'Vast layered red rock geological marvel carved over millions of years by the Colorado River.',
          rating: 5.0,
          heroImage: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 150,
          tag: 'Natural Wonder'
        },
        {
          id: 'us-dc',
          name: 'National Mall & Lincoln Memorial',
          city: 'Washington D.C.',
          country: 'United States',
          type: 'landmark',
          lat: 38.8893,
          lng: -77.0502,
          description: 'Historic neoclassical monuments, Smithsonian museums, and Capitol dome reflections.',
          rating: 4.8,
          heroImage: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 190,
          tag: 'Nation’s Capital'
        }
      ]
    };
  }

  // Germany
  if (normalized.includes('germany') || normalized.includes('berlin') || normalized.includes('munich')) {
    return {
      country: 'Germany',
      flag: '🇩🇪',
      center: { lat: 51.1657, lng: 10.4515 },
      zoom: 5.5,
      gdpRank: '3rd Largest World Economy ($4.5T+)',
      currency: 'EUR',
      overview: 'European industrial engine renowned for fairy-tale castles, precision engineering, and vibrant arts capitals.',
      places: [
        {
          id: 'de-berlin',
          name: 'Brandenburg Gate & Museum Island',
          city: 'Berlin',
          country: 'Germany',
          type: 'city',
          lat: 52.5200,
          lng: 13.4050,
          description: 'Symbol of European unity, world-class Pergamon art galleries, and thriving counter-culture.',
          rating: 4.8,
          heroImage: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 155,
          tag: 'Historic Capital'
        },
        {
          id: 'de-munich',
          name: 'Marienplatz & Bavarian Beer Gardens',
          city: 'Munich',
          country: 'Germany',
          type: 'dining',
          lat: 48.1351,
          lng: 11.5820,
          description: 'Gothic glockenspiel tower, historic English Garden, and traditional Bavarian hospitality.',
          rating: 4.8,
          heroImage: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 170,
          tag: 'Bavarian Heart'
        },
        {
          id: 'de-neuschwanstein',
          name: 'Neuschwanstein Castle',
          city: 'Füssen',
          country: 'Germany',
          type: 'landmark',
          lat: 47.5576,
          lng: 10.7498,
          description: 'Romantic 19th-century Romanesque palace nestled in the rugged Bavarian Alps.',
          rating: 4.9,
          heroImage: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800&auto=format&fit=crop',
          avgDailyCost: 130,
          tag: 'Fairy Tale Castle'
        }
      ]
    };
  }

  // Dynamic AI query with Gemini if requested any other country or city
  if (getApiKey()) {
    try {
      const prompt = `You are WanderHub's elite geospatial travel assistant.
The user asked for real-time map data for country or city: "${query}".
Return ONLY valid JSON matching this exact structure:
{
  "country": "Full country name",
  "flag": "Country flag emoji like 🇨🇭",
  "center": {"lat": 46.8182, "lng": 8.2275},
  "zoom": 6,
  "gdpRank": "GDP or economy status",
  "currency": "EUR or USD or local 3-letter code",
  "overview": "Engaging 1-2 sentence overview of the country",
  "places": [
    {
      "id": "unique-id-1",
      "name": "Landmark or City Name",
      "city": "City name",
      "country": "Country name",
      "type": "landmark | dining | nature | stay | city",
      "lat": 46.9480,
      "lng": 7.4474,
      "description": "Engaging description of this place",
      "rating": 4.8,
      "heroImage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
      "avgDailyCost": 150,
      "tag": "Short badge title"
    }
  ]
}
Include between 4 and 8 verified famous places and cities with accurate latitude and longitude.`;

      const response = await callGeminiWithFallback({
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        }
      });

      const parsed = JSON.parse(cleanJsonOutput(response.text || '{}')) as CountryMapResponse;
      if (parsed && parsed.places && parsed.places.length > 0) {
        const defaultPlaceImages: Record<string, string> = {
          landmark: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800&auto=format&fit=crop',
          nature: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
          city: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?q=80&w=800&auto=format&fit=crop',
          dining: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
          stay: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
        };

        parsed.places = parsed.places.map((place, idx) => ({
          ...place,
          id: place.id || `ai-place-${idx}-${Date.now()}`,
          heroImage: place.heroImage && place.heroImage.startsWith('http') && !place.heroImage.includes('example.com')
            ? place.heroImage
            : (defaultPlaceImages[place.type] || defaultPlaceImages.landmark),
          rating: place.rating || 4.8,
          avgDailyCost: place.avgDailyCost || 95,
        }));
        return parsed;
      }
    } catch (e) {
      console.warn('Gemini map places fallback triggered:', e);
    }
  }

  // Graceful fallback if query couldn't be parsed
  return {
    country: query,
    flag: '🌍',
    center: { lat: 20.0, lng: 0.0 },
    zoom: 3,
    gdpRank: 'Global Destination',
    currency: 'USD',
    overview: `Explore verified destinations and attractions across ${query}.`,
    places: [
      {
        id: `place-${Date.now()}-1`,
        name: `${query} Heritage Center`,
        city: query,
        country: query,
        type: 'landmark',
        lat: 25.0,
        lng: 55.0,
        description: `Experience the cultural highlights and breathtaking sights of ${query}.`,
        rating: 4.8,
        heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
        avgDailyCost: 95,
        tag: 'Must Visit'
      }
    ]
  };
}

export async function generateItineraryWithGemini(req: ItineraryRequest): Promise<GeneratedItinerary> {
  const prompt = `You are WanderHub's elite travel architect and local cultural insider.
Create a hyper-personalized, realistic, and inspiring ${req.durationDays}-day travel itinerary for "${req.destination}${req.country ? ', ' + req.country : ''}".
Travel style: ${req.style}
Budget Tier: ${req.budgetTier}
Traveling with: ${req.companions}
Specific interests: ${req.interests && req.interests.length ? req.interests.join(', ') : 'Must-see landmarks, authentic local food, and hidden gems'}.

Return ONLY valid JSON matching this exact structure:
{
  "title": "Inspiring trip title",
  "tagline": "Captivating 1-line subtitle",
  "destination": "${req.destination}",
  "country": "${req.country || ''}",
  "durationDays": ${req.durationDays},
  "style": "${req.style}",
  "budgetTier": "${req.budgetTier}",
  "estimatedTotalBudget": 1200,
  "currency": "USD",
  "highlights": ["3 to 5 key highlights"],
  "localInsiderTips": ["3 to 4 hyper-specific practical local tips, transport hacks, etiquette"],
  "packingEssentials": [
    {"item": "Specific item", "category": "clothing | electronics | toiletries | documents | essentials"}
  ],
  "days": [
    {
      "dayNumber": 1,
      "title": "Day title",
      "theme": "Day focus or district",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity name",
          "description": "Engaging description with insider recommendations",
          "location": "Specific landmark, neighborhood, or restaurant name",
          "cost": 15,
          "category": "sightseeing | food | transport | culture | relaxation | stay"
        }
      ]
    }
  ]
}

Ensure the activities are geographically logical, include 3 to 4 distinct timeslots per day (morning, lunch/afternoon, late afternoon, evening), include real restaurant or street food recommendations, and realistic estimated costs in USD.`;

  try {
    const key = getApiKey();
    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await callGeminiWithFallback({
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const cleaned = cleanJsonOutput(text);
    const parsed = JSON.parse(cleaned) as GeneratedItinerary;
    return parsed;
  } catch (err: unknown) {
    console.warn('Gemini generateItinerary fallback triggered:', err instanceof Error ? err.message : err);
    return getFallbackItinerary(req);
  }
}

export async function chatWithGeminiScout(
  messages: { role: 'user' | 'assistant'; content: string }[],
  destinationContext?: string
): Promise<string> {
  try {
    const key = getApiKey();
    if (!key) {
      return "Hello! I am WanderHub's AI Travel Scout. I'd love to help you discover hidden spots, secret eateries, or plan your journey. (Note: configure your GEMINI_API_KEY in your deployment environment variables to unlock real-time live generation).";
    }

    const systemInstruction = `You are WanderHub's AI Travel Scout & Concierge.
You are warm, knowledgeable, adventurous, and give specific, actionable travel advice without fluff or generic filler.
${destinationContext ? `The user is currently inquiring about or viewing: ${destinationContext}.` : ''}
Recommend actual local dishes, secret viewpoints, neighborhood strolls, cultural customs, and smart budgeting hacks. Keep responses formatted with clean markdown, bullet points where helpful, and engaging tone.`;

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await callGeminiWithFallback({
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        ...contents
      ],
      config: {
        temperature: 0.8
      }
    });

    return response.text || 'I could not generate an answer right now. Please ask another question about your travel destination!';
  } catch (error: unknown) {
    console.warn('Gemini chat scout error:', error instanceof Error ? error.message : error);
    return `WanderHub AI Scout: That sounds like an amazing journey! When visiting ${destinationContext || 'this destination'}, make sure to seek out neighborhood markets early in the morning, use local transit passes for effortless travel, and always keep an open afternoon to wander off the beaten path. How else can I help tailor your itinerary?`;
  }
}

export async function generatePackingChecklist(
  destination: string,
  durationDays: number,
  style: string
): Promise<{ item: string; category: 'clothing' | 'electronics' | 'toiletries' | 'documents' | 'essentials' }[]> {
  try {
    const key = getApiKey();
    if (!key) throw new Error('No API key');
    const prompt = `Generate a smart, highly practical packing checklist for a ${durationDays}-day trip to ${destination} with style "${style}".
Return ONLY a JSON array of objects:
[
  {"item": "Name of item", "category": "clothing" | "electronics" | "toiletries" | "documents" | "essentials"}
]
Include roughly 10-14 essential and destination-specific items.`;

    const res = await callGeminiWithFallback({
      contents: prompt,
      config: {
        temperature: 0.5,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(res.text || '[]'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [
      { item: 'Comfortable broken-in walking shoes', category: 'clothing' },
      { item: 'Universal travel power adapter with USB-C', category: 'electronics' },
      { item: 'Passport & physical photocopy backup', category: 'documents' },
      { item: 'Compact reusable water bottle', category: 'essentials' },
      { item: 'Light packable rain shell or windbreaker', category: 'clothing' },
      { item: 'Portable power bank (10,000mAh)', category: 'electronics' },
      { item: 'Travel size sunscreen (SPF 50)', category: 'toiletries' },
      { item: 'Prescription medicines & mini first aid pouch', category: 'essentials' },
      { item: 'Daypack for excursions', category: 'essentials' },
      { item: 'Offline map downloaded on phone', category: 'electronics' }
    ];
  }
}

function getFallbackItinerary(req: ItineraryRequest): GeneratedItinerary {
  const days = [];
  const baseCostPerDay = req.budgetTier === 'Backpacker' ? 60 : req.budgetTier === 'Luxury' ? 320 : 150;

  for (let i = 1; i <= Math.min(req.durationDays, 7); i++) {
    days.push({
      dayNumber: i,
      title: i === 1 ? 'Arrival & Neighborhood Immersion' : i === req.durationDays ? 'Farewell Gems & Scenic Viewpoint' : `Historic Heart & Cultural Treasures (Part ${i})`,
      theme: i === 1 ? 'First Impressions & Iconic Eats' : 'Local Wanders & Photography',
      activities: [
        {
          time: '09:00 AM',
          title: `Morning Exploration in ${req.destination}`,
          description: `Kickstart the day with artisan coffee and visit the primary heritage quarter before tour buses arrive.`,
          location: `${req.destination} Central Quarter`,
          cost: Math.round(baseCostPerDay * 0.15),
          category: 'sightseeing' as const
        },
        {
          time: '12:30 PM',
          title: `Traditional Lunch at Historic Market`,
          description: `Sample regional specialties cooked fresh at local family-run stalls and food halls.`,
          location: `${req.destination} Old Market`,
          cost: Math.round(baseCostPerDay * 0.25),
          category: 'food' as const
        },
        {
          time: '03:30 PM',
          title: `Hidden Alleyways & Artisan Boutiques`,
          description: `Discover quiet artisan workshops, independent bookstores, and scenic architecture away from main crowds.`,
          location: `${req.destination} Artisan District`,
          cost: Math.round(baseCostPerDay * 0.2),
          category: 'culture' as const
        },
        {
          time: '07:30 PM',
          title: `Sunset Vista & Memorable Dinner`,
          description: `Watch dusk settle over the skyline followed by an atmospheric dinner featuring farm-to-table cuisine.`,
          location: `${req.destination} Panorama Terrace`,
          cost: Math.round(baseCostPerDay * 0.4),
          category: 'food' as const
        }
      ]
    });
  }

  return {
    title: `Enchanting ${req.destination}: ${req.style} Odyssey`,
    tagline: `A curated ${req.durationDays}-day journey through timeless landmarks and vibrant local life`,
    destination: req.destination,
    country: req.country || '',
    durationDays: req.durationDays,
    style: req.style,
    budgetTier: req.budgetTier,
    estimatedTotalBudget: baseCostPerDay * req.durationDays,
    currency: 'USD',
    highlights: [
      `Sunrise visit to ${req.destination}'s most renowned viewpoint`,
      `Curated culinary walking tour of authentic street markets`,
      `Scenic heritage walks through preserved historic districts`,
      `Relaxed evenings savoring local gastronomy and twilight vistas`
    ],
    localInsiderTips: [
      `Download offline maps and translation apps before departure.`,
      `Carry small denominations of local currency for street vendors and temple entries.`,
      `Early morning (before 8:30 AM) is the golden hour for photography without crowds.`,
      `Look for dining spots with menus in the local language and lively neighborhood patrons.`
    ],
    packingEssentials: [
      { item: 'Comfortable broken-in walking shoes', category: 'clothing' },
      { item: 'Universal travel power adapter', category: 'electronics' },
      { item: 'Light packable waterproof jacket', category: 'clothing' },
      { item: 'Compact daypack for daily excursions', category: 'essentials' },
      { item: 'Reusable water bottle with filter', category: 'essentials' },
      { item: 'Physical copy of passport and reservations', category: 'documents' }
    ],
    days
  };
}
